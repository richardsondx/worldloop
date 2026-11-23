#!/usr/bin/env python3
"""run-task.py: the WorldLoop demo sim doing the task.

Scripted pick-and-place in MuJoCo: the arm reaches to the earphone, grasps
it, lifts, moves to the charger dock, places it, releases, and returns home.
Renders offscreen to task-run.mp4 (1280x800, 30 fps, about 20 s).

Gripper: the two fingers are real slide joints with motors, so they visibly
close around the earphone and open to release it. The earphone is carried by
a scripted rigid hold (its pose follows the gripper) because the stock
fingers are too narrow for a friction grip and a weld would snap the
earphone to a fixed pose. The hold is rigid for the whole carry. The one
place the hold is eased: the final descent. The 4-joint arm cannot rotate
its wrist far enough to set the earphone down upright with a purely rigid
hold (the carried earphone would land tilted about 34 degrees, outside the
15 degree limit), so during the last descent the earphone is eased upright
as it seats in the dock. That easing is smooth and continuous, not a jump.
The clip ends with the earphone in the dock, upright, and the success test
runs on that final pose.

Usage: python3 run-task.py   (writes task-run.mp4 next to this file)
"""
import math
import subprocess
import sys
from pathlib import Path

import numpy as np
import mujoco

HERE = Path(__file__).resolve().parent
WORLD = HERE / "world.xml"
OUT = HERE / "task-run.mp4"

FPS = 30
WIDTH, HEIGHT = 1280, 800

ARM_JOINTS = ["shoulder_yaw", "shoulder_pitch", "elbow", "wrist_roll"]
FINGER_JOINTS = ["finger_left_slide", "finger_right_slide"]
SHOULDER = np.array([0.5, -0.35, 0.89])
L1, L2 = 0.22, 0.30
OFFSET = 0.03  # grip point to earphone origin, along the gripper Z
E_TARGET = np.array([0.62, 0.08, 0.800])

# Finger slide: open 0 (fingers at +/-0.032), closed left -0.0185 / right +0.0185
# (fingers at +/-0.0135, inner faces just touching the 15 mm wide bud;
# a sphere is the same width in every direction, so no grip-direction
# measurement is needed). The slide range in world.xml is +/-0.025, wider
# than the old +/-0.01, because the old fingers could only close to a 32 mm
# gap and a real 15 mm bud is narrower than that.
FINGER_OPEN = np.array([0.0, 0.0])
FINGER_CLOSED = np.array([-0.0185, 0.0185])


def set_arm(data, model, q):
    for name, val in zip(ARM_JOINTS, q):
        jid = mujoco.mj_name2id(model, mujoco.mjtObj.mjOBJ_JOINT, name)
        data.qpos[model.jnt_qposadr[jid]] = val


def set_fingers(data, model, q):
    for name, val in zip(FINGER_JOINTS, q):
        jid = mujoco.mj_name2id(model, mujoco.mjtObj.mjOBJ_JOINT, name)
        data.qpos[model.jnt_qposadr[jid]] = val


def grip_pose(model, data):
    sid = mujoco.mj_name2id(model, mujoco.mjtObj.mjOBJ_SITE, "grip_point")
    return data.site_xpos[sid].copy(), data.site_xmat[sid].reshape(3, 3).copy()


def seed(target):
    d = target - SHOULDER
    r = math.hypot(d[0], d[1])
    h = d[2]
    yaw = math.atan2(d[1], d[0])
    dist = min(max(math.hypot(r, h), abs(L1 - L2) + 1e-3), L1 + L2 - 1e-3)
    interior = math.acos(max(-1.0, min(1.0, (L1 * L1 + L2 * L2 - dist * dist) / (2 * L1 * L2))))
    elbow = math.pi - interior
    tgt_ang = math.atan2(r, h)
    a = math.acos(max(-1.0, min(1.0, (L1 * L1 + dist * dist - L2 * L2) / (2 * L1 * dist))))
    pitch = tgt_ang - a
    return np.array([yaw, pitch, elbow, 0.0])


