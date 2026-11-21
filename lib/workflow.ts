// WorldLoop upload workflow, local demo logic.
// Source: workflow-spec.md in workspace/handover-worldloop-upload-workflow-2026-11-21/
// (24 steps, 8 reject lines, file layout from research-report-v2.md section 3).
// Roles: Gemini 4 Neon is the workflow logic role, Opus 5.5 is the UI/UX role.
// Both are role proxies, labeled as such. Live OpenRouter calls are blocked
// until Dec 1, 2026, budget spent, remaining -$0.107. No live call ran here.
// This file runs in the browser only. Nothing is sent, no server runs the
// workflow, and no MuJoCo, Genesis, or eval run happens in this demo. The
// steps below are a local demo of the workflow order, with the real sim and
// eval runs as the next build step, not claimed as done.

export type StepOwner = "You" | "Automatic";
export type StepState = "queued" | "running" | "done" | "needs you" | "failed";

export type WorkflowStep = {
  id: number;
  title: string;
  plain: string;
  owner: StepOwner;
  targetMinutes: number;
  targetNote: string;
};

export const WORKFLOW_STEPS: WorkflowStep[] = [
  { id: 1, title: "Choose the task", plain: "Pick one task a robot keeps failing, in one room, with one set of objects.", owner: "You", targetMinutes: 10, targetNote: "Before filming" },
  { id: 2, title: "Film clean takes", plain: "Film a person doing the task right, 10 clean takes, same start each time.", owner: "You", targetMinutes: 30, targetNote: "Before upload" },
  { id: 3, title: "Scan the room and objects", plain: "Walk the room slowly, scan with LiDAR plus photogrammetry, measure 3 lengths with a tape.", owner: "You", targetMinutes: 10, targetNote: "Before upload" },
  { id: 4, title: "Upload video plus scan", plain: "Upload one video and the scan files, for one task in one place.", owner: "You", targetMinutes: 5, targetNote: "Starts at 9:00, target" },
  { id: 5, title: "Ingest", plain: "Check the files arrived complete, name them to the pack rule, store them in the pack folder.", owner: "Automatic", targetMinutes: 2, targetNote: "Target" },
  { id: 6, title: "Validation and quality check", plain: "Run all 8 reject lines against the video and the scan.", owner: "Automatic", targetMinutes: 3, targetNote: "Done by 9:05, target" },
  { id: 7, title: "Bad upload path", plain: "Only runs when a check fails. Stop, keep the files, show the plain reason, reshoot only the failed part.", owner: "You", targetMinutes: 0, targetNote: "Only on reject, time as needed" },
  { id: 8, title: "Split into timed steps", plain: "Split the clean take into timed steps: reach, grasp, lift, move, place, release.", owner: "Automatic", targetMinutes: 5, targetNote: "Target" },
  { id: 9, title: "Object extraction", plain: "Cut out each task object from the scan and the video frames.", owner: "Automatic", targetMinutes: 5, targetNote: "Target" },
  { id: 10, title: "Scan to mesh", plain: "Build the visual mesh and the collision mesh from the scan.", owner: "Automatic", targetMinutes: 10, targetNote: "Target" },
  { id: 11, title: "Mesh scale check", plain: "Check the 3 tape lengths against the mesh. Fail if any is off by more than 2 cm on a 1 m length.", owner: "Automatic", targetMinutes: 2, targetNote: "Target" },
  { id: 12, title: "Sim world build in MuJoCo", plain: "Build the sim scene in MuJoCo first, with a library robot arm.", owner: "Automatic", targetMinutes: 10, targetNote: "Done by 9:30, target" },
  { id: 13, title: "Your check of the first sim world", plain: "Open the MuJoCo world and check it matches the real place.", owner: "You", targetMinutes: 5, targetNote: "Human check" },
  { id: 14, title: "Genesis port", plain: "Port the MuJoCo scene to Genesis. If the port fails, ship MuJoCo only for the first pack.", owner: "Automatic", targetMinutes: 10, targetNote: "Target" },
  { id: 15, title: "Variation generation", plain: "Make 100 variations of the task from the one room, each with a fixed seed number.", owner: "Automatic", targetMinutes: 15, targetNote: "Done by 10:00, target" },
  { id: 16, title: "Success test in code", plain: "Write the success test before any model runs. It must decide alone, with no human watching.", owner: "Automatic", targetMinutes: 5, targetNote: "Target" },
  { id: 17, title: "Your check of the success test", plain: "Read the success test and the forced pass and forced fail results, then approve or send back.", owner: "You", targetMinutes: 5, targetNote: "Human check" },
  { id: 18, title: "Eval run", plain: "Run an open model in inference only, 20 runs per task per variation set. No training.", owner: "Automatic", targetMinutes: 30, targetNote: "Runs while you film the next task, target" },
  { id: 19, title: "Failure clip cutting", plain: "Save every run. Cut a short clip for each failure, labeled with seed, variation, and stage.", owner: "Automatic", targetMinutes: 10, targetNote: "Target" },
  { id: 20, title: "Eval report draft", plain: "Draft the eval report from the run data only. No claim without a run and a clip behind it.", owner: "Automatic", targetMinutes: 5, targetNote: "Target" },
  { id: 21, title: "Your check of the first eval report", plain: "Read page 1, watch the top failure clips, approve or send back before it goes to any lab.", owner: "You", targetMinutes: 10, targetNote: "Human check" },
  { id: 22, title: "Packaging", plain: "Build the pack folder. Test it cold: a stranger follows only the README and gets a score.", owner: "Automatic", targetMinutes: 5, targetNote: "Target" },
  { id: 23, title: "Delivery", plain: "The pack folder is ready on disk. No lab contact and no send happen in this run.", owner: "Automatic", targetMinutes: 2, targetNote: "Pack ready by lunch, target" },
  { id: 24, title: "Failure loop", plain: "Turn the top failure into the next test. You approve the next test before it is built.", owner: "You", targetMinutes: 10, targetNote: "Human approve" },
];

