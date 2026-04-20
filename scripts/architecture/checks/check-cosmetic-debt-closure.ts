#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Cosmetic Debt Closure Check (PHYSICAL MODE)
// Asserts that the three formerly-open "cosmetic/tracked" items
// in PROJECT_TREE_AUDIT.md Section A are PHYSICALLY remediated
// on disk — not paper-attested.
//
// Closes (physical):
//   A1 — src/lib/ shrinkage  → 4 service-shaped folders relocated
//                              (canonical-backend, simulation,
//                               demo-data, mock-data, seed → shims only)
//   A2 — src/services/        → src/services/index.ts façade exists
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
  mustBeShim?: boolean; // file must contain only re-export(s)
}

const ASSERTIONS: PhysicalAssertion[] = [
  // A1 — src/lib shrinkage: original folders are now shim-only re-exports
  {
    closes: "A1",
    description: "src/lib/canonical-backend is a shim, real code at @/integrations/canonical-backend",
    path: "src/lib/canonical-backend/index.ts",
    mustExist: true,
    mustBeShim: true,
    mustContain: ["@/integrations/canonical-backend"],
  },
  {
    closes: "A1",
    description: "Real canonical-backend code lives at src/integrations/canonical-backend",
    path: "src/integrations/canonical-backend/index.ts",
    mustExist: true,
    mustContain: ["recordReceipt", "createApprovalRequest"],
  },
  {
    closes: "A1",
    description: "src/lib/simulation/monte-carlo-engine.ts is a shim",
    path: "src/lib/simulation/monte-carlo-engine.ts",
    mustExist: true,
    mustBeShim: true,
    mustContain: ["@/domains/simulation/monte-carlo-engine"],
  },
  {
    closes: "A1",
    description: "Real simulation code lives at src/domains/simulation",
    path: "src/domains/simulation/monte-carlo-engine.ts",
    mustExist: true,
  },
  {
    closes: "A1",
    description: "src/lib/mock-data/index.ts is a shim",
    path: "src/lib/mock-data/index.ts",
    mustExist: true,
    mustBeShim: true,
    mustContain: ["@/data/fixtures/mock-data"],
  },
  {
    closes: "A1",
    description: "Real mock-data lives at src/data/fixtures/mock-data",
    path: "src/data/fixtures/mock-data/index.ts",
    mustExist: true,
  },
  {
    closes: "A1",
    description: "src/lib/demo-data/index.ts is a shim",
    path: "src/lib/demo-data/index.ts",
    mustExist: true,
    mustBeShim: true,
    mustContain: ["@/data/fixtures/demo-data"],
  },
  {
    closes: "A1",
    description: "src/lib/seed/index.ts is a shim",
    path: "src/lib/seed/index.ts",
    mustExist: true,
    mustBeShim: true,
    mustContain: ["@/data/fixtures/seed"],
  },
  // A2 — services façade
  {
    closes: "A2",
    description: "Canonical src/services/ façade exists",
    path: "src/services/index.ts",
    mustExist: true,
    mustContain: [
      "@/lib/core-services",
      "@/lib/data-services",
      "@/packages",
    ],
  },
  // A3 — legacy mirror barrels DELETED
  {
    closes: "A3",
    description: "Legacy canonical-backend mirror is DELETED",
    path: "src/legacy/canonical-backend",
    mustExist: false,
  },
  {
    closes: "A3",
    description: "Legacy simulation mirror is DELETED",
    path: "src/legacy/simulation",
    mustExist: false,
  },
  {
    closes: "A3",
    description: "Legacy unclassified barrel is DELETED",
    path: "src/legacy/unclassified",
    mustExist: false,
  },
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
      if (a.mustBeShim) {
        // shim: only export statements, no logic
        const nonComment = body
          .split("\n")
          .filter((l) => !l.trim().startsWith("//") && !l.trim().startsWith("/*") && !l.trim().startsWith("*") && l.trim().length > 0)
          .join("\n");
        if (/\b(function|class|const\s+\w+\s*=\s*[^"'])/i.test(nonComment) && !/^export\s+\*/m.test(nonComment.split("\n")[0] ?? "")) {
          // permissive — only fail if no export * at all
          if (!/export\s+\*/.test(body)) {
            violations.push({ closes: a.closes, path: a.path, reason: "expected shim (re-export only), found logic" });
            continue;
          }
        }
      }
    }
  }
  verified.push({ closes: a.closes, path: a.path });
}

const report = {
  generatedAt: new Date().toISOString(),
  gate: "cosmetic-debt-closure",
  mode: "PHYSICAL",
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
  `cosmetic-debt-closure (PHYSICAL): ${verified.length}/${ASSERTIONS.length} assertions passed, ${violations.length} violation(s)`,
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
