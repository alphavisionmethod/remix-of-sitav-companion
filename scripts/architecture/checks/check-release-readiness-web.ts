/* eslint-disable no-console */
// SITA OS — Web Release Readiness Gate
// Validates that the web build target has all required pieces before deploy.

import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";

interface Issue {
  severity: "error" | "warning";
  area: string;
  message: string;
}

const ROOT = process.cwd();
const OUT_DIR = join(ROOT, "generated");
const issues: Issue[] = [];

function error(area: string, message: string) {
  issues.push({ severity: "error", area, message });
}
function warn(area: string, message: string) {
  issues.push({ severity: "warning", area, message });
}

// ── 1. Vite / Build config ────────────────────────────────
function checkBuildConfig() {
  const viteConfig = join(ROOT, "vite.config.ts");
  if (!existsSync(viteConfig)) {
    error("build-config", "vite.config.ts is missing");
    return;
  }
  const content = readFileSync(viteConfig, "utf-8");
  if (!content.includes("build")) {
    warn("build-config", "vite.config.ts has no explicit build configuration block");
  }
}

// ── 2. Environment / Secrets ──────────────────────────────
function checkEnvSecrets() {
  const envFile = join(ROOT, ".env");
  if (!existsSync(envFile)) {
    error("env-secrets", ".env file is missing — VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY required");
    return;
  }
  const content = readFileSync(envFile, "utf-8");
  const required = ["VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY"];
  for (const key of required) {
    if (!content.includes(key)) {
      error("env-secrets", `Required env var ${key} not found in .env`);
    }
  }
}

// ── 3. Supabase client wiring ─────────────────────────────
function checkSupabaseClient() {
  const clientFile = join(ROOT, "src/integrations/supabase/client.ts");
  if (!existsSync(clientFile)) {
    error("supabase-client", "src/integrations/supabase/client.ts is missing");
  }
  const typesFile = join(ROOT, "src/integrations/supabase/types.ts");
  if (!existsSync(typesFile)) {
    error("supabase-types", "src/integrations/supabase/types.ts is missing");
  }
}

// ── 4. Migrations present ─────────────────────────────────
function checkMigrations() {
  const migDir = join(ROOT, "supabase/migrations");
  if (!existsSync(migDir)) {
    warn("migrations", "supabase/migrations directory not found");
    return;
  }
  const files = readdirSync(migDir).filter((f) => f.endsWith(".sql"));
  if (files.length === 0) {
    warn("migrations", "No SQL migration files found in supabase/migrations/");
  }
}

// ── 5. index.html entry point ─────────────────────────────
function checkEntryPoint() {
  if (!existsSync(join(ROOT, "index.html"))) {
    error("entry-point", "index.html is missing from project root");
  }
}

// ── 6. Critical assets ───────────────────────────────────
function checkCriticalAssets() {
  const advisorDir = join(ROOT, "src/assets/advisors");
  if (!existsSync(advisorDir)) {
    warn("assets", "src/assets/advisors/ directory not found — advisor portraits may be missing");
    return;
  }
  const pngs = readdirSync(advisorDir).filter((f) => f.endsWith(".png"));
  if (pngs.length < 10) {
    warn("assets", `Only ${pngs.length}/10 advisor portraits found — expected 10`);
  }
}

// ── 7. SPA routing / config.toml ─────────────────────────
// ── 8. Config separation (deep secret scan) ─────────────────
import { scanForSecrets } from "../../../scripts/release/lib/secret-scanner";

function checkConfigSeparation() {
  const findings = scanForSecrets(ROOT, ["src", "supabase/functions", "scripts"]);
  for (const f of findings) {
    if (f.severity === "error") error(f.area, f.message);
    else warn(f.area, f.message);
  }
}

function checkConfigToml() {
  const configToml = join(ROOT, "supabase/config.toml");
  if (!existsSync(configToml)) {
    warn("config-toml", "supabase/config.toml is missing");
  }
}

// ── Run all checks ───────────────────────────────────────
checkBuildConfig();
checkEnvSecrets();
checkSupabaseClient();
checkMigrations();
checkEntryPoint();
checkCriticalAssets();
checkConfigSeparation();
checkConfigToml();

const errorCount = issues.filter((i) => i.severity === "error").length;
const warningCount = issues.filter((i) => i.severity === "warning").length;
const ok = errorCount === 0;

const report = {
  generatedAt: new Date().toISOString(),
  gate: "web-release-readiness",
  target: "web",
  ok,
  errorCount,
  warningCount,
  verdict: ok ? (warningCount > 0 ? "YELLOW" : "GREEN") : "RED",
  issues,
};

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, "web-release-readiness-report.json"), JSON.stringify(report, null, 2));

console.log(`\n🌐 Web Release Readiness: ${report.verdict}`);
console.log(`   Errors: ${errorCount}  Warnings: ${warningCount}`);
if (issues.length > 0) {
  for (const i of issues) {
    console.log(`   ${i.severity === "error" ? "❌" : "⚠️"}  [${i.area}] ${i.message}`);
  }
}

if (!ok) {
  console.error("\n🚫 Web release gate FAILED — fix errors above before deploying.");
  process.exit(1);
}
console.log("\n✅ Web release gate PASSED.\n");