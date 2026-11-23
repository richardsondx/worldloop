#!/usr/bin/env python3
"""Re-render world-preview.png from the (modified) world.xml, and render one
preview PNG per variation world. Usage:
    python3 render-previews.py            # main world only
    python3 render-previews.py variation-01.xml ...   # named worlds
Writes <stem>-preview.png next to each world file (world.xml -> world-preview.png).
"""
import sys
from pathlib import Path

import numpy as np
import mujoco

HERE = Path(__file__).resolve().parent


def render_one(world_path, out_path):
    model = mujoco.MjModel.from_xml_path(str(world_path))
    data = mujoco.MjData(model)
    # Home keyframe if present, else settle the earphone briefly.
    if model.nkey > 0:
        data.qpos[:] = model.key_qpos[0]
    mujoco.mj_forward(model, data)
    # Settle the earphone if it has a free joint (drops to the table).
    for _ in range(250):
        mujoco.mj_step(model, data)
    mujoco.mj_forward(model, data)
    renderer = mujoco.Renderer(model, height=800, width=1280)
    renderer.update_scene(data, camera="overview")
    img = renderer.render()
    from PIL import Image
    Image.fromarray(img).save(str(out_path))
    print("wrote", out_path)


def main():
    targets = sys.argv[1:] or ["world.xml"]
    for name in targets:
        world_path = HERE / name
        stem = world_path.stem
        out = HERE / ("world-preview.png" if stem == "world" else f"{stem}.png")
        render_one(world_path, out)


if __name__ == "__main__":
    main()
