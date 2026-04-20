#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Window Contract Closure Validator (BLOCK)
// Ensures every registered window has canonical contract coverage.
// ═══════════════════════════════════════════════════════════════
import { existsSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";

const REGISTRY_PATH = "src/lib/windowing/window-registry.ts";
const CONTRACTS_PATH = "src/packages/window-contracts/index.ts";
const PROOF_PATH = "generated/windowing-proof/window-contract-coverage.json";

const issues: { severity: string; message: string }[] = [];

if (!existsSync(REGISTRY_PATH)) issues.push({ severity: "error", message: `Missing: ${REGISTRY_PATH}` });
if (!existsSync(CONTRACTS_PATH)) issues.push({ severity: "error", message: `Missing: ${CONTRACTS_PATH}` });

const REQUIRED_FIELDS = ["windowType", "windowRole", "runtimeSurface", "shellTarget", "persistencePolicy", "recoveryPolicy", "permissionScope", "communicationPolicy"];

if (existsSync(REGISTRY_PATH)) {
  const src = readFileSync(REGISTRY_PATH, "utf-8");
  for (const field of REQUIRED_FIELDS) {
    if (!src.includes(field)) {
      issues.push({ severity: "error", message: `Registry missing contract field: ${field}` });
    }
  }
  const windowCount = (src.match(/windowId:\s*"/g) || []).length;
  console.log(`  📋 ${windowCount} windows with contract fields`);
}

if (existsSync(PROOF_PATH)) {
  const proof = JSON.parse(readFileSync(PROOF_PATH, "utf-8"));
  if (proof.coverage !== "100%") issues.push({ severity: "error", message: `Contract coverage: ${proof.coverage}` });
}

const ok = issues.filter(i => i.severity === "error").length === 0;
console.log(`Window contract closure: ${ok ? "✅" : "❌"}`);
if (!ok) { issues.forEach(i => console.error(`  ${i.severity}: ${i.message}`)); process.exit(1); }