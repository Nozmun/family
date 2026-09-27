// Synthesizes soundtrack.wav: 15s at 120 BPM, every hit locked to the
// visual timeline in reel.html. Pure DSP, no samples.
//
//   node synth.mjs
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SR = 48000, DUR = 15, N = SR * DUR;
const L = new Float32Array(N), R = new Float32Array(N);
const revL = new Float32Array(N), revR = new Float32Array(N);   // reverb send
const duck = new Float32Array(N).fill(1);                         // sidechain envelope
const TAU = Math.PI * 2;
let seed = 1;
const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 * 2 - 1; };
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

function add(t0, dur, fn, { gain = 1, pan = 0, send = 0, ducked = false } = {}) {
  const s0 = Math.max(0, Math.round(t0 * SR)), s1 = Math.min(N, Math.round((t0 + dur) * SR));
  const gl = gain * Math.cos((pan + 1) * Math.PI / 4), gr = gain * Math.sin((pan + 1) * Math.PI / 4);
  const st = { lp: 0, lp2: 0, hp: 0, prev: 0, ph: 0 };
  for (let i = s0; i < s1; i++) {
    const t = (i - s0) / SR; let v = fn(t, st, i / SR);
    if (ducked) v *= duck[i];
    L[i] += v * gl; R[i] += v * gr;
    if (send) { revL[i] += v * gl * send; revR[i] += v * gr * send; }
  }
}
const onePole = (st, key, x, cutoff) => { const a = 1 - Math.exp(-TAU * cutoff / SR); st[key] += a * (x - st[key]); return st[key]; };

// ── instruments ─────────────────────────────────────────────
function kick(t0, amp = 1) {
  add(t0, .6, (t, st) => {
    st.ph += TAU * (45 + 130 * Math.exp(-t * 32)) / SR;
    const body = Math.sin(st.ph) * Math.exp(-t * 6.5);
    const click = rnd() * Math.exp(-t * 400) * .4;
    return Math.tanh((body + click) * 1.6) * amp;
  }, { gain: .9 });
  // sidechain dip
  for (let i = Math.round(t0 * SR), e = Math.min(N, i + SR * .3); i < e; i++) duck[i] = Math.min(duck[i], 1 - .75 * Math.exp(-(i / SR - t0) * 14));
}
function clap(t0, amp = 1) {
  add(t0, .4, (t, st) => {
    const env = [0, .011, .022].reduce((s, d) => s + (t >= d ? Math.exp(-(t - d) * (d === .022 ? 16 : 120)) : 0), 0);
    const n = rnd(); const hp = n - onePole(st, 'lp', n, 900);
    return onePole(st, 'lp2', hp, 6000) * env * amp;
  }, { gain: .55, send: .35 });
}
function hat(t0, amp = 1, pan = 0) {
  add(t0, .12, (t, st) => { const n = rnd(); return (n - onePole(st, 'lp', n, 7000)) * Math.exp(-t * 55) * amp; }, { gain: .22, pan, send: .1 });
}
function saw(ph) { return (ph / TAU) % 1 * 2 - 1; }
function bass(t0, dur, midi, amp = 1) {
  const f = mtof(midi);
  add(t0, dur, (t, st) => {
    st.ph += TAU * f / SR; st.ph2 = (st.ph2 || 0) + TAU * f * 1.006 / SR;
    const x = saw(st.ph) + saw(st.ph2) * .6 + Math.sin(st.ph * .5) * .9;
    const cut = 180 + 1400 * Math.exp(-t * 9);
    const env = Math.min(1, t * 200) * Math.min(1, (dur - t) * 60);
    return onePole(st, 'lp2', onePole(st, 'lp', x, cut), cut) * env * amp;
  }, { gain: .42, ducked: true });
}
function pad(t0, dur, notes, amp = 1) {
  notes.forEach((m, k) => {
    [-0.08, 0.08].forEach((det, j) => {
      const f = mtof(m + det);
      add(t0, dur, (t, st) => {
        st.ph += TAU * f / SR;
        const env = Math.min(1, t / .35) * Math.min(1, (dur - t) / .25);
        return onePole(st, 'lp', saw(st.ph + k), 1600 + 900 * Math.sin(t * 2)) * env * amp;
      }, { gain: .05, pan: j ? .6 : -.6, send: .5, ducked: true });
    });
  });
}
function pluck(t0, midi, amp = 1, pan = 0) {
  const f = mtof(midi);
  add(t0, .35, (t, st) => {
    st.ph += TAU * f / SR;
    const x = (Math.sin(st.ph) + .5 * Math.sin(st.ph * 2 + Math.sin(st.ph) * 2 * Math.exp(-t * 20)));
    return x * Math.exp(-t * 14) * amp;
  }, { gain: .16, pan, send: .45 });
}
function blip(t0, f0, f1, dur, amp = 1, pan = 0) {
  add(t0, dur, (t, st) => { st.ph += TAU * (f1 + (f0 - f1) * Math.exp(-t * 30)) / SR; return Math.sin(st.ph) * Math.exp(-t * 6 / dur) * amp; }, { gain: .2, pan, send: .4 });
}
function whoosh(tEnd, len, amp = 1, rev = false) {
  add(tEnd - len, len + .15, (t, st) => {
    const p = Math.min(1, t / len), env = rev ? Math.pow(p, 3) * (t > len ? Math.exp(-(t - len) * 40) : 1) : Math.sin(Math.PI * p);
    const n = rnd(), cut = 300 + 9000 * Math.pow(p, 2);
    const bp = onePole(st, 'lp', n, cut) - onePole(st, 'lp2', n, cut * .25);
    return bp * env * amp * 2.2;
  }, { gain: .35, send: .3 });
}
function riser(t0, t1, amp = 1) {
  add(t0, t1 - t0, (t, st) => {
    const p = t / (t1 - t0), f = 200 * Math.pow(12, p);
    st.ph += TAU * f / SR; st.ph2 = (st.ph2 || 0) + TAU * f * 1.5 / SR;
    const n = rnd(), nz = n - onePole(st, 'lp', n, 400 + 8000 * p);
    return ((Math.sin(st.ph) + Math.sin(st.ph2) * .5) * .25 + nz * .6) * p * p * amp;
  }, { gain: .3, send: .4 });
}
function impact(t0, amp = 1) {
  kick(t0, 1.1 * amp);
  add(t0, 2.4, (t, st) => { st.ph += TAU * (38 + 40 * Math.exp(-t * 12)) / SR; return Math.sin(st.ph) * Math.exp(-t * 1.8) * amp; }, { gain: .55 });
  add(t0, 2.4, (t, st) => { const n = rnd(); return (n - onePole(st, 'lp', n, 2500)) * Math.exp(-t * 2.2) * amp; }, { gain: .22, send: .6 });
}

