#!/usr/bin/env node
/* eslint-disable no-console */
// Phase B2 — contract topology drift check (warn-level)
// Tracks contract-family files outside src/contracts/ and src/packages/.

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const OUT = "generated";
mkdirSync(OUT, { recursive: true });

function walk(d: string, acc: string[] = []): string[] {
  if (!existsSync(d)) return acc;
  for (const e of readdirSync(d)) {
    const f = join(d, e);
    let s; try { s = statSync(f); } catch { continue; }
    if (s.isDirectory()) {
      if (e === "node_modules" || e === ".git") continue;
      walk(f, acc);
    } else if (/\.(ts|tsx)$/.test(e)) acc.push(f);
  }
  return acc;
}

const NAMED_FAMILIES = [
  /architecture-contracts?\b/i,
  /engines?-contracts?\b/i,
  /sync-engine-contracts?\b/i,
  /orchestration-contracts?\b/i,
  /nova-sdk-contracts?\b/i,
];

const leaks: string[] = [];
for (const f of walk("src")) {
  const rel = relative(".", f);
  if (rel.startsWith("src/contracts/") || rel.startsWith("src/packages/")) continue;
  if (NAMED_FAMILIES.some((re) => re.test(rel))) leaks.push(rel);
}

// Phase B5 — graduated to BLOCK level. Current value is 0; any new contract
// drift outside src/contracts/ or src/packages/ is now a constitutional violation.
const BUDGET = 0;
const ok = leaks.length <= BUDGET;
const report = {
  generatedAt: new Date().toISOString(),
  gate: "contract-topology-drift",
  leakedNamedFamilyCount: leaks.length,
  budget: BUDGET,
  level: "block",
  ok,
  sample: leaks.slice(0, 30),
};
writeFileSync(join(OUT, "contract-topology-drift.json"), JSON.stringify(report, null, 2));
console.log(`contract-topology: ${leaks.length} leaked named-family contracts (budget ${BUDGET}) — ${ok ? "OK" : "BLOCK"}`);
process.exit(ok ? 0 : 1);
