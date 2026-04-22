#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Unified RLS/Auth ↔ Mutation Cross-Reference Validator
//
// Combines auth extraction, mutation traceability, and RLS policy
// registry to flag traces where:
//   1. An edge function writes to a table that lacks RLS for that op
//   2. An edge function uses anon/no-auth but writes to user-scoped tables
//   3. A function uses service-role to bypass RLS without admin guard
//   4. DB writes target tables with no RLS policies at all
//   5. Auth guard is missing for functions that touch admin-only tables
// ═══════════════════════════════════════════════════════════════

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { ViolationCollector, writeJsonOutput, scanDirShallow } from "../lib/utils";
import { EDGE_FUNCTION_AUTH_MAP } from "../../../src/lib/backend-topology/edge-function-auth-map";
import { RLS_POLICY_REGISTRY } from "../../../src/lib/db/rls-policy-registry";

const vc = new ViolationCollector();
const FUNCTIONS_DIR = "supabase/functions";
const OUT_PATH = "generated/edge-function-rls-mutation-crossref.json";

// ── Pattern extraction ─────────────────────────────────────────

type OpKind = "insert" | "update" | "delete" | "upsert" | "select";

interface DetectedOp {
  table: string;
  op: OpKind;
  line: number;
}

function extractOps(content: string): DetectedOp[] {
  const ops: DetectedOp[] = [];
  const pat = /\.from\s*\(\s*["'`]([a-z_][a-z0-9_]*)["'`]\s*\)\s*\.\s*(select|insert|update|delete|upsert)/g;
  let m: RegExpExecArray | null;
  while ((m = pat.exec(content)) !== null) {
    const line = content.substring(0, m.index).split("\n").length;
    ops.push({ table: m[1], op: m[2] as OpKind, line });
  }
  return ops;
}

function detectAuthPatterns(content: string) {
  const has = (r: RegExp) => { r.lastIndex = 0; const v = r.test(content); r.lastIndex = 0; return v; };
  return {
    jwt: has(/supabase\.auth\.getUser\s*\(/) || has(/authorization.*bearer/i) || has(/getClaims\s*\(/),
    adminRole: has(/has_role\s*\(/) || has(/adminOnly/) || has(/isAdmin/),
    serviceRole: has(/SUPABASE_SERVICE_ROLE_KEY/) || has(/service_role/),
    webhookSecret: has(/webhook.secret/) || has(/x-webhook-signature/) || has(/hmac/i),
  };
}

const OP_TO_RLS: Record<OpKind, keyof typeof RLS_POLICY_REGISTRY[string]> = {
  select: "selectPolicy",
  insert: "insertPolicy",
  update: "updatePolicy",
  delete: "deletePolicy",
  upsert: "insertPolicy", // upsert needs at minimum insert
};

const ADMIN_RLS_PATTERNS = new Set(["admin_role", "admin_permission", "service_role_only"]);

// ── Scan ───────────────────────────────────────────────────────

interface CrossRefTrace {
  fn: string;
  authDeclared: string | null;
  authDetected: { jwt: boolean; adminRole: boolean; serviceRole: boolean; webhookSecret: boolean };
  ops: DetectedOp[];
  gaps: CrossRefGap[];
}

interface CrossRefGap {
  severity: "error" | "warning";
  code: string;
  detail: string;
  table?: string;
  op?: string;
  line?: number;
}

const traces: CrossRefTrace[] = [];
const fnDirs = scanDirShallow(FUNCTIONS_DIR).filter(d => !d.startsWith("_"));

for (const fnName of fnDirs) {
  const indexPath = join(FUNCTIONS_DIR, fnName, "index.ts");
  if (!existsSync(indexPath)) continue;

  const content = readFileSync(indexPath, "utf-8");
  const authMap = EDGE_FUNCTION_AUTH_MAP[fnName] ?? null;
  const authDetected = detectAuthPatterns(content);
  const ops = extractOps(content);
  const gaps: CrossRefGap[] = [];

  const writeOps = ops.filter(o => o.op !== "select");

  for (const op of ops) {
    const rls = RLS_POLICY_REGISTRY[op.table];

    // Gap 1: Table has no RLS at all
    if (!rls) {
      // Could be a system table or unmapped — warn
      gaps.push({
        severity: "warning",
        code: "UNKNOWN_TABLE_RLS",
        detail: `${fnName}: ${op.op} on '${op.table}' — table not in RLS registry`,
        table: op.table, op: op.op, line: op.line,
      });
      continue;
    }

    if (rls.pattern === "no_policies") {
      gaps.push({
        severity: "error",
        code: "NO_RLS_ON_TARGET",
        detail: `${fnName}: ${op.op} on '${op.table}' which has NO RLS policies`,
        table: op.table, op: op.op, line: op.line,
      });
      vc.add(indexPath, "no-rls-target", `${fnName}: ${op.op} on '${op.table}' with no RLS`);
      continue;
    }

    // Gap 2: Operation not covered by RLS for that table
    const rlsField = OP_TO_RLS[op.op] as keyof typeof rls;
    if (rlsField && rls[rlsField] === false && op.op !== "select") {
      // Write op not covered by RLS policy
      if (!authDetected.serviceRole) {
        gaps.push({
          severity: "error",
          code: "MISSING_RLS_FOR_OP",
          detail: `${fnName}: ${op.op} on '${op.table}' but table has no ${op.op} RLS policy and function doesn't use service-role`,
          table: op.table, op: op.op, line: op.line,
        });
        vc.add(indexPath, "missing-rls-for-op", `${fnName}: ${op.op} on '${op.table}' — no RLS for this op`);
      }
    }

    // Gap 3: Admin table accessed without admin guard
    if (ADMIN_RLS_PATTERNS.has(rls.pattern) && !authDetected.adminRole && !authDetected.serviceRole) {
      gaps.push({
        severity: "error",
        code: "ADMIN_TABLE_NO_GUARD",
        detail: `${fnName}: accesses admin-only table '${op.table}' (pattern: ${rls.pattern}) without admin role check`,
        table: op.table, op: op.op, line: op.line,
      });
      vc.add(indexPath, "admin-table-no-guard", `${fnName}: admin table '${op.table}' accessed without guard`);
    }
  }

  // Gap 4: Writes exist but no JWT/auth check at all
  if (writeOps.length > 0 && !authDetected.jwt && !authDetected.serviceRole && !authDetected.webhookSecret) {
    if (authMap?.auth !== "none" && authMap?.auth !== "anon") {
      gaps.push({
        severity: "error",
        code: "WRITES_WITHOUT_AUTH",
        detail: `${fnName}: ${writeOps.length} DB write(s) without any auth check`,
      });
      vc.add(indexPath, "writes-without-auth", `${fnName}: DB writes without auth validation`);
    }
  }

  // Gap 5: Service-role bypass without admin guard
  if (authDetected.serviceRole && writeOps.length > 0 && !authDetected.adminRole && !authDetected.jwt) {
    gaps.push({
      severity: "error",
      code: "SERVICE_ROLE_UNGUARDED",
      detail: `${fnName}: uses service-role for writes without JWT or admin verification`,
    });
    vc.add(indexPath, "service-role-unguarded", `${fnName}: service-role writes without auth gate`);
  }

  traces.push({
    fn: fnName,
    authDeclared: authMap?.auth ?? null,
    authDetected,
    ops,
    gaps,
  });
}

// ── Op-level coverage matrix ──────────────────────────────────
// Per-table view: which ops (insert/update/delete/upsert/select) are
// covered by RLS policies, and which edge functions touch each op.
// Per-function view: for each function, which table×op pairs have
// RLS coverage and which are gaps.

const OPS: OpKind[] = ["select", "insert", "update", "delete", "upsert"];

interface TableOpCoverage {
  table: string;
  rlsPattern: string;
  policyCount: number;
  ops: Record<OpKind, {
    rlsCovered: boolean;
    functions: string[];
  }>;
  totalGaps: number;
}

interface FunctionOpCoverage {
  fn: string;
  tableOps: Array<{
    table: string;
    op: OpKind;
    rlsCovered: boolean;
    rlsPattern: string | null;
    usesServiceRole: boolean;
  }>;
  coveredCount: number;
  uncoveredCount: number;
  coveragePct: number;
}

// Build per-table coverage
const tableMap = new Map<string, TableOpCoverage>();

for (const t of traces) {
  for (const op of t.ops) {
    if (!tableMap.has(op.table)) {
      const rls = RLS_POLICY_REGISTRY[op.table];
      const entry: TableOpCoverage = {
        table: op.table,
        rlsPattern: rls?.pattern ?? "unknown",
        policyCount: rls?.policyCount ?? 0,
        ops: {
          select:  { rlsCovered: rls?.selectPolicy ?? false, functions: [] },
          insert:  { rlsCovered: rls?.insertPolicy ?? false, functions: [] },
          update:  { rlsCovered: rls?.updatePolicy ?? false, functions: [] },
          delete:  { rlsCovered: rls?.deletePolicy ?? false, functions: [] },
          upsert:  { rlsCovered: rls?.insertPolicy ?? false, functions: [] }, // upsert → insert
        },
        totalGaps: 0,
      };
      tableMap.set(op.table, entry);
    }
    const te = tableMap.get(op.table)!;
    if (!te.ops[op.op].functions.includes(t.fn)) {
      te.ops[op.op].functions.push(t.fn);
    }
  }
}

// Count gaps per table
for (const te of tableMap.values()) {
  for (const opKey of OPS) {
    const o = te.ops[opKey];
    if (o.functions.length > 0 && !o.rlsCovered) {
      te.totalGaps++;
    }
  }
}

const tableCoverage = [...tableMap.values()].sort((a, b) => b.totalGaps - a.totalGaps);

// Build per-function coverage
const fnCoverage: FunctionOpCoverage[] = traces.map(t => {
  const tableOps = t.ops.map(op => {
    const rls = RLS_POLICY_REGISTRY[op.table];
    const rlsField = OP_TO_RLS[op.op] as keyof typeof rls | undefined;
    const rlsCovered = rls && rlsField ? (rls[rlsField] as boolean) : false;
    return {
      table: op.table,
      op: op.op,
      rlsCovered,
      rlsPattern: rls?.pattern ?? null,
      usesServiceRole: t.authDetected.serviceRole,
    };
  });
  const covered = tableOps.filter(o => o.rlsCovered || o.usesServiceRole).length;
  const uncovered = tableOps.length - covered;
  return {
    fn: t.fn,
    tableOps,
    coveredCount: covered,
    uncoveredCount: uncovered,
    coveragePct: tableOps.length > 0 ? Math.round((covered / tableOps.length) * 100) : 100,
  };
}).sort((a, b) => a.coveragePct - b.coveragePct);

// ── Summary stats ──────────────────────────────────────────────

const total = traces.length;
const withGaps = traces.filter(t => t.gaps.length > 0);
const gapsByCode: Record<string, number> = {};
for (const t of withGaps) {
  for (const g of t.gaps) {
    gapsByCode[g.code] = (gapsByCode[g.code] ?? 0) + 1;
  }
}

const tablesWithGaps = tableCoverage.filter(t => t.totalGaps > 0);
const totalTableOpsTracked = tableCoverage.reduce(
  (s, t) => s + OPS.filter(o => t.ops[o].functions.length > 0).length, 0,
);
const totalTableOpsCovered = tableCoverage.reduce(
  (s, t) => s + OPS.filter(o => t.ops[o].functions.length > 0 && t.ops[o].rlsCovered).length, 0,
);
const overallCoveragePct = totalTableOpsTracked > 0
  ? Math.round((totalTableOpsCovered / totalTableOpsTracked) * 100) : 100;

writeJsonOutput(OUT_PATH, {
  generatedAt: new Date().toISOString(),
  gate: "edge-function-rls-mutation-crossref",
  ok: vc.errors.length === 0,
  totalFunctions: total,
  functionsWithGaps: withGaps.length,
  errorCount: vc.errors.length,
  warningCount: vc.warnings.length,
  gapsByCode,
  opLevelCoverage: {
    totalTablesTracked: tableCoverage.length,
    tablesWithOpGaps: tablesWithGaps.length,
    totalTableOpsTracked,
    totalTableOpsCovered,
    overallCoveragePct,
    perTable: tableCoverage,
    perFunction: fnCoverage,
  },
  traces: withGaps.map(t => ({
    fn: t.fn,
    authDeclared: t.authDeclared,
    authDetected: t.authDetected,
    opsCount: t.ops.length,
    gaps: t.gaps,
  })),
});

vc.report("check-edge-function-rls-mutation-crossref");

console.log(`\n📊 RLS↔Mutation Cross-Ref: ${total} functions scanned`);
console.log(`   Functions with gaps: ${withGaps.length}`);
console.log(`   Gap breakdown: ${JSON.stringify(gapsByCode)}`);

console.log(`\n📋 Op-Level RLS Coverage Matrix:`);
console.log(`   Tables tracked: ${tableCoverage.length} | With op-gaps: ${tablesWithGaps.length}`);
console.log(`   Table×Op pairs: ${totalTableOpsTracked} covered by RLS: ${totalTableOpsCovered} (${overallCoveragePct}%)`);

if (tablesWithGaps.length > 0) {
  console.log(`\n   ⚠️  Tables with uncovered ops (top 15):`);
  for (const t of tablesWithGaps.slice(0, 15)) {
    const missing = OPS.filter(o => t.ops[o].functions.length > 0 && !t.ops[o].rlsCovered);
    console.log(`     ${t.table} [${t.rlsPattern}] — missing: ${missing.join(", ")} — used by: ${
      [...new Set(missing.flatMap(o => t.ops[o].functions))].slice(0, 3).join(", ")
    }${missing.flatMap(o => t.ops[o].functions).length > 3 ? " …" : ""}`);
  }
}

const lowCoverageFns = fnCoverage.filter(f => f.coveragePct < 100).slice(0, 10);
if (lowCoverageFns.length > 0) {
  console.log(`\n   ⚠️  Functions with incomplete op-level RLS (top 10):`);
  for (const f of lowCoverageFns) {
    const uncov = f.tableOps.filter(o => !o.rlsCovered && !o.usesServiceRole);
    console.log(`     ${f.fn} — ${f.coveragePct}% covered — uncovered: ${
      uncov.map(o => `${o.table}.${o.op}`).slice(0, 4).join(", ")
    }${uncov.length > 4 ? " …" : ""}`);
  }
}

if (vc.errors.length > 0) {
  console.log(`\n❌ ${vc.errors.length} RLS/auth enforcement gaps detected`);
  process.exit(1);
} else {
  console.log(`\n✅ All edge function mutations have matching RLS/auth coverage (${vc.warnings.length} warnings)`);
}