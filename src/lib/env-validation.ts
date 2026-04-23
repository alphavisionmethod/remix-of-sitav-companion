// ═══════════════════════════════════════════════════════════════
// SITA OS — Boot-time Environment Validation
// Fail-fast: blocks app render when critical vars are missing.
// ═══════════════════════════════════════════════════════════════

export interface EnvRequirement {
  key: string;
  required: boolean;
  description: string;
}

export const ENV_REQUIREMENTS: EnvRequirement[] = [
  { key: "VITE_SUPABASE_URL",             required: true,  description: "Backend API URL" },
  { key: "VITE_SUPABASE_PUBLISHABLE_KEY", required: true,  description: "Backend public key" },
  { key: "VITE_SUPABASE_PROJECT_ID",      required: false, description: "Project identifier for edge function URLs" },
];

export interface EnvValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

let _cached: EnvValidationResult | null = null;

/**
 * Validates all VITE_* environment requirements at boot.
 * - `missing` contains names of required vars that are absent.
 * - `warnings` contains optional vars that are absent.
 * Result is cached after first call.
 */
export function validateEnvironment(): EnvValidationResult {
  if (_cached) return _cached;

  const missing: string[] = [];
  const warnings: string[] = [];

  for (const req of ENV_REQUIREMENTS) {
    const value = import.meta.env[req.key];
    const isBlank = !value || value === "undefined" || value === "";

    if (!isBlank) continue;

    if (req.required) {
      missing.push(req.key);
      console.error(`[env-validation] MISSING: ${req.key} — ${req.description}`);
    } else {
      warnings.push(req.key);
      console.warn(`[env-validation] OPTIONAL: ${req.key} — ${req.description}`);
    }
  }

  _cached = { valid: missing.length === 0, missing, warnings };
  return _cached;
}

/** Returns the cached result (or runs validation if not yet cached). */
export function getEnvValidation(): EnvValidationResult {
  return _cached ?? validateEnvironment();
}