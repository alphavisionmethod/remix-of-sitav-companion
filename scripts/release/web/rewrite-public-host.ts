/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Public-Host Rewriter (Phase 13)
// Replaces the placeholder domain "https://app.sita.os/" in
// public/sitemap.xml, public/robots.txt, and index.html canonical
// with the real production host from $WEB_PUBLIC_HOST.
//
// Usage:
//   WEB_PUBLIC_HOST=https://your-domain.com npx tsx scripts/release/web/rewrite-public-host.ts
// ═══════════════════════════════════════════════════════════════

import { existsSync, readFileSync, writeFileSync } from "node:fs";

const PLACEHOLDER = "https://app.sita.os";
const target = process.env.WEB_PUBLIC_HOST?.replace(/\/$/, "");

if (!target) {
  console.error("✘ WEB_PUBLIC_HOST is not set. Aborting (sitemap/robots will keep placeholder).");
  process.exit(1);
}

const TARGETS = [
  "public/sitemap.xml",
  "public/robots.txt",
  "index.html",
  "public/manifest.webmanifest",
];

let totalReplacements = 0;
for (const path of TARGETS) {
  if (!existsSync(path)) {
    console.warn(`  · skip (missing): ${path}`);
    continue;
  }
  const before = readFileSync(path, "utf8");
  const after = before.split(PLACEHOLDER).join(target);
  if (before !== after) {
    writeFileSync(path, after);
    const count = before.split(PLACEHOLDER).length - 1;
    totalReplacements += count;
    console.log(`  ✓ ${path}: ${count} replacement(s)`);
  } else {
    console.log(`  · ${path}: no placeholders found`);
  }
}

console.log(`\nDone — ${totalReplacements} total replacement(s) → ${target}`);
