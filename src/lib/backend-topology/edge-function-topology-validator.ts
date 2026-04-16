// ═══════════════════════════════════════════════════════════════
// SITA OS — Edge Function Topology Validator
// Validates topology consistency: orphans, missing auth, gaps
// ═══════════════════════════════════════════════════════════════

import { EDGE_FUNCTION_REGISTRY } from "./edge-function-registry";
import { EDGE_FUNCTION_CATEGORIES } from "./edge-function-categories";
import { EDGE_FUNCTION_AUTH_MAP } from "./edge-function-auth-map";
import { EDGE_FUNCTION_OWNER_MAP } from "./edge-function-owner-map";
import { EDGE_FUNCTION_BOUNDED_CONTEXTS } from "./edge-function-bounded-contexts";
import { EDGE_FUNCTION_CONTRACT_MAP } from "./edge-function-contract-map";
import { EDGE_FUNCTION_MIGRATION_MAP } from "./edge-function-migration-map";

export interface TopologyValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
  readonly stats: {
    readonly totalFunctions: number;
    readonly categorized: number;
    readonly authed: number;
    readonly owned: number;
    readonly contextMapped: number;
    readonly contractMapped: number;
    readonly tableMapped: number;
  };
}

export function validateTopology(): TopologyValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const allNames = EDGE_FUNCTION_REGISTRY.map(f => f.name);

  // Check coverage across all maps
  const uncategorized = allNames.filter(n => !EDGE_FUNCTION_CATEGORIES[n]);
  const unauthed = allNames.filter(n => !EDGE_FUNCTION_AUTH_MAP[n]);
  const unowned = allNames.filter(n => !EDGE_FUNCTION_OWNER_MAP[n]);
  const noContext = allNames.filter(n => !EDGE_FUNCTION_BOUNDED_CONTEXTS[n]);
  const noContract = allNames.filter(n => !EDGE_FUNCTION_CONTRACT_MAP[n]);
  const noTableMap = allNames.filter(n => !EDGE_FUNCTION_MIGRATION_MAP[n]);

  if (uncategorized.length > 0) errors.push(`Uncategorized functions: ${uncategorized.join(", ")}`);
  if (unauthed.length > 0) errors.push(`Functions missing auth map: ${unauthed.join(", ")}`);
  if (unowned.length > 0) errors.push(`Functions missing ownership: ${unowned.join(", ")}`);
  if (noContext.length > 0) warnings.push(`Functions without bounded context: ${noContext.join(", ")}`);
  if (noContract.length > 0) warnings.push(`Functions without contract map: ${noContract.join(", ")}`);
  if (noTableMap.length > 0) warnings.push(`Functions without table access map: ${noTableMap.join(", ")}`);

  // Check for entries in maps that aren't in registry
  const registrySet = new Set(allNames);
  const categoryOrphans = Object.keys(EDGE_FUNCTION_CATEGORIES).filter((n: string) => !registrySet.has(n));
  const authOrphans = Object.keys(EDGE_FUNCTION_AUTH_MAP).filter((n: string) => !registrySet.has(n));

  if (categoryOrphans.length > 0) errors.push(`Category map has unknown functions: ${categoryOrphans.join(", ")}`);
  if (authOrphans.length > 0) errors.push(`Auth map has unknown functions: ${authOrphans.join(", ")}`);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats: {
      totalFunctions: allNames.length,
      categorized: allNames.length - uncategorized.length,
      authed: allNames.length - unauthed.length,
      owned: allNames.length - unowned.length,
      contextMapped: allNames.length - noContext.length,
      contractMapped: allNames.length - noContract.length,
      tableMapped: allNames.length - noTableMap.length,
    },
  };
}

export function getTopologySummary(): string {
  const result = validateTopology();
  const lines = [
    `Edge Function Topology: ${result.valid ? "✅ VALID" : "❌ INVALID"}`,
    `Total: ${result.stats.totalFunctions}`,
    `Categorized: ${result.stats.categorized}/${result.stats.totalFunctions}`,
    `Auth mapped: ${result.stats.authed}/${result.stats.totalFunctions}`,
    `Owned: ${result.stats.owned}/${result.stats.totalFunctions}`,
    `Context mapped: ${result.stats.contextMapped}/${result.stats.totalFunctions}`,
    `Contract mapped: ${result.stats.contractMapped}/${result.stats.totalFunctions}`,
    `Table mapped: ${result.stats.tableMapped}/${result.stats.totalFunctions}`,
  ];
  if (result.errors.length > 0) lines.push(`Errors: ${result.errors.length}`);
  if (result.warnings.length > 0) lines.push(`Warnings: ${result.warnings.length}`);
  return lines.join("\n");
}
