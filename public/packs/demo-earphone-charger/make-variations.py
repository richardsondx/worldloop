#!/usr/bin/env python3
"""Build the 5 sample variation worlds. Each is a copy of world.xml with a
different earphone start (position and tilt). Each is settled in the sim for
0.5 s and the settled pose is written back into the XML as the start pose,
so the start is a true resting pose. Renders one preview PNG per variation.
Verifies each variation loads in MuJoCo.

Variations (earphone start x, y, yaw about the vertical):
  V1 (0.30, -0.18) stem forward
  V2 (0.45,  0.12) stem forward
  V3 (0.38,  0.05) stem turned 90 deg
  V4 (0.28,  0.08) stem forward, farther from the arm
  V5 (0.42, -0.20) stem turned 180 deg
"""
import math
import xml.etree.ElementTree as ET
from pathlib import Path

import numpy as np
import mujoco
from PIL import Image

HERE = Path(__file__).resolve().parent
WORLD = HERE / "world.xml"

VARIATIONS = [
    ("variation-01", 0.30, -0.18, 0.0, "YAW"),
    ("variation-02", 0.45, 0.12, 0.0, "YAW"),
    ("variation-03", 0.38, 0.05, 90.0, "YAW"),
    ("variation-04", 0.28, 0.08, 0.0, "YAW"),
    ("variation-05", 0.42, -0.20, 180.0, "YAW"),
]


def quat_for_tilt(deg, axis):
    """Yaw about Z (the earphone is flat-bottomed, so a tip-over tilt does
    not survive settling; a yaw does, and it turns the stem)."""
    half = math.radians(deg) / 2
    c, s = math.cos(half), math.sin(half)
    return (c, 0.0, 0.0, s)


def main():
    for name, x, y, tilt_deg, axis in VARIATIONS:
        # --- Copy world.xml and set the earphone start ---
        root = ET.parse(str(WORLD)).getroot()
        bodies = {b.get("name"): b for b in root.iter("body")}
        ear = bodies["earphone"]
        quat = quat_for_tilt(tilt_deg, axis)
        ear.set("pos", "%.3f %.3f 0.792" % (x, y))
        key = root.find("keyframe/key[@name='home']")
        q = key.get("qpos").split()
        q[0:3] = ["%.3f" % x, "%.3f" % y, "0.792"]
        q[3:7] = ["%.5f" % v for v in quat]
        key.set("qpos", " ".join(q))
        out = HERE / f"{name}.xml"
        ET.indent(root)
        ET.ElementTree(root).write(str(out), xml_declaration=True)
        # --- Settle it in the sim and write the settled pose back ---
        model = mujoco.MjModel.from_xml_path(str(out))
        data = mujoco.MjData(model)
        data.qpos[:] = model.key_qpos[0]
        for _ in range(250):
            mujoco.mj_step(model, data)
        mujoco.mj_forward(model, data)
        settled_pos = data.qpos[0:3].copy()
        settled_quat = data.qpos[3:7].copy()
        # Write the settled pose back into the XML.
        root = ET.parse(str(out)).getroot()
        bodies = {b.get("name"): b for b in root.iter("body")}
        ear = bodies["earphone"]
        ear.set("pos", "%.4f %.4f %.4f" % tuple(settled_pos))
        key = root.find("keyframe/key[@name='home']")
        q = key.get("qpos").split()
        q[0:3] = ["%.4f" % v for v in settled_pos]
        q[3:7] = ["%.5f" % v for v in settled_quat]
        key.set("qpos", " ".join(q))
        ET.indent(root)
        ET.ElementTree(root).write(str(out), xml_declaration=True)
        # Verify it loads and the earphone is still on the table.
        model2 = mujoco.MjModel.from_xml_path(str(out))
        data2 = mujoco.MjData(model2)
        data2.qpos[:] = model2.key_qpos[0]
        mujoco.mj_forward(model2, data2)
        on_table = -0.1 <= settled_pos[0] <= 1.1 and -0.4 <= settled_pos[1] <= 0.4
        # --- Render the preview ---
        renderer = mujoco.Renderer(model2, height=800, width=1280)
        renderer.update_scene(data2, camera="overview")
        img = renderer.render()
        png = HERE / f"{name}.png"
        Image.fromarray(img).save(str(png))
        print("%s: start (%.2f, %.2f) tilt %.0f deg about %s -> settled (%.3f, %.3f, %.3f) quat %s on_table=%s preview=%s"
              % (name, x, y, tilt_deg, axis, settled_pos[0], settled_pos[1], settled_pos[2],
                 np.round(settled_quat, 3), on_table, png.name))


if __name__ == "__main__":
    main()
