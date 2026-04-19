#!/usr/bin/env node
// Admin Empty-State Closure — Cross-Domain Coherence (WARN-tier)
//
// HONEST DEFERRAL VALIDATOR
// /admin/verification/cross-domain-coherence is owned by the verification domain.
// This validator REFUSES to fake-green until that domain pass builds the page
// and adopts a canonical empty-state primitive.
//
// Source-of-truth deferral doc:
//   generated/admin-empty-state-closure/CROSS_DOMAIN_COHERENCE_EMPTY_STATE_SPEC.md
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "cross-domain-coherence-empty-state";
const DEFERRAL_DOC =
  "generated/admin-empty-state-closure/CROSS_DOMAIN_COHERENCE_EMPTY_STATE_SPEC.md";
const PAGE = "src/pages/admin/verification/CrossDomainCoherence.tsx";
const issues: GateIssue[] = [];

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
    message: `Page does not exist yet: ${PAGE}. DEFERRED to verification-domain-pass. See ${DEFERRAL_DOC}.`,
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
    requiredForGreen:
      "verification-domain-pass: build CrossDomainCoherence.tsx + adopt PremiumEmptyState with canonical destination links",
  },
});
process.exit(ok ? 0 : 1);
