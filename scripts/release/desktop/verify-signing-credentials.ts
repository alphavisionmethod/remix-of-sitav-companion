#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Desktop Code-Signing Credential Verifier
// Phase 14.2 — verifies Apple + Windows signing env vars are
// present and well-formed. Emits generated/desktop-signing-status.json.
// Exit 0 always (informational); CI gate consumes JSON to decide
// whether to flip readiness item from `partial` → `ready`.
// ═══════════════════════════════════════════════════════════════

import { existsSync, mkdirSync, writeFileSync, statSync } from "node:fs";

interface CredCheck {
  readonly name: string;
  readonly present: boolean;
  readonly hint: string;
}

function envPresent(name: string): boolean {
  const v = process.env[name];
  return typeof v === "string" && v.trim().length > 0;
}

function fileEnvOk(name: string): boolean {
  const v = process.env[name];
  if (!v) return false;
  try {
    return statSync(v).isFile();
  } catch {
    return false;
  }
}

const apple: CredCheck[] = [
  { name: "APPLE_IDENTITY",  present: envPresent("APPLE_IDENTITY"),  hint: "Developer ID Application: Your Co (TEAMID)" },
  { name: "APPLE_ID",        present: envPresent("APPLE_ID"),        hint: "Apple ID email used for notarization" },
  { name: "APPLE_PASSWORD",  present: envPresent("APPLE_PASSWORD"),  hint: "App-specific password from appleid.apple.com" },
  { name: "APPLE_TEAM_ID",   present: envPresent("APPLE_TEAM_ID"),   hint: "10-char Team ID from developer.apple.com/account" },
];

const windows: CredCheck[] = [
  { name: "CSC_LINK",         present: fileEnvOk("CSC_LINK"),         hint: "Absolute path to .pfx code-signing certificate" },
  { name: "CSC_KEY_PASSWORD", present: envPresent("CSC_KEY_PASSWORD"), hint: "Password for the .pfx certificate" },
];

const appleReady = apple.every((c) => c.present);
const windowsReady = windows.every((c) => c.present);
const anyReady = appleReady || windowsReady;
const fullyReady = appleReady && windowsReady;

const entitlementsExists = existsSync("electron/entitlements.plist");
const forgeConfigExists  = existsSync("electron/forge.config.cjs");

const report = {
  generatedAt: new Date().toISOString(),
  scope: "desktop-signing",
  apple: { ready: appleReady, checks: apple },
  windows: { ready: windowsReady, checks: windows },
  scaffolding: {
    entitlementsPlistExists: entitlementsExists,
    forgeConfigExists,
  },
  summary: {
    anyPlatformReady: anyReady,
    bothPlatformsReady: fullyReady,
    overallStatus: fullyReady ? "ready" : (anyReady ? "partial" : "deferred"),
  },
};

mkdirSync("generated", { recursive: true });
writeFileSync("generated/desktop-signing-status.json", JSON.stringify(report, null, 2));

console.log(`🔐 desktop-signing: apple=${appleReady} windows=${windowsReady} → ${report.summary.overallStatus}`);
for (const c of [...apple, ...windows]) {
  console.log(`  ${c.present ? "✅" : "⏳"} ${c.name}${c.present ? "" : `  (${c.hint})`}`);
}
console.log(`  📄 entitlements.plist: ${entitlementsExists ? "✅" : "❌"}`);
console.log(`  📄 forge.config.cjs:   ${forgeConfigExists  ? "✅" : "❌"}`);
process.exit(0);
