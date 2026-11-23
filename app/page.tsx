import Hero from "../components/Hero";
import EvalDemo from "../components/EvalDemo";
import PilotForm from "../components/PilotForm";
import { PackArt, EvalArt, LoopArt } from "../components/IsoArt";

function Logo() {
  return (
    <a href="#top" className="flex items-center gap-2" aria-label="WorldLoop home">
      <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
        <rect x="1.5" y="1.5" width="25" height="25" rx="6" fill="none" stroke="#0b0b0c" strokeWidth="2" />
        <path d="M8 14 a6 6 0 1 1 6 6" fill="none" stroke="#1d4ed8" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M14 20 l-2.5 -1 M14 20 l0.5 -2.8" fill="none" stroke="#1d4ed8" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <span className="text-lg font-semibold tracking-tight">WorldLoop</span>
    </a>
  );
}

const NAV = [
  { href: "#test", label: "The test" },
  { href: "#library", label: "The library" },
  { href: "#proof", label: "Proof" },
  { href: "#how", label: "How it works" },
  { href: "#pack", label: "The pack" },
  { href: "#security", label: "Security" },
];

export default function Home() {
  return (
    <div id="top" className="flex min-h-full flex-col bg-white text-[#0b0b0c]">
      <header className="sticky top-0 z-50 border-b border-[#e5e7eb] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-8">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm md:flex" aria-label="Main">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="text-[#5b5f66] hover:text-[#0b0b0c]">{n.label}</a>
            ))}
          </nav>
          <a href="#pilot" className="rounded-full bg-[#0b0b0c] px-4 py-2 text-sm font-medium text-white hover:bg-[#1d4ed8]">
            Request a free pilot
          </a>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO */}
        <section className="mx-auto max-w-7xl px-5 pb-10 pt-12 sm:px-8 sm:pt-16">
          <p className="section-label">For the team that ships the robot</p>
          <h1 className="hero-display mt-5 max-w-4xl text-5xl font-medium sm:text-7xl lg:text-8xl">
            Your robot works in your lab. Does it work in their home?
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-8 text-[#5b5f66]">
            WorldLoop runs your robot through the hard cases in real places
            like your customer&apos;s: the messy room, the odd angle, the thing
            out of place. You get back every case where it does the thing
            right, and every case where it breaks, with the clip to prove it, in a full eval.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#pilot" className="rounded-full bg-[#1d4ed8] px-6 py-3 text-base font-medium text-white hover:bg-[#1e40af]">
              Request a free pilot
            </a>
            <a href="#proof" className="rounded-full bg-white px-6 py-3 text-base font-medium ring-1 ring-black/15 hover:bg-[#f6f7f9]">
              See a sample eval
            </a>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 font-mono text-sm text-[#5b5f66]">
            <span><strong className="text-[#0b0b0c]">Hard cases</strong> your own sim never runs</span>
            <span><strong className="text-[#0b0b0c]">Every case</strong> passed or failed</span>
            <span><strong className="text-[#0b0b0c]">Every break</strong> with a clip, in a full eval</span>
          </div>

          <div className="mt-10 overflow-hidden rounded-3xl border border-[#e5e7eb] bg-[#f6f7f9]">
            <div className="h-[420px] sm:h-[520px]">
              <Hero />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e5e7eb] bg-white px-5 py-3 text-sm text-[#5b5f66]">
              <span>Two carbon hands, one cloth, one fold. This is a live render, not a video.</span>
              <span className="font-mono text-xs">CARBON HANDS, FOLDING CLOTHES, SIM</span>
            </div>
          </div>
        </section>

        {/* IN 10 SECONDS */}
        <section className="border-y border-[#e5e7eb] bg-[#f6f7f9]">
          <div className="mx-auto grid max-w-7xl gap-6 px-5 py-10 sm:grid-cols-4 sm:px-8">
            {[
              ["What it is", "A test of the hard cases, run in one of your places, rebuilt as a practice world."],
              ["What you get", "Every case where it did the thing right, and every case where it broke, with a clip behind each one, in a full eval."],
              ["What it costs", "A custom quote. The pilot is free. You see the eval before you pay."],
              ["How to start", "Send the film of your place, your task, and your policy. We build the first pack."],
            ].map(([t, d]) => (
              <div key={t}>
                <p className="section-label">{t}</p>
                <p className="mt-2 leading-7">{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* THE TEST */}
        <section id="test" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16 sm:px-8 sm:py-24">
          <p className="section-label">The test</p>
          <h2 className="mt-4 max-w-3xl text-4xl font-medium tracking-tight sm:text-5xl">
            It is not about the world. It is about what we test.
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-[#5b5f66]">
            Your lab tests the easy version of the task, in one clean place.
            We test the hard version: the earphone upside down, the charger
            behind a book, the room dimmer. One task, broken into its hard
            variants. Each one passed or failed, with a clip, in a full eval.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              ["One task, many hard cases", "We split your task into its variants: the messy room, the odd angle, the thing out of place. Each variant gets a run, and each run gets a verdict."],
              ["Pass or fail, with proof", "Every case ends passed or failed. The pass rate sits inside the report as one line. In a full eval, the clip is what you check."],
              ["The cases your lab never runs", "Your own sim runs the happy path. The failures live in the tail, and the tail is what we test."],
            ].map(([t, d]) => (
              <div key={t} className="rounded-2xl border border-[#e5e7eb] p-6">
                <h3 className="text-xl font-medium">{t}</h3>
                <p className="mt-2 leading-7 text-[#5b5f66]">{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* THE LIBRARY */}
        <section id="library" className="border-y border-[#e5e7eb] bg-[#f6f7f9]">
          <div className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16 sm:px-8 sm:py-24">
            <p className="section-label">The library</p>
            <h2 className="mt-4 max-w-3xl text-4xl font-medium tracking-tight sm:text-5xl">
              One lab has one place. Your robot ships to thousands.
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-[#5b5f66]">
              One lab can scan its own place. No lab can scan and keep hundreds
              of real places. Each pack adds one real deployment place to the
              library, and your place stays yours.
            </p>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-[#5b5f66]">
              Rooms change. We rescan when the room changes, and the rescan is
              part of the pack.
            </p>
          </div>
        </section>

        {/* PROOF */}
        <section id="proof" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16 sm:px-8 sm:py-24">
          <p className="section-label">Proof, before you pay</p>
          <h2 className="mt-4 max-w-3xl text-4xl font-medium tracking-tight sm:text-5xl">
            You do not buy a promise. You buy a report you can check.
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-[#5b5f66]">
            The report lists every case: which ones pass, which ones fail, and
            the clip behind each one, in a full eval. Same layout, same kinds of numbers, your policy
            and your place instead of the sample.
          </p>
          <div className="mt-10">
            <EvalDemo />
          </div>
          <p className="mt-6 text-base leading-7">
            See the sample pack: <a href="/packs/demo-earphone-charger" className="font-medium text-[#1d4ed8] hover:underline">Putting an earphone in its charger</a>, and the <a href="/packs/demo-earphone-charger/report" className="font-medium text-[#1d4ed8] hover:underline">sample eval report</a> (62 of 100, PDF included).
          </p>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="border-y border-[#e5e7eb] bg-[#f6f7f9]">
          <div className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16 sm:px-8 sm:py-24">
            <p className="section-label">How it works</p>
            <h2 className="mt-4 max-w-3xl text-4xl font-medium tracking-tight sm:text-5xl">
              Three steps. You keep your robot on the floor while we test it.
            </h2>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {[
                {
                  n: "01",
                  t: "You film the place",
                  d: "Film one task with your phone and scan the room. No crew, no rig. You keep the raw files.",
                  art: <PackArt />,
                },
                {
                  n: "02",
                  t: "We build the world and run the hard cases",
                  d: "Your place becomes a practice world. Your robot runs the cases your own sim never covers: the messy room, the odd angle, the thing out of place. Every run is logged, and every break gets a clip, in a full eval.",
                  art: <EvalArt />,
                },
                {
                  n: "03",
                  t: "You get the eval",
                  d: "You get the report: every case where it did the thing right, and every case where it broke, with a clip behind each one, in a full eval. Each failure becomes a new test, and the next pack checks what the last one found.",
                  art: <LoopArt />,
                },
              ].map((s) => (
                <article key={s.n} className="rounded-3xl border border-[#e5e7eb] bg-white p-6">
                  <div className="rounded-2xl bg-[#f6f7f9] p-4">{s.art}</div>
                  <p className="mt-5 font-mono text-sm text-[#1d4ed8]">{s.n}</p>
                  <h3 className="mt-2 text-2xl font-medium tracking-tight">{s.t}</h3>
                  <p className="mt-2 leading-7 text-[#5b5f66]">{s.d}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* PACK */}
        <section id="pack" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16 sm:px-8 sm:py-24">
          <p className="section-label">The pack</p>
          <h2 className="mt-4 max-w-3xl text-4xl font-medium tracking-tight sm:text-5xl">
            One pack holds everything your team needs to reproduce the result.
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["The world", "Your place as a sim scene, in MuJoCo format, with a scale note and a mesh that opens clean. The demo pack ships MuJoCo only."],
              ["The task", "One task, written as a spec, with a success test in code. No human watches the run to call it a pass."],
              ["The eval", "Success rate with the run count next to it, and failure counts by code. No rate without a count."],
              ["The failure reel", "In a full eval, a clip for each failure, 10 to 30 seconds, labeled with seed, variation, and stage."],
              ["The run scripts", "The demo pack ships the world file and the judge script. One-command run scripts ship with the full eval."],
              ["The loop", "Each failure becomes a new variation and a new test. The next pack version ships with the fixes checked."],
            ].map(([t, d]) => (
              <div key={t} className="rounded-2xl border border-[#e5e7eb] p-6">
                <h3 className="text-xl font-medium">{t}</h3>
                <p className="mt-2 leading-7 text-[#5b5f66]">{d}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-[#5b5f66]">
            Capture spec: MP4, H.264, no audio, 1920 by 1080, 30 frames per second, chest mount at 1.35 m. Full spec ships with the pilot.
          </p>
        </section>

        {/* TELEMETRY, THE DIRAC ANSWER */}
        <section className="border-y border-[#e5e7eb] bg-[#0b0b0c] text-white">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
            <p className="section-label !text-[#9ca3af]">Why most sims lie to you</p>
            <h2 className="mt-4 max-w-3xl text-4xl font-medium tracking-tight sm:text-5xl">
              A twin that matches the drawing is not a twin that matches your robot.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#d1d5db]">
              Tape under a camera, a weak actuator, a hot motor, a worn joint.
              Each one changes how your robot moves, and none of it is in your
              URDF. A sim built from the drawing alone will pass in sim and fail
              on your floor.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                ["Send your telemetry", "Share your URDF and your telemetry logs with the pilot. The twin is tuned to your robot, not to a generic arm."],
                ["We replay your failures", "Your field failures become sim tests first. If the twin cannot reproduce a failure you already saw, we say so."],
                ["You keep the proof", "The eval shows sim and field side by side where you have field data. Where you do not, it says so in writing."],
              ].map(([t, d]) => (
                <div key={t} className="rounded-2xl border border-white/15 p-6">
                  <h3 className="text-xl font-medium">{t}</h3>
                  <p className="mt-2 leading-7 text-[#d1d5db]">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECURITY */}
        <section id="security" className="border-y border-[#e5e7eb] bg-[#f6f7f9]">
          <div className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16 sm:px-8 sm:py-24">
            <p className="section-label">Security and data</p>
            <h2 className="mt-4 max-w-3xl text-4xl font-medium tracking-tight sm:text-5xl">
              Your place stays yours. Your policy stays yours.
            </h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {[
                ["No model weights stored", "We do not keep your model weights. Your policy runs in your account or in a session you control."],
                ["No lab data reused", "Your place, your task, and your failures are never used to build another lab's pack."],
                ["Private packs stay private", "A pack built from your site is yours. It is not listed, shared, or sold to anyone else."],
                ["Deletion on request", "Ask and we delete your scans, your place files, and your evals. We confirm the deletion in writing."],
              ].map(([t, d]) => (
                <div key={t} className="rounded-2xl border border-[#e5e7eb] bg-white p-6">
                  <h3 className="text-xl font-medium">{t}</h3>
                  <p className="mt-2 leading-7 text-[#5b5f66]">{d}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm text-[#5b5f66]">
              WorldLoop holds no SOC 2 certification yet. The lines above are what we do today, stated plainly, not a borrowed badge.
            </p>
          </div>
        </section>

        {/* PILOT */}
        <section id="pilot" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16 sm:px-8 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <p className="section-label">The pilot</p>
              <h2 className="mt-4 text-4xl font-medium tracking-tight sm:text-5xl">
                Test one task, in one of your places, free.
              </h2>
              <p className="mt-4 text-lg leading-8 text-[#5b5f66]">
                Tell us the task and the place. We build the first pack, run
                your policy, and send you the eval. If the eval finds nothing
                your own sim missed, you learned that for free.
              </p>
              <ul className="mt-6 space-y-3 text-base">
                <li>Free pilot, one task, one place.</li>
                <li>Your eval date is confirmed when your pilot starts.</li>
                <li>You see the report before any price is named.</li>
              </ul>
            </div>
            <PilotForm />
          </div>
        </section>
      </main>

      {/* FOOTER, SCALE STYLE: BLACK, HUGE TYPE */}
      <footer className="overflow-x-clip bg-black text-white">
        <div className="mx-auto max-w-7xl px-5 pb-8 pt-16 sm:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#9ca3af]">WorldLoop</p>
          <p className="hero-display mt-6 max-w-5xl text-5xl font-medium sm:text-7xl">
            Test the robot before it touches the real room.
          </p>
          <div className="mt-12 flex flex-wrap items-center gap-3">
            <a href="#pilot" className="rounded-full bg-white px-6 py-3 text-base font-medium text-black hover:bg-[#dbeafe]">
              Request a free pilot
            </a>
            <a href="#proof" className="rounded-full px-6 py-3 text-base font-medium text-white ring-1 ring-white/30 hover:bg-white/10">
              See a sample eval
            </a>
          </div>
          <div className="mt-16 grid gap-8 border-t border-white/15 pt-10 text-sm sm:grid-cols-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#9ca3af]">Product</p>
              <ul className="mt-3 space-y-2">
                <li><a href="#pack" className="hover:text-[#dbeafe]">The pack</a></li>
                <li><a href="#proof" className="hover:text-[#dbeafe]">Sample eval</a></li>
                <li><a href="#test" className="hover:text-[#dbeafe]">The test</a></li>
                <li><a href="#how" className="hover:text-[#dbeafe]">How it works</a></li>
              </ul>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#9ca3af]">Company</p>
              <ul className="mt-3 space-y-2">
                <li><a href="#security" className="hover:text-[#dbeafe]">Security</a></li>
                <li><a href="#pilot" className="hover:text-[#dbeafe]">Pilot</a></li>
              </ul>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#9ca3af]">Follow</p>
              <ul className="mt-3 space-y-2">
                <li><a href="https://www.linkedin.com/" target="_blank" rel="noreferrer" className="hover:text-[#dbeafe]">LinkedIn</a></li>
                <li><a href="https://x.com/" target="_blank" rel="noreferrer" className="hover:text-[#dbeafe]">X</a></li>
              </ul>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#9ca3af]">Legal</p>
              <ul className="mt-3 space-y-2">
                <li><a href="#top" className="hover:text-[#dbeafe]">Terms of use</a></li>
                <li><a href="#top" className="hover:text-[#dbeafe]">Privacy policy</a></li>
                <li><a href="#top" className="hover:text-[#dbeafe]">Cookie preferences</a></li>
              </ul>
            </div>
          </div>
          <p className="hero-display mt-16 select-none text-[13vw] font-medium leading-none text-white/10 lg:text-[120px]" aria-hidden="true">
            WORLDLOOP
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-6 font-mono text-xs text-[#9ca3af]">
            <span>Copyright 2026 WorldLoop. All rights reserved.</span>
            <span>Sources: WorldLoop stress test, Nov 22, 2026. Sample eval numbers are illustrative.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
