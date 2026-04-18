#!/usr/bin/env -S deno run -A
// Validation: outcome_tracked dispatches should have reflection within SLA.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SLA_HOURS = Number(Deno.env.get("BRD_L7_REFLECTION_SLA_HOURS") ?? "72");
const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL") ?? Deno.env.get("SUPABASE_URL");
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
if (!SUPABASE_URL || !SERVICE_KEY) Deno.exit(2);
const sb = createClient(SUPABASE_URL, SERVICE_KEY);

const cutoff = new Date(Date.now() - SLA_HOURS * 3600 * 1000).toISOString();
const { data } = await sb
  .from("boardroom_followthrough_dispatches")
  .select("id, state, updated_at")
  .eq("state", "outcome_tracked")
  .lt("updated_at", cutoff);

const stale = data ?? [];
const totalReflectedQ = await sb
  .from("boardroom_followthrough_dispatches")
  .select("id", { count: "exact", head: true })
  .in("state", ["reflected", "closed"]);

const result = {
  generatedAt: new Date().toISOString(),
  slaHours: SLA_HOURS,
  staleAwaitingReflection: stale.length,
  totalReflected: totalReflectedQ.count ?? 0,
  status: stale.length === 0 ? "GREEN" : stale.length < 3 ? "AMBER" : "RED",
};
await Deno.mkdir("generated/boardroom-layer7-closure", { recursive: true });
await Deno.writeTextFile(
  "generated/boardroom-layer7-closure/reflection-coverage.json",
  JSON.stringify(result, null, 2),
);
console.log(`[layer7-reflection] status=${result.status} stale=${stale.length}`);
Deno.exit(result.status === "RED" ? 1 : 0);
