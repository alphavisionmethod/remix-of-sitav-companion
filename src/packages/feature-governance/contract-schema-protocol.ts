// ═══════════════════════════════════════════════════════════════
// SITA OS — Contract and Schema Protocol (Section 8)
// Shared contracts first. Every feature crossing a boundary must
// define canonical schemas with versioning rules.
// ═══════════════════════════════════════════════════════════════

import type { FeatureRiskTier } from "./index";

// ── 8.2 Schema Families (10 canonical) ──────────────────────

export const SCHEMA_FAMILIES = [
  "input",
  "output",
  "command",
  "event",
  "receipt",
  "diagnostic",
  "boardroom-packet",
  "preference-config",
  "memory-write",
  "feature-flag",
] as const;

export type SchemaFamily = typeof SCHEMA_FAMILIES[number];

// ── 8.3 Versioning Rules ────────────────────────────────────

export type CompatibilityType = "additive" | "breaking";

export interface SchemaVersion {
  readonly version: string;
  readonly compatibility: CompatibilityType;
  readonly migrationWindow: string | null;
  readonly deprecationWarning: string | null;
  readonly replayCompatible: boolean;
  readonly projectionRebuildCompatible: boolean;
}

// ── Contract Evolution Rules ────────────────────────────────

export const CONTRACT_EVOLUTION_RULES = [
  "additive-safe",
  "breaking-requires-migration-window",
  "breaking-requires-dual-write",
  "deprecation-requires-sunset-period",
  "replay-must-stay-compatible",
  "projection-must-rebuild-cleanly",
] as const;

export type ContractEvolutionRule = typeof CONTRACT_EVOLUTION_RULES[number];

// ── Feature Schema Registry ─────────────────────────────────

export interface FeatureSchemaRegistryEntry {
  readonly family: SchemaFamily;
  readonly schemaId: string;
  readonly versions: readonly SchemaVersion[];
}

export interface FeatureSchemaRegistry {
  readonly featureId: string;
  readonly schemas: readonly FeatureSchemaRegistryEntry[];
}

// ── Required Schema Families by Risk Tier ───────────────────

export const SCHEMA_FAMILIES_BY_RISK_TIER: Record<FeatureRiskTier, readonly SchemaFamily[]> = {
  R0: ["input", "output"],
  R1: ["input", "output", "event", "feature-flag"],
  R2: ["input", "output", "command", "event", "diagnostic", "feature-flag"],
  R3: ["input", "output", "command", "event", "receipt", "diagnostic", "feature-flag"],
  R4: ["input", "output", "command", "event", "receipt", "diagnostic", "boardroom-packet", "preference-config", "feature-flag"],
  R5: ["input", "output", "command", "event", "receipt", "diagnostic", "boardroom-packet", "preference-config", "memory-write", "feature-flag"],
} as const;

// ── Schema Registry Validation ──────────────────────────────

export function validateSchemaRegistry(
  registry: Partial<FeatureSchemaRegistry>,
  riskTier: FeatureRiskTier,
): string[] {
  const errors: string[] = [];

  if (!registry.featureId) errors.push("Missing featureId");
  if (!registry.schemas) {
    errors.push("Missing schemas array");
    return errors;
  }

  // Check required families for risk tier
  const requiredFamilies = SCHEMA_FAMILIES_BY_RISK_TIER[riskTier];
  const presentFamilies = new Set(registry.schemas.map(s => s.family));

  for (const required of requiredFamilies) {
    if (!presentFamilies.has(required)) {
      errors.push(`Missing required schema family '${required}' for risk tier ${riskTier}`);
    }
  }

  // Validate each schema entry
  for (const entry of registry.schemas) {
    if (!entry.schemaId) {
      errors.push(`Schema entry missing schemaId for family '${entry.family}'`);
    }
    if (!(SCHEMA_FAMILIES as readonly string[]).includes(entry.family)) {
      errors.push(`Invalid schema family: ${entry.family}`);
    }
    if (!entry.versions || entry.versions.length === 0) {
      errors.push(`Schema '${entry.schemaId}' must have at least one version`);
    }

    // Validate versioning rules
    for (const version of entry.versions ?? []) {
      if (!version.version) {
        errors.push(`Schema '${entry.schemaId}': version entry missing version string`);
      }
      if (version.compatibility === "breaking") {
        if (!version.migrationWindow) {
          errors.push(`Schema '${entry.schemaId}' v${version.version}: breaking change requires migrationWindow`);
        }
        if (!version.deprecationWarning) {
          errors.push(`Schema '${entry.schemaId}' v${version.version}: breaking change requires deprecationWarning`);
        }
      }
      // High-value schemas must maintain replay compatibility
      if (["R3", "R4", "R5"].includes(riskTier) && !version.replayCompatible && version.compatibility === "breaking") {
        errors.push(`Schema '${entry.schemaId}' v${version.version}: high-risk (${riskTier}) breaking changes must remain replay compatible`);
      }
    }
  }

  return errors;
}

// ── Schema Completeness ─────────────────────────────────────

export function schemaCompleteness(
  registry: FeatureSchemaRegistry,
  riskTier: FeatureRiskTier,
): { percentage: number; missingFamilies: SchemaFamily[]; presentFamilies: SchemaFamily[] } {
  const required = SCHEMA_FAMILIES_BY_RISK_TIER[riskTier];
  const present = registry.schemas.map(s => s.family);
  const missing = required.filter(f => !present.includes(f)) as SchemaFamily[];
  const matched = required.filter(f => present.includes(f)) as SchemaFamily[];

  return {
    percentage: required.length === 0 ? 100 : Math.round((matched.length / required.length) * 100),
    missingFamilies: missing,
    presentFamilies: matched,
  };
}
