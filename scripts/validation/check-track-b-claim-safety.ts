#!/usr/bin/env node
/* eslint-disable no-console */
// Track B (native substrate) must not claim host-kernel ownership in user-facing copy.
import { execSync } from "node:child_process";
const FORBIDDEN = ["our kernel", "owns the kernel", "kernel-level isolation", "replaces the host kernel"];
const ALLOWED = [/scripts\/validation\//, /\.test\.tsx?$/, /docs\/REAL_VS_SIMULATED\.md/];
let violations: string[] = [];
for (const term of FORBIDDEN) {
  try {
    const out = execSync(`grep -rln "${term}" src/ docs/ --include="*.ts" --include="*.tsx" --include="*.md" 2>/dev/null || true`, { encoding: "utf-8" });
    out.split("\n").filter(Boolean).forEach(f => { if (!ALLOWED.some(rx => rx.test(f))) violations.push(`${f}: "${term}"`); });
  } catch {}
}
const ok = violations.length === 0;
console.log(`${ok ? "✅" : "❌"} track-b-claim-safety: ${violations.length} risky claims`);
violations.slice(0, 10).forEach(v => console.error(`   ${v}`));
process.exit(ok ? 0 : 1);
