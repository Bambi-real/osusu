import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        loadProfile();
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        if (session) {
          loadProfile();
        }
      }

      if (event === 'TOKEN_REFRESHED') {
        // Supabase silently renewed the token — no action needed
      }

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
        const publicPaths = [
          '/', '/login', '/register',
          '/forgot-password', '/reset-password'
        ];
        if (!publicPaths.includes(window.location.pathname)) {
          window.location.href = '/login?reason=signed_out';
        }
      }

      if (event === 'PASSWORD_RECOVERY') {
        if (window.location.pathname !== '/reset-password') {
          window.location.href = '/reset-password';
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  function setLoggedInUser(userData) {
    setUser(userData);
    setLoading(false);
  }

  async function logout() {
    setUser(null);
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      setLoggedInUser,
      logout,
      refreshUser: loadProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
