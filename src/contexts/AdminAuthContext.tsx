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
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateLastLogin: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [adminData, setAdminData] = useState<AdminData | null>(null);
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
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setAdminData(null);
    }
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
    loading,
    signIn,
    signOut,
    updateLastLogin,
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
