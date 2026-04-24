// ═══════════════════════════════════════════════════════════════
// SITA OS — Sita Embodiment: Wake-word detector (Phase I)
// ═══════════════════════════════════════════════════════════════
// On-device wake-word listener using the browser's SpeechRecognition
// API. Detects "sita" / "jarvis" / "hey sita" anywhere in a phrase
// and dispatches a `sita-wake` CustomEvent so the existing voice
// spine (Phase B) can take over capture. No audio leaves the device.
// ═══════════════════════════════════════════════════════════════

const LS_ENABLED = "sita.embodiment.wake.enabled";
const LS_PHRASES = "sita.embodiment.wake.phrases";

const DEFAULT_PHRASES = ["sita", "jarvis", "hey sita", "hey jarvis"];

interface RecognitionLike {
  start: () => void;
  stop: () => void;
  abort?: () => void;
  onresult: ((e: unknown) => void) | null;
  onerror: ((e: unknown) => void) | null;
  onend: ((e?: unknown) => void) | null;
  continuous: boolean;
  interimResults: boolean;
  lang: string;
}

type RecognitionCtor = new () => RecognitionLike;

function getRecognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };
  const ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return (ctor as RecognitionCtor) ?? null;
}

export function isWakeWordSupported(): boolean {
  return getRecognitionCtor() !== null;
}

export function isWakeWordEnabled(): boolean {
  try { return localStorage.getItem(LS_ENABLED) === "true"; } catch { return false; }
}

export function getWakePhrases(): string[] {
  try {
    const raw = localStorage.getItem(LS_PHRASES);
    if (!raw) return DEFAULT_PHRASES;
    const arr = JSON.parse(raw) as string[];
    return Array.isArray(arr) && arr.length ? arr.map((s) => s.toLowerCase()) : DEFAULT_PHRASES;
  } catch { return DEFAULT_PHRASES; }
}

export function setWakePhrases(phrases: string[]) {
  try { localStorage.setItem(LS_PHRASES, JSON.stringify(phrases.map((s) => s.toLowerCase()))); } catch { /* noop */ }
}

let active: RecognitionLike | null = null;
let restartTimer: ReturnType<typeof setTimeout> | null = null;
let consecutiveErrors = 0;
let stoppedByUser = false;

function emitWake(phrase: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("sita-wake", { detail: { phrase, ts: Date.now() } }));
}

function handleResult(e: unknown) {
  const evt = e as { results?: ArrayLike<ArrayLike<{ transcript?: string }>> };
  if (!evt?.results) return;
  const phrases = getWakePhrases();
  for (let i = 0; i < evt.results.length; i++) {
    const alt = evt.results[i]?.[0];
    const transcript = (alt?.transcript ?? "").trim().toLowerCase();
    if (!transcript) continue;
    for (const ph of phrases) {
      if (transcript === ph || transcript.includes(` ${ph}`) || transcript.startsWith(`${ph} `) || transcript === ph) {
        emitWake(ph);
        return;
      }
    }
  }
}

function scheduleRestart(delayMs: number) {
  if (restartTimer) clearTimeout(restartTimer);
  restartTimer = setTimeout(() => {
    if (!stoppedByUser && isWakeWordEnabled()) startWakeWord();
  }, delayMs);
}

export function startWakeWord(): boolean {
  const Ctor = getRecognitionCtor();
  if (!Ctor) return false;
  if (active) return true;
  stoppedByUser = false;
  try {
    const r = new Ctor();
    r.continuous = true;
    r.interimResults = false;
    r.lang = "en-US";
    r.onresult = handleResult;
    r.onerror = (err) => {
      const code = (err as { error?: string })?.error ?? "unknown";
      if (code === "not-allowed" || code === "service-not-allowed") {
        // Permission denied — disable so we don't spam restarts.
        try { localStorage.setItem(LS_ENABLED, "false"); } catch { /* noop */ }
        active = null;
        return;
      }
      consecutiveErrors++;
      const backoff = Math.min(8000, 500 * Math.pow(2, consecutiveErrors));
      scheduleRestart(backoff);
    };
    r.onend = () => {
      active = null;
      if (!stoppedByUser && isWakeWordEnabled()) scheduleRestart(800);
    };
    r.start();
    active = r;
    consecutiveErrors = 0;
    return true;
  } catch (err) {
    console.warn("[wake-word] failed to start", err);
    return false;
  }
}

export function stopWakeWord(): void {
  stoppedByUser = true;
  if (restartTimer) { clearTimeout(restartTimer); restartTimer = null; }
  if (!active) return;
  try { active.stop(); } catch { /* noop */ }
  try { active.abort?.(); } catch { /* noop */ }
  active = null;
}

export function setWakeWordEnabled(enabled: boolean): void {
  try { localStorage.setItem(LS_ENABLED, enabled ? "true" : "false"); } catch { /* noop */ }
  if (enabled) startWakeWord();
  else stopWakeWord();
}

/** Subscribe to wake events. Returns an unsubscribe function. */
export function onWake(handler: (phrase: string) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const fn = (e: Event) => {
    const detail = (e as CustomEvent<{ phrase: string }>).detail;
    if (detail?.phrase) handler(detail.phrase);
  };
  window.addEventListener("sita-wake", fn);
  return () => window.removeEventListener("sita-wake", fn);
}