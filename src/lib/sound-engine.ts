// SITA OS — Ambient Sound Engine (Web Audio API, zero assets)

let ctx: AudioContext | null = null;
let enabled = true;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function play(freq: number, duration: number, type: OscillatorType = "sine", vol = 0.08) {
  if (!enabled) return;
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime);
    gain.gain.setValueAtTime(vol, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.connect(gain).connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + duration);
  } catch {
    // Audio not available
  }
}

export const SoundEngine = {
  /** Toggle sound on/off */
  setEnabled(v: boolean) { enabled = v; localStorage.setItem("sita-sound", v ? "1" : "0"); },
  isEnabled() { return enabled; },
  init() { enabled = localStorage.getItem("sita-sound") !== "0"; },

  /** Unlock / authentication success */
  unlock() { play(523, 0.15); setTimeout(() => play(659, 0.15), 80); setTimeout(() => play(784, 0.2), 160); },

  /** Approval granted */
  approve() { play(587, 0.12); setTimeout(() => play(784, 0.18), 100); },

  /** Error / denial */
  error() { play(220, 0.25, "square", 0.06); setTimeout(() => play(196, 0.3, "square", 0.05), 150); },

  /** Notification received */
  notify() { play(880, 0.08, "sine", 0.05); setTimeout(() => play(660, 0.1, "sine", 0.04), 100); },

  /** Boot complete */
  boot() { play(392, 0.1); setTimeout(() => play(523, 0.1), 120); setTimeout(() => play(659, 0.12), 240); setTimeout(() => play(784, 0.2), 360); },

  /** Subtle click */
  click() { play(1200, 0.03, "sine", 0.03); },

  /** Capture saved */
  capture() { play(698, 0.08); setTimeout(() => play(880, 0.1), 80); },
};
