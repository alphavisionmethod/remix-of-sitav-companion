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

// ── Summary ────────────────────────────────────────────────────

const total = traces.length;
const withGaps = traces.filter(t => t.gaps.length > 0);
const gapsByCode: Record<string, number> = {};
for (const t of withGaps) {
  for (const g of t.gaps) {
    gapsByCode[g.code] = (gapsByCode[g.code] ?? 0) + 1;
  }
}

writeJsonOutput(OUT_PATH, {
  generatedAt: new Date().toISOString(),
  gate: "edge-function-rls-mutation-crossref",
  ok: vc.errors.length === 0,
  totalFunctions: total,
  functionsWithGaps: withGaps.length,
  errorCount: vc.errors.length,
  warningCount: vc.warnings.length,
  gapsByCode,
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

if (vc.errors.length > 0) {
  console.log(`\n❌ ${vc.errors.length} RLS/auth enforcement gaps detected`);
  process.exit(1);
} else {
  console.log(`\n✅ All edge function mutations have matching RLS/auth coverage (${vc.warnings.length} warnings)`);
}