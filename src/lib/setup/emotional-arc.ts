// ═══════════════════════════════════════════════════════════════
// SITA OS — Emotional Arc Controller
// Maps each setup phase to emotional targets for ambient visuals,
// pacing, and chapter choreography
// ═══════════════════════════════════════════════════════════════

import type { SetupPhaseId } from "@/packages/contracts/specialized/setup-orchestration";

export type EmotionalTarget =
  | "mystery"
  | "safety"
  | "ownership"
  | "personalization"
  | "confidence"
  | "delight"
  | "arrival";

export type ChapterName =
  | "Awakening"
  | "Foundation"
  | "Identity"
  | "Personalization"
  | "Intelligence"
  | "Activation"
  | "Arrival";

export interface EmotionalPhaseMetadata {
  target: EmotionalTarget;
  chapter: ChapterName;
  /** 0–1 energy level: 0 = calm/ambient, 1 = energetic/climactic */
  energy: number;
  /** 0–1 warmth: 0 = cool/abstract, 1 = warm/personal */
  warmth: number;
  /** HSL hue for ambient canvas tinting (0-360) */
  ambientHue: number;
  /** Saturation modifier for ambient canvas (0-100) */
  ambientSaturation: number;
  /** Whether this phase is a "signature wow" moment */
  isSignatureMoment: boolean;
  /** Whether this phase starts a new chapter (triggers chapter transition) */
  isChapterStart: boolean;
}

