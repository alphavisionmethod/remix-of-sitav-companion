#!/usr/bin/env node
// Admin Empty-State Closure — Canonical Pattern Audit (WARN-tier)
//
// Verifies the 3 canonical empty-state primitives remain present.
// Emits WARN listing the 3 deferred surfaces (verification/health/releases)
// awaiting their respective domain passes. Never silent-pass.
import { existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "admin-empty-state-patterns";
const DEFERRAL_DOC = "generated/admin-empty-state-closure/ADMIN_EMPTY_STATE_PATTERN_AUDIT.md";
const issues: GateIssue[] = [];

const CANONICAL_PRIMITIVES = [
  { name: "EmptyState", path: "src/components/primitives/feedback/EmptyState.tsx" },
  { name: "PremiumEmptyState", path: "src/components/sita/PremiumEmptyState.tsx" },
  { name: "BoardSection", path: "src/components/admin/ai-runtime/_shared/BoardSection.tsx" },
];

for (const p of CANONICAL_PRIMITIVES) {
  if (!existsSync(p.path)) {
    issues.push({
      severity: "error",
      area: "canonical-primitive",
      message: `Canonical empty-state primitive missing: ${p.name} at ${p.path}`,
    });
  }
}

if (!existsSync(DEFERRAL_DOC)) {
  issues.push({
    severity: "error",
    area: "deferral-marker",
    message: `Pattern audit doc missing: ${DEFERRAL_DOC}`,
  });
}

const DEFERRED_SURFACES = [
  "/admin/verification/cross-domain-coherence (verification-domain-pass)",
  "/admin/health/cost-spotlight (health-domain-pass)",
  "/admin/releases/sbom-history (releases-domain-pass)",
];

for (const s of DEFERRED_SURFACES) {
  issues.push({
    severity: "warning",
    area: "deferred-adoption",
    message: `Surface awaits canonical primitive adoption: ${s}. See ${DEFERRAL_DOC}.`,
  });
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({
  gate: GATE,
  ok,
  issues,
  extra: {
    classification: "honest-warn-deferred",
    canonicalPrimitives: CANONICAL_PRIMITIVES.map((p) => p.name),
    deferralDoc: DEFERRAL_DOC,
    requiredForGreen:
      "verification/health/releases domain passes adopt PremiumEmptyState or EmptyState on their respective surfaces",
  },
});
process.exit(ok ? 0 : 1);