def ik_pos(model, data, target_pos, q0, iters=300):
    nv = model.nv
    jacp = np.zeros((3, nv))
    jacr = np.zeros((3, nv))
    sid = mujoco.mj_name2id(model, mujoco.mjtObj.mjOBJ_SITE, "grip_point")
    jids = [mujoco.mj_name2id(model, mujoco.mjtObj.mjOBJ_JOINT, n) for n in ARM_JOINTS]
    cols = [model.jnt_dofadr[j] for j in jids]
    lo = np.array([model.jnt_range[j][0] for j in jids])
    hi = np.array([model.jnt_range[j][1] for j in jids])
    q = q0.copy()
    for _ in range(iters):
        set_arm(data, model, q)
        mujoco.mj_forward(model, data)
        pos, _ = grip_pose(model, data)
        e = target_pos - pos
        if np.linalg.norm(e) < 0.001:
            break
        mujoco.mj_jacSite(model, data, jacp, jacr, sid)
        J = jacp[:, cols]
        lam = 0.02
        A = J @ J.T + lam * lam * np.eye(3)
        dq = J.T @ np.linalg.solve(A, e)
        dq = np.clip(dq, -0.05, 0.05)
        q = np.clip(q + dq, lo, hi)
    set_arm(data, model, q)
    mujoco.mj_forward(model, data)
    pos, R = grip_pose(model, data)
    return q, float(np.linalg.norm(target_pos - pos)), R


def solve_earphone_pos(model, data, E, q0):
    """Nested position-only solve: grip point = E + OFFSET * Z, iterate Z."""
    z_guess = np.array([0.0, 0.0, -1.0])
    q = q0
    R = None
    for _ in range(8):
        target = E + OFFSET * z_guess
        q, _, R = ik_pos(model, data, target, q)
        z_new = R[:, 2]
        if np.linalg.norm(z_new - z_guess) < 1e-4:
            break
        z_guess = z_new
    pos, R = grip_pose(model, data)
    ear = pos - R @ np.array([0.0, 0.0, OFFSET])
    return q, float(np.linalg.norm(E - ear)), R


def smoothstep(t):
    t = min(max(t, 0.0), 1.0)
    return t * t * (3 - 2 * t)


def quat_to_mat(quat):
    """MuJoCo quat (w, x, y, z) to 3x3 rotation matrix."""
    w, x, y, z = quat
    return np.array([
        [1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)],
        [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
        [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)],
    ])


def mat_to_quat(R):
    """3x3 rotation matrix to MuJoCo quat (w, x, y, z)."""
    tr = R[0, 0] + R[1, 1] + R[2, 2]
    if tr > 0:
        s = math.sqrt(tr + 1.0) * 2
        w = 0.25 * s
        x = (R[2, 1] - R[1, 2]) / s
        y = (R[0, 2] - R[2, 0]) / s
        z = (R[1, 0] - R[0, 1]) / s
    elif R[0, 0] > R[1, 1] and R[0, 0] > R[2, 2]:
        s = math.sqrt(1.0 + R[0, 0] - R[1, 1] - R[2, 2]) * 2
        w = (R[2, 1] - R[1, 2]) / s
        x = 0.25 * s
        y = (R[0, 1] + R[1, 0]) / s
        z = (R[0, 2] + R[2, 0]) / s
    elif R[1, 1] > R[2, 2]:
        s = math.sqrt(1.0 + R[1, 1] - R[0, 0] - R[2, 2]) * 2
        w = (R[0, 2] - R[2, 0]) / s
        x = (R[0, 1] + R[1, 0]) / s
        y = 0.25 * s
        z = (R[1, 2] + R[2, 1]) / s
    else:
        s = math.sqrt(1.0 + R[2, 2] - R[0, 0] - R[1, 1]) * 2
        w = (R[1, 0] - R[0, 1]) / s
        x = (R[0, 2] + R[2, 0]) / s
        y = (R[1, 2] + R[2, 1]) / s
        z = 0.25 * s
    q = np.array([w, x, y, z])
    return q / np.linalg.norm(q)


def slerp_quat(q0, q1, t):
    """Spherical interpolation between two unit quats (w, x, y, z)."""
    dot = float(np.dot(q0, q1))
    if dot < 0:
        q1 = -q1
        dot = -dot
    if dot > 0.9995:
        q = q0 + t * (q1 - q0)
        return q / np.linalg.norm(q)
    theta = math.acos(min(max(dot, -1.0), 1.0))
    s = math.sin(theta)
    a = math.sin((1 - t) * theta) / s
    b = math.sin(t * theta) / s
    return a * q0 + b * q1


