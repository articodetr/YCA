import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface Member {
  id: string;
  member_number: string;
  membership_type: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  start_date: string;
  expiry_date: string | null;
  auto_renewal: boolean;
}

interface PendingApplication {
  id: string;
  membership_type: string;
  payment_status: string;
  custom_amount: number | null;
}

interface MemberAuthContextType {
  user: User | null;
  session: Session | null;
  member: Member | null;
  loading: boolean;
  isPaidMember: boolean;
  needsOnboarding: boolean;
  pendingApplication: PendingApplication | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ data: { user: User | null } | null; error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  refreshMember: () => Promise<void>;
}

const MemberAuthContext = createContext<MemberAuthContextType | undefined>(undefined);

function recordLoginActivity(userId: string, method: string, status: 'success' | 'failed') {
  supabase.from('login_history').insert({
    user_id: userId,
    user_agent: navigator.userAgent,
    login_method: method,
    status,
  }).then(() => {});
}

export function MemberAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPaidMember, setIsPaidMember] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [pendingApplication, setPendingApplication] = useState<PendingApplication | null>(null);

  const fetchMemberData = async (userId: string, userEmail?: string) => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        setMember(data);
        setIsPaidMember(true);
        setNeedsOnboarding(false);
        setPendingApplication(null);
        return;
      }

      setMember(null);
      setIsPaidMember(false);

      if (userEmail) {
        const { data: appData } = await supabase
          .from('membership_applications')
          .select('id, membership_type, payment_status, custom_amount')
          .eq('email', userEmail)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (appData) {
          setPendingApplication(appData);
          setNeedsOnboarding(false);
        } else {
          setPendingApplication(null);
          setNeedsOnboarding(true);
        }
      } else {
        setPendingApplication(null);
        setNeedsOnboarding(true);
      }
    } catch (error) {
      console.error('Error fetching member data:', error);
      setMember(null);
      setIsPaidMember(false);
    }
  };

  const refreshMember = async () => {
    if (user?.id) {
      await fetchMemberData(user.id, user.email || undefined);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchMemberData(session.user.id, session.user.email || undefined).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      (() => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          fetchMemberData(session.user.id, session.user.email || undefined);
        } else {
          setMember(null);
          setIsPaidMember(false);
          setNeedsOnboarding(false);
          setPendingApplication(null);
        }

        setLoading(false);

        if (event === 'SIGNED_IN' && session?.user) {
          const provider = session.user.app_metadata?.provider;
          const method = provider === 'google' ? 'google' : 'email';
          recordLoginActivity(session.user.id, method, 'success');
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/member/dashboard`,
        },
      });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/member/login`,
        }
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  return (
    <MemberAuthContext.Provider value={{ user, session, member, loading, isPaidMember, needsOnboarding, pendingApplication, signIn, signInWithGoogle, signUp, signOut, resetPassword, refreshMember }}>
      {children}
    </MemberAuthContext.Provider>
  );
}

export function useMemberAuth() {
  const context = useContext(MemberAuthContext);
  if (context === undefined) {
    throw new Error('useMemberAuth must be used within a MemberAuthProvider');
  }
  return context;
}
