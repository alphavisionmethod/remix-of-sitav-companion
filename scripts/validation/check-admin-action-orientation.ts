#!/usr/bin/env node
/* eslint-disable no-console */
// Admin & Validation Closure — every AI Engineer board must contain ≥1 actionable element
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport } from "./_lib/emit-gate-report";

const ROOT = "src/pages/admin/ai-runtime";
const issues: Array<{ severity: "error" | "warning"; area: string; message: string }> = [];

function walk(dir: string): string[] {
  const out: string[] = [];
  let entries: string[] = [];
  try { entries = readdirSync(dir); } catch { return out; }
  for (const e of entries) {
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p));
    else if (e.endsWith(".tsx") && !e.startsWith("_")) out.push(p);
  }
  return out;
}

const files = walk(ROOT).filter((f) => !f.includes("/_shared/"));
let withAction = 0;

for (const f of files) {
  const src = readFileSync(f, "utf-8");
  const hasAction =
    /<Button\b/.test(src) ||
    /useNavigate\s*\(/.test(src) ||
    /<Link\b/.test(src) ||
    /supabase\.functions\.invoke\(/.test(src) ||
    /onClick=\{/.test(src);
  if (hasAction) withAction++;
  else issues.push({ severity: "error", area: f, message: "AI Engineer board has no actionable element" });
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: "admin-action-orientation", ok, issues, extra: { totalBoards: files.length, withAction } });
console.log(`${ok ? "✅" : "❌"} admin-action-orientation: ${withAction}/${files.length} boards action-oriented [BLOCK]`);
process.exit(ok ? 0 : 1);
