// ═══════════════════════════════════════════════════════════════
// SITA OS — Spatial Sound Engine (Web Audio API, zero assets)
// Complete sound design for premium OS experience
// ═══════════════════════════════════════════════════════════════

let ctx: AudioContext | null = null;
let enabled = true;
let calmInterval: ReturnType<typeof setTimeout> | null = null;
let calmActive = false;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

// ── Spatial Panning ──────────────────────────────────────────

function screenToPan(screenX?: number): number {
  if (screenX === undefined) return 0;
  return Math.max(-1, Math.min(1, (screenX * 2) - 1));
}

function play(
  freq: number,
  duration: number,
  type: OscillatorType = "sine",
  vol = 0.08,
  panX?: number,
) {
  if (!enabled) return;
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime);
    gain.gain.setValueAtTime(vol, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);

    const panner = c.createStereoPanner();
    panner.pan.setValueAtTime(screenToPan(panX), c.currentTime);

    osc.connect(gain).connect(panner).connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + duration);
  } catch {
    // Audio not available
  }
}

function playSpatial(
  freq: number,
  duration: number,
  type: OscillatorType = "sine",
  vol = 0.08,
  screenPixelX?: number,
) {
  const panX = screenPixelX !== undefined
    ? screenPixelX / (window.innerWidth || 1)
    : undefined;
  play(freq, duration, type, vol, panX);
}

function playChord(
  freqs: number[],
  duration: number,
  type: OscillatorType = "sine",
  vol = 0.04,
  panX?: number,
) {
  freqs.forEach(f => play(f, duration, type, vol / freqs.length, panX));
}

// ── Calm Mode Ambient Chimes ─────────────────────────────────

const PENTATONIC = [261.6, 293.7, 329.6, 392.0, 440.0];
const CALM_OCTAVES = [0.5, 1, 2];

function randomChime() {
  if (!enabled || !calmActive) return;
  try {
    const c = getCtx();
    const now = c.currentTime;
    const noteCount = 1 + Math.floor(Math.random() * 2);
    const pan = (Math.random() * 2) - 1;

    for (let i = 0; i < noteCount; i++) {
      const baseFreq = PENTATONIC[Math.floor(Math.random() * PENTATONIC.length)];
      const octave = CALM_OCTAVES[Math.floor(Math.random() * CALM_OCTAVES.length)];
      const freq = baseFreq * octave;
      const delay = i * (0.3 + Math.random() * 0.5);
      const duration = 1.5 + Math.random() * 2;
      const vol = 0.015 + Math.random() * 0.015;

      const osc = c.createOscillator();
      const gain = c.createGain();
      const panner = c.createStereoPanner();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + delay);
      const lfo = c.createOscillator();
      const lfoGain = c.createGain();
      lfo.frequency.setValueAtTime(3 + Math.random() * 3, now);
      lfoGain.gain.setValueAtTime(freq * 0.003, now);
      lfo.connect(lfoGain).connect(osc.frequency);
      lfo.start(now + delay);
      lfo.stop(now + delay + duration);

      gain.gain.setValueAtTime(0, now + delay);
      gain.gain.linearRampToValueAtTime(vol, now + delay + 0.15);
      gain.gain.setValueAtTime(vol, now + delay + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + duration);

      const panDrift = pan + (Math.random() - 0.5) * 0.3;
      panner.pan.setValueAtTime(pan, now + delay);
      panner.pan.linearRampToValueAtTime(
        Math.max(-1, Math.min(1, panDrift)),
        now + delay + duration,
      );

      osc.connect(gain).connect(panner).connect(c.destination);
      osc.start(now + delay);
      osc.stop(now + delay + duration);
    }
  } catch { /* Audio not available */ }
}

function startCalmAmbient() {
  if (calmActive) return;
  calmActive = true;
  playChord([329.6, 440.0, 523.3], 2.5, "sine", 0.03, 0.5);
  const scheduleNext = () => {
    if (!calmActive) return;
    const delay = 4000 + Math.random() * 8000;
    calmInterval = setTimeout(() => { randomChime(); scheduleNext(); }, delay);
  };
  scheduleNext();
}

function stopCalmAmbient() {
  calmActive = false;
  if (calmInterval) { clearTimeout(calmInterval); calmInterval = null; }
}

function breathIn() {
  if (!enabled) return;
  try {
    const c = getCtx();
    const now = c.currentTime;
    const bufferSize = c.sampleRate * 2;
    const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.5;

    const noise = c.createBufferSource();
    noise.buffer = buffer;
    const filter = c.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(200, now);
    filter.frequency.linearRampToValueAtTime(800, now + 1.5);
    filter.Q.setValueAtTime(1, now);
    const gain = c.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.02, now + 0.8);
    gain.gain.linearRampToValueAtTime(0, now + 2);

    noise.connect(filter).connect(gain).connect(c.destination);
    noise.start(now);
    noise.stop(now + 2);
  } catch { /* Audio not available */ }
}

// ═══════════════════════════════════════════════════════════════
// Public API
// ═══════════════════════════════════════════════════════════════

