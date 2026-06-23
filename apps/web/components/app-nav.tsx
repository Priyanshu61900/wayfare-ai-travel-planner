"use client";

import Link from "next/link";
import { LogOut, Plus, UserRound } from "lucide-react";
import { Logo } from "./logo";
import { useAuth } from "./auth-provider";

export function AppNav() {
  const { user, logout } = useAuth();
  return (
    <header className="app-nav">
      <div className="app-nav-inner">
        <Logo />
        <nav>
          <Link href="/dashboard">My journeys</Link>
          <Link href="/trips/new" className="nav-new"><Plus size={16} /> New trip</Link>
        </nav>
        <div className="user-cluster">
          <span className="user-avatar"><UserRound size={16} /></span>
          <div className="user-copy">
            <strong>{user?.name || "Traveler"}</strong>
            <span>{user?.email}</span>
          </div>
          <button className="icon-button" onClick={logout} aria-label="Sign out" title="Sign out">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}

