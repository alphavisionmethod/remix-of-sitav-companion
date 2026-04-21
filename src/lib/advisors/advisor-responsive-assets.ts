/**
 * SITA OS — Responsive Advisor Image Assets
 * Provides size-appropriate WebP variants for faster loading
 * on mobile and in smaller UI contexts (chat bubbles, sidebars).
 */

// ── Advisor portrait responsive variants (WebP) ─────────────
// 64w = chat bubbles, tiny avatars
import business64 from "@/assets/advisors/responsive/business-advisor-64w.webp";
import money64 from "@/assets/advisors/responsive/money-advisor-64w.webp";
import concierge64 from "@/assets/advisors/responsive/concierge-advisor-64w.webp";
import growth64 from "@/assets/advisors/responsive/growth-advisor-64w.webp";
import trust64 from "@/assets/advisors/responsive/trust-advisor-64w.webp";
import opportunity64 from "@/assets/advisors/responsive/opportunity-advisor-64w.webp";
import recovery64 from "@/assets/advisors/responsive/recovery-advisor-64w.webp";
import boardroom64 from "@/assets/advisors/responsive/boardroom-advisor-64w.webp";
import family64 from "@/assets/advisors/responsive/family-advisor-64w.webp";
import general64 from "@/assets/advisors/responsive/general-advisor-64w.webp";

// 128w = sidebar, medium avatars
import business128 from "@/assets/advisors/responsive/business-advisor-128w.webp";
import money128 from "@/assets/advisors/responsive/money-advisor-128w.webp";
import concierge128 from "@/assets/advisors/responsive/concierge-advisor-128w.webp";
import growth128 from "@/assets/advisors/responsive/growth-advisor-128w.webp";
import trust128 from "@/assets/advisors/responsive/trust-advisor-128w.webp";
import opportunity128 from "@/assets/advisors/responsive/opportunity-advisor-128w.webp";
import recovery128 from "@/assets/advisors/responsive/recovery-advisor-128w.webp";
import boardroom128 from "@/assets/advisors/responsive/boardroom-advisor-128w.webp";
import family128 from "@/assets/advisors/responsive/family-advisor-128w.webp";
import general128 from "@/assets/advisors/responsive/general-advisor-128w.webp";

// 256w = detail panels, cards
import business256 from "@/assets/advisors/responsive/business-advisor-256w.webp";
import money256 from "@/assets/advisors/responsive/money-advisor-256w.webp";
import concierge256 from "@/assets/advisors/responsive/concierge-advisor-256w.webp";
import growth256 from "@/assets/advisors/responsive/growth-advisor-256w.webp";
import trust256 from "@/assets/advisors/responsive/trust-advisor-256w.webp";
import opportunity256 from "@/assets/advisors/responsive/opportunity-advisor-256w.webp";
import recovery256 from "@/assets/advisors/responsive/recovery-advisor-256w.webp";
import boardroom256 from "@/assets/advisors/responsive/boardroom-advisor-256w.webp";
import family256 from "@/assets/advisors/responsive/family-advisor-256w.webp";
import general256 from "@/assets/advisors/responsive/general-advisor-256w.webp";

// ── Promo / hero responsive variants ────────────────────────
import debateMode480 from "@/assets/promo/responsive/sita_advisors_debate_mode-480w.webp";
import debateMode768 from "@/assets/promo/responsive/sita_advisors_debate_mode-768w.webp";
import personalities480 from "@/assets/promo/responsive/sita_advisors_personalities_showcase-480w.webp";
import personalities768 from "@/assets/promo/responsive/sita_advisors_personalities_showcase-768w.webp";
import boardroomCouncil480 from "@/assets/promo/responsive/sita_boardroom_advisors_council-480w.webp";
import boardroomCouncil768 from "@/assets/promo/responsive/sita_boardroom_advisors_council-768w.webp";
import heroBusiness480 from "@/assets/promo/responsive/hero-business-advisor-480w.webp";
import heroBusiness768 from "@/assets/promo/responsive/hero-business-advisor-768w.webp";
import heroMoney480 from "@/assets/promo/responsive/hero-money-advisor-480w.webp";
import heroMoney768 from "@/assets/promo/responsive/hero-money-advisor-768w.webp";
import heroConcierge480 from "@/assets/promo/responsive/hero-concierge-advisor-480w.webp";
import heroConcierge768 from "@/assets/promo/responsive/hero-concierge-advisor-768w.webp";

