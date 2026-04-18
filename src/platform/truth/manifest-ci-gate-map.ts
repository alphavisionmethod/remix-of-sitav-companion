// ═══════════════════════════════════════════════════════════════
// SITA OS — Manifest CI Gate Map
// Maps critical artifacts to CI workflow gates
// ═══════════════════════════════════════════════════════════════

import { MANIFEST_REGISTRY } from "./manifest-registry";

export interface CIGateBinding {
  manifestId: string;
  ciGate: string | null;
  enforcement: "blocking" | "warning" | "none";
  description: string;
}

export const CI_GATE_DEFINITIONS: Record<string, { name: string; type: "blocking" | "warning"; description: string }> = {
  "route-integrity": { name: "Route Integrity Gate", type: "blocking", description: "Ensures all routes are registered and classified" },
  "service-integrity": { name: "Service Integrity Gate", type: "blocking", description: "Ensures no service sprawl beyond budget" },
  "contract-integrity": { name: "Contract Integrity Gate", type: "blocking", description: "Ensures all cross-domain contracts are typed" },
  "capability-integrity": { name: "Capability Integrity Gate", type: "blocking", description: "Ensures all capabilities are registered" },
  "security-model": { name: "Security Model Gate", type: "blocking", description: "Ensures security model is current" },
  "runtime-conformance": { name: "Runtime Conformance Gate", type: "blocking", description: "Ensures runtime conforms to contracts" },
  "release-gates": { name: "Release Gates", type: "blocking", description: "Ensures release thresholds are met" },
  "ownership-integrity": { name: "Ownership Integrity Gate", type: "blocking", description: "Ensures all code has domain ownership" },
};

/** Build CI gate map from the registry */
export function buildCIGateMap(): CIGateBinding[] {
  return MANIFEST_REGISTRY.map((entry) => {
    const gateDef = entry.ciGate ? CI_GATE_DEFINITIONS[entry.ciGate] : null;
    return {
      manifestId: entry.id,
      ciGate: entry.ciGate,
      enforcement: gateDef?.type ?? "none",
      description: gateDef?.description ?? "No CI gate assigned",
    };
  });
}

/** Get all manifests with blocking CI gates */
export function getBlockingGateManifests(): CIGateBinding[] {
  return buildCIGateMap().filter((g) => g.enforcement === "blocking");
}

/** Get manifests that should have CI gates but don't (authoritative without gate) */
export function getManifestsMissingCIGates(): string[] {
  return MANIFEST_REGISTRY
    .filter((m) => m.authority === "authoritative" && !m.ciGate)
    .map((m) => m.id);
}
