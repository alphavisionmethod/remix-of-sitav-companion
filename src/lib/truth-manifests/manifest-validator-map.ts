// ═══════════════════════════════════════════════════════════════
// SITA OS — Manifest Validator Map
// Maps each artifact to its validation script
// ═══════════════════════════════════════════════════════════════

import { MANIFEST_REGISTRY } from "./manifest-registry";

export interface ValidatorBinding {
  manifestId: string;
  validatorScript: string | null;
  validationType: "schema" | "runtime-linkage" | "authority" | "source-truth" | "none";
}

/** Build validator map from the registry */
export function buildValidatorMap(): ValidatorBinding[] {
  return MANIFEST_REGISTRY.map((entry) => ({
    manifestId: entry.id,
    validatorScript: entry.validator,
    validationType: inferValidationType(entry.validator),
  }));
}

function inferValidationType(validator: string | null): ValidatorBinding["validationType"] {
  if (!validator) return "none";
  if (validator.includes("schema")) return "schema";
  if (validator.includes("runtime")) return "runtime-linkage";
  if (validator.includes("authority")) return "authority";
  if (validator.includes("source")) return "source-truth";
  return "schema";
}

/** Get manifests missing validators that should have them (authoritative) */
export function getManifestsMissingValidators(): string[] {
  return MANIFEST_REGISTRY
    .filter((m) => m.authority === "authoritative" && !m.validator)
    .map((m) => m.id);
}

/** Get all unique validator scripts */
export function getUniqueValidatorScripts(): string[] {
  const scripts = new Set<string>();
  for (const entry of MANIFEST_REGISTRY) {
    if (entry.validator) scripts.add(entry.validator);
  }
  return Array.from(scripts);
}
