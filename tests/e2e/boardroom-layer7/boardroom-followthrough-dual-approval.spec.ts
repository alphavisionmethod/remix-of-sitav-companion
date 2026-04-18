// E2E: Boardroom Layer 7 — high-risk path requiring operator outcome marking.
// Verifies the chain works when the executor returns success but operator
// must still mark the outcome explicitly via the outcome-record edge function.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("VITE_SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.test("Boardroom Layer 7 — high-risk path with operator outcome", async () => {
  const sb = createClient(SUPABASE_URL, SERVICE_KEY);
  const testUserId = Deno.env.get("BRD_E2E_USER_ID");
  assert(testUserId, "BRD_E2E_USER_ID env var required");

  const { data: item } = await sb
    .from("boardroom_items")
    .insert({
      user_id: testUserId,
      title: "[E2E] High-risk follow-through",
      description: "high-risk dual-approval flow",
      domain: "boardroom",
      severity: "high",
      status: "approved",
      followthrough_state: "approved",
    })
    .select("id")
    .single();
  assert(item, "item create failed");

  try {
    // Dispatch with critical risk
    const dispResp = await fetch(`${SUPABASE_URL}/functions/v1/boardroom-followthrough-dispatch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SERVICE_KEY}`,
        apikey: SERVICE_KEY,
      },
      body: JSON.stringify({
        boardroom_item_id: item.id,
        action_type: "create_task",
        action_payload: {
          title: "[E2E] critical follow-up",
          description: "Operator-verified follow-through",
          priority: "high",
        },
        risk_tier: "critical",
      }),
    });
    const dispBody = await dispResp.json();
    assert(dispResp.ok, `dispatch failed: ${JSON.stringify(dispBody)}`);

    // Wait for execution to settle
    let dispatch: any = null;
    for (let i = 0; i < 10; i++) {
      const { data } = await sb
        .from("boardroom_followthrough_dispatches")
        .select("*")
        .eq("id", dispBody.dispatch_id)
        .single();
      dispatch = data;
      if (dispatch && ["outcome_tracked", "executed", "receipt_recorded"].includes(dispatch.state))
        break;
      await new Promise((r) => setTimeout(r, 1000));
    }
    assert(dispatch, "dispatch missing");

    // Operator records explicit outcome via canonical edge function
    const outcomeResp = await fetch(`${SUPABASE_URL}/functions/v1/boardroom-outcome-record`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SERVICE_KEY}`,
        apikey: SERVICE_KEY,
        "x-internal-source": "agent-executor",
      },
      body: JSON.stringify({
        dispatch_id: dispatch.id,
        outcome_status: "partial",
        actual_outcome: "Operator override: partially executed",
        verification_source: "operator",
        confidence: 0.7,
        retry_required: true,
      }),
    });
    const outcomeBody = await outcomeResp.json();
    assert(outcomeResp.ok, `outcome record failed: ${JSON.stringify(outcomeBody)}`);
    assertEquals(outcomeBody.outcome.outcome_status, "partial");

    // Verify final state includes outcome_tracked
    const { data: finalDispatch } = await sb
      .from("boardroom_followthrough_dispatches")
      .select("state, outcome_record_id")
      .eq("id", dispatch.id)
      .single();
    assertEquals(finalDispatch?.state, "outcome_tracked");
    assert(finalDispatch?.outcome_record_id, "outcome_record_id not linked");
  } finally {
    await sb.from("boardroom_items").delete().eq("id", item.id);
  }
});
