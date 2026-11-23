import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api } from '../lib/api';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<void>;
  logout: () => void;
}
const AuthContext = createContext<AuthState | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() =>
    Boolean(localStorage.getItem('accessToken')),
  );
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return;
    }
    api<{ user: User }>('/profile')
      .then((r) => setUser(r.user))
      .catch(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      })
      .finally(() => setLoading(false));
  }, []);
  const value = useMemo(
    () => ({
      user,
      loading,
      login: async (email: string, password: string) => {
        const r = await api<{
          tokens: { accessToken: string; refreshToken: string };
          user: User;
        }>('/auth/login', {
          method: 'POST',
          auth: false,
          body: JSON.stringify({ email, password }),
        });
        localStorage.setItem('accessToken', r.tokens.accessToken);
        localStorage.setItem('refreshToken', r.tokens.refreshToken);
        setUser(r.user);
        return r.user;
      },
      signup: async (email: string, password: string, displayName: string) => {
        await api('/auth/signup', {
          method: 'POST',
          auth: false,
          body: JSON.stringify({ email, password, displayName }),
        });
      },
      logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
      },
    }),
    [user, loading],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const v = useContext(AuthContext);
  if (!v) throw new Error('useAuth requires AuthProvider');
  return v;
}
