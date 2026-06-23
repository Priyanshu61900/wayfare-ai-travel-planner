"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const signingOut = useRef(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let active = true;
    api<{ user: User }>("/auth/me")
      .then((data) => active && setUser(data.user))
      .catch(() => active && setUser(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (
      !loading &&
      !user &&
      !signingOut.current &&
      (pathname.startsWith("/dashboard") || pathname.startsWith("/trips"))
    ) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, user, pathname, router]);

  const value = useMemo(
    () => ({
      user,
      loading,
      setUser,
      logout: async () => {
        signingOut.current = true;
        await api("/auth/logout", { method: "POST" });
        setUser(null);
        router.replace("/");
        router.refresh();
      }
    }),
    [user, loading, router]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
