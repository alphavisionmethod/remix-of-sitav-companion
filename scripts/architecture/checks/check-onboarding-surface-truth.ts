#!/usr/bin/env node
/* eslint-disable no-console */
// ════════════════════════════════════════════════════════════════
// SITA OS — Onboarding Surface Truth Validator (WARN-tier)
// ----------------------------------------------------------------
// Asserts the canonical onboarding surface registry matches reality:
//   1. Every entry in ONBOARDING_SURFACES has its entrypointFile on disk
//   2. Each entrypoint contains its declared intentBannerToken
//   3. Deprecated surfaces (useOnboardingDaemon, onboarding-daemon) are
//      not imported by NEW code (allowlist of legacy importers)
//   4. The OS surface declares ≥29 screens (29-screen master spec floor)
//
// Failure mode: WARN (not BLOCK). 21/21 BLOCK gate count is preserved.
// Output:       generated/onboarding-surface-truth-report.json
// ════════════════════════════════════════════════════════════════

import { existsSync, readFileSync, mkdirSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

interface Issue {
  severity: "error" | "warning";
  area: string;
  message: string;
  evidence?: string;
}

const issues: Issue[] = [];

// ── Load the registry by reading the source file (avoid TS-runtime import) ──
const REGISTRY_PATH = "src/lib/architecture/onboarding-surface-registry.ts";
if (!existsSync(REGISTRY_PATH)) {
  issues.push({ severity: "error", area: "registry-presence", message: `Registry missing: ${REGISTRY_PATH}` });
}

const registrySource = existsSync(REGISTRY_PATH) ? readFileSync(REGISTRY_PATH, "utf-8") : "";

// Lightweight extraction of declared surfaces (id, entrypointFile, intentBannerToken, screenCount, tier).
interface DeclaredSurface {
  id: string;
  tier: string;
  entrypointFile: string;
  intentBannerToken: string;
  screenCount: number;
}

function extractSurfaces(src: string): DeclaredSurface[] {
  const out: DeclaredSurface[] = [];
  // Match each {...} block inside ONBOARDING_SURFACES = [ ... ]
  const arrMatch = src.match(/ONBOARDING_SURFACES[^=]*=\s*\[([\s\S]*?)\]\s+as\s+const/);
  if (!arrMatch) return out;
  const body = arrMatch[1];
  const blockRe = /\{([\s\S]*?)\},?(?=\s*(?:\{|$))/g;
  let m: RegExpExecArray | null;
  while ((m = blockRe.exec(body)) !== null) {
    const block = m[1];
    const id = block.match(/id:\s*"([^"]+)"/)?.[1];
    const tier = block.match(/tier:\s*"([^"]+)"/)?.[1];
    const entrypointFile = block.match(/entrypointFile:\s*"([^"]+)"/)?.[1];
    const intentBannerToken = block.match(/intentBannerToken:\s*"([^"]+)"/)?.[1];
    const screenCount = Number(block.match(/screenCount:\s*(\d+)/)?.[1] ?? "0");
    if (id && tier && entrypointFile && intentBannerToken) {
      out.push({ id, tier, entrypointFile, intentBannerToken, screenCount });
    }
  }
  return out;
}

const surfaces = extractSurfaces(registrySource);

if (surfaces.length === 0 && registrySource) {
  issues.push({ severity: "error", area: "registry-parse", message: "Could not extract surfaces from registry." });
}

// ── 1+2. Entrypoint exists AND contains intent banner ──
for (const s of surfaces) {
  if (!existsSync(s.entrypointFile)) {
    issues.push({
      severity: "error",
      area: "entrypoint-missing",
      message: `Surface "${s.id}" declares entrypointFile "${s.entrypointFile}" which does not exist.`,
      evidence: s.entrypointFile,
    });
    continue;
  }
  const content = readFileSync(s.entrypointFile, "utf-8");
  if (!content.includes(s.intentBannerToken)) {
    issues.push({
      severity: "warning",
      area: "intent-banner-missing",
      message: `Surface "${s.id}" entrypoint "${s.entrypointFile}" missing intent banner token "${s.intentBannerToken}".`,
      evidence: s.entrypointFile,
    });
  }
}

