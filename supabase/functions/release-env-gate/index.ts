// ═══════════════════════════════════════════════════════════════
// SITA OS — Release Environment Gate
// Deep-validates environment variables (URLs, UUIDs, feature flags)
// per platform (web, desktop, os-image, mobile-pwa) using strict
// Zod format checks. Blocks release if any validation fails.
// Admin-only. Writes gate results to admin_action_audit.
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { withCors } from "../_shared/cors.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// ── Platform Definitions ──────────────────────────────────────

const PLATFORMS = ["web", "desktop", "os-image", "mobile-pwa"] as const;
type Platform = typeof PLATFORMS[number];

// ── Reusable Zod Primitives ──────────────────────────────────

const httpsUrl = z.string().url().refine(
  (u) => u.startsWith("https://"),
  { message: "Must be an HTTPS URL" },
);

const uuid = z.string().uuid();

const semver = z.string().regex(
  /^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?(\+[a-zA-Z0-9.]+)?$/,
  { message: "Must be a valid semver (e.g. 1.2.3 or 1.0.0-beta.1)" },
);

const boolFlag = z.enum(["true", "false", "1", "0"]).transform((v) => v === "true" || v === "1");

const hexSha256 = z.string().regex(/^[a-f0-9]{64}$/i, { message: "Must be a 64-char hex SHA-256" });

const portNumber = z.string().regex(/^\d{1,5}$/).refine(
  (v) => { const n = parseInt(v, 10); return n >= 1 && n <= 65535; },
  { message: "Must be a valid port (1-65535)" },
);

const cronExpr = z.string().regex(
  /^(\*|[0-9,\-\/]+)\s+(\*|[0-9,\-\/]+)\s+(\*|[0-9,\-\/]+)\s+(\*|[0-9,\-\/]+)\s+(\*|[0-9,\-\/]+)$/,
  { message: "Must be a valid 5-field cron expression" },
);

const commaList = z.string().regex(/^[a-z0-9_]+(,[a-z0-9_]+)*$/, {
  message: "Must be a comma-separated list of lowercase identifiers",
});

// ── Per-Platform Env Schemas ─────────────────────────────────

/** Core vars required by ALL platforms */
const coreSchema = z.object({
  SUPABASE_URL: httpsUrl,
  SUPABASE_ANON_KEY: z.string().min(30, "Anon key too short"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(30, "Service role key too short"),
  SUPABASE_PROJECT_REF: z.string().regex(/^[a-z]{20}$/, "Must be a 20-char lowercase project ref"),
  APP_VERSION: semver,
  NODE_ENV: z.enum(["production", "staging"]),
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).optional(),
});

/** Feature flags validated across all platforms */
const featureFlagsSchema = z.object({
  FF_MAINTENANCE_MODE: boolFlag.optional(),
  FF_AI_ENABLED: boolFlag.optional(),
  FF_REALTIME_ENABLED: boolFlag.optional(),
  FF_ONBOARDING_V2: boolFlag.optional(),
  FF_BILLING_ENABLED: boolFlag.optional(),
  FF_KILL_SWITCH_GLOBAL: boolFlag.optional(),
});

/** Web-specific */
const webSchema = coreSchema.merge(featureFlagsSchema).extend({
  VITE_SUPABASE_URL: httpsUrl,
  VITE_SUPABASE_PUBLISHABLE_KEY: z.string().min(30),
  VITE_SUPABASE_PROJECT_ID: z.string().regex(/^[a-z]{20}$/),
  PUBLIC_SITE_URL: httpsUrl,
  CORS_ALLOWED_ORIGINS: z.string().min(1, "CORS origins required"),
});

/** Desktop (Electron) specific */
const desktopSchema = coreSchema.merge(featureFlagsSchema).extend({
  ELECTRON_APP_ID: z.string().regex(/^[a-z]+(\.[a-z0-9]+){2,}$/, "Must be reverse-domain (com.example.app)"),
  AUTO_UPDATE_URL: httpsUrl,
  SIGNING_CERT_FINGERPRINT: hexSha256.optional(),
  CRASH_REPORT_URL: httpsUrl.optional(),
  DEV_TOOLS_ENABLED: boolFlag,
});

/** OS Image (SITA OS) specific */
const osImageSchema = coreSchema.merge(featureFlagsSchema).extend({
  OS_UPDATE_CHANNEL: z.enum(["stable", "beta", "nightly"]),
  OS_ROOTFS_SHA256: hexSha256,
  OS_VERITY_HASH: hexSha256,
  OS_KERNEL_VERSION: semver,
  OS_PARTITION_LAYOUT: z.enum(["ab", "single"]),
  ATTESTATION_SIGNING_KEY: z.string().min(16, "Signing key too short"),
  RECOVERY_ENDPOINT: httpsUrl,
  SYSLOG_PORT: portNumber.optional(),
  CRON_HEALTH_CHECK: cronExpr.optional(),
});

