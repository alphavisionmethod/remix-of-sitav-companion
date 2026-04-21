/* eslint-disable no-console */
// SITA OS — iOS Release Readiness Gate
// Validates that the iOS / Capacitor build target has all required pieces.

import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";

interface Issue { severity: "error" | "warning"; area: string; message: string; }

const ROOT = process.cwd();
const OUT_DIR = join(ROOT, "generated");
const issues: Issue[] = [];

function error(area: string, msg: string) { issues.push({ severity: "error", area, message: msg }); }
function warn(area: string, msg: string) { issues.push({ severity: "warning", area, message: msg }); }

// ── 1. Capacitor config ──────────────────────────────────
function checkCapacitorConfig() {
  const capConfig = ["capacitor.config.ts", "capacitor.config.json"].find((f) => existsSync(join(ROOT, f)));
  if (!capConfig) {
    error("capacitor-config", "No capacitor.config.ts or capacitor.config.json found — Capacitor not initialized");
    return;
  }
  const content = readFileSync(join(ROOT, capConfig), "utf-8");
  if (!content.includes("appId")) {
    error("capacitor-config", "Capacitor config missing appId");
  }
  if (!content.includes("ios")) {
    warn("capacitor-config", "Capacitor config has no explicit iOS platform block");
  }
}

// ── 2. Package dependencies ─────────────────────────────
function checkDependencies() {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf-8"));
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
  const required = ["@capacitor/core", "@capacitor/cli", "@capacitor/ios"];
  for (const dep of required) {
    if (!allDeps[dep]) {
      error("dependencies", `Missing required dependency: ${dep}`);
    }
  }
}

// ── 3. iOS platform directory ────────────────────────────
function checkIOSPlatform() {
  if (!existsSync(join(ROOT, "ios"))) {
    warn("ios-platform", "ios/ directory not found — run 'npx cap add ios' before building");
  }
}

// ── 4. Info.plist / signing config ───────────────────────
function checkSigningConfig() {
  const plist = join(ROOT, "ios/App/App/Info.plist");
  if (existsSync(plist)) {
    const content = readFileSync(plist, "utf-8");
    if (!content.includes("CFBundleIdentifier")) {
      error("signing", "Info.plist missing CFBundleIdentifier");
    }
  } else {
    warn("signing", "ios/App/App/Info.plist not found — iOS project may not be set up");
  }
}

// ── 5. App Store metadata separation ─────────────────────
function checkConfigSeparation() {
  // Ensure no production secrets are hardcoded in Capacitor config
  const capFiles = ["capacitor.config.ts", "capacitor.config.json"].filter((f) => existsSync(join(ROOT, f)));
  for (const f of capFiles) {
    const content = readFileSync(join(ROOT, f), "utf-8");
    if (/sk_live|secret_key|password/i.test(content)) {
      error("config-separation", `Production secrets detected in ${f} — move to secure storage`);
    }
  }
}

// ── 6. Supabase backend ─────────────────────────────────
function checkBackend() {
  if (!existsSync(join(ROOT, "src/integrations/supabase/client.ts"))) {
    error("backend", "Supabase client missing — backend integration required for mobile");
  }
  const migDir = join(ROOT, "supabase/migrations");
  if (existsSync(migDir)) {
    const pending = readdirSync(migDir).filter((f) => f.endsWith(".sql"));
    if (pending.length === 0) {
      warn("migrations", "No migrations found — verify database is up to date");
    }
  }
}

// ── Run ──────────────────────────────────────────────────
checkCapacitorConfig();
checkDependencies();
checkIOSPlatform();
checkSigningConfig();
checkConfigSeparation();
checkBackend();

const errorCount = issues.filter((i) => i.severity === "error").length;
const warningCount = issues.filter((i) => i.severity === "warning").length;
const ok = errorCount === 0;

const report = {
  generatedAt: new Date().toISOString(),
  gate: "ios-release-readiness",
  target: "ios",
  ok,
  errorCount,
  warningCount,
  verdict: ok ? (warningCount > 0 ? "YELLOW" : "GREEN") : "RED",
  issues,
};

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, "ios-release-readiness-report.json"), JSON.stringify(report, null, 2));

console.log(`\n🍎 iOS Release Readiness: ${report.verdict}`);
console.log(`   Errors: ${errorCount}  Warnings: ${warningCount}`);
for (const i of issues) {
  console.log(`   ${i.severity === "error" ? "❌" : "⚠️"}  [${i.area}] ${i.message}`);
}

if (!ok) { console.error("\n🚫 iOS release gate FAILED."); process.exit(1); }
console.log("\n✅ iOS release gate PASSED.\n");