const PHASE_ARC: Record<string, EmotionalPhaseMetadata> = {
  // ── Chapter: Awakening ──────────────────────────────────
  "boot":                { target: "mystery",         chapter: "Awakening",       energy: 0.2, warmth: 0.1, ambientHue: 265, ambientSaturation: 30, isSignatureMoment: true,  isChapterStart: true },
  "secure-foundation":   { target: "safety",          chapter: "Awakening",       energy: 0.3, warmth: 0.15, ambientHue: 220, ambientSaturation: 40, isSignatureMoment: true,  isChapterStart: false },

  // ── Chapter: Foundation ─────────────────────────────────
  "language-region":     { target: "ownership",       chapter: "Foundation",      energy: 0.35, warmth: 0.25, ambientHue: 200, ambientSaturation: 45, isSignatureMoment: true,  isChapterStart: true },
  "network-setup":       { target: "safety",          chapter: "Foundation",      energy: 0.3, warmth: 0.2, ambientHue: 210, ambientSaturation: 40, isSignatureMoment: false, isChapterStart: false },
  "device-readiness":    { target: "safety",          chapter: "Foundation",      energy: 0.35, warmth: 0.25, ambientHue: 200, ambientSaturation: 42, isSignatureMoment: false, isChapterStart: false },
  "device-ownership":    { target: "ownership",       chapter: "Foundation",      energy: 0.4, warmth: 0.3, ambientHue: 195, ambientSaturation: 45, isSignatureMoment: false, isChapterStart: false },

  // ── Chapter: Identity ───────────────────────────────────
  "account-environment": { target: "ownership",       chapter: "Identity",        energy: 0.4, warmth: 0.35, ambientHue: 250, ambientSaturation: 45, isSignatureMoment: false, isChapterStart: true },
  "restore":             { target: "delight",         chapter: "Identity",        energy: 0.5, warmth: 0.5, ambientHue: 265, ambientSaturation: 50, isSignatureMoment: true,  isChapterStart: false },
  "access-protection":   { target: "safety",          chapter: "Identity",        energy: 0.35, warmth: 0.3, ambientHue: 220, ambientSaturation: 42, isSignatureMoment: false, isChapterStart: false },
  "privacy-transparency":{ target: "confidence",      chapter: "Identity",        energy: 0.4, warmth: 0.35, ambientHue: 230, ambientSaturation: 44, isSignatureMoment: false, isChapterStart: false },

  // ── Chapter: Personalization ────────────────────────────
  "quick-identity":      { target: "personalization", chapter: "Personalization", energy: 0.5, warmth: 0.45, ambientHue: 280, ambientSaturation: 48, isSignatureMoment: false, isChapterStart: true },
  "deep-world-modeling": { target: "personalization", chapter: "Personalization", energy: 0.55, warmth: 0.55, ambientHue: 285, ambientSaturation: 50, isSignatureMoment: true,  isChapterStart: false },
  "primary-use-mode":    { target: "personalization", chapter: "Personalization", energy: 0.5, warmth: 0.5, ambientHue: 275, ambientSaturation: 48, isSignatureMoment: false, isChapterStart: false },
  "identity":            { target: "ownership",       chapter: "Personalization", energy: 0.45, warmth: 0.4, ambientHue: 270, ambientSaturation: 46, isSignatureMoment: false, isChapterStart: false },
  "want-less-of":        { target: "personalization", chapter: "Personalization", energy: 0.45, warmth: 0.45, ambientHue: 275, ambientSaturation: 47, isSignatureMoment: false, isChapterStart: false },
  "protect-most":        { target: "confidence",      chapter: "Personalization", energy: 0.45, warmth: 0.4, ambientHue: 260, ambientSaturation: 45, isSignatureMoment: false, isChapterStart: false },

  // ── Chapter: Intelligence ───────────────────────────────
  "trust-calibration":   { target: "confidence",      chapter: "Intelligence",    energy: 0.6, warmth: 0.55, ambientHue: 255, ambientSaturation: 52, isSignatureMoment: true,  isChapterStart: true },
  "advisor-activation":  { target: "confidence",      chapter: "Intelligence",    energy: 0.65, warmth: 0.6, ambientHue: 260, ambientSaturation: 55, isSignatureMoment: false, isChapterStart: false },
  "trust":               { target: "confidence",      chapter: "Intelligence",    energy: 0.55, warmth: 0.5, ambientHue: 250, ambientSaturation: 50, isSignatureMoment: false, isChapterStart: false },
  "explanation-style":   { target: "personalization", chapter: "Intelligence",    energy: 0.5, warmth: 0.5, ambientHue: 265, ambientSaturation: 48, isSignatureMoment: false, isChapterStart: false },
  "presence-style":      { target: "personalization", chapter: "Intelligence",    energy: 0.5, warmth: 0.5, ambientHue: 265, ambientSaturation: 48, isSignatureMoment: false, isChapterStart: false },
  "ai-personality":      { target: "personalization", chapter: "Intelligence",    energy: 0.5, warmth: 0.5, ambientHue: 268, ambientSaturation: 49, isSignatureMoment: false, isChapterStart: false },
  "interruption-style":  { target: "personalization", chapter: "Intelligence",    energy: 0.5, warmth: 0.5, ambientHue: 270, ambientSaturation: 48, isSignatureMoment: false, isChapterStart: false },

  // ── Chapter: Activation ─────────────────────────────────
  "first-connections":   { target: "delight",         chapter: "Activation",      energy: 0.65, warmth: 0.65, ambientHue: 38,  ambientSaturation: 55, isSignatureMoment: false, isChapterStart: true },
  "first-win-setup":     { target: "delight",         chapter: "Activation",      energy: 0.7, warmth: 0.7, ambientHue: 42,  ambientSaturation: 58, isSignatureMoment: false, isChapterStart: false },
  "rituals":             { target: "personalization", chapter: "Activation",      energy: 0.55, warmth: 0.55, ambientHue: 280, ambientSaturation: 50, isSignatureMoment: false, isChapterStart: false },
  "appearance":          { target: "ownership",       chapter: "Activation",      energy: 0.5, warmth: 0.5, ambientHue: 270, ambientSaturation: 48, isSignatureMoment: false, isChapterStart: false },
  "household-graph":     { target: "personalization", chapter: "Activation",      energy: 0.5, warmth: 0.55, ambientHue: 275, ambientSaturation: 49, isSignatureMoment: false, isChapterStart: false },
  "memory-consent":      { target: "confidence",      chapter: "Activation",      energy: 0.5, warmth: 0.5, ambientHue: 240, ambientSaturation: 46, isSignatureMoment: false, isChapterStart: false },
  "home-composition":    { target: "ownership",       chapter: "Activation",      energy: 0.55, warmth: 0.55, ambientHue: 265, ambientSaturation: 50, isSignatureMoment: false, isChapterStart: false },
  "desktop-preview":     { target: "delight",         chapter: "Activation",      energy: 0.6, warmth: 0.6, ambientHue: 40,  ambientSaturation: 52, isSignatureMoment: false, isChapterStart: false },

  // ── Chapter: Arrival ────────────────────────────────────
  "arrival-prep":        { target: "arrival",         chapter: "Arrival",         energy: 0.75, warmth: 0.75, ambientHue: 35,  ambientSaturation: 60, isSignatureMoment: false, isChapterStart: true },
  "desktop-transition":  { target: "arrival",         chapter: "Arrival",         energy: 0.9, warmth: 0.85, ambientHue: 30,  ambientSaturation: 65, isSignatureMoment: true,  isChapterStart: false },
  "system-check":        { target: "confidence",      chapter: "Arrival",         energy: 0.7, warmth: 0.7, ambientHue: 250, ambientSaturation: 55, isSignatureMoment: false, isChapterStart: false },
  "trust-certificate":   { target: "arrival",         chapter: "Arrival",         energy: 0.8, warmth: 0.8, ambientHue: 32,  ambientSaturation: 62, isSignatureMoment: false, isChapterStart: false },

  // ── Non-standard phases ─────────────────────────────────
  "welcome":             { target: "mystery",         chapter: "Awakening",       energy: 0.3, warmth: 0.2, ambientHue: 265, ambientSaturation: 35, isSignatureMoment: false, isChapterStart: false },
  "enterprise":          { target: "safety",          chapter: "Identity",        energy: 0.3, warmth: 0.2, ambientHue: 220, ambientSaturation: 40, isSignatureMoment: false, isChapterStart: false },
  "cinematic-intro":     { target: "mystery",         chapter: "Awakening",       energy: 0.25, warmth: 0.15, ambientHue: 265, ambientSaturation: 32, isSignatureMoment: false, isChapterStart: false },
  "setup-style":         { target: "ownership",       chapter: "Foundation",      energy: 0.35, warmth: 0.25, ambientHue: 255, ambientSaturation: 42, isSignatureMoment: false, isChapterStart: false },
  "domains":             { target: "ownership",       chapter: "Personalization", energy: 0.5, warmth: 0.45, ambientHue: 268, ambientSaturation: 48, isSignatureMoment: false, isChapterStart: false },
  "first-simulation":    { target: "delight",         chapter: "Activation",      energy: 0.6, warmth: 0.6, ambientHue: 38,  ambientSaturation: 55, isSignatureMoment: false, isChapterStart: false },
  "first-actions":       { target: "delight",         chapter: "Activation",      energy: 0.6, warmth: 0.6, ambientHue: 40,  ambientSaturation: 55, isSignatureMoment: false, isChapterStart: false },
  "recover-first":       { target: "confidence",      chapter: "Activation",      energy: 0.55, warmth: 0.55, ambientHue: 250, ambientSaturation: 50, isSignatureMoment: false, isChapterStart: false },
};

