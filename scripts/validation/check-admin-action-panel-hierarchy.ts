#!/usr/bin/env node
/* eslint-disable no-console */
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "admin-action-panel-hierarchy";
const PRIMITIVE = "src/components/primitives/actions/OperatorActionPanel.tsx";
const issues: GateIssue[] = [];

if (!existsSync(PRIMITIVE)) {
  issues.push({
    severity: "error",
    area: "canonical-primitive",
    message: `Canonical primitive missing: ${PRIMITIVE}`,
  });
} else {
  const content = readFileSync(PRIMITIVE, "utf-8");
  const REQUIRED_SLOTS = ["primary", "remediation", "next", "related", "evidence"];
  for (const slot of REQUIRED_SLOTS) {
    if (!content.includes(`data-action-slot="${slot}"`)) {
      issues.push({
        severity: "error",
        area: "slot-missing",
        message: `OperatorActionPanel missing canonical slot: ${slot}`,
      });
    }
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
console.log(`${ok ? "✅" : "❌"} ${GATE}: ${issues.length} issue(s)`);
issues.slice(0, 20).forEach((i) => console.error(`   [${i.severity}] ${i.area}: ${i.message}`));
emitGateReport({
  gate: GATE,
  ok,
  issues,
  extra: {
    canonicalPrimitive: PRIMITIVE,
    canonicalSlotOrder: ["primary", "remediation", "next", "related", "evidence"],
    classification: "warn-tier-primitive-availability",
  },
});
process.exit(ok ? 0 : 1);
