import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CircleDollarSign,
  Hotel,
  Map,
  PencilLine,
  ShieldCheck,
  Sparkles,
  WandSparkles,
  Zap
} from "lucide-react";
import { Logo } from "@/components/logo";

const features = [
  {
    icon: WandSparkles,
    eyebrow: "AI itinerary",
    title: "A journey with a point of view",
    body: "Not a list of links. A coherent, day-by-day story shaped around what you actually love."
  },
  {
    icon: PencilLine,
    eyebrow: "Always editable",
    title: "Your plan, never a black box",
    body: "Remove a stop, add an idea, or ask Wayfare to rethink a single day without losing the whole trip."
  },
  {
    icon: CircleDollarSign,
    eyebrow: "Budget clarity",
    title: "Know the shape of the spend",
    body: "See practical estimates for stays, meals, transport, activities, flights, and a sensible buffer."
  }
];

export default function Home() {
  return (
    <main className="landing">
      <section className="hero">
        <Image
          src="/images/wayfare-hero.png"
          alt=""
          fill
          priority
          className="hero-image"
          sizes="100vw"
        />
        <div className="hero-overlay" />
        <nav className="landing-nav shell">
          <Logo light />
          <div className="landing-nav-links">
            <a href="#how-it-works">How it works</a>
            <a href="#pulse">Trip Pulse</a>
          </div>
          <div className="landing-nav-actions">
            <Link href="/login" className="text-link light-link">Sign in</Link>
            <Link href="/register" className="button button-cream">Plan a trip</Link>
          </div>
        </nav>

        <div className="hero-content shell">
          <div className="hero-copy reveal">
            <span className="eyebrow light-eyebrow">
              <Sparkles size={14} /> Your next chapter, beautifully arranged
            </span>
            <h1>Travel plans that feel <em>like you.</em></h1>
            <p>
              Tell us where you&apos;re going and what moves you. Wayfare turns it into a
              thoughtful itinerary—balanced, editable, and ready in moments.
            </p>
            <div className="hero-actions">
              <Link href="/register" className="button button-gold button-large">
                Create my itinerary <ArrowRight size={18} />
              </Link>
              <span className="hero-note">Free to explore · No card required</span>
            </div>
          </div>

          <div className="hero-proof reveal reveal-delay">
            <div className="proof-stack">
              <span className="proof-avatar">AK</span>
              <span className="proof-avatar">JM</span>
              <span className="proof-avatar">SL</span>
            </div>
            <div>
              <div className="proof-stars">★★★★★</div>
              <span>Trips made personal, not generic</span>
            </div>
          </div>
        </div>
        <div className="hero-scroll">SCROLL TO WANDER <span /></div>
      </section>

      <section className="manifesto section shell">
        <div className="manifesto-label">THE WAYFARE DIFFERENCE</div>
        <div className="manifesto-copy">
          <h2>Less planning fatigue.<br /><em>More anticipation.</em></h2>
          <p>
            The best trips have a rhythm: enough discovery to feel alive, enough space to
            notice where you are. Wayfare plans for both.
          </p>
        </div>
      </section>

      <section className="features section shell" aria-label="Product features">
        {features.map(({ icon: Icon, eyebrow, title, body }, index) => (
          <article className="feature-card" key={title}>
            <div className="feature-index">0{index + 1}</div>
            <div className="feature-icon"><Icon size={20} /></div>
            <span className="eyebrow">{eyebrow}</span>
            <h3>{title}</h3>
            <p>{body}</p>
          </article>
        ))}
      </section>

      <section className="planner-preview section" id="how-it-works">
        <div className="shell preview-grid">
          <div className="preview-copy">
            <span className="eyebrow">Made in three small steps</span>
            <h2>From “somewhere warm”<br />to <em>ready to go.</em></h2>
            <div className="steps">
              <div className="step active">
                <span>1</span>
                <div><strong>Share the shape of your trip</strong><p>Destination, days, budget, and the things you never get tired of.</p></div>
              </div>
              <div className="step">
                <span>2</span>
                <div><strong>Let Wayfare compose it</strong><p>Our planner builds a grounded itinerary with pace, cost, and geography in mind.</p></div>
              </div>
              <div className="step">
                <span>3</span>
                <div><strong>Make it unmistakably yours</strong><p>Edit freely. Ask for more outdoors, less rushing, or a completely new day.</p></div>
              </div>
            </div>
            <Link href="/register" className="button button-forest">
              Start planning <ArrowRight size={17} />
            </Link>
          </div>

          <div className="preview-card-wrap">
            <div className="preview-glow" />
            <div className="preview-card">
              <div className="preview-top">
                <div>
                  <span className="mini-label">YOUR NEXT ESCAPE</span>
                  <h3>Kyoto in autumn</h3>
                </div>
                <div className="mini-weather">18° <span>Golden &amp; clear</span></div>
              </div>
              <div className="preview-meta">
                <span><CalendarDays size={15} /> 5 days</span>
                <span><Map size={15} /> Culture · Food · Nature</span>
              </div>
              <div className="day-line">
                <div className="day-number">01</div>
                <div className="line-dot" />
                <div className="day-detail">
                  <span>8:30 AM</span>
                  <strong>Morning stillness at Kiyomizu-dera</strong>
                  <p>Arrive before the city fully wakes, then follow the hillside lanes into Gion.</p>
                </div>
              </div>
              <div className="day-line">
                <div className="day-number faded">02</div>
                <div className="line-dot" />
                <div className="day-detail">
                  <span>1:00 PM</span>
                  <strong>Nishiki Market tasting trail</strong>
                  <p>Small bites, curious ingredients, and a few places locals return to.</p>
                </div>
              </div>
              <div className="preview-footer">
                <span><Zap size={14} /> Trip Pulse</span>
                <strong>92 · Beautifully balanced</strong>
              </div>
            </div>
            <div className="floating-note"><ShieldCheck size={17} /> Private to your account</div>
          </div>
        </div>
      </section>

      <section className="pulse-section section shell" id="pulse">
        <div className="pulse-visual">
          <div className="pulse-ring">
            <div><strong>92</strong><span>TRIP PULSE</span></div>
          </div>
          <div className="pulse-bars">
            {[62, 74, 58, 86, 66].map((height, index) => (
              <div key={height}><span style={{ height: `${height}%` }} /><small>D{index + 1}</small></div>
            ))}
          </div>
        </div>
        <div className="pulse-copy">
          <span className="eyebrow"><Zap size={14} /> A Wayfare original</span>
          <h2>Meet your trip&apos;s<br /><em>energy forecast.</em></h2>
          <p>
            Trip Pulse reads the pace of every day and flags the moments that feel overloaded.
            Because a beautiful itinerary should leave room for being there.
          </p>
          <div className="pulse-points">
            <span><ShieldCheck size={17} /> Spots exhausting days</span>
            <span><Hotel size={17} /> Balances movement and rest</span>
          </div>
        </div>
      </section>

      <section className="final-cta">
        <div className="final-cta-inner shell">
          <span className="eyebrow light-eyebrow">Where will you go next?</span>
          <h2>A good journey starts<br />before you leave.</h2>
          <Link href="/register" className="button button-gold button-large">
            Plan something wonderful <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="shell footer-inner">
          <Logo light />
          <p>AI travel planning with taste, clarity, and room to wander.</p>
          <span>© 2026 Wayfare</span>
        </div>
      </footer>
    </main>
  );
}

