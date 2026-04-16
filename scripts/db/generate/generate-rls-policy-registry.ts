#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Generate RLS Policy Registry (LIVE)
// Reads live pg_policies + information_schema.columns and produces:
//   - src/lib/db/rls-policy-registry.ts
//   - src/lib/db/tenancy-boundary-map.ts
//   - generated/rls-policy-registry.json
//   - generated/tenancy-boundary-map.json
// ═══════════════════════════════════════════════════════════════
import * as fs from "fs";
import { execSync } from "child_process";
import { writeJsonOutput, envelope } from "../../architecture/lib/utils";

if (!process.env.PGHOST) {
  console.warn("⚠️  PGHOST not set — cannot read live pg_policies. Skipping (registry retains last-generated state).");
  process.exit(0);
}

const tableSql = `SELECT tablename, COALESCE(c.column_name, ''), (SELECT COUNT(*) FROM pg_policies p WHERE p.schemaname='public' AND p.tablename=t.tablename) FROM pg_tables t LEFT JOIN information_schema.columns c ON c.table_schema='public' AND c.table_name=t.tablename AND c.column_name IN ('user_id','actor_user_id','owner_id','org_id','tenant_id') WHERE t.schemaname='public' ORDER BY tablename`;
const polSql = `SELECT tablename, policyname, cmd, COALESCE(qual,''), COALESCE(with_check,'') FROM pg_policies WHERE schemaname='public' ORDER BY tablename, policyname`;

const tableLines = execSync(`psql -A -t -F'|' -c "${tableSql}"`, { encoding: "utf-8" }).split("\n").filter(Boolean);
const policyLines = execSync(`psql -A -t -F'|' -c "${polSql}"`, { encoding: "utf-8" }).split("\n").filter(Boolean);

interface TableInfo { name: string; tenancyCol: string; }
const tables = new Map<string, TableInfo>();
for (const line of tableLines) {
  const [name, col] = line.split("|");
  if (!tables.has(name)) tables.set(name, { name, tenancyCol: col || "" });
  else if (!tables.get(name)!.tenancyCol && col) tables.get(name)!.tenancyCol = col;
}

interface PolicyInfo { table: string; name: string; cmd: string; qual: string; check: string; }
const policies: PolicyInfo[] = policyLines.map(l => {
  const [table, name, cmd, qual, check] = l.split("|");
  return { table, name, cmd, qual: qual || "", check: check || "" };
});

const polByTable = new Map<string, PolicyInfo[]>();
for (const p of policies) {
  if (!polByTable.has(p.table)) polByTable.set(p.table, []);
  polByTable.get(p.table)!.push(p);
}

function classify(pols: PolicyInfo[]): string {
  if (pols.length === 0) return "no_policies";
  const cmds = new Set(pols.map(p => p.cmd.toUpperCase()));
  const allText = pols.map(p => p.qual + " " + p.check).join(" ").toLowerCase();
  const hasSel = cmds.has("SELECT") || cmds.has("ALL");
  const hasIns = cmds.has("INSERT") || cmds.has("ALL");
  const hasUpd = cmds.has("UPDATE") || cmds.has("ALL");
  const hasDel = cmds.has("DELETE") || cmds.has("ALL");
  if (allText.includes("has_admin_permission")) return "admin_permission";
  if (allText.includes("has_role(") && allText.includes("admin")) return "admin_role";
  if (allText.includes("is_org_member") || allText.includes("org_id")) return "org_membership";
  if (allText.includes("is_tenant_member") || allText.includes("tenant_id")) return "tenant_membership";
  if (allText.includes("actor_user_id")) return "actor_user_id_match";
  if (allText.includes("owner_id")) return "owner_id_match";
  if (allText.includes("user_id")) return "user_id_match";
  if (hasSel && !hasIns && !hasUpd && !hasDel) return "read_only";
  if (hasIns && hasSel && !hasUpd && !hasDel) return "append_only";
  if (allText.includes("true") && hasSel && hasIns) return "public_read";
  return "authenticated_all";
}

