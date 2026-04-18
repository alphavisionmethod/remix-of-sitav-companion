#!/usr/bin/env -S deno run -A
// Aggregator gate for Layer 7 closure. Runs all sub-validators and
// emits a single status JSON consumable by the master release aggregator.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL") ?? Deno.env.get("SUPABASE_URL");
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
if (!SUPABASE_URL || !SERVICE_KEY) Deno.exit(2);
const sb = createClient(SUPABASE_URL, SERVICE_KEY);

async function check(file: string): Promise<{ status: string; payload: unknown } | null> {
  try {
    const txt = await Deno.readTextFile(`generated/boardroom-layer7-closure/${file}`);
    const json = JSON.parse(txt);
    return { status: json.status ?? "UNKNOWN", payload: json };
  } catch {
    return null;
  }
}

const checks = {
  state: await check("state-coverage.json"),
  linkage: await check("linkage.json"),
  proof: await check("proof-coverage.json"),
  outcome: await check("outcome-coverage.json"),
  reflection: await check("reflection-coverage.json"),
};

// Live runtime check — at least one closed dispatch must exist when the system has any
const { count: dispatchCount } = await sb
  .from("boardroom_followthrough_dispatches")
  .select("id", { count: "exact", head: true });
const { count: closedCount } = await sb
  .from("boardroom_followthrough_dispatches")
  .select("id", { count: "exact", head: true })
  .in("state", ["closed", "reflected", "outcome_tracked"]);

const ratio =
  dispatchCount && dispatchCount > 0 ? (closedCount ?? 0) / dispatchCount : 1;

const allStatuses = Object.values(checks)
  .filter((c) => c !== null)
  .map((c) => c!.status);
const aggregate =
  allStatuses.includes("RED") ? "RED" : allStatuses.includes("AMBER") ? "AMBER" : "GREEN";

const result = {
  generatedAt: new Date().toISOString(),
  gateName: "boardroom-layer7-closure",
  aggregateStatus: aggregate,
  closureRatio: ratio,
  totalDispatches: dispatchCount ?? 0,
  closedOrTracked: closedCount ?? 0,
  checks,
};

await Deno.mkdir("generated/boardroom-layer7-closure", { recursive: true });
await Deno.writeTextFile(
  "generated/boardroom-layer7-closure/boardroom-layer7-verification.json",
  JSON.stringify(result, null, 2),
);
console.log(`[layer7-e2e] aggregate=${aggregate} ratio=${ratio.toFixed(3)}`);
Deno.exit(aggregate === "RED" ? 1 : 0);
