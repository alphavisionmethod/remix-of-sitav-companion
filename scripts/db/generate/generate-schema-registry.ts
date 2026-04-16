#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Generate Schema Registry (LIVE-PG BACKED)
//
// Source of truth: live pg_tables + pg_policies + information_schema.
// Falls back to scanning supabase/migrations/ for CREATE TABLE
// statements when psql is not available (e.g., CI without DB access).
//
// Outputs:
//   - src/lib/db/schema-registry.ts  (canonical TS registry)
//   - generated/schema-registry.json (CI-readable artifact)
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import { writeJsonOutput, envelope } from "../../architecture/lib/utils";

// ── Domain & class classification (mirrors the registry shape) ──
const DOMAIN_RULES: Array<[string, string]> = [
  ["admin_", "admin-governance"], ["action_safety", "admin-governance"],
  ["advisor_", "advisor-intelligence"], ["ai_workforce", "ai-workforce"], ["ai_inference", "ai-workforce"],
  ["boardroom_", "boardroom"],
  ["appointment", "business-crm"], ["crm_", "business-crm"], ["contact", "business-crm"],
  ["client", "business-crm"], ["lead", "business-crm"], ["opportunit", "business-crm"],
  ["deal", "business-crm"], ["booking", "business-crm"],
  ["cloud_", "cloud-infrastructure"],
  ["connector_", "connector-fabric"], ["integration_", "connector-fabric"], ["oauth_", "connector-fabric"],
  ["webhook", "connector-fabric"], ["provider_", "connector-fabric"], ["sync_", "connector-fabric"],
  ["invoice", "finance"], ["payment", "finance"], ["expense", "finance"], ["tax", "finance"],
  ["cashflow", "finance"], ["budget", "finance"], ["investment", "finance"], ["portfolio", "finance"],
  ["transaction", "finance"], ["subscription", "finance"], ["billing", "finance"],
  ["notification", "notification"], ["push_", "notification"], ["vapid_", "notification"],
  ["os_", "os-kernel"], ["device_", "os-kernel"], ["runtime_", "os-kernel"], ["command_", "os-kernel"],
  ["biometric_", "auth-identity"], ["profile", "auth-identity"], ["user_", "auth-identity"],
  ["session", "auth-identity"], ["org", "auth-identity"], ["tenant", "auth-identity"],
  ["approval_", "platform-core"], ["policy_", "platform-core"], ["event_", "platform-core"],
  ["feature_flag", "platform-core"], ["release_", "platform-core"], ["deploy_", "platform-core"],
  ["workflow_", "platform-core"], ["task_", "platform-core"], ["graph_", "platform-core"],
  ["timeline_", "platform-core"], ["license_", "platform-core"], ["health_", "platform-core"],
  ["kill_switch", "platform-core"], ["environment", "platform-core"],
  ["audit_", "compliance"], ["compliance_", "compliance"], ["attestation", "compliance"],
  ["proof_", "compliance"], ["receipt", "compliance"], ["incident", "compliance"],
  ["dashboard_", "user-experience"], ["widget_", "user-experience"], ["preference", "user-experience"],
  ["setting", "user-experience"], ["theme_", "user-experience"], ["onboarding", "user-experience"],
  ["setup_", "user-experience"], ["file_", "user-experience"], ["document", "user-experience"],
  ["communication", "user-experience"], ["message", "user-experience"], ["email_", "user-experience"],
  ["app_store", "user-experience"],
  ["memory", "advisor-intelligence"], ["simulation", "advisor-intelligence"], ["digital_twin", "advisor-intelligence"],
];

const SENSITIVE_HINTS = ["credential", "token", "secret", "password", "biometric", "attestation", "oauth", "vapid", "mfa"];
const LOG_HINTS = ["_audit", "_log", "_history", "_events", "_trail", "incident", "receipt", "_executions", "attestation"];
const CONFIG_HINTS = ["_config", "_settings", "_preferences", "_flags", "_classifications", "_permissions", "_policies", "_rules", "theme_", "feature_flag", "safety_actions", "role_permissions"];
const SYSTEM_HINTS = ["_runtime", "kill_switch", "system_", "os_", "health_", "release_", "deploy_", "environment"];
const READ_HINTS = ["_summary", "_view", "_projection", "_dashboard", "_aggregate"];

