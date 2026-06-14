import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

/**
 * Simple client-side auth context.
 *
 * No backend is wired up. The current user is persisted in localStorage so the
 * UI behaves as if someone is logged in. To connect this to Supabase (or any
 * other backend) later, replace the body of `login`, `logout`, and the initial
 * load effect below with real API calls. The shape of `AuthUser` and the
 * context value are what the rest of the app depends on — keep them stable.
 */

export type UserRole = "mentee" | "mentor" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
  updateAvatar: (avatar: string) => void;
}

const STORAGE_KEY = "guideme.auth.user";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw) as AuthUser);
    } catch {
      // ignore parse errors
    }
    setLoading(false);
  }, []);

  const persist = (next: AuthUser | null) => {
    setUser(next);
    try {
      if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore storage errors
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login: persist,
        logout: () => persist(null),
        updateAvatar: (avatar) => {
          if (!user) return;
          persist({ ...user, avatar });
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
