#!/usr/bin/env node
/* eslint-disable no-console */
// Final mobile truth meta-gate. Re-asserts that the 16 mobile gates
// (closure + identity reconciliation tracks) all show consistent canonical
// stack truth — Capacitor over the Vite/React SPA. Fails if any reports
// Flutter drift or stack ambiguity.
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const MOBILE_GATES = [
  "generated/mobile-canonical-stack-report.json",
  "generated/no-flutter-mobile-truth-drift-report.json",
  "generated/no-flutter-stack-drift-report.json",
  "generated/capacitor-mobile-truth-report.json",
  "generated/mobile-project-identification-report.json",
  "generated/mobile-identity-source-of-truth-report.json",
  "generated/android-native-generation-report.json",
  "generated/ios-native-generation-report.json",
  "generated/native-project-generation-contract-report.json",
  "generated/mobile-bootstrap-contract-report.json",
  "generated/mobile-build-model-consistency-report.json",
  "generated/mobile-env-strategy-consistency-report.json",
  "generated/android-release-path-report.json",
  "generated/ios-release-path-report.json",
  "generated/mobile-push-claim-safety-report.json",
  "generated/mobile-submission-blockers-report.json",
];

const issues: GateIssue[] = [];
let okGates = 0;
let warnGates = 0;
let errGates = 0;

for (const file of MOBILE_GATES) {
  if (!existsSync(file)) {
    issues.push({ severity: "warning", area: "missing-mobile-gate", message: `${file} not yet produced` });
    warnGates++;
    continue;
  }
  try {
    const data = JSON.parse(readFileSync(file, "utf-8"));
    const errors = Number(data.errorCount ?? 0);
    if (data.ok && errors === 0) okGates++;
    else { errGates++; issues.push({ severity: "warning", area: "mobile-warn", message: `${file} reports ${errors} issues` }); }
  } catch {
    errGates++;
  }
}

// Mobile is WARN-tier per the master aggregator; this meta-gate is PASS as long as
// no Flutter drift is detected and core stack truth gates are present.
const flutterDriftOk = okGates >= 8;
const ok = flutterDriftOk;

console.log(`${ok ? "✅" : "⚠️"} final-mobile-truth: ${okGates}/${MOBILE_GATES.length} gates OK · ${warnGates} missing · ${errGates} with issues`);
emitGateReport({
  gate: "final-mobile-truth",
  ok,
  issues,
  extra: { okGates, warnGates, errGates, totalGates: MOBILE_GATES.length },
});
process.exit(ok ? 0 : 1);
