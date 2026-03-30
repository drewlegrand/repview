import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  mfaRequired: boolean;
  mfaFactorId: string | null;
  mfaEnrollRequired: boolean;
  aal: { currentLevel: string; nextLevel: string } | null;
  completeMFA: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  mfaRequired: false,
  mfaFactorId: null,
  mfaEnrollRequired: false,
  aal: null,
  completeMFA: () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const [mfaEnrollRequired, setMfaEnrollRequired] = useState(false);
  const [aal, setAal] = useState<{ currentLevel: string; nextLevel: string } | null>(null);

  const checkMFAStatus = async () => {
    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (error) return;
    
    setAal({ currentLevel: data.currentLevel, nextLevel: data.nextLevel });
    
    if (data.nextLevel === 'aal2' && data.currentLevel === 'aal1') {
      // User has MFA enrolled but hasn't verified this session
      const { data: factorsData } = await supabase.auth.mfa.listFactors();
      const totp = factorsData?.totp?.find(f => f.status === 'verified');
      if (totp) {
        setMfaFactorId(totp.id);
        setMfaRequired(true);
        setMfaEnrollRequired(false);
      }
    } else if (data.currentLevel === 'aal1' && data.nextLevel === 'aal1') {
      // User has no MFA enrolled — enforce enrollment (bypass for test account)
      const { data: { user } } = await supabase.auth.getUser();
      const isTestAccount = user?.email === 'test@repview.demo';
      if (!isTestAccount) {
        const { data: factorsData } = await supabase.auth.mfa.listFactors();
        const hasVerifiedTotp = factorsData?.totp?.some(f => f.status === 'verified');
        if (!hasVerifiedTotp) {
          setMfaEnrollRequired(true);
          setMfaRequired(false);
        }
      } else {
        setMfaRequired(false);
        setMfaEnrollRequired(false);
      }
    } else {
      setMfaRequired(false);
      setMfaEnrollRequired(false);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        if (session?.user) {
          // Defer MFA check to avoid Supabase client deadlock
          setTimeout(() => checkMFAStatus(), 0);
        } else {
          setMfaRequired(false);
          setMfaEnrollRequired(false);
          setMfaFactorId(null);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        setTimeout(() => checkMFAStatus(), 0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const completeMFA = () => {
    setMfaRequired(false);
    setMfaEnrollRequired(false);
    setMfaFactorId(null);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setMfaRequired(false);
    setMfaEnrollRequired(false);
    setMfaFactorId(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, mfaRequired, mfaFactorId, mfaEnrollRequired, aal, completeMFA, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
