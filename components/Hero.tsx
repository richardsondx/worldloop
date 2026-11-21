"use client";

import dynamic from "next/dynamic";
import { HandsStill } from "./IsoArt";

// Client wrapper: next/dynamic with ssr false must live in a client
// component, not in the server page.
const HeroScene = dynamic(() => import("./HeroScene"), {
  ssr: false,
  loading: () => <HandsStill />,
});

export default function Hero() {
  return <HeroScene />;
}
