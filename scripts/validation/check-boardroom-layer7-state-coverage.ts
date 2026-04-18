#!/usr/bin/env -S deno run -A
// ═══════════════════════════════════════════════════════════════
// Validation: every dispatch past APPROVED reaches a terminal
// state (closed/reflected/failed) within SLA, otherwise reported.
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SLA_HOURS = Number(Deno.env.get("BRD_L7_SLA_HOURS") ?? "24");
const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL") ?? Deno.env.get("SUPABASE_URL");
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("missing supabase env");
  Deno.exit(2);
}
const sb = createClient(SUPABASE_URL, SERVICE_KEY);

const cutoff = new Date(Date.now() - SLA_HOURS * 60 * 60 * 1000).toISOString();
const { data, error } = await sb
  .from("boardroom_followthrough_dispatches")
  .select("id, state, created_at, updated_at, boardroom_item_id")
  .lt("created_at", cutoff)
  .not("state", "in", '("closed","reflected","failed")');

if (error) {
  console.error("query failed", error.message);
  Deno.exit(2);
}

const stuck = data ?? [];
const result = {
  generatedAt: new Date().toISOString(),
  slaHours: SLA_HOURS,
  stuckCount: stuck.length,
  stuck,
  status: stuck.length === 0 ? "GREEN" : stuck.length < 5 ? "AMBER" : "RED",
};

await Deno.mkdir("generated/boardroom-layer7-closure", { recursive: true });
await Deno.writeTextFile(
  "generated/boardroom-layer7-closure/state-coverage.json",
  JSON.stringify(result, null, 2),
);

console.log(`[layer7-state-coverage] status=${result.status} stuck=${stuck.length}`);
Deno.exit(stuck.length === 0 ? 0 : 1);
