"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Bike,
  Building2,
  Camera,
  Check,
  Coffee,
  Compass,
  Gem,
  LoaderCircle,
  Mountain,
  Music,
  ShoppingBag,
  Sparkles,
  Utensils
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { ProtectedShell } from "@/components/protected-shell";
import { api, ApiError } from "@/lib/api";
import type { BudgetType, Trip, TripInput } from "@/lib/types";

const interests = [
  { name: "Food", icon: Utensils },
  { name: "Culture", icon: Building2 },
  { name: "Adventure", icon: Mountain },
  { name: "Shopping", icon: ShoppingBag },
  { name: "Nature", icon: Bike },
  { name: "Photography", icon: Camera },
  { name: "Nightlife", icon: Music },
  { name: "Slow travel", icon: Coffee }
];

const budgets: Array<{ value: BudgetType; icon: typeof Gem; title: string; description: string }> = [
  { value: "Low", icon: Compass, title: "Considered", description: "Local stays, smart choices, meaningful experiences." },
  { value: "Medium", icon: Sparkles, title: "Comfortable", description: "A balanced mix of value, comfort, and special moments." },
  { value: "High", icon: Gem, title: "Elevated", description: "Exceptional stays, private moments, fewer compromises." }
];

export default function NewTripPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<TripInput>({
    destination: "",
    days: 5,
    budgetType: "Medium",
    interests: [],
    notes: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggleInterest(name: string) {
    setForm((current) => ({
      ...current,
      interests: current.interests.includes(name)
        ? current.interests.filter((item) => item !== name)
        : current.interests.length < 8
          ? [...current.interests, name]
          : current.interests
    }));
  }

  async function generate() {
    setLoading(true);
    setError("");
    try {
      const data = await api<{ trip: Trip }>("/trips", {
        method: "POST",
        body: JSON.stringify(form)
      });
      toast.success("Your itinerary is ready.");
      router.push(`/trips/${data.trip.id}`);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "We could not create this trip.");
      setLoading(false);
    }
  }

  const canContinue = step === 1 ? form.destination.trim().length >= 2 : step === 2 ? form.interests.length > 0 : true;

  return (
    <ProtectedShell>
      <main className="builder-page">
        <div className="builder-shell">
          <div className="builder-top">
            <Link href="/dashboard" className="back-link"><ArrowLeft size={16} /> My journeys</Link>
            <div className="builder-progress">
              {[1, 2, 3].map((number) => (
                <div key={number} className={step >= number ? "complete" : ""}>
                  <span>{step > number ? <Check size={12} /> : number}</span>
                  <small>{number === 1 ? "The basics" : number === 2 ? "Your interests" : "Travel style"}</small>
                </div>
              ))}
            </div>
          </div>

          <section className="builder-card">
            {step === 1 && (
              <div className="builder-step">
                <span className="eyebrow">01 · The invitation</span>
                <h1>Where is your curiosity<br /><em>pulling you?</em></h1>
                <p>Begin with a place and the time you have. We&apos;ll find the rhythm.</p>
                <div className="destination-field">
                  <label htmlFor="destination">Destination</label>
                  <input
                    id="destination"
                    value={form.destination}
                    onChange={(event) => setForm({ ...form, destination: event.target.value })}
                    placeholder="Try Kyoto, Lisbon, Patagonia…"
                    autoFocus
                  />
                  <Compass size={22} />
                </div>
                <div className="days-control">
                  <div><span>Length of stay</span><p>Up to two weeks of discovery</p></div>
                  <div>
                    <button onClick={() => setForm({ ...form, days: Math.max(1, form.days - 1) })}>−</button>
                    <strong>{form.days}<small>days</small></strong>
                    <button onClick={() => setForm({ ...form, days: Math.min(14, form.days + 1) })}>+</button>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="builder-step">
                <span className="eyebrow">02 · What lights you up</span>
                <h1>What makes a place<br /><em>worth remembering?</em></h1>
                <p>Choose everything that sounds like your kind of day.</p>
                <div className="interest-grid">
                  {interests.map(({ name, icon: Icon }) => {
                    const selected = form.interests.includes(name);
                    return (
                      <button
                        key={name}
                        type="button"
                        className={selected ? "selected" : ""}
                        onClick={() => toggleInterest(name)}
                        aria-pressed={selected}
                      >
                        <Icon size={22} strokeWidth={1.6} />
                        <span>{name}</span>
                        {selected && <Check className="interest-check" size={14} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="builder-step">
                <span className="eyebrow">03 · The way you travel</span>
                <h1>Choose your level<br /><em>of indulgence.</em></h1>
                <p>This shapes stays, dining, activities, and the overall estimate.</p>
                <div className="budget-grid">
                  {budgets.map(({ value, icon: Icon, title, description }) => (
                    <button
                      key={value}
                      type="button"
                      className={form.budgetType === value ? "selected" : ""}
                      onClick={() => setForm({ ...form, budgetType: value })}
                    >
                      <Icon size={24} strokeWidth={1.5} />
                      <span className="mini-label">{value} budget</span>
                      <strong>{title}</strong>
                      <p>{description}</p>
                      <span className="radio-dot" />
                    </button>
                  ))}
                </div>
                <label className="notes-field">
                  <span>Anything else? <small>Optional</small></span>
                  <textarea
                    value={form.notes}
                    onChange={(event) => setForm({ ...form, notes: event.target.value })}
                    placeholder="A birthday dinner, accessibility needs, a slower first day…"
                    maxLength={500}
                  />
                </label>
              </div>
            )}

            {error && <div className="form-error builder-error">{error}</div>}
            <div className="builder-actions">
              <button
                className="button button-outline"
                onClick={() => step === 1 ? router.push("/dashboard") : setStep((current) => current - 1)}
                disabled={loading}
              >
                <ArrowLeft size={16} /> {step === 1 ? "Cancel" : "Back"}
              </button>
              {step < 3 ? (
                <button
                  className="button button-forest"
                  onClick={() => setStep((current) => current + 1)}
                  disabled={!canContinue}
                >
                  Continue <ArrowRight size={16} />
                </button>
              ) : (
                <button className="button button-gold generate-button" onClick={generate} disabled={loading}>
                  {loading ? <><LoaderCircle className="spin" size={18} /> Composing your journey…</> : <><Sparkles size={17} /> Create my itinerary</>}
                </button>
              )}
            </div>
          </section>
          <p className="builder-footnote">Your plans are private and visible only to your account.</p>
        </div>
      </main>
    </ProtectedShell>
  );
}

