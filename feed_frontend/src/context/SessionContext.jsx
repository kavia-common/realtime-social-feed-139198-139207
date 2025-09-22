import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const SessionCtx = createContext({ session: null, loading: true });

// PUBLIC_INTERFACE
export function SessionProvider({ children }) {
  /** Provides Supabase auth session and user to the component tree */
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <SessionCtx.Provider value={{ session, user: session?.user ?? null, loading }}>
      {children}
    </SessionCtx.Provider>
  );
}

// PUBLIC_INTERFACE
export function useSession() {
  /** Access Supabase auth session and user */
  return useContext(SessionCtx);
}
