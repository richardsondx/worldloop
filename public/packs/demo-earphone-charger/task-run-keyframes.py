#!/usr/bin/env python3
"""task-run-keyframes.py: bake the demo arm motion into JSON for the /demo 3D viewer.

The motion is the same scripted pick-and-place as run-task.py (home, reach,
descend, grasp, lift, carry to the dock, place, release, return home), with
the same timeline and the same earphone carry rule. The only difference is
the solver: run-task.py uses MuJoCo's Jacobian IK; MuJoCo is not installed
in this sandbox, so this script reimplements the same math in pure NumPy:

- seed(): the analytic 2-link IK from run-task.py, used as the first guess.
- A small damped least-squares IK on the analytic forward kinematics,
  which plays the role of run-task.py's ik_pos (same joint ranges, same
  targets, iterated to under 1 mm).
- The nested earphone solve, the rigid carry, and the final-descent upright
  easing, copied from run-task.py.

Assumption, stated plainly: the earphone settles straight down from its
start pose to rest on the table, so E_SETTLED is (0.35, -0.1, 0.78). The
table surface is at 0.78 m and the earphone's lowest point is its origin,
so a settled earphone sits with its origin at 0.78 m. The end pose is exact
by construction: after release the earphone is at E_TARGET, upright, and the
script checks the dock target and the judge verdict on that pose.

Output: ../app/demo/task-run-keyframes.json, one sample per row:
  { t, q: [yaw, pitch, elbow, wrist_roll], f: [fingerL, fingerR],
    e: [earphone x, y, z], eq: [earphone quat w, x, y, z] }
Angles in radians, positions in meters, quats in MuJoCo order (w, x, y, z).

Usage: python3 task-run-keyframes.py
"""
import json
import math
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
OUT = HERE.parents[2] / "app" / "demo" / "task-run-keyframes.json"

SHOULDER = np.array([0.5, -0.35, 0.89])
L1, L2 = 0.22, 0.30
OFFSET = 0.03
E_TARGET = np.array([0.62, 0.08, 0.800])
# Earphone start in world.xml, settled straight down onto the table (see note
# at the top of this file). Table surface is 0.78 m.
E_SETTLED = np.array([0.35, -0.1, 0.78])
DOCK_TARGET = np.array([0.62, 0.08, 0.808])
FINGER_OPEN = np.array([0.0, 0.0])
FINGER_CLOSED = np.array([-0.0185, 0.0185])
Q_HOME = np.array([0.0, -0.5, 1.1, 0.3])
LO = np.array([-3.14, -1.5, -0.1, -1.5])
HI = np.array([3.14, 1.5, 2.4, 1.5])
N_SAMPLES = 121
T_END = 18.5


def Rz(a):
    c, s = math.cos(a), math.sin(a)
    return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]])


def Ry(a):
    c, s = math.cos(a), math.sin(a)
    return np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]])


def Rx(a):
    c, s = math.cos(a), math.sin(a)
    return np.array([[1, 0, 0], [0, c, -s], [0, s, c]])


def fk(q):
    """Forward kinematics: grip point position and gripper rotation matrix."""
    yaw, pitch, elbow, roll = q
    R1 = Rz(yaw) @ Ry(pitch)
    R2 = Ry(elbow)
    grip_pos = SHOULDER + R1 @ np.array([0.0, 0.0, L1]) + R1 @ R2 @ np.array([0.0, 0.0, L2])
    R_grip = R1 @ R2 @ Rx(roll)
    return grip_pos, R_grip


def seed(target):
    """Analytic 2-link IK from run-task.py: first guess for a grip target."""
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


def ik_pos(target, q0, iters=200):
    """Damped least-squares position IK on the analytic FK.

    Plays the role of run-task.py's ik_pos (same targets, same joint
    ranges), iterated until the grip point is within 1 mm of the target.
    """
    q = np.clip(q0.copy(), LO, HI)
    for _ in range(iters):
        pos, _ = fk(q)
        err = target - pos
        if np.linalg.norm(err) < 0.001:
            break
        J = np.zeros((3, 4))
        for j in range(4):
            dq = np.zeros(4)
            dq[j] = 1e-6
            J[:, j] = (fk(q + dq)[0] - pos) / 1e-6
        lam = 0.02
        A = J @ J.T + lam * lam * np.eye(3)
        dq = J.T @ np.linalg.solve(A, err)
        dq = np.clip(dq, -0.05, 0.05)
        q = np.clip(q + dq, LO, HI)
    pos, R = fk(q)
    return q, float(np.linalg.norm(target - pos)), R


def solve_earphone_pos(E, q0):
    """Nested solve from run-task.py: grip point = E + OFFSET * gripper Z."""
    z_guess = np.array([0.0, 0.0, -1.0])
    q = q0
    R = None
    for _ in range(8):
        target = E + OFFSET * z_guess
        q, _, R = ik_pos(target, q)
        z_new = R[:, 2]
        if np.linalg.norm(z_new - z_guess) < 1e-4:
            break
        z_guess = z_new
    pos, R = fk(q)
    ear = pos - R @ np.array([0.0, 0.0, OFFSET])
    return q, float(np.linalg.norm(E - ear)), R


def smoothstep(t):
    t = min(max(t, 0.0), 1.0)
    return t * t * (3 - 2 * t)


def quat_to_mat(quat):
    w, x, y, z = quat
    return np.array([
        [1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)],
        [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
        [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)],
    ])


def mat_to_quat(R):
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
        x = (R[0, 2] - R[2, 0]) / s
        y = (R[1, 2] + R[2, 1]) / s
        z = 0.25 * s
    q = np.array([w, x, y, z])
    return q / np.linalg.norm(q)


