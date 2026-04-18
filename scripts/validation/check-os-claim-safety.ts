#!/usr/bin/env node
/* eslint-disable no-console */
// Phase 5 Gate 1: OS Claim Safety
// Fails if prohibited "custom kernel / our bootloader / native OS kernel / full OS from scratch"
// phrases appear in src/, docs/ (excluding Track-B), or root READMEs.
import { execSync } from "node:child_process";
import { emitGateReport } from "./_lib/emit-gate-report";

const PROHIBITED = [
  "custom kernel",
  "our own kernel",
  "native OS kernel",
  "full OS from scratch",
  "we built the kernel",
  "replaces Linux",
  "no host OS dependency",
  "our bootloader",
  "kernel-level isolation we wrote",
  "Windows-class substrate",
  "macOS-class substrate",
];

const SCOPE = ["src/", "docs/", "README.md"];

const ALLOWED = [
  /docs\/nova\//,
  /src\/lib\/nova-sdk\//,
  /generated\/claim-safety-hardening\//,
  /\.test\.tsx?$/,
  /scripts\/validation\//,
  /generated\/final-hardening\/NOVA_/,
];

let violations: string[] = [];

for (const term of PROHIBITED) {
  for (const path of SCOPE) {
    try {
      const out = execSync(
        `grep -rln "${term}" ${path} --include="*.ts" --include="*.tsx" --include="*.md" 2>/dev/null || true`,
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
console.log(`${ok ? "✅" : "❌"} os-claim-safety: ${violations.length} prohibited claims`);
violations.slice(0, 15).forEach((v) => console.error(`   ${v}`));
emitGateReport({
  gate: "os-claim-safety",
  ok,
  issues: violations.map((v) => ({ severity: "error", area: "os-claim", message: v })),
});
process.exit(ok ? 0 : 1);
