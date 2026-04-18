#!/usr/bin/env node
/* eslint-disable no-console */
// Phase 5 Gate 7: Deployment Wording Safety
// Fails if prohibited deployability phrases ("nothing left to prove", "fully production-certified",
// "100% production-ready", "no remaining operational caveats", etc.) appear in claim-bearing docs.
import * as cp from "node:child_process";
import { emitGateReport } from "./_lib/emit-gate-report";

const PROHIBITED = [
  "nothing left to prove",
  "fully production-certified",
  "100% production-ready",
  "no remaining operational caveats",
  "no remaining gaps",
  "complete with nothing left to do",
  "production-hardened across every dimension",
  "fully deployable in all environments",
];

const SCOPE = ["generated/", "docs/", "README.md"];

const ALLOWED = [
  /generated\/claim-safety-hardening\//,
  /scripts\/validation\//,
  /\.test\.tsx?$/,
];

let violations: string[] = [];

for (const term of PROHIBITED) {
  for (const path of SCOPE) {
    try {
      const out = cp.execSync(
        `grep -rln "${term}" ${path} --include="*.md" 2>/dev/null || true`,
        { encoding: "utf-8" },
      );
      out
        .split("\n")
        .filter(Boolean)
        .forEach((f) => {
          if (!ALLOWED.some((rx) => rx.test(f))) violations.push(`${f}: "${term}"`);
        });
    } catch {}
  }
}

const ok = violations.length === 0;
console.log(`${ok ? "✅" : "❌"} deployment-wording-safety: ${violations.length} over-claims`);
violations.slice(0, 15).forEach((v) => console.error(`   ${v}`));
emitGateReport({
  gate: "deployment-wording-safety",
  ok,
  issues: violations.map((v) => ({ severity: "error", area: "deploy-wording", message: v })),
});
process.exit(ok ? 0 : 1);
