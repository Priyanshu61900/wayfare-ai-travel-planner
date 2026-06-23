"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import type { User } from "@/lib/types";
import { useAuth } from "./auth-provider";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const register = mode === "register";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await api<{ user: User }>(`/auth/${register ? "register" : "login"}`, {
        method: "POST",
        body: JSON.stringify(register ? { name, email, password } : { email, password })
      });
      setUser(data.user);
      toast.success(register ? "Your journey starts here." : "Welcome back.");
      const next = searchParams.get("next");
      router.push(next?.startsWith("/") ? next : "/dashboard");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Unable to continue. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-form-wrap">
      <span className="eyebrow">{register ? "Begin your story" : "Welcome back"}</span>
      <h1>{register ? <>Create your<br /><em>traveler profile.</em></> : <>Return to your<br /><em>next adventure.</em></>}</h1>
      <p className="auth-intro">
        {register
          ? "A few details, then your first itinerary is only moments away."
          : "Sign in to revisit your saved journeys and keep planning."}
      </p>
      <form onSubmit={submit} className="auth-form">
        {register && (
          <label>
            <span>Your name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ava Explorer"
              autoComplete="name"
              required
              minLength={2}
            />
          </label>
        )}
        <label>
          <span>Email address</span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </label>
        <label>
          <span>Password</span>
          <div className="password-field">
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type={showPassword ? "text" : "password"}
              placeholder={register ? "8+ chars, upper, lower & number" : "Your password"}
              autoComplete={register ? "new-password" : "current-password"}
              required
              minLength={8}
            />
            <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label="Toggle password visibility">
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </label>
        {error && <div className="form-error" role="alert">{error}</div>}
        <button className="button button-forest auth-submit" disabled={loading}>
          {loading ? <LoaderCircle className="spin" size={18} /> : <>{register ? "Create my account" : "Sign in"} <ArrowRight size={17} /></>}
        </button>
      </form>
      <p className="auth-switch">
        {register ? "Already have a collection?" : "New to Wayfare?"}{" "}
        <Link href={register ? "/login" : "/register"}>{register ? "Sign in" : "Create an account"}</Link>
      </p>
    </div>
  );
}

