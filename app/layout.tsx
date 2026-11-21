import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Scale uses Aeonik, a licensed geometric grotesque. Scale's own brand
// guide names Host Grotesk as the approved free fallback, so the site
// uses Host Grotesk for display and body, and IBM Plex Mono for labels
// and values. Source: https://brand.scale.com/typography
// The fonts are self-hosted in public/fonts, because next/font/google
// fails in dev mode in this sandbox (Turbopack cannot resolve the
// Google font loader, and fonts.gstatic.com is flaky through the proxy).
// Files: host-grotesk-latin.woff2 (variable, 400-700), plex-mono-400.woff2,
// plex-mono-500.woff2, all latin subset, downloaded from Google Fonts.
const hostGrotesk = localFont({
  src: [
    { path: "../public/fonts/host-grotesk-latin.woff2", weight: "400 700", style: "normal" },
  ],
  variable: "--font-host",
  display: "swap",
});

const plexMono = localFont({
  src: [
    { path: "../public/fonts/plex-mono-400.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/plex-mono-500.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-plex",
  display: "swap",
});

export const metadata: Metadata = {
  title: "WorldLoop: The practice world for physical AI",
  description:
    "WorldLoop rebuilds your real place in simulation, runs your policy through 100 variations, and hands you the failures before your robot touches the floor.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${hostGrotesk.variable} ${plexMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-[#0b0b0c]">{children}</body>
    </html>
  );
}
