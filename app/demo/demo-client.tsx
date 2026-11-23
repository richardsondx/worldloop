"use client";

import { useEffect, useState } from "react";
import WorldViewer from "./world-viewer";

// Demo gate, not security: the code keeps the page for people with the
// deck, nothing here is secret, and there is no backend check.
const DEMO_CODE = "3X2DV";
const STORAGE_KEY = "worldloop-demo-unlocked";

const FILES = [
  { name: "world.xml", href: "/packs/demo-earphone-charger/world.xml", note: "The world · 6.7 KB" },
  { name: "world-preview.png", href: "/packs/demo-earphone-charger/world-preview.png", note: "The world, one frame · 161.5 KB" },
  { name: "success-test.py", href: "/packs/demo-earphone-charger/success-test.py", note: "The judge · 6.1 KB" },
  { name: "forced-pass.txt", href: "/packs/demo-earphone-charger/forced-pass.txt", note: "Good placement result · 0.6 KB" },
  { name: "forced-fail.txt", href: "/packs/demo-earphone-charger/forced-fail.txt", note: "Bad placement result · 0.6 KB" },
];

const EVAL_FAILURES = [
  { name: "Missed grasp", runs: 14 },
  { name: "Slipped on lift", runs: 11 },
  { name: "Timed out", runs: 7 },
  { name: "Placed outside the dock", runs: 6 },
];

