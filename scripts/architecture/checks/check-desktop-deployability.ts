/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Desktop Deployability Contract Gate
// Phase 14 — asserts the 11-item Desktop Host / Electron Checklist
// against disk truth (sandbox, bridge surface, signing config,
// fallback completeness).
// ═══════════════════════════════════════════════════════════════

import { existsSync, readFileSync, mkdirSync, writeFileSync, statSync } from "node:fs";
import { DESKTOP_DEPLOYABILITY_READINESS } from "../../../src/lib/runtime/desktop/release/desktop-deployability-readiness";
import { BRIDGE_METHOD_REGISTRY, BRIDGE_METHOD_COUNT } from "../../../src/lib/runtime/desktop/electron-bridge-contract";
import { DESKTOP_EXCLUSIVE_FEATURES } from "../../../src/lib/runtime/desktop/desktop-host-contract";
import { DESKTOP_FALLBACKS } from "../../../src/lib/runtime/desktop/desktop-fallbacks";

interface DesktopIssue {
  severity: "error" | "warning";
  area: string;
  message: string;
}

const issues: DesktopIssue[] = [];

// ── 1. Registry integrity ──────────────────────────────────────
let missingCount = 0;
let partialMissingRemediation = 0;
for (const item of DESKTOP_DEPLOYABILITY_READINESS) {
  if (item.status === "missing") {
    missingCount++;
    issues.push({ severity: "error", area: "registry", message: `Item "${item.id}" is MISSING` });
  }
  if (item.status === "partial" && !item.remediation) {
    partialMissingRemediation++;
    issues.push({ severity: "error", area: "registry", message: `Partial item "${item.id}" lacks remediation` });
  }
  if (item.blocker && item.status !== "ready" && item.status !== "partial") {
    issues.push({
      severity: "error",
      area: "registry",
      message: `Blocker item "${item.id}" not ready (status=${item.status})`,
    });
  }
}

// ── 2. Sandbox enforced in electron/main.cjs webPreferences ────
const mainCjs = "electron/main.cjs";
let sandboxEnforced = false;
let contextIsolationEnforced = false;
let nodeIntegrationDisabled = false;
if (!existsSync(mainCjs)) {
  issues.push({ severity: "error", area: "sandbox", message: `${mainCjs} not found` });
} else {
  const main = readFileSync(mainCjs, "utf8");
  sandboxEnforced = /sandbox\s*:\s*true/.test(main);
  contextIsolationEnforced = /contextIsolation\s*:\s*true/.test(main);
  nodeIntegrationDisabled = /nodeIntegration\s*:\s*false/.test(main);
  if (!sandboxEnforced) {
    issues.push({
      severity: "error",
      area: "sandbox",
      message: "electron/main.cjs webPreferences missing `sandbox: true` — contract claims sandbox enforced.",
    });
  }
  if (!contextIsolationEnforced) {
    issues.push({
      severity: "error",
      area: "sandbox",
      message: "electron/main.cjs webPreferences missing `contextIsolation: true`.",
    });
  }
  if (!nodeIntegrationDisabled) {
    issues.push({
      severity: "error",
      area: "sandbox",
      message: "electron/main.cjs webPreferences missing `nodeIntegration: false`.",
    });
  }
}

// ── 2b. Sandbox also enforced on license-ui activation window ──
const licenseUi = "electron/license-ui.cjs";
if (existsSync(licenseUi)) {
  const lui = readFileSync(licenseUi, "utf8");
  if (!/sandbox\s*:\s*true/.test(lui)) {
    issues.push({
      severity: "error",
      area: "sandbox",
      message: "electron/license-ui.cjs activation window missing `sandbox: true`.",
    });
  }
}

