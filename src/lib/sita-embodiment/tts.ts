// ═══════════════════════════════════════════════════════════════
// SITA OS — Sita Embodiment: Persona-aware TTS (Phase I)
// ═══════════════════════════════════════════════════════════════
// Wraps the browser's Web Speech API and biases voice/rate/pitch
// from the user's active persona (sita | jarvis | terse | warm |
// british). Honors quiet hours + a global mute toggle. Deterministic
// fallback: if speechSynthesis is unavailable, we no-op gracefully.
// ═══════════════════════════════════════════════════════════════

import { readPersonality, isQuietHours, speakAs, type SitaPersona } from "@/lib/sita-sentience/personality";

const LS_ENABLED = "sita.embodiment.tts.enabled";
const LS_VOICE = "sita.embodiment.tts.voiceURI";

function isAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

export function isTTSEnabled(): boolean {
  if (!isAvailable()) return false;
  try { return localStorage.getItem(LS_ENABLED) !== "false"; } catch { return true; }
}

export function setTTSEnabled(enabled: boolean) {
  try { localStorage.setItem(LS_ENABLED, enabled ? "true" : "false"); } catch { /* noop */ }
  if (!enabled) cancel();
}

export function getPreferredVoiceURI(): string | null {
  try { return localStorage.getItem(LS_VOICE); } catch { return null; }
}

export function setPreferredVoiceURI(uri: string | null) {
  try {
    if (uri) localStorage.setItem(LS_VOICE, uri);
    else localStorage.removeItem(LS_VOICE);
  } catch { /* noop */ }
}

export function listVoices(): SpeechSynthesisVoice[] {
  if (!isAvailable()) return [];
  return window.speechSynthesis.getVoices();
}

function pickVoiceForPersona(persona: SitaPersona, lang: string): SpeechSynthesisVoice | null {
  const voices = listVoices();
  if (!voices.length) return null;

  const preferredURI = getPreferredVoiceURI();
  if (preferredURI) {
    const exact = voices.find((v) => v.voiceURI === preferredURI);
    if (exact) return exact;
  }

  const langMatches = voices.filter((v) => v.lang?.toLowerCase().startsWith(lang.toLowerCase()));
  const pool = langMatches.length ? langMatches : voices;

  // Persona → voice-name heuristic (no provider lock-in).
  const wantBritish = persona === "british" || persona === "jarvis";
  const wantFemale = persona === "sita" || persona === "warm";

  const matchers: Array<(v: SpeechSynthesisVoice) => boolean> = [];
  if (wantBritish) matchers.push((v) => /en-GB|British|UK/i.test(`${v.lang} ${v.name}`));
  if (wantFemale) matchers.push((v) => /female|samantha|victoria|tessa|amelie|karen|moira|sita/i.test(v.name));
  else matchers.push((v) => /male|daniel|alex|oliver|fred|ralph|jarvis/i.test(v.name));

  for (const m of matchers) {
    const hit = pool.find(m);
    if (hit) return hit;
  }
  return pool[0] ?? null;
}

function rateForPersona(persona: SitaPersona, verbosity: number): number {
  // 0.6..1.4 — terse persona speaks faster, warm speaks slower.
  const base = persona === "terse" ? 1.15 : persona === "warm" ? 0.92 : persona === "jarvis" ? 1.0 : 1.0;
  // Higher verbosity → slightly slower delivery so listeners can keep up.
  return Math.min(1.4, Math.max(0.6, base + (0.5 - verbosity) * 0.1));
}

function pitchForPersona(persona: SitaPersona): number {
  switch (persona) {
    case "jarvis": return 0.9;
    case "british": return 0.95;
    case "warm": return 1.1;
    case "terse": return 1.0;
    default: return 1.05;
  }
}

export interface SpeakOptions {
  /** Override the persona-applied transformation (already-shaped text). */
  raw?: boolean;
  /** Address the user with their honorific (jarvis only). */
  addHonorific?: boolean;
  /** Cancel any in-flight utterance first. */
  interrupt?: boolean;
  /** Skip quiet-hours guard (e.g. for explicit user requests). */
  override?: boolean;
}

export function speak(text: string, opts: SpeakOptions = {}): void {
  if (!text?.trim()) return;
  if (!isAvailable()) return;
  if (!isTTSEnabled() && !opts.override) return;
  if (isQuietHours() && !opts.override) return;

  const p = readPersonality();
  const finalText = opts.raw ? text : speakAs(text, { addHonorific: opts.addHonorific });
  if (!finalText.trim()) return;

  if (opts.interrupt) cancel();

  const u = new SpeechSynthesisUtterance(finalText);
  const voice = pickVoiceForPersona(p.voice_persona, p.language || "en");
  if (voice) u.voice = voice;
  u.lang = voice?.lang || (p.language || "en");
  u.rate = rateForPersona(p.voice_persona, p.verbosity);
  u.pitch = pitchForPersona(p.voice_persona);
  u.volume = 1.0;
  try { window.speechSynthesis.speak(u); } catch { /* noop */ }
}

export function cancel(): void {
  if (!isAvailable()) return;
  try { window.speechSynthesis.cancel(); } catch { /* noop */ }
}

/** Awaits voice-list population (Chrome lazily loads voices). */
export function whenVoicesReady(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!isAvailable()) return resolve([]);
    const initial = listVoices();
    if (initial.length) return resolve(initial);
    const handler = () => {
      window.speechSynthesis.removeEventListener("voiceschanged", handler);
      resolve(listVoices());
    };
    window.speechSynthesis.addEventListener("voiceschanged", handler);
    setTimeout(() => resolve(listVoices()), 1500);
  });
}