// ── arrangement ─────────────────────────────────────────────
const beat = .5, bars = [[57, [69, 72, 76]], [53, [69, 72, 77]], [48, [67, 72, 76]], [55, [67, 71, 74]], [57, [69, 72, 76]], [53, [69, 72, 77, 79]]];
// 0–2  ignition: heartbeat + riser
[0, .5, 1, 1.5].forEach((b, i) => { kick(b, .45 + i * .12); blip(b, 1800, 880, .25, .7 - i * .1, 0); });
riser(.9, 2.0, 1);
whoosh(2.0, .5, .8, true);
impact(2.0, 1);
// 2–12  groove
for (let b = 2.0; b < 11.5; b += beat) {
  if (b > 2.0) kick(b, 1);
  if (Math.round((b - 2) / beat) % 2 === 1) clap(b, 1);
  if (b >= 4) hat(b + .25, .9, .3);
  if (b >= 8) { hat(b + .125, .35, -.4); hat(b + .375, .35, -.4); }
}
bars.slice(0, 5).forEach(([root, chord], k) => {
  const t0 = 2 + k * 2;
  for (let s = 0; s < 8; s++) bass(t0 + s * .25, .22, root - 12 + (s % 4 === 3 ? 12 : 0), s % 2 ? .75 : 1);
  pad(t0, 2.05, chord, 1);
});
// 2–4  form: arp per 16th, rising with each morph
for (let s = 0; s < 32; s++) { const arp = [69, 72, 76, 81]; pluck(2 + s * .0625, arp[s % 4] + (s >= 16 ? 12 : 0), .55 + (s % 4 === 0) * .3, (s % 2) * .6 - .3); }
[2.5, 3.0, 3.5].forEach((b, i) => blip(b, 400, 1200 + i * 300, .2, .8));
whoosh(3.96, .3, .9);
// 4–6  type: stabs on each word
[[4.0, [65, 69, 72]], [4.5, [65, 69, 72]], [5.0, [67, 72]], [5.5, [69, 72, 77]]].forEach(([b, ch]) => ch.forEach(m => pluck(b, m + 12, 1, 0)));
whoosh(5.95, .25, 1);
// 6–8  depth: sparkle arpeggio
for (let s = 0; s < 32; s++) { const pent = [72, 74, 76, 79, 81, 84, 86, 88]; pluck(6 + s * .0625, pent[(s * 5) % 8] + 12, .35, Math.sin(s) * .8); }
riser(7.3, 8.0, .7); whoosh(8.0, .35, 1, true);
// 8–10  fluid: bubbly blips
for (let s = 0; s < 16; s++) { const f = 220 * Math.pow(2, ((s * 7) % 12) / 12); blip(8 + s * .125, f * 2, f, .18, .7, Math.sin(s * 2.1) * .7); }
whoosh(10.0, .5, 1.1);
// 10–12  system: clicky tile flips on the three waves
[10.5, 11.0, 11.5].forEach(b => { for (let k = 0; k < 8; k++) blip(b + k * .035, 3000 - k * 180, 1500, .05, .5, k / 4 - 1); });
for (let s = 0; s < 32; s++) { const arp = [69, 76, 72, 79]; pluck(10 + s * .0625, arp[s % 4], .4, (s % 2) * .8 - .4); }
// 11.5–12 break → drop
whoosh(12.0, 1.0, 1.4, true); riser(11.3, 12.0, 1.2);
impact(12.0, 1.3);
// 12–15  finale
pad(12, 2.8, [65, 69, 72, 76, 79], 1.5);
bass(12, 2.4, 41, 1.2);
[13.0, 14.0].forEach(b => kick(b, .9));
for (let b = 12.5; b < 14.4; b += .25) hat(b, .5, b % .5 ? .4 : -.4);
for (let s = 0; s < 12; s++) blip(12.75 + s * .06, 2400 + s * 90, 2400 + s * 90, .04, .45, (s % 2) - .5);   // tagline decode ticks
// 14.4–15 collapse back to a single point
add(14.35, .55, (t, st) => { st.ph += TAU * (900 * Math.exp(-t * 7) + 50) / SR; return Math.sin(st.ph) * Math.min(1, t * 20) * .5; }, { gain: .4, send: .3 });
whoosh(14.85, .5, 1.2, true);
blip(14.82, 2600, 1800, .12, 1.1);

