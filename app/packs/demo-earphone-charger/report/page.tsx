import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Report: Putting earphone in charger in Living Room — WorldLoop",
  description:
    "Sample eval report: 62 of 100 runs passed, 4 failure types, the judge result, and the files for putting an earphone in its charger.",
};

// Sample eval report page, ported from the client handout at
// ~/workspace/worldloop-client-report/report.html. The score (62 of 100)
// and the failure counts (14, 11, 7, 6) are illustrative, from the sample
// in the upload flow. The judge numbers are real, from forced-pass.txt
// and forced-fail.txt, run by hand in MuJoCo 4.0.1 and plain Python.
// No failure clip exists yet, and the page says so on each row.
const FILES = [
  { name: "report.pdf", href: "/packs/demo-earphone-charger/report.pdf", note: "This report as a PDF" },
  { name: "world.xml", href: "/packs/demo-earphone-charger/world.xml", note: "The world · 6.7 KB" },
  { name: "world-preview.png", href: "/packs/demo-earphone-charger/world-preview.png", note: "The world, one frame · 161.5 KB" },
  { name: "success-test.py", href: "/packs/demo-earphone-charger/success-test.py", note: "The judge · 6.1 KB" },
  { name: "forced-pass.txt", href: "/packs/demo-earphone-charger/forced-pass.txt", note: "Good placement result · 0.6 KB" },
  { name: "forced-fail.txt", href: "/packs/demo-earphone-charger/forced-fail.txt", note: "Bad placement result · 0.6 KB" },
];

const FAILURES = [
  {
    title: "1. Missed grasp",
    count: "14 runs",
    detail: "The gripper closed 2 cm short of the earphone edge, on the smooth side.",
    next: "What to try next: move the approach 2 cm lower and slow the last 10 cm.",
    img: "/packs/demo-earphone-charger/variation-01.png",
  },
  {
    title: "2. Slipped on lift",
    count: "11 runs",
    detail: "The earphone left the table, then slipped as the arm rotated.",
    next: "What to try next: add 0.4 s of settle time before the lift.",
    img: "/packs/demo-earphone-charger/variation-02.png",
  },
  {
    title: "3. Timed out",
    count: "7 runs",
    detail: "The policy spent 60 seconds searching for an earphone it had already passed.",
    next: "What to try next: cap the search sweep at 20 seconds.",
    img: "/packs/demo-earphone-charger/variation-03.png",
  },
  {
    title: "4. Placed outside the dock",
    count: "6 runs",
    detail: "The drop point drifted 4 cm past the dock edge on hard variations.",
    next: "What to try next: re-check the dock center after each variation.",
    img: "/packs/demo-earphone-charger/variation-04.png",
  },
];

const EVAL_STEPS = [
  { title: "The sim loads the world.", body: "MuJoCo opens world.xml: the room, the table, the dock, the earphone, the arm." },
  { title: "The robot runs the task, 100 times, in a full eval.", body: "Each run starts different: earphone position, tilt, clutter in the room. That is what the eval varies." },
  { title: "The judge checks the result.", body: "After each run, success-test.py checks the earphone against the dock: sideways, front to back, height, tilt." },
  { title: "The report counts it up.", body: "Pass rate, failures by type, and a clip behind each failure. In a full eval, that report is this page." },
];