// Full-size originals for srcSet fallback
import debateModeFull from "@/assets/promo/sita_advisors_debate_mode.png";
import personalitiesFull from "@/assets/promo/sita_advisors_personalities_showcase.png";
import boardroomCouncilFull from "@/assets/promo/sita_boardroom_advisors_council.png";
import heroBusinessFull from "@/assets/promo/hero-business-advisor.jpg";
import heroMoneyFull from "@/assets/promo/hero-money-advisor.jpg";
import heroConciergeFull from "@/assets/promo/hero-concierge-advisor.jpg";

type AdvisorDomain = "business" | "money" | "concierge" | "family" | "growth" | "trust" | "opportunity" | "recovery" | "boardroom" | "general";
type PortraitSize = 64 | 128 | 256;

const PORTRAIT_MAP: Record<AdvisorDomain, Record<PortraitSize, string>> = {
  business:    { 64: business64, 128: business128, 256: business256 },
  money:       { 64: money64, 128: money128, 256: money256 },
  concierge:   { 64: concierge64, 128: concierge128, 256: concierge256 },
  growth:      { 64: growth64, 128: growth128, 256: growth256 },
  trust:       { 64: trust64, 128: trust128, 256: trust256 },
  opportunity: { 64: opportunity64, 128: opportunity128, 256: opportunity256 },
  recovery:    { 64: recovery64, 128: recovery128, 256: recovery256 },
  boardroom:   { 64: boardroom64, 128: boardroom128, 256: boardroom256 },
  family:      { 64: family64, 128: family128, 256: family256 },
  general:     { 64: general64, 128: general128, 256: general256 },
};

/**
 * Get a size-appropriate responsive portrait URL.
 * Falls back to largest available if requested size not found.
 */
export function getResponsivePortrait(domain: AdvisorDomain, size: PortraitSize = 128): string {
  return PORTRAIT_MAP[domain]?.[size] ?? PORTRAIT_MAP.general[size];
}

/**
 * Generate a srcSet string for an advisor portrait.
 * Usage: <img srcSet={getPortraitSrcSet("business")} sizes="..." />
 */
export function getPortraitSrcSet(domain: AdvisorDomain): string {
  const m = PORTRAIT_MAP[domain] ?? PORTRAIT_MAP.general;
  return `${m[64]} 64w, ${m[128]} 128w, ${m[256]} 256w`;
}

/** Promo / hero image sets with responsive variants */
export const PROMO_IMAGES = {
  debateMode: {
    src: debateModeFull,
    srcSet: `${debateMode480} 480w, ${debateMode768} 768w, ${debateModeFull} 1920w`,
    sizes: "(max-width: 640px) 480px, (max-width: 1024px) 768px, 1920px",
  },
  personalities: {
    src: personalitiesFull,
    srcSet: `${personalities480} 480w, ${personalities768} 768w, ${personalitiesFull} 1920w`,
    sizes: "(max-width: 640px) 480px, (max-width: 1024px) 768px, 1920px",
  },
  boardroomCouncil: {
    src: boardroomCouncilFull,
    srcSet: `${boardroomCouncil480} 480w, ${boardroomCouncil768} 768w, ${boardroomCouncilFull} 1920w`,
    sizes: "(max-width: 640px) 480px, (max-width: 1024px) 768px, 1920px",
  },
  heroBusiness: {
    src: heroBusinessFull,
    srcSet: `${heroBusiness480} 480w, ${heroBusiness768} 768w, ${heroBusinessFull} 1024w`,
    sizes: "(max-width: 640px) 480px, (max-width: 1024px) 768px, 1024px",
  },
  heroMoney: {
    src: heroMoneyFull,
    srcSet: `${heroMoney480} 480w, ${heroMoney768} 768w, ${heroMoneyFull} 1024w`,
    sizes: "(max-width: 640px) 480px, (max-width: 1024px) 768px, 1024px",
  },
  heroConcierge: {
    src: heroConciergeFull,
    srcSet: `${heroConcierge480} 480w, ${heroConcierge768} 768w, ${heroConciergeFull} 1024w`,
    sizes: "(max-width: 640px) 480px, (max-width: 1024px) 768px, 1024px",
  },
} as const;