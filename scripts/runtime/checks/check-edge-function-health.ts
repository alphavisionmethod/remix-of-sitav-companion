#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Edge Function Health Checker
// Validates all edge functions have proper structure
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

const functionsDir = "supabase/functions";

// All 51 edge functions
const required = [
  "admin-ai-workforce-run", "admin-api", "admin-intelligence", "admin-users",
  "agent-executor", "agent-heartbeat", "agent-intelligence", "agent-scheduler",
  "agent-signal", "ai-gateway", "ai-health", "ambient-os-operations",
  "booking-manage", "brain-core", "cashflow-calculate", "chat-advisor",
  "connector-batch", "connector-discover", "connector-health", "connector-oauth",
  "connector-operations", "connector-proxy", "connector-transform",
  "cost-alert", "crm-sync", "device-telemetry", "ecosystem-operations",
  "event-processor", "file-ingestion", "gdpr-delete", "gdpr-export",
  "invoice-generate", "main", "msa-operations", "os-command", "os-status",
  "payment-process", "personal-brain", "provider-family-operations",
  "push-dispatch", "push-track", "revenue-caller", "runtime-probes",
  "scheduler-dispatch", "seed-user-data", "self-healing", "system-updates",
  "tax-estimate", "vapid-public-key", "verification-recorder",
];

interface FnStatus { name: string; hasIndex: boolean; hasTest: boolean; lines: number }
const statuses: FnStatus[] = [];

for (const fn of required) {
  const dir = path.join(functionsDir, fn);
  const indexPath = path.join(dir, "index.ts");
  const testPath1 = path.join(dir, "index_test.ts");
  const testPath2 = path.join(dir, "index.test.ts");
  const hasIndex = fs.existsSync(indexPath);
  const hasTest = fs.existsSync(testPath1) || fs.existsSync(testPath2);
  const lines = hasIndex ? fs.readFileSync(indexPath, "utf-8").split("\n").length : 0;
  statuses.push({ name: fn, hasIndex, hasTest, lines });
}

console.log(`\n⚡ Edge Function Health Report — ${required.length} functions\n`);

const withIndex = statuses.filter(s => s.hasIndex);
const withTest = statuses.filter(s => s.hasTest);
const missing = statuses.filter(s => !s.hasIndex);

for (const s of statuses) {
  const status = s.hasIndex && s.hasTest ? "✅" : s.hasIndex ? "⚠️" : "❌";
  console.log(`  ${status} ${s.name} — ${s.lines} lines, test: ${s.hasTest ? "yes" : "missing"}`);
}

console.log(`\n  Summary: ${withIndex.length}/${required.length} have index.ts, ${withTest.length}/${required.length} have tests`);

if (missing.length > 0) {
  console.log(`\n  ❌ Missing index.ts: ${missing.map(s => s.name).join(", ")}`);
}

const allHealthy = statuses.every(s => s.hasIndex);
if (!allHealthy) process.exit(1);
console.log(`\n  All ${required.length} edge functions present ✅\n`);
