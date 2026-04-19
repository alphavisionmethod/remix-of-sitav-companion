#!/usr/bin/env -S npx tsx
// ═══════════════════════════════════════════════════════════════
// SITA OS — Validator: Portability Boundaries
// Asserts every classified file in PORTABILITY_CLASSIFICATIONS exists
// and emits portability-boundary-status.json consumed by the panel.
// ═══════════════════════════════════════════════════════════════
/* eslint-disable no-console */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport } from "./_lib/emit-gate-report";
import { PORTABILITY_CLASSIFICATIONS } from "../../src/runtimes/portability-boundary-model";

const DIR = "generated/security-and-portability-closure";
mkdirSync(DIR, { recursive: true });

const issues: { severity: "error" | "warning"; area: string; message: string }[] = [];
let missing = 0;

for (const c of PORTABILITY_CLASSIFICATIONS) {
  if (!existsSync(c.path)) {
    issues.push({ severity: "error", area: c.path, message: `Classified file missing: ${c.boundary}` });
    missing++;
  }
}

const status = {
  generatedAt: new Date().toISOString(),
  classified: PORTABILITY_CLASSIFICATIONS.length,
  missing,
  violations: issues.filter((i) => i.severity === "error").length,
  byBoundary: {
    "leaf-browser-only": PORTABILITY_CLASSIFICATIONS.filter((c) => c.boundary === "leaf-browser-only").length,
    "shared-portable": PORTABILITY_CLASSIFICATIONS.filter((c) => c.boundary === "shared-portable").length,
    "shell-specific": PORTABILITY_CLASSIFICATIONS.filter((c) => c.boundary === "shell-specific").length,
    "adapter-routed": PORTABILITY_CLASSIFICATIONS.filter((c) => c.boundary === "adapter-routed").length,
  },
};
writeFileSync(join(DIR, "portability-boundary-status.json"), JSON.stringify(status, null, 2));

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: "portability-boundaries", ok, issues, extra: status });
console.log(`[portability-boundaries] ${ok ? "PASS" : "FAIL"} (${PORTABILITY_CLASSIFICATIONS.length} classified, ${missing} missing)`);
process.exit(ok ? 0 : 1);