export default function DemoClient() {
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") setUnlocked(true);
    } catch {
      // sessionStorage unavailable; the gate stays.
    }
    setChecked(true);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const clean = code.toUpperCase().replace(/\s+/g, "");
    if (clean === DEMO_CODE) {
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        // sessionStorage unavailable; the demo still opens this once.
      }
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
    }
  }

  if (!checked) {
    return <main className="mx-auto min-h-screen max-w-5xl px-5 py-10 sm:px-8" />;
  }

  if (!unlocked) {
    return (
      <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-5 py-10 text-center sm:px-8">
        <p className="text-sm font-medium tracking-wide text-[#5b5f66]">WorldLoop</p>
        <h1 className="mt-6 text-4xl font-medium tracking-tight sm:text-5xl">
          This demo is for people with the deck.
        </h1>
        <p className="mt-4 text-lg leading-8 text-[#5b5f66]">
          Enter the code from the deck.
        </p>
        <form onSubmit={submit} className="mt-10 flex w-full max-w-md flex-col items-center gap-4">
          <label htmlFor="demo-code" className="sr-only">
            Demo code
          </label>
          <input
            id="demo-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            autoComplete="off"
            autoCapitalize="characters"
            placeholder="Code"
            className="w-full rounded-2xl border border-[#d4d4d8] px-5 py-4 text-center text-2xl font-medium tracking-[0.3em] outline-none placeholder:text-[#a1a1aa] focus:border-[#1d4ed8]"
          />
          <button
            type="submit"
            className="w-full rounded-full bg-[#1d4ed8] px-6 py-4 text-lg font-medium text-white hover:bg-[#1e40af]"
          >
            Open the demo
          </button>
        </form>
        {error && (
          <p className="mt-6 text-base text-[#991b1b]" role="alert">
            That code did not match. Check the deck and try again.
          </p>
        )}
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
      <p className="text-sm">
        <a href="/" className="text-[#1d4ed8] hover:underline">
          ← WorldLoop
        </a>
      </p>

      <p className="mt-16">
        <span className="rounded-full bg-[#fef3c7] px-3 py-1 text-xs font-medium text-[#92400e]">
          Sample demo
        </span>
      </p>
      <h1 className="mt-6 max-w-3xl text-5xl font-medium leading-[1.05] tracking-tight sm:text-6xl">
        Putting an earphone in its charger.
      </h1>
      <p className="mt-6 max-w-2xl text-xl leading-9 text-[#5b5f66]">
        One film in. One pack out.
      </p>
      <p className="mt-3 max-w-2xl text-lg leading-8 text-[#5b5f66]">
        A lab films a task at home. We build the world, run the robot through
        it, and return what broke.
      </p>

      <section className="mt-24">
        <h2 className="text-3xl font-medium tracking-tight sm:text-4xl">Watch the robot do it</h2>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-[#5b5f66]">
          The sim run: the arm picks up the earphone and puts it in its
          charger. 20 seconds.
        </p>
        <video
          src="/packs/demo-earphone-charger/task-run.mp4"
          poster="/packs/demo-earphone-charger/task-run-poster.png"
          controls
          muted
          loop
          playsInline
          autoPlay
          className="mt-8 w-full rounded-3xl border border-[#e5e7eb]"
        />
        <p className="mt-3 text-sm text-[#5b5f66]">
          <a href="/packs/demo-earphone-charger/task-run.mp4" download="task-run.mp4" className="font-medium text-[#1d4ed8] hover:underline">
            Download the video
          </a>{" "}
          (task-run.mp4, 626 KB).
        </p>
      </section>

      <section className="mt-24">
        <h2 className="text-3xl font-medium tracking-tight sm:text-4xl">What comes in</h2>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-[#5b5f66]">
          A phone film of the place, and the task. This demo uses one task:
          put an earphone in its charger, in the living room.
        </p>
        <img
          src="/packs/demo-earphone-charger/world-place.png"
          alt="The world we built for this task: the living room table, the charger, the earphone"
          className="mt-8 w-full rounded-3xl border border-[#e5e7eb]"
        />
        <p className="mt-3 text-sm text-[#5b5f66]">
          The world we built for this task: the living room table, the
          charger, the earphone. A lab sends a phone film of its place. This
          demo was built by hand, so the picture is the world we built, not a
          lab film.
        </p>
      </section>

      <section className="mt-24">
        <h2 className="text-3xl font-medium tracking-tight sm:text-4xl">The world, in 3D</h2>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-[#5b5f66]">
          Now drive it yourself. Drag to look around. Drag the slider to run
          the task.
        </p>
        <div className="mt-8">
          <WorldViewer />
        </div>
        <p className="mt-3 text-sm text-[#5b5f66]">
          A model of the demo world, built from world.xml. A model, not a live
          physics run.
        </p>
      </section>

      <section className="mt-24">
        <h2 className="text-3xl font-medium tracking-tight sm:text-4xl">What comes out</h2>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-[#5b5f66]">
          The pack. The world, the task, the test, and every failure.
        </p>

        <h3 className="mt-12 text-2xl font-medium tracking-tight">The judge</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-[#bbf7d0] bg-[#f0fdf4] p-6">
            <p className="text-lg font-medium text-[#166534]">Good placement: PASS</p>
            <p className="mt-1 text-sm leading-6 text-[#166534]">
              Earphone in the dock, upright. All 4 checks inside their limits.
            </p>
            <ul className="mt-3 space-y-1 font-mono text-xs leading-5 text-[#166534]">
              <li>Sideways: off 0.000 m, limit 0.020 m PASS</li>
              <li>Front to back: off 0.000 m, limit 0.010 m PASS</li>
              <li>Height: off 0.000 m, limit 0.010 m PASS</li>
              <li>Tilt: off 0.0 deg, limit 15.0 deg PASS</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-[#fecaca] bg-[#fef2f2] p-6">
            <p className="text-lg font-medium text-[#991b1b]">Bad placement: FAIL</p>
            <p className="mt-1 text-sm leading-6 text-[#991b1b]">
              Earphone left of the dock, tilted 40 deg. 2 of 4 checks outside
              their limits.
            </p>
            <ul className="mt-3 space-y-1 font-mono text-xs leading-5 text-[#991b1b]">
              <li>Sideways: off 0.055 m, limit 0.020 m FAIL</li>
              <li>Front to back: off 0.000 m, limit 0.010 m PASS</li>
              <li>Height: off 0.002 m, limit 0.010 m PASS</li>
              <li>Tilt: off 40.0 deg, limit 15.0 deg FAIL</li>
            </ul>
          </div>
        </div>

        <h3 className="mt-12 text-2xl font-medium tracking-tight">The sample eval</h3>
        <p className="mt-4 text-6xl font-medium tracking-tight">
          62<span className="text-3xl text-[#5b5f66]"> / 100</span>
        </p>
        <p className="mt-3 text-base leading-7 text-[#5b5f66]">
          62 of 100 runs put the earphone in its charger. Sample, not a lab
          result.
        </p>
        <ul className="mt-6 overflow-hidden rounded-3xl border border-[#e5e7eb]">
          {EVAL_FAILURES.map((f) => (
            <li
              key={f.name}
              className="flex items-center justify-between gap-3 border-b border-[#e5e7eb] px-5 py-4 last:border-b-0"
            >
              <span className="font-medium">{f.name}</span>
              <span className="text-[#5b5f66]">{f.runs} runs</span>
            </li>
          ))}
        </ul>

        <h3 className="mt-12 text-2xl font-medium tracking-tight">The files</h3>
        <ul className="mt-4 overflow-hidden rounded-3xl border border-[#e5e7eb]">
          {FILES.map((f) => (
            <li
              key={f.name}
              className="flex items-center justify-between gap-3 border-b border-[#e5e7eb] px-5 py-4 last:border-b-0"
            >
              <a href={f.href} download={f.name} className="shrink-0 whitespace-nowrap font-medium text-[#1d4ed8] hover:underline">
                {f.name}
              </a>
              <span className="text-right text-sm text-[#5b5f66]">{f.note}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-base leading-7">
          See the full pack and the sample eval report:{" "}
          <a href="/packs/demo-earphone-charger" className="font-medium text-[#1d4ed8] hover:underline">
            the sample pack
          </a>{" "}
          and{" "}
          <a href="/packs/demo-earphone-charger/report" className="font-medium text-[#1d4ed8] hover:underline">
            the sample eval report
          </a>
          .
        </p>
      </section>

      <section className="mt-24 border-t border-[#e5e7eb] pt-8">
        <p className="max-w-2xl text-sm leading-6 text-[#5b5f66]">
          Honest note. Only the judge numbers on this page are real, from the
          judge test run in MuJoCo 3.9.0 and plain Python. The score 62 of 100
          and the failure counts are a sample, not a run result. The video is
          the sim doing the task from a script, not a robot deciding how. The
          3D scene follows the same motion.
        </p>
      </section>
    </main>
  );
}
