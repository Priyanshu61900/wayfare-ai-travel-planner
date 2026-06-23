"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, Compass, MapPin, Plus, Sparkles, Zap } from "lucide-react";
import { api } from "@/lib/api";
import type { Trip } from "@/lib/types";
import { ProtectedShell } from "@/components/protected-shell";
import { useAuth } from "@/components/auth-provider";

export default function DashboardPage() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ trips: Trip[] }>("/trips")
      .then((data) => setTrips(data.trips))
      .finally(() => setLoading(false));
  }, []);

  const firstName = user?.name.split(" ")[0] || "traveler";
  return (
    <ProtectedShell>
      <main className="dashboard shell">
        <section className="dashboard-head">
          <div>
            <span className="eyebrow"><Compass size={14} /> Your private travel desk</span>
            <h1>Where to next,<br /><em>{firstName}?</em></h1>
            <p>Your journeys live here—ready to revisit, refine, or turn into something new.</p>
          </div>
          <Link href="/trips/new" className="button button-forest button-large">
            <Plus size={18} /> Plan a new trip
          </Link>
        </section>

        <section className="dashboard-stats" aria-label="Journey summary">
          <div><span>Journeys planned</span><strong>{trips.length.toString().padStart(2, "0")}</strong></div>
          <div><span>Days of discovery</span><strong>{trips.reduce((sum, trip) => sum + trip.days, 0).toString().padStart(2, "0")}</strong></div>
          <div><span>Average Trip Pulse</span><strong>{trips.length ? Math.round(trips.reduce((sum, trip) => sum + trip.pulse.score, 0) / trips.length) : "—"}</strong></div>
        </section>

        <section className="journey-section">
          <div className="section-heading-row">
            <div><span className="eyebrow">Your collection</span><h2>Saved journeys</h2></div>
            {trips.length > 0 && <span>{trips.length} {trips.length === 1 ? "itinerary" : "itineraries"}</span>}
          </div>

          {loading ? (
            <div className="trip-grid">
              {[1, 2, 3].map((item) => <div className="trip-card trip-card-skeleton" key={item} />)}
            </div>
          ) : trips.length === 0 ? (
            <div className="empty-journeys">
              <div className="empty-orbit"><Sparkles size={28} /></div>
              <span className="eyebrow">A blank map is full of possibility</span>
              <h3>Your first journey<br />starts with a place.</h3>
              <p>Share a destination and a few preferences. Wayfare will take it from there.</p>
              <Link href="/trips/new" className="button button-gold">
                Create my first itinerary <ArrowRight size={17} />
              </Link>
            </div>
          ) : (
            <div className="trip-grid">
              {trips.map((trip, index) => (
                <Link href={`/trips/${trip.id}`} className="trip-card" key={trip.id}>
                  <div className={`trip-art trip-art-${index % 3}`}>
                    <div className="trip-art-top">
                      <span>{trip.budgetType} pace</span>
                      <span className="pulse-pill"><Zap size={12} /> {trip.pulse.score}</span>
                    </div>
                    <MapPin size={34} strokeWidth={1.2} />
                    <span className="trip-country">CURATED JOURNEY</span>
                  </div>
                  <div className="trip-card-body">
                    <span className="mini-label">{new Date(trip.updatedAt).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}</span>
                    <h3>{trip.title}</h3>
                    <p>{trip.itinerary[0]?.summary}</p>
                    <div className="trip-card-meta">
                      <span><CalendarDays size={14} /> {trip.days} days</span>
                      <span>{trip.interests.slice(0, 2).join(" · ")}</span>
                      <ArrowRight size={17} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </ProtectedShell>
  );
}