function classifyDomain(name: string): string {
  for (const [prefix, dom] of DOMAIN_RULES) if (name.includes(prefix)) return dom;
  return "platform-core";
}
function classifySchemaClass(name: string): string {
  for (const h of LOG_HINTS) if (name.includes(h)) return "log";
  for (const h of CONFIG_HINTS) if (name.includes(h)) return "config";
  for (const h of SYSTEM_HINTS) if (name.includes(h)) return "system";
  for (const h of READ_HINTS) if (name.includes(h)) return "read";
  return "write";
}
function isSensitive(name: string): boolean {
  return SENSITIVE_HINTS.some(h => name.includes(h));
}
function tenancyCol(hasUser: boolean, hasOrg: boolean, hasTenant: boolean, hasActor: boolean): string | null {
  if (hasUser) return "user_id";
  if (hasTenant) return "tenant_id";
  if (hasOrg) return "org_id";
  if (hasActor) return "actor_user_id";
  return null;
}

interface RawRow {
  name: string; hasUser: boolean; hasOrg: boolean; hasTenant: boolean; hasActor: boolean;
  rls: boolean; policies: number;
}

function fetchFromLiveDb(): RawRow[] | null {
  try {
    if (!process.env.PGHOST) return null;
    const sql = `
      SELECT t.tablename,
        EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_schema='public' AND c.table_name=t.tablename AND c.column_name='user_id'),
        EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_schema='public' AND c.table_name=t.tablename AND c.column_name='org_id'),
        EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_schema='public' AND c.table_name=t.tablename AND c.column_name='tenant_id'),
        EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_schema='public' AND c.table_name=t.tablename AND c.column_name='actor_user_id'),
        (SELECT relrowsecurity FROM pg_class WHERE relname=t.tablename AND relnamespace=(SELECT oid FROM pg_namespace WHERE nspname='public')),
        (SELECT count(*) FROM pg_policies WHERE schemaname='public' AND tablename=t.tablename)
      FROM pg_tables t WHERE t.schemaname='public' ORDER BY t.tablename
    `.replace(/\s+/g, " ");
    const out = execSync(`psql -A -F'|' -t -c "${sql}"`, { encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] });
    const rows: RawRow[] = [];
    for (const line of out.split("\n")) {
      const p = line.trim().split("|");
      if (p.length < 7 || !p[0]) continue;
      rows.push({
        name: p[0], hasUser: p[1] === "t", hasOrg: p[2] === "t", hasTenant: p[3] === "t",
        hasActor: p[4] === "t", rls: p[5] === "t", policies: parseInt(p[6]) || 0,
      });
    }
    return rows.length ? rows : null;
  } catch {
    return null;
  }
}

function fetchFromMigrations(): RawRow[] {
  // Fallback: scan migrations for CREATE TABLE public.X
  const dir = "supabase/migrations";
  if (!fs.existsSync(dir)) return [];
  const seen = new Map<string, RawRow>();
  for (const f of fs.readdirSync(dir).sort()) {
    if (!f.endsWith(".sql")) continue;
    const sql = fs.readFileSync(path.join(dir, f), "utf-8");
    const re = /CREATE TABLE (?:IF NOT EXISTS )?public\.(\w+)\s*\(([^;]+)\)/gi;
    let m;
    while ((m = re.exec(sql)) !== null) {
      const name = m[1];
      const body = m[2];
      if (seen.has(name)) continue;
      seen.set(name, {
        name,
        hasUser: /\buser_id\b/.test(body),
        hasOrg: /\borg_id\b/.test(body),
        hasTenant: /\btenant_id\b/.test(body),
        hasActor: /\bactor_user_id\b/.test(body),
        rls: /ENABLE ROW LEVEL SECURITY/i.test(sql) && sql.includes(name),
        policies: 0,
      });
    }
  }
  return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name));
}

const liveRows = fetchFromLiveDb();
const rows = liveRows ?? fetchFromMigrations();
const source = liveRows ? "live-pg" : "migrations-fallback";

if (rows.length === 0) {
  console.error("❌ generate-schema-registry: no tables found from live DB or migrations");
  process.exit(1);
}

const entries = rows.map(r => ({
  name: r.name,
  domain: classifyDomain(r.name),
  schemaClass: classifySchemaClass(r.name),
  hasRls: r.rls,
  policyCount: r.policies,
  tenancyColumn: tenancyCol(r.hasUser, r.hasOrg, r.hasTenant, r.hasActor),
  sensitiveData: isSensitive(r.name),
}));

// Write TS registry
entries.sort((a, b) => a.domain === b.domain ? a.name.localeCompare(b.name) : a.domain.localeCompare(b.domain));

