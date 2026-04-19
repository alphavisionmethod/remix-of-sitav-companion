#!/usr/bin/env node
// Admin Empty-State Closure — Cost Spotlight (WARN-tier)
//
// HONEST DEFERRAL VALIDATOR
// /admin/health/cost-spotlight is owned by the health domain.
// This validator REFUSES to fake-green until that domain pass builds the page.
//
// Source-of-truth deferral doc:
//   generated/admin-empty-state-closure/COST_SPOTLIGHT_EMPTY_STATE_SPEC.md
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "cost-spotlight-empty-state";
const DEFERRAL_DOC = "generated/admin-empty-state-closure/COST_SPOTLIGHT_EMPTY_STATE_SPEC.md";
const PAGE = "src/pages/admin/health/CostSpotlight.tsx";
const issues: GateIssue[] = [];

// In-scope today: confirm canonical cost surfaces ARE present so operators have alternatives.
const CANONICAL_COST_SURFACES = [
  "src/pages/admin/AIG04BudgetCenter.tsx",
  "src/pages/admin/AIG05UsageLedgerExplorer.tsx",
  "src/pages/admin/AIT05CostEfficiency.tsx",
];
let canonicalPresent = 0;
for (const f of CANONICAL_COST_SURFACES) {
  if (existsSync(f)) canonicalPresent++;
}
if (canonicalPresent < CANONICAL_COST_SURFACES.length) {
  issues.push({
    severity: "error",
    area: "canonical-alternatives",
    message: `Only ${canonicalPresent}/${CANONICAL_COST_SURFACES.length} canonical cost surfaces present — operators need alternatives while spotlight is deferred`,
  });
}

if (!existsSync(DEFERRAL_DOC)) {
  issues.push({
    severity: "error",
    area: "deferral-marker",
    message: `Deferral doc missing: ${DEFERRAL_DOC}`,
  });
} else {
  const doc = readFileSync(DEFERRAL_DOC, "utf8");
  if (!doc.includes("DEFERRED") || !doc.includes("user-flagship-pass-required")) {
    issues.push({
      severity: "error",
      area: "deferral-marker",
      message: `Deferral doc lacks DEFERRED + user-flagship-pass-required markers`,
    });
  }
}

if (!existsSync(PAGE)) {
  issues.push({
    severity: "warning",
    area: "page-not-built",
    message: `Page does not exist yet: ${PAGE}. DEFERRED to health-domain-pass. See ${DEFERRAL_DOC}.`,
  });
} else {
  const src = readFileSync(PAGE, "utf8");
  const hasPrimitive =
    src.includes("PremiumEmptyState") || src.includes("EmptyState");
  if (!hasPrimitive) {
    issues.push({
      severity: "error",
      area: "primitive-adoption",
      message: `${PAGE} exists but does not adopt PremiumEmptyState or EmptyState`,
    });
  }
  // Action-link assertion: must contain real <Link to="/admin/..."> destinations
  const linkMatches = src.match(/to="\/admin\//g) ?? [];
  if (linkMatches.length < 2) {
    issues.push({
      severity: "error",
      area: "operator-navigation",
      message: `${PAGE} must contain ≥2 real <Link to="/admin/..."> canonical destinations (found ${linkMatches.length})`,
    });
  }
  // Preview-content honesty: any preview content MUST be explicitly labeled non-live
  const mentionsPreview = /preview|sample/i.test(src);
  const explicitlyLabeled = /non-?live|preview\s*·|sample\s*·|Preview · Non-live|Preview · sample/i.test(src);
  if (mentionsPreview && !explicitlyLabeled) {
    issues.push({
      severity: "error",
      area: "preview-honesty",
      message: `Page contains preview content but is NOT explicitly labeled non-live`,
    });
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({
  gate: GATE,
  ok,
  issues,
  extra: {
    classification: "honest-warn-deferred",
    deferralDoc: DEFERRAL_DOC,
    expectedPagePath: PAGE,
    canonicalAlternativesPresent: canonicalPresent,
    canonicalAlternativesExpected: CANONICAL_COST_SURFACES.length,
    requiredForGreen:
      "health-domain-pass: build CostSpotlight.tsx + adopt PremiumEmptyState + label any preview content non-live",
  },
});
process.exit(ok ? 0 : 1);
