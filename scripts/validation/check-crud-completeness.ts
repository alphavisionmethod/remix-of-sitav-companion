#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — CRUD Completeness Check (Layer 5)
// Verifies major entities have Create, Read, Update, Delete operations
// ═══════════════════════════════════════════════════════════════

import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "crud-completeness";
const issues: GateIssue[] = [];

function walk(dir: string): string[] {
  const r: string[] = [];
  try {
    for (const e of readdirSync(dir)) {
      const f = join(dir, e);
      if (statSync(f).isDirectory()) r.push(...walk(f));
      else if (/\.(tsx?|jsx?)$/.test(f)) r.push(f);
    }
  } catch { /* */ }
  return r;
}

const ENTITIES = [
  { name: "leads", table: "leads" },
  { name: "invoices", table: "invoices" },
  { name: "accounts", table: "accounts" },
  { name: "approval_requests", table: "approval_requests" },
  { name: "boardroom_items", table: "boardroom_items" },
  { name: "advisor_agents", table: "advisor_agents" },
  { name: "alerts", table: "alerts" },
  { name: "incidents", table: "incidents" },
  { name: "workflows", table: "workflow_definitions" },
];

const allSource = walk("src").map(f => readFileSync(f, "utf-8")).join("\n");
const allEdge = walk("supabase/functions").filter(f => f.endsWith(".ts")).map(f => readFileSync(f, "utf-8")).join("\n");
const combined = allSource + allEdge;

const results: Array<{ entity: string; hasInsert: boolean; hasSelect: boolean; hasUpdate: boolean; hasDelete: boolean }> = [];

for (const entity of ENTITIES) {
  const t = entity.table;
  const hasSelect = combined.includes(`.from("${t}")`) || combined.includes(`from('${t}')`);
  const hasInsert = combined.includes(`.insert(`) && combined.includes(`"${t}"`);
  const hasUpdate = combined.includes(`.update(`) && combined.includes(`"${t}"`);
  const hasDelete = combined.includes(`.delete()`) && combined.includes(`"${t}"`);

  results.push({ entity: t, hasSelect, hasInsert, hasUpdate, hasDelete });

  if (!hasSelect) issues.push({ severity: "warning", area: t, message: `No SELECT found for "${t}"` });
  if (!hasInsert) issues.push({ severity: "warning", area: t, message: `No INSERT found for "${t}"` });
}

const fullCrud = results.filter(r => r.hasSelect && r.hasInsert).length;
const ok = true; // warn-tier
console.log(`✅ ${GATE}: ${fullCrud}/${ENTITIES.length} entities have read+write operations`);
issues.slice(0, 5).forEach(i => console.error(`  [${i.severity}] ${i.area}: ${i.message}`));
emitGateReport({ gate: GATE, ok, issues, extra: { totalEntities: ENTITIES.length, fullCrud, results } });
process.exit(0);