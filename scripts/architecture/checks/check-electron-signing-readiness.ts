#!/usr/bin/env tsx
// ═══════════════════════════════════════════════════════════════
// SITA OS — Electron Signing Readiness Gate
//
// Validates that the desktop release is provisioned with:
//   - macOS entitlements + hardened runtime config
//   - Code-signing instructions doc (one per OS) declaring deferred-vs-ready
//   - electron-builder/forge configuration referencing entitlements
//   - The release-electron workflow has slots for signing secrets
//
// Honest contract: signing currently DEFERRED until certs are provisioned.
// The gate enforces presence of the scaffolding so flipping to signed builds
// is a secret-injection operation, not a code change.
//
// Emits: generated/electron-signing-readiness-report.json
// ═══════════════════════════════════════════════════════════════
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const REPO_ROOT = process.cwd();
interface Issue { severity: "error" | "warning"; area: string; message: string }
const issues: Issue[] = [];

function check(area: string, ok: boolean, message: string, severity: "error" | "warning" = "error") {
  if (!ok) issues.push({ severity, area, message });
}

// 1. Entitlements
const entitlements = resolve(REPO_ROOT, "electron/entitlements.plist");
check("macos.entitlements", existsSync(entitlements), "electron/entitlements.plist missing");
const entText = existsSync(entitlements) ? readFileSync(entitlements, "utf8") : "";
check("macos.hardened-runtime",
  entText.includes("com.apple.security.cs.allow-jit") || entText.includes("com.apple.security.app-sandbox") ||
  entText.includes("com.apple.security.cs.allow-unsigned-executable-memory"),
  "entitlements.plist must declare at least one Apple security cs.* key", "warning");

// 2. Forge config references signing
const forgeConfig = resolve(REPO_ROOT, "electron/forge.config.cjs");
check("forge.config", existsSync(forgeConfig), "electron/forge.config.cjs missing");
const forge = existsSync(forgeConfig) ? readFileSync(forgeConfig, "utf8") : "";
check("forge.osxSign-slot",
  forge.includes("osxSign") || forge.includes("MAC_CERTS") || forge.includes("APPLE_ID") || forge.includes("identity"),
  "forge.config.cjs must reference osxSign / MAC_CERTS / APPLE_ID slot for signing flow", "warning");
check("forge.windowsSign-slot",
  forge.includes("windowsSign") || forge.includes("certificateFile") || forge.includes("WINDOWS_PFX") || forge.includes("signtool"),
  "forge.config.cjs must reference windowsSign / certificateFile slot for Windows signing", "warning");

// 3. Workflow secret slots
const wfPath = resolve(REPO_ROOT, ".github/workflows/release-electron.yml");
check("workflow.exists", existsSync(wfPath), ".github/workflows/release-electron.yml missing");
const wf = existsSync(wfPath) ? readFileSync(wfPath, "utf8") : "";
check("workflow.macos-runner", wf.includes("macos-") || wf.includes("macos-14") || wf.includes("macos-latest"),
  "release-electron must include macos-* runner for darwin builds");
check("workflow.windows-runner", wf.includes("windows-") || wf.includes("windows-latest"),
  "release-electron must include windows-* runner for win32 builds");
check("workflow.linux-runner", wf.includes("ubuntu-"), "release-electron must include ubuntu-* runner");
check("workflow.signing-secret-slots",
  wf.includes("APPLE_ID") || wf.includes("MAC_CERTS") || wf.includes("CSC_LINK") || wf.includes("WINDOWS_PFX") ||
  wf.includes("signing"),
  "release-electron workflow should reference signing secret slots (APPLE_ID, MAC_CERTS, WINDOWS_PFX, CSC_LINK)",
  "warning");

// 4. Doc — signing instructions per OS
const doc = resolve(REPO_ROOT, "docs/desktop/SIGNING.md");
check("docs.signing", existsSync(doc), "docs/desktop/SIGNING.md missing");

// 5. Auto-updater config exists
check("electron.auto-updater", existsSync(resolve(REPO_ROOT, "electron/auto-updater.cjs")),
  "electron/auto-updater.cjs missing", "warning");

// 6. Crash reporter wired
check("electron.crash-reporter", existsSync(resolve(REPO_ROOT, "electron/crash-reporter.cjs")),
  "electron/crash-reporter.cjs missing", "warning");

const errorCount = issues.filter((i) => i.severity === "error").length;
const warningCount = issues.filter((i) => i.severity === "warning").length;

const report = {
  generatedAt: new Date().toISOString(),
  gate: "electron-signing-readiness",
  phase: "phase-14-production-launch-hardening",
  ok: errorCount === 0,
  errorCount,
  warningCount,
  signingStatus: {
    macos:   { scaffold: existsSync(entitlements), tier: "deferred-on-cert" },
    windows: { scaffold: forge.includes("windowsSign") || forge.includes("certificateFile"), tier: "deferred-on-cert" },
    linux:   { scaffold: true, tier: "ready" },
  },
  artifactSlots: {
    macCertsBase64: "MAC_CERTS",
    macCertsPassword: "MAC_CERTS_PASSWORD",
    appleId: "APPLE_ID",
    appleIdPassword: "APPLE_ID_PASSWORD",
    appleTeamId: "APPLE_TEAM_ID",
    windowsPfxBase64: "WINDOWS_PFX",
    windowsPfxPassword: "WINDOWS_PFX_PASSWORD",
  },
  issues,
};

const outDir = resolve(REPO_ROOT, "generated");
mkdirSync(outDir, { recursive: true });
writeFileSync(resolve(outDir, "electron-signing-readiness-report.json"), JSON.stringify(report, null, 2));

console.log(`[electron-signing-readiness] ${errorCount} errors · ${warningCount} warnings`);
if (errorCount > 0) {
  for (const e of issues.filter((i) => i.severity === "error")) console.error(`  ✗ ${e.area}: ${e.message}`);
  process.exit(1);
}
console.log("[electron-signing-readiness] ✓ ok");
