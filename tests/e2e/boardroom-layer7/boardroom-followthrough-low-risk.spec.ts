// E2E: Boardroom Layer 7 — low-risk auto-approve path.
// Drives the full chain by directly invoking the canonical edge functions
// with a service-role client (real DB writes, real receipts).
//
// Pre-req: Deno test runtime with SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY env vars.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  assertEquals,
  assert,
} from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("VITE_SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.test("Boardroom Layer 7 — low-risk full chain (dispatch → execute → outcome)", async () => {
  const sb = createClient(SUPABASE_URL, SERVICE_KEY);

  // 1. Pick or create a test user
  const testUserId = Deno.env.get("BRD_E2E_USER_ID");
  assert(testUserId, "BRD_E2E_USER_ID env var required for E2E");

  // 2. Create a Boardroom item
  const { data: item, error: itemErr } = await sb
    .from("boardroom_items")
    .insert({
      user_id: testUserId,
      title: "[E2E] Low-risk follow-through test",
      description: "auto-generated test",
      domain: "boardroom",
      severity: "low",
      status: "approved",
      followthrough_state: "approved",
    })
    .select("id")
    .single();
  assert(!itemErr, `item insert failed: ${itemErr?.message}`);
  const itemId = item!.id;

  try {
    // 3. Dispatch (calls the canonical edge function)
    const dispResp = await fetch(`${SUPABASE_URL}/functions/v1/boardroom-followthrough-dispatch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SERVICE_KEY}`,
        apikey: SERVICE_KEY,
      },
      body: JSON.stringify({
        boardroom_item_id: itemId,
        action_type: "acknowledge",
        action_payload: { note: "E2E test acknowledgment" },
        risk_tier: "standard",
      }),
    });
    const dispBody = await dispResp.json();
    assert(dispResp.ok, `dispatch failed: ${JSON.stringify(dispBody)}`);
    assert(dispBody.dispatch_id, "no dispatch_id returned");

    // 4. Wait for executor to settle (poll up to 10s)
    let dispatch: any = null;
    for (let i = 0; i < 10; i++) {
      const { data } = await sb
        .from("boardroom_followthrough_dispatches")
        .select("*")
        .eq("id", dispBody.dispatch_id)
        .single();
      dispatch = data;
      if (dispatch && ["outcome_tracked", "reflected", "closed"].includes(dispatch.state)) break;
      await new Promise((r) => setTimeout(r, 1000));
    }

    assert(dispatch, "dispatch row missing");
    assert(
      ["outcome_tracked", "reflected", "closed", "receipt_recorded", "executed"].includes(
        dispatch.state,
      ),
      `unexpected terminal state: ${dispatch.state}`,
    );
    assert(dispatch.command_step_id, "command_step_id missing — execution path broken");
    assert(dispatch.receipt_id, "receipt_id missing — proof linkage broken");
    assert(dispatch.execution_completed_at, "execution_completed_at missing");

    // 5. Verify outcome record exists
    const { data: outcome } = await sb
      .from("boardroom_outcome_records")
      .select("*")
      .eq("dispatch_id", dispatch.id)
      .maybeSingle();
    assert(outcome, "outcome record missing");
    assertEquals(outcome.outcome_status, "success");

    // 6. Verify timeline events
    const { data: events } = await sb
      .from("timeline_events")
      .select("event_type")
      .eq("subject_id", itemId)
      .order("created_at", { ascending: true });
    const types = (events ?? []).map((e) => e.event_type);
    assert(types.includes("boardroom.followthrough.dispatched"), "dispatched event missing");
    assert(
      types.includes("boardroom.followthrough.executed") ||
        types.includes("boardroom.followthrough.outcome_tracked"),
      "executed/outcome event missing",
    );

    // 7. Record reflection — closes the chain
    const { data: refl, error: rErr } = await sb
      .from("advisor_board_reflections")
      .insert({
        user_id: testUserId,
        advisor_id: "boardroom-e2e",
        boardroom_item_id: itemId,
        dispatch_id: dispatch.id,
        outcome_record_id: outcome.id,
        owner_action: "reviewed",
        outcome_quality: 0.9,
        usefulness_score: 0.9,
        recommendation_quality_score: 0.9,
        execution_fitness_score: 0.9,
        lesson_learned: "E2E: auto-acknowledge path works end-to-end",
        should_repeat: true,
      })
      .select("id")
      .single();
    assert(!rErr, `reflection insert failed: ${rErr?.message}`);
    assert(refl, "reflection insert returned no row");
  } finally {
    // Cleanup
    await sb.from("boardroom_items").delete().eq("id", itemId);
  }
});