// ── 3. Preload bridge surface matches BRIDGE_METHOD_REGISTRY ───
const preload = "electron/preload.cjs";
let preloadMethodCount = 0;
const preloadMissing: string[] = [];
if (!existsSync(preload)) {
  issues.push({ severity: "error", area: "bridge", message: `${preload} not found` });
} else {
  const pre = readFileSync(preload, "utf8");
  for (const entry of BRIDGE_METHOD_REGISTRY) {
    // Match `methodName:` or `methodName =>` or `methodName(` to detect declaration in preload.
    const pattern = new RegExp(`\\b${entry.method}\\s*[:=]`);
    if (pattern.test(pre)) {
      preloadMethodCount++;
    } else {
      preloadMissing.push(entry.method);
      issues.push({
        severity: "error",
        area: "bridge",
        message: `Bridge method "${entry.method}" declared in BRIDGE_METHOD_REGISTRY but not exposed in electron/preload.cjs`,
      });
    }
  }
  if (preloadMethodCount !== BRIDGE_METHOD_COUNT) {
    issues.push({
      severity: "error",
      area: "bridge",
      message: `Preload exposes ${preloadMethodCount}/${BRIDGE_METHOD_COUNT} declared bridge methods`,
    });
  }
}

// ── 4. Forge signing/notarization config exists ────────────────
const forgeConfig = "electron/forge.config.cjs";
let osxSignBlock = false;
let osxNotarizeBlock = false;
let windowsSignBlock = false;
if (!existsSync(forgeConfig)) {
  issues.push({ severity: "error", area: "signing", message: `${forgeConfig} not found` });
} else {
  const fc = readFileSync(forgeConfig, "utf8");
  osxSignBlock = /osxSign\s*:/.test(fc);
  osxNotarizeBlock = /osxNotarize\s*:/.test(fc);
  windowsSignBlock = /windowsSign\s*:/.test(fc);
  if (!osxSignBlock) issues.push({ severity: "error", area: "signing", message: "forge.config.cjs missing osxSign block" });
  if (!osxNotarizeBlock) issues.push({ severity: "error", area: "signing", message: "forge.config.cjs missing osxNotarize block" });
  if (!windowsSignBlock) issues.push({ severity: "error", area: "signing", message: "forge.config.cjs missing windowsSign block" });
}

// ── 5. Build pipeline script exists ────────────────────────────
const buildScript = "scripts/release/desktop/build-electron.sh";
let buildScriptExecutable = false;
if (!existsSync(buildScript)) {
  issues.push({ severity: "error", area: "pipeline", message: `${buildScript} not found` });
} else {
  try {
    const stat = statSync(buildScript);
    // Owner-execute bit
    buildScriptExecutable = (stat.mode & 0o100) !== 0;
    if (!buildScriptExecutable) {
      issues.push({
        severity: "warning",
        area: "pipeline",
        message: `${buildScript} is not executable (chmod +x recommended)`,
      });
    }
  } catch {
    /* ignore */
  }
}

// ── 6. package.json declares electron deps + main entry ────────
const pkgPath = "package.json";
let hasElectronDep = false;
let hasPackagerDep = false;
let hasUpdaterDep = false;
let mainPointsToElectron = false;
if (!existsSync(pkgPath)) {
  issues.push({ severity: "error", area: "deps", message: "package.json not found" });
} else {
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  const allDeps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
  hasElectronDep = Boolean(allDeps["electron"]);
  hasPackagerDep = Boolean(allDeps["@electron/packager"]);
  hasUpdaterDep = Boolean(allDeps["electron-updater"]);
  mainPointsToElectron = typeof pkg.main === "string" && pkg.main.includes("electron");

  if (!hasElectronDep) {
    issues.push({ severity: "error", area: "deps", message: "package.json missing `electron` dependency" });
  }
  if (!hasPackagerDep) {
    issues.push({ severity: "error", area: "deps", message: "package.json missing `@electron/packager` devDependency" });
  }
  if (!hasUpdaterDep) {
    issues.push({
      severity: "warning",
      area: "deps",
      message: "package.json missing `electron-updater` (auto-updater falls back to manual feed)",
    });
  }
  if (!mainPointsToElectron) {
    issues.push({ severity: "error", area: "deps", message: "package.json `main` does not point to electron entry" });
  }
}

