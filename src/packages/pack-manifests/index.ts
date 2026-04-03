// ═══════════════════════════════════════════════════════════════
// SITA OS — Pack Manifests Package
// ═══════════════════════════════════════════════════════════════

export type PackCategory = "founders" | "families" | "service-business" | "finance" | "workflows" | "advisors" | "templates" | "connectors" | "surfaces";

export interface PackManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  category: PackCategory;
  author: string;
  icon: string;
  capabilities: string[];
  dependencies: string[];
  requiredTier: string;
  installConfig: PackInstallConfig;
  surfaces: PackSurface[];
}

export interface PackInstallConfig {
  autoActivate: boolean;
  requiredConnectors: string[];
  requiredPermissions: string[];
  setupSteps: PackSetupStep[];
}

export interface PackSetupStep {
  id: string;
  title: string;
  description: string;
  type: "config" | "connector" | "permission" | "data-import";
  required: boolean;
}

export interface PackSurface {
  id: string;
  type: "page" | "widget" | "card" | "panel" | "action";
  route?: string;
  placement?: string;
}

export const validateManifest = (manifest: PackManifest): string[] => {
  const errors: string[] = [];
  if (!manifest.id) errors.push("Missing pack ID");
  if (!manifest.name) errors.push("Missing pack name");
  if (!manifest.version.match(/^\d+\.\d+\.\d+$/)) errors.push("Invalid version format");
  if (!manifest.capabilities.length) errors.push("No capabilities declared");
  return errors;
};

// ── Pack Governance ─────────────────────────────────────────

export type PackRiskTier = "R0" | "R1" | "R2" | "R3" | "R4" | "R5";

export interface PackGovernance {
  readonly packId: string;
  readonly riskTier: PackRiskTier;
  readonly requiredApprovals: number;
  readonly killSwitchClass: "instant" | "graceful" | "scheduled";
  readonly reviewedBy: string[];
  readonly reviewedAt?: number;
  readonly approvedForTiers: string[];
}

// ── Pack Diagnostics ────────────────────────────────────────

export interface PackDiagnostic {
  readonly packId: string;
  readonly installedAt: number;
  readonly lastHealthCheck: number;
  readonly errorCount: number;
  readonly warningCount: number;
  readonly dependencyStatus: Record<string, "ok" | "missing" | "outdated">;
}

export interface PackHealthCheck {
  readonly packId: string;
  readonly healthy: boolean;
  readonly checks: PackHealthCheckItem[];
  readonly checkedAt: number;
}

export interface PackHealthCheckItem {
  readonly name: string;
  readonly passed: boolean;
  readonly message?: string;
  readonly severity: "info" | "warning" | "error";
}
