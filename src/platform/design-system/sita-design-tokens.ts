// ═══════════════════════════════════════════════════════════════
// SITA OS — Design Token Foundation
// Surfaces, domain atmosphere, typography, motion pacing, badges
// ═══════════════════════════════════════════════════════════════

import type { DomainId } from "@/platform/sita/components/sita/shell/DomainAppShell";

// ── 4-Surface Material Hierarchy ─────────────────────────────

export type SurfaceLevel = 0 | 1 | 2 | 3;

export const SURFACE_TOKENS: Record<SurfaceLevel, {
  bg: string; darkBg: string;
  border: string; darkBorder: string;
  shadow: string;
}> = {
  0: {
    bg: "hsl(0 0% 98%)", darkBg: "hsl(0 0% 6%)",
    border: "hsl(0 0% 0% / 0.04)", darkBorder: "hsl(0 0% 100% / 0.04)",
    shadow: "none",
  },
  1: {
    bg: "hsl(0 0% 100%)", darkBg: "hsl(0 0% 9%)",
    border: "hsl(0 0% 0% / 0.06)", darkBorder: "hsl(0 0% 100% / 0.06)",
    shadow: "0 1px 2px hsl(0 0% 0% / 0.04)",
  },
  2: {
    bg: "hsl(0 0% 100%)", darkBg: "hsl(0 0% 12%)",
    border: "hsl(0 0% 0% / 0.08)", darkBorder: "hsl(0 0% 100% / 0.08)",
    shadow: "0 2px 8px hsl(0 0% 0% / 0.06), 0 1px 2px hsl(0 0% 0% / 0.04)",
  },
  3: {
    bg: "hsl(0 0% 100%)", darkBg: "hsl(0 0% 14%)",
    border: "hsl(0 0% 0% / 0.10)", darkBorder: "hsl(0 0% 100% / 0.10)",
    shadow: "0 4px 16px hsl(0 0% 0% / 0.10), 0 12px 32px hsl(0 0% 0% / 0.08)",
  },
};

// ── Domain Atmosphere ────────────────────────────────────────

export interface DomainAtmosphere {
  label: string;
  accentHsl: string;
  accentFrom: string;
  accentTo: string;
  tone: "sharp" | "calm" | "soft" | "neutral" | "serious";
  density: string;
  cardRadius: string;
  motionSpeed: string;
  borderStrength: string;
  surfaceWarmth: string;
}

export const DOMAIN_ATMOSPHERE: Record<DomainId, DomainAtmosphere> = {
  business: {
    label: "Business",
    accentHsl: "265 55% 58%",
    accentFrom: "hsl(265 55% 58%)",
    accentTo: "hsl(285 50% 48%)",
    tone: "sharp",
    density: "0.875rem",
    cardRadius: "12px",
    motionSpeed: "150ms",
    borderStrength: "0.10",
    surfaceWarmth: "0",
  },
  finance: {
    label: "Finance",
    accentHsl: "152 55% 48%",
    accentFrom: "hsl(152 55% 48%)",
    accentTo: "hsl(165 50% 42%)",
    tone: "calm",
    density: "1rem",
    cardRadius: "16px",
    motionSpeed: "250ms",
    borderStrength: "0.06",
    surfaceWarmth: "0",
  },
  concierge: {
    label: "Concierge",
    accentHsl: "285 55% 55%",
    accentFrom: "hsl(285 55% 55%)",
    accentTo: "hsl(310 50% 48%)",
    tone: "soft",
    density: "1.125rem",
    cardRadius: "20px",
    motionSpeed: "300ms",
    borderStrength: "0.05",
    surfaceWarmth: "0.02",
  },
  files: {
    label: "Files",
    accentHsl: "210 80% 55%",
    accentFrom: "hsl(210 80% 55%)",
    accentTo: "hsl(200 70% 50%)",
    tone: "neutral",
    density: "0.875rem",
    cardRadius: "10px",
    motionSpeed: "180ms",
    borderStrength: "0.08",
    surfaceWarmth: "0",
  },
  trust: {
    label: "Trust",
    accentHsl: "38 85% 58%",
    accentFrom: "hsl(38 85% 58%)",
    accentTo: "hsl(28 80% 50%)",
    tone: "serious",
    density: "0.9375rem",
    cardRadius: "12px",
    motionSpeed: "200ms",
    borderStrength: "0.08",
    surfaceWarmth: "0",
  },
};

// ── Typography Scale (12 roles) ──────────────────────────────

export const SITA_TYPE = {
  osTitle:       "text-[24px] font-bold tracking-[-0.03em] leading-tight",
  appTitle:      "text-[18px] font-semibold tracking-[-0.02em] leading-snug",
  pageTitle:     "text-[16px] font-semibold tracking-[-0.01em] leading-snug",
  sectionTitle:  "text-[13px] font-semibold tracking-[0.02em] leading-tight uppercase",
  paneTitle:     "text-[14px] font-medium tracking-[-0.005em] leading-snug",
  cardTitle:     "text-[13px] font-medium tracking-normal leading-snug",
  metricEmphasis:"text-[28px] font-bold tracking-[-0.03em] leading-none tabular-nums",
  microLabel:    "text-[10px] font-medium tracking-[0.06em] leading-tight uppercase",
  trustAnnotation:"text-[11px] font-mono font-medium tracking-[0.02em] leading-tight",
  timelineMeta:  "text-[11px] font-normal tracking-[0.01em] leading-relaxed text-muted-foreground",
  commandText:   "text-[13px] font-medium tracking-normal leading-snug",
  systemMono:    "text-[11px] font-mono font-normal tracking-[0.02em] leading-relaxed",
} as const;

