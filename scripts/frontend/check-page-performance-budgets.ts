#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Page Performance Budget Validator (ADVISORY)
// Verifies budgets exist for all page classes and references evidence.
// ═══════════════════════════════════════════════════════════════
import { existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "../validation/_lib/emit-gate-report";
import { PAGE_PERFORMANCE_BUDGETS, PERFORMANCE_EVIDENCE_PATH } from "../../src/lib/frontend/page-performance-budget";

const issues: GateIssue[] = [];

// 1. Verify budgets exist for all page classes
const pageClasses = Object.keys(PAGE_PERFORMANCE_BUDGETS);
if (pageClasses.length < 6) {
  issues.push({ severity: "warning", area: "budget-coverage", message: `Only ${pageClasses.length} page classes have budgets; expected 6` });
}

// 2. Verify evidence file exists
if (!existsSync(PERFORMANCE_EVIDENCE_PATH)) {
  issues.push({ severity: "warning", area: "evidence", message: `Performance evidence missing: ${PERFORMANCE_EVIDENCE_PATH}` });
}

// 3. Verify budget values are reasonable
for (const [cls, budget] of Object.entries(PAGE_PERFORMANCE_BUDGETS)) {
  if (budget.lcpMs > 5000) {
    issues.push({ severity: "warning", area: "budget-lax", message: `${cls} LCP budget (${budget.lcpMs}ms) exceeds 5000ms ceiling` });
  }
  if (budget.bundleKb > 500) {
    issues.push({ severity: "warning", area: "budget-lax", message: `${cls} bundle budget (${budget.bundleKb}KB) exceeds 500KB ceiling` });
  }
}

const file = emitGateReport({
  gate: "page-performance-budget",
  ok: true, // advisory
  issues,
  extra: {
    pageClassesCovered: pageClasses.length,
    budgets: PAGE_PERFORMANCE_BUDGETS,
    evidenceAvailable: existsSync(PERFORMANCE_EVIDENCE_PATH),
  },
});

console.log(`Performance budgets: ${pageClasses.length} page classes defined → ${file}`);