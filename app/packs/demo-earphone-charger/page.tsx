import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pack: Putting earphone in charger in Living Room — WorldLoop",
  description:
    "Sample pack: the world, the judge, the failures, and the files for putting an earphone in its charger.",
};

// Sample pack page, the page a lab opens for one pack: the world, the
// judge, the failures, and the files to download. The judge numbers are real,
// from the judge test run in MuJoCo 4.0.1 and plain Python. The score 62 of 100
// and the failure counts are a sample. The 100-run eval and the failure clips
// are the next build, not built yet, and the page says so in writing.
const FILES = [
  { name: "world.xml", href: "/packs/demo-earphone-charger/world.xml", note: "The world · 6.7 KB" },
  { name: "world-preview.png", href: "/packs/demo-earphone-charger/world-preview.png", note: "The world, one frame · 161.5 KB" },
  { name: "success-test.py", href: "/packs/demo-earphone-charger/success-test.py", note: "The judge · 6.1 KB" },
  { name: "forced-pass.txt", href: "/packs/demo-earphone-charger/forced-pass.txt", note: "Good placement result · 0.6 KB" },
  { name: "forced-fail.txt", href: "/packs/demo-earphone-charger/forced-fail.txt", note: "Bad placement result · 0.6 KB" },
];

const FAILURES = [
  {
    title: "1. Sideways, off by 0.055 m",
    detail: "Limit 0.020 m. The earphone missed the dock to the side.",
  },
  {
    title: "2. Tilt, 40 deg",
    detail: "Limit 15 deg. The earphone leans too far to sit in the dock.",
  },
];

const EVAL_STEPS = [
  { title: "The sim loads the world.", body: "MuJoCo opens world.xml: the room, the table, the dock, the earphone, the arm." },
  { title: "The robot will run the task, 100 times.", body: "Each run will start different: earphone position, tilt, clutter in the room. That is what the full eval will vary. The demo pack holds 5 sample starts, not the 100 runs." },
  { title: "The judge checks the result.", body: "After each run, success-test.py checks the earphone against the dock: sideways, front to back, height, tilt." },
  { title: "The report counts it up.", body: "Pass rate, failures by type, and a clip behind each failure. That report is the next build. This page holds the judge test only." },
];

export default function DemoPackPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
      <p className="text-sm">
        <a href="/" className="text-[#1d4ed8] hover:underline">← WorldLoop</a>
      </p>
      <p className="mt-4">
        <span className="rounded-full bg-[#fef3c7] px-3 py-1 text-xs font-medium text-[#92400e]">Sample pack</span>
      </p>
      <h1 className="mt-3 text-4xl font-medium tracking-tight sm:text-5xl">
        Putting earphone in charger in Living Room
      </h1>
      <p className="mt-3 text-lg leading-8 text-[#5b5f66]">
        1 task · 1 place · Demo pack, built offline from the sample film.
      </p>
      <p className="mt-3 text-base leading-7">
        Read the <a href="/packs/demo-earphone-charger/report" className="font-medium text-[#1d4ed8] hover:underline">sample eval report</a>: 62 of 100 runs passed, 4 failure types, the judge result. <a href="/packs/demo-earphone-charger/report.pdf" download="report.pdf" className="font-medium text-[#1d4ed8] hover:underline">Download the report as a PDF</a>.
      </p>

      <img
        src="/packs/demo-earphone-charger/world-preview.png"
        alt="The living room world: table, charger dock, earphone, robot arm"
        className="mt-8 w-full rounded-2xl border border-[#e5e7eb]"
      />
      <p className="mt-2 text-sm text-[#5b5f66]">
        The world. Table, charger dock, earphone, robot arm. Open it in MuJoCo with the world.xml file below.
      </p>

      <h2 className="mt-12 text-2xl font-medium tracking-tight">The judge</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#bbf7d0] bg-[#f0fdf4] p-5">
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
        <div className="rounded-2xl border border-[#fecaca] bg-[#fef2f2] p-5">
          <p className="text-lg font-medium text-[#991b1b]">Bad placement: FAIL</p>
          <p className="mt-1 text-sm leading-6 text-[#991b1b]">
            Earphone left of the dock, tilted 40 deg. 2 of 4 checks outside their limits.
          </p>
          <ul className="mt-3 space-y-1 font-mono text-xs leading-5 text-[#991b1b]">
            <li>Sideways: off 0.055 m, limit 0.020 m FAIL</li>
            <li>Front to back: off 0.000 m, limit 0.010 m PASS</li>
            <li>Height: off 0.002 m, limit 0.010 m PASS</li>
            <li>Tilt: off 40.0 deg, limit 15.0 deg FAIL</li>
          </ul>
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-[#5b5f66]">
        The judge works: it passes good placement and fails bad placement. Run it yourself with the files below.
      </p>

      <h2 className="mt-12 text-2xl font-medium tracking-tight">Failures</h2>
      <div className="mt-4 space-y-3">
        {FAILURES.map((f) => (
          <div key={f.title} className="flex items-center gap-4 rounded-2xl border border-[#e5e7eb] p-4">
            <img
              src="/packs/demo-earphone-charger/world-preview.png"
              alt="World preview"
              className="w-28 shrink-0 rounded-xl border border-[#e5e7eb]"
            />
            <div>
              <p className="font-medium">{f.title}</p>
              <p className="mt-1 text-sm leading-6 text-[#5b5f66]">{f.detail}</p>
              <p className="mt-1 text-sm">
                <a href="/packs/demo-earphone-charger/forced-fail.txt" className="text-[#1d4ed8] hover:underline">See the full result</a>
                <span className="text-[#5b5f66]"> · Clip: not recorded in this demo.</span>
              </p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-sm leading-6 text-[#5b5f66]">
        In a full eval, each failure has a 10 to 30 second clip. This demo pack has the judge results, not clips.
      </p>

      <h2 className="mt-12 text-2xl font-medium tracking-tight">Files in this pack</h2>
      <ul className="mt-4 overflow-hidden rounded-2xl border border-[#e5e7eb]">
        {FILES.map((f) => (
          <li key={f.name} className="flex items-center justify-between gap-3 border-b border-[#e5e7eb] px-5 py-3.5 last:border-b-0">
            <a href={f.href} download={f.name} className="font-medium text-[#1d4ed8] hover:underline">{f.name}</a>
            <span className="text-sm text-[#5b5f66]">{f.note}</span>
          </li>
        ))}
      </ul>

      <h2 className="mt-12 text-2xl font-medium tracking-tight">How the eval runs</h2>
      <ol className="mt-4 space-y-0">
        {EVAL_STEPS.map((s, i) => (
          <li key={s.title} className="flex gap-4 border-b border-[#f3f4f6] py-4 last:border-b-0">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1d4ed8] text-sm font-medium text-white">{i + 1}</span>
            <p className="leading-7"><strong className="font-medium">{s.title}</strong> {s.body}</p>
          </li>
        ))}
      </ol>

      <div className="mt-10 rounded-2xl bg-[#f6f7f9] p-5">
        <p className="text-sm leading-6 text-[#5b5f66]">
          <strong className="font-medium text-[#0b0b0c]">Honest note.</strong> This demo pack holds the judge test only. The
          100-run eval is the next build: the arm doing the task once is now
          shown at step 13, and the eval runs it across the variations and
          records the failures. Only the judge numbers on this page are real, from the judge test run in MuJoCo 4.0.1 and
          plain Python. The score 62 of 100 is a sample, not a run result.
        </p>
      </div>
    </main>
  );
}
