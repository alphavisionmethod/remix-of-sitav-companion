// ═══════════════════════════════════════════════════════════════
// SITA OS — Brand Surface Policy
// What branding appears at each layer; what stays consistent.
// ═══════════════════════════════════════════════════════════════

export interface BrandRule {
  readonly ruleId: string;
  readonly layer: "shell" | "app" | "admin" | "all";
  readonly description: string;
  readonly mustStayConsistent: boolean;
}

export const BRAND_SURFACE_POLICY: readonly BrandRule[] = [
  { ruleId: "shell-logo",          layer: "shell", description: "SITA logo in menu bar apple-position",                         mustStayConsistent: true },
  { ruleId: "shell-wordmark",      layer: "shell", description: "SITA wordmark on lock screen and about dialog",                mustStayConsistent: true },
  { ruleId: "app-domain-accent",   layer: "app",   description: "Domain accent color from DOMAIN_ATMOSPHERE",                   mustStayConsistent: false },
  { ruleId: "app-domain-icon",     layer: "app",   description: "Domain icon gradient from ICON_GRADIENTS",                     mustStayConsistent: false },
  { ruleId: "admin-neutral",       layer: "admin", description: "Admin surfaces use neutral palette, no domain accent",         mustStayConsistent: true },
  { ruleId: "font-family",         layer: "all",   description: "Inter font family across all surfaces",                        mustStayConsistent: true },
  { ruleId: "trust-language",      layer: "all",   description: "Trust badge labels, tooltips, and disclosure copy",            mustStayConsistent: true },
  { ruleId: "state-language",      layer: "all",   description: "State display titles and messages from STATE_METADATA_DEFAULTS", mustStayConsistent: true },
  { ruleId: "motion-feel",         layer: "all",   description: "Spring-based animation feel (not rigid ease curves)",          mustStayConsistent: true },
  { ruleId: "card-radius-range",   layer: "app",   description: "Card radius may vary per domain (12-16px) within DOMAIN_ATMOSPHERE", mustStayConsistent: false },
] as const;