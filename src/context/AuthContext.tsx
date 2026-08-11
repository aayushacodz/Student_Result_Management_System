import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from "@/api";
import type { Admin } from "@/types";

interface AuthContextValue {
  user: Admin | null;
  token: string | null;
  ready: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const storedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
      const storedUser = window.localStorage.getItem(USER_STORAGE_KEY);
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser) as Admin);
      }
    } catch {
      /* ignore corrupted storage */
    }
    setReady(true);
  }, []);

  const login = useCallback(async (email: string, password: string, remember = true) => {
    const res = await api.auth.login(email, password);
    setToken(res.data.token);
    setUser(res.data.user);
    const store = remember ? window.localStorage : window.sessionStorage;
    store.setItem(TOKEN_STORAGE_KEY, res.data.token);
    store.setItem(USER_STORAGE_KEY, JSON.stringify(res.data.user));
    if (remember) {
      window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    } else {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, res.data.token);
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.data.user));
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } finally {
      setToken(null);
      setUser(null);
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      window.localStorage.removeItem(USER_STORAGE_KEY);
      window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      window.sessionStorage.removeItem(USER_STORAGE_KEY);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, ready, isAuthenticated: Boolean(token), login, logout }),
    [user, token, ready, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
