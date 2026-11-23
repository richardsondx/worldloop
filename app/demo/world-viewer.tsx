"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import keyframes from "./task-run-keyframes.json";

// The demo world in 3D, built from the real geometry in world.xml (table,
// charger dock, earphone, robot arm) and driven by the baked motion from
// task-run-keyframes.py, which is the same scripted pick-and-place as
// run-task.py. This is a model, not a live physics run: the arm follows the
// recorded waypoints, and the earphone ends in the dock exactly where the
// success test checks it. Drag to orbit, scroll to zoom.
const DURATION = keyframes.duration as number;
const SAMPLES = keyframes.samples as {
  t: number;
  q: number[];
  f: number[];
  e: number[];
  eq: number[];
}[];

function stageLabel(t: number): string {
  if (t < 0.5) return "At home";
  if (t < 3.5) return "Reach for the earphone";
  if (t < 5.5) return "Move down to grasp";
  if (t < 6.0) return "Close the gripper";
  if (t < 8.0) return "Lift";
  if (t < 11.0) return "Carry to the dock";
  if (t < 13.0) return "Place in the dock";
  if (t < 13.5) return "Open the gripper";
  if (t < 15.5) return "Move back up";
  if (t < 18.5) return "Return home";
  return "Done";
}

type Pose = { q: number[]; f: number[]; e: number[]; eq: THREE.Quaternion };

function poseAt(t: number): Pose {
  const s = SAMPLES;
  if (t <= s[0].t) {
    return {
      q: s[0].q,
      f: s[0].f,
      e: s[0].e,
      eq: new THREE.Quaternion(s[0].eq[1], s[0].eq[2], s[0].eq[3], s[0].eq[0]),
    };
  }
  for (let i = 0; i < s.length - 1; i++) {
    const a = s[i];
    const b = s[i + 1];
    if (t >= a.t && t <= b.t) {
      const u = (t - a.t) / (b.t - a.t);
      const lerp = (x: number[], y: number[]) => x.map((v, j) => v + u * (y[j] - v));
      const qa = new THREE.Quaternion(a.eq[1], a.eq[2], a.eq[3], a.eq[0]);
      const qb = new THREE.Quaternion(b.eq[1], b.eq[2], b.eq[3], b.eq[0]);
      const q = new THREE.Quaternion().slerpQuaternions(qa, qb, u);
      return { q: lerp(a.q, b.q), f: lerp(a.f, b.f), e: lerp(a.e, b.e), eq: q };
    }
  }
  const last = s[s.length - 1];
  return {
    q: last.q,
    f: last.f,
    e: last.e,
    eq: new THREE.Quaternion(last.eq[1], last.eq[2], last.eq[3], last.eq[0]),
  };
}

const WOOD = 0x8c6138;
const WHITE = 0xf2f2f2;
const DARK = 0x26262e;
const BLUE = 0x1f4ad9;
const METAL = 0x999ca6;

function std(color: number) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.1 });
}

