import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Quote } from "lucide-react";
import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="auth-layout">
      <section className="auth-visual">
        <Image src="/images/wayfare-hero.png" alt="" fill className="auth-image" sizes="50vw" />
        <div className="auth-visual-overlay" />
        <div className="auth-brand"><Logo light /></div>
        <div className="auth-quote">
          <Quote size={25} />
          <p>The world is a book, and those who do not travel read only one page.</p>
          <span>— Saint Augustine</span>
        </div>
      </section>
      <section className="auth-panel">
        <Link href="/" className="auth-back"><ArrowLeft size={16} /> Back home</Link>
        <div className="auth-panel-inner">{children}</div>
      </section>
    </main>
  );
}

