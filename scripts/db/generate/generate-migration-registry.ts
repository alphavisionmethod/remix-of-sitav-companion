#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Generate Migration Registry (LIVE)
// Scans all supabase/migrations/*.sql and produces:
//   - src/lib/db/migration-registry.ts (full TS registry)
//   - generated/migration-registry.json (machine artifact)
//
// Source of truth: supabase/migrations/*.sql
// ═══════════════════════════════════════════════════════════════
import * as fs from "fs";
import * as path from "path";
import { writeJsonOutput, envelope } from "../../architecture/lib/utils";

const MIG_DIR = "supabase/migrations";
if (!fs.existsSync(MIG_DIR)) {
  console.error(`❌ ${MIG_DIR} not found`);
  process.exit(1);
}

const migrations = fs.readdirSync(MIG_DIR).filter(f => f.endsWith(".sql")).sort();

type MigCategory =
  | "table-creation" | "rls-policy" | "function-trigger" | "index"
  | "schema-alteration" | "seed-data" | "view" | "enum" | "constraint"
  | "data-migration" | "extension" | "destructive";

function inferDomain(tables: string[]): string {
  if (tables.length === 0) return "platform-core";
  const t = tables[0];
  if (t.startsWith("admin_") || t.startsWith("cloud_admin")) return "admin-governance";
  if (t.startsWith("advisor_")) return "advisor-intelligence";
  if (t.startsWith("ai_workforce") || t.startsWith("ai_inference")) return "ai-workforce";
  if (t.startsWith("boardroom") || t.startsWith("board_")) return "boardroom";
  if (t.startsWith("connector") || t.startsWith("integration") || t.startsWith("webhook")) return "connector-fabric";
  if (t.startsWith("cloud_") || t.startsWith("tenant")) return "cloud-infrastructure";
  if (t.startsWith("device") || t.startsWith("biometric")) return "auth-identity";
  if (t.startsWith("notification") || t.startsWith("push") || t.startsWith("vapid")) return "notification";
  if (t.startsWith("user_") || t.startsWith("profile") || t.includes("session")) return "auth-identity";
  if (t.startsWith("business") || t.startsWith("crm") || t.startsWith("contact")) return "business-crm";
  if (t.startsWith("finance") || t.startsWith("invoice") || t.startsWith("payment") || t.startsWith("transaction")) return "finance";
  if (t.startsWith("audit") || t.startsWith("compliance") || t.startsWith("policy") || t.includes("audit")) return "compliance";
  if (t.startsWith("os_") || t.startsWith("kernel") || t.startsWith("runtime")) return "os-kernel";
  return "platform-core";
}

