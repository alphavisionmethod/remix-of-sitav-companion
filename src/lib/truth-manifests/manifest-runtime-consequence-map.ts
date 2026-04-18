// ═══════════════════════════════════════════════════════════════
// SITA OS — Manifest Runtime Consequence Map
// What breaks if drift occurs for each artifact
// ═══════════════════════════════════════════════════════════════

import { MANIFEST_REGISTRY } from "./manifest-registry";

export type ConsequenceSeverity = "critical" | "high" | "medium" | "low" | "none";

export interface RuntimeConsequenceEntry {
  manifestId: string;
  runtimeConsequence: string;
  releaseConsequence: string;
  severity: ConsequenceSeverity;
  affectedSurfaces: string[];
}

/** Build runtime consequence map */
export function buildRuntimeConsequenceMap(): RuntimeConsequenceEntry[] {
  return MANIFEST_REGISTRY.map((entry) => ({
    manifestId: entry.id,
    runtimeConsequence: entry.runtimeConsequence,
    releaseConsequence: entry.releaseConsequence,
    severity: inferSeverity(entry),
    affectedSurfaces: inferAffectedSurfaces(entry),
  }));
}

function inferSeverity(entry: typeof MANIFEST_REGISTRY[number]): ConsequenceSeverity {
  if (entry.runtimeConsequence.toLowerCase().includes("404") || entry.runtimeConsequence.toLowerCase().includes("failure")) return "critical";
  if (entry.runtimeConsequence.toLowerCase().includes("violation") || entry.runtimeConsequence.toLowerCase().includes("gap")) return "high";
  if (entry.runtimeConsequence.toLowerCase().includes("undetected") || entry.runtimeConsequence.toLowerCase().includes("mismatch")) return "medium";
  if (entry.runtimeConsequence.toLowerCase().includes("none")) return "none";
  return "low";
}

function inferAffectedSurfaces(entry: typeof MANIFEST_REGISTRY[number]): string[] {
  const surfaces: string[] = [];
  if (entry.tags.includes("routes")) surfaces.push("web-app", "admin");
  if (entry.tags.includes("security")) surfaces.push("all-surfaces");
  if (entry.tags.includes("runtime")) surfaces.push("desktop", "web-app");
  if (entry.tags.includes("deployment")) surfaces.push("infrastructure");
  if (surfaces.length === 0) surfaces.push("admin-only");
  return surfaces;
}

/** Get manifests with critical or high severity consequences */
export function getCriticalConsequences(): RuntimeConsequenceEntry[] {
  return buildRuntimeConsequenceMap().filter((c) => c.severity === "critical" || c.severity === "high");
}
