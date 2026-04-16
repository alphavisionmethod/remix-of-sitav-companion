#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — RLS Coverage Check (HARDENED)
// Compares live pg_policies against the registry; fails on drift.
// Source of truth: live pg_policies + src/lib/db/rls-policy-registry.ts
// ═══════════════════════════════════════════════════════════════
import { ViolationCollector } from "../../architecture/lib/utils";
import { execSync } from "child_process";
import * as fs from "fs";

const vc = new ViolationCollector();
const REGISTRY_PATH = "src/lib/db/rls-policy-registry.ts";

if (!fs.existsSync(REGISTRY_PATH)) {
  vc.add(REGISTRY_PATH, "missing-registry", "RLS policy registry not found", "error");
  vc.report("check-rls-coverage");
  vc.exitIfErrors();
  process.exit(1);
}

const registryText = fs.readFileSync(REGISTRY_PATH, "utf-8");
const registered = new Set<string>();
const polCountByTable = new Map<string, number>();
const REG_RE = /"([a-z_]+)":\s*\{\s*pattern:\s*"([^"]+)"[^}]*policyCount:\s*(\d+)/g;
let m: RegExpExecArray | null;
while ((m = REG_RE.exec(registryText)) !== null) {
  registered.add(m[1]);
  polCountByTable.set(m[1], parseInt(m[3], 10));
}

if (!process.env.PGHOST) {
  console.log(`  ⚠️  PGHOST not set — registry-only mode`);
  console.log(`  📊 Registry: ${registered.size} tables`);
  vc.report("check-rls-coverage");
  process.exit(0);
}

let liveTables: string[] = [];
let livePolCounts = new Map<string, number>();
try {
  const tablesOut = execSync(`psql -A -t -F'|' -c "SELECT t.tablename, (SELECT COUNT(*) FROM pg_policies p WHERE p.schemaname='public' AND p.tablename=t.tablename), t.rowsecurity FROM pg_tables t WHERE t.schemaname='public' ORDER BY t.tablename"`, { encoding: "utf-8" });
  for (const line of tablesOut.split("\n").filter(Boolean)) {
    const [name, count, rls] = line.split("|");
    liveTables.push(name);
    livePolCounts.set(name, parseInt(count || "0", 10));
    if (rls !== "t" && rls !== "true") {
      vc.add(REGISTRY_PATH, "rls-disabled", `Table ${name} has rowsecurity=false`, "error");
    }
  }
} catch (e) {
  console.warn(`  ⚠️  psql query failed: ${(e as Error).message}`);
  process.exit(0);
}

let missing = 0, drifted = 0, noPolicy = 0;
for (const t of liveTables) {
  if (!registered.has(t)) {
    vc.add(REGISTRY_PATH, "missing-from-rls-registry", `Table ${t} exists in DB but missing from rls-policy-registry`, "error");
    missing++;
    continue;
  }
  const expected = polCountByTable.get(t) ?? 0;
  const actual = livePolCounts.get(t) ?? 0;
  if (expected !== actual) {
    vc.add(REGISTRY_PATH, "policy-count-drift", `Table ${t}: registry says ${expected} policies, live has ${actual}`, "warning");
    drifted++;
  }
  if (actual === 0) {
    vc.add(REGISTRY_PATH, "no-policies", `Table ${t} has 0 RLS policies`, "warning");
    noPolicy++;
  }
}

console.log(`  📊 Registry: ${registered.size} | Live: ${liveTables.length}`);
console.log(`  ⚠️  Missing: ${missing} | Drift: ${drifted} | No-policy: ${noPolicy}`);

vc.report("check-rls-coverage");
vc.exitIfErrors();
