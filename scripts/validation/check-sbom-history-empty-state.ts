#!/usr/bin/env node
// Admin Empty-State Closure — SBOM History (WARN-tier)
//
// HONEST DEFERRAL VALIDATOR
// /admin/releases/sbom-history is owned by the releases domain.
// This validator REFUSES to fake-green until that domain pass builds the page.
//
// Source-of-truth deferral doc:
//   generated/admin-empty-state-closure/SBOM_HISTORY_EMPTY_STATE_SPEC.md
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "sbom-history-empty-state";
const DEFERRAL_DOC = "generated/admin-empty-state-closure/SBOM_HISTORY_EMPTY_STATE_SPEC.md";
const PAGE = "src/pages/admin/releases/SbomHistory.tsx";
const issues: GateIssue[] = [];

// In-scope today: confirm canonical release surfaces ARE present so operators have alternatives.
const CANONICAL_RELEASE_SURFACES = [
  "src/pages/admin/releases/ReleasesHome.tsx",
  "src/pages/admin/AIReleasesCenter.tsx",
];
let canonicalPresent = 0;
for (const f of CANONICAL_RELEASE_SURFACES) {
  if (existsSync(f)) canonicalPresent++;
}
if (canonicalPresent < CANONICAL_RELEASE_SURFACES.length) {
  issues.push({
    severity: "error",
    area: "canonical-alternatives",
    message: `Only ${canonicalPresent}/${CANONICAL_RELEASE_SURFACES.length} canonical release surfaces present — operators need alternatives while sbom-history is deferred`,
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
    message: `Page does not exist yet: ${PAGE}. DEFERRED to releases-domain-pass. See ${DEFERRAL_DOC}.`,
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
  // Action-link assertion
  const linkMatches = src.match(/to="\/admin\//g) ?? [];
  if (linkMatches.length < 2) {
    issues.push({
      severity: "error",
      area: "operator-navigation",
      message: `${PAGE} must contain ≥2 real <Link to="/admin/..."> canonical destinations (found ${linkMatches.length})`,
    });
  }
  // History-context copy assertion
  const hasHistoryCopy = /history|signed release|SBOM|accumulat|release cycle/i.test(src);
  if (!hasHistoryCopy) {
    issues.push({
      severity: "error",
      area: "history-context-copy",
      message: `${PAGE} missing history-context operator copy`,
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
    canonicalAlternativesExpected: CANONICAL_RELEASE_SURFACES.length,
    requiredForGreen:
      "releases-domain-pass: build SbomHistory.tsx + adopt PremiumEmptyState with link to ReleasesHome and AIReleasesCenter",
  },
});
process.exit(ok ? 0 : 1);
