import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authApi } from '../api/auth';
import { AUTH_EXPIRED_EVENT, tokenStore } from '../api/client';
import type { AuthResponse, User } from '../types';

const USER_KEY = 'apex.user';

interface AuthContextValue {
  user: User | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Restores the previous session, if both the token and the user profile were saved. */
function loadStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw && tokenStore.get() ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadStoredUser);

  const startSession = useCallback(({ token, user }: AuthResponse) => {
    tokenStore.set(token);
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      /* session still works for this tab */
    }
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    try {
      localStorage.removeItem(USER_KEY);
    } catch {
      /* ignore */
    }
    setUser(null);
  }, []);

  // The API client fires this when the server rejects our token (e.g. it expired).
  useEffect(() => {
    window.addEventListener(AUTH_EXPIRED_EVENT, logout);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, logout);
  }, [logout]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAdmin: user?.role === 'ADMIN',
      login: async (email, password) => startSession(await authApi.login(email, password)),
      register: async (name, email, password) => startSession(await authApi.register(name, email, password)),
      logout,
    }),
    [user, startSession, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