// ── 4. OS surface screen-count floor ──
const osSurface = surfaces.find((s) => s.tier === "os");
if (osSurface && osSurface.screenCount < 29) {
  issues.push({
    severity: "warning",
    area: "os-screen-count",
    message: `OS surface declares screenCount=${osSurface.screenCount}; master spec requires ≥29.`,
  });
}

// ── 3. Deprecated daemon importer allowlist ──
const DAEMON_IMPORT_ALLOWLIST = new Set<string>([
  // Compile-time bridges that are themselves declared deprecated.
  "src/hooks/useOnboardingDaemon.ts",
  "src/lib/services/onboarding-daemon/index.ts",
  // Legacy compat consumer (frozen — must not grow).
  "src/pages/FirstBootSetup.tsx",
  // Platform barrel intentionally re-exports the deprecated hook for compat.
  "src/platform/setup/index.ts",
  // Architecture maps that *describe* the deprecated paths.
  "src/platform/architecture/directory-organization-map.ts",
  "src/runtimes/portability-boundary-model.ts",
  // The validator itself + the registry file (description, not import).
  "scripts/architecture/checks/check-onboarding-surface-truth.ts",
  "src/lib/architecture/onboarding-surface-registry.ts",
]);

const DAEMON_PATTERNS = [/useOnboardingDaemon/, /onboarding-daemon/];

function walk(dir: string, files: string[] = []): string[] {
  if (!existsSync(dir)) return files;
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, files);
    else if (/\.(ts|tsx)$/.test(entry)) files.push(full);
  }
  return files;
}

const sourceFiles = walk("src");
const newImporters: string[] = [];
for (const file of sourceFiles) {
  const norm = file.replace(/\\/g, "/");
  if (DAEMON_IMPORT_ALLOWLIST.has(norm)) continue;
  const content = readFileSync(file, "utf-8");
  if (DAEMON_PATTERNS.some((p) => p.test(content))) {
    newImporters.push(norm);
  }
}

for (const imp of newImporters) {
  issues.push({
    severity: "warning",
    area: "deprecated-daemon-importer",
    message: `File imports/references the deprecated onboarding daemon: ${imp}. Use OSSetupExperience instead.`,
    evidence: imp,
  });
}

// ── Report ──
const errors = issues.filter((i) => i.severity === "error");
const warnings = issues.filter((i) => i.severity === "warning");

const report = {
  generatedAt: new Date().toISOString(),
  validator: "check-onboarding-surface-truth",
  tier: "WARN",
  registry: REGISTRY_PATH,
  declaredSurfaces: surfaces,
  allowlistedDaemonImporters: Array.from(DAEMON_IMPORT_ALLOWLIST).sort(),
  newDaemonImporters: newImporters,
  summary: {
    totalSurfaces: surfaces.length,
    errors: errors.length,
    warnings: warnings.length,
    status: errors.length === 0 ? "PASS" : "FAIL",
  },
  issues,
};

mkdirSync("generated", { recursive: true });
writeFileSync("generated/onboarding-surface-truth-report.json", JSON.stringify(report, null, 2) + "\n");

console.log(`📋 Onboarding Surface Truth: ${surfaces.length} surfaces declared`);
console.log(`   - errors:   ${errors.length}`);
console.log(`   - warnings: ${warnings.length}`);
console.log(`   - report:   generated/onboarding-surface-truth-report.json`);

for (const i of issues) {
  const icon = i.severity === "error" ? "❌" : "⚠️ ";
  console.log(`   ${icon} [${i.area}] ${i.message}`);
}

if (errors.length > 0) {
  process.exit(1);
}
process.exit(0);
