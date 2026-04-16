// ═══════════════════════════════════════════════════════════════
// SITA OS — Manifest Drift Severity
// Severity classification per artifact type
// ═══════════════════════════════════════════════════════════════

import type { ManifestClass, ManifestAuthority } from "./manifest-types";
import type { ConsequenceSeverity } from "./manifest-runtime-consequence-map";

export interface DriftSeverityRule {
  class: ManifestClass;
  authority: ManifestAuthority;
  defaultSeverity: ConsequenceSeverity;
  escalationCondition: string;
  escalatedSeverity: ConsequenceSeverity;
}

export const DRIFT_SEVERITY_RULES: readonly DriftSeverityRule[] = [
  { class: "structural", authority: "authoritative", defaultSeverity: "critical", escalationCondition: "Always critical for authoritative structural", escalatedSeverity: "critical" },
  { class: "structural", authority: "derived", defaultSeverity: "medium", escalationCondition: "Escalates if consumer count > 3", escalatedSeverity: "high" },
  { class: "structural", authority: "informational", defaultSeverity: "low", escalationCondition: "None", escalatedSeverity: "low" },
  { class: "contract", authority: "authoritative", defaultSeverity: "critical", escalationCondition: "Always critical for contracts", escalatedSeverity: "critical" },
  { class: "contract", authority: "derived", defaultSeverity: "high", escalationCondition: "Escalates if release gate depends on it", escalatedSeverity: "critical" },
  { class: "contract", authority: "informational", defaultSeverity: "low", escalationCondition: "None", escalatedSeverity: "low" },
  { class: "runtime", authority: "authoritative", defaultSeverity: "critical", escalationCondition: "Always critical for runtime", escalatedSeverity: "critical" },
  { class: "runtime", authority: "derived", defaultSeverity: "medium", escalationCondition: "Escalates if boot-chain affected", escalatedSeverity: "high" },
  { class: "runtime", authority: "informational", defaultSeverity: "low", escalationCondition: "None", escalatedSeverity: "low" },
  { class: "compliance", authority: "authoritative", defaultSeverity: "high", escalationCondition: "Escalates before release", escalatedSeverity: "critical" },
  { class: "compliance", authority: "derived", defaultSeverity: "medium", escalationCondition: "None", escalatedSeverity: "medium" },
  { class: "compliance", authority: "informational", defaultSeverity: "low", escalationCondition: "None", escalatedSeverity: "low" },
  { class: "informational", authority: "informational", defaultSeverity: "none", escalationCondition: "None", escalatedSeverity: "none" },
] as const;

/** Get drift severity for a manifest based on its class and authority */
export function getDriftSeverity(cls: ManifestClass, authority: ManifestAuthority): ConsequenceSeverity {
  const rule = DRIFT_SEVERITY_RULES.find((r) => r.class === cls && r.authority === authority);
  return rule?.defaultSeverity ?? "low";
}
