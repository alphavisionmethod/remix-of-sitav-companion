/* eslint-disable no-console */
// SITA OS — Android Release Readiness Gate
// Validates that the Android / Capacitor build target has all required pieces.

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
    error("capacitor-config", "No capacitor.config.ts or capacitor.config.json found");
    return;
  }
  const content = readFileSync(join(ROOT, capConfig), "utf-8");
  if (!content.includes("appId")) {
    error("capacitor-config", "Capacitor config missing appId");
  }
  if (!content.includes("android")) {
    warn("capacitor-config", "Capacitor config has no explicit Android platform block");
  }
}

// ── 2. Package dependencies ─────────────────────────────
function checkDependencies() {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf-8"));
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
  const required = ["@capacitor/core", "@capacitor/cli", "@capacitor/android"];
  for (const dep of required) {
    if (!allDeps[dep]) {
      error("dependencies", `Missing required dependency: ${dep}`);
    }
  }
}

// ── 3. Android platform directory ───────────────────────
function checkAndroidPlatform() {
  if (!existsSync(join(ROOT, "android"))) {
    warn("android-platform", "android/ directory not found — run 'npx cap add android' before building");
  }
}

// ── 4. Signing keystore ─────────────────────────────────
function checkKeystore() {
  const gradleProps = join(ROOT, "android/gradle.properties");
  if (existsSync(gradleProps)) {
    const content = readFileSync(gradleProps, "utf-8");
    if (!content.includes("RELEASE_STORE_FILE") && !content.includes("storeFile")) {
      warn("signing", "No release keystore configured in android/gradle.properties");
    }
  } else {
    warn("signing", "android/gradle.properties not found — signing config may be missing");
  }
  // Check for hardcoded secrets in build.gradle
  const buildGradle = join(ROOT, "android/app/build.gradle");
  if (existsSync(buildGradle)) {
    const content = readFileSync(buildGradle, "utf-8");
    if (/storePassword\s*=\s*["'](?!System)/i.test(content)) {
      error("config-separation", "Hardcoded keystore password detected in build.gradle — use env vars or gradle properties");
    }
  }
}

// ── 5. Config separation (deep secret scan) ─────────────────
import { scanForSecrets } from "../../../scripts/release/lib/secret-scanner";

function checkConfigSeparation() {
  const findings = scanForSecrets(ROOT, ["android", "src", "supabase/functions"]);
  for (const f of findings) {
    if (f.severity === "error") error(f.area, f.message);
    else warn(f.area, f.message);
  }
}

// ── 6. Supabase backend ─────────────────────────────────
function checkBackend() {
  if (!existsSync(join(ROOT, "src/integrations/supabase/client.ts"))) {
    error("backend", "Supabase client missing");
  }
  const migDir = join(ROOT, "supabase/migrations");
  if (existsSync(migDir)) {
    const pending = readdirSync(migDir).filter((f) => f.endsWith(".sql"));
    if (pending.length === 0) {
      warn("migrations", "No migrations found");
    }
  }
}

// ── Run ──────────────────────────────────────────────────
checkCapacitorConfig();
checkDependencies();
checkAndroidPlatform();
checkKeystore();
checkConfigSeparation();
checkBackend();

const errorCount = issues.filter((i) => i.severity === "error").length;
const warningCount = issues.filter((i) => i.severity === "warning").length;
const ok = errorCount === 0;

const report = {
  generatedAt: new Date().toISOString(),
  gate: "android-release-readiness",
  target: "android",
  ok,
  errorCount,
  warningCount,
  verdict: ok ? (warningCount > 0 ? "YELLOW" : "GREEN") : "RED",
  issues,
};

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, "android-release-readiness-report.json"), JSON.stringify(report, null, 2));

console.log(`\n🤖 Android Release Readiness: ${report.verdict}`);
console.log(`   Errors: ${errorCount}  Warnings: ${warningCount}`);
for (const i of issues) {
  console.log(`   ${i.severity === "error" ? "❌" : "⚠️"}  [${i.area}] ${i.message}`);
}

if (!ok) { console.error("\n🚫 Android release gate FAILED."); process.exit(1); }
console.log("\n✅ Android release gate PASSED.\n");