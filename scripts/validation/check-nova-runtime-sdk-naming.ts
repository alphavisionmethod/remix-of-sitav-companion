#!/usr/bin/env node
/* eslint-disable no-console */
// Validates "Nova Kernel" no longer appears in user-visible / claim-bearing surfaces.
// Internal code paths (src/platform/nova-sdk/kernel/*) are exempt — they are renamed
// at the *boundary* via the Nova Runtime SDK alias re-exports.
import { execSync } from "node:child_process";

const ALLOWED_PATHS = [
  /^src\/platform\/nova-sdk\/kernel\//,           // internal directory name (compat alias)
  /^src\/runtimes\/feature-runtime-tier-registry\.ts$/, // historical runtime tier label
  /^docs\/REAL_VS_SIMULATED\.md$/,                // honesty doc
  /^generated\/final-hardening\//,                // rename audit lives here
  /^generated\/DEPLOYMENT_AUDIT\.md$/,            // audit narrative
  /^scripts\/validation\/check-nova-runtime-sdk-naming\.ts$/, // this file
  /^scripts\/validation\/check-no-user-visible-nova-kernel-claims\.ts$/, // sibling validator
  /^src\/platform\/nova-runtime-sdk\/index\.ts$/, // honesty notes in SDK boundary
  /\.test\.tsx?$/,                                // tests reference internal symbol
];

let violations: string[] = [];
try {
  const out = execSync(`grep -rln "Nova Kernel" --include="*.ts" --include="*.tsx" --include="*.md" 2>/dev/null || true`, { encoding: "utf-8" });
  const files = out.split("\n").map(l => l.trim()).filter(Boolean);
  violations = files.filter(f => !ALLOWED_PATHS.some(rx => rx.test(f)));
} catch {}

const ok = violations.length === 0;
console.log(`${ok ? "✅" : "❌"} nova-runtime-sdk-naming: ${violations.length} claim-risk references`);
if (!ok) violations.slice(0, 20).forEach(v => console.error(`   ${v}`));
process.exit(ok ? 0 : 1);
