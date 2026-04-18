// ═══════════════════════════════════════════════════════════════
// SITA OS — Domain Visual Atmosphere System
// Per-app spacing, radius, contrast, motion, and personality
// ═══════════════════════════════════════════════════════════════

export interface DomainAtmosphere {
  cardRadius: string;
  density: string;
  motionSpeed: string;
  contrast: string;
  warmth: string;
  shadowDepth: string;
  hoverLift: string;
  personality: string;
}

export const DOMAIN_ATMOSPHERES: Record<string, DomainAtmosphere> = {
  business: {
    cardRadius: "12px",
    density: "0.875rem",
    motionSpeed: "150ms",
    contrast: "1.05",
    warmth: "0.95",
    shadowDepth: "0 2px 8px hsl(0 0% 0% / 0.12)",
    hoverLift: "-2px",
    personality: "sharp",
  },
  finance: {
    cardRadius: "16px",
    density: "1rem",
    motionSpeed: "250ms",
    contrast: "1",
    warmth: "1",
    shadowDepth: "0 2px 12px hsl(0 0% 0% / 0.08)",
    hoverLift: "-3px",
    personality: "calm",
  },
  concierge: {
    cardRadius: "20px",
    density: "1.125rem",
    motionSpeed: "300ms",
    contrast: "0.95",
    warmth: "1.1",
    shadowDepth: "0 4px 16px hsl(0 0% 0% / 0.06)",
    hoverLift: "-4px",
    personality: "soft",
  },
  files: {
    cardRadius: "10px",
    density: "0.875rem",
    motionSpeed: "180ms",
    contrast: "1",
    warmth: "1",
    shadowDepth: "0 1px 4px hsl(0 0% 0% / 0.1)",
    hoverLift: "-1px",
    personality: "minimal",
  },
  trust: {
    cardRadius: "12px",
    density: "0.9375rem",
    motionSpeed: "200ms",
    contrast: "1.02",
    warmth: "1",
    shadowDepth: "0 2px 8px hsl(0 0% 0% / 0.1)",
    hoverLift: "-2px",
    personality: "precise",
  },
};

/** Convert atmosphere to CSS custom properties */
export function atmosphereToCSSVars(domain: string): Record<string, string> {
  const atm = DOMAIN_ATMOSPHERES[domain] || DOMAIN_ATMOSPHERES.files;
  return {
    "--domain-card-radius": atm.cardRadius,
    "--domain-density": atm.density,
    "--domain-motion-speed": atm.motionSpeed,
    "--domain-contrast": atm.contrast,
    "--domain-warmth": atm.warmth,
    "--domain-shadow": atm.shadowDepth,
    "--domain-hover-lift": atm.hoverLift,
  };
}
