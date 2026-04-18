#!/usr/bin/env node
/* eslint-disable no-console */
// Phase 5 Gate 2: Track-B Language Boundaries
// Ensures Track-B-only phrases (Nova Runtime SDK simulated kernel, future-native substrate, simulated boot)
// stay inside docs/nova/, src/lib/nova-sdk/, or files explicitly marked <!-- track-b -->.
import * as cp from "node:child_process";
import * as fs from "node:fs";

const TRACK_B_PHRASES = [
  "Nova Runtime SDK simulated kernel",
  "future-native substrate",
  "simulated boot sequence",
  "simulated HAL",
  "future host-kernel research",
];

const ALLOWED = [
  /^docs\/nova\//,
  /^src\/lib\/nova-sdk\//,
  /^generated\/claim-safety-hardening\//,
  /^generated\/final-hardening\/NOVA_/,
  /^scripts\/validation\//,
  /\.test\.tsx?$/,
];

let violations: string[] = [];

for (const term of TRACK_B_PHRASES) {
  try {
    const out = cp.execSync(
      `grep -rln "${term}" src/ docs/ generated/ --include="*.ts" --include="*.tsx" --include="*.md" 2>/dev/null || true`,
      { encoding: "utf-8" },
    );
    out
      .split("\n")
      .filter(Boolean)
      .forEach((f) => {
        if (ALLOWED.some((rx) => rx.test(f))) return;
        try {
          const content = fs.readFileSync(f, "utf-8");
          if (content.includes("<!-- track-b -->")) return;
          violations.push(`${f}: "${term}"`);
        } catch {}
      });
  } catch {}
}

const ok = violations.length === 0;
console.log(`${ok ? "✅" : "❌"} track-b-language-boundaries: ${violations.length} leaks`);
violations.slice(0, 15).forEach((v) => console.error(`   ${v}`));
process.exit(ok ? 0 : 1);
