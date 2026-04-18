#!/usr/bin/env node
/* eslint-disable no-console */
// CRITICAL safety gate: ensure NO surface auto-applies policy drafts.
// Drafts must only ever be persisted, displayed, and decided upon.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport } from "./_lib/emit-gate-report.js";

const issues: { severity: "error" | "warning"; area: string; message: string }[] = [];

function walk(dir: string, acc: string[] = []): string[] {
  if (!existsSync(dir)) return acc;
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) {
      if (!["node_modules", ".git", "dist", "generated"].includes(e)) walk(p, acc);
    } else if (/\.(ts|tsx)$/.test(e)) acc.push(p);
  }
  return acc;
}

const files = [
  ...walk("supabase/functions/internal-agent-policy-architect"),
  ...walk("src/pages/admin/ai-runtime"),
];

const FORBIDDEN = [
  /supabase\.rpc\(\s*['"]execute_sql/,
  /supabase\.rpc\(\s*['"]exec_ddl/,
  /\bALTER\s+TABLE\b[\s\S]{0,200}\bENABLE\s+ROW\s+LEVEL\s+SECURITY\b/i,
];

for (const f of files) {
  const raw = readFileSync(f, "utf-8");
  // strip sql_preview string literals so heuristics don't trip on draft SQL
  const stripped = raw.replace(/sql_preview\s*:\s*[`'"][\s\S]*?[`'"]\s*,/g, "sql_preview: '<draft>',");
  for (const re of FORBIDDEN) {
    if (re.test(stripped)) {
      issues.push({
        severity: "error",
        area: "safety",
        message: `${f} contains forbidden DDL execution pattern (drafts must never auto-apply)`,
      });
    }
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
const path = emitGateReport({ gate: "policy-draft-never-auto-apply", ok, issues });
console.log(`${ok ? "✅" : "❌"} policy-draft-never-auto-apply → ${path}`);
process.exit(ok ? 0 : 1);
