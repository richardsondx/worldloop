"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEMO_MAX_LABEL,
  DEMO_STEP_MS,
  HUMAN_CHECK_STEPS,
  PHASES,
  PRE_UPLOAD_STEPS,
  REJECT_RULES,
  STEP_ICONS,
  WORKFLOW_STEPS,
  formatBytes,
  phaseForStep,
  validateUpload,
  type RejectRule,
  type StepIcon,
  type StepState,
  type WorkflowStep,
} from "../lib/workflow";

type Phase = "idle" | "running" | "waiting" | "rejected" | "done";

const STATE_LABEL: Record<StepState, string> = {
  queued: "Queued",
  running: "Running",
  done: "Done",
  "needs you": "Needs you",
  failed: "Failed",
};

const STATE_STYLE: Record<StepState, string> = {
  queued: "bg-[#f6f7f9] text-[#5b5f66]",
  running: "bg-[#dbeafe] text-[#1d4ed8]",
  done: "bg-[#dcfce7] text-[#166534]",
  "needs you": "bg-[#ffedd5] text-[#9a3412]",
  failed: "bg-[#fee2e2] text-[#991b1b]",
};

const initialStates = (): StepState[] => WORKFLOW_STEPS.map(() => "queued");

// One small line icon per step, drawn inline so the page needs no images.
function StepIconMark({ icon, className }: { icon: StepIcon; className?: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: className ?? "h-5 w-5",
    "aria-hidden": true,
  };
  switch (icon) {
    case "task":
      return (<svg {...common}><path d="M9 6h11M9 12h11M9 18h11" /><path d="M4 6h.01M4 12h.01M4 18h.01" /></svg>);
    case "film":
      return (<svg {...common}><rect x="2" y="6" width="13" height="12" rx="2" /><path d="M15 10l7-3v10l-7-3" /></svg>);
    case "scan":
      return (<svg {...common}><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" /><rect x="8" y="8" width="8" height="8" rx="1" /></svg>);
    case "upload":
      return (<svg {...common}><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 20h16" /></svg>);
    case "ingest":
      return (<svg {...common}><path d="M4 13h4l2 3h4l2-3h4" /><path d="M4 13V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7" /><path d="M4 13v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" /></svg>);
    case "check":
      return (<svg {...common}><path d="M12 3l7 3v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3z" /><path d="M9 12l2 2 4-4" /></svg>);
    case "reject":
      return (<svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v6M12 16.5h.01" /></svg>);
    case "split":
      return (<svg {...common}><path d="M4 6h16M4 12h10M4 18h7" /><circle cx="19" cy="12" r="2" /><circle cx="16" cy="18" r="2" /></svg>);
    case "object":
      return (<svg {...common}><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" /><path d="M12 12l8-4.5M12 12L4 7.5M12 12v9" /></svg>);
    case "mesh":
      return (<svg {...common}><rect x="3" y="3" width="18" height="18" rx="1" /><path d="M9 3v18M15 3v18M3 9h18M3 15h18" /></svg>);
    case "scale":
      return (<svg {...common}><path d="M3 17L17 3l4 4L7 21l-4-4z" /><path d="M8 16l1.5 1.5M11 13l1.5 1.5M14 10l1.5 1.5" /></svg>);
    case "world":
      return (<svg {...common}><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" /><path d="M12 3v18M4 7.5l16 9M20 7.5l-16 9" /></svg>);
    case "eye":
      return (<svg {...common}><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" /><circle cx="12" cy="12" r="3" /></svg>);
    case "port":
      return (<svg {...common}><path d="M4 7h13l-3-3M20 17H7l3 3" /></svg>);
    case "vary":
      return (<svg {...common}><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" /></svg>);
    case "test":
      return (<svg {...common}><path d="M9 3h6M10 3v5l-5 9a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 17l-5-9V3" /><path d="M7.5 14h9" /></svg>);
    case "eval":
      return (<svg {...common}><path d="M4 19a9 9 0 1 1 16 0" /><path d="M12 13l4-5" /><circle cx="12" cy="13" r="1.5" /></svg>);
    case "clip":
      return (<svg {...common}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M7 5v14M17 5v14M3 10h4M3 14h4M17 10h4M17 14h4" /></svg>);
    case "report":
      return (<svg {...common}><path d="M6 2h9l5 5v15H6V2z" /><path d="M14 2v6h6M9 13h6M9 17h6" /></svg>);
    case "pack":
      return (<svg {...common}><path d="M3 8l9-5 9 5v8l-9 5-9-5V8z" /><path d="M3 8l9 5 9-5M12 13v8" /></svg>);
    case "deliver":
      return (<svg {...common}><path d="M3 7h11v10H3zM14 10h4l3 3v4h-7" /><circle cx="7" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" /></svg>);
    case "loop":
      return (<svg {...common}><path d="M20 12a8 8 0 1 1-2.3-5.6" /><path d="M20 3v5h-5" /></svg>);
  }
}

// Hero picture: the generated manual illustration, a phone films the real
// table and it becomes a sim world with a robot arm.
function HeroIllustration() {
  return (
    <img
      src="/manual/manual-hero.webp"
      alt="A person with a phone on a chest mount sorts cards on a table, and an arrow turns the real table into a wireframe sim world with a robot arm"
      className="h-auto w-full rounded-3xl"
    />
  );
}

const MANUAL_PAGES = [
  {
    src: "/manual/manual-film-upload.webp",
    alt: "Step 1, film the task with a phone on a chest mount in daylight. Step 2, upload the video from the phone to the laptop.",
    caption: "1. Film it. 2. Upload it.",
    plain: "Film 10 clean takes in daylight, then upload once.",
  },
  {
    src: "/manual/manual-build-check.webp",
    alt: "Step 3, the phone scan becomes a 3D wireframe room with a robot arm. Step 4, you look at the wireframe room on a laptop and give a thumbs up.",
    caption: "3. Build the world. 4. Check it.",
    plain: "The scan becomes a sim world, and you check it looks right.",
  },
  {
    src: "/manual/manual-test-pack.webp",
    alt: "Step 5, the robot arm drops a card in the sim world and the failure is clipped on a film strip. Step 6, the finished pack is a box with a checkmark next to a report page.",
    caption: "5. Test it. 6. Pack it.",
    plain: "The model runs, failures are clipped, and the pack is ready.",
  },
];

// Step 13: the sample MuJoCo world for the demo task. Real file, real
// render, built and checked offline in MuJoCo. The viewer command below
// was verified to launch: python -m mujoco.viewer --mjcf world.xml.
function SimWorldCheck() {
  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white">
      <img
        src="/packs/demo-earphone-charger/world-preview.png"
        alt="The MuJoCo world for putting an earphone in its charger: a wooden table with a white charger dock, a small white earphone, and a blue robot arm"
        className="h-auto w-full"
      />
      <div className="p-4">
        <p className="font-medium">The first sim world, ready to open</p>
        <p className="mt-1 text-sm leading-6 text-[#5b5f66]">
          Sample world for this demo task, built and rendered in MuJoCo, not
          from your upload. Check the table, the charger dock, the earphone,
          and the arm against the real place.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href="/packs/demo-earphone-charger/world.xml"
            download="world.xml"
            className="rounded-full bg-[#0b0b0c] px-4 py-2 text-sm font-medium text-white hover:bg-[#1d4ed8]"
          >
            Download world.xml
          </a>
        </div>
        <p className="mt-4 text-sm font-medium">Open it on your Mac</p>
        <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm leading-6 text-[#5b5f66]">
          <li>
            Install MuJoCo: <code className="rounded bg-[#f6f7f9] px-1 font-mono text-xs">pip install mujoco</code>
          </li>
          <li>
            Save world.xml in a folder, open a terminal in that folder, and
            run: <code className="rounded bg-[#f6f7f9] px-1 font-mono text-xs">python3 -m mujoco.viewer --mjcf world.xml</code>
          </li>
          <li>
            The viewer opens the world. Drag to orbit, scroll to zoom, and
            check the table, dock, earphone, and arm.
          </li>
        </ol>
      </div>
    </div>
  );
}

// Step 17: the real success test for the demo task, run in MuJoCo 4.0.1.
// The test and both forced results are files in the same pack folder.
// Run it yourself: python3 success-test.py pass
function SuccessTestCheck() {
  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white">
      <div className="p-4">
        <p className="font-medium">The success test, ready to read</p>
        <p className="mt-1 text-sm leading-6 text-[#5b5f66]">
          The test passes only when the earphone tip is at the dock target:
          within 2 cm sideways, 1 cm front to back, 1 cm in height, and the
          earphone stands upright within 15 degrees of vertical.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] p-3">
            <p className="text-sm font-medium text-[#166534]">Forced pass: PASS</p>
            <p className="mt-1 font-mono text-xs leading-5 text-[#166534]">
              Tip x 0.620 m, y 0.080 m, z 0.808 m<br />
              Sideways off by 0.000 m, limit 0.020 m<br />
              Front to back off by 0.000 m, limit 0.010 m<br />
              Height off by 0.000 m, limit 0.010 m<br />
              Tilt 0.0 deg, limit 15.0 deg
            </p>
          </div>
          <div className="rounded-xl border border-[#fecaca] bg-[#fef2f2] p-3">
            <p className="text-sm font-medium text-[#991b1b]">Forced fail: FAIL</p>
            <p className="mt-1 font-mono text-xs leading-5 text-[#991b1b]">
              Tip x 0.565 m, y 0.080 m, z 0.806 m<br />
              Sideways off by 0.055 m, limit 0.020 m<br />
              Front to back off by 0.000 m, limit 0.010 m<br />
              Height off by 0.002 m, limit 0.010 m<br />
              Tilt 40.0 deg, limit 15.0 deg
            </p>
          </div>
        </div>
        <p className="mt-3 text-sm leading-6 text-[#5b5f66]">
          What to look for: the pass shows all four checks inside their
          limits, and the fail shows at least one check outside its limit.
          If the test cannot tell a good place from a bad one, send it back.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href="/packs/demo-earphone-charger/success-test.py"
            download="success-test.py"
            className="rounded-full bg-[#0b0b0c] px-4 py-2 text-sm font-medium text-white hover:bg-[#1d4ed8]"
          >
            Download success-test.py
          </a>
          <a
            href="/packs/demo-earphone-charger/forced-pass.txt"
            download="forced-pass.txt"
            className="rounded-full bg-white px-4 py-2 text-sm font-medium ring-1 ring-black/10 hover:bg-[#f6f7f9]"
          >
            Download forced-pass.txt
          </a>
          <a
            href="/packs/demo-earphone-charger/forced-fail.txt"
            download="forced-fail.txt"
            className="rounded-full bg-white px-4 py-2 text-sm font-medium ring-1 ring-black/10 hover:bg-[#f6f7f9]"
          >
            Download forced-fail.txt
          </a>
        </div>
        <p className="mt-3 text-sm leading-6 text-[#5b5f66]">
          Both results were run in MuJoCo 4.0.1 against the step 13 world,
          forward kinematics only. Run it yourself: <code className="rounded bg-[#f6f7f9] px-1 font-mono text-xs">python3 success-test.py pass</code>
        </p>
      </div>
    </div>
  );
}

export default function UploadFlow() {
  const [taskName, setTaskName] = useState("Sorting cards");
  const [placeName, setPlaceName] = useState("Kitchen");
  const [video, setVideo] = useState<File | null>(null);
  const [scan, setScan] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [states, setStates] = useState<StepState[]>(initialStates);
  const [current, setCurrent] = useState(0);
  const [reject, setReject] = useState<{ rule: RejectRule; detail: string } | null>(null);
  const [error, setError] = useState("");
  const [startedAt, setStartedAt] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  useEffect(() => clearTimer, []);

  const doneCount = states.filter((s) => s === "done").length;
  const minutesLeft = WORKFLOW_STEPS.reduce(
    (sum, step, i) => (states[i] === "done" ? sum : sum + step.targetMinutes),
    0,
  );
  const activePhase = phase === "idle" || phase === "rejected" ? null : phaseForStep(WORKFLOW_STEPS[current].id);

  const advance = useCallback((fromIndex: number) => {
    // fromIndex is the step just finished. Move to the next step.
    const next = fromIndex + 1;
    if (next >= WORKFLOW_STEPS.length) {
      // Clean run finished. Step 7 only runs on reject, so mark it done
      // here, not needed, so the counter reads 24 of 24 and matches the
      // done banner below. Before this fix it stayed Queued and the run
      // ended at 23 of 24.
      setStates((prev) => {
        const copy = [...prev];
        copy[6] = "done";
        return copy;
      });
      setPhase("done");
      return;
    }
    const step = WORKFLOW_STEPS[next];
    if (step.id === 7) {
      // Step 7 only runs on reject, skip it on a clean run.
      advance(next);
      return;
    }
    setCurrent(next);
    setStates((prev) => {
      const copy = [...prev];
      copy[next] = HUMAN_CHECK_STEPS.includes(step.id) ? "needs you" : "running";
      return copy;
    });
    if (HUMAN_CHECK_STEPS.includes(step.id)) {
      setPhase("waiting");
      return;
    }
    setPhase("running");
    timer.current = setTimeout(() => {
      setStates((prev) => {
        const copy = [...prev];
        copy[next] = "done";
        return copy;
      });
      advance(next);
    }, DEMO_STEP_MS);
  }, []);

  const start = (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");
    setReject(null);
    if (!taskName.trim() || !placeName.trim()) {
      setError("Add a task name and a place name first. Example task: Sorting cards. Example place: Kitchen.");
      return;
    }
    const result = validateUpload(video, scan);
    if (!result.ok) {
      // Bad upload path: keep the files, stop at step 6, show the plain reason.
      setReject({ rule: result.rule, detail: result.detail });
      setPhase("rejected");
      setStates((prev) => {
        const copy = initialStates();
        PRE_UPLOAD_STEPS.forEach((id) => { copy[id - 1] = "done"; });
        copy[3] = "done";
        copy[4] = "done";
        copy[5] = "failed";
        copy[6] = "failed";
        return copy;
      });
      setCurrent(5);
      return;
    }
    clearTimer();
    setStartedAt(new Date().toLocaleTimeString());
    const fresh = initialStates();
    PRE_UPLOAD_STEPS.forEach((id) => { fresh[id - 1] = "done"; });
    fresh[3] = "done";
    fresh[4] = "running";
    setStates(fresh);
    setCurrent(4);
    setPhase("running");
    timer.current = setTimeout(() => {
      setStates((prev) => {
        const copy = [...prev];
        copy[4] = "done";
        return copy;
      });
      advance(4);
    }, DEMO_STEP_MS);
  };

  const approveCurrent = () => {
    // Human check approved: mark the waiting step done and keep going.
    clearTimer();
    const idx = current;
    setStates((prev) => {
      const copy = [...prev];
      copy[idx] = "done";
      return copy;
    });
    advance(idx);
  };

  const reset = () => {
    clearTimer();
    setPhase("idle");
    setStates(initialStates());
    setCurrent(0);
    setReject(null);
    setError("");
    setStartedAt("");
    setVideo(null);
    setScan(null);
  };

  const pickVideo = (f: File | undefined) => {
    if (f) setVideo(f);
  };

  const waitingStep = phase === "waiting" ? WORKFLOW_STEPS[current] : null;

  const input = "w-full rounded-xl border border-[#e5e7eb] bg-white px-4 py-3 text-base outline-none focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#dbeafe]";

  const phaseState = (phaseId: number) => {
    const p = PHASES.find((x) => x.id === phaseId);
    if (!p) return "upcoming";
    const done = p.steps.filter((id) => states[id - 1] === "done").length;
    if (done === p.steps.length) return "done";
    if (activePhase && activePhase.id === phaseId) return "active";
    if (done > 0) return "started";
    return "upcoming";
  };

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
      <div className="grid items-center gap-6 sm:grid-cols-2">
        <div>
          <p className="section-label">Admin</p>
          <h1 className="mt-4 text-4xl font-medium tracking-tight sm:text-5xl">Upload a capture</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-[#5b5f66]">
            Richardson only. One upload turns into a test pack: the workflow
            checks your video, builds the sim world, runs the model, and shows
            you where it fails. You check it 4 times, and it does the rest.
          </p>
          <ul className="mt-5 flex flex-wrap gap-2 text-sm">
            <li className="rounded-full bg-[#eff6ff] px-3 py-1.5 font-medium text-[#1d4ed8]">Phone and chest mount</li>
            <li className="rounded-full bg-[#eff6ff] px-3 py-1.5 font-medium text-[#1d4ed8]">10 clean takes</li>
            <li className="rounded-full bg-[#eff6ff] px-3 py-1.5 font-medium text-[#1d4ed8]">One room, one task</li>
          </ul>
        </div>
        <HeroIllustration />
      </div>

      <div className="mt-6 rounded-2xl border border-[#dbeafe] bg-[#eff6ff] p-5">
        <p className="font-medium">Local demo, nothing leaves this browser.</p>
        <p className="mt-1 leading-7 text-[#5b5f66]">
          This page runs the workflow as a local demo with local state only. No
          file is sent, no server runs, and no sim run happened. The real
          MuJoCo, Genesis, and eval runs are the next build step, not done here.
          One exception: step 13 has a real sample MuJoCo world file, built
          offline, so you can open it and check it. A second exception: step
          17 has a real success test with forced pass and forced fail results,
          run in MuJoCo, so you can read them and check them. Times shown are targets
          from the spec, labeled illustrative, not measured times.
        </p>
      </div>

      {(phase === "idle" || phase === "rejected") && (
        <div className="mt-8">
          <h2 className="text-2xl font-medium tracking-tight">How it works, in pictures</h2>
          <p className="mt-1 leading-7 text-[#5b5f66]">
            Six pictures, no reading needed. If you can follow these, you can
            make a pack.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {MANUAL_PAGES.map((page) => (
              <figure key={page.src} className="overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white">
                <img src={page.src} alt={page.alt} className="h-auto w-full" />
                <figcaption className="p-4">
                  <p className="font-medium">{page.caption}</p>
                  <p className="mt-1 text-sm leading-6 text-[#5b5f66]">{page.plain}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}

      {(phase === "running" || phase === "waiting" || phase === "done") && (
        <div className="mt-8">
          <h2 className="text-2xl font-medium tracking-tight">Where your pack is</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-5">
            {PHASES.map((p) => {
              const done = p.steps.filter((id) => states[id - 1] === "done").length;
              const state = phaseState(p.id);
              return (
                <div
                  key={p.id}
                  className={`rounded-2xl border p-4 ${state === "active" ? "border-[#1d4ed8] bg-[#eff6ff]" : state === "done" ? "border-[#bbf7d0] bg-[#f0fdf4]" : "border-[#e5e7eb] bg-white"}`}
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-[#5b5f66]">
                    Phase {p.id} {state === "done" ? "Done" : state === "active" ? "Now" : ""}
                  </p>
                  <p className="mt-1 font-medium">{p.title}</p>
                  <p className="mt-1 text-sm leading-6 text-[#5b5f66]">{p.plain}</p>
                  <p className="mt-2 font-mono text-xs text-[#5b5f66]">{done} of {p.steps.length} steps done</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {phase === "idle" || phase === "rejected" ? (
        <form onSubmit={start} className="mt-8 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              Task name
              <input value={taskName} onChange={(e) => setTaskName(e.target.value)} className={`${input} mt-1`} placeholder="Sorting cards" />
            </label>
            <label className="block text-sm font-medium">
              Place name
              <input value={placeName} onChange={(e) => setPlaceName(e.target.value)} className={`${input} mt-1`} placeholder="Kitchen" />
            </label>
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              pickVideo(e.dataTransfer.files?.[0]);
            }}
            className={`rounded-3xl border-2 border-dashed p-8 text-center ${dragOver ? "border-[#1d4ed8] bg-[#eff6ff]" : "border-[#d1d5db] bg-[#f6f7f9]"}`}
          >
            <p className="text-xl font-medium">Drop your video here</p>
            <p className="mt-2 leading-7 text-[#5b5f66]">
              MP4, H.264, 1920 by 1080, 30 frames per second, no audio. Chest
              mount at 1.35 m, 10 degrees down. Limit {DEMO_MAX_LABEL}.
            </p>
            <label className="mt-4 inline-block cursor-pointer rounded-full bg-[#0b0b0c] px-6 py-3 text-base font-medium text-white hover:bg-[#1d4ed8]">
              Choose a video file
              <input type="file" accept=".mp4,video/mp4" className="hidden" onChange={(e) => pickVideo(e.target.files?.[0])} />
            </label>
            {video && (
              <p className="mt-4 font-mono text-sm text-[#0b0b0c]">
                {video.name} ({formatBytes(video.size)})
              </p>
            )}
          </div>

          <label className="block text-sm font-medium">
            Scan file, optional
            <input
              type="file"
              accept=".ply,.las,.obj,.glb"
              className={`${input} mt-1`}
              onChange={(e) => setScan(e.target.files?.[0] ?? null)}
            />
            <span className="mt-1 block font-normal text-[#5b5f66]">
              LiDAR plus photogrammetry scan. Accepted: .ply, .las, .obj, .glb.
              {scan ? ` Picked: ${scan.name} (${formatBytes(scan.size)}).` : ""}
            </span>
          </label>

          {error && <p className="rounded-xl bg-[#fee2e2] p-4 text-[#991b1b]">{error}</p>}

          <div>
            <button type="submit" className="rounded-full bg-[#1d4ed8] px-6 py-3 text-base font-medium text-white hover:bg-[#1e40af]">
              {phase === "rejected" ? "Try the upload again" : "Start the workflow"}
            </button>
            <p className="mt-3 text-sm text-[#5b5f66]">
              Capture spec: MP4, H.264, 1920 by 1080, 30 fps, no audio, chest
              mount 1.35 m, 10 degrees down, scan LiDAR plus photogrammetry.
              File names follow pack_place_task_take_rgb.mp4.
            </p>
          </div>
        </form>
      ) : null}

      {reject && (
        <div className="mt-8 rounded-3xl border border-[#fecaca] bg-[#fef2f2] p-6" role="alert">
          <p className="text-xl font-medium text-[#991b1b]">This upload was rejected. Your files are kept.</p>
          <p className="mt-2 text-lg leading-8">{reject.rule.plainReason}</p>
          <p className="mt-2 leading-7 text-[#5b5f66]">{reject.detail}</p>
          <p className="mt-4 font-medium">What to fix</p>
          <p className="mt-1 leading-7">{reject.rule.fix}</p>
          <p className="mt-4 font-medium">What to reshoot</p>
          <p className="mt-1 leading-7">{reject.rule.reshoot} Then upload again. The full check runs again from the start.</p>
          <p className="mt-4 text-sm text-[#5b5f66]">
            Reject line {reject.rule.id} of 8: {reject.rule.name}. Nothing ships
            from a rejected upload. No partial pack is built.
          </p>
          <button type="button" onClick={reset} className="mt-4 rounded-full bg-white px-4 py-2 text-sm font-medium ring-1 ring-black/10">
            Pick a new file
          </button>
        </div>
      )}

      {(phase === "running" || phase === "waiting" || phase === "done") && (
        <div className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-medium tracking-tight">
                {taskName} in {placeName}
              </h2>
              <p className="mt-1 text-sm text-[#5b5f66]">
                {video ? `${video.name} (${formatBytes(video.size)})` : ""}{" "}
                {scan ? `Scan: ${scan.name} (${formatBytes(scan.size)})` : "No scan file picked."}{" "}
                {startedAt ? `Started ${startedAt}.` : ""}
              </p>
            </div>
            <p className="font-mono text-sm">{doneCount} of 24 steps done</p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e5e7eb]" aria-label="Workflow progress">
            <div className="h-full bg-[#1d4ed8] transition-all" style={{ width: `${(doneCount / 24) * 100}%` }} />
          </div>
          <p className="mt-2 text-sm text-[#5b5f66]">
            {phase === "done"
              ? "Done. Your pack is ready in this demo."
              : `About ${minutesLeft} min left, target time, not measured. ${activePhase ? `Now in phase ${activePhase.id}: ${activePhase.title}.` : ""}`}
          </p>

          {waitingStep && (
            <div className="mt-6 rounded-2xl border border-[#fed7aa] bg-[#fff7ed] p-5">
              <p className="text-xl font-medium">Your turn: step {waitingStep.id}, {waitingStep.title}</p>
              <p className="mt-1 leading-7 text-[#5b5f66]">{waitingStep.plain}</p>
              {waitingStep.id === 13 && <SimWorldCheck />}
              {waitingStep.id === 17 && <SuccessTestCheck />}
              <p className="mt-2 text-sm text-[#5b5f66]">Take a look, then tap below to keep going. Nothing moves past this step until you say so.</p>
              <button type="button" onClick={approveCurrent} className="mt-4 rounded-full bg-[#1d4ed8] px-6 py-3 text-base font-medium text-white hover:bg-[#1e40af]">
                Approve and continue
              </button>
            </div>
          )}

          {phase === "done" && (
            <div className="mt-6 rounded-2xl bg-[#dcfce7] p-6">
              <p className="text-xl font-medium">Done: all 24 steps shown.</p>
              <p className="mt-2 leading-7 text-[#5b5f66]">
                This is a demo of the workflow order only. No sim run happened,
                no eval ran, and no pack folder was built. The next build step
                is the real MuJoCo, Genesis, and eval runs.
              </p>
              <button type="button" onClick={reset} className="mt-4 rounded-full bg-white px-4 py-2 text-sm font-medium ring-1 ring-black/10">
                Upload another capture
              </button>
            </div>
          )}

          {PHASES.map((p) => (
            <div key={p.id} className="mt-8">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-lg font-medium">Phase {p.id}: {p.title}</h3>
                <p className="font-mono text-xs text-[#5b5f66]">
                  {p.steps.filter((id) => states[id - 1] === "done").length} of {p.steps.length} done
                </p>
              </div>
              <p className="mt-0.5 text-sm leading-6 text-[#5b5f66]">{p.plain}</p>
              <ol className="mt-3 space-y-2">
                {p.steps.map((id) => {
                  const step: WorkflowStep = WORKFLOW_STEPS[id - 1];
                  const i = id - 1;
                  const isCurrent = current === i && phase !== "done";
                  return (
                    <li
                      key={step.id}
                      className={`flex items-start gap-3 rounded-2xl border bg-white p-4 ${isCurrent ? "border-[#1d4ed8] ring-2 ring-[#dbeafe]" : "border-[#e5e7eb]"}`}
                    >
                      <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${states[i] === "done" ? "bg-[#dcfce7] text-[#166534]" : states[i] === "needs you" ? "bg-[#ffedd5] text-[#9a3412]" : states[i] === "running" ? "bg-[#dbeafe] text-[#1d4ed8]" : states[i] === "failed" ? "bg-[#fee2e2] text-[#991b1b]" : "bg-[#f6f7f9] text-[#5b5f66]"}`}>
                        <StepIconMark icon={STEP_ICONS[step.id]} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">
                          <span className="mr-2 font-mono text-sm text-[#5b5f66]">{String(step.id).padStart(2, "0")}</span>
                          {step.title}
                        </p>
                        <p className="mt-0.5 text-sm leading-6 text-[#5b5f66]">{step.plain}</p>
                        <p className="mt-1 font-mono text-xs text-[#5b5f66]">
                          Owner: {step.owner} | Target: {step.targetMinutes === 0 ? "as needed" : `${step.targetMinutes} min`} ({step.targetNote}, illustrative)
                        </p>
                        {step.id === 13 && states[i] !== "queued" && <SimWorldCheck />}
                        {step.id === 17 && states[i] !== "queued" && <SuccessTestCheck />}
                      </div>
                      <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${STATE_STYLE[states[i]]}`}>
                        {STATE_LABEL[states[i]]}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}

          <div className="mt-8 rounded-2xl border border-[#e5e7eb] p-5">
            <p className="font-medium">The 8 reject lines</p>
            <p className="mt-1 text-sm leading-6 text-[#5b5f66]">
              A take passes only when it clears every line. A fail stops the
              workflow, keeps your files, and tells you what to fix.
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-6">
              {REJECT_RULES.map((r) => (
                <li key={r.id}>
                  <strong>{r.id}. {r.name}:</strong> {r.plainReason} {r.fix}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-[#5b5f66]">
              Demo note: name a test file blurry, shaky, dark, hole, scale,
              missing, wrong, or broken to see that reject line here. A real
              check reads the video frames, which this demo does not do.
            </p>
          </div>
        </div>
      )}

      <p className="mt-8 text-sm text-[#5b5f66]">
        <a href="/" className="underline">Back to WorldLoop home</a>
        {" | "}Admin only. The pilot form on the public site is separate: it
        collects a pilot request, saves it in the browser, and sends nothing.
      </p>
    </div>
  );
}
