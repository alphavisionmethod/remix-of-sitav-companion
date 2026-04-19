/* eslint-disable no-console */
// SITA OS — Electron Shell Session Readiness Gate
// Verifies the 7-layer security fabric + canonical shell entry points.
import { existsSync, mkdirSync, writeFileSync } from "node:fs";

interface Issue { severity: "error" | "warning"; area: string; message: string; }
const issues: Issue[] = [];

const REQUIRED_MODULES = [
  "electron/main.cjs",
  "electron/preload.cjs",
  "electron/runtime-shield.cjs",
  "electron/dlp-guard.cjs",
  "electron/network-sentinel.cjs",
  "electron/license-guard.cjs",
  "electron/integrity-check.cjs",
  "electron/auto-updater.cjs",
  "electron/crash-reporter.cjs",
  "electron/fs-bridge.cjs",
  "electron/sita-apps-bridge.cjs",
  "electron/forge.config.cjs",
];

for (const m of REQUIRED_MODULES) {
  if (!existsSync(m)) issues.push({ severity: "error", area: "shell", message: `Missing Electron module: ${m}` });
}

// Domain layout registry must exist and classify every .cjs in electron/.
const LAYOUT_PATH = "electron/_layout.cjs";
if (!existsSync(LAYOUT_PATH)) {
  issues.push({ severity: "error", area: "layout", message: `Missing electron domain registry: ${LAYOUT_PATH}` });
} else {
  try {
    const { createRequire } = await import("node:module");
    const requireCjs = createRequire(import.meta.url);
    const { resolve } = await import("node:path");
    const { readdirSync } = await import("node:fs");
    const layout = requireCjs(resolve(LAYOUT_PATH)) as Record<string, string[]>;
    const onDisk = readdirSync("electron")
      .filter((f: string) => f.endsWith(".cjs"))
      .filter((f: string) => !f.startsWith("_"));
    const classified = new Set<string>();
    for (const arr of Object.values(layout)) {
      if (Array.isArray(arr)) for (const f of arr) classified.add(f);
    }
    for (const f of onDisk) {
      if (!classified.has(f)) {
        issues.push({ severity: "error", area: "layout", message: `electron/${f} not classified in _layout.cjs` });
      }
    }
  } catch (e: any) {
    issues.push({ severity: "error", area: "layout", message: `Failed to load _layout.cjs: ${e?.message || e}` });
  }
}

const errorCount = issues.filter(i => i.severity === "error").length;
const warningCount = issues.filter(i => i.severity === "warning").length;
const ok = errorCount === 0;

mkdirSync("generated", { recursive: true });
writeFileSync("generated/native-shell-session-readiness-report.json", JSON.stringify({
  generatedAt: new Date().toISOString(),
  gate: "electron-shell-session-readiness",
  phase: "phase-12-native-deployability",
  modulesChecked: REQUIRED_MODULES.length,
  errorCount, warningCount, ok, issues,
}, null, 2));

console.log(`Electron shell: ${ok ? "✅ OK" : `❌ ${errorCount} errors`}`);
if (!ok) { for (const i of issues) console.error(`[${i.severity}] ${i.area}: ${i.message}`); process.exit(1); }
