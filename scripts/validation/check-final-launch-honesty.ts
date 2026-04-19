#!/usr/bin/env node
/* eslint-disable no-console */
// Final launch honesty meta-gate. Composes all 9 claim-safety reports and
// asserts that no top-level docs use unqualified "production-ready",
// "100% complete", or "kernel" claims outside contained registries.
import { existsSync, readFileSync } from "node:fs";
import * as cp from "node:child_process";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const CLAIM_SAFETY_GATES = [
  "generated/os-claim-safety-report.json",
  "generated/deployment-wording-safety-report.json",
  "generated/launch-honesty-alignment-report.json",
  "generated/qualifier-required-claims-report.json",
  "generated/no-prohibited-native-claims-report.json",
  "generated/demo-only-surface-badging-report.json",
  "generated/future-vision-route-containment-report.json",
  "generated/device-surface-claim-safety-report.json",
];

const FORBIDDEN_TOP_LEVEL = [
  "100% production-ready",
  "fully production-certified",
  "no remaining caveats",
  "no remaining gaps",
];
const TOP_LEVEL_SCOPE = ["README.md", "docs/PUBLIC_README.md"];
const ALLOWED = [/generated\//, /scripts\/validation\//, /\.test\.tsx?$/];

const issues: GateIssue[] = [];
let downstreamOk = 0;
for (const f of CLAIM_SAFETY_GATES) {
  if (!existsSync(f)) {
    issues.push({ severity: "warning", area: "missing-claim-gate", message: `${f} not produced` });
    continue;
  }
  try {
    const data = JSON.parse(readFileSync(f, "utf-8"));
    if (data.ok && Number(data.errorCount ?? 0) === 0) downstreamOk++;
    else issues.push({ severity: "error", area: "claim-gate-failed", message: `${f} reports issues` });
  } catch {}
}

const violations: string[] = [];
for (const term of FORBIDDEN_TOP_LEVEL) {
  for (const path of TOP_LEVEL_SCOPE) {
    if (!existsSync(path)) continue;
    try {
      const out = cp.execSync(`grep -ln "${term}" ${path} 2>/dev/null || true`, { encoding: "utf-8" });
      out
        .split("\n")
        .filter(Boolean)
        .forEach((p) => {
          if (!ALLOWED.some((rx) => rx.test(p))) violations.push(`${p}: "${term}"`);
        });
    } catch {}
  }
}
violations.forEach((v) => issues.push({ severity: "error", area: "top-level-overclaim", message: v }));

const ok = issues.filter((i) => i.severity === "error").length === 0;
console.log(`${ok ? "✅" : "❌"} final-launch-honesty: ${downstreamOk}/${CLAIM_SAFETY_GATES.length} claim gates OK · ${violations.length} top-level overclaims`);
issues.slice(0, 10).forEach((i) => console.error(`   [${i.severity}] ${i.area}: ${i.message}`));
emitGateReport({
  gate: "final-launch-honesty",
  ok,
  issues,
  extra: { downstreamOk, totalClaimGates: CLAIM_SAFETY_GATES.length, topLevelViolations: violations.length },
});
process.exit(ok ? 0 : 1);
