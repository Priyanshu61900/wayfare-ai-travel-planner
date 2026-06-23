"use client";

import { useAuth } from "./auth-provider";
import { AppNav } from "./app-nav";
import { LoadingScreen } from "./loading-screen";

export function ProtectedShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading || !user) return <LoadingScreen label="Preparing your journeys…" />;
  return (
    <div className="app-surface">
      <AppNav />
      {children}
    </div>
  );
}

