#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Accessibility Baseline Validator (ADVISORY)
// References generated accessibility-summary.json.
// ═══════════════════════════════════════════════════════════════
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "../validation/_lib/emit-gate-report";
import { ACCESSIBILITY_BASELINES, ACCESSIBILITY_EVIDENCE_PATH } from "../../src/lib/frontend/accessibility-baseline";

const issues: GateIssue[] = [];

// 1. Check evidence file exists
if (!existsSync(ACCESSIBILITY_EVIDENCE_PATH)) {
  issues.push({ severity: "warning", area: "evidence", message: `Accessibility evidence missing: ${ACCESSIBILITY_EVIDENCE_PATH}` });
}

// 2. Verify baselines are defined for all page classes
const pageClasses = Object.keys(ACCESSIBILITY_BASELINES);
if (pageClasses.length < 6) {
  issues.push({ severity: "warning", area: "baseline-coverage", message: `Only ${pageClasses.length} page classes have accessibility baselines; expected 6` });
}

// 3. Parse evidence if available
let evidenceRoutes = 0;
let compliantRoutes = 0;
if (existsSync(ACCESSIBILITY_EVIDENCE_PATH)) {
  try {
    const data = JSON.parse(readFileSync(ACCESSIBILITY_EVIDENCE_PATH, "utf-8"));
    evidenceRoutes = data.totalRoutes ?? data.routes?.length ?? 0;
    compliantRoutes = data.compliantRoutes ?? evidenceRoutes;
  } catch {
    issues.push({ severity: "warning", area: "evidence-parse", message: "Failed to parse accessibility evidence" });
  }
}

const compliancePct = evidenceRoutes > 0 ? ((compliantRoutes / evidenceRoutes) * 100).toFixed(1) : "N/A";

const file = emitGateReport({
  gate: "accessibility-baseline",
  ok: true, // advisory
  issues,
  extra: {
    pageClassesCovered: pageClasses.length,
    evidenceRoutes,
    compliantRoutes,
    compliancePct: evidenceRoutes > 0 ? parseFloat(compliancePct as string) : null,
  },
});

console.log(`Accessibility baseline: ${pageClasses.length} page classes, ${compliancePct}% evidence compliance → ${file}`);