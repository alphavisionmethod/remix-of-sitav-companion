#!/usr/bin/env tsx
// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Store Readiness Gate
//
// Validates every requirement in MOBILE_STORE_REQUIREMENTS:
//   - blocker  → must be satisfied or gate fails
//   - deferred → satisfied OR a deferralReason is recorded (warning)
//   - future   → informational only
//
// Emits: generated/mobile-store-readiness-report.json
// ═══════════════════════════════════════════════════════════════
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  MOBILE_STORE_REQUIREMENTS,
  honestlyDistributable,
  type MobileStoreRequirement,
} from "../../../src/lib/runtime/mobile-store-registry";

interface Issue {
  severity: "error" | "warning" | "info";
  requirementId: string;
  surface: string;
  category: string;
  message: string;
  remediation: string;
}

const REPO_ROOT = process.cwd();
const issues: Issue[] = [];
const satisfied: string[] = [];
const deferred: string[] = [];

function isSatisfied(req: MobileStoreRequirement): boolean {
  return req.satisfiedBy.some((p) => existsSync(resolve(REPO_ROOT, p)));
}

for (const req of MOBILE_STORE_REQUIREMENTS) {
  const ok = isSatisfied(req);
  if (ok) {
    satisfied.push(req.id);
    continue;
  }
  if (req.severity === "blocker") {
    issues.push({
      severity: "error",
      requirementId: req.id,
      surface: req.surface,
      category: req.category,
      message: `BLOCKER missing: ${req.title} (none of: ${req.satisfiedBy.join(", ")})`,
      remediation: req.remediation,
    });
  } else if (req.severity === "deferred") {
    deferred.push(req.id);
    issues.push({
      severity: "warning",
      requirementId: req.id,
      surface: req.surface,
      category: req.category,
      message: `Deferred: ${req.title} — ${req.deferralReason ?? "intentionally deferred"}`,
      remediation: req.remediation,
    });
  } else {
    issues.push({
      severity: "info",
      requirementId: req.id,
      surface: req.surface,
      category: req.category,
      message: `Future: ${req.title}`,
      remediation: req.remediation,
    });
  }
}

// Honesty cross-check: warn if a surface claims app-store-distribution=true
// but its signing requirement is still deferred.
for (const surface of ["ios", "android"] as const) {
  const distributable = honestlyDistributable(surface);
  const signingReq = MOBILE_STORE_REQUIREMENTS.find(
    (r) => r.surface === surface && r.category === "signing",
  );
  const signingOk = signingReq ? isSatisfied(signingReq) : false;
  if (distributable && !signingOk) {
    issues.push({
      severity: "error",
      requirementId: `${surface}-distribution-claim`,
      surface,
      category: "compliance",
      message: `${surface} claims app-store-distribution=true but signing config not satisfied — honesty violation`,
      remediation: `Either provide signing config or set app-store-distribution=false in mobile-runtime-contract.ts`,
    });
  }
}

const errorCount = issues.filter((i) => i.severity === "error").length;
const warningCount = issues.filter((i) => i.severity === "warning").length;
const infoCount = issues.filter((i) => i.severity === "info").length;

const report = {
  generatedAt: new Date().toISOString(),
  gate: "mobile-store-readiness",
  phase: "phase-13-mobile-distribution",
  ok: errorCount === 0,
  errorCount,
  warningCount,
  infoCount,
  totals: {
    requirements: MOBILE_STORE_REQUIREMENTS.length,
    satisfied: satisfied.length,
    deferred: deferred.length,
    blockerMissing: issues.filter((i) => i.severity === "error").length,
  },
  bySurface: {
    ios:    MOBILE_STORE_REQUIREMENTS.filter((r) => r.surface === "ios").length,
    android: MOBILE_STORE_REQUIREMENTS.filter((r) => r.surface === "android").length,
    shared: MOBILE_STORE_REQUIREMENTS.filter((r) => r.surface === "shared").length,
  },
  byCategory: MOBILE_STORE_REQUIREMENTS.reduce<Record<string, number>>((acc, r) => {
    acc[r.category] = (acc[r.category] ?? 0) + 1;
    return acc;
  }, {}),
  satisfied,
  deferred,
  issues,
};

const outDir = resolve(REPO_ROOT, "generated");
mkdirSync(outDir, { recursive: true });
writeFileSync(resolve(outDir, "mobile-store-readiness-report.json"), JSON.stringify(report, null, 2));

console.log(
  `[mobile-store-readiness] ${MOBILE_STORE_REQUIREMENTS.length} reqs · ${satisfied.length} satisfied · ${deferred.length} deferred · ${errorCount} blockers`,
);
if (errorCount > 0) {
  for (const e of issues.filter((i) => i.severity === "error")) {
    console.error(`  ✗ ${e.requirementId}: ${e.message}`);
  }
  process.exit(1);
}
console.log("[mobile-store-readiness] ✓ ok");
