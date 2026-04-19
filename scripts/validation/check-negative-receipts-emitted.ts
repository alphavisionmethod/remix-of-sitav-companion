#!/usr/bin/env node
/* eslint-disable no-console */
// Economic-Trust-Future Closure — negative receipts + structured refusals proof gate.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "negative-receipts-emitted";
const issues: GateIssue[] = [];

// Look for canonical refusal/receipt emission patterns in shared services.
const dirs = ["src/lib/services", "supabase/functions/_shared"];
let foundRefusal = false;
let foundReceipt = false;

function walk(dir: string) {
  if (!existsSync(dir)) return;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) { walk(p); continue; }
    if (!/\.(ts|tsx)$/.test(e.name)) continue;
    try {
      const src = readFileSync(p, "utf-8");
      if (/structured.?refusal|negative.?receipt|emitRefusal|refusalReceipt/i.test(src)) foundRefusal = true;
      if (/ai_receipt_records|ai_action_receipts|emitReceipt/.test(src)) foundReceipt = true;
    } catch { /* ignore */ }
  }
}
dirs.forEach(walk);

if (!foundRefusal) issues.push({ severity: "error", area: "refusal", message: "No structured-refusal emission pattern found in shared services" });
if (!foundReceipt) issues.push({ severity: "error", area: "receipt", message: "No receipt-emission pattern found in shared services" });

const ok = issues.length === 0;
console.log(`${ok ? "✅" : "❌"} ${GATE}: refusal=${foundRefusal} receipt=${foundReceipt}`);
emitGateReport({ gate: GATE, ok, issues, extra: { foundRefusal, foundReceipt } });
process.exit(ok ? 0 : 1);
