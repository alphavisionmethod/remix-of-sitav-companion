// ═══════════════════════════════════════════════════════════════
// SITA OS — Embodiment: Persona ↔ Voice spine bridge (Phase I)
// ═══════════════════════════════════════════════════════════════
// Pure helpers that map the active personality (Phase H) onto the
// existing voice spine (Phase B). No new STT/TTS engines — we wrap
// what already exists so the same Sita "speaks" in the user's
// chosen persona everywhere (orb, briefings, replies, agent).
// ═══════════════════════════════════════════════════════════════

import {
  readPersonality,
  speakAs,
  isQuietHours,
  type SitaPersona,
} from "@/lib/sita-sentience/personality";

const LS_VOICE = "sita.embodiment.voiceURI";
const LS_ENABLED = "sita.embodiment.enabled";

export function isEmbodimentEnabled(): boolean {
  try { return localStorage.getItem(LS_ENABLED) !== "false"; } catch { return true; }
}

export function setEmbodimentEnabled(enabled: boolean) {
  try { localStorage.setItem(LS_ENABLED, enabled ? "true" : "false"); } catch { /* noop */ }
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

/** Choose the best available browser voice for the active persona. */
export function pickVoiceForActivePersona(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices?.length) return null;
  const p = readPersonality();

  const prefURI = getPreferredVoiceURI();
  if (prefURI) {
    const exact = voices.find((v) => v.voiceURI === prefURI);
    if (exact) return exact;
  }

  const lang = (p.language || "en").toLowerCase();
  const langPool = voices.filter((v) => v.lang?.toLowerCase().startsWith(lang));
  const pool = langPool.length ? langPool : voices;

  const persona: SitaPersona = p.voice_persona;
  const wantBritish = persona === "british" || persona === "jarvis";
  const wantFemale = persona === "sita" || persona === "warm";

  if (wantBritish) {
    const british = pool.find((v) => /en-GB|British|UK|Daniel|Oliver|Kate|Serena/i.test(`${v.lang} ${v.name}`));
    if (british) return british;
  }
  if (wantFemale) {
    const female = pool.find((v) => /female|samantha|victoria|tessa|amelie|karen|moira|sita|kate|serena/i.test(v.name));
    if (female) return female;
  } else {
    const male = pool.find((v) => /male|daniel|alex|oliver|fred|ralph|jarvis/i.test(v.name));
    if (male) return male;
  }
  return pool[0] ?? null;
}

/** Rate (0.6..1.4) biased by persona + verbosity. */
export function rateForActivePersona(): number {
  const p = readPersonality();
  const base =
    p.voice_persona === "terse" ? 1.15 :
    p.voice_persona === "warm" ? 0.92 :
    1.0;
  return Math.min(1.4, Math.max(0.6, base + (0.5 - p.verbosity) * 0.1));
}

/** Pitch (0.6..1.4) per persona. */
export function pitchForActivePersona(): number {
  const p = readPersonality();
  switch (p.voice_persona) {
    case "jarvis": return 0.9;
    case "british": return 0.95;
    case "warm": return 1.1;
    case "terse": return 1.0;
    default: return 1.05;
  }
}

export interface ShapeOptions {
  /** Address with honorific (jarvis only). */
  addHonorific?: boolean;
  /** Skip quiet-hours suppression (e.g. user-initiated voice command). */
  override?: boolean;
}

/**
 * Shape a reply string with the active persona before TTS plays it.
 * Returns null when speech should be suppressed (quiet hours / muted).
 */
export function shapeReplyForActivePersona(text: string, opts: ShapeOptions = {}): string | null {
  if (!text?.trim()) return null;
  if (!isEmbodimentEnabled()) return text.trim();
  if (isQuietHours() && !opts.override) return null;
  return speakAs(text, { addHonorific: opts.addHonorific });
}