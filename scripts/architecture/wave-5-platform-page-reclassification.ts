#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Wave 5: Platform-Owned Page Reclassification
// Moves root-level page families from src/pages/<family>/** to
// their canonical home under src/platform/<system>/pages/** and
// replaces the originals with thin re-export adapters.
// ═══════════════════════════════════════════════════════════════

import {
  existsSync, mkdirSync, readFileSync, readdirSync,
  renameSync, statSync, writeFileSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";

type Mapping = { from: string; to: string };

// family → canonical platform sub-path (under src/platform/<system>/...)
const MAP: Mapping[] = [
  { from: "src/pages/atlas",           to: "src/platform/atlas/pages" },
  { from: "src/pages/files",           to: "src/platform/files/pages" },
  { from: "src/pages/owner",           to: "src/platform/owner/pages" },
  { from: "src/pages/mission-control", to: "src/platform/mission-control/pages" },
  { from: "src/pages/mission",         to: "src/platform/mission-control/mission-pages" },
  { from: "src/pages/boardroom",       to: "src/platform/boardroom/pages" },
  { from: "src/pages/intelligence",    to: "src/platform/intelligence/pages" },
  { from: "src/pages/trust",           to: "src/platform/trust/pages" },
  { from: "src/pages/personal-brain",  to: "src/platform/personal-brain/pages" },
  { from: "src/pages/enterprise",      to: "src/platform/enterprise/pages" },
  { from: "src/pages/tenant",          to: "src/platform/tenant/pages" },
  { from: "src/pages/workspace",       to: "src/platform/workspace/pages" },
  { from: "src/pages/integrations",    to: "src/platform/integration/pages" },
  { from: "src/pages/marketing",       to: "src/platform/marketing/pages" },
  { from: "src/pages/settings",        to: "src/platform/settings/pages" },
  { from: "src/pages/store",           to: "src/platform/app-platform/store-pages" },
  { from: "src/pages/app-platform",    to: "src/platform/app-platform/pages" },
  { from: "src/pages/apps",            to: "src/platform/apps/pages" },
  { from: "src/pages/sita",            to: "src/platform/sita/pages" },
  { from: "src/pages/advisors",        to: "src/platform/advisors/pages" },
  { from: "src/pages/auth",            to: "src/platform/auth/pages" },
];

const moved: { src: string; dest: string }[] = [];
const adapters: string[] = [];
const skipped: string[] = [];

function walk(dir: string, base: string, fn: (rel: string, abs: string) => void) {
  for (const entry of readdirSync(dir)) {
    const abs = join(dir, entry);
    const st = statSync(abs);
    if (st.isDirectory()) walk(abs, base, fn);
    else if (/\.(ts|tsx)$/.test(entry)) fn(relative(base, abs).replace(/\\/g, "/"), abs);
  }
}

function ensureDir(p: string) { mkdirSync(p, { recursive: true }); }

function aliasFor(absToFile: string): string {
  // src/platform/atlas/pages/AtlasHub.tsx → @/platform/atlas/pages/AtlasHub
  return "@/" + absToFile.replace(/^src\//, "").replace(/\.(ts|tsx)$/, "");
}

function adapterBody(alias: string, isTsx: boolean): string {
  // Pure re-export: keeps default + any named exports.
  return [
    `// Wave 5 — legacy path re-exports the canonical platform implementation.`,
    `// Moved to ${alias}`,
    `export { default } from "${alias}";`,
    `export * from "${alias}";`,
    ``,
  ].join("\n");
}

for (const { from, to } of MAP) {
  if (!existsSync(from)) { skipped.push(`MISSING:${from}`); continue; }
  ensureDir(to);

  walk(from, from, (rel, abs) => {
    const dest = join(to, rel);
    if (existsSync(dest)) { skipped.push(`COLLISION:${dest}`); return; }
    ensureDir(dirname(dest));
    // physically move file
    renameSync(abs, dest);
    moved.push({ src: abs.replace(/\\/g, "/"), dest: dest.replace(/\\/g, "/") });

    // write adapter back at original path
    const isTsx = abs.endsWith(".tsx");
    const alias = aliasFor(dest.replace(/\\/g, "/"));
    writeFileSync(abs, adapterBody(alias, isTsx), "utf8");
    adapters.push(abs.replace(/\\/g, "/"));
  });
}

const reportDir = "generated/audits";
ensureDir(reportDir);
const reportPath = join(reportDir, "wave-5-platform-page-reclassification.json");
writeFileSync(reportPath, JSON.stringify({
  generatedAt: new Date().toISOString(),
  wave: 5,
  movedCount: moved.length,
  adapterCount: adapters.length,
  skippedCount: skipped.length,
  mapping: MAP,
  moved,
  skipped,
}, null, 2));

console.log(`Wave 5 complete: moved=${moved.length} adapters=${adapters.length} skipped=${skipped.length}`);
console.log(`Report: ${reportPath}`);