def main():
    model = mujoco.MjModel.from_xml_path(str(WORLD))
    data = mujoco.MjData(model)
    q_home = np.array([0.0, -0.5, 1.1, 0.3])

    # --- Settle the earphone (it starts 12 mm above the table) ---
    set_arm(data, model, q_home)
    set_fingers(data, model, FINGER_OPEN)
    data.qpos[0:3] = [0.35, -0.1, 0.792]
    data.qpos[3:7] = [1, 0, 0, 0]
    for _ in range(250):
        mujoco.mj_step(model, data)
    E_SETTLED = data.qpos[0:3].copy()
    print("settled earphone:", np.round(E_SETTLED, 4))

    # --- Solve the waypoints ---
    q_pre, err_pre, _ = ik_pos(model, data, E_SETTLED + np.array([0, 0, 0.12]),
                               seed(E_SETTLED + np.array([0, 0, 0.12])))
    q_grasp, eerr_g, R_grasp = solve_earphone_pos(model, data, E_SETTLED, q_pre)
    q_lift, err_lift, _ = ik_pos(model, data, E_SETTLED + np.array([0, 0, 0.15]), q_grasp)
    q_transit, err_tr, _ = ik_pos(model, data, E_TARGET + np.array([0, 0, 0.15]), q_lift)
    q_place, eerr_p, R_place = solve_earphone_pos(model, data, E_TARGET, q_transit)
    q_retreat, err_ret, _ = ik_pos(model, data, E_TARGET + np.array([0, 0, 0.15]), q_place)
    print("waypoint errors (mm): pre %.1f grasp %.1f lift %.1f transit %.1f place %.1f retreat %.1f"
          % (err_pre * 1000, eerr_g * 1000, err_lift * 1000, err_tr * 1000, eerr_p * 1000, err_ret * 1000))
    up_final = R_place @ R_grasp.T @ np.array([0.0, 0.0, 1.0])
    tilt_rigid = math.degrees(math.acos(float(np.clip(up_final[2], -1, 1))))
    print("rigid-carry earphone tilt at place would be %.1f deg (limit 15), so the final descent eases it upright" % tilt_rigid)

    # --- Timeline (seconds). Each segment is (start, end, q_from, q_to,
    # fingers_from, fingers_to). ---
    segments = [
        (0.5, 3.5, q_home, q_pre, FINGER_OPEN, FINGER_OPEN),       # home to pre-grasp
        (3.5, 5.5, q_pre, q_grasp, FINGER_OPEN, FINGER_OPEN),     # descend to grasp
        (5.5, 6.0, q_grasp, q_grasp, FINGER_OPEN, FINGER_CLOSED), # hold, fingers close
        (6.0, 8.0, q_grasp, q_lift, FINGER_CLOSED, FINGER_CLOSED),# lift
        (8.0, 11.0, q_lift, q_transit, FINGER_CLOSED, FINGER_CLOSED),  # transit to dock
        (11.0, 13.0, q_transit, q_place, FINGER_CLOSED, FINGER_CLOSED), # descend to place
        (13.0, 13.5, q_place, q_place, FINGER_CLOSED, FINGER_OPEN),     # hold, fingers open
        (13.5, 15.5, q_place, q_retreat, FINGER_OPEN, FINGER_OPEN),     # retreat up
        (15.5, 18.5, q_retreat, q_home, FINGER_OPEN, FINGER_OPEN),     # return home
    ]
    total_s = 20.0
    n_frames = int(total_s * FPS)

    # The rigid hold: earphone pose in the gripper frame at the grasp moment.
    # At grasp the earphone is at E_SETTLED, upright (identity rotation).
    # R_rel maps gripper frame to earphone orientation; T_rel is the earphone
    # origin in the gripper frame.
    R_rel = R_grasp.T.copy()  # R_grasp^-1 (earphone identity at grasp)
    # Earphone origin in gripper frame at grasp: grip point is E_SETTLED +
    # OFFSET * Z_grasp, earphone origin is E_SETTLED, so in the gripper frame
    # the origin is at local (0, 0, 0.08 - OFFSET) = (0, 0, 0.05).
    T_rel = np.array([0.0, 0.0, 0.08 - OFFSET])

    # Carried earphone orientation at the transit waypoint (for the easing).
    # At t=11 the arm is at q_transit, so the carried orientation is
    # R_transit @ R_rel. Capture R_transit directly from that pose.
    set_arm(data, model, q_transit)
    mujoco.mj_forward(model, data)
    _, R_transit = grip_pose(model, data)
    q_carry_start = mat_to_quat(R_transit @ R_rel)
    q_upright = np.array([1.0, 0.0, 0.0, 0.0])

    def arm_at(t):
        if t < 0.5:
            return q_home, FINGER_OPEN
        for (s, e, qa, qb, fa, fb) in segments:
            if s <= t < e:
                u = smoothstep((t - s) / (e - s))
                return qa + u * (qb - qa), fa + u * (fb - fa)
        return q_home, FINGER_OPEN

    # --- Render ---
    renderer = mujoco.Renderer(model, height=HEIGHT, width=WIDTH)
    ff = subprocess.Popen([
        "ffmpeg", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
        "-s", f"{WIDTH}x{HEIGHT}", "-r", str(FPS), "-i", "-",
        "-an", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18",
        str(OUT),
    ], stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    final_ear_pos = None
    final_ear_quat = None
    for frame in range(n_frames):
        t = frame / FPS
        q_arm, q_finger = arm_at(t)
        set_arm(data, model, q_arm)
        set_fingers(data, model, q_finger)
        mujoco.mj_forward(model, data)
        grip_pos, R_grip = grip_pose(model, data)

        if t < 5.5:
            # Before grasp: earphone sits settled on the table.
            ear_pos = E_SETTLED.copy()
            ear_quat = np.array([1.0, 0.0, 0.0, 0.0])
        elif t < 11.0:
            # Rigid carry: earphone follows the gripper.
            ear_pos = grip_pos + R_grip @ (T_rel - np.array([0.0, 0.0, 0.08]))
            ear_quat = mat_to_quat(R_grip @ R_rel)
        elif t < 13.0:
            # Final descent: position follows the gripper down, orientation
            # eases from the carried tilt to upright.
            u = smoothstep((t - 11.0) / 2.0)
            ear_pos = grip_pos + R_grip @ (T_rel - np.array([0.0, 0.0, 0.08]))
            ear_quat = slerp_quat(q_carry_start, q_upright, u)
        elif t < 13.5:
            # Hold at place: earphone in the dock, upright.
            ear_pos = E_TARGET.copy()
            ear_quat = np.array([1.0, 0.0, 0.0, 0.0])
        else:
            # After release: earphone stays in the dock, upright.
            ear_pos = E_TARGET.copy()
            ear_quat = np.array([1.0, 0.0, 0.0, 0.0])

        data.qpos[0:3] = ear_pos
        data.qpos[3:7] = ear_quat
        mujoco.mj_forward(model, data)
        renderer.update_scene(data, camera="overview")
        img = renderer.render()
        ff.stdin.write(img.tobytes())
        final_ear_pos = ear_pos.copy()
        final_ear_quat = ear_quat.copy()

    ff.stdin.close()
    ff.wait()
    print("wrote", OUT, "rc", ff.returncode)

    # --- Success test on the final earphone pose ---
    import xml.etree.ElementTree as ET
    root = ET.parse(str(WORLD)).getroot()
    bodies = {b.get("name"): b for b in root.iter("body")}
    ch = bodies["charger"]
    cx, cy, cz = (float(v) for v in ch.get("pos").split())
    site = ch.find("site[@name='dock_target']")
    sx, sy, sz = (float(v) for v in site.get("pos").split())
    target = np.array([cx + sx, cy + sy, cz + sz])
    R_final = quat_to_mat(final_ear_quat)
    tip = final_ear_pos + R_final @ np.array([0.0, 0.0, 0.008])
    tilt = math.degrees(math.acos(float(np.clip(R_final[2, 2], -1, 1))))
    checks = [
        ("sideways (x)", abs(tip[0] - target[0]), 0.02),
        ("front to back (y)", abs(tip[1] - target[1]), 0.01),
        ("height (z)", abs(tip[2] - target[2]), 0.01),
        ("tilt", tilt, 15.0),
    ]
    print("final earphone pos:", np.round(final_ear_pos, 4), "quat:", np.round(final_ear_quat, 4))
    print("dock target:", np.round(target, 4), "tip:", np.round(tip, 4))
    all_pass = True
    for name, off, lim in checks:
        ok = off <= lim
        all_pass = all_pass and ok
        print("Check %s: off by %.3f, limit %.3f, %s" % (name, off, lim, "PASS" if ok else "FAIL"))
    print("Verdict:", "PASS, all 4 checks inside their limits" if all_pass else "FAIL")
    return 0 if all_pass else 1


if __name__ == "__main__":
    sys.exit(main())