/** Mobile PWA specific */
const mobilePwaSchema = coreSchema.merge(featureFlagsSchema).extend({
  VAPID_PUBLIC_KEY: z.string().min(30, "VAPID public key too short"),
  VAPID_PRIVATE_KEY: z.string().min(30, "VAPID private key too short"),
  VAPID_SUBJECT: z.string().regex(/^(mailto:|https:\/\/)/, "Must start with mailto: or https://"),
  PWA_SCOPE: z.string().regex(/^\//, "Must start with /"),
  PWA_START_URL: z.string().regex(/^\//, "Must start with /"),
  PUSH_BATCH_SIZE: z.string().regex(/^\d+$/).optional(),
  OFFLINE_CACHE_STRATEGY: z.enum(["network-first", "cache-first", "stale-while-revalidate"]).optional(),
});

const PLATFORM_SCHEMAS: Record<Platform, z.ZodObject<z.ZodRawShape>> = {
  "web": webSchema as unknown as z.ZodObject<z.ZodRawShape>,
  "desktop": desktopSchema as unknown as z.ZodObject<z.ZodRawShape>,
  "os-image": osImageSchema as unknown as z.ZodObject<z.ZodRawShape>,
  "mobile-pwa": mobilePwaSchema as unknown as z.ZodObject<z.ZodRawShape>,
};

// ── Request / Response Schemas ───────────────────────────────

const RequestSchema = z.object({
  platform: z.enum(PLATFORMS),
  env: z.record(z.string()),
  release_tag: z.string().min(1).optional(),
  dry_run: z.boolean().optional().default(false),
});

// ── Handler ──────────────────────────────────────────────────

Deno.serve(withCors("release-env-gate", async (req, ctx) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Auth gate
  const authHeader = req.headers.get("authorization") ?? "";
  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader.replace("Bearer ", ""),
  );
  if (authError || !user) return ctx.error("Unauthorized", 401);

  // Admin role gate
  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin");
  if (!roles || roles.length === 0) return ctx.error("Admin role required", 403);

  // Parse request
  const rawBody = await req.json().catch(() => ({}));
  const reqParse = RequestSchema.safeParse(rawBody);
  if (!reqParse.success) {
    return ctx.error("Invalid request body", 400, {
      validation_errors: reqParse.error.flatten().fieldErrors,
    });
  }

  const { platform, env, release_tag, dry_run } = reqParse.data;

  // Validate env against platform schema
  const schema = PLATFORM_SCHEMAS[platform];
  const result = schema.safeParse(env);

  const gateResult = {
    gate: result.success ? "pass" : "fail",
    platform,
    release_tag: release_tag ?? null,
    dry_run,
    checked_at: new Date().toISOString(),
    total_vars_checked: Object.keys(env).length,
    errors: result.success ? [] : result.error.issues.map((i) => ({
      path: i.path.join("."),
      code: i.code,
      message: i.message,
      received: i.path.length > 0 ? env[String(i.path[0])] ?? "(missing)" : "(unknown)",
    })),
    warnings: [] as string[],
  };

  // Extra cross-field warnings
  if (env.NODE_ENV === "production" && env.LOG_LEVEL === "debug") {
    gateResult.warnings.push("LOG_LEVEL=debug in production is not recommended");
  }
  if (env.FF_MAINTENANCE_MODE === "true" || env.FF_MAINTENANCE_MODE === "1") {
    gateResult.warnings.push("Maintenance mode is ON — users will see a maintenance page");
  }
  if (env.FF_KILL_SWITCH_GLOBAL === "true" || env.FF_KILL_SWITCH_GLOBAL === "1") {
    gateResult.warnings.push("Global kill switch is active — all automation is paused");
  }
  if (platform === "desktop" && (env.DEV_TOOLS_ENABLED === "true" || env.DEV_TOOLS_ENABLED === "1") && env.NODE_ENV === "production") {
    gateResult.warnings.push("DEV_TOOLS_ENABLED=true in production desktop build");
  }

  // Audit log (always, even for dry runs)
  await supabase.from("admin_action_audit").insert({
    actor_user_id: user.id,
    action: "release_env_gate",
    target_type: "release",
    target_id: release_tag ?? `gate-${platform}`,
    plane: "admin",
    severity: result.success ? "info" : "high",
    justification: `Release env gate ${gateResult.gate} for ${platform}${dry_run ? " (dry-run)" : ""}`,
    metadata: {
      _requestId: ctx.requestId,
      platform,
      gate: gateResult.gate,
      error_count: gateResult.errors.length,
      warning_count: gateResult.warnings.length,
      dry_run,
      release_tag: release_tag ?? null,
    },
  });

  const httpStatus = result.success ? 200 : 422;
  return ctx.json(gateResult, httpStatus);
}));