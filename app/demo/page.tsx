import type { Metadata } from "next";
import DemoClient from "./demo-client";

export const metadata: Metadata = {
  title: "Demo: Putting an earphone in its charger | WorldLoop",
  description:
    "One film in. One pack out. Watch the robot place the earphone in the dock, in 3D, and see the pack that comes back.",
};

export default function DemoPage() {
  return <DemoClient />;
}
