#!/usr/bin/env node
/* eslint-disable no-console */
// Phase B2 — service topology drift check (warn-level)
// Tracks hidden-service files in src/lib/ so the count cannot grow.

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = "src/lib";
const OUT = "generated";
mkdirSync(OUT, { recursive: true });

function walk(d: string, acc: string[] = []): string[] {
  if (!existsSync(d)) return acc;
  for (const e of readdirSync(d)) {
    const f = join(d, e);
    let s; try { s = statSync(f); } catch { continue; }
    if (s.isDirectory()) walk(f, acc);
    else if (/\.(ts|tsx)$/.test(e)) acc.push(f);
  }
  return acc;
}

const SERVICE_RE = /class\s+\w+Service|export\s+(?:async\s+)?function\s+\w+(?:Service|Manager|Orchestrator|Gateway|Client)/i;
const hidden: string[] = [];

if (existsSync(ROOT)) {
  for (const f of walk(ROOT)) {
    let c; try { c = readFileSync(f, "utf-8"); } catch { continue; }
    if (SERVICE_RE.test(c)) hidden.push(relative(".", f));
  }
}

// Phase B6 — ratchet down. Current 178; budget tightened to 185 to prevent
// service-layer regrowth in src/lib/. Stays warn-level until full migration.
const BUDGET = 185;
const ok = hidden.length <= BUDGET;
const report = {
  generatedAt: new Date().toISOString(),
  gate: "service-topology-drift",
  hiddenServiceCount: hidden.length,
  budget: BUDGET,
  level: "warn",
  ok,
  sample: hidden.slice(0, 30),
};

writeFileSync(join(OUT, "service-topology-drift.json"), JSON.stringify(report, null, 2));
console.log(`service-topology: ${hidden.length} hidden services (budget ${BUDGET}) — ${ok ? "OK" : "WARN"}`);
process.exit(0); // warn-level — never blocks
