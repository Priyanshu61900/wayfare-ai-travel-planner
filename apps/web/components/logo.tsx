import Link from "next/link";
import { Compass } from "lucide-react";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className={`logo ${light ? "logo-light" : ""}`} aria-label="Wayfare home">
      <span className="logo-mark"><Compass size={18} strokeWidth={1.8} /></span>
      <span>wayfare</span>
    </Link>
  );
}

