import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Shift, UserProfile, UserRoles } from '../types/domain';

export interface Company {
  id: string;
  name: string;
}

export interface SignUpInput {
  name: string;
  email: string;
  badgeNumber: string;
  password: string;
  /** uuid de una empresa existente */
  companyId?: string;
  /** nombre de una empresa nueva (el primer usuario queda como admin) */
  newCompanyName?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  companies: Company[];
  signIn: (email: string, password: string, companyId: string) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<{ needsConfirmation: boolean }>;
  logout: () => Promise<void>;
}

interface ProfileRow {
  id: string;
  full_name: string;
  email: string;
  badge_number: string | null;
  role: UserRoles;
  assigned_area: string | null;
  default_shift: Shift | null;
  is_active: boolean;
  company_id: string;
  companies: { name: string } | { name: string }[] | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(
      'id, full_name, email, badge_number, role, assigned_area, default_shift, is_active, company_id, companies(name)'
    )
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) return null;
  const row = data as unknown as ProfileRow;
  if (!row.is_active) return null;

  const company = Array.isArray(row.companies) ? row.companies[0] : row.companies;

  return {
    id: row.id,
    name: row.full_name,
    email: row.email,
    roles: row.role,
    badgeNumber: row.badge_number ?? undefined,
    assignedArea: row.assigned_area ?? undefined,
    defaultShift: row.default_shift ?? undefined,
    companyId: row.company_id,
    companyName: company?.name,
  };
}

function translateAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Correo o contraseña incorrectos.';
  if (m.includes('email not confirmed')) return 'Debes confirmar tu correo antes de entrar.';
  if (m.includes('already registered') || m.includes('already been registered'))
    return 'Ese correo ya está registrado.';
  if (m.includes('password should be at least'))
    return 'La contraseña debe tener al menos 6 caracteres.';
  if (m.includes('database error saving new user'))
    return 'No se pudo crear el perfil. Revisa que el nombre de empresa no exista ya y que el schema.sql esté ejecutado.';
  if (m.includes('rate limit')) return 'Demasiados intentos. Espera un momento.';
  return message;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const signingInRef = useRef(false);

  // Empresas para el select del login / registro
  useEffect(() => {
    supabase
      .from('companies')
      .select('id, name')
      .order('name')
      .then(({ data }) => {
        if (data) setCompanies(data as Company[]);
      });
  }, []);

  // Restaurar sesión y escuchar cambios
  useEffect(() => {
    let active = true;

    const applySession = async (session: Session | null) => {
      if (!session) {
        if (active) setUser(null);
        return;
      }
      const profile = await fetchProfile(session.user.id);
      if (active) setUser(profile);
    };

    supabase.auth.getSession().then(async ({ data }) => {
      await applySession(data.session);
      if (active) setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (signingInRef.current && event === 'SIGNED_IN') return;
      // Se difiere para no bloquear el cliente de Supabase dentro del callback
      setTimeout(() => {
        void applySession(session);
      }, 0);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string, companyId: string) => {
    signingInRef.current = true;
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw new Error(translateAuthError(error.message));

      const profile = await fetchProfile(data.user.id);
      if (!profile) {
        await supabase.auth.signOut();
        throw new Error('Tu cuenta no tiene perfil activo. Contacta al administrador.');
      }
      if (profile.companyId !== companyId) {
        await supabase.auth.signOut();
        throw new Error('Tu usuario no pertenece a la compañía seleccionada.');
      }
      setUser(profile);
    } finally {
      signingInRef.current = false;
    }
  };

  const signUp = async (input: SignUpInput) => {
    const { data, error } = await supabase.auth.signUp({
      email: input.email.trim(),
      password: input.password,
      options: {
        data: {
          full_name: input.name.trim(),
          badge_number: input.badgeNumber.trim() || null,
          company_id: input.newCompanyName ? null : input.companyId,
          company_name: input.newCompanyName?.trim() || null,
        },
      },
    });
    if (error) throw new Error(translateAuthError(error.message));

    // Con "Confirm email" activo no hay sesión hasta confirmar el correo
    if (!data.session) return { needsConfirmation: true };

    // Si creó empresa nueva, refresca el listado
    const { data: list } = await supabase.from('companies').select('id, name').order('name');
    if (list) setCompanies(list as Company[]);
    return { needsConfirmation: false };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        companies,
        signIn,
        signUp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
