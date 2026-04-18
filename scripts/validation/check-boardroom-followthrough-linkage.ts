#!/usr/bin/env -S deno run -A
// ═══════════════════════════════════════════════════════════════
// Validation: no orphan dispatches/outcomes/reflections.
// Checks that every outcome/reflection has a valid dispatch+item.
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL") ?? Deno.env.get("SUPABASE_URL");
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("missing supabase env");
  Deno.exit(2);
}
const sb = createClient(SUPABASE_URL, SERVICE_KEY);

const { data: orphanOutcomes } = await sb
  .from("boardroom_outcome_records")
  .select("id, dispatch_id, boardroom_item_id");
const { data: dispatches } = await sb
  .from("boardroom_followthrough_dispatches")
  .select("id, boardroom_item_id");
const dispIds = new Set((dispatches ?? []).map((d) => d.id));
const dispItemIds = new Set((dispatches ?? []).map((d) => d.boardroom_item_id));

const orphanedOutcomes = (orphanOutcomes ?? []).filter(
  (o) => !dispIds.has(o.dispatch_id) || !dispItemIds.has(o.boardroom_item_id),
);

const { data: refs } = await sb
  .from("advisor_board_reflections")
  .select("id, dispatch_id, boardroom_item_id")
  .not("dispatch_id", "is", null);
const orphanedReflections = (refs ?? []).filter((r) => r.dispatch_id && !dispIds.has(r.dispatch_id));

const result = {
  generatedAt: new Date().toISOString(),
  orphanedOutcomes,
  orphanedReflections,
  status:
    orphanedOutcomes.length === 0 && orphanedReflections.length === 0 ? "GREEN" : "RED",
};
await Deno.mkdir("generated/boardroom-layer7-closure", { recursive: true });
await Deno.writeTextFile(
  "generated/boardroom-layer7-closure/linkage.json",
  JSON.stringify(result, null, 2),
);
console.log(`[layer7-linkage] status=${result.status}`);
Deno.exit(result.status === "GREEN" ? 0 : 1);
