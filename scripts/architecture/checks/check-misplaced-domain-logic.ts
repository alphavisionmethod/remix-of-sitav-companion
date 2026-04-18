#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Misplaced Domain Logic Check
// Flags business-context references inside src/platform.
// Platform code must stay domain-neutral (auth, policy, proof,
// execution, eventing, observability, etc.). Domain-specific
// identifiers (boardroom, concierge, finance-os, business-os)
// inside platform paths indicate ownership leakage.
// ═══════════════════════════════════════════════════════════════

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const OUT_DIR = "generated";
mkdirSync(OUT_DIR, { recursive: true });

const SCAN_ROOT = "src/platform";
const DOMAIN_TOKENS = [
  /\bboardroom\b/i,
  /\bconcierge\b/i,
  /\bbusiness-os\b/i,
  /\bfinance-os\b/i,
  /\binvestment-office\b/i,
  /\badvisor-protocol\b/i,
];

interface Hit { file: string; line: number; token: string; snippet: string; }
const hits: Hit[] = [];

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const e of readdirSync(dir)) {
    const full = join(dir, e);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(ts|tsx)$/.test(e)) out.push(full);
  }
  return out;
}

for (const file of walk(SCAN_ROOT)) {
  // Architecture maps and registries describe domains by name — exempt.
  if (/\/(architecture|topology|truth|migration)\//.test(file)) continue;
  const content = readFileSync(file, "utf8");
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    for (const pat of DOMAIN_TOKENS) {
      const m = lines[i].match(pat);
      if (m) {
        hits.push({
          file: relative(".", file),
          line: i + 1,
          token: m[0],
          snippet: lines[i].trim().slice(0, 160),
        });
        break;
      }
    }
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  gate: "misplaced-domain-logic",
  scanRoot: SCAN_ROOT,
  hits: hits.slice(0, 200),
  hitCount: hits.length,
  ok: true,
  errorCount: 0,
  warningCount: hits.length,
};

writeFileSync(join(OUT_DIR, "misplaced-domain-logic-report.json"), JSON.stringify(report, null, 2));
console.log(`misplaced-domain-logic: ${hits.length} candidate(s) [warning-level]`);
process.exit(0);
