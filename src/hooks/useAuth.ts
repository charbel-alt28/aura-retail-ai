import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabaseAny = supabase as any;


export type UserRole = 'admin' | 'operator' | 'viewer';

export interface AuthUser {
  user: User;
  role: UserRole | null;
  displayName: string | null;
}

interface AuthState {
  authUser: AuthUser | null;
  session: Session | null;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    authUser: null,
    session: null,
    loading: true,
  });

  const fetchUserRole = useCallback(async (userId: string): Promise<UserRole | null> => {
    const { data } = await supabaseAny
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .order('role')
      .limit(1)
      .maybeSingle();
    return (data?.role as UserRole) ?? null;
  }, []);

  const fetchProfile = useCallback(async (userId: string): Promise<string | null> => {
    const { data } = await supabaseAny
      .from('profiles')
      .select('display_name')
      .eq('user_id', userId)
      .maybeSingle();
    return data?.display_name ?? null;
  }, []);

  const buildAuthUser = useCallback(async (user: User): Promise<AuthUser> => {
    const [role, displayName] = await Promise.all([
      fetchUserRole(user.id),
      fetchProfile(user.id),
    ]);
    return { user, role, displayName };
  }, [fetchUserRole, fetchProfile]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Use setTimeout to avoid Supabase deadlock during trigger
          setTimeout(async () => {
            const authUser = await buildAuthUser(session.user);
            setState({ authUser, session, loading: false });
          }, 0);
        } else {
          setState({ authUser: null, session: null, loading: false });
        }
      }
    );

    // Then get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        buildAuthUser(session.user).then(authUser => {
          setState({ authUser, session, loading: false });
        });
      } else {
        setState({ authUser: null, session: null, loading: false });
      }
    });

    return () => subscription.unsubscribe();
  }, [buildAuthUser]);

  const logAuditEvent = useCallback(async (
    eventType: string,
    details: Record<string, unknown> = {}
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabaseAny.from('auth_audit_logs').insert([{
      user_id: user.id,
      event_type: eventType,
      details,
      user_agent: navigator.userAgent,
    }]);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data.user) {
      await logAuditEvent('sign_in', { email });
    }
    return { data, error };
  }, [logAuditEvent]);

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    if (!error && data.user) {
      await logAuditEvent('sign_up', { email });
    }
    return { data, error };
  }, [logAuditEvent]);

  const signOut = useCallback(async () => {
    await logAuditEvent('sign_out');
    return supabase.auth.signOut();
  }, [logAuditEvent]);

  const resetPassword = useCallback(async (email: string) => {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    return supabase.auth.updateUser({ password: newPassword });
  }, []);

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    logAuditEvent,
    isAdmin: state.authUser?.role === 'admin',
    isOperator: state.authUser?.role === 'operator' || state.authUser?.role === 'admin',
    isViewer: state.authUser?.role === 'viewer',
  };
}
