import { Compass } from "lucide-react";

export function LoadingScreen({ label = "Charting the way…" }: { label?: string }) {
  return (
    <div className="loading-screen">
      <div className="loading-compass"><Compass size={28} /></div>
      <p>{label}</p>
    </div>
  );
}

