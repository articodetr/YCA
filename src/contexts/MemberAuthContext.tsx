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
      const { data: memberById } = await supabase
        .from('members')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (memberById) {
        setMember(memberById);
        setIsPaidMember(true);
        setNeedsOnboarding(false);
        setPendingApplication(null);
        return;
      }

      let memberByEmail = null;
      if (userEmail) {
        const { data } = await supabase
          .from('members')
          .select('*')
          .eq('email', userEmail)
          .maybeSingle();
        memberByEmail = data;
      }

      if (memberByEmail) {
        setMember(memberByEmail);
        setIsPaidMember(true);
        setNeedsOnboarding(false);
        setPendingApplication(null);
        return;
      }

      setMember(null);
      setIsPaidMember(false);

      {
        const { data: appByUserId } = await supabase
          .from('membership_applications')
          .select('id, membership_type, payment_status, custom_amount')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        let appData = appByUserId;

        if (!appData && userEmail) {
          const { data: appByEmail } = await supabase
            .from('membership_applications')
            .select('id, membership_type, payment_status, custom_amount')
            .eq('email', userEmail)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          appData = appByEmail;
        }

        if (appData) {
          const isPaid = appData.payment_status === 'paid' || appData.payment_status === 'completed';
          if (isPaid) {
            try {
              const activateResponse = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/activate-membership`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                  },
                  body: JSON.stringify({
                    application_id: appData.id,
                    user_id: userId,
                  }),
                }
              );

              const activateData = await activateResponse.json();
              if (activateResponse.ok && activateData.success) {
                const now = new Date();
                const endOfYear = `${now.getFullYear()}-12-31`;
                await supabase
                  .from('members')
                  .update({ start_date: now.toISOString().split('T')[0], expiry_date: endOfYear })
                  .eq('id', userId);
                setMember({ ...activateData.member, start_date: now.toISOString().split('T')[0], expiry_date: endOfYear });
                setIsPaidMember(true);
                setNeedsOnboarding(false);
                setPendingApplication(null);
                return;
              }
            } catch (activateErr) {
              console.error('Failed to auto-activate membership:', activateErr);
            }

            setIsPaidMember(true);
            setNeedsOnboarding(false);
            setPendingApplication(appData);
            return;
          }

          setPendingApplication(appData);
          setNeedsOnboarding(false);
        } else {
          setPendingApplication(null);
          setNeedsOnboarding(true);
        }
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
    let initialSessionHandled = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      (() => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          if (initialSessionHandled) {
            setLoading(true);
          }
          fetchMemberData(session.user.id, session.user.email || undefined).finally(() => {
            if (!initialSessionHandled) {
              initialSessionHandled = true;
            }
            setLoading(false);
          });
        } else {
          setMember(null);
          setIsPaidMember(false);
          setNeedsOnboarding(false);
          setPendingApplication(null);
          if (!initialSessionHandled) {
            initialSessionHandled = true;
          }
          setLoading(false);
        }

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
          redirectTo: `${window.location.origin}/auth/callback`,
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
