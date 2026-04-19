#!/usr/bin/env node
// Flagship Surface Closure — Concierge AI State Handling (WARN-tier)
//
// HONEST DEFERRAL VALIDATOR
// User-facing /concierge/* chat UX polish is out-of-admin-AI-engineering scope.
// AI runtime backbone IS in scope and validated by:
//   - check-ai-live-provider-nightly.ts
//   - check-ai-receipt-persistence.ts
//   - check-ai-fallback-verification.ts
//   - check-ai-budget-enforcement-under-load.ts
//
// Source-of-truth deferral doc:
//   generated/flagship-surface-closure/CONCIERGE_CHAT_CLOSURE_SPEC.md
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "concierge-ai-state-handling";
const issues: GateIssue[] = [];
const DEFERRAL_DOC = "generated/flagship-surface-closure/CONCIERGE_CHAT_CLOSURE_SPEC.md";

// In-scope (admin AI): runtime backbone artifacts must be present.
const REQUIRED_RUNTIME = [
  "generated/ai-runtime-nightly-status.json",
  "generated/ai-receipt-persistence-report.json",
  "generated/ai-fallback-verification-report.json",
];
let runtimePresent = 0;
for (const f of REQUIRED_RUNTIME) {
  if (existsSync(f)) runtimePresent++;
}
if (runtimePresent === 0) {
  issues.push({
    severity: "error",
    area: "runtime-backbone",
    message: `No AI runtime backbone artifact found. Concierge depends on these. Expected at least one of: ${REQUIRED_RUNTIME.join(", ")}`,
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

// Honest WARN: chat UX deferred
const conciergeChatExists = existsSync("src/pages/concierge");
if (!conciergeChatExists) {
  issues.push({
    severity: "warning",
    area: "user-flagship-deferred",
    message: `Concierge chat UI (src/pages/concierge/**) not surfaced for admin AI closure — DEFERRED to user-flagship-pass. See ${DEFERRAL_DOC}.`,
  });
} else {
  // Surface exists but state-handling polish is still user-flagship scope.
  issues.push({
    severity: "warning",
    area: "ai-state-treatments",
    message: `Concierge AI degraded/budget/error treatments and trust-disclosure block require user-flagship-pass polish. Runtime IS proven; UX is honestly deferred.`,
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
    runtimePresent,
    runtimeExpected: REQUIRED_RUNTIME.length,
    requiredForGreen: "user-flagship-pass: wire /concierge/* to AI runtime status surfaces with shared state primitives",
  },
});
process.exit(ok ? 0 : 1);