const DEFAULT_META: EmotionalPhaseMetadata = {
  target: "personalization",
  chapter: "Personalization",
  energy: 0.5,
  warmth: 0.5,
  ambientHue: 265,
  ambientSaturation: 48,
  isSignatureMoment: false,
  isChapterStart: false,
};

/**
 * Get emotional arc metadata for a setup phase.
 * Used by AmbientFormationCanvas, ChapterTransition, and SignatureWowMoment.
 */
export function getEmotionalTarget(phaseId: SetupPhaseId | string): EmotionalPhaseMetadata {
  return PHASE_ARC[phaseId] ?? DEFAULT_META;
}

/**
 * Get the chapter for a phase. Used for chapter transition detection.
 */
export function getChapter(phaseId: SetupPhaseId | string): ChapterName {
  return (PHASE_ARC[phaseId]?.chapter) ?? "Personalization";
}

/**
 * Detect if transitioning between two phases crosses a chapter boundary.
 */
export function isChapterTransition(fromPhase: string, toPhase: string): boolean {
  const fromChapter = getChapter(fromPhase);
  const toChapter = getChapter(toPhase);
  return fromChapter !== toChapter;
}

/**
 * All chapters in order for progress display.
 */
export const CHAPTER_ORDER: ChapterName[] = [
  "Awakening", "Foundation", "Identity", "Personalization", "Intelligence", "Activation", "Arrival",
];

/**
 * Get the chapter index (0-based) for progress calculations.
 */
export function getChapterIndex(chapter: ChapterName): number {
  return CHAPTER_ORDER.indexOf(chapter);
}
