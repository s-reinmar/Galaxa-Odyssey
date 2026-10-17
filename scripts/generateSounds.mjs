// Generuje krótkie efekty dźwiękowe (WAV 16-bit mono) do public/resources/sounds.
// Uruchomienie: npm run sounds
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const RATE = 44100;
const OUT = path.resolve('public', 'resources', 'sounds');

const osc = {
    sine: (p) => Math.sin(2 * Math.PI * p),
    square: (p) => (p % 1 < 0.5 ? 1 : -1),
    sawtooth: (p) => 2 * (p % 1) - 1,
    triangle: (p) => 4 * Math.abs((p % 1) - 0.5) - 1,
};

const expRamp = (v0, v1, t, dur) => v0 * Math.pow(v1 / v0, Math.min(t / dur, 1));
const linRamp = (v0, v1, t, dur) => v0 + (v1 - v0) * Math.min(t / dur, 1);

/** Dodaje oscylator z przesuwem częstotliwości i obwiednią gain do bufora. */
function addTone(buf, { type, f0, f1, fDur, ramp = expRamp, g0, g1, gPeak, start = 0, dur }) {
    const wave = osc[type];
    const first = Math.floor(start * RATE);
    const n = Math.floor(dur * RATE);
    let phase = 0;
    for (let i = 0; i < n && first + i < buf.length; i++) {
        const t = i / RATE;
        phase += ramp(f0, f1 ?? f0, t, fDur ?? dur) / RATE;
        let g;
        if (gPeak) {
            // g0 -> gPeak.value w czasie gPeak.at, potem -> g1 do końca
            g = t < gPeak.at ? expRamp(g0, gPeak.value, t, gPeak.at) : expRamp(gPeak.value, g1, t - gPeak.at, dur - gPeak.at);
        } else {
            g = expRamp(g0, g1, t, dur);
        }
        buf[first + i] += wave(phase) * g;
    }
}

function addExplosion(buf, dur, g0, g1) {
    const n = Math.floor(dur * RATE);
    let lp = 0;
    for (let i = 0; i < n; i++) {
        const t = i / RATE;
        const a = 1 - Math.exp((-2 * Math.PI * expRamp(800, 100, t, dur)) / RATE);
        lp += a * ((Math.random() * 2 - 1) * Math.exp(-i / (RATE * 0.08)) - lp);
        buf[i] += lp * expRamp(g0, g1, t, dur) * 3;
    }
}

const sounds = {
    shoot: (b) => addTone(b, { type: 'square', f0: 880, f1: 110, g0: 0.2, g1: 0.01, dur: 0.12 }),
    tripleShot: (b) => {
        addTone(b, { type: 'sawtooth', f0: 950, f1: 160, g0: 0.22, g1: 0.01, dur: 0.14 });
        addTone(b, { type: 'square', f0: 620, f1: 120, g0: 0.22, g1: 0.01, dur: 0.14 });
    },
    laser: (b) => {
        addTone(b, { type: 'sawtooth', f0: 1250, f1: 800, ramp: linRamp, g0: 0.18, g1: 0.01, dur: 0.08 });
        addTone(b, { type: 'sine', f0: 2500, f1: 1600, ramp: linRamp, g0: 0.18, g1: 0.01, dur: 0.08 });
    },
    tokenCollect: (b) =>
        [440, 554.37, 659.25, 880].forEach((f, i) =>
            addTone(b, { type: 'triangle', f0: f, g0: 0.25, g1: 0.005, start: i * 0.045, dur: 0.12 }),
        ),
    explosion: (b) => addExplosion(b, 0.35, 0.4, 0.01),
    powerUp: (b) => addTone(b, { type: 'triangle', f0: 330, f1: 990, g0: 0.25, g1: 0.01, dur: 0.25 }),
    uiHover: (b) => addTone(b, { type: 'sine', f0: 1400, f1: 1800, fDur: 0.03, g0: 0.04, g1: 0.001, dur: 0.035 }),
    uiClick: (b) => {
        addTone(b, { type: 'triangle', f0: 800, f1: 2400, fDur: 0.06, g0: 0.12, g1: 0.001, dur: 0.065 });
        addTone(b, { type: 'sine', f0: 1200, f1: 400, fDur: 0.06, g0: 0.12, g1: 0.001, dur: 0.065 });
    },
    warpJump: (b) => {
        addTone(b, { type: 'sawtooth', f0: 60, f1: 320, fDur: 0.85, g0: 0.25, g1: 0.01, dur: 0.95 });
        addTone(b, { type: 'sine', f0: 350, f1: 3800, fDur: 0.8, g0: 0.08, gPeak: { at: 0.7, value: 0.22 }, g1: 0.001, dur: 0.9 });
    },
    targetAcquiring: (b) =>
        addTone(b, { type: 'sine', f0: 1480, f1: 1760, fDur: 0.04, g0: 0.045, g1: 0.001, dur: 0.045 }),
    targetLocked: (b) => {
        // Obwiednia 0.08 -> 0.001 przez 120 ms; druga część startuje po 40 ms
        const g40 = expRamp(0.08, 0.001, 0.04, 0.12);
        addTone(b, { type: 'triangle', f0: 880, g0: 0.08, g1: g40, dur: 0.04 });
        addTone(b, { type: 'triangle', f0: 1760, g0: g40, g1: 0.001, start: 0.04, dur: 0.08 });
        addTone(b, { type: 'sawtooth', f0: 1320, g0: g40, g1: 0.001, start: 0.04, dur: 0.08 });
    },
};

function toWav(samples) {
    const peak = samples.reduce((m, s) => Math.max(m, Math.abs(s)), 0);
    const scale = peak > 1 ? 1 / peak : 1;
    const data = Buffer.alloc(samples.length * 2);
    samples.forEach((s, i) => data.writeInt16LE(Math.round(s * scale * 32767), i * 2));
    const h = Buffer.alloc(44);
    h.write('RIFF', 0);
    h.writeUInt32LE(36 + data.length, 4);
    h.write('WAVEfmt ', 8);
    h.writeUInt32LE(16, 16);
    h.writeUInt16LE(1, 20);
    h.writeUInt16LE(1, 22);
    h.writeUInt32LE(RATE, 24);
    h.writeUInt32LE(RATE * 2, 28);
    h.writeUInt16LE(2, 32);
    h.writeUInt16LE(16, 34);
    h.write('data', 36);
    h.writeUInt32LE(data.length, 40);
    return Buffer.concat([h, data]);
}

mkdirSync(OUT, { recursive: true });
for (const [name, render] of Object.entries(sounds)) {
    const buf = new Float32Array(RATE);
    render(buf);
    let end = buf.length;
    while (end > 1 && Math.abs(buf[end - 1]) < 1e-4) end--;
    writeFileSync(path.join(OUT, `${name}.wav`), toWav(buf.subarray(0, end)));
    console.log(`${name}.wav (${Math.round((end / RATE) * 1000)} ms)`);
}
