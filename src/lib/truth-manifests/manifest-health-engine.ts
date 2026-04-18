// ═══════════════════════════════════════════════════════════════
// SITA OS — Manifest Health Engine
// Generates summary truth on manifest health
// ═══════════════════════════════════════════════════════════════

import { MANIFEST_REGISTRY } from "./manifest-registry";
import type { ManifestHealthStatus, ManifestHealthSummary } from "./manifest-types";

/** Evaluate health of a single manifest entry */
export function evaluateManifestHealth(manifestId: string): ManifestHealthStatus | null {
  const entry = MANIFEST_REGISTRY.find((m) => m.id === manifestId);
  if (!entry) return null;

  const issues: string[] = [];
  const hasValidator = !!entry.validator;
  const hasCiGate = !!entry.ciGate;
  const hasOwner = !!entry.owner;
  const hasConsumers = entry.consumers.length > 0;

  if (entry.authority === "authoritative" && !hasValidator) {
    issues.push("Authoritative manifest missing validator");
  }
  if (entry.authority === "authoritative" && !hasCiGate) {
    issues.push("Authoritative manifest missing CI gate");
  }
  if (!hasConsumers) {
    issues.push("No consumers declared — possible orphan");
  }
  if (entry.sourceInputs.length === 0) {
    issues.push("No source inputs declared");
  }

  return {
    id: manifestId,
    exists: true, // Registry-level check; file existence requires fs scan
    hasValidator,
    hasCiGate,
    hasOwner,
    hasConsumers,
    stale: false, // Would require file modification time check
    issues,
  };
}

/** Generate aggregate health summary */
export function generateHealthSummary(): ManifestHealthSummary {
  const results = MANIFEST_REGISTRY.map((m) => evaluateManifestHealth(m.id)!);

  return {
    totalManifests: results.length,
    healthyManifests: results.filter((r) => r.issues.length === 0).length,
    unhealthyManifests: results.filter((r) => r.issues.length > 0).length,
    missingValidators: results.filter((r) => !r.hasValidator && MANIFEST_REGISTRY.find((m) => m.id === r.id)?.authority === "authoritative").map((r) => r.id),
    missingCiGates: results.filter((r) => !r.hasCiGate && MANIFEST_REGISTRY.find((m) => m.id === r.id)?.authority === "authoritative").map((r) => r.id),
    missingOwners: results.filter((r) => !r.hasOwner).map((r) => r.id),
    staleManifests: results.filter((r) => r.stale).map((r) => r.id),
    orphanedManifests: results.filter((r) => !r.hasConsumers).map((r) => r.id),
  };
}

/** Get a human-readable health report */
export function getHealthReport(): string {
  const summary = generateHealthSummary();
  const lines = [
    `# Manifest Health Report`,
    ``,
    `Total: ${summary.totalManifests} | Healthy: ${summary.healthyManifests} | Unhealthy: ${summary.unhealthyManifests}`,
    ``,
    `## Missing Validators (${summary.missingValidators.length})`,
    ...summary.missingValidators.map((id) => `- ${id}`),
    ``,
    `## Missing CI Gates (${summary.missingCiGates.length})`,
    ...summary.missingCiGates.map((id) => `- ${id}`),
    ``,
    `## Orphaned Manifests (${summary.orphanedManifests.length})`,
    ...summary.orphanedManifests.map((id) => `- ${id}`),
  ];
  return lines.join("\n");
}
