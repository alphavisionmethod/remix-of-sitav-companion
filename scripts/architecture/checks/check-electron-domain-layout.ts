/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════════════
// SITA OS — Electron Domain Layout Validator (BLOCK gate)
// ─────────────────────────────────────────────────────────────────────────
// Verifies that every .cjs module in electron/ is classified into exactly
// one domain in electron/_layout.cjs. Prevents orphan modules and silent
// drift between filesystem reality and the documented domain map.
// ═══════════════════════════════════════════════════════════════════════
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { createRequire } from "node:module";

const requireCjs = createRequire(import.meta.url);

interface Issue { severity: "error" | "warning"; area: string; message: string; }
const issues: Issue[] = [];

const ELECTRON_DIR = "electron";
const LAYOUT_PATH = join(ELECTRON_DIR, "_layout.cjs");

let layout: Record<string, string[]> | null = null;
if (!existsSync(LAYOUT_PATH)) {
  issues.push({ severity: "error", area: "registry", message: `Missing ${LAYOUT_PATH}` });
} else {
  try {
    layout = requireCjs(resolve(LAYOUT_PATH));
  } catch (e: any) {
    issues.push({ severity: "error", area: "registry", message: `Failed to load _layout.cjs: ${e?.message || e}` });
  }
}

const expectedDomains = ["main", "preload", "bridges", "security", "updater", "license", "packaging"];
const classified = new Map<string, string>(); // file -> domain
let totalRegistered = 0;

if (layout) {
  for (const domain of expectedDomains) {
    const arr = layout[domain];
    if (!Array.isArray(arr)) {
      issues.push({ severity: "error", area: "registry", message: `Domain "${domain}" missing or not an array in _layout.cjs` });
      continue;
    }
    for (const file of arr) {
      totalRegistered++;
      if (classified.has(file)) {
        issues.push({
          severity: "error",
          area: "duplicate",
          message: `File "${file}" classified in multiple domains: "${classified.get(file)}" and "${domain}"`,
        });
      } else {
        classified.set(file, domain);
      }
    }
  }
}

// Filesystem reality. Exclude the registry file itself + any underscore-prefixed
// meta-modules (e.g. _layout.cjs) — those are governance artifacts, not runtime modules.
const onDisk = existsSync(ELECTRON_DIR)
  ? readdirSync(ELECTRON_DIR)
      .filter(f => f.endsWith(".cjs"))
      .filter(f => !f.startsWith("_"))
  : [];

// Orphans: on disk but not registered
for (const f of onDisk) {
  if (!classified.has(f)) {
    issues.push({
      severity: "error",
      area: "orphan",
      message: `Module "electron/${f}" exists on disk but is not classified in _layout.cjs`,
    });
  }
}

// Phantoms: registered but not on disk
for (const [file, domain] of classified.entries()) {
  if (!onDisk.includes(file)) {
    issues.push({
      severity: "error",
      area: "phantom",
      message: `Module "electron/${file}" classified under "${domain}" but does not exist on disk`,
    });
  }
}

const errorCount = issues.filter(i => i.severity === "error").length;
const warningCount = issues.filter(i => i.severity === "warning").length;
const ok = errorCount === 0;

mkdirSync("generated", { recursive: true });
writeFileSync(
  "generated/electron-domain-layout-report.json",
  JSON.stringify({
    generatedAt: new Date().toISOString(),
    gate: "electron-domain-layout",
    phase: "phase-18-layout-and-ci-truth",
    ok,
    errorCount,
    warningCount,
    domains: expectedDomains,
    registeredCount: totalRegistered,
    onDiskCount: onDisk.length,
    onDisk,
    classification: Object.fromEntries(classified.entries()),
    issues,
  }, null, 2),
);

console.log(`Electron domain layout: ${ok ? "✅ OK" : `❌ ${errorCount} errors`} — ${totalRegistered} registered / ${onDisk.length} on disk`);
if (!ok) {
  for (const i of issues) console.error(`  [${i.severity}] ${i.area}: ${i.message}`);
  process.exit(1);
}
