#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Backend Registry Completeness Check
//
// Phase 2 gate: every function on disk must have a complete entry
// in EDGE_FUNCTION_REGISTRY with all 11 required strict-topology
// fields populated. Cross-validates against the 6 supporting maps.
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";
import { ViolationCollector } from "../../architecture/lib/utils";
import { EDGE_FUNCTION_REGISTRY } from "../../../src/lib/backend-topology/edge-function-registry";
import { EDGE_FUNCTION_BACKEND_CATEGORY } from "../../../src/lib/backend-topology/edge-function-categories";
import { EDGE_FUNCTION_AUTH_MAP } from "../../../src/lib/backend-topology/edge-function-auth-map";
import { EDGE_FUNCTION_OWNER_MAP } from "../../../src/lib/backend-topology/edge-function-owner-map";
import { EDGE_FUNCTION_BOUNDED_CONTEXTS } from "../../../src/lib/backend-topology/edge-function-bounded-contexts";
import { EDGE_FUNCTION_CONTRACT_MAP } from "../../../src/lib/backend-topology/edge-function-contract-map";

const vc = new ViolationCollector();
const FUNCTIONS_DIR = "supabase/functions";

if (!fs.existsSync(FUNCTIONS_DIR)) {
  console.log("⚠️ supabase/functions directory not found");
  process.exit(0);
}

const onDisk = fs.readdirSync(FUNCTIONS_DIR)
  .filter((n) => !n.startsWith("_") && !n.startsWith("."))
  .filter((n) => fs.existsSync(path.join(FUNCTIONS_DIR, n, "index.ts")));

const REQUIRED_FIELDS = [
  "id", "name", "path", "category", "boundedContext", "owner",
  "authModel", "sideEffectClass", "allowedCallers", "callsInto",
  "runtimeConsequence", "migrationStatus",
] as const;

const registryByName = new Map(EDGE_FUNCTION_REGISTRY.map(e => [e.name, e]));
let complete = 0;
let missingFromRegistry = 0;
let incomplete = 0;
let crossMapDrift = 0;

// 1) On-disk → must exist in registry with all required fields
for (const name of onDisk) {
  const entry = registryByName.get(name);
  if (!entry) {
    vc.add(`supabase/functions/${name}`, "missing-from-registry",
      `Function ${name} exists on disk but not in EDGE_FUNCTION_REGISTRY`, "error");
    missingFromRegistry++;
    continue;
  }
  const missing: string[] = [];
  for (const field of REQUIRED_FIELDS) {
    const v = (entry as Record<string, unknown>)[field];
    if (v === undefined || v === null || v === "") missing.push(field);
    if (Array.isArray(v) && field === "allowedCallers" && v.length === 0) missing.push(`${field}(empty)`);
  }
  if (missing.length > 0) {
    vc.add(`supabase/functions/${name}`, "incomplete-registry-entry",
      `Function ${name} missing required fields: ${missing.join(", ")}`, "error");
    incomplete++;
    continue;
  }
  complete++;

  // 2) Cross-map consistency
  if (EDGE_FUNCTION_BACKEND_CATEGORY[name] !== entry.category) {
    vc.add(`supabase/functions/${name}`, "category-drift",
      `Registry category ${entry.category} ≠ EDGE_FUNCTION_BACKEND_CATEGORY ${EDGE_FUNCTION_BACKEND_CATEGORY[name]}`, "error");
    crossMapDrift++;
  }
  const auth = EDGE_FUNCTION_AUTH_MAP[name];
  if (!auth) {
    vc.add(`supabase/functions/${name}`, "auth-map-missing", `auth-map missing entry for ${name}`, "error");
    crossMapDrift++;
  } else if (auth.auth !== entry.authModel) {
    vc.add(`supabase/functions/${name}`, "auth-drift",
      `Registry authModel ${entry.authModel} ≠ auth-map ${auth.auth}`, "error");
    crossMapDrift++;
  }
  if (EDGE_FUNCTION_OWNER_MAP[name] !== entry.owner) {
    vc.add(`supabase/functions/${name}`, "owner-drift",
      `Registry owner ${entry.owner} ≠ owner-map ${EDGE_FUNCTION_OWNER_MAP[name]}`, "error");
    crossMapDrift++;
  }
  if (EDGE_FUNCTION_BOUNDED_CONTEXTS[name] !== entry.boundedContext) {
    vc.add(`supabase/functions/${name}`, "bounded-context-drift",
      `Registry boundedContext ${entry.boundedContext} ≠ bounded-contexts-map ${EDGE_FUNCTION_BOUNDED_CONTEXTS[name]}`, "error");
    crossMapDrift++;
  }
  const contract = EDGE_FUNCTION_CONTRACT_MAP[name];
  if (!contract) {
    vc.add(`supabase/functions/${name}`, "contract-map-missing", `contract-map missing entry for ${name}`, "error");
    crossMapDrift++;
  }
}

// 3) Phantom registry entries (no on-disk code)
const onDiskSet = new Set(onDisk);
for (const entry of EDGE_FUNCTION_REGISTRY) {
  if (!onDiskSet.has(entry.name)) {
    vc.add(`supabase/functions/${entry.name}`, "phantom-registry-entry",
      `Registry entry exists for ${entry.name} but no index.ts on disk`, "warning");
  }
}

// 4) callsInto must reference real registered functions (or generic caller-class names)
const KNOWN_CALLER_CLASSES = new Set([
  "domain-function", "orchestration-function", "connector-webhook", "runtime-system",
  "public-bff", "admin-bff", "frontend-user", "frontend-admin",
]);
for (const entry of EDGE_FUNCTION_REGISTRY) {
  for (const target of entry.callsInto) {
    if (!registryByName.has(target) && !KNOWN_CALLER_CLASSES.has(target)) {
      vc.add(`supabase/functions/${entry.name}`, "invalid-call-target",
        `callsInto references unknown function "${target}"`, "warning");
    }
  }
}

console.log(`  📊 ${onDisk.length} on disk`);
console.log(`  ✅ ${complete} complete registry entries`);
console.log(`  ❌ ${missingFromRegistry} missing from registry`);
console.log(`  ⚠️ ${incomplete} incomplete entries`);
console.log(`  🔀 ${crossMapDrift} cross-map drifts`);

vc.report("check-backend-registry-completeness");
vc.exitIfErrors();
