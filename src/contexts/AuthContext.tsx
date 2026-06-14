import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

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
  logout: () => Promise<void>;
  updateAvatar: (avatar: string) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function userFromSession(session: Session | null): AuthUser | null {
  if (!session?.user) return null;
  const meta = (session.user.user_metadata ?? {}) as Record<string, unknown>;
  return {
    id: session.user.id,
    email: session.user.email ?? "",
    name:
      (meta.full_name as string) ||
      (meta.name as string) ||
      session.user.email?.split("@")[0] ||
      "User",
    role: ((meta.role as UserRole) ?? "mentee") as UserRole,
    avatar: (meta.avatar_url as string) || (meta.avatar as string) || undefined,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listener first so we don't miss events that fire between mount and getSession resolving.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(userFromSession(session));
    });
    supabase.auth.getSession().then(({ data }) => {
      setUser(userFromSession(data.session));
      setLoading(false);
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login: setUser,
        logout: async () => {
          await supabase.auth.signOut();
          setUser(null);
        },
        updateAvatar: (avatar) => setUser((u) => (u ? { ...u, avatar } : u)),
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