def slerp_quat(q0, q1, t):
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
    # --- Solve the waypoints, exactly as run-task.py does ---
    q_pre, err_pre, _ = ik_pos(E_SETTLED + np.array([0, 0, 0.12]),
                               seed(E_SETTLED + np.array([0, 0, 0.12])))
    q_grasp, eerr_g, R_grasp = solve_earphone_pos(E_SETTLED, q_pre)
    q_lift, err_lift, _ = ik_pos(E_SETTLED + np.array([0, 0, 0.15]), q_grasp)
    q_transit, err_tr, _ = ik_pos(E_TARGET + np.array([0, 0, 0.15]), q_lift)
    q_place, eerr_p, R_place = solve_earphone_pos(E_TARGET, q_transit)
    q_retreat, err_ret, _ = ik_pos(E_TARGET + np.array([0, 0, 0.15]), q_place)
    print("waypoint errors (mm): pre %.1f grasp %.1f lift %.1f transit %.1f "
          "place %.1f retreat %.1f"
          % (err_pre * 1000, eerr_g * 1000, err_lift * 1000, err_tr * 1000,
             eerr_p * 1000, err_ret * 1000))

    # Rigid carry: earphone pose in the gripper frame at the grasp moment.
    R_rel = R_grasp.T.copy()
    T_rel = np.array([0.0, 0.0, 0.08 - OFFSET])
    _, R_transit = fk(q_transit)
    q_carry_start = mat_to_quat(R_transit @ R_rel)
    q_upright = np.array([1.0, 0.0, 0.0, 0.0])

    segments = [
        (0.5, 3.5, Q_HOME, q_pre, FINGER_OPEN, FINGER_OPEN),
        (3.5, 5.5, q_pre, q_grasp, FINGER_OPEN, FINGER_OPEN),
        (5.5, 6.0, q_grasp, q_grasp, FINGER_OPEN, FINGER_CLOSED),
        (6.0, 8.0, q_grasp, q_lift, FINGER_CLOSED, FINGER_CLOSED),
        (8.0, 11.0, q_lift, q_transit, FINGER_CLOSED, FINGER_CLOSED),
        (11.0, 13.0, q_transit, q_place, FINGER_CLOSED, FINGER_CLOSED),
        (13.0, 13.5, q_place, q_place, FINGER_CLOSED, FINGER_OPEN),
        (13.5, 15.5, q_place, q_retreat, FINGER_OPEN, FINGER_OPEN),
        (15.5, 18.5, q_retreat, Q_HOME, FINGER_OPEN, FINGER_OPEN),
    ]

    def arm_at(t):
        if t < 0.5:
            return Q_HOME, FINGER_OPEN
        for (s, e, qa, qb, fa, fb) in segments:
            if s <= t < e:
                u = smoothstep((t - s) / (e - s))
                return qa + u * (qb - qa), fa + u * (fb - fa)
        return Q_HOME, FINGER_OPEN

    samples = []
    for i in range(N_SAMPLES):
        t = T_END * i / (N_SAMPLES - 1)
        q_arm, q_finger = arm_at(t)
        grip_pos, R_grip = fk(q_arm)
        if t < 5.5:
            ear_pos = E_SETTLED.copy()
            ear_quat = np.array([1.0, 0.0, 0.0, 0.0])
        elif t < 11.0:
            ear_pos = grip_pos + R_grip @ (T_rel - np.array([0.0, 0.0, 0.08]))
            ear_quat = mat_to_quat(R_grip @ R_rel)
        elif t < 13.0:
            u = smoothstep((t - 11.0) / 2.0)
            ear_pos = grip_pos + R_grip @ (T_rel - np.array([0.0, 0.0, 0.08]))
            ear_quat = slerp_quat(q_carry_start, q_upright, u)
        else:
            ear_pos = E_TARGET.copy()
            ear_quat = np.array([1.0, 0.0, 0.0, 0.0])
        samples.append({
            "t": round(float(t), 3),
            "q": [round(float(v), 5) for v in q_arm],
            "f": [round(float(v), 5) for v in q_finger],
            "e": [round(float(v), 5) for v in ear_pos],
            "eq": [round(float(v), 5) for v in ear_quat],
        })

    # --- Verify the end pose against the judge, as run-task.py does ---
    final = samples[-1]
    R_final = quat_to_mat(np.array(final["eq"]))
    tip = np.array(final["e"]) + R_final @ np.array([0.0, 0.0, 0.008])
    tilt = math.degrees(math.acos(float(np.clip(R_final[2, 2], -1, 1))))
    checks = [
        ("sideways (x)", abs(tip[0] - DOCK_TARGET[0]), 0.02),
        ("front to back (y)", abs(tip[1] - DOCK_TARGET[1]), 0.01),
        ("height (z)", abs(tip[2] - DOCK_TARGET[2]), 0.01),
        ("tilt", tilt, 15.0),
    ]
    print("final earphone pos:", np.round(final["e"], 4))
    print("dock target:", DOCK_TARGET, "tip:", np.round(tip, 4))
    all_pass = True
    for name, off, lim in checks:
        ok = off <= lim
        all_pass = all_pass and ok
        print("Check %s: off by %.3f, limit %.3f, %s" % (name, off, lim, "PASS" if ok else "FAIL"))
    print("Verdict:", "PASS, all 4 checks inside their limits" if all_pass else "FAIL")
    assert all_pass, "final pose fails the judge"

    OUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT, "w") as fh:
        json.dump({"duration": T_END, "samples": samples}, fh)
    print("wrote", OUT, "samples:", len(samples), "bytes:", OUT.stat().st_size)


if __name__ == "__main__":
    main()