export default function DemoReportPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
      <p className="text-sm">
        <a href="/packs/demo-earphone-charger" className="text-[#1d4ed8] hover:underline">← Sample pack</a>
        <span className="text-[#5b5f66]"> · </span>
        <a href="/" className="text-[#1d4ed8] hover:underline">WorldLoop</a>
      </p>
      <p className="mt-4">
        <span className="rounded-full bg-[#fef3c7] px-3 py-1 text-xs font-medium text-[#92400e]">Sample report</span>
      </p>
      <h1 className="mt-3 text-4xl font-medium tracking-tight sm:text-5xl">
        Putting an earphone in its charger in the Living Room
      </h1>
      <p className="mt-3 text-lg leading-8 text-[#5b5f66]">
        Eval report · 1 task · 1 place · Living Room
      </p>
      <p className="mt-3 leading-7 text-[#5b5f66]">
        This is the report a lab gets after the eval runs. It shows the result, every failure with a clip in a full eval, how the result was judged, and the world files.
      </p>
      <p className="mt-3 text-sm leading-6">
        <a href="/packs/demo-earphone-charger/report.pdf" download="report.pdf" className="font-medium text-[#1d4ed8] hover:underline">Download this report as a PDF</a>
      </p>

      <h2 className="mt-12 text-2xl font-medium tracking-tight">The result</h2>
      <p className="mt-4 text-7xl font-medium tracking-tight">
        62 <span className="text-4xl text-[#5b5f66]">/ 100</span>
      </p>
      <p className="mt-3 text-sm leading-6 text-[#5b5f66]">
        Your policy passed 62 of 100 runs of putting the earphone in its charger.
      </p>
      <p className="mt-2 leading-7">
        A pass means the earphone ended in the dock, upright, inside the limits. A fail means it did not.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#e5e7eb] p-5">
          <p className="font-medium">Where it got through</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex justify-between gap-3 border-t border-[#f3f4f6] pt-2 first:border-t-0 first:pt-0"><span>Reached the earphone</span><strong className="font-mono">98</strong></li>
            <li className="flex justify-between gap-3 border-t border-[#f3f4f6] pt-2"><span>Grasped the earphone</span><strong className="font-mono">81</strong></li>
            <li className="flex justify-between gap-3 border-t border-[#f3f4f6] pt-2"><span>Lifted the earphone</span><strong className="font-mono">70</strong></li>
            <li className="flex justify-between gap-3 border-t border-[#f3f4f6] pt-2"><span>Placed in the dock</span><strong className="font-mono">62</strong></li>
          </ul>
        </div>
        <div className="rounded-2xl border border-[#e5e7eb] p-5">
          <p className="font-medium">100 runs in total</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex justify-between gap-3 border-t border-[#f3f4f6] pt-2 first:border-t-0 first:pt-0"><span>Passed</span><strong className="font-mono">62</strong></li>
            <li className="flex justify-between gap-3 border-t border-[#f3f4f6] pt-2"><span>Failed</span><strong className="font-mono">38</strong></li>
          </ul>
          <p className="mt-3 text-sm leading-6 text-[#5b5f66]">
            Every run starts different: earphone position, tilt, and clutter in the room. That is what the eval varies.
          </p>
        </div>
      </div>

      <h2 className="mt-12 text-2xl font-medium tracking-tight">Failures</h2>
      <p className="mt-3 leading-7">38 runs failed, in 4 ways. Each row names what broke and shows the clip in a full eval, so you can see it happen.</p>
      <div className="mt-4 space-y-3">
        {FAILURES.map((f) => (
          <div key={f.title} className="rounded-2xl border border-[#e5e7eb] p-4">
            <p className="font-medium">{f.title} · <span className="font-mono text-[#ea580c]">{f.count}</span></p>
            <p className="mt-1 text-sm leading-6">{f.detail}</p>
            <p className="mt-1 text-sm leading-6 text-[#5b5f66]">{f.next}</p>
            <div className="mt-3 flex items-center gap-3 rounded-xl bg-[#f6f7f9] p-3">
              <img src={f.img} alt="Still frame of the world" className="w-28 shrink-0 rounded-lg border border-[#e5e7eb]" />
              <p className="text-sm leading-6 text-[#5b5f66]">
                <strong className="text-[#0b0b0c]">Clip: not recorded in this demo.</strong><br />
                Still frame of the world, not a clip of this failure. In a full eval, each failure has a 10 to 30 second clip here.
              </p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="mt-12 text-2xl font-medium tracking-tight">The judge</h2>
      <p className="mt-3 leading-7">
        After each run, the judge checks the earphone against the dock: sideways, front to back, height, and tilt. The dock target is x 0.620 m, y 0.080 m, z 0.808 m.
      </p>
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
          <p className="mt-3 text-sm font-medium text-[#166534]">Verdict: PASS, all 4 checks inside their limits.</p>
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
          <p className="mt-3 text-sm font-medium text-[#991b1b]">Verdict: FAIL, 2 of 4 checks outside their limits.</p>
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-[#5b5f66]">
        The judge works: it passes good placement and fails bad placement. Run it yourself with the files below.
      </p>

      <h2 className="mt-12 text-2xl font-medium tracking-tight">The world</h2>
      <img
        src="/packs/demo-earphone-charger/world-preview.png"
        alt="The world: table, charger dock, earphone, robot arm"
        className="mt-4 w-full rounded-2xl border border-[#e5e7eb]"
      />
      <p className="mt-2 text-sm text-[#5b5f66]">
        The world. Table, charger dock, earphone, robot arm. Open it in MuJoCo with the world.xml file below.
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

      <h2 className="mt-12 text-2xl font-medium tracking-tight">What happens next</h2>
      <div className="mt-4 rounded-2xl border border-[#fecaca] bg-[#fef2f2] p-5">
        <p className="font-medium text-[#991b1b]">Top failure: Missed grasp, 14 runs</p>
        <p className="mt-1 text-sm leading-6 text-[#991b1b]">The gripper closed 2 cm short of the earphone edge, on the smooth side.</p>
      </div>
      <div className="mt-3 rounded-2xl border border-[#bbf7d0] bg-[#f0fdf4] p-5">
        <p className="font-medium text-[#166534]">Next test to run</p>
        <p className="mt-1 text-sm leading-6 text-[#166534]">
          The earphone starts 2 cm farther from the gripper, 20 runs. The gripper approaches 2 cm lower and slows in the last 10 cm. The loop turns the top failure into the next test, so the pack keeps getting better.
        </p>
      </div>

      <div className="mt-10 rounded-2xl bg-[#f6f7f9] p-5">
        <p className="text-sm leading-6 text-[#5b5f66]">
          <strong className="font-medium text-[#0b0b0c]">Honest note.</strong> This is a sample report. No 100-run eval has run yet, so the score (62 of 100) and the failure counts (14, 11, 7, 6) are illustrative, taken from the sample in the upload flow. The judge results are real: good placement passes 4 of 4 and bad placement fails 2 of 4, run by hand in MuJoCo 4.0.1 and plain Python. The clips will be real recordings once the eval runner is built.
        </p>
      </div>
      <p className="mt-8 text-sm text-[#9ca3af]">WorldLoop · Sample eval report · Putting an earphone in its charger in the Living Room</p>
    </main>
  );
}
