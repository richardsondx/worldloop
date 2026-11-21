"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

// Hero scene: two carbon robotic hands fold a cloth on a table, in a loop.
// Built with plain Three.js so the install stays small. No stock image.
// If WebGL is off, the parent shows a static SVG still instead.
export default function HeroScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(true);
  const playingRef = useRef(true);
  // Start mid-fold, so the first paint already shows the fold in progress,
  // and so a reduced-motion still is a composed mid-fold frame, not a flat mat.
  const progressRef = useRef(0.45);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setFailed(true);
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 4.3, 8.4);
    camera.lookAt(0, 0.45, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(4, 7, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.02;
    scene.add(key);
    const rim = new THREE.PointLight(0x1d4ed8, 30, 20);
    rim.position.set(-5, 3, -3);
    scene.add(rim);
    const warm = new THREE.PointLight(0xea580c, 8, 12);
    warm.position.set(4, 1.5, -2);
    scene.add(warm);

    // Table
    const table = new THREE.Mesh(
      new THREE.BoxGeometry(9, 0.35, 6),
      new THREE.MeshStandardMaterial({ color: 0xeef0f3, roughness: 0.9, metalness: 0 })
    );
    table.position.y = -0.18;
    table.receiveShadow = true;
    scene.add(table);

    // Cloth: a plane whose right half folds over the left half, then settles.
    const clothGeo = new THREE.PlaneGeometry(4.2, 2.8, 34, 22);
    clothGeo.rotateX(-Math.PI / 2);
    const clothMat = new THREE.MeshStandardMaterial({
      color: 0xdfe6ff,
      roughness: 0.95,
      metalness: 0,
      side: THREE.DoubleSide,
    });
    const cloth = new THREE.Mesh(clothGeo, clothMat);
    cloth.position.set(0, 0.06, 0);
    cloth.castShadow = true;
    cloth.receiveShadow = true;
    scene.add(cloth);
    // Loop blue edge strip on the cloth's right edge, so the fold reads on
    // camera. It follows the fold: its position and tilt track the fold angle.
    const edge = new THREE.Mesh(
      new THREE.BoxGeometry(0.09, 0.03, 2.8),
      new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.6 })
    );
    edge.position.set(2.1, 0.08, 0);
    scene.add(edge);
    const basePos = clothGeo.attributes.position.array.slice();

    // Carbon hand builder: palm plus four three segment fingers plus a thumb.
    const carbon = new THREE.MeshStandardMaterial({
      color: 0x17191d,
      roughness: 0.32,
      metalness: 0.75,
    });
    const joint = new THREE.MeshStandardMaterial({
      color: 0x2b2f36,
      roughness: 0.4,
      metalness: 0.6,
    });
    const accent = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      roughness: 0.4,
      metalness: 0.4,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.35,
    });

    function buildHand(mirror: boolean): { group: THREE.Group; fingers: THREE.Group[] } {
      const group = new THREE.Group();
      const palm = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.28, 1.05), carbon);
      palm.castShadow = true;
      group.add(palm);
      const wrist = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.34, 0.7), joint);
      wrist.position.set(0, 0.02, mirror ? 0.85 : -0.85);
      wrist.castShadow = true;
      group.add(wrist);
      const band = new THREE.Mesh(new THREE.BoxGeometry(0.87, 0.06, 0.2), accent);
      band.position.set(0, 0.15, mirror ? 0.55 : -0.55);
      group.add(band);
      const fingers: THREE.Group[] = [];
      const offsets = [-0.33, -0.11, 0.11, 0.33];
      const lengths = [0.42, 0.5, 0.48, 0.38];
      offsets.forEach((x, i) => {
        const finger = new THREE.Group();
        finger.position.set(x, -0.02, mirror ? -0.55 : 0.55);
        let parent: THREE.Object3D = finger;
        let z = 0;
        for (let s = 0; s < 3; s++) {
          const len = lengths[i] * (s === 0 ? 0.45 : s === 1 ? 0.35 : 0.2);
          // Capsule segments that overlap, so a finger reads as one finger,
          // not as scattered cubes.
          const seg = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, len, 4, 10), s === 1 ? joint : carbon);
          seg.rotation.x = Math.PI / 2;
          seg.position.z = (mirror ? -1 : 1) * (z + len * 0.45);
          seg.castShadow = true;
          parent.add(seg);
          const pivot = new THREE.Group();
          pivot.position.z = (mirror ? -1 : 1) * (z + len * 0.85);
          parent.add(pivot);
          parent = pivot;
          z += len * 0.85;
        }
        group.add(finger);
        fingers.push(finger);
      });
      // Thumb, two segments, on the inner side.
      const thumb = new THREE.Group();
      thumb.position.set(mirror ? 0.48 : -0.48, 0, 0.1);
      thumb.rotation.x = 0.55;
      const t1 = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.4), carbon);
      t1.position.set(mirror ? 0.14 : -0.14, 0, 0.15);
      t1.rotation.y = mirror ? -0.6 : 0.6;
      thumb.add(t1);
      group.add(thumb);
      return { group, fingers };
    }

    const left = buildHand(false);
    // Both hands point their fingers toward the camera (+z), so the fingers
    // read on camera. A hand pointing away shows only the back of its palm.
    const right = buildHand(false);
    left.group.scale.setScalar(0.85);
    right.group.scale.setScalar(0.85);
    left.group.position.set(-0.9, 0.85, 0.4);
    left.group.rotation.set(0.5, 0.25, 0);
    right.group.position.set(1.15, 0.85, -0.3);
    right.group.rotation.set(0.5, -0.35, 0);
    scene.add(left.group);
    scene.add(right.group);

    // Folded stack that appears as the fold completes: a small pile.
    const stack = new THREE.Mesh(
      new THREE.BoxGeometry(2.1, 0.22, 1.4),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.95 })
    );
    stack.position.set(-1.05, 0.17, 0);
    stack.castShadow = true;
    stack.visible = false;
    scene.add(stack);

    const clock = { last: performance.now(), getDelta() { const now = performance.now(); const d = (now - this.last) / 1000; this.last = now; return d; } };
    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver((entries) => {
      visible = entries[0]?.isIntersecting ?? true;
    });
    io.observe(mount);
    let mouseX = 0;
    let mouseY = 0;
    const onMove = (e: PointerEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 0.6;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 0.3;
    };
    window.addEventListener("pointermove", onMove);

    const resize = () => {
      const w = mount.clientWidth || 800;
      const h = mount.clientHeight || 500;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    const smooth = (x: number) => x * x * (3 - 2 * x);

    const animate = () => {
      raf = requestAnimationFrame(animate);
      if (!visible) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      if (playingRef.current && !reduced) {
        progressRef.current = (progressRef.current + dt / 9) % 1;
      }
      const t = progressRef.current;
      // Fold angle: flat, then fold, then hold, then reset.
      let fold = 0;
      if (t < 0.3) fold = 0;
      else if (t < 0.62) fold = smooth((t - 0.3) / 0.32) * Math.PI;
      else if (t < 0.86) fold = Math.PI;
      else fold = Math.PI * (1 - smooth((t - 0.86) / 0.14));

      // Cloth vertices: right half rotates around the fold line at x = 0.
      const pos = clothGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const bx = basePos[i * 3];
        const bz = basePos[i * 3 + 2];
        let x = bx;
        let y = 0;
        if (bx > 0) {
          const a = fold;
          x = bx * Math.cos(a);
          y = bx * Math.sin(a) + 0.02;
          // When the fold is complete, the folded half rests on top of the
          // left half, not inside it, so the doubled cloth reads on camera.
          if (fold > 2.5) y += 0.06 * smooth((fold - 2.5) / 0.64);
        }
        // Gentle breathing wave, kept tiny so the cloth reads flat.
        y += Math.sin(bx * 2.2 + t * 12) * 0.002 * (bx > 0 ? 1 - fold / Math.PI : 0.4);
        pos.setXYZ(i, x, y, bz);
      }
      pos.needsUpdate = true;
      clothGeo.computeVertexNormals();
      // The blue edge strip rides the folding edge.
      edge.position.set(2.1 * Math.cos(fold), 0.08 + 2.1 * Math.sin(fold), 0);
      edge.rotation.z = -fold;
      edge.visible = true;
      stack.visible = fold > 2.9;

      // Hands follow the fold. Right hand lifts the edge, left hand holds.
      const lift = Math.sin(fold / 2);
      right.group.position.set(1.15 - lift * 1.5, 0.85 + lift * 0.5, -0.3 + lift * 0.25);
      right.group.rotation.x = 0.5 + lift * 0.25;
      left.group.position.set(-0.9, 0.85 + lift * 0.12, 0.4);
      const curl = 0.12 + lift * 0.5;
      right.fingers.forEach((f, i) => {
        f.rotation.x = (i === 1 ? curl * 1.2 : curl) * (1 + 0.1 * Math.sin(t * 10 + i));
      });
      left.fingers.forEach((f) => {
        f.rotation.x = 0.22;
      });

      camera.position.x += (mouseX - camera.position.x * 0.12) * 0.02;
      camera.position.y += (4.3 + mouseY - camera.position.y) * 0.02;
      camera.lookAt(0, 0.45, 0);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      ro.disconnect();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
      clothGeo.dispose();
    };
  }, []);

  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#f6f7f9] p-8 text-center">
        <p className="max-w-sm text-sm text-[#5b5f66]">
          Your browser has WebGL off, so the live fold is paused here. The still
          below shows the same moment: two carbon hands, one cloth, one fold.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div ref={mountRef} className="h-full w-full [&>canvas]:h-full [&>canvas]:w-full" aria-label="3D animation of two carbon robotic hands folding a cloth on a table" role="img" />
      <div className="absolute bottom-4 left-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          className="rounded-full bg-white px-4 py-2 text-sm font-medium text-[#0b0b0c] shadow ring-1 ring-black/10 hover:bg-[#f6f7f9]"
        >
          {playing ? "Pause the fold" : "Play the fold"}
        </button>
        <span className="rounded-full bg-black/70 px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-white">
          Live sim, not a video
        </span>
      </div>
    </div>
  );
}
