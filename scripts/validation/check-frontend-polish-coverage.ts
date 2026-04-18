#!/usr/bin/env node
/* eslint-disable no-console */
// Asserts every flagship surface has every polish dimension classified
// (true | false | "n/a"). Any "unknown" or missing field fails the gate.
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const STATUS = "generated/final-proof-verification/frontend-completeness-status.json";
const issues: GateIssue[] = [];

if (!existsSync(STATUS)) {
  issues.push({ severity: "error", area: "status", message: `${STATUS} missing` });
} else {
  const s = JSON.parse(readFileSync(STATUS, "utf-8"));
  const dims: string[] = s.dimensions ?? [];
  const surfaces: any[] = s.flagshipSurfaces ?? [];
  if (!dims.length) issues.push({ severity: "error", area: "schema", message: "no dimensions declared" });
  if (!surfaces.length) issues.push({ severity: "error", area: "schema", message: "no surfaces declared" });
  for (const surface of surfaces) {
    for (const d of dims) {
      const v = surface[d];
      if (v === undefined || v === null || v === "unknown") {
        issues.push({
          severity: "error",
          area: "classification",
          message: `${surface.surface} dimension ${d} is unclassified`,
        });
      }
    }
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
const total = (() => {
  if (!existsSync(STATUS)) return 0;
  return (JSON.parse(readFileSync(STATUS, "utf-8")).flagshipSurfaces ?? []).length;
})();
console.log(`${ok ? "✅" : "❌"} frontend-polish-coverage: ${total} flagship surfaces classified`);
issues.slice(0, 20).forEach((i) => console.error(`   [${i.severity}] ${i.area}: ${i.message}`));
emitGateReport({
  gate: "frontend-polish-coverage",
  ok,
  issues,
  extra: { surfaces: total },
});
process.exit(ok ? 0 : 1);
