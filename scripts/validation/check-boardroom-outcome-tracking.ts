#!/usr/bin/env -S deno run -A
// Validation: every executed dispatch has a paired outcome record.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL") ?? Deno.env.get("SUPABASE_URL");
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
if (!SUPABASE_URL || !SERVICE_KEY) Deno.exit(2);
const sb = createClient(SUPABASE_URL, SERVICE_KEY);

const { data: execs } = await sb
  .from("boardroom_followthrough_dispatches")
  .select("id, state, outcome_record_id")
  .in("state", ["executed", "receipt_recorded", "outcome_pending", "outcome_tracked", "reflected", "closed"]);

const missing = (execs ?? []).filter((r) => !r.outcome_record_id);
const result = {
  generatedAt: new Date().toISOString(),
  totalExecuted: execs?.length ?? 0,
  missingOutcome: missing.length,
  status: missing.length === 0 ? "GREEN" : missing.length < 5 ? "AMBER" : "RED",
};
await Deno.mkdir("generated/boardroom-layer7-closure", { recursive: true });
await Deno.writeTextFile(
  "generated/boardroom-layer7-closure/outcome-coverage.json",
  JSON.stringify(result, null, 2),
);
console.log(`[layer7-outcome] status=${result.status} missing=${missing.length}`);
Deno.exit(result.status === "GREEN" ? 0 : 1);
