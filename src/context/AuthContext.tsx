import React, { createContext, useContext, useState } from 'react';
import type { UserProfile, UserRoles } from '../types/domain';

// Usuarios de demostración con contexto industrial real
export const DEMO_USERS: Record<UserRoles, UserProfile> = {
  operator: {
    id: 'usr-op-01',
    name: 'Carlos Rivas',
    email: 'carlos.rivas@planta.com',
    roles: 'operator',
    badgeNumber: 'OP-402',
    assignedArea: 'Cuarto de Máquinas - Climatización',
    defaultShift: 'mañana',
  },
  supervisor: {
    id: 'usr-sup-01',
    name: 'Ing. Roberto Mendoza',
    email: 'roberto.mendoza@planta.com',
    roles: 'supervisor',
    badgeNumber: 'SUP-108',
    assignedArea: 'Jefatura de Operaciones y Mantenimiento',
  },
  admin: {
    id: 'usr-adm-01',
    name: 'Administrador de Planta',
    email: 'admin@planta.com',
    roles: 'admin',
    badgeNumber: 'ADM-001',
  },
};

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loginAsDemo: (role: UserRoles) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'plantalog_user_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    // Intentar recuperar sesión existente al cargar la página
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

  const loginAsDemo = (role: UserRoles) => {
    const selectedUser = DEMO_USERS[role];
    setUser(selectedUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedUser));
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
        loginAsDemo,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para consumir el contexto fácilmente
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};