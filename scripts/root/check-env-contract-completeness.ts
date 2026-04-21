/**
 * Validates .env.production.example covers all env vars referenced in docker-compose.yml.
 * Exit 1 if docker-compose references undocumented environment variables.
 */
import * as fs from "fs";
import * as path from "path";

const ENV_EXAMPLE_PATH = path.resolve(".env.production.example");
const DOCKER_COMPOSE_PATH = path.resolve("docker-compose.yml");

// Variables that are docker-internal or set by the compose file itself
const IGNORED_VARS = new Set([
  "NODE_ENV", "PORT", "BRAIN_CORE_URL", "SUPABASE_URL", "EDGE_FUNCTIONS_URL",
  "KONG_DATABASE", "KONG_DECLARATIVE_CONFIG", "KONG_DNS_ORDER", "KONG_PLUGINS",
  "PGRST_DB_URI", "PGRST_DB_SCHEMAS", "PGRST_DB_EXTRA_SEARCH_PATH",
  "PGRST_DB_ANON_ROLE", "PGRST_JWT_SECRET", "PGRST_DB_USE_LEGACY_GUCS",
  "GOTRUE_API_HOST", "GOTRUE_API_PORT", "GOTRUE_DB_DRIVER",
  "GOTRUE_DB_DATABASE_URL", "GOTRUE_SITE_URL", "GOTRUE_JWT_SECRET",
  "GOTRUE_JWT_EXP", "GOTRUE_DISABLE_SIGNUP", "GOTRUE_EXTERNAL_EMAIL_ENABLED",
  "API_EXTERNAL_URL", "PG_META_PORT", "PG_META_DB_HOST", "PG_META_DB_PORT",
  "PG_META_DB_NAME", "PG_META_DB_USER", "PG_META_DB_PASSWORD",
  "POSTGRES_DB", "JWT_EXP", "DB_HOST", "DB_PORT", "DB_USER",
  "DB_PASSWORD", "DB_NAME", "DB_AFTER_CONNECT_QUERY", "DB_ENC_KEY",
  "API_JWT_SECRET", "FLY_ALLOC_ID", "FLY_APP_NAME", "SECRET_KEY_BASE",
  "ERL_AFLAGS", "ENABLE_TAILSCALE", "DNS_NODES",
  "ANON_KEY", "SERVICE_KEY", "DATABASE_URL", "STORAGE_BACKEND",
  "FILE_STORAGE_BACKEND_PATH", "TENANT_ID", "REGION", "GLOBAL_S3_BUCKET",
  "IS_MULTITENANT", "STUDIO_PG_META_URL", "SUPABASE_REST_URL",
  "NEXT_PUBLIC_ENABLE_LOGS", "DEFAULT_ORGANIZATION_NAME", "DEFAULT_PROJECT_NAME",
  "DENO_SERVE_ADDRESS", "SUPABASE_DB_URL",
  "RATE_LIMIT_MAX", "RATE_LIMIT_WINDOW_MS",
]);

function extractComposeVars(content: string): Set<string> {
  const vars = new Set<string>();
  // Match ${VAR}, ${VAR:-default}, ${VAR-default}
  const regex = /\$\{([A-Z_][A-Z0-9_]*)(?::-?[^}]*)?\}/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    vars.add(match[1]);
  }
  return vars;
}

function extractEnvExampleVars(content: string): Set<string> {
  const vars = new Set<string>();
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const varName = trimmed.split("=")[0].trim();
    if (varName) vars.add(varName);
  }
  return vars;
}

function main() {
  if (!fs.existsSync(DOCKER_COMPOSE_PATH)) {
    console.log("⚠️  No docker-compose.yml found — skipping");
    process.exit(0);
  }
  if (!fs.existsSync(ENV_EXAMPLE_PATH)) {
    console.error("❌ .env.production.example not found");
    process.exit(1);
  }

  const composeVars = extractComposeVars(fs.readFileSync(DOCKER_COMPOSE_PATH, "utf-8"));
  const exampleVars = extractEnvExampleVars(fs.readFileSync(ENV_EXAMPLE_PATH, "utf-8"));

  const missing: string[] = [];
  for (const v of composeVars) {
    if (IGNORED_VARS.has(v)) continue;
    if (!exampleVars.has(v)) missing.push(v);
  }

  if (missing.length === 0) {
    console.log("✅ All docker-compose env vars are documented in .env.production.example");
    process.exit(0);
  }

  console.error("❌ Undocumented env vars referenced in docker-compose.yml:\n");
  for (const v of missing.sort()) {
    console.error(`  - ${v}`);
  }
  console.error(`\nAdd these to .env.production.example`);
  process.exit(1);
}

main();