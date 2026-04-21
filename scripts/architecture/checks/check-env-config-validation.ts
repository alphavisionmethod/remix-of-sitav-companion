// ═══════════════════════════════════════════════════════════════
// SITA OS — Env-Config Validation Gate
// Validates required environment variables' formats (URLs, UUIDs,
// feature flags) for each platform before allowing release.
// ═══════════════════════════════════════════════════════════════

export type Platform = "web" | "pwa" | "desktop" | "appliance" | "edge-functions";

export type VarFormat = "url" | "uuid" | "boolean" | "integer" | "string" | "json" | "base64" | "hex-key";

export interface EnvVarSpec {
  name: string;
  format: VarFormat;
  required: boolean;
  platforms: Platform[];
  description: string;
  example?: string;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const URL_RE = /^https?:\/\/.+/;
const BASE64_RE = /^[A-Za-z0-9+/=]+$/;
const HEX_RE = /^[0-9a-fA-F]+$/;

export const ENV_SPEC: EnvVarSpec[] = [
  // ── Core Supabase (all platforms) ──
  { name: "VITE_SUPABASE_URL", format: "url", required: true, platforms: ["web", "pwa", "desktop"], description: "Supabase project URL", example: "https://xxx.supabase.co" },
  { name: "VITE_SUPABASE_PUBLISHABLE_KEY", format: "string", required: true, platforms: ["web", "pwa", "desktop"], description: "Supabase anon/publishable key" },
  { name: "VITE_SUPABASE_PROJECT_ID", format: "string", required: true, platforms: ["web", "pwa", "desktop"], description: "Supabase project ref ID" },
  { name: "SUPABASE_URL", format: "url", required: true, platforms: ["edge-functions"], description: "Supabase project URL (server-side)", example: "https://xxx.supabase.co" },
  { name: "SUPABASE_ANON_KEY", format: "string", required: true, platforms: ["edge-functions"], description: "Supabase anon key (server-side)" },
  { name: "SUPABASE_SERVICE_ROLE_KEY", format: "string", required: true, platforms: ["edge-functions"], description: "Supabase service role key" },

  // ── Security secrets ──
  { name: "WEBHOOK_SIGNING_SECRET", format: "string", required: true, platforms: ["edge-functions"], description: "HMAC-SHA256 signing secret for webhook verification" },
  { name: "ATTESTATION_SIGNING_KEY", format: "base64", required: false, platforms: ["edge-functions"], description: "Base64-encoded signing key for compliance attestations" },
  { name: "AUDIT_EXPORT_HMAC_KEY", format: "hex-key", required: false, platforms: ["edge-functions"], description: "Hex-encoded HMAC key for audit log integrity" },
  { name: "DR_FAILOVER_TARGET_URL", format: "url", required: false, platforms: ["edge-functions"], description: "Cross-region DR failover target URL" },

  // ── Feature flags ──
  { name: "VITE_FEATURE_BOARDROOM", format: "boolean", required: false, platforms: ["web", "pwa", "desktop"], description: "Enable Boardroom feature", example: "true" },
  { name: "VITE_FEATURE_SIMULATION", format: "boolean", required: false, platforms: ["web", "pwa", "desktop"], description: "Enable Simulation Engine", example: "true" },
  { name: "VITE_FEATURE_COMMAND_PALETTE", format: "boolean", required: false, platforms: ["web", "pwa", "desktop"], description: "Enable Command Palette", example: "true" },

  // ── Desktop-specific ──
  { name: "ELECTRON_APP_ID", format: "string", required: true, platforms: ["desktop"], description: "Electron application bundle ID" },
  { name: "ELECTRON_UPDATE_URL", format: "url", required: false, platforms: ["desktop"], description: "Auto-update server URL" },

  // ── Appliance-specific ──
  { name: "APPLIANCE_LICENSE_SERVER", format: "url", required: true, platforms: ["appliance"], description: "License validation server URL" },
];

export interface ValidationResult {
  name: string;
  status: "pass" | "fail" | "warn" | "skip";
  message: string;
  format: VarFormat;
  platform: Platform;
}

function validateFormat(value: string, format: VarFormat): { ok: boolean; message: string } {
  switch (format) {
    case "url":
      return URL_RE.test(value)
        ? { ok: true, message: "Valid URL" }
        : { ok: false, message: `Expected URL (https://...), got: "${value.slice(0, 40)}"` };
    case "uuid":
      return UUID_RE.test(value)
        ? { ok: true, message: "Valid UUID" }
        : { ok: false, message: `Expected UUID format, got: "${value.slice(0, 40)}"` };
    case "boolean":
      return ["true", "false", "1", "0", "yes", "no"].includes(value.toLowerCase())
        ? { ok: true, message: "Valid boolean" }
        : { ok: false, message: `Expected boolean (true/false/1/0), got: "${value}"` };
    case "integer":
      return /^\d+$/.test(value)
        ? { ok: true, message: "Valid integer" }
        : { ok: false, message: `Expected integer, got: "${value}"` };
    case "json":
      try { JSON.parse(value); return { ok: true, message: "Valid JSON" }; }
      catch { return { ok: false, message: "Invalid JSON" }; }
    case "base64":
      return BASE64_RE.test(value) && value.length >= 8
        ? { ok: true, message: "Valid Base64" }
        : { ok: false, message: "Expected Base64-encoded string" };
    case "hex-key":
      return HEX_RE.test(value) && value.length >= 16
        ? { ok: true, message: "Valid hex key" }
        : { ok: false, message: "Expected hex-encoded key (min 16 chars)" };
    case "string":
      return value.length > 0
        ? { ok: true, message: "Non-empty string" }
        : { ok: false, message: "Empty string" };
    default:
      return { ok: true, message: "Unchecked format" };
  }
}

export function validateEnvForPlatform(
  platform: Platform,
  env: Record<string, string | undefined>,
  specs: EnvVarSpec[] = ENV_SPEC
): { results: ValidationResult[]; pass: boolean; blockingFailures: number } {
  const results: ValidationResult[] = [];
  let blockingFailures = 0;

  const relevant = specs.filter(s => s.platforms.includes(platform));

  for (const spec of relevant) {
    const value = env[spec.name];

    if (!value || value.trim() === "") {
      if (spec.required) {
        results.push({ name: spec.name, status: "fail", message: `Required variable missing for ${platform}`, format: spec.format, platform });
        blockingFailures++;
      } else {
        results.push({ name: spec.name, status: "skip", message: "Optional, not set", format: spec.format, platform });
      }
      continue;
    }

    const { ok, message } = validateFormat(value.trim(), spec.format);
    if (ok) {
      results.push({ name: spec.name, status: "pass", message, format: spec.format, platform });
    } else {
      results.push({ name: spec.name, status: spec.required ? "fail" : "warn", message, format: spec.format, platform });
      if (spec.required) blockingFailures++;
    }
  }

  return { results, pass: blockingFailures === 0, blockingFailures };
}

export function validateAllPlatforms(
  env: Record<string, string | undefined>,
  platforms: Platform[] = ["web", "edge-functions"],
  specs: EnvVarSpec[] = ENV_SPEC
): { allPass: boolean; platformResults: Record<string, { pass: boolean; results: ValidationResult[] }> } {
  const platformResults: Record<string, { pass: boolean; results: ValidationResult[] }> = {};
  let allPass = true;

  for (const platform of platforms) {
    const { results, pass } = validateEnvForPlatform(platform, env, specs);
    platformResults[platform] = { pass, results };
    if (!pass) allPass = false;
  }

  return { allPass, platformResults };
}

// ── CLI runner ───────────────────────────────────────────────
if (typeof process !== "undefined" && process.argv?.[1]?.includes("check-env-config-validation")) {
  const platforms: Platform[] = (process.argv[2]?.split(",") as Platform[]) || ["web", "edge-functions"];
  const { allPass, platformResults } = validateAllPlatforms(process.env as Record<string, string>, platforms);

  for (const [platform, { pass, results }] of Object.entries(platformResults)) {
    console.log(`\n═══ ${platform.toUpperCase()} ═══ ${pass ? "✅ PASS" : "❌ FAIL"}`);
    for (const r of results) {
      const icon = r.status === "pass" ? "✓" : r.status === "fail" ? "✗" : r.status === "warn" ? "⚠" : "–";
      console.log(`  ${icon} ${r.name}: ${r.message}`);
    }
  }

  process.exit(allPass ? 0 : 1);
}