// ── Motion Pacing (Domain-keyed spring configs) ──────────────

export interface MotionConfig {
  stiffness: number;
  damping: number;
  mass: number;
  staggerDelay: number; // ms per child
  enterDuration: number; // ms
}

export const DOMAIN_MOTION: Record<DomainId, MotionConfig> = {
  business:  { stiffness: 300, damping: 22, mass: 0.6, staggerDelay: 30,  enterDuration: 150 },
  finance:   { stiffness: 180, damping: 28, mass: 0.8, staggerDelay: 50,  enterDuration: 250 },
  concierge: { stiffness: 140, damping: 24, mass: 0.9, staggerDelay: 60,  enterDuration: 300 },
  files:     { stiffness: 250, damping: 24, mass: 0.7, staggerDelay: 35,  enterDuration: 180 },
  trust:     { stiffness: 220, damping: 26, mass: 0.75, staggerDelay: 40, enterDuration: 200 },
};

// ── Badge Grammar ────────────────────────────────────────────

export type BadgeIntent =
  | "trust" | "proof" | "freshness" | "mode"
  | "urgency" | "domain" | "execution";

export const BADGE_STYLES: Record<BadgeIntent, {
  bg: string; text: string; border: string; icon?: string;
}> = {
  trust:     { bg: "hsl(152 55% 48% / 0.12)", text: "hsl(152 55% 48%)", border: "hsl(152 55% 48% / 0.20)" },
  proof:     { bg: "hsl(38 85% 58% / 0.12)",  text: "hsl(38 85% 58%)",  border: "hsl(38 85% 58% / 0.20)" },
  freshness: { bg: "hsl(210 80% 55% / 0.12)", text: "hsl(210 80% 55%)", border: "hsl(210 80% 55% / 0.20)" },
  mode:      { bg: "hsl(0 0% 50% / 0.12)",    text: "hsl(0 0% 60%)",    border: "hsl(0 0% 50% / 0.20)" },
  urgency:   { bg: "hsl(0 70% 55% / 0.12)",   text: "hsl(0 70% 55%)",   border: "hsl(0 70% 55% / 0.20)" },
  domain:    { bg: "hsl(265 55% 58% / 0.12)",  text: "hsl(265 55% 58%)", border: "hsl(265 55% 58% / 0.20)" },
  execution: { bg: "hsl(210 60% 50% / 0.12)",  text: "hsl(210 60% 50%)", border: "hsl(210 60% 50% / 0.20)" },
};

// ── Card Family Types ────────────────────────────────────────

export type CardFamily =
  | "hero" | "summary" | "action" | "queue" | "proof"
  | "status" | "advisor" | "comparison" | "timeline";

export const CARD_DEFAULTS: Record<CardFamily, {
  surfaceLevel: SurfaceLevel;
  padding: string;
}> = {
  hero:       { surfaceLevel: 2, padding: "p-6" },
  summary:    { surfaceLevel: 2, padding: "p-4" },
  action:     { surfaceLevel: 2, padding: "p-4" },
  queue:      { surfaceLevel: 2, padding: "p-3" },
  proof:      { surfaceLevel: 2, padding: "p-4" },
  status:     { surfaceLevel: 2, padding: "p-3" },
  advisor:    { surfaceLevel: 2, padding: "p-4" },
  comparison: { surfaceLevel: 2, padding: "p-5" },
  timeline:   { surfaceLevel: 2, padding: "p-4" },
};

// ── Helpers ──────────────────────────────────────────────────

export function getDomainSpring(domain: DomainId) {
  const m = DOMAIN_MOTION[domain];
  return { type: "spring" as const, stiffness: m.stiffness, damping: m.damping, mass: m.mass };
}

const SURFACE_CLASS_MAP: Record<SurfaceLevel, string> = {
  0: "bg-surface-0 border border-transparent",
  1: "bg-surface-1 border border-border-subtle shadow-xs",
  2: "bg-surface-2 border border-border shadow-card",
  3: "bg-surface-3 border border-border shadow-card-hover",
};

export function getSurfaceClasses(level: SurfaceLevel): string {
  return SURFACE_CLASS_MAP[level];
}

// ── Atmosphere → CSS Variable Bridge ─────────────────────────
// Merged from domain-atmospheres.ts — single source of truth

/** Convert atmosphere to CSS custom properties for DomainAppShell */
export function atmosphereToCSSVars(domain: string): Record<string, string> {
  const atm = DOMAIN_ATMOSPHERE[domain as DomainId] ?? DOMAIN_ATMOSPHERE.business;
  return {
    "--domain-card-radius": atm.cardRadius,
    "--domain-density": atm.density,
    "--domain-motion-speed": atm.motionSpeed,
    "--domain-contrast": "1",
    "--domain-warmth": atm.surfaceWarmth,
    "--domain-shadow": `0 2px 8px hsl(0 0% 0% / ${atm.borderStrength})`,
    "--domain-hover-lift": "-2px",
  };
}

// ── Re-export APP_TYPE as alias for backward compatibility ───

export const APP_TYPE = {
  label: SITA_TYPE.microLabel,
  body: SITA_TYPE.commandText,
  title: SITA_TYPE.pageTitle,
  heading: SITA_TYPE.appTitle,
} as const;
