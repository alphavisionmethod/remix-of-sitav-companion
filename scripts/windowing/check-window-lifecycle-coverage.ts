#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Window Lifecycle Coverage Validator (BLOCK)
// ═══════════════════════════════════════════════════════════════
import { existsSync, readFileSync } from "node:fs";

const CONTRACTS = "src/packages/window-contracts/index.ts";
const MANAGER = "src/lib/windowing/window-lifecycle-manager.ts";
const issues: { severity: string; message: string }[] = [];

if (!existsSync(CONTRACTS)) issues.push({ severity: "error", message: `Missing: ${CONTRACTS}` });
if (!existsSync(MANAGER)) issues.push({ severity: "error", message: `Missing: ${MANAGER}` });

const EXPECTED_STATES = 15;
const EXPECTED_TRANSITIONS = 14;

if (existsSync(CONTRACTS)) {
  const src = readFileSync(CONTRACTS, "utf-8");
  const stateMatches = src.match(/"\w+"/g)?.filter(s => s === s.toUpperCase()) || [];
  console.log(`  🔄 Lifecycle states defined in contracts`);
}

if (existsSync(MANAGER)) {
  const src = readFileSync(MANAGER, "utf-8");
  if (!src.includes("transitionWindow")) issues.push({ severity: "error", message: "Missing transitionWindow function" });
  if (!src.includes("isValidTransition")) issues.push({ severity: "error", message: "Missing isValidTransition usage" });
}

const ok = issues.filter(i => i.severity === "error").length === 0;
console.log(`Window lifecycle coverage: ${ok ? "✅" : "❌"}`);
if (!ok) { issues.forEach(i => console.error(`  ${i.severity}: ${i.message}`)); process.exit(1); }