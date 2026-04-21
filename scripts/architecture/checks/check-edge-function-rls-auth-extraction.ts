#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Edge Function RLS/Auth Guard Extraction & Validation
//
// Scans every edge function index.ts for auth patterns (JWT checks,
// admin role guards, service-role usage, RLS-dependent queries) and
// cross-references against the canonical auth-map and registry.
// Flags functions where declared auth requirements are not enforced
// in code, or where DB writes lack RLS-safe user scoping.
// ═══════════════════════════════════════════════════════════════

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { ViolationCollector, writeJsonOutput, scanDirShallow } from "../lib/utils";
import { EDGE_FUNCTION_AUTH_MAP } from "../../../src/lib/backend-topology/edge-function-auth-map";

const vc = new ViolationCollector();
const FUNCTIONS_DIR = "supabase/functions";
const OUT_PATH = "generated/edge-function-rls-auth-extraction.json";

// ── Pattern definitions ────────────────────────────────────────

interface AuthPattern {
  name: string;
  regex: RegExp;
  implies: "jwt" | "admin-role" | "service-role" | "anon" | "api-key" | "webhook-secret";
}

const AUTH_PATTERNS: AuthPattern[] = [
  { name: "jwt-getUser", regex: /supabase\.auth\.getUser\s*\(/g, implies: "jwt" },
  { name: "jwt-header-extract", regex: /authorization.*bearer/gi, implies: "jwt" },
  { name: "jwt-verify", regex: /jwtVerify|verifyJwt|jwt\.verify/gi, implies: "jwt" },
  { name: "admin-role-check", regex: /has_role\s*\(|role.*admin|adminOnly|isAdmin/gi, implies: "admin-role" },
  { name: "service-role-key", regex: /SUPABASE_SERVICE_ROLE_KEY|service_role/gi, implies: "service-role" },
  { name: "api-key-check", regex: /x-api-key|apiKey.*header/gi, implies: "api-key" },
  { name: "webhook-secret", regex: /webhook.secret|x-webhook-signature|hmac/gi, implies: "webhook-secret" },
];

interface DbWritePattern {
  name: string;
  regex: RegExp;
}

const DB_WRITE_PATTERNS: DbWritePattern[] = [
  { name: "insert", regex: /\.insert\s*\(/g },
  { name: "update", regex: /\.update\s*\(/g },
  { name: "delete", regex: /\.delete\s*\(/g },
  { name: "upsert", regex: /\.upsert\s*\(/g },
  { name: "rpc", regex: /\.rpc\s*\(/g },
];

const USER_SCOPING_PATTERNS = [
  /user_id/gi,
  /auth\.uid\(\)/g,
  /user\.id/g,
  /userId/g,
];

// ── Extraction ─────────────────────────────────────────────────

interface FunctionAuthTrace {
  functionName: string;
  filePath: string;
  declaredAuth: string | null;
  declaredAdminOnly: boolean;
  detectedPatterns: string[];
  detectedImplications: string[];
  dbWrites: string[];
  hasUserScoping: boolean;
  issues: string[];
}

const traces: FunctionAuthTrace[] = [];
const functionDirs = scanDirShallow(FUNCTIONS_DIR).filter(d => !d.startsWith("_"));

for (const fnName of functionDirs) {
  const indexPath = join(FUNCTIONS_DIR, fnName, "index.ts");
  if (!existsSync(indexPath)) continue;

  const content = readFileSync(indexPath, "utf-8");
  const authEntry = EDGE_FUNCTION_AUTH_MAP[fnName] ?? null;

  const detectedPatterns: string[] = [];
  const detectedImplications = new Set<string>();

  for (const pat of AUTH_PATTERNS) {
    if (pat.regex.test(content)) {
      detectedPatterns.push(pat.name);
      detectedImplications.add(pat.implies);
      pat.regex.lastIndex = 0;
    }
  }

  const dbWrites: string[] = [];
  for (const wp of DB_WRITE_PATTERNS) {
    const matches = content.match(wp.regex);
    if (matches) {
      dbWrites.push(`${wp.name}(×${matches.length})`);
    }
  }

  const hasUserScoping = USER_SCOPING_PATTERNS.some(p => p.test(content));
  // Reset lastIndex
  USER_SCOPING_PATTERNS.forEach(p => { p.lastIndex = 0; });

  const issues: string[] = [];

  // ── Issue detection ────────────────────────────────────────

  // 1. Declared JWT but no JWT pattern found in code
  if (authEntry?.auth === "jwt" && !detectedImplications.has("jwt")) {
    issues.push("MISSING_JWT_CHECK: Declared as JWT-auth but no JWT validation found in code");
    vc.add(indexPath, "missing-jwt-check", `${fnName}: declared JWT auth but no JWT validation in code`);
  }

  // 2. Declared adminOnly but no admin role check
  if (authEntry?.adminOnly && !detectedImplications.has("admin-role")) {
    issues.push("MISSING_ADMIN_GUARD: Declared adminOnly but no admin role check found");
    vc.add(indexPath, "missing-admin-guard", `${fnName}: declared adminOnly but no role check in code`);
  }

  // 3. DB writes without user scoping (when user context is required)
  if (authEntry?.requiresUserContext && dbWrites.length > 0 && !hasUserScoping) {
    issues.push("UNSCOPED_DB_WRITE: DB writes detected without user_id scoping in user-context function");
    vc.add(indexPath, "unscoped-db-write", `${fnName}: DB writes without user scoping`, "warning");
  }

  // 4. No auth map entry at all
  if (!authEntry) {
    issues.push("NO_AUTH_MAP_ENTRY: Function not declared in edge-function-auth-map");
    vc.add(indexPath, "no-auth-map", `${fnName}: missing from EDGE_FUNCTION_AUTH_MAP`, "warning");
  }

  // 5. Service-role usage in non-service-role function
  if (authEntry?.auth !== "service-role" && detectedImplications.has("service-role") && !detectedImplications.has("jwt")) {
    issues.push("SERVICE_ROLE_LEAK: Uses service-role key without JWT validation");
    vc.add(indexPath, "service-role-leak", `${fnName}: service-role usage without JWT gate`);
  }

  traces.push({
    functionName: fnName,
    filePath: indexPath,
    declaredAuth: authEntry?.auth ?? null,
    declaredAdminOnly: authEntry?.adminOnly ?? false,
    detectedPatterns,
    detectedImplications: [...detectedImplications],
    dbWrites,
    hasUserScoping,
    issues,
  });
}

// ── Summary ────────────────────────────────────────────────────

const totalFunctions = traces.length;
const functionsWithIssues = traces.filter(t => t.issues.length > 0);
const coverageByAuth: Record<string, number> = {};
for (const t of traces) {
  const key = t.declaredAuth ?? "unmapped";
  coverageByAuth[key] = (coverageByAuth[key] ?? 0) + 1;
}

writeJsonOutput(OUT_PATH, {
  generatedAt: new Date().toISOString(),
  gate: "edge-function-rls-auth-extraction",
  ok: vc.errors.length === 0,
  totalFunctions,
  functionsWithIssues: functionsWithIssues.length,
  errorCount: vc.errors.length,
  warningCount: vc.warnings.length,
  coverageByAuth,
  traces,
});

vc.report("check-edge-function-rls-auth-extraction");
if (vc.errors.length > 0) {
  console.log(`\n❌ ${vc.errors.length} auth/RLS enforcement errors found`);
  process.exit(1);
} else {
  console.log(`✅ All ${totalFunctions} edge functions pass auth/RLS extraction (${vc.warnings.length} warnings)`);
}