const entries = migrations.map((filename, idx) => {
  const content = fs.readFileSync(path.join(MIG_DIR, filename), "utf-8");
  const tablesAffected = Array.from(new Set(
    [...content.matchAll(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?["`]?(\w+)["`]?/gi)].map(m => m[1].toLowerCase())
      .concat([...content.matchAll(/ALTER\s+TABLE\s+(?:public\.)?["`]?(\w+)["`]?/gi)].map(m => m[1].toLowerCase()))
  ));
  const hasCreateTable = /CREATE\s+TABLE/i.test(content);
  const hasPolicy = /CREATE\s+POLICY/i.test(content);
  const hasFunc = /CREATE\s+(OR\s+REPLACE\s+)?(FUNCTION|TRIGGER)/i.test(content);
  const hasIndex = /CREATE\s+(UNIQUE\s+)?INDEX/i.test(content);
  const hasView = /CREATE\s+(OR\s+REPLACE\s+)?VIEW/i.test(content);
  const hasEnum = /CREATE\s+TYPE\s+\w+\s+AS\s+ENUM/i.test(content);
  const hasAlter = /ALTER\s+TABLE/i.test(content);
  const hasInsert = /INSERT\s+INTO/i.test(content);
  const hasDrop = /DROP\s+(TABLE|COLUMN|CONSTRAINT|POLICY)/i.test(content);
  const hasTruncate = /TRUNCATE/i.test(content);
  const hasExt = /CREATE\s+EXTENSION/i.test(content);
  const hasRls = /ENABLE\s+ROW\s+LEVEL\s+SECURITY/i.test(content);
  const hasTenancyCol = /(user_id|actor_user_id|tenant_id|org_id|owner_id)/i.test(content);

  let category: MigCategory = "schema-alteration";
  if (hasCreateTable) category = "table-creation";
  else if (hasPolicy && !hasFunc) category = "rls-policy";
  else if (hasFunc) category = "function-trigger";
  else if (hasView) category = "view";
  else if (hasEnum) category = "enum";
  else if (hasIndex && !hasAlter) category = "index";
  else if (hasInsert) category = "seed-data";
  else if (hasExt) category = "extension";
  else if (hasDrop || hasTruncate) category = "destructive";
  else if (hasAlter) category = "schema-alteration";

  const destructive = hasDrop || hasTruncate;
  const releaseConsequence = destructive ? "destructive"
    : (hasCreateTable || hasIndex || hasFunc || hasView || hasEnum || hasExt) ? "additive"
    : (hasPolicy && !hasAlter && !hasCreateTable) ? "policy-only"
    : "mutative";
  const rollbackRisk = destructive ? "critical"
    : hasAlter && !hasCreateTable ? "high"
    : releaseConsequence === "mutative" ? "medium" : "low";
  const dataSensitivity = /token|secret|key|credential|password|api_key/i.test(content) ? "high"
    : /audit|email|phone|address/i.test(content) ? "medium"
    : hasCreateTable ? "low" : "none";
  const tenancyImpact = hasCreateTable && hasTenancyCol ? "added"
    : hasAlter && hasTenancyCol ? "modified"
    : destructive && hasTenancyCol ? "removed" : "none";
  const ts = filename.match(/^(\d{14})/)?.[1] ?? "00000000000000";
  const description = tablesAffected.length > 0
    ? `${category}: ${tablesAffected.slice(0, 3).join(", ")}${tablesAffected.length > 3 ? ` +${tablesAffected.length - 3}` : ""}`
    : `${category} migration`;

  return { ordinal: idx + 1, filename, timestamp: ts, category, boundedContext: inferDomain(tablesAffected),
    rollbackRisk, releaseConsequence, dataSensitivity, tenancyImpact, destructive, hasRls, tablesAffected, description };
});

// Write TS registry
const tsOut = `// ═══════════════════════════════════════════════════════════════
// SITA OS — Migration Registry (AUTO-GENERATED)
// Source of truth: supabase/migrations/*.sql
// Regenerate via: npx tsx scripts/db/generate/generate-migration-registry.ts
// DO NOT hand-edit. Last generated: ${new Date().toISOString()}
// Total migrations: ${entries.length}
// ═══════════════════════════════════════════════════════════════

export type MigrationCategory =
  | "table-creation" | "rls-policy" | "function-trigger" | "index"
  | "schema-alteration" | "seed-data" | "view" | "enum" | "constraint"
  | "data-migration" | "extension" | "destructive";

export type RollbackRisk = "low" | "medium" | "high" | "critical";
export type ReleaseConsequence = "additive" | "mutative" | "destructive" | "policy-only";
export type DataSensitivity = "none" | "low" | "medium" | "high";
export type TenancyImpact = "none" | "added" | "modified" | "removed";

export interface MigrationEntry {
  readonly ordinal: number;
  readonly filename: string;
  readonly timestamp: string;
  readonly category: MigrationCategory;
  readonly boundedContext: string;
  readonly rollbackRisk: RollbackRisk;
  readonly releaseConsequence: ReleaseConsequence;
  readonly dataSensitivity: DataSensitivity;
  readonly tenancyImpact: TenancyImpact;
  readonly destructive: boolean;
  readonly hasRls: boolean;
  readonly tablesAffected: readonly string[];
  readonly description: string;
}

export const MIGRATION_REGISTRY: readonly MigrationEntry[] = [
${entries.map(e => `  { ordinal: ${e.ordinal}, filename: ${JSON.stringify(e.filename)}, timestamp: "${e.timestamp}", category: "${e.category}", boundedContext: "${e.boundedContext}", rollbackRisk: "${e.rollbackRisk}", releaseConsequence: "${e.releaseConsequence}", dataSensitivity: "${e.dataSensitivity}", tenancyImpact: "${e.tenancyImpact}", destructive: ${e.destructive}, hasRls: ${e.hasRls}, tablesAffected: ${JSON.stringify(e.tablesAffected)}, description: ${JSON.stringify(e.description)} },`).join("\n")}
] as const;

export function getMigrationsByCategory(category: MigrationCategory): readonly MigrationEntry[] {
  return MIGRATION_REGISTRY.filter(m => m.category === category);
}
export function getMigrationsForTable(table: string): readonly MigrationEntry[] {
  return MIGRATION_REGISTRY.filter(m => m.tablesAffected.includes(table));
}
export function getMigrationsByContext(boundedContext: string): readonly MigrationEntry[] {
  return MIGRATION_REGISTRY.filter(m => m.boundedContext === boundedContext);
}
export function getDestructiveMigrations(): readonly MigrationEntry[] {
  return MIGRATION_REGISTRY.filter(m => m.destructive);
}
export function getMigrationsByRollbackRisk(risk: RollbackRisk): readonly MigrationEntry[] {
  return MIGRATION_REGISTRY.filter(m => m.rollbackRisk === risk);
}
export function getMigrationCount(): number { return MIGRATION_REGISTRY.length; }

export const MIGRATION_STATS = {
  total: ${entries.length},
  destructive: ${entries.filter(e => e.destructive).length},
  withRls: ${entries.filter(e => e.hasRls).length},
} as const;
`;

fs.writeFileSync("src/lib/db/migration-registry.ts", tsOut);

// JSON envelope
writeJsonOutput("generated/migration-registry.json", envelope("1.0.0", {
  totalMigrations: entries.length,
  destructive: entries.filter(e => e.destructive).length,
  withRls: entries.filter(e => e.hasRls).length,
  entries,
}));

console.log(`✅ generate-migration-registry: ${entries.length} migrations`);
console.log(`   Destructive: ${entries.filter(e => e.destructive).length} | With RLS: ${entries.filter(e => e.hasRls).length}`);
