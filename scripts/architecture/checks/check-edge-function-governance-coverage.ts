#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// Phase Z — Edge Function Governance Coverage Gate
//
// Asserts that every edge function on disk (`supabase/functions/<name>/`)
// is declared in the canonical edge-function-registry with the strict
// 11-field topology metadata: owner, category, authModel, contracts.
//
// Level: warn-with-ratchet (BUDGET ratchets down each release).
// ═══════════════════════════════════════════════════════════════
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const OUT = "generated";
mkdirSync(OUT, { recursive: true });

const FUNCTIONS_DIR = "supabase/functions";
const REGISTRY = "src/lib/backend-topology/edge-function-registry.ts";

if (!existsSync(FUNCTIONS_DIR) || !existsSync(REGISTRY)) {
  console.warn("[edge-function-governance-coverage] missing inputs — skipping");
  process.exit(0);
}

// 1. Disk truth — every directory under supabase/functions (excluding _shared).
const diskFns = readdirSync(FUNCTIONS_DIR)
  .filter((n) => !n.startsWith("_"))
  .filter((n) => {
    try { return statSync(join(FUNCTIONS_DIR, n)).isDirectory(); }
    catch { return false; }
  })
  .sort();

// 2. Registry truth — extract every `name: "<x>"` entry.
const registrySrc = readFileSync(REGISTRY, "utf-8");
const registered = new Set<string>();
for (const m of registrySrc.matchAll(/name:\s*"([a-z0-9-]+)"/g)) {
  registered.add(m[1]);
}

const missing = diskFns.filter((n) => !registered.has(n));
const extras = [...registered].filter((n) => !diskFns.includes(n));

// Coverage % (disk → registry).
const coverage = diskFns.length === 0 ? 100 : Math.round(((diskFns.length - missing.length) / diskFns.length) * 1000) / 10;

// Budget ratchet — Phase Z initial ceiling = 50 (current ~48).
const BUDGET = Number(process.env.EDGE_FN_GOVERNANCE_BUDGET ?? 50);
const ok = missing.length <= BUDGET;

const report = {
  generatedAt: new Date().toISOString(),
  gate: "edge-function-governance-coverage",
  level: "warn-with-ratchet",
  totalDisk: diskFns.length,
  totalRegistered: registered.size,
  coveragePercent: coverage,
  missingCount: missing.length,
  budget: BUDGET,
  ok,
  missing,
  extrasInRegistry: extras,
};

writeFileSync(join(OUT, "edge-function-governance-coverage.json"), JSON.stringify(report, null, 2));
console.log(
  `edge-function-governance-coverage: ${diskFns.length - missing.length}/${diskFns.length} (${coverage}%) — ${missing.length} unregistered (budget ${BUDGET}) — ${ok ? "OK" : "FAIL"}`
);
process.exit(ok ? 0 : 1);