const tsLines: string[] = [
  `// ═══════════════════════════════════════════════════════════════`,
  `// SITA OS — DB Schema Registry (AUTO-GENERATED from ${source})`,
  `// Source of truth: live pg_tables + pg_policies (regenerate via`,
  `//   npx tsx scripts/db/generate/generate-schema-registry.ts)`,
  `// DO NOT hand-edit. Edit the generator or run a migration instead.`,
  `// Last generated: ${new Date().toISOString()}`,
  `// ═══════════════════════════════════════════════════════════════`,
  ``,
  `export type DbDomain =`,
  `  | "auth-identity" | "admin-governance" | "advisor-intelligence" | "ai-workforce"`,
  `  | "boardroom" | "business-crm" | "cloud-infrastructure" | "connector-fabric"`,
  `  | "finance" | "notification" | "os-kernel" | "platform-core"`,
  `  | "compliance" | "user-experience";`,
  ``,
  `export type SchemaClass = "write" | "read" | "log" | "config" | "system";`,
  ``,
  `export interface TableRegistryEntry {`,
  `  readonly name: string;`,
  `  readonly domain: DbDomain;`,
  `  readonly schemaClass: SchemaClass;`,
  `  readonly hasRls: boolean;`,
  `  readonly policyCount: number;`,
  `  readonly tenancyColumn: string | null;`,
  `  readonly sensitiveData: boolean;`,
  `  readonly description?: string;`,
  `}`,
  ``,
  `export const DB_SCHEMA_REGISTRY: readonly TableRegistryEntry[] = [`,
];

let lastDomain = "";
for (const e of entries) {
  if (e.domain !== lastDomain) {
    if (lastDomain) tsLines.push("");
    tsLines.push(`  // ── ${e.domain} ──`);
    lastDomain = e.domain;
  }
  const tc = e.tenancyColumn ? `"${e.tenancyColumn}"` : "null";
  tsLines.push(`  { name: "${e.name}", domain: "${e.domain}", schemaClass: "${e.schemaClass}", hasRls: ${e.hasRls}, policyCount: ${e.policyCount}, tenancyColumn: ${tc}, sensitiveData: ${e.sensitiveData} },`);
}

tsLines.push(``, `] as const;`, ``);
tsLines.push(`export const TOTAL_TABLES = DB_SCHEMA_REGISTRY.length;`);
tsLines.push(`export const TABLES_BY_DOMAIN: Record<DbDomain, TableRegistryEntry[]> =`);
tsLines.push(`  DB_SCHEMA_REGISTRY.reduce((acc, e) => {`);
tsLines.push(`    (acc[e.domain] ||= []).push(e);`);
tsLines.push(`    return acc;`);
tsLines.push(`  }, {} as Record<DbDomain, TableRegistryEntry[]>);`);
tsLines.push(``);
tsLines.push(`export const RLS_COVERAGE_PCT = Math.round(`);
tsLines.push(`  (DB_SCHEMA_REGISTRY.filter(e => e.hasRls).length / TOTAL_TABLES) * 100`);
tsLines.push(`);`);
tsLines.push(``);
tsLines.push(`export const TENANT_SCOPED_TABLES = DB_SCHEMA_REGISTRY.filter(e => e.tenancyColumn !== null);`);
tsLines.push(`export const SENSITIVE_TABLES = DB_SCHEMA_REGISTRY.filter(e => e.sensitiveData);`);
tsLines.push(``);
tsLines.push(`export function getTableEntry(name: string): TableRegistryEntry | undefined {`);
tsLines.push(`  return DB_SCHEMA_REGISTRY.find(e => e.name === name);`);
tsLines.push(`}`);
tsLines.push(``);
tsLines.push(`export function getTablesByDomain(domain: DbDomain): TableRegistryEntry[] {`);
tsLines.push(`  return TABLES_BY_DOMAIN[domain] || [];`);
tsLines.push(`}`);
tsLines.push(``);

fs.writeFileSync("src/lib/db/schema-registry.ts", tsLines.join("\n"));

// Write JSON artifact
writeJsonOutput("generated/schema-registry.json", envelope("2.0.0", {
  source,
  totalTables: entries.length,
  rlsEnabled: entries.filter(e => e.hasRls).length,
  rlsCoveragePct: Math.round((entries.filter(e => e.hasRls).length / entries.length) * 100),
  tenantScoped: entries.filter(e => e.tenancyColumn).length,
  sensitive: entries.filter(e => e.sensitiveData).length,
  byDomain: Object.fromEntries(
    Array.from(new Set(entries.map(e => e.domain))).map(d => [d, entries.filter(e => e.domain === d).length])
  ),
  byClass: Object.fromEntries(
    ["write", "read", "log", "config", "system"].map(c => [c, entries.filter(e => e.schemaClass === c).length])
  ),
  tables: entries,
}));

console.log(`✅ generate-schema-registry: ${entries.length} tables (${source})`);
console.log(`   RLS-enabled: ${entries.filter(e => e.hasRls).length} / ${entries.length}`);
console.log(`   Tenant-scoped: ${entries.filter(e => e.tenancyColumn).length}`);
console.log(`   Sensitive: ${entries.filter(e => e.sensitiveData).length}`);
