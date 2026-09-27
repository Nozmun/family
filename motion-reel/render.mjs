// Renders reel.html frame-by-frame in headless Chromium and pipes PNGs into ffmpeg.
//
//   node render.mjs                      → reel.mp4 (muxes soundtrack.wav if present)
//   node render.mjs --stills 1.2,4.8     → stills/t1.20.png … for quick checks
//
// Needs: playwright (global install is fine) and an ffmpeg with libx264 on PATH
// or in $FFMPEG.
import { createRequire } from 'node:module';
import { spawn, execSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const globalRoot = execSync('npm root -g').toString().trim();
const { chromium } = require(require.resolve('playwright', { paths: [process.cwd(), globalRoot] }));

const here = dirname(fileURLToPath(import.meta.url));
const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const args = process.argv.slice(2);
const stillsArg = args.includes('--stills') ? args[args.indexOf('--stills') + 1] : null;
const sub = Number(process.env.SUBFRAMES || 4);

const browser = await chromium.launch({ args: ['--disable-gpu-vsync', '--force-color-profile=srgb'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
page.on('pageerror', e => { console.error('page error:', e); process.exit(1); });
await page.goto(pathToFileURL(join(here, 'reel.html')).href + '?render');
await page.evaluate(() => window.ready);

const grab = async (frame) => {
  const b64 = await page.evaluate(([f, s]) => { window.renderFrame(f, s); return document.getElementById('out').toDataURL('image/png').slice(22); }, [frame, sub]);
  return Buffer.from(b64, 'base64');
};

if (stillsArg) {
  const dir = join(here, 'stills'); mkdirSync(dir, { recursive: true });
  for (const s of stillsArg.split(',')) {
    const t = Number(s); writeFileSync(join(dir, `t${t.toFixed(2)}.png`), await grab(Math.round(t * 60)));
  }
  await browser.close(); process.exit(0);
}

const FRAMES = await page.evaluate(() => window.FRAMES);
const wav = join(here, 'soundtrack.wav');
const ff = spawn(FFMPEG, [
  '-y', '-loglevel', 'error',
  '-f', 'image2pipe', '-framerate', '60', '-c:v', 'png', '-i', '-',
  ...(existsSync(wav) ? ['-i', wav, '-c:a', 'aac', '-b:a', '256k', '-shortest'] : []),
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '21', '-pix_fmt', 'yuv420p',
  '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
  '-movflags', '+faststart', join(here, 'reel.mp4'),
], { stdio: ['pipe', 'inherit', 'inherit'] });

const t0 = Date.now();
for (let f = 0; f < FRAMES; f++) {
  const png = await grab(f);
  if (!ff.stdin.write(png)) await new Promise(r => ff.stdin.once('drain', r));
  if (f % 60 === 0) console.log(`frame ${f}/${FRAMES}  ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}
ff.stdin.end();
await new Promise(r => ff.on('close', r));
await browser.close();
console.log(`done in ${((Date.now() - t0) / 1000).toFixed(1)}s → reel.mp4`);