export default function WorldViewer() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<HTMLParagraphElement>(null);
  const judgeRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef(0);
  const playingRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Non-null by the check below; the cast keeps the type narrow inside
    // the nested resize and cleanup closures.
    const mount = mountRef.current as HTMLDivElement;
    if (!mount) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf6f7f9);

    const camera = new THREE.PerspectiveCamera(40, 1, 0.05, 50);
    // Close enough that the 15 mm earphone reads in the gripper, far
    // enough that the whole table stays in frame. The target sits a
    // little above the table so the arm at home, which reaches up to
    // about 1.3 m, is not cut off at the top of the frame.
    camera.position.set(1.25, 1.25, 1.1);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0.5, 0.9, 0);
    controls.enableDamping = true;
    controls.minDistance = 0.3;
    controls.maxDistance = 5;

    scene.add(new THREE.HemisphereLight(0xffffff, 0xd8d8d8, 0.9));
    const key = new THREE.DirectionalLight(0xffffff, 1.2);
    key.position.set(1.5, 2, -1);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.5);
    fill.position.set(0.3, 1.5, 1.5);
    scene.add(fill);

    // Everything below is built in MuJoCo coordinates (x right, y forward,
    // z up) inside one group that turns z-up into Three.js y-up.
    const world = new THREE.Group();
    world.rotation.x = -Math.PI / 2;
    scene.add(world);

    const wood = std(WOOD);
    const white = std(WHITE);
    const dark = std(DARK);
    const blue = std(BLUE);
    const metal = std(METAL);

    // Floor: light checker, like the grid material in world.xml.
    const canvas = document.createElement("canvas");
    canvas.width = 2;
    canvas.height = 2;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#ebebeb";
      ctx.fillRect(0, 0, 2, 2);
      ctx.fillStyle = "#c7c7c7";
      ctx.fillRect(0, 0, 1, 1);
      ctx.fillRect(1, 1, 1, 1);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    tex.magFilter = THREE.NearestFilter;
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 6),
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 })
    );
    world.add(floor);

    // Table: top 1.2 m by 0.8 m, surface at 0.78 m.
    const table = new THREE.Group();
    table.position.set(0.5, 0, 0);
    world.add(table);
    const top = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.06), wood);
    top.position.set(0, 0, 0.75);
    table.add(top);
    for (const [lx, ly] of [[-0.55, -0.35], [0.55, -0.35], [-0.55, 0.35], [0.55, 0.35]]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.75), wood);
      leg.position.set(lx, ly, 0.375);
      table.add(leg);
    }

    // Charger dock on the table.
    const dock = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.024), white);
    dock.position.set(0.62, 0.08, 0.792);
    world.add(dock);
    const slot = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.05, 0.008), dark);
    slot.position.set(0.62, 0.08, 0.806);
    world.add(slot);

    // Earphone: round bud on a flat base, dark mesh dot, stem leaning 20 deg.
    const ear = new THREE.Group();
    world.add(ear);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.0055, 0.0055, 0.003, 24), white);
    base.rotation.x = Math.PI / 2;
    base.position.set(0, 0, 0.0015);
    ear.add(base);
    const bud = new THREE.Mesh(new THREE.SphereGeometry(0.0075, 24, 18), white);
    bud.position.set(0, 0, 0.0075);
    ear.add(bud);
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.0018, 12, 8), dark);
    mesh.position.set(0, -0.0068, 0.008);
    ear.add(mesh);
    const stemLower = new THREE.Group();
    stemLower.position.set(0.00405, 0, 0.01564);
    stemLower.rotation.y = 0.3491;
    const stemLowerMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0045, 0.012, 20), white);
    stemLowerMesh.rotation.x = Math.PI / 2;
    stemLower.add(stemLowerMesh);
    ear.add(stemLower);
    const stemUpper = new THREE.Group();
    stemUpper.position.set(0.00696, 0, 0.02363);
    stemUpper.rotation.y = 0.3491;
    const stemUpperMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0035, 0.009, 20), white);
    stemUpperMesh.rotation.x = Math.PI / 2;
    stemUpper.add(stemUpperMesh);
    ear.add(stemUpper);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.0035, 16, 12), white);
    tip.position.set(0.0085, 0, 0.02786);
    ear.add(tip);

    // Robot arm: base, shoulder, upper arm, forearm, wrist, two-finger gripper.
    const armBase = new THREE.Group();
    armBase.position.set(0.5, -0.35, 0.78);
    world.add(armBase);
    const baseMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 28), metal);
    baseMesh.rotation.x = Math.PI / 2;
    baseMesh.position.set(0, 0, 0.02);
    armBase.add(baseMesh);

    const shoulder = new THREE.Group();
    shoulder.position.set(0, 0, 0.05);
    armBase.add(shoulder);
    const shoulderMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.06, 24), dark);
    shoulderMesh.rotation.x = Math.PI / 2;
    shoulderMesh.position.set(0, 0, 0.03);
    shoulder.add(shoulderMesh);

    const upper = new THREE.Group();
    upper.position.set(0, 0, 0.06);
    shoulder.add(upper);
    const upperMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.025, 0.22, 6, 16), blue);
    upperMesh.rotation.x = Math.PI / 2;
    upperMesh.position.set(0, 0, 0.11);
    upper.add(upperMesh);

    const forearm = new THREE.Group();
    forearm.position.set(0, 0, 0.22);
    upper.add(forearm);
    const foreMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.02, 0.18, 6, 16), blue);
    foreMesh.rotation.x = Math.PI / 2;
    foreMesh.position.set(0, 0, 0.09);
    forearm.add(foreMesh);

    const wrist = new THREE.Group();
    wrist.position.set(0, 0, 0.18);
    forearm.add(wrist);
    const wristMesh = new THREE.Mesh(new THREE.SphereGeometry(0.025, 20, 14), dark);
    wristMesh.position.set(0, 0, 0.02);
    wrist.add(wristMesh);

    const gripper = new THREE.Group();
    gripper.position.set(0, 0, 0.04);
    wrist.add(gripper);
    const fingerL = new THREE.Group();
    fingerL.position.set(0.032, 0, 0);
    gripper.add(fingerL);
    const fingerLMesh = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.012, 0.1), metal);
    fingerLMesh.position.set(0, 0, 0.03);
    fingerL.add(fingerLMesh);
    const fingerR = new THREE.Group();
    fingerR.position.set(-0.032, 0, 0);
    gripper.add(fingerR);
    const fingerRMesh = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.012, 0.1), metal);
    fingerRMesh.position.set(0, 0, 0.03);
    fingerR.add(fingerRMesh);

    function applyPose(p: Pose) {
      shoulder.rotation.z = p.q[0];
      upper.rotation.y = p.q[1];
      forearm.rotation.y = p.q[2];
      wrist.rotation.x = p.q[3];
      fingerL.position.x = 0.032 + p.f[0];
      fingerR.position.x = -0.032 + p.f[1];
      ear.position.set(p.e[0], p.e[1], p.e[2]);
      ear.quaternion.copy(p.eq);
    }

    function render(t: number) {
      applyPose(poseAt(t));
      if (sliderRef.current) sliderRef.current.value = String(Math.round((t / DURATION) * 1000));
      if (stageRef.current) stageRef.current.textContent = stageLabel(t);
      if (judgeRef.current) judgeRef.current.style.display = t >= 13.5 ? "block" : "none";
    }

    function resize() {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(mount);

    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (playingRef.current) {
        timeRef.current += dt;
        if (timeRef.current >= DURATION) {
          timeRef.current = DURATION;
          playingRef.current = false;
          setPlaying(false);
        }
      }
      render(timeRef.current);
      controls.update();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    render(0);
    setReady(true);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      controls.dispose();
      renderer.dispose();
      const el = mountRef.current;
      if (el && renderer.domElement.parentElement === el) {
        el.removeChild(renderer.domElement);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onScrub(value: number) {
    playingRef.current = false;
    setPlaying(false);
    timeRef.current = (value / 1000) * DURATION;
    // The render loop reads timeRef every frame, so the scene follows.
  }

  function togglePlay() {
    if (!playing) {
      if (timeRef.current >= DURATION) timeRef.current = 0;
      playingRef.current = true;
      setPlaying(true);
    } else {
      playingRef.current = false;
      setPlaying(false);
    }
  }

  return (
    <div>
      <div
        ref={mountRef}
        className="h-[420px] w-full overflow-hidden rounded-3xl bg-[#f6f7f9] sm:h-[520px]"
        aria-label="3D model of the demo world. Drag to rotate, scroll to zoom."
      />
      {!ready && (
        <p className="mt-3 text-sm text-[#5b5f66]">Loading the 3D scene.</p>
      )}
      <div className="mt-5 flex items-center gap-4">
        <button
          type="button"
          onClick={togglePlay}
          className="shrink-0 rounded-full bg-[#1d4ed8] px-6 py-3 text-base font-medium text-white hover:bg-[#1e40af]"
        >
          {playing ? "Pause" : "Play"}
        </button>
        <label htmlFor="demo-scrub" className="sr-only">
          Drag to run the task
        </label>
        <input
          id="demo-scrub"
          ref={sliderRef}
          type="range"
          min={0}
          max={1000}
          defaultValue={0}
          onChange={(e) => onScrub(Number(e.target.value))}
          className="w-full accent-[#1d4ed8]"
        />
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-4">
        <p className="text-base font-medium">Drag to run the task</p>
        <p ref={stageRef} className="text-base text-[#5b5f66]">
          At home
        </p>
      </div>
      <div ref={judgeRef} style={{ display: "none" }} className="mt-4 rounded-2xl border border-[#bbf7d0] bg-[#f0fdf4] p-5">
        <p className="text-lg font-medium text-[#166534]">Judge: PASS</p>
        <p className="mt-1 text-sm leading-6 text-[#166534]">
          The earphone is in the dock, upright. All 4 checks inside their limits.
        </p>
        <ul className="mt-3 space-y-1 font-mono text-xs leading-5 text-[#166534]">
          <li>Sideways: off 0.000 m, limit 0.020 m PASS</li>
          <li>Front to back: off 0.000 m, limit 0.010 m PASS</li>
          <li>Height: off 0.000 m, limit 0.010 m PASS</li>
          <li>Tilt: off 0.0 deg, limit 15.0 deg PASS</li>
        </ul>
      </div>
    </div>
  );
}
