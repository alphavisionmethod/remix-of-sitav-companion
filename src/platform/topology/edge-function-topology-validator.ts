// ═══════════════════════════════════════════════════════════════
// SITA OS — Edge Function Topology Validator
// Validates topology consistency: orphans, missing auth, gaps,
// one-role-only, allowed-caller validity, call-graph integrity.
// ═══════════════════════════════════════════════════════════════

import { EDGE_FUNCTION_REGISTRY } from "./edge-function-registry";
import { EDGE_FUNCTION_CATEGORIES, EDGE_FUNCTION_BACKEND_CATEGORY } from "./edge-function-categories";
import { EDGE_FUNCTION_AUTH_MAP } from "./edge-function-auth-map";
import { EDGE_FUNCTION_OWNER_MAP } from "./edge-function-owner-map";
import { EDGE_FUNCTION_BOUNDED_CONTEXTS } from "./edge-function-bounded-contexts";
import { EDGE_FUNCTION_CONTRACT_MAP } from "./edge-function-contract-map";
import { EDGE_FUNCTION_MIGRATION_MAP } from "./edge-function-migration-map";

const KNOWN_CALLER_CLASSES = new Set([
  "frontend-user", "frontend-admin",
  "public-bff", "admin-bff", "domain-function", "orchestration-function",
  "connector-webhook", "runtime-system",
  "scheduler", "kernel", "external-webhook", "service-internal", "any-authenticated",
]);

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
    readonly strictlyClassified: number;
    readonly callGraphValid: number;
  };
}

export function validateTopology(): TopologyValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const allNames = EDGE_FUNCTION_REGISTRY.map(f => f.name);
  const registrySet = new Set<string>(allNames);

  // Coverage across all maps
  const uncategorized = allNames.filter(n => !EDGE_FUNCTION_CATEGORIES[n]);
  const unauthed = allNames.filter(n => !EDGE_FUNCTION_AUTH_MAP[n]);
  const unowned = allNames.filter(n => !EDGE_FUNCTION_OWNER_MAP[n]);
  const noContext = allNames.filter(n => !EDGE_FUNCTION_BOUNDED_CONTEXTS[n]);
  const noContract = allNames.filter(n => !EDGE_FUNCTION_CONTRACT_MAP[n]);
  const noTableMap = allNames.filter(n => !EDGE_FUNCTION_MIGRATION_MAP[n]);
  const noStrict = allNames.filter(n => !EDGE_FUNCTION_BACKEND_CATEGORY[n]);

  if (uncategorized.length > 0) errors.push(`Uncategorized functions: ${uncategorized.join(", ")}`);
  if (unauthed.length > 0) errors.push(`Functions missing auth map: ${unauthed.join(", ")}`);
  if (unowned.length > 0) errors.push(`Functions missing ownership: ${unowned.join(", ")}`);
  if (noStrict.length > 0) errors.push(`Functions missing strict BackendCategory: ${noStrict.join(", ")}`);
  if (noContext.length > 0) warnings.push(`Functions without bounded context: ${noContext.join(", ")}`);
  if (noContract.length > 0) warnings.push(`Functions without contract map: ${noContract.join(", ")}`);
  if (noTableMap.length > 0) warnings.push(`Functions without table access map: ${noTableMap.join(", ")}`);

  // One-role-only enforcement & allowed caller validation
  let callGraphValid = 0;
  for (const entry of EDGE_FUNCTION_REGISTRY) {
    // Registry category must agree with strict category map
    if (EDGE_FUNCTION_BACKEND_CATEGORY[entry.name] !== entry.category) {
      errors.push(`${entry.name}: registry category (${entry.category}) ≠ strict map (${EDGE_FUNCTION_BACKEND_CATEGORY[entry.name]})`);
    }
    // Allowed callers must be from the known set
    for (const c of entry.allowedCallers) {
      if (!KNOWN_CALLER_CLASSES.has(c)) {
        errors.push(`${entry.name}: unknown allowedCaller "${c}"`);
      }
    }
    // Empty allowedCallers means an unreachable function
    if (entry.allowedCallers.length === 0) {
      warnings.push(`${entry.name}: has no allowedCallers — function is unreachable`);
    }
    // Call graph integrity
    let allTargetsValid = true;
    for (const target of entry.callsInto) {
      if (!registrySet.has(target) && !KNOWN_CALLER_CLASSES.has(target)) {
        warnings.push(`${entry.name}: callsInto references unknown "${target}"`);
        allTargetsValid = false;
      }
    }
    if (allTargetsValid) callGraphValid++;
  }

  // Phantom maps
  const categoryOrphans = Object.keys(EDGE_FUNCTION_CATEGORIES).filter(n => !registrySet.has(n));
  const authOrphans = Object.keys(EDGE_FUNCTION_AUTH_MAP).filter(n => !registrySet.has(n));
  if (categoryOrphans.length > 0) warnings.push(`Category map has unknown functions: ${categoryOrphans.join(", ")}`);
  if (authOrphans.length > 0) warnings.push(`Auth map has unknown functions: ${authOrphans.join(", ")}`);

  // BFF purity light-check (registry-level): BFFs cannot directly call runtime-system
  for (const entry of EDGE_FUNCTION_REGISTRY) {
    if (entry.category === "PUBLIC_BFF" || entry.category === "ADMIN_BFF") {
      for (const target of entry.callsInto) {
        const targetEntry = EDGE_FUNCTION_REGISTRY.find(e => e.name === target);
        if (targetEntry?.category === "RUNTIME_SYSTEM_FUNCTION") {
          errors.push(`BFF purity violation: ${entry.name} (${entry.category}) calls RUNTIME_SYSTEM_FUNCTION ${target}`);
        }
      }
    }
  }

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
      strictlyClassified: allNames.length - noStrict.length,
      callGraphValid,
    },
  };
}

export function getTopologySummary(): string {
  const result = validateTopology();
  const lines = [
    `Edge Function Topology: ${result.valid ? "✅ VALID" : "❌ INVALID"}`,
    `Total: ${result.stats.totalFunctions}`,
    `Strictly classified: ${result.stats.strictlyClassified}/${result.stats.totalFunctions}`,
    `Categorized: ${result.stats.categorized}/${result.stats.totalFunctions}`,
    `Auth mapped: ${result.stats.authed}/${result.stats.totalFunctions}`,
    `Owned: ${result.stats.owned}/${result.stats.totalFunctions}`,
    `Context mapped: ${result.stats.contextMapped}/${result.stats.totalFunctions}`,
    `Contract mapped: ${result.stats.contractMapped}/${result.stats.totalFunctions}`,
    `Table mapped: ${result.stats.tableMapped}/${result.stats.totalFunctions}`,
    `Call graph valid: ${result.stats.callGraphValid}/${result.stats.totalFunctions}`,
  ];
  if (result.errors.length > 0) lines.push(`Errors: ${result.errors.length}`);
  if (result.warnings.length > 0) lines.push(`Warnings: ${result.warnings.length}`);
  return lines.join("\n");
}
