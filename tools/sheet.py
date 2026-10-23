#!/usr/bin/env python3
"""sheet.py — every toy at phone size, side by side on one picture (her rule: look at them together).
python3 tools/sheet.py <out.png> [lang]   (needs the local server on 9013)"""
import subprocess, sys, os
from PIL import Image

TOYS = ["money", "peoples", "pleats", "story", "splint", "coffee", "camera", "phone"]
here = os.path.dirname(os.path.abspath(__file__))
out = sys.argv[1]; lang = sys.argv[2] if len(sys.argv) > 2 else "en"
tmp = os.path.splitext(out)[0]
shots = []
for t in TOYS:
    pre = f"{tmp}-{t}"
    r = subprocess.run(["node", os.path.join(here, "shoot.mjs"), f"http://127.0.0.1:9013/toys/test2.html?toy={t}&lang={lang}", pre, "390x844", "--wait", "3500"], capture_output=True, text=True)
    p = f"{pre}-390x844.png"
    if os.path.exists(p): shots.append((t, p))
    errs = [l for l in r.stdout.splitlines() if "404" not in l and l.strip() not in ("ERRORS", "no console errors")]
    if errs: print(t, "\n".join(errs))
ims = [Image.open(p).convert("RGB") for _, p in shots]
w = max(i.width for i in ims); h = max(i.height for i in ims)
cols = 4; rows = (len(ims) + cols - 1) // cols
sheet = Image.new("RGB", (cols * w + (cols + 1) * 20, rows * h + (rows + 1) * 20), (40, 36, 30))
for k, im in enumerate(ims):
    sheet.paste(im, (20 + (k % cols) * (w + 20), 20 + (k // cols) * (h + 20)))
sheet.thumbnail((3000, 3000))
sheet.save(out)
print(out, [t for t, _ in shots])
