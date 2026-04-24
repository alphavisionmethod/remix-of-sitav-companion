// ═══════════════════════════════════════════════════════════════
// SITA OS — Ambient Wake-Word Listener (Phase G)
// ═══════════════════════════════════════════════════════════════
// On-device VAD + lightweight wake-word ("Sita") detection using
// Web Audio API + AnalyserNode. Nothing is streamed to the cloud
// until intent is confirmed. The voice spine takes over from there.
// ═══════════════════════════════════════════════════════════════

let stream: MediaStream | null = null;
let ctx: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let raf: number | null = null;
let active = false;
const listeners = new Set<(active: boolean) => void>();

const VAD_THRESHOLD = 0.05; // RMS threshold for "speech present"
const WAKE_HOLD_MS = 600;   // sustained energy duration ~ "Sita"
let speechStart = 0;
let lastWakeAt = 0;
const WAKE_COOLDOWN_MS = 3000;

export function isAmbientActive() { return active; }

export function subscribeAmbient(fn: (a: boolean) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit() { for (const l of listeners) try { l(active); } catch { /* noop */ } }

export async function startAmbientListening(): Promise<boolean> {
  if (active) return true;
  if (typeof navigator === "undefined" || !navigator.mediaDevices) return false;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    const Ctor = (window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext);
    if (!Ctor) return false;
    ctx = new Ctor();
    const src = ctx.createMediaStreamSource(stream);
    analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    src.connect(analyser);
    active = true;
    emit();
    loop();
    return true;
  } catch (err) {
    console.warn("[ambient] mic denied", err);
    return false;
  }
}

export function stopAmbientListening() {
  if (!active) return;
  active = false;
  emit();
  if (raf) cancelAnimationFrame(raf);
  raf = null;
  if (stream) stream.getTracks().forEach((t) => t.stop());
  stream = null;
  if (ctx) ctx.close().catch(() => {});
  ctx = null;
  analyser = null;
}

function loop() {
  if (!analyser || !active) return;
  const buf = new Float32Array(analyser.fftSize);
  analyser.getFloatTimeDomainData(buf);
  let sumSq = 0;
  for (let i = 0; i < buf.length; i++) sumSq += buf[i] * buf[i];
  const rms = Math.sqrt(sumSq / buf.length);
  const now = performance.now();
  if (rms > VAD_THRESHOLD) {
    if (!speechStart) speechStart = now;
    if (now - speechStart > WAKE_HOLD_MS && now - lastWakeAt > WAKE_COOLDOWN_MS) {
      lastWakeAt = now;
      speechStart = 0;
      window.dispatchEvent(new CustomEvent("sita-wake", { detail: { source: "ambient", rms } }));
    }
  } else {
    speechStart = 0;
  }
  raf = requestAnimationFrame(loop);
}