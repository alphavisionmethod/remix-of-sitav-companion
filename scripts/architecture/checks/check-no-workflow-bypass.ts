#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — No Workflow Bypass Check (Phase 23.E)
// Direct writes to workflow_runs are only allowed inside
// workflow-execute, workflow-repair, workflow-replay, and
// workflow-stuck-detector edge functions.
// ═══════════════════════════════════════════════════════════════
import * as fs from "fs";
import * as path from "path";
import { ViolationCollector } from "../lib/utils";

const vc = new ViolationCollector();
const ALLOWED = new Set([
  "supabase/functions/workflow-execute/index.ts",
  "supabase/functions/workflow-repair/index.ts",
  "supabase/functions/workflow-replay/index.ts",
  "supabase/functions/workflow-stuck-detector/index.ts",
]);

function walk(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist") continue;
      walk(p, out);
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      out.push(p);
    }
  }
  return out;
}

const files = [...walk("src"), ...walk("supabase/functions")];
const RE = /from\s*\(\s*["']workflow_runs["']\s*\)\s*\.\s*insert/;

for (const f of files) {
  const norm = f.replace(/\\/g, "/");
  if (ALLOWED.has(norm)) continue;
  if (f.includes(".test.") || f.includes("__tests__")) continue;
  const src = fs.readFileSync(f, "utf-8");
  if (RE.test(src)) {
    vc.add(norm, "workflow-bypass", "Direct insert into workflow_runs outside canonical runner");
  }
}

console.log(`  🔒 Workflow bypass scan: ${files.length} files, ${vc.errors.length} violations`);
vc.report("check-no-workflow-bypass");
vc.exitIfErrors();
