"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  DollarSign,
  Hotel,
  LoaderCircle,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Sparkles,
  Star,
  Trash2,
  WandSparkles,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import { ProtectedShell } from "@/components/protected-shell";
import { LoadingScreen } from "@/components/loading-screen";
import { api, ApiError } from "@/lib/api";
import type { Activity, Trip } from "@/lib/types";

type Tab = "itinerary" | "budget" | "hotels" | "pulse";

export default function TripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("itinerary");
  const [busy, setBusy] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState("");
  const [regenerateDay, setRegenerateDay] = useState<number | null>(null);
  const [preference, setPreference] = useState("");
  const [addDay, setAddDay] = useState<number | null>(null);

  useEffect(() => {
    api<{ trip: Trip }>(`/trips/${id}`)
      .then((data) => {
        setTrip(data.trip);
        setTitle(data.trip.title);
      })
      .catch(() => router.replace("/dashboard"))
      .finally(() => setLoading(false));
  }, [id, router]);

  async function removeActivity(day: number, activityId: string) {
    if (!trip) return;
    setBusy(`remove-${activityId}`);
    try {
      const data = await api<{ trip: Trip }>(`/trips/${trip.id}/days/${day}/activities/${activityId}`, { method: "DELETE" });
      setTrip(data.trip);
      toast.success("Activity removed.");
    } catch (caught) {
      toast.error(caught instanceof ApiError ? caught.message : "Could not remove activity.");
    } finally {
      setBusy("");
    }
  }

  async function saveTitle() {
    if (!trip || title.trim().length < 2) return;
    setBusy("title");
    try {
      const data = await api<{ trip: Trip }>(`/trips/${trip.id}`, { method: "PATCH", body: JSON.stringify({ title }) });
      setTrip(data.trip);
      setEditingTitle(false);
    } finally {
      setBusy("");
    }
  }

  async function runRegeneration(day: number) {
    if (!trip || preference.trim().length < 3) return;
    setBusy(`regen-${day}`);
    try {
      const data = await api<{ trip: Trip }>(`/trips/${trip.id}/days/${day}/regenerate`, {
        method: "POST",
        body: JSON.stringify({ preference })
      });
      setTrip(data.trip);
      setRegenerateDay(null);
      setPreference("");
      toast.success(`Day ${day} has a new rhythm.`);
    } catch (caught) {
      toast.error(caught instanceof ApiError ? caught.message : "Could not regenerate this day.");
    } finally {
      setBusy("");
    }
  }

  async function addActivity(day: number, activity: Omit<Activity, "id">) {
    if (!trip) return;
    setBusy(`add-${day}`);
    try {
      const data = await api<{ trip: Trip }>(`/trips/${trip.id}/activities`, {
        method: "POST",
        body: JSON.stringify({ day, activity })
      });
      setTrip(data.trip);
      setAddDay(null);
      toast.success("Activity added.");
    } finally {
      setBusy("");
    }
  }

  async function deleteTrip() {
    if (!trip || !window.confirm("Delete this journey? This cannot be undone.")) return;
    await api(`/trips/${trip.id}`, { method: "DELETE" });
    toast.success("Journey deleted.");
    router.push("/dashboard");
  }

  if (loading || !trip) return <ProtectedShell><LoadingScreen label="Opening your itinerary…" /></ProtectedShell>;
  const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: trip.budget.currency, maximumFractionDigits: 0 });

  return (
    <ProtectedShell>
      <main className="trip-page">
        <header className="trip-hero">
          <div className="trip-hero-orbit" />
          <div className="trip-hero-inner shell">
            <Link href="/dashboard" className="back-link back-link-light"><ArrowLeft size={16} /> My journeys</Link>
            <div className="trip-hero-copy">
              <span className="eyebrow light-eyebrow"><Sparkles size={13} /> Curated for {trip.interests.join(", ")}</span>
              {editingTitle ? (
                <div className="title-edit">
                  <input value={title} onChange={(event) => setTitle(event.target.value)} autoFocus />
                  <button className="button button-gold" onClick={saveTitle} disabled={busy === "title"}>Save</button>
                </div>
              ) : (
                <h1>{trip.title} <button onClick={() => setEditingTitle(true)} aria-label="Edit trip title"><Pencil size={17} /></button></h1>
              )}
              <p>{trip.itinerary[0]?.summary}</p>
              <div className="trip-hero-meta">
                <span><MapPin size={15} /> {trip.destination}</span>
                <span><CalendarDays size={15} /> {trip.days} days</span>
                <span><CircleDollarSign size={15} /> {trip.budgetType} budget</span>
                <span><WandSparkles size={15} /> {trip.aiMode === "openai" ? "AI composed" : "Smart local mode"}</span>
              </div>
            </div>
            <button className="trip-delete" onClick={deleteTrip}><Trash2 size={15} /> Delete</button>
          </div>
        </header>

        <div className="trip-tabs-wrap">
          <nav className="trip-tabs shell" aria-label="Trip details">
            {([
              ["itinerary", CalendarDays, "Itinerary"],
              ["budget", DollarSign, "Budget"],
              ["hotels", Hotel, "Stays"],
              ["pulse", Zap, "Trip Pulse"]
            ] as const).map(([value, Icon, label]) => (
              <button key={value} className={activeTab === value ? "active" : ""} onClick={() => setActiveTab(value)}>
                <Icon size={16} /> {label}
                {value === "pulse" && <span>{trip.pulse.score}</span>}
              </button>
            ))}
          </nav>
        </div>

        <section className="trip-content shell">
          {activeTab === "itinerary" && (
            <div className="itinerary-layout">
              <div className="itinerary-main">
                <div className="content-head">
                  <div><span className="eyebrow">Day by day</span><h2>Your journey, in rhythm</h2></div>
                  <span>{trip.days} beautifully paced days</span>
                </div>
                <div className="itinerary-days">
                  {trip.itinerary.map((day) => (
                    <article className="itinerary-day" key={day.day}>
                      <div className="day-rail">
                        <strong>{String(day.day).padStart(2, "0")}</strong>
                        <span />
                      </div>
                      <div className="day-content">
                        <header>
                          <div>
                            <span className="mini-label">{day.theme}</span>
                            <h3>{day.title}</h3>
                            <p>{day.summary}</p>
                          </div>
                          <button className="regenerate-link" onClick={() => setRegenerateDay(day.day)}>
                            <RefreshCw size={14} /> Rethink this day
                          </button>
                        </header>
                        <div className="activities">
                          {day.activities.map((activity) => (
                            <div className="activity-row" key={activity.id}>
                              <div className="activity-time">{activity.time}</div>
                              <div className="activity-marker"><span /></div>
                              <div className="activity-copy">
                                <div className="activity-topline">
                                  <span>{activity.category}</span>
                                  <button
                                    onClick={() => removeActivity(day.day, activity.id)}
                                    disabled={busy === `remove-${activity.id}`}
                                    aria-label={`Remove ${activity.title}`}
                                  >
                                    {busy === `remove-${activity.id}` ? <LoaderCircle className="spin" size={15} /> : <Trash2 size={14} />}
                                  </button>
                                </div>
                                <h4>{activity.title}</h4>
                                <p>{activity.description}</p>
                                <div className="activity-meta">
                                  <span><MapPin size={13} /> {activity.location}</span>
                                  <span><Clock3 size={13} /> {Math.round(activity.durationMinutes / 30) / 2} hr</span>
                                  <span><DollarSign size={13} /> {currency.format(activity.estimatedCost)}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <button className="add-activity-link" onClick={() => setAddDay(day.day)}><Plus size={15} /> Add an activity</button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
              <aside className="trip-aside">
                <div className="aside-card pulse-mini">
                  <div className="aside-card-top"><span><Zap size={15} /> Trip Pulse</span><strong>{trip.pulse.score}</strong></div>
                  <h3>{trip.pulse.label}</h3>
                  <p>{trip.pulse.recommendation}</p>
                  <button onClick={() => setActiveTab("pulse")}>See the energy forecast →</button>
                </div>
                <div className="aside-card budget-mini">
                  <span className="mini-label">Estimated total</span>
                  <strong>{currency.format(trip.budget.total)}</strong>
                  <p>For {trip.days} days · includes a 10% cushion</p>
                  <button onClick={() => setActiveTab("budget")}>View full budget →</button>
                </div>
                <div className="aside-note"><Sparkles size={16} /><p>Prices are thoughtful estimates, not live quotes. Confirm before booking.</p></div>
              </aside>
            </div>
          )}

          {activeTab === "budget" && <BudgetView trip={trip} currency={currency} />}
          {activeTab === "hotels" && <HotelsView trip={trip} currency={currency} />}
          {activeTab === "pulse" && <PulseView trip={trip} />}
        </section>

        {regenerateDay !== null && (
          <div className="modal-backdrop" onMouseDown={() => setRegenerateDay(null)}>
            <div className="modal" onMouseDown={(event) => event.stopPropagation()}>
              <span className="modal-icon"><RefreshCw size={20} /></span>
              <span className="eyebrow">Reimagine day {regenerateDay}</span>
              <h2>What should feel different?</h2>
              <p>Be as specific as you like. The rest of your journey will stay untouched.</p>
              <textarea value={preference} onChange={(event) => setPreference(event.target.value)} placeholder="More outdoor activities, a slower morning, fewer museums…" autoFocus />
              <div className="modal-actions">
                <button className="button button-outline" onClick={() => setRegenerateDay(null)}>Cancel</button>
                <button className="button button-forest" onClick={() => runRegeneration(regenerateDay)} disabled={busy === `regen-${regenerateDay}` || preference.trim().length < 3}>
                  {busy === `regen-${regenerateDay}` ? <LoaderCircle className="spin" size={17} /> : <WandSparkles size={17} />} Regenerate day
                </button>
              </div>
            </div>
          </div>
        )}

        {addDay !== null && <AddActivityModal day={addDay} onClose={() => setAddDay(null)} onAdd={addActivity} busy={busy === `add-${addDay}`} />}
      </main>
    </ProtectedShell>
  );
}

function BudgetView({ trip, currency }: { trip: Trip; currency: Intl.NumberFormat }) {
  const lines = [
    ["Flights", trip.budget.flights, "Round-trip estimate"],
    ["Accommodation", trip.budget.accommodation, `${trip.days} nights`],
    ["Food & drink", trip.budget.food, "Daily meals and treats"],
    ["Activities", trip.budget.activities, "Tickets and experiences"],
    ["Local transport", trip.budget.localTransport, "Transit and transfers"],
    ["Contingency", trip.budget.contingency, "A sensible 10% cushion"]
  ];
  return (
    <div className="detail-view">
      <div className="detail-view-head"><span className="eyebrow">Transparent by design</span><h2>The shape of your spend</h2><p>Planning estimates to help you make confident choices before you book.</p></div>
      <div className="budget-view-grid">
        <div className="budget-total-card">
          <span>Estimated journey total</span><strong>{currency.format(trip.budget.total)}</strong>
          <p>{trip.days} days in {trip.destination} · {trip.budgetType.toLowerCase()} travel style</p>
          <div className="budget-bar">
            {lines.slice(0, 5).map(([, value], index) => <span key={index} style={{ flex: Number(value) }} />)}
          </div>
        </div>
        <div className="budget-lines">
          {lines.map(([label, value, note], index) => (
            <div key={String(label)}>
              <span className={`budget-dot dot-${index}`} />
              <div><strong>{label}</strong><small>{note}</small></div>
              <b>{currency.format(Number(value))}</b>
            </div>
          ))}
          <div className="budget-grand"><span>Total estimate</span><strong>{currency.format(trip.budget.total)}</strong></div>
        </div>
      </div>
    </div>
  );
}

function HotelsView({ trip, currency }: { trip: Trip; currency: Intl.NumberFormat }) {
  return (
    <div className="detail-view">
      <div className="detail-view-head"><span className="eyebrow">A place to land</span><h2>Stays for every mood</h2><p>Three directions shaped around your destination and budget.</p></div>
      <div className="hotel-grid">
        {trip.hotels.map((hotel, index) => (
          <article className="hotel-card" key={hotel.id}>
            <div className={`hotel-visual hotel-visual-${index}`}>
              <span>{hotel.tier}</span><Hotel size={42} strokeWidth={1.1} />
            </div>
            <div className="hotel-body">
              <div className="hotel-rating"><Star size={13} fill="currentColor" /> {hotel.rating.toFixed(1)}</div>
              <span className="mini-label">{hotel.neighborhood}</span>
              <h3>{hotel.name}</h3>
              <p>{hotel.highlight}</p>
              <div className="hotel-price"><strong>{currency.format(hotel.nightlyEstimate)}</strong><span>/ night estimate</span></div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function PulseView({ trip }: { trip: Trip }) {
  return (
    <div className="detail-view">
      <div className="detail-view-head"><span className="eyebrow"><Zap size={13} /> A Wayfare original</span><h2>Your energy forecast</h2><p>How each day is likely to feel—not just where it takes you.</p></div>
      <div className="pulse-dashboard">
        <div className="pulse-score-card">
          <div className="pulse-large-ring" style={{ "--score": `${trip.pulse.score * 3.6}deg` } as React.CSSProperties}>
            <div><strong>{trip.pulse.score}</strong><span>TRIP PULSE</span></div>
          </div>
          <h3>{trip.pulse.label}</h3><p>{trip.pulse.recommendation}</p>
        </div>
        <div className="daily-energy">
          {trip.pulse.daily.map((day) => (
            <div className="energy-row" key={day.day}>
              <span className="energy-day">Day {day.day}</span>
              <div className="energy-track"><span style={{ width: `${day.energy}%` }} /></div>
              <strong>{day.energy}</strong>
              <span className={`pace-badge pace-${day.pace.toLowerCase()}`}>{day.pace}</span>
              <p>{day.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AddActivityModal({
  day,
  onClose,
  onAdd,
  busy
}: {
  day: number;
  onClose: () => void;
  onAdd: (day: number, activity: Omit<Activity, "id">) => Promise<void>;
  busy: boolean;
}) {
  const [activity, setActivity] = useState<Omit<Activity, "id">>({
    time: "10:00",
    title: "",
    description: "",
    location: "",
    durationMinutes: 90,
    estimatedCost: 0,
    category: "Custom"
  });
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form className="modal modal-wide" onSubmit={(event) => { event.preventDefault(); onAdd(day, activity); }} onMouseDown={(event) => event.stopPropagation()}>
        <span className="modal-icon"><Plus size={20} /></span>
        <span className="eyebrow">Add to day {day}</span>
        <h2>Make room for something new.</h2>
        <div className="modal-form-grid">
          <label><span>Time</span><input type="time" value={activity.time} onChange={(e) => setActivity({ ...activity, time: e.target.value })} required /></label>
          <label><span>Category</span><input value={activity.category} onChange={(e) => setActivity({ ...activity, category: e.target.value })} required /></label>
          <label className="full"><span>Activity</span><input value={activity.title} onChange={(e) => setActivity({ ...activity, title: e.target.value })} placeholder="Sunset sailing" required /></label>
          <label className="full"><span>Description</span><textarea value={activity.description} onChange={(e) => setActivity({ ...activity, description: e.target.value })} placeholder="A short note about the experience…" required /></label>
          <label className="full"><span>Location</span><input value={activity.location} onChange={(e) => setActivity({ ...activity, location: e.target.value })} placeholder="Marina district" required /></label>
          <label><span>Minutes</span><input type="number" min="15" value={activity.durationMinutes} onChange={(e) => setActivity({ ...activity, durationMinutes: Number(e.target.value) })} /></label>
          <label><span>Estimated cost</span><input type="number" min="0" value={activity.estimatedCost} onChange={(e) => setActivity({ ...activity, estimatedCost: Number(e.target.value) })} /></label>
        </div>
        <div className="modal-actions">
          <button type="button" className="button button-outline" onClick={onClose}>Cancel</button>
          <button className="button button-forest" disabled={busy}>{busy ? <LoaderCircle className="spin" size={17} /> : <Plus size={17} />} Add activity</button>
        </div>
      </form>
    </div>
  );
}
