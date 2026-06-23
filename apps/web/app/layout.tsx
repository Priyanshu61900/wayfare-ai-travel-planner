import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "./globals.css";
import type { Metadata } from "next";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/auth-provider";

export const metadata: Metadata = {
  title: "Wayfare — AI travel, thoughtfully planned",
  description: "Beautiful, editable AI itineraries built around your pace, interests, and budget.",
  icons: { icon: "/favicon.svg" }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#121d1b",
              color: "#f7f3ea",
              border: "1px solid rgba(255,255,255,.12)"
            }
          }}
        />
      </body>
    </html>
  );
}

