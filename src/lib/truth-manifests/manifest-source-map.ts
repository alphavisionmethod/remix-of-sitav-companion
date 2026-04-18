// ═══════════════════════════════════════════════════════════════
// SITA OS — Manifest Source Map
// Maps each artifact to its actual source inputs
// ═══════════════════════════════════════════════════════════════

import { MANIFEST_REGISTRY } from "./manifest-registry";

export interface SourceMapping {
  manifestId: string;
  sourceInputs: string[];
  sourceType: "code" | "config" | "runtime" | "generated" | "manual";
}

/** Build the complete source map from the registry */
export function buildManifestSourceMap(): SourceMapping[] {
  return MANIFEST_REGISTRY.map((entry) => ({
    manifestId: entry.id,
    sourceInputs: entry.sourceInputs,
    sourceType: inferSourceType(entry.sourceInputs),
  }));
}

function inferSourceType(inputs: readonly string[]): SourceMapping["sourceType"] {
  if (inputs.some((i) => i.startsWith("src/"))) return "code";
  if (inputs.some((i) => i.startsWith("generated/"))) return "generated";
  if (inputs.some((i) => i === "runtime")) return "runtime";
  if (inputs.some((i) => i === "config" || i.includes("config"))) return "config";
  return "manual";
}

/** Get manifests that depend on a specific source path */
export function getManifestsBySource(sourcePath: string): string[] {
  return MANIFEST_REGISTRY
    .filter((m) => m.sourceInputs.some((s) => sourcePath.startsWith(s) || s.startsWith(sourcePath)))
    .map((m) => m.id);
}

/** Get manifests derived from other generated artifacts (dependency chain) */
export function getDerivedManifests(): SourceMapping[] {
  return buildManifestSourceMap().filter((m) => m.sourceType === "generated");
}