// Human steps that pause the local demo and wait for Richardson.
export const HUMAN_CHECK_STEPS = [13, 17, 21, 24];
// Steps done before upload, marked done as soon as a valid upload starts.
export const PRE_UPLOAD_STEPS = [1, 2, 3];

// One small icon per step, used by the upload page so each step has a
// picture, not just a number. Names only, the SVG paths live in UploadFlow.
export type StepIcon =
  | "task" | "film" | "scan" | "upload" | "ingest" | "check" | "reject"
  | "split" | "object" | "mesh" | "scale" | "world" | "eye" | "port"
  | "vary" | "test" | "eval" | "clip" | "report" | "pack" | "deliver" | "loop";

export const STEP_ICONS: Record<number, StepIcon> = {
  1: "task", 2: "film", 3: "scan", 4: "upload", 5: "ingest", 6: "check",
  7: "reject", 8: "split", 9: "object", 10: "mesh", 11: "scale",
  12: "world", 13: "eye", 14: "port", 15: "vary", 16: "test",
  17: "eye", 18: "eval", 19: "clip", 20: "report", 21: "eye",
  22: "pack", 23: "deliver", 24: "loop",
};

// The 24 steps in 5 phases, so the page can show where you are at a glance.
export type WorkflowPhase = {
  id: number;
  title: string;
  plain: string;
  steps: number[];
};

export const PHASES: WorkflowPhase[] = [
  { id: 1, title: "Film it", plain: "Pick a task, film 10 clean takes, scan the room.", steps: [1, 2, 3] },
  { id: 2, title: "Upload it", plain: "Upload once. The check runs, and a bad take is sent back plainly.", steps: [4, 5, 6, 7] },
  { id: 3, title: "Build the world", plain: "The scan becomes a sim world a robot arm can work in.", steps: [8, 9, 10, 11, 12] },
  { id: 4, title: "Check it, then vary it", plain: "You check the world and the test, then it makes 100 variations.", steps: [13, 14, 15, 16, 17] },
  { id: 5, title: "Test it and pack it", plain: "The model runs, failures are clipped, and the pack is ready.", steps: [18, 19, 20, 21, 22, 23, 24] },
];

export function phaseForStep(stepId: number): WorkflowPhase {
  return PHASES.find((p) => p.steps.includes(stepId)) as WorkflowPhase;
}

export type RejectRule = {
  id: number;
  name: string;
  plainReason: string;
  fix: string;
  reshoot: string;
  demoTrigger: string;
};

