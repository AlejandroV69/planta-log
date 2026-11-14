import React, { createContext, useContext, useState } from 'react';
import type { UserProfile, UserRoles } from '../types/domain';

export const COMPANIES = [
  { id: 'planta-central', name: 'Planta Central — Sede Corporativa' },
  { id: 'polar-ind', name: 'Empresas Polar — Planta Refrigeración' },
  { id: 'femsa-util', name: 'Coca-Cola FEMSA — Servicios Industriales' },
  { id: 'nestle-term', name: 'Nestlé — Complejo Térmico Norte' },
];

export const DEMO_USERS: Record<UserRoles, UserProfile> = {
  operator: {
    id: 'usr-op-01',
    name: 'Carlos Rivas',
    email: 'carlos.rivas@planta.com',
    roles: 'operator',
    badgeNumber: 'OP-7492',
    assignedArea: 'Cuarto de Máquinas - Climatización',
    defaultShift: 'mañana',
    companyId: 'planta-central',
    companyName: 'Planta Central — Sede Corporativa',
  },
  supervisor: {
    id: 'usr-sup-01',
    name: 'Ing. Roberto Mendoza',
    email: 'roberto.mendoza@planta.com',
    roles: 'supervisor',
    badgeNumber: 'SUP-108',
    assignedArea: 'Jefatura de Operaciones y Mantenimiento',
    companyId: 'planta-central',
    companyName: 'Planta Central — Sede Corporativa',
  },
  admin: {
    id: 'usr-adm-01',
    name: 'Administrador de Planta',
    email: 'admin@planta.com',
    roles: 'admin',
    badgeNumber: 'ADM-001',
    companyId: 'planta-central',
    companyName: 'Planta Central — Sede Corporativa',
  },
};

export interface RegisterUserInput {
  name: string;
  email: string;
  badgeNumber: string;
  companyId: string;
  companyName: string;
  roles: UserRoles;
  pin: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  registeredUsers: UserProfile[];
  loginAsDemo: (role: UserRoles, companyId?: string) => void;
  loginWithCredentials: (identifier: string, pin: string, companyId: string) => void;
  registerUser: (input: RegisterUserInput) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'plantalog_user_session';
const USERS_STORAGE_KEY = 'plantalog_registered_users_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(USERS_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {
        // Fallback a usuarios demo
      }
    }
    return Object.values(DEMO_USERS);
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const loginAsDemo = (role: UserRoles, companyId?: string) => {
    const comp = COMPANIES.find((c) => c.id === companyId) || COMPANIES[0];
    const selectedUser: UserProfile = {
      ...DEMO_USERS[role],
      companyId: comp.id,
      companyName: comp.name,
    };
    setUser(selectedUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedUser));
  };

  const loginWithCredentials = (identifier: string, _pin: string, companyId: string) => {
    const cleanId = identifier.trim().toLowerCase();
    const comp = COMPANIES.find((c) => c.id === companyId) || COMPANIES[0];

    const matchedUser = registeredUsers.find(
      (u) =>
        (u.badgeNumber || '').toLowerCase() === cleanId ||
        (u.email || '').toLowerCase() === cleanId ||
        (u.name || '').toLowerCase() === cleanId
    );

    if (matchedUser) {
      const activeUser: UserProfile = {
        ...matchedUser,
        companyId: matchedUser.companyId || comp.id,
        companyName: matchedUser.companyName || comp.name,
      };
      setUser(activeUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(activeUser));
      return;
    }

    // Si ingresa cualquier usuario en modo demo, entra con ese ID y la empresa seleccionada
    const fallbackUser: UserProfile = {
      ...DEMO_USERS.operator,
      badgeNumber: identifier.trim() || 'OP-7492',
      companyId: comp.id,
      companyName: comp.name,
    };
    setUser(fallbackUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackUser));
  };

  const registerUser = (input: RegisterUserInput) => {
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name: input.name.trim(),
      email: input.email.trim(),
      badgeNumber: input.badgeNumber.trim() || `OP-${Math.floor(1000 + Math.random() * 9000)}`,
      roles: input.roles,
      companyId: input.companyId,
      companyName: input.companyName,
      pin: input.pin,
      defaultShift: 'mañana',
    };

    setRegisteredUsers((prev) => {
      const updated = [newUser, ...prev];
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    setUser(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        registeredUsers,
        loginAsDemo,
        loginWithCredentials,
        registerUser,
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
