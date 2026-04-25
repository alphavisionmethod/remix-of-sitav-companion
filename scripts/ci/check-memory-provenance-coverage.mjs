#!/usr/bin/env node
// Phase 5 CI gate: verify the memory_provenance migration & RPCs are
// present in source. (DB coverage is enforced by RLS + the indexer
// edge function itself; this static check catches accidental removal.)
import { readFileSync, readdirSync } from "node:fs";

const migDir = "supabase/migrations";
const files = readdirSync(migDir).filter((f) => f.endsWith(".sql"));
let hasTable = false;
let hasUsageRpc = false;
let hasEffectiveRpc = false;
for (const f of files) {
  const txt = readFileSync(`${migDir}/${f}`, "utf8");
  if (txt.includes("CREATE TABLE IF NOT EXISTS public.memory_provenance")) hasTable = true;
  if (txt.includes("FUNCTION public.record_memory_usage")) hasUsageRpc = true;
  if (txt.includes("FUNCTION public.effective_workspace_memories")) hasEffectiveRpc = true;
}

const errors = [];
if (!hasTable) errors.push("memory_provenance table migration missing");
if (!hasUsageRpc) errors.push("record_memory_usage RPC missing");
if (!hasEffectiveRpc) errors.push("effective_workspace_memories RPC missing");

if (errors.length) {
  console.error("[memory-provenance-coverage] FAIL\n  - " + errors.join("\n  - "));
  process.exit(1);
}
console.log("[memory-provenance-coverage] OK — table + 2 RPCs present");