export const REJECT_RULES: RejectRule[] = [
  { id: 1, name: "Blur", plainReason: "The video is too blurry to see the task object.", fix: "Reshoot the take with the phone steady and the object in focus.", reshoot: "Reshoot the take.", demoTrigger: "file name contains blurry" },
  { id: 2, name: "Shake", plainReason: "The video shakes too much to track the work surface.", fix: "Reshoot with the phone on the chest mount or a fixed mount, stabilization on.", reshoot: "Reshoot the take.", demoTrigger: "file name contains shaky" },
  { id: 3, name: "Exposure", plainReason: "The task object is washed out or too dark to see.", fix: "Reshoot with the light fixed, no direct sun patch on the work surface, exposure locked on the first frame.", reshoot: "Reshoot the take.", demoTrigger: "file name contains dark or washed" },
  { id: 4, name: "Coverage gap", plainReason: "The scan has a hole in the task area.", fix: "Rescan the gap area, walking slow with half overlap on each pass.", reshoot: "Rescan the gap area.", demoTrigger: "file name contains hole" },
  { id: 5, name: "Scale error", plainReason: "The scan size does not match the tape measure.", fix: "Re-measure the 3 lengths, rescan, and check the mesh against the tape again.", reshoot: "Rescan the room.", demoTrigger: "file name contains scale" },
  { id: 6, name: "Missing object", plainReason: "The task object is missing from the scan.", fix: "Scan the object on its own, on a plain surface, with 3 full turns around it, then rescan the room.", reshoot: "Rescan the object and the room.", demoTrigger: "file name contains missing" },
  { id: 7, name: "Wrong file", plainReason: "The file is the wrong size, speed, or type.", fix: "Re-export the video at 1920 by 1080, 30 fps, no audio, and re-export the mesh triangulated.", reshoot: "Re-export, or reshoot if the take itself is wrong.", demoTrigger: "wrong file type, or file name contains wrong" },
  { id: 8, name: "Mesh will not open", plainReason: "The scan file will not open in the simulator.", fix: "Fix the mesh export, simplify the collision mesh, and try the MuJoCo load command again. If it still fails, shrink the place to one counter and rebuild.", reshoot: "Rebuild the mesh, or rescan a smaller place.", demoTrigger: "file name contains broken" },
];

// Demo upload limit, labeled as a demo limit, not a spec limit. The spec
// sets no file size limit. 2 GB covers a 120 second take at the capture spec.
export const DEMO_MAX_BYTES = 2 * 1024 * 1024 * 1024;
export const DEMO_MAX_LABEL = "2 GB (demo limit)";

export type RejectResult = { ok: false; rule: RejectRule; detail: string };
export type ValidateResult = { ok: true } | RejectResult;

const byId = (id: number) => REJECT_RULES.find((r) => r.id === id) as RejectRule;

function demoTriggerRule(name: string): RejectRule | null {
  const n = name.toLowerCase();
  if (n.includes("blurry")) return byId(1);
  if (n.includes("shaky")) return byId(2);
  if (n.includes("dark") || n.includes("washed")) return byId(3);
  if (n.includes("hole")) return byId(4);
  if (n.includes("scale")) return byId(5);
  if (n.includes("missing")) return byId(6);
  if (n.includes("wrong")) return byId(7);
  if (n.includes("broken")) return byId(8);
  return null;
}

export function validateUpload(video: File | null, scan: File | null): ValidateResult {
  if (!video) {
    return { ok: false, rule: byId(7), detail: "No video file was picked. Pick one MP4 video file to start." };
  }
  if (video.size === 0) {
    return { ok: false, rule: byId(7), detail: "The video file is empty (0 bytes). Pick the real take file." };
  }
  const name = video.name.toLowerCase();
  if (!name.endsWith(".mp4")) {
    return { ok: false, rule: byId(7), detail: `File type is not MP4. Got: ${video.name}. Pick an MP4 file.` };
  }
  if (video.size > DEMO_MAX_BYTES) {
    return { ok: false, rule: byId(7), detail: `File is over the ${DEMO_MAX_LABEL} demo limit. Split the take or pick a shorter take.` };
  }
  const trigger = demoTriggerRule(video.name);
  if (trigger) {
    return { ok: false, rule: trigger, detail: `Demo check: the file name marks this take as a ${trigger.name.toLowerCase()} case, so the quality check rejects it here. A real check reads the video frames, which this demo does not do.` };
  }
  if (scan) {
    const s = scan.name.toLowerCase();
    if (scan.size === 0) {
      return { ok: false, rule: byId(8), detail: "The scan file is empty (0 bytes). Pick the real scan file." };
    }
    if (!(s.endsWith(".ply") || s.endsWith(".las") || s.endsWith(".obj") || s.endsWith(".glb"))) {
      return { ok: false, rule: byId(8), detail: `Scan type is not accepted. Got: ${scan.name}. Use .ply, .las, .obj, or .glb.` };
    }
    const scanTrigger = demoTriggerRule(scan.name);
    if (scanTrigger) {
      return { ok: false, rule: scanTrigger, detail: `Demo check: the scan file name marks this scan as a ${scanTrigger.name.toLowerCase()} case, so the quality check rejects it here.` };
    }
  }
  return { ok: true };
}

// Demo pacing: each automatic step takes about 1.2 seconds on screen.
// This is demo pacing only, not a measured step time. Real target times
// are the targetMinutes on each step, labeled illustrative in the spec.
export const DEMO_STEP_MS = 1200;

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} bytes`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
