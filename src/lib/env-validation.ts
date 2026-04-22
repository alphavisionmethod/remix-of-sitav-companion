// ═══════════════════════════════════════════════════════════════
// SITA OS — Boot-time Environment Validation
// Called once at app startup to surface missing config early.
// ═══════════════════════════════════════════════════════════════

const REQUIRED_VARS = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
] as const;

const OPTIONAL_VARS = [
  "VITE_SUPABASE_PROJECT_ID",
  "VITE_SENTRY_DSN",
  "VITE_APPLIANCE_RUNTIME",
] as const;

export interface EnvValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

export function validateEnv(): EnvValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const key of REQUIRED_VARS) {
    if (!import.meta.env[key]) {
      missing.push(key);
    }
  }

  for (const key of OPTIONAL_VARS) {
    if (!import.meta.env[key]) {
      warnings.push(`Optional env var ${key} is not set`);
    }
  }

  if (missing.length > 0) {
    console.error(
      `[SITA] Missing required environment variables: ${missing.join(", ")}. ` +
      `The app may not function correctly.`
    );
  }

  if (warnings.length > 0 && import.meta.env.DEV) {
    console.warn(`[SITA] Environment warnings:\n${warnings.join("\n")}`);
  }

  return { valid: missing.length === 0, missing, warnings };
}