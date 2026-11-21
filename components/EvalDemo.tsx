"use client";

import { useState } from "react";

// Sample eval, labeled Example only everywhere it appears. The numbers
// come from the Environment Pack Proof Playbook sample (62 of 100 passed),
// not from a customer run. Click a failure row to see what it means.
const ROWS = [
  { label: "Missed grasp", count: 14, detail: "The gripper closed 2 cm short of the card edge, on the smooth side. Fix: move the approach 2 cm lower and slow the last 10 cm." },
  { label: "Slipped on lift", count: 11, detail: "The card left the table, then slipped as the arm rotated. Fix: add 0.4 s of settle time before the lift." },
  { label: "Timed out", count: 7, detail: "The policy spent 60 seconds searching for a card it had already passed. Fix: cap the search sweep at 20 seconds." },
  { label: "Placed outside the tray", count: 6, detail: "The drop point drifted 4 cm past the tray edge on hard variations. Fix: re-check the tray center after each variation." },
];

export default function EvalDemo() {
  const [open, setOpen] = useState(0);
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-sm text-[#5b5f66]">SAMPLE EVAL, EXAMPLE ONLY</p>
          <p className="mt-2 text-6xl font-medium tracking-tight num sm:text-7xl">62<span className="text-[#5b5f66]"> / 100</span></p>
          <p className="mt-2 text-lg text-[#5b5f66]">Your policy passed 62 of 100 runs of sorting cards, in a twin of a kitchen counter.</p>
        </div>
        <div className="flex gap-6 font-mono text-sm">
          <span><strong className="text-[#15803d]">EASY 85/100</strong></span>
          <span><strong>NORMAL 62/100</strong></span>
          <span><strong className="text-[#ea580c]">HARD 39/100</strong></span>
        </div>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#e5e7eb] p-5">
          <p className="section-label">Where it got through</p>
          <ul className="mt-3 space-y-2 text-base">
            <li className="flex justify-between"><span>Reached the card</span><strong className="num">98</strong></li>
            <li className="flex justify-between"><span>Grasped the card</span><strong className="num">81</strong></li>
            <li className="flex justify-between"><span>Lifted the card</span><strong className="num">70</strong></li>
            <li className="flex justify-between"><span>Placed the card</span><strong className="num">62</strong></li>
          </ul>
        </div>
        <div className="rounded-2xl border border-[#e5e7eb] p-5">
          <p className="section-label">Where it failed, tap a row</p>
          <ul className="mt-3 space-y-2">
            {ROWS.map((r, i) => (
              <li key={r.label}>
                <button
                  type="button"
                  onClick={() => setOpen(i)}
                  aria-expanded={open === i}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-base ${open === i ? "bg-[#ffedd5]" : "bg-[#f6f7f9] hover:bg-[#ffedd5]"}`}
                >
                  <span>{r.label}</span>
                  <strong className="num text-[#ea580c]">{r.count}</strong>
                </button>
                {open === i && <p className="px-3 pt-2 text-sm leading-6 text-[#5b5f66]">{r.detail}</p>}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mt-4 text-sm text-[#5b5f66]">
        Every failure above links to a clip and a seed, so your team can replay it. This is a sample with illustrative numbers. Your pilot eval uses your policy, your place, and your numbers.
      </p>
    </div>
  );
}