const rlsEntries = Array.from(tables.values()).map(t => {
  const pols = polByTable.get(t.name) ?? [];
  const cmds = new Set(pols.map(p => p.cmd.toUpperCase()));
  return {
    name: t.name,
    pattern: classify(pols),
    selectPolicy: cmds.has("SELECT") || cmds.has("ALL"),
    insertPolicy: cmds.has("INSERT") || cmds.has("ALL"),
    updatePolicy: cmds.has("UPDATE") || cmds.has("ALL"),
    deletePolicy: cmds.has("DELETE") || cmds.has("ALL"),
    policyCount: pols.length,
    tenancyCol: t.tenancyCol,
  };
}).sort((a, b) => a.name.localeCompare(b.name));

const RlsPatterns = ["user_id_match","owner_id_match","actor_user_id_match","org_membership","tenant_membership","admin_role","admin_permission","public_read","authenticated_all","read_only","append_only","service_role_only","no_policies"];

const rlsOut = `// ═══════════════════════════════════════════════════════════════
// SITA OS — RLS Policy Registry (AUTO-GENERATED)
// Source: live pg_policies. Regenerate via:
//   npx tsx scripts/db/generate/generate-rls-policy-registry.ts
// Last generated: ${new Date().toISOString()}
// Tables: ${rlsEntries.length} | Policies: ${policies.length}
// ═══════════════════════════════════════════════════════════════

export type RlsPattern =
  | "user_id_match" | "owner_id_match" | "actor_user_id_match"
  | "org_membership" | "tenant_membership" | "admin_role" | "admin_permission"
  | "public_read" | "authenticated_all" | "read_only" | "append_only"
  | "service_role_only" | "no_policies";

export interface RlsPolicyEntry {
  readonly pattern: RlsPattern;
  readonly selectPolicy: boolean;
  readonly insertPolicy: boolean;
  readonly updatePolicy: boolean;
  readonly deletePolicy: boolean;
  readonly policyCount: number;
  readonly tenancyColumn: string | null;
}

export const RLS_POLICY_REGISTRY: Readonly<Record<string, RlsPolicyEntry>> = {
${rlsEntries.map(e => `  ${JSON.stringify(e.name)}: { pattern: "${e.pattern}", selectPolicy: ${e.selectPolicy}, insertPolicy: ${e.insertPolicy}, updatePolicy: ${e.updatePolicy}, deletePolicy: ${e.deletePolicy}, policyCount: ${e.policyCount}, tenancyColumn: ${e.tenancyCol ? JSON.stringify(e.tenancyCol) : "null"} },`).join("\n")}
};

const DEFAULT_USER_ID_POLICY: RlsPolicyEntry = { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" };

export function getRlsPolicyForTable(name: string): RlsPolicyEntry { return RLS_POLICY_REGISTRY[name] ?? DEFAULT_USER_ID_POLICY; }
export function getTablesByRlsPattern(pattern: RlsPattern): string[] { return Object.entries(RLS_POLICY_REGISTRY).filter(([, e]) => e.pattern === pattern).map(([n]) => n); }
export function getAppendOnlyTables(): string[] { return getTablesByRlsPattern("append_only"); }
export function getReadOnlyTables(): string[] { return getTablesByRlsPattern("read_only"); }
export function getTablesWithoutPolicies(): string[] { return getTablesByRlsPattern("no_policies"); }

export const RLS_STATS = {
  totalTables: ${rlsEntries.length},
  totalPolicies: ${policies.length},
  byPattern: {
${RlsPatterns.map(p => `    "${p}": ${rlsEntries.filter(e => e.pattern === p).length},`).join("\n")}
  },
} as const;
`;
fs.writeFileSync("src/lib/db/rls-policy-registry.ts", rlsOut);

