"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useSyncExternalStore } from "react";

interface AuthContextType {
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  login: async () => false,
  logout: () => {},
  isAuthenticated: false,
  isLoading: true,
});

// Simple external store for token persistence
const tokenStore = {
  listeners: new Set<() => void>(),
  _token: null as string | null,

  subscribe(listener: () => void) {
    tokenStore.listeners.add(listener);
    return () => tokenStore.listeners.delete(listener);
  },

  getSnapshot() {
    return tokenStore._token;
  },

  getServerSnapshot() {
    return null;
  },

  setToken(token: string | null) {
    tokenStore._token = token;
    if (token) {
      localStorage.setItem("admin_token", token);
    } else {
      localStorage.removeItem("admin_token");
    }
    tokenStore.listeners.forEach((l) => l());
  },

  hydrate() {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("admin_token");
      if (stored) {
        tokenStore._token = stored;
      }
    }
  },
};

// Hydrate on module load
if (typeof window !== "undefined") {
  tokenStore.hydrate();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const token = useSyncExternalStore(
    tokenStore.subscribe,
    tokenStore.getSnapshot,
    tokenStore.getServerSnapshot
  );

  const [isLoading, setIsLoading] = useState(() => {
    // On first render, we need to mark as not loading since useSyncExternalStore already hydrated
    return false;
  });

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        tokenStore.setToken(data.token);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    tokenStore.setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated: !!token, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