// ── reverb (Schroeder: 4 combs + 2 allpasses per side) ──────
function reverb(inp, spread) {
  const out = new Float32Array(N);
  const combs = [1557, 1617, 1491, 1422].map(d => ({ d: d + spread, buf: new Float32Array(d + spread), i: 0, lp: 0 }));
  for (let n = 0; n < N; n++) {
    let s = 0;
    for (const c of combs) { const y = c.buf[c.i]; c.lp = y * .7 + c.lp * .3; c.buf[c.i] = inp[n] + c.lp * .8; c.i = (c.i + 1) % c.d; s += y; }
    out[n] = s * .25;
  }
  for (const d of [225 + spread, 556 + spread]) {
    const buf = new Float32Array(d); let i = 0;
    for (let n = 0; n < N; n++) { const b = buf[i], y = -out[n] + b; buf[i] = out[n] + b * .5; i = (i + 1) % d; out[n] = y; }
  }
  return out;
}
const wl = reverb(revL, 0), wr = reverb(revR, 23);

// ── master: sum, soft clip, normalize, fade the last 20ms ───
let peak = 0;
for (let i = 0; i < N; i++) {
  L[i] = Math.tanh((L[i] + wl[i] * .35) * .6); R[i] = Math.tanh((R[i] + wr[i] * .35) * .6);
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const g = .84 / peak;
const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVE', 8); buf.write('fmt ', 12);
buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  const fade = Math.min(1, (N - i) / (SR * .02));
  buf.writeInt16LE(Math.round(L[i] * g * fade * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(R[i] * g * fade * 32767), 46 + i * 4);
}
writeFileSync(join(dirname(fileURLToPath(import.meta.url)), 'soundtrack.wav'), buf);
console.log(`soundtrack.wav written (peak before normalize ${peak.toFixed(2)})`);
