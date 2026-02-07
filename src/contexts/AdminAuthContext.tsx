import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface AdminData {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
}

interface AdminAuthContextType {
  user: User | null;
  adminData: AdminData | null;
  permissions: string[];
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateLastLogin: () => Promise<void>;
  hasPermission: (key: string) => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchAdminData(session.user.id);
        } else {
          setAdminData(null);
          setPermissions([]);
        }
      })();
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchAdminData(session.user.id);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('id', userId)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      setAdminData(data);

      if (data) {
        const { data: perms } = await supabase
          .from('admin_permissions')
          .select('permission_key')
          .eq('admin_id', userId);
        setPermissions(perms?.map((p) => p.permission_key) || []);
      } else {
        setPermissions([]);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setAdminData(null);
      setPermissions([]);
    }
  };

  const hasPermission = (key: string): boolean => {
    if (!adminData) return false;
    if (adminData.role === 'super_admin') return true;
    return permissions.includes(key);
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      setUser(data.user);

      const adminResult = await supabase
        .from('admins')
        .select('*')
        .eq('id', data.user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (adminResult.error) {
        await supabase.auth.signOut();
        throw new Error('Unable to verify admin status. Please contact support.');
      }

      if (!adminResult.data) {
        await supabase.auth.signOut();
        throw new Error('Access denied. This account does not have admin privileges.');
      }

      setAdminData(adminResult.data);

      const { data: perms } = await supabase
        .from('admin_permissions')
        .select('permission_key')
        .eq('admin_id', data.user.id);
      setPermissions(perms?.map((p) => p.permission_key) || []);

      await supabase
        .from('admins')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', data.user.id);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setAdminData(null);
    setPermissions([]);
  };

  const updateLastLogin = async () => {
    if (!user) return;

    try {
      await supabase
        .from('admins')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', user.id);
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  };

  const value = {
    user,
    adminData,
    permissions,
    loading,
    signIn,
    signOut,
    updateLastLogin,
    hasPermission,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
