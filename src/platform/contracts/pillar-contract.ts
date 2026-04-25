// ════════════════════════════════════════════════════════════
// SITA OS — Pillar Contract (cross-module type only)
// ════════════════════════════════════════════════════════════
// Pure type module. NOT a dependency injection point. Pillars
// import this to satisfy a uniform shape; consumers (launcher,
// nav, validator, blueprint generator) can introspect any pillar
// through a single contract.

export type CapabilityMaturity = "active" | "partial" | "planned" | "stub" | "deprecated";
export type TrustTier = "low" | "medium" | "high" | "critical";

export interface PillarCapability {
  /** kebab-case stable id */
  readonly id: string;
  /** human label shown in nav/launcher */
  readonly label: string;
  /** primary route for this capability */
  readonly route: string;
  /** maturity used by Trust Center & launcher badging */
  readonly maturity: CapabilityMaturity;
  /** drives default approval/receipt requirements */
  readonly trustTier: TrustTier;
}

export interface PillarManifest {
  readonly id: "business" | "concierge" | "finance" | "health";
  readonly label: string;
  readonly routePrefix: string;
  readonly routeAliases?: readonly string[];
  readonly description: string;
  /** 1 = leftmost / highest priority in launcher row */
  readonly launcherPriority: 1 | 2 | 3 | 4;
  readonly status?: "greenfield" | "stable";
  readonly capabilities: readonly PillarCapability[];
}