#!/usr/bin/env node
// Flagship Surface Closure — Boardroom Briefing Truth Alignment (WARN-tier)
//
// HONEST DEFERRAL VALIDATOR
// User-facing /boardroom/briefing UI is out-of-admin-AI-engineering scope.
// Admin chamber + canonical Layer 7 backbone IS in scope and validated by
// check-boardroom-layer7-closure.ts (separate BLOCK gate).
//
// Source-of-truth deferral doc:
//   generated/flagship-surface-closure/BOARDROOM_BRIEFING_CLOSURE_SPEC.md
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "boardroom-briefing-truth-alignment";
const issues: GateIssue[] = [];
const DEFERRAL_DOC = "generated/flagship-surface-closure/BOARDROOM_BRIEFING_CLOSURE_SPEC.md";

// In-scope (admin AI): canonical layer7 status artifacts must be present.
// Canonical boardroom Layer 7 backbone — at least one of these artifacts must
// exist to confirm the admin AI scope is intact. The aggregate closure report
// is the canonical signal; per-stage reports are accepted as additional proof.
const REQUIRED_BACKBONE = [
  "generated/boardroom-layer7-closure-report.json",
  "generated/boardroom-layer7-state-coverage-report.json",
  "generated/boardroom-outcome-tracking-report.json",
  "generated/boardroom-followthrough-linkage-report.json",
];
let backbonePresent = 0;
for (const f of REQUIRED_BACKBONE) {
  if (existsSync(f)) backbonePresent++;
}
if (backbonePresent === 0) {
  issues.push({
    severity: "error",
    area: "canonical-backbone",
    message: `No canonical boardroom backbone status artifact found — admin AI scope is broken. Expected at least one of: ${REQUIRED_BACKBONE.join(", ")}`,
  });
}

// Deferral marker
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

// Honest WARN: user briefing UI deferred
const briefingUIExists = existsSync("src/pages/boardroom/BoardroomBriefing.tsx");
if (!briefingUIExists) {
  issues.push({
    severity: "warning",
    area: "user-flagship-deferred",
    message: `User boardroom briefing UI (src/pages/boardroom/BoardroomBriefing.tsx) not present — DEFERRED to user-flagship-pass. See ${DEFERRAL_DOC}.`,
  });
  issues.push({
    severity: "warning",
    area: "learning-loop-v2-boundary",
    message: `Live-vs-future learning-loop-v2 UI boundary not enforced on user briefing — DEFERRED. Required when user surface is built.`,
  });
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({
  gate: GATE,
  ok,
  issues,
  extra: {
    classification: "honest-warn-deferred",
    deferralDoc: DEFERRAL_DOC,
    backbonePresent,
    backboneExpected: REQUIRED_BACKBONE.length,
    requiredForGreen: "user-flagship-pass: build /boardroom/briefing consuming canonical Layer 7 data",
  },
});
process.exit(ok ? 0 : 1);
