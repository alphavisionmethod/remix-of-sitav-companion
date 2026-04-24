// ═══════════════════════════════════════════════════════════════
// SITA OS — Sita Personality Engine (Phase H)
// ═══════════════════════════════════════════════════════════════
// One row per user in `sita_personality_profiles`. Drives voice
// persona, formality, verbosity, honorific, quiet hours and humor.
// Cached in-memory + localStorage so every Sita surface (HUD, voice,
// briefings, agent summaries) speaks in one consistent voice.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

export type SitaPersona = "sita" | "jarvis" | "terse" | "warm" | "british";

export interface SitaPersonality {
  user_id: string;
  voice_persona: SitaPersona;
  formality: number;       // 0..1
  verbosity: number;       // 0..1
  proactivity: number;     // 0..1
  humor: number;           // 0..1
  honorific: string | null;
  preferred_pronouns: string | null;
  quiet_hours_start: string | null;  // "22:00"
  quiet_hours_end: string | null;    // "07:00"
  language: string;
  metadata: Record<string, unknown>;
}

const LS_KEY = "sita.personality.v1";

const DEFAULTS: SitaPersonality = {
  user_id: "",
  voice_persona: "sita",
  formality: 0.5,
  verbosity: 0.4,
  proactivity: 0.5,
  humor: 0.2,
  honorific: null,
  preferred_pronouns: null,
  quiet_hours_start: null,
  quiet_hours_end: null,
  language: "en",
  metadata: {},
};

let cache: SitaPersonality = DEFAULTS;
const listeners = new Set<(p: SitaPersonality) => void>();

function emit() { for (const l of listeners) try { l(cache); } catch { /* noop */ } }

function loadLocal(): SitaPersonality {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch { return DEFAULTS; }
}

function saveLocal(p: SitaPersonality) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(p)); } catch { /* noop */ }
}

export function readPersonality(): SitaPersonality { return cache; }

export function subscribePersonality(fn: (p: SitaPersonality) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export async function hydratePersonality(userId: string) {
  cache = { ...loadLocal(), user_id: userId };
  emit();
  try {
    const { data } = await supabase
      .from("sita_personality_profiles" as never)
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (data) {
      cache = { ...DEFAULTS, ...(data as unknown as SitaPersonality), user_id: userId };
      saveLocal(cache);
      emit();
    } else {
      // First-time: seed a default row so future updates work.
      await supabase.from("sita_personality_profiles" as never).insert({
        user_id: userId,
        voice_persona: cache.voice_persona,
        formality: cache.formality,
        verbosity: cache.verbosity,
        proactivity: cache.proactivity,
        humor: cache.humor,
        language: cache.language,
      } as never);
    }
  } catch (err) {
    console.warn("[personality] hydrate failed", err);
  }
}

export async function updatePersonality(patch: Partial<SitaPersonality>) {
  cache = { ...cache, ...patch };
  saveLocal(cache);
  emit();
  if (!cache.user_id) return;
  try {
    await supabase.from("sita_personality_profiles" as never).upsert({
      user_id: cache.user_id,
      voice_persona: cache.voice_persona,
      formality: cache.formality,
      verbosity: cache.verbosity,
      proactivity: cache.proactivity,
      humor: cache.humor,
      honorific: cache.honorific,
      preferred_pronouns: cache.preferred_pronouns,
      quiet_hours_start: cache.quiet_hours_start,
      quiet_hours_end: cache.quiet_hours_end,
      language: cache.language,
      metadata: cache.metadata,
    } as never, { onConflict: "user_id" } as never);
  } catch (err) {
    console.warn("[personality] persist failed", err);
  }
}

/** Returns true if "now" is inside the user's configured quiet hours. */
export function isQuietHours(now: Date = new Date()): boolean {
  const start = cache.quiet_hours_start;
  const end = cache.quiet_hours_end;
  if (!start || !end) return false;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  if (Number.isNaN(sh) || Number.isNaN(eh)) return false;
  const cur = now.getHours() * 60 + now.getMinutes();
  const startMin = sh * 60 + (sm || 0);
  const endMin = eh * 60 + (em || 0);
  if (startMin === endMin) return false;
  if (startMin < endMin) return cur >= startMin && cur < endMin;
  // Wraps midnight (e.g. 22:00 → 07:00)
  return cur >= startMin || cur < endMin;
}

/** Apply the active persona to a user-facing string (deterministic, no LLM). */
export function speakAs(text: string, opts: { addHonorific?: boolean } = {}): string {
  const p = cache;
  let out = text.trim();
  if (!out) return out;
  switch (p.voice_persona) {
    case "jarvis":
      if (opts.addHonorific && (p.honorific ?? "sir")) out = `${out}, ${p.honorific ?? "sir"}.`;
      break;
    case "terse":
      out = out.replace(/\b(please|kindly|just|simply)\b/gi, "").trim();
      break;
    case "warm":
      if (!/[.!?]$/.test(out)) out += ".";
      break;
    case "british":
      out = out.replace(/\bawesome\b/gi, "splendid").replace(/\bcool\b/gi, "rather good");
      break;
    default:
      break;
  }
  if (p.verbosity < 0.25 && out.length > 140) out = out.slice(0, 137) + "…";
  return out;
}

/** Returns a system-prompt fragment so server-side prompts inherit persona. */
export function buildPersonaPromptFragment(): string {
  const p = cache;
  const lines = [
    `Persona: ${p.voice_persona}.`,
    `Formality: ${(p.formality * 100).toFixed(0)}%.`,
    `Verbosity: ${(p.verbosity * 100).toFixed(0)}%.`,
    `Proactivity: ${(p.proactivity * 100).toFixed(0)}%.`,
    `Humor: ${(p.humor * 100).toFixed(0)}%.`,
  ];
  if (p.honorific) lines.push(`Address the user as "${p.honorific}".`);
  if (p.language && p.language !== "en") lines.push(`Reply in ${p.language}.`);
  return lines.join(" ");
}