const tenancyEntries = Array.from(tables.values()).map(t => {
  let model: string;
  if (!t.tenancyCol) model = "global";
  else if (t.tenancyCol === "user_id") model = "user_id";
  else if (t.tenancyCol === "actor_user_id") model = "actor_user_id";
  else if (t.tenancyCol === "owner_id") model = "owner_id";
  else if (t.tenancyCol === "org_id") model = "org_id";
  else if (t.tenancyCol === "tenant_id") model = "tenant_id";
  else model = "user_id";
  return { name: t.name, model, tenantKey: t.tenancyCol || null };
}).sort((a, b) => a.name.localeCompare(b.name));

const tenancyOut = `// ═══════════════════════════════════════════════════════════════
// SITA OS — Tenancy Boundary Map (AUTO-GENERATED)
// Source: live information_schema.columns
// Last generated: ${new Date().toISOString()}
// ═══════════════════════════════════════════════════════════════

export type TenancyModel = "user_id" | "org_id" | "tenant_id" | "owner_id" | "global" | "actor_user_id";

export interface TenancyBoundaryEntry {
  readonly model: TenancyModel;
  readonly tenantKey: string | null;
  readonly adminException: boolean;
  readonly serviceRoleException: boolean;
  readonly crossTenantPolicy: "deny" | "admin-only" | "service-role-only";
}

export const TENANCY_BOUNDARY_MAP: Readonly<Record<string, TenancyBoundaryEntry>> = {
${tenancyEntries.map(e => {
  const adminEx = e.model !== "global";
  const svcEx = e.model === "global" || e.name.includes("audit") || e.name.includes("log");
  const crossPolicy = e.model === "global" ? "admin-only" : "deny";
  return `  ${JSON.stringify(e.name)}: { model: "${e.model}", tenantKey: ${e.tenantKey ? JSON.stringify(e.tenantKey) : "null"}, adminException: ${adminEx}, serviceRoleException: ${svcEx}, crossTenantPolicy: "${crossPolicy}" },`;
}).join("\n")}
};

export function getTenancyForTable(name: string): TenancyModel { return TENANCY_BOUNDARY_MAP[name]?.model ?? "user_id"; }
export function getTenancyEntry(name: string): TenancyBoundaryEntry | undefined { return TENANCY_BOUNDARY_MAP[name]; }
export function getGlobalTables(): string[] { return Object.entries(TENANCY_BOUNDARY_MAP).filter(([, e]) => e.model === "global").map(([n]) => n); }
export function getTablesByTenancy(model: TenancyModel): string[] { return Object.entries(TENANCY_BOUNDARY_MAP).filter(([, e]) => e.model === model).map(([n]) => n); }

export const TENANCY_STATS = {
  total: ${tenancyEntries.length},
  byModel: {
    user_id: ${tenancyEntries.filter(e => e.model === "user_id").length},
    actor_user_id: ${tenancyEntries.filter(e => e.model === "actor_user_id").length},
    owner_id: ${tenancyEntries.filter(e => e.model === "owner_id").length},
    org_id: ${tenancyEntries.filter(e => e.model === "org_id").length},
    tenant_id: ${tenancyEntries.filter(e => e.model === "tenant_id").length},
    global: ${tenancyEntries.filter(e => e.model === "global").length},
  },
} as const;
`;
fs.writeFileSync("src/lib/db/tenancy-boundary-map.ts", tenancyOut);

writeJsonOutput("generated/rls-policy-registry.json", envelope("1.0.0", {
  totalTables: rlsEntries.length,
  totalPolicies: policies.length,
  entries: rlsEntries,
}));
writeJsonOutput("generated/tenancy-boundary-map.json", envelope("1.0.0", {
  total: tenancyEntries.length,
  entries: tenancyEntries,
}));

console.log(`✅ rls-policy-registry: ${rlsEntries.length} tables, ${policies.length} policies`);
console.log(`✅ tenancy-boundary-map: ${tenancyEntries.length} entries`);