export const SoundEngine = {
  setEnabled(v: boolean) { enabled = v; localStorage.setItem("sita-sound", v ? "1" : "0"); if (!v) stopCalmAmbient(); },
  isEnabled() { return enabled; },
  init() { enabled = localStorage.getItem("sita-sound") !== "0"; },

  // ── Original Spatial Sounds ────────────────────────────────

  unlock(x?: number) {
    playSpatial(523, 0.15, "sine", 0.08, x);
    setTimeout(() => playSpatial(659, 0.15, "sine", 0.08, x), 80);
    setTimeout(() => playSpatial(784, 0.2, "sine", 0.08, x), 160);
  },

  approve(x?: number) {
    playSpatial(587, 0.12, "sine", 0.08, x);
    setTimeout(() => playSpatial(784, 0.18, "sine", 0.08, x), 100);
  },

  error(x?: number) {
    playSpatial(220, 0.25, "square", 0.06, x);
    setTimeout(() => playSpatial(196, 0.3, "square", 0.05, x), 150);
  },

  notify(x?: number) {
    playSpatial(880, 0.08, "sine", 0.05, x);
    setTimeout(() => playSpatial(660, 0.1, "sine", 0.04, x), 100);
  },

  boot() {
    play(392, 0.1, "sine", 0.08, 0.4);
    setTimeout(() => play(523, 0.1, "sine", 0.08, 0.45), 120);
    setTimeout(() => play(659, 0.12, "sine", 0.08, 0.55), 240);
    setTimeout(() => play(784, 0.2, "sine", 0.08, 0.6), 360);
  },

  click(x?: number) { playSpatial(1200, 0.03, "sine", 0.03, x); },

  capture(x?: number) {
    playSpatial(698, 0.08, "sine", 0.08, x);
    setTimeout(() => playSpatial(880, 0.1, "sine", 0.08, x), 80);
  },

  snap(x?: number) {
    playSpatial(150, 0.08, "sine", 0.06, x);
    playSpatial(300, 0.04, "triangle", 0.03, x);
  },

  dragStart(x?: number) { playSpatial(600, 0.02, "sine", 0.02, x); },

  magnetDock(x?: number) {
    playSpatial(440, 0.06, "sine", 0.04, x);
    setTimeout(() => playSpatial(554, 0.08, "sine", 0.03, x), 40);
  },

  // ── Window Sounds ──────────────────────────────────────────

  windowOpen(x?: number) {
    playSpatial(440, 0.12, "sine", 0.05, x);
    setTimeout(() => playSpatial(554, 0.14, "sine", 0.04, x), 60);
  },

  windowClose(x?: number) {
    playSpatial(440, 0.1, "sine", 0.04, x);
    setTimeout(() => playSpatial(349, 0.12, "sine", 0.03, x), 50);
  },

  windowMinimize(x?: number) {
    playSpatial(600, 0.06, "sine", 0.03, x);
    setTimeout(() => playSpatial(400, 0.08, "sine", 0.02, x), 40);
  },

  windowMaximize(x?: number) {
    playSpatial(392, 0.1, "sine", 0.04, x);
    setTimeout(() => playSpatial(523, 0.12, "sine", 0.04, x), 60);
    setTimeout(() => playSpatial(659, 0.14, "sine", 0.03, x), 120);
  },

  // ── Menu & Navigation Sounds ───────────────────────────────

  menuOpen() { play(800, 0.04, "sine", 0.025); },
  menuClose() { play(600, 0.03, "sine", 0.02); },

  tabSwitch(x?: number) { playSpatial(900, 0.025, "sine", 0.02, x); },

  // ── Interaction Sounds ─────────────────────────────────────

  dragDrop(x?: number) {
    playSpatial(200, 0.1, "sine", 0.05, x);
    playSpatial(350, 0.06, "triangle", 0.03, x);
  },

  success(x?: number) {
    playSpatial(523, 0.1, "sine", 0.06, x);
    setTimeout(() => playSpatial(659, 0.1, "sine", 0.06, x), 80);
    setTimeout(() => playSpatial(784, 0.15, "sine", 0.06, x), 160);
  },

  warning(x?: number) {
    playSpatial(440, 0.15, "triangle", 0.05, x);
    setTimeout(() => playSpatial(380, 0.18, "triangle", 0.04, x), 120);
  },

  toggle(x?: number) {
    playSpatial(700, 0.04, "sine", 0.03, x);
    setTimeout(() => playSpatial(900, 0.05, "sine", 0.02, x), 30);
  },

  typing() { play(1400 + Math.random() * 200, 0.015, "sine", 0.008); },

  focusMode() { breathIn(); },

  volumeChange() { play(660, 0.08, "sine", 0.05); },

  // ── Calm Mode Ambient ─────────────────────────────────────

  startCalm() { startCalmAmbient(); },
  stopCalm() { stopCalmAmbient(); },
  isCalmActive() { return calmActive; },
  breathIn() { breathIn(); },

  chime(x?: number) {
    const freq = PENTATONIC[Math.floor(Math.random() * PENTATONIC.length)];
    const panX = x !== undefined ? x / (window.innerWidth || 1) : undefined;
    play(freq, 1.5, "sine", 0.04, panX);
    play(freq * 2, 1.2, "sine", 0.02, panX);
  },
};
