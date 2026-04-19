#!/usr/bin/env node
// Flagship Surface Closure — Communications Connector State Alignment (WARN-tier)
//
// HONEST DEFERRAL VALIDATOR
// User-facing /communications/inbox is out-of-admin-AI-engineering scope.
// Connector backbone IS in scope and validated by:
//   - check-admin-integrations-health-visibility.ts (BLOCK)
//   - check-connector-health-state-consistency.ts
//   - check-connector-refresh-streak.ts
//
// Source-of-truth deferral doc:
//   generated/flagship-surface-closure/COMMUNICATIONS_INBOX_CLOSURE_SPEC.md
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "communications-connector-state-alignment";
const issues: GateIssue[] = [];
const DEFERRAL_DOC = "generated/flagship-surface-closure/COMMUNICATIONS_INBOX_CLOSURE_SPEC.md";
// Canonical ConnectorStateBadge lives under primitives/status (shared, plane-safe
// chip used by both admin integrations + future user inbox). Accept either the
// primitives location or the legacy connectors location.
const CHIP_PRIMITIVES = "src/components/primitives/status/ConnectorStateBadge.tsx";
const CHIP_LEGACY = "src/components/connectors/ConnectorStateBadge.tsx";
const CANONICAL_CHIP = existsSync(CHIP_PRIMITIVES) ? CHIP_PRIMITIVES : CHIP_LEGACY;

// In-scope (admin AI): canonical chip must exist; integrations hub must be wired.
if (!existsSync(CANONICAL_CHIP)) {
  issues.push({
    severity: "error",
    area: "canonical-chip",
    message: `Missing canonical ConnectorStateBadge: ${CANONICAL_CHIP}`,
  });
}

if (!existsSync("src/pages/admin/integrations/IntegrationsHome.tsx") &&
    !existsSync("src/pages/admin/integrations/OAuthRefreshHealthBoard.tsx")) {
  issues.push({
    severity: "error",
    area: "admin-backbone",
    message: `Admin integrations hub missing — connector backbone is broken.`,
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

// Honest WARN: inbox UI deferred
const inboxExists = existsSync("src/pages/communications");
if (!inboxExists) {
  issues.push({
    severity: "warning",
    area: "user-flagship-deferred",
    message: `User communications inbox (src/pages/communications/**) not present — DEFERRED to user-flagship-pass. See ${DEFERRAL_DOC}.`,
  });
  issues.push({
    severity: "warning",
    area: "ambiguous-connected-states",
    message: `Inbox-level live/degraded/reauth/failing/manual chip enforcement deferred. Canonical chip ${CANONICAL_CHIP} IS available for adoption.`,
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
    canonicalChip: CANONICAL_CHIP,
    requiredForGreen: "user-flagship-pass: build /communications/inbox using ConnectorStateBadge + connector_provider_health",
  },
});
process.exit(ok ? 0 : 1);
