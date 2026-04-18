#!/usr/bin/env node
/* eslint-disable no-console */
// Phase 5 Gate 3: No Prohibited Native Claims
// Strict scan of public/marketing surfaces (READMEs, product pages, admin truth boards)
// for over-claiming native-substrate-ownership phrases.
import * as cp from "node:child_process";
import { emitGateReport } from "./_lib/emit-gate-report";

const PROHIBITED = [
  "custom kernel",
  "we built the kernel",
  "native OS kernel",
  "full OS from scratch",
  "our bootloader",
  "replaces Linux",
];

const SCOPE = ["README.md", "src/pages/", "generated/FULL_MASTER_AUDIT.md", "generated/SITA_MASTER_AUDIT.md"];

const ALLOWED = [/scripts\/validation\//, /\.test\.tsx?$/, /generated\/claim-safety-hardening\//];

let violations: string[] = [];

for (const term of PROHIBITED) {
  for (const path of SCOPE) {
    try {
      const out = cp.execSync(
        `grep -rln "${term}" ${path} 2>/dev/null || true`,
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
console.log(`${ok ? "✅" : "❌"} no-prohibited-native-claims: ${violations.length} violations`);
violations.slice(0, 15).forEach((v) => console.error(`   ${v}`));
emitGateReport({
  gate: "no-prohibited-native-claims",
  ok,
  issues: violations.map((v) => ({ severity: "error", area: "native-claim", message: v })),
});
process.exit(ok ? 0 : 1);
