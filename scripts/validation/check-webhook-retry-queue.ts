#!/usr/bin/env node
/* eslint-disable no-console */
// Phase 9 hardening — webhook delivery must have retry queue + DLQ.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { emitGateReport } from "./_lib/emit-gate-report";

const dir = "supabase/migrations";
const blob = (existsSync(dir) ? readdirSync(dir).filter(f => f.endsWith(".sql")) : [])
  .map(f => readFileSync(`${dir}/${f}`, "utf-8")).join("\n");

const hasTable = /webhook_retry_queue/.test(blob);
const hasDlq = /'dlq'/.test(blob);
const hasProcessor = existsSync("supabase/functions/webhook-retry-processor/index.ts");
const ok = hasTable && hasDlq && hasProcessor;
console.log(`${ok ? "✅" : "❌"} webhook-retry-queue: table=${hasTable} dlq=${hasDlq} processor=${hasProcessor}`);
emitGateReport({
  gate: "webhook-retry-queue", ok,
  issues: ok ? [] : [{ severity: "error" as const, area: "webhooks", message: "retry/DLQ pipeline incomplete" }],
});
process.exit(ok ? 0 : 1);
