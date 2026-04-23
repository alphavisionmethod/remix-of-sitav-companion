/**
 * Boot-time environment variable validation.
 * Logs warnings for missing VITE_ vars that backend features depend on.
 * Does NOT throw — the app should degrade gracefully.
 */

interface EnvRequirement {
  key: string;
  required: boolean;
  description: string;
}

const ENV_REQUIREMENTS: EnvRequirement[] = [
  { key: "VITE_SUPABASE_URL", required: true, description: "Backend API URL" },
  { key: "VITE_SUPABASE_PUBLISHABLE_KEY", required: true, description: "Backend public key" },
  { key: "VITE_SUPABASE_PROJECT_ID", required: false, description: "Project identifier for edge function URLs" },
];

export function validateEnvironment(): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  for (const req of ENV_REQUIREMENTS) {
    const value = import.meta.env[req.key];
    if (!value || value === "undefined" || value === "") {
      const msg = `${req.required ? "MISSING" : "OPTIONAL"}: ${req.key} — ${req.description}`;
      warnings.push(msg);
      if (req.required) {
        console.error(`[env-validation] ${msg}`);
      } else {
        console.warn(`[env-validation] ${msg}`);
      }
    }
  }

  return { valid: warnings.filter((_, i) => ENV_REQUIREMENTS[i]?.required).length === 0, warnings };
}