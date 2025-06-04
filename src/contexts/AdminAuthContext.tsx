import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin';
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
  createAdmin: (email: string, password: string, name: string, role?: 'admin' | 'super_admin') => Promise<{ success: boolean; error?: string; adminId?: string }>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay una sesión de admin guardada
    const savedAdmin = localStorage.getItem('admin_session');
    if (savedAdmin) {
      try {
        setAdmin(JSON.parse(savedAdmin));
      } catch (error) {
        localStorage.removeItem('admin_session');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.rpc('authenticate_admin', {
        p_email: email,
        p_password: password
      });

      if (error) {
        return { success: false, error: 'Error de conexión' };
      }

      const result = data?.[0];
      
      if (result?.success) {
        const adminUser = {
          id: result.id,
          email: result.email,
          name: result.name,
          role: result.role
        };
        
        setAdmin(adminUser);
        localStorage.setItem('admin_session', JSON.stringify(adminUser));
        return { success: true };
      } else {
        return { success: false, error: 'Credenciales incorrectas' };
      }
    } catch (error) {
      return { success: false, error: 'Error inesperado' };
    }
  };

  const createAdmin = async (email: string, password: string, name: string, role: 'admin' | 'super_admin' = 'admin') => {
    if (!admin) {
      return { success: false, error: 'No tienes sesión activa' };
    }

    try {
      const { data, error } = await supabase.rpc('create_admin', {
        p_email: email,
        p_password: password,
        p_name: name,
        p_created_by_email: admin.email,
        p_role: role
      });

      if (error) {
        return { success: false, error: 'Error de conexión' };
      }

      const result = data?.[0];
      
      if (result?.success) {
        return { success: true, adminId: result.admin_id };
      } else {
        return { success: false, error: result?.message || 'Error al crear administrador' };
      }
    } catch (error) {
      return { success: false, error: 'Error inesperado' };
    }
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem('admin_session');
    // Redirigir a la página principal
    window.location.href = '/';
  };

  return (
    <AdminAuthContext.Provider value={{ admin, login, logout, isLoading, createAdmin }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