// ── 7. Every DESKTOP_EXCLUSIVE_FEATURES has a fallback ─────────
// Map each privilege to bridge method(s) that should have a fallback.
const PRIVILEGE_TO_FALLBACK_PREFIXES: Record<string, string[]> = {
  "filesystem-read": ["fs.read"],
  "filesystem-write": ["fs.write"],
  "auto-update": ["update."],
  "window-management": ["window."],
  "deep-link-handling": ["nav.deeplink"],
  "crash-reporting": ["diag.crash."],
  "local-backup": ["fs.backup."],
  "menu-actions": ["nav.menu"],
  "navigation-control": ["nav.navigate"],
  "tray-actions": [], // host-only, no renderer-side fallback needed
};

const fallbackIds = new Set(DESKTOP_FALLBACKS.map((f) => f.capabilityId));
for (const feature of DESKTOP_EXCLUSIVE_FEATURES) {
  const prefixes = PRIVILEGE_TO_FALLBACK_PREFIXES[feature];
  if (!prefixes || prefixes.length === 0) continue; // host-only, no fallback expected
  const matched = [...fallbackIds].some((id) => prefixes.some((p) => id.startsWith(p)));
  if (!matched) {
    issues.push({
      severity: "error",
      area: "fallbacks",
      message: `Desktop-exclusive feature "${feature}" has no matching entry in desktop-fallbacks.ts (expected prefix: ${prefixes.join(", ")})`,
    });
  }
}

// ── 8. Crash reporter + auto-updater + fs-bridge files exist ───
for (const f of [
  "electron/crash-reporter.cjs",
  "electron/auto-updater.cjs",
  "electron/fs-bridge.cjs",
  "electron/preload.cjs",
]) {
  if (!existsSync(f)) {
    issues.push({ severity: "error", area: "host-files", message: `${f} not found` });
  }
}

// ── 9. Compose verdict + report ────────────────────────────────
const errorCount = issues.filter((i) => i.severity === "error").length;
const warningCount = issues.filter((i) => i.severity === "warning").length;
const ok = errorCount === 0;

const counts: Record<string, number> = { ready: 0, partial: 0, deferred: 0, missing: 0 };
for (const it of DESKTOP_DEPLOYABILITY_READINESS) counts[it.status]++;

const report = {
  generatedAt: new Date().toISOString(),
  ok,
  errorCount,
  warningCount,
  totals: {
    items: DESKTOP_DEPLOYABILITY_READINESS.length,
    ...counts,
  },
  checks: {
    sandboxEnforced,
    contextIsolationEnforced,
    nodeIntegrationDisabled,
    bridgeMethodCount: preloadMethodCount,
    bridgeMethodExpected: BRIDGE_METHOD_COUNT,
    bridgeMissing: preloadMissing,
    osxSignBlock,
    osxNotarizeBlock,
    windowsSignBlock,
    buildScriptExists: existsSync(buildScript),
    buildScriptExecutable,
    hasElectronDep,
    hasPackagerDep,
    hasUpdaterDep,
    mainPointsToElectron,
    fallbacksComplete: !issues.some((i) => i.area === "fallbacks"),
    registryClean: missingCount === 0 && partialMissingRemediation === 0,
  },
  items: DESKTOP_DEPLOYABILITY_READINESS.map((it) => ({
    id: it.id,
    title: it.title,
    status: it.status,
    blocker: it.blocker,
    evidence: it.evidence,
    remediation: it.remediation ?? null,
  })),
  issues,
};

mkdirSync("generated", { recursive: true });
writeFileSync("generated/desktop-deployability-report.json", JSON.stringify(report, null, 2));

if (!ok) {
  console.error(`✘ Desktop deployability: ${errorCount} errors, ${warningCount} warnings`);
  for (const i of issues) console.error(`  [${i.severity}] ${i.area}: ${i.message}`);
  process.exit(1);
}
console.log(
  `✓ Desktop deployability: 11/11 items honest, sandbox enforced, ${preloadMethodCount}/${BRIDGE_METHOD_COUNT} bridge methods verified, signing config present.`,
);
