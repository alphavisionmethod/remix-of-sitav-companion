#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Cosmetic Debt Closure Check (PHYSICAL DELETION MODE)
// Asserts that the three formerly-open "cosmetic/tracked" items
// in PROJECT_TREE_AUDIT.md Section A are PHYSICALLY remediated.
//
// Closes (post-shim deletion):
//   A1 — src/lib/ shrinkage  → 5 service-shaped folders DELETED
//                              (canonical-backend, simulation,
//                               demo-data, mock-data, seed)
//                              and their canonical homes exist.
//   A2 — src/services/        → façade spans ALL 4 layers
//                              (core, data, OS, platform)
//   A3 — legacy mirror dirs   → src/legacy/{canonical-backend,
//                              simulation,unclassified} DELETED
// ═══════════════════════════════════════════════════════════════

import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT_DIR = "generated";
mkdirSync(OUT_DIR, { recursive: true });

interface PhysicalAssertion {
  closes: string;
  description: string;
  path: string;
  mustExist: boolean;
  mustContain?: string[];
}

const ASSERTIONS: PhysicalAssertion[] = [
  // A1 — src/lib shrinkage: shim folders DELETED, canonical homes present
  { closes: "A1", description: "src/lib/canonical-backend DELETED", path: "src/lib/canonical-backend", mustExist: false },
  { closes: "A1", description: "src/lib/simulation DELETED", path: "src/lib/simulation", mustExist: false },
  { closes: "A1", description: "src/lib/mock-data DELETED", path: "src/lib/mock-data", mustExist: false },
  { closes: "A1", description: "src/lib/demo-data DELETED", path: "src/lib/demo-data", mustExist: false },
  { closes: "A1", description: "src/lib/seed DELETED", path: "src/lib/seed", mustExist: false },
  {
    closes: "A1",
    description: "Real canonical-backend code lives at src/integrations/canonical-backend",
    path: "src/integrations/canonical-backend/index.ts",
    mustExist: true,
    mustContain: ["recordReceipt", "createApprovalRequest"],
  },
  {
    closes: "A1",
    description: "Real simulation code lives at src/domains/simulation",
    path: "src/domains/simulation/monte-carlo-engine.ts",
    mustExist: true,
  },
  {
    closes: "A1",
    description: "Real mock-data lives at src/data/fixtures/mock-data",
    path: "src/data/fixtures/mock-data/index.ts",
    mustExist: true,
  },
  {
    closes: "A1",
    description: "Real demo-data lives at src/data/fixtures/demo-data",
    path: "src/data/fixtures/demo-data/index.ts",
    mustExist: true,
  },
  {
    closes: "A1",
    description: "Real seed code lives at src/data/fixtures/seed",
    path: "src/data/fixtures/seed/index.ts",
    mustExist: true,
  },

  // A2 — services façade: must span all 4 layers
  {
    closes: "A2",
    description: "Canonical src/services/ façade exists and spans 4 layers",
    path: "src/services/index.ts",
    mustExist: true,
    mustContain: [
      "@/lib/core-services",   // Layer 2
      "@/lib/data-services",   // Layer 4
      "@/lib/os-services",     // Layer 3
      "@/packages",            // Layer 1
    ],
  },

  // A3 — legacy mirror barrels DELETED
  { closes: "A3", description: "Legacy canonical-backend mirror DELETED", path: "src/legacy/canonical-backend", mustExist: false },
  { closes: "A3", description: "Legacy simulation mirror DELETED", path: "src/legacy/simulation", mustExist: false },
  { closes: "A3", description: "Legacy unclassified barrel DELETED", path: "src/legacy/unclassified", mustExist: false },
];

interface Violation {
  closes: string;
  path: string;
  reason: string;
}

const violations: Violation[] = [];
const verified: Array<{ closes: string; path: string }> = [];

for (const a of ASSERTIONS) {
  const exists = existsSync(a.path);
  if (a.mustExist && !exists) {
    violations.push({ closes: a.closes, path: a.path, reason: "expected to exist, missing" });
    continue;
  }
  if (!a.mustExist && exists) {
    violations.push({ closes: a.closes, path: a.path, reason: "expected to be DELETED, still present" });
    continue;
  }
  if (a.mustExist && exists) {
    const stat = statSync(a.path);
    if (stat.isFile()) {
      const body = readFileSync(a.path, "utf8");
      const missing = (a.mustContain ?? []).filter((needle) => !body.includes(needle));
      if (missing.length > 0) {
        violations.push({
          closes: a.closes,
          path: a.path,
          reason: `missing required marker(s): ${missing.join(", ")}`,
        });
        continue;
      }
    }
  }
  verified.push({ closes: a.closes, path: a.path });
}

const report = {
  generatedAt: new Date().toISOString(),
  gate: "cosmetic-debt-closure",
  mode: "PHYSICAL-DELETION",
  tier: "BLOCK-composite",
  parentGate: "lib-ownership-drift",
  totalAssertions: ASSERTIONS.length,
  verified,
  violations,
  ok: violations.length === 0,
  errorCount: violations.length,
};

writeFileSync(
  join(OUT_DIR, "cosmetic-debt-closure-report.json"),
  JSON.stringify(report, null, 2),
);

console.log(
  `cosmetic-debt-closure (PHYSICAL-DELETION): ${verified.length}/${ASSERTIONS.length} assertions passed, ${violations.length} violation(s)`,
);
if (violations.length > 0) {
  for (const v of violations) {
    console.log(`  ❌ [${v.closes}] ${v.path}: ${v.reason}`);
  }
  process.exit(1);
}
for (const v of verified) {
  console.log(`  ✅ [${v.closes}] ${v.path}`);
}
process.exit(0);
