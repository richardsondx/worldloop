#!/usr/bin/env python3
"""Success test for the WorldLoop demo task: putting an earphone in its charger.

Task: the robot must place the earphone in the charger dock on the table.
Pass condition, in plain words: the earphone tip is at the dock target,
within 2 cm sideways, 1 cm front to back, 1 cm up and down, and the
earphone stands upright within 15 degrees of vertical.

The dock target comes from world.xml, the sample MuJoCo world for this
demo task. The test reads it from that file, it is not typed in here.

How to run it:
    python3 success-test.py pass    # earphone in the dock, upright
    python3 success-test.py fail    # earphone left of the dock, tilted 40 deg
    python3 success-test.py pass --engine geometric   # plain Python, no MuJoCo

With MuJoCo installed the test loads world.xml, sets the earphone pose,
and reads the tip position from the model. Without MuJoCo it does the
same geometry in plain Python. Both engines must agree.
"""

import argparse
import math
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

WORLD = Path(__file__).with_name("world.xml")

# Limits for the pass condition. Units are meters and degrees.
LIMIT_X = 0.02    # sideways, along the table
LIMIT_Y = 0.01    # front to back, along the table
LIMIT_Z = 0.01    # height above the table
LIMIT_TILT = 15.0  # degrees from vertical

# The earphone tip site sits 8 mm above the earphone body origin in world.xml.
TIP_LOCAL = (0.0, 0.0, 0.008)

# Two built-in states. Position is the earphone body origin in meters.
# Quaternion is (w, x, y, z). Pass: at the dock, upright.
# Fail: body set down 6 cm left of the dock, tilted 40 degrees about Y.
STATES = {
    "pass": {
        "label": "forced pass (earphone in the dock, upright)",
        "pos": (0.62, 0.08, 0.800),
        "quat": (1.0, 0.0, 0.0, 0.0),
    },
    "fail": {
        "label": "forced fail (earphone left of the dock, tilted 40 deg)",
        "pos": (0.56, 0.08, 0.800),
        "quat": (0.93969, 0.0, 0.34202, 0.0),
    },
}


def dock_target():
    """Read the dock target site position from world.xml, in meters."""
    root = ET.parse(WORLD).getroot()
    bodies = {b.get("name"): b for b in root.iter("body")}
    charger = bodies["charger"]
    cx, cy, cz = (float(v) for v in charger.get("pos").split())
    site = charger.find("site[@name='dock_target']")
    sx, sy, sz = (float(v) for v in site.get("pos").split())
    return (cx + sx, cy + sy, cz + sz)


def rotate(vec, quat):
    """Rotate a vector by a quaternion (w, x, y, z). Plain Python."""
    w, x, y, z = quat
    vx, vy, vz = vec
    tx = 2.0 * (y * vz - z * vy)
    ty = 2.0 * (z * vx - x * vz)
    tz = 2.0 * (x * vy - y * vx)
    return (
        vx + w * tx + (y * tz - z * ty),
        vy + w * ty + (z * tx - x * tz),
        vz + w * tz + (x * ty - y * tx),
    )


def tilt_degrees(quat):
    """Angle of the body up axis from vertical, in degrees."""
    ux, uy, uz = rotate((0.0, 0.0, 1.0), quat)
    return math.degrees(math.acos(max(-1.0, min(1.0, uz))))


def check(tip, target, tilt):
    """Run the four checks. Returns a list of (name, off_by, limit, ok)."""
    dx = abs(tip[0] - target[0])
    dy = abs(tip[1] - target[1])
    dz = abs(tip[2] - target[2])
    return [
        ("sideways (x)", dx, LIMIT_X, dx <= LIMIT_X),
        ("front to back (y)", dy, LIMIT_Y, dy <= LIMIT_Y),
        ("height (z)", dz, LIMIT_Z, dz <= LIMIT_Z),
        ("tilt", tilt, LIMIT_TILT, tilt <= LIMIT_TILT),
    ]


def run_geometric(state):
    """Tip position and tilt from the pose alone, no MuJoCo needed."""
    pos, quat = state["pos"], state["quat"]
    tip = tuple(p + r for p, r in zip(pos, rotate(TIP_LOCAL, quat)))
    return tip, tilt_degrees(quat)


def run_mujoco(state):
    """Tip position and tilt from the MuJoCo model, forward kinematics only."""
    import mujoco

    model = mujoco.MjModel.from_xml_path(str(WORLD))
    data = mujoco.MjData(model)
    pos, quat = state["pos"], state["quat"]
    data.qpos[0:3] = pos
    data.qpos[3:7] = quat
    mujoco.mj_forward(model, data)
    tip_id = mujoco.mj_name2id(model, mujoco.mjtObj.mjOBJ_SITE, "earphone_tip")
    tip = tuple(float(v) for v in data.site_xpos[tip_id])
    body_id = mujoco.mj_name2id(model, mujoco.mjtObj.mjOBJ_BODY, "earphone")
    xmat = data.xmat[body_id]  # 9 values, row-major 3 by 3 rotation matrix
    up_z = xmat[8]  # third column of the body rotation matrix, z part
    tilt = math.degrees(math.acos(max(-1.0, min(1.0, up_z))))
    return tip, tilt, mujoco.__version__


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("state", choices=("pass", "fail"))
    parser.add_argument("--engine", choices=("mujoco", "geometric"), default="mujoco")
    args = parser.parse_args()
    state = STATES[args.state]
    target = dock_target()

    engine = args.engine
    version = ""
    if engine == "mujoco":
        try:
            tip, tilt, version = run_mujoco(state)
        except ImportError:
            engine = "geometric"
            tip, tilt = run_geometric(state)
    else:
        tip, tilt = run_geometric(state)

    results = check(tip, target, tilt)
    fails = [r for r in results if not r[3]]

    print("Success test: putting an earphone in its charger")
    print("World: public/packs/demo-earphone-charger/world.xml")
    print("State: " + state["label"])
    if engine == "mujoco":
        print("Engine: MuJoCo " + version + ", model loaded, forward kinematics only")
    else:
        print("Engine: geometric, plain Python, no MuJoCo")
    print()
    print("Dock target: x %.3f m, y %.3f m, z %.3f m" % target)
    print("Earphone tip: x %.3f m, y %.3f m, z %.3f m" % tip)
    print()
    for name, off_by, limit, ok in results:
        unit = "deg" if name == "tilt" else "m"
        mark = "PASS" if ok else "FAIL"
        print("Check %s: off by %.3f %s, limit %.3f %s, %s" % (name, off_by, unit, limit, unit, mark))
    print()
    if fails:
        print("Verdict: FAIL, %d of 4 checks outside their limits" % len(fails))
    else:
        print("Verdict: PASS, all 4 checks inside their limits")
    return 0 if not fails else 1


if __name__ == "__main__":
    sys.exit(main())
