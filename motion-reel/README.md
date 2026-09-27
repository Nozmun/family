# Motion Reel

A 15-second, 1920×1080, 60 fps motion graphics piece in which every frame and every sound comes from code. It uses no keyframes, footage or samples.

**Watch:** `reel.mp4`. **Live:** open `reel.html` in a browser (click to play or pause, ← → to scrub).

## Structure (120 BPM, one bar = 2 s)

| Time | Chapter | What happens |
|---|---|---|
| 0–2 s | 01 / IGNITION | A single point beats on each kick, stretches into a line and opens into a fan of rays |
| 2–4 s | 02 / FORM | An iris opens onto coral. The hero shape morphs circle → square → triangle → star on the beat, with elastic easing and offset echoes |
| 4–6 s | 03 / TYPE | "EVERY FRAME is a CHOICE": masked rises, a punch-in with registration-offset color plates, baseline flips, then a slice transition |
| 6–8 s | 04 / DEPTH | A 2,400-point 3D cloud morphs sphere → torus → cube → galaxy, then warps past the camera |
| 8–10 s | 05 / FLUID | Per-pixel metaballs with banded color and topographic contours, plus a difference-blended marquee |
| 10–12 s | 06 / SYSTEM | A 16×9 Bauhaus tile grid flips in three waves, collapses to dots, then to a single point |
| 12–15 s | 07 / MOTION | An extruded, stripe-filled title. The tagline decodes, then everything collapses back to the opening point, so the reel loops seamlessly |

The whole piece shares a camera rig with shake and a zoom punch on each impact. The finishing pass adds a 180° shutter motion blur (4 subframes per frame), chromatic aberration on impacts, a vignette, film grain and a timecode HUD.

## Rebuild

```bash
node synth.mjs     # → soundtrack.wav (pure DSP synthesis, locked to the same beat grid)
node render.mjs    # → reel.mp4 (headless Chromium → PNG frames → ffmpeg/libx264)
node render.mjs --stills 2.5,7.25   # spot-check single frames into stills/
```

The build needs Playwright (Chromium) and an ffmpeg that has libx264. `render.mjs` looks for `ffmpeg` on your `PATH`. To use a different binary, set `FFMPEG=/path/to/ffmpeg`.
