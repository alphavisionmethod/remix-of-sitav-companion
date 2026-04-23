// ═══════════════════════════════════════════════════════════════
// SITA OS — Voice Intent Router (Phase B)
// ═══════════════════════════════════════════════════════════════
// Maps a raw user utterance into a structured SitaIntent that the
// host bridge can execute. Pure function — no side effects, no DOM.
//
// Phase C extension: also reads the focused surface's screen context
// so deictic commands like "summarize this" or "schedule this" can
// be resolved without re-asking the user what "this" is.
// ═══════════════════════════════════════════════════════════════

import {
  readScreenContext,
  type SitaScreenContext,
} from "@/lib/sita-context/sita-screen-context";

export type SitaIntent =
  | { kind: "launch_app"; appId: string; raw: string }
  | { kind: "focus_start"; minutes: number; raw: string }
  | { kind: "focus_stop"; raw: string }
  | { kind: "open_command_palette"; raw: string }
  | { kind: "open_launcher"; raw: string }
  | { kind: "open_control_center"; raw: string }
  | { kind: "open_notifications"; raw: string }
  | { kind: "summarize_screen"; context: SitaScreenContext | null; raw: string }
  | { kind: "act_on_screen"; verb: string; context: SitaScreenContext | null; raw: string }
  | { kind: "brain"; utterance: string; context: SitaScreenContext | null };

const APP_ALIASES: Record<string, string[]> = {
  calendar: ["calendar", "agenda", "schedule"],
  mail: ["mail", "email", "inbox"],
  finder: ["finder", "files", "file manager"],
  settings: ["settings", "preferences"],
  notes: ["notes", "notepad"],
  terminal: ["terminal", "shell", "console"],
  weather: ["weather", "forecast"],
  business: ["business", "crm", "business center"],
  finance: ["finance", "money", "money center"],
  concierge: ["concierge", "concierge center"],
  "personal-brain": ["brain", "personal brain", "sita brain"],
  "mission-control": ["mission control", "admin"],
  "app-store": ["app store", "store"],
};

const OPEN_VERBS = ["open", "launch", "start", "show", "go to", "switch to"];
const SUMMARIZE_VERBS = ["summarize", "summarise", "tl;dr", "explain"];
const ACT_DEICTIC = ["this", "that", "it", "current"];

function containsAny(haystack: string, needles: string[]): boolean {
  return needles.some((n) => haystack.includes(n));
}

function findApp(utterance: string): string | null {
  for (const [appId, aliases] of Object.entries(APP_ALIASES)) {
    if (aliases.some((a) => utterance.includes(a))) return appId;
  }
  return null;
}

function parseFocusMinutes(utterance: string): number {
  const m = utterance.match(/(\d{1,3})\s*(?:min|minute|minutes|m\b)/);
  if (m) return Math.max(5, Math.min(180, parseInt(m[1], 10)));
  if (/half\s*hour/.test(utterance)) return 30;
  if (/hour/.test(utterance)) return 60;
  return 25;
}

export function routeVoiceIntent(rawUtterance: string): SitaIntent {
  const utterance = rawUtterance.toLowerCase().trim();
  const screenContext = readScreenContext();

  // Focus mode
  if (/focus(?:\s*mode)?|deep\s*work|pomodoro/.test(utterance)) {
    if (/stop|end|cancel|exit/.test(utterance)) {
      return { kind: "focus_stop", raw: rawUtterance };
    }
    return { kind: "focus_start", minutes: parseFocusMinutes(utterance), raw: rawUtterance };
  }

  // System surfaces
  if (/command\s*palette|spotlight/.test(utterance)) {
    return { kind: "open_command_palette", raw: rawUtterance };
  }
  if (/control\s*center|control\s*panel|quick\s*settings/.test(utterance)) {
    return { kind: "open_control_center", raw: rawUtterance };
  }
  if (/notification(s)?(\s*center)?|alerts?/.test(utterance) && containsAny(utterance, OPEN_VERBS.concat(["show"]))) {
    return { kind: "open_notifications", raw: rawUtterance };
  }
  if (/(app\s*launcher|launchpad|all\s*apps)/.test(utterance)) {
    return { kind: "open_launcher", raw: rawUtterance };
  }

  // App launching
  if (containsAny(utterance, OPEN_VERBS)) {
    const appId = findApp(utterance);
    if (appId) return { kind: "launch_app", appId, raw: rawUtterance };
  }

  // Phase C — deictic commands resolve via screen context
  if (containsAny(utterance, SUMMARIZE_VERBS) && containsAny(utterance, ACT_DEICTIC)) {
    return { kind: "summarize_screen", context: screenContext, raw: rawUtterance };
  }
  if (containsAny(utterance, ACT_DEICTIC) && /^(schedule|add|save|share|send|export|copy)/.test(utterance)) {
    const verb = utterance.split(/\s+/)[0] ?? "act";
    return { kind: "act_on_screen", verb, context: screenContext, raw: rawUtterance };
  }

  // Brain fallback (always carries screen context for free)
  return { kind: "brain", utterance: rawUtterance, context: screenContext };
}