#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Script Owner Map
// Maps every script to its canonical ownership domain
// ═══════════════════════════════════════════════════════════════

import type { OwnershipDomain } from "./script-taxonomy";

export interface ScriptOwnership {
  path: string;
  owner: OwnershipDomain;
  reason: string;
}

/** Classify a script path to its ownership domain */
export function classifyOwnership(scriptPath: string): OwnershipDomain {
  const p = scriptPath.replace(/\\/g, "/");

  // Explicit directory-based ownership
  if (p.includes("scripts/architecture/")) return "architecture";
  if (p.includes("scripts/contracts/")) return "contracts";
  if (p.includes("scripts/runtime/")) return "platform-runtime";
  if (p.includes("scripts/manifests/")) return "architecture";
  if (p.includes("scripts/db/")) return "db";
  if (p.includes("scripts/deployment/")) return "deployment-release";
  if (p.includes("scripts/release/")) return "deployment-release";
  if (p.includes("scripts/security/")) return "security";
  if (p.includes("scripts/support/")) return "supportability";
  if (p.includes("scripts/bootstrap/")) return "architecture";
  if (p.includes("scripts/codemods/")) return "migration-refactor";
  if (p.includes("scripts/migrate/")) return "migration-refactor";
  if (p.includes("scripts/legacy/")) return "migration-refactor";
  if (p.includes("scripts/testing/")) return "platform-runtime";
  if (p.includes("scripts/ops/")) return "supportability";
  if (p.includes("scripts/docs/")) return "architecture";

  // Name-based classification for root scripts
  const base = p.split("/").pop() || "";
  if (base.includes("contract") || base.includes("import-boundar") || base.includes("canonical-import") || base.includes("package-export")) return "contracts";
  if (base.includes("runtime") || base.includes("edge-function") || base.includes("capability")) return "platform-runtime";
  if (base.includes("deploy") || base.includes("release") || base.includes("vmware") || base.includes("helm") || base.includes("ova")) return "deployment-release";
  if (base.includes("db-") || base.includes("schema") || base.includes("rls") || base.includes("migration")) return "db";
  if (base.includes("security") || base.includes("rotate") || base.includes("tenant") || base.includes("role-leakage")) return "security";
  if (base.includes("restore") || base.includes("drill") || base.includes("diagnostic") || base.includes("runbook") || base.includes("support")) return "supportability";
  if (base.includes("admin") || base.includes("ia-coherence") || base.includes("shell-consistency")) return "admin-control-plane";
  if (base.includes("consolidate") || base.includes("normalize") || base.includes("rewrite")) return "migration-refactor";
  if (base.includes("brain") || base.includes("single-brain") || base.includes("module-count") || base.includes("sprawl") || base.includes("boundar")) return "architecture";
  if (base.includes("generate-") || base.includes("check-") || base.includes("assert-") || base.includes("validate-")) return "architecture";

  return "architecture";
}

console.log("✅ script-owner-map: Ownership classification function ready");
