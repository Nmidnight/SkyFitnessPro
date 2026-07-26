'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  ApiRequestError,
  getStoredToken,
  removeStoredToken,
  setStoredToken,
} from '@/services/apiClient';
import { loginUser, registerUser } from '@/services/coursesService';
import { getCurrentUser } from '@/services/userService';
import type { LoginPayload, RegisterPayload, User } from '@/types';

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginPayload) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const USER_STORAGE_KEY = 'skyfitness_user';

function loadCachedUser(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

function saveCachedUser(user: User | null): void {
  if (typeof window === 'undefined') return;
  if (!user) {
    localStorage.removeItem(USER_STORAGE_KEY);
    return;
  }
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      saveCachedUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const userData = await getCurrentUser();
      setUser(userData);
      saveCachedUser(userData);
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 401) {
        removeStoredToken();
        setUser(null);
        saveCachedUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const token = getStoredToken();
      if (!token) {
        if (!cancelled) setIsLoading(false);
        return;
      }

      const cached = loadCachedUser();
      if (cached && !cancelled) {
        setUser(cached);
      }
      await refreshUser();
    };

    void init();
    return () => {
      cancelled = true;
    };
  }, [refreshUser]);

  const login = useCallback(
    async (data: LoginPayload) => {
      const { token } = await loginUser(data);
      setStoredToken(token);
      await refreshUser();
    },
    [refreshUser],
  );

  const register = useCallback(
    async (data: RegisterPayload) => {
      await registerUser(data);
      await login({ email: data.email, password: data.password });
    },
    [login],
  );

  const logout = useCallback(() => {
    removeStoredToken();
    saveCachedUser(null);
    setUser(null);
    window.location.href = '/';
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
