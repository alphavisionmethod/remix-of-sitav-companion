// ═══════════════════════════════════════════════════════════════
// Edge Function: boardroom-outcome-record
// Records a follow-through outcome for a Boardroom dispatch.
// Auto path: invoked by agent-executor when a step completes.
// Manual path: invoked by an operator from the admin Layer 7 board.
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type OutcomeStatus = "pending" | "success" | "partial" | "failed" | "rolled_back";
type Source = "auto" | "operator" | "user" | "system";

interface OutcomePayload {
  dispatch_id: string;
  outcome_status: OutcomeStatus;
  expected_outcome?: string;
  actual_outcome?: string;
  affected_entities?: unknown[];
  confidence?: number;
  verification_source?: Source;
  notes?: string;
  retry_required?: boolean;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization");
    const isServiceCall =
      authHeader === `Bearer ${SERVICE_KEY}` ||
      req.headers.get("x-internal-source") === "agent-executor";

    let userId: string | null = null;
    if (!isServiceCall) {
      if (!authHeader) return json({ error: "missing authorization" }, 401);
      const userClient = createClient(SUPABASE_URL, ANON_KEY, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data, error } = await userClient.auth.getUser();
      if (error || !data.user) return json({ error: "invalid token" }, 401);
      userId = data.user.id;
    }

    const body = (await req.json()) as OutcomePayload;
    if (!body.dispatch_id || !body.outcome_status) {
      return json({ error: "dispatch_id and outcome_status required" }, 400);
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: dispatch, error: dErr } = await admin
      .from("boardroom_followthrough_dispatches")
      .select(
        "id, user_id, boardroom_item_id, correlation_id, state, command_step_id",
      )
      .eq("id", body.dispatch_id)
      .single();
    if (dErr || !dispatch) {
      return json({ error: "dispatch not found" }, 404);
    }

    // Authorization: user must own dispatch unless service call
    if (!isServiceCall && userId !== dispatch.user_id) {
      // allow admins
      const { data: roleRow } = await admin
        .from("user_roles")
        .select("role")
        .eq("user_id", userId!)
        .eq("role", "admin")
        .maybeSingle();
      if (!roleRow) return json({ error: "forbidden" }, 403);
    }

    // Insert outcome record
    const { data: outcome, error: oErr } = await admin
      .from("boardroom_outcome_records")
      .insert({
        user_id: dispatch.user_id,
        boardroom_item_id: dispatch.boardroom_item_id,
        dispatch_id: dispatch.id,
        outcome_status: body.outcome_status,
        expected_outcome: body.expected_outcome ?? "",
        actual_outcome: body.actual_outcome ?? "",
        affected_entities: body.affected_entities ?? [],
        confidence: body.confidence ?? 0,
        verification_source: body.verification_source ?? (isServiceCall ? "auto" : "operator"),
        verified_by: userId,
        notes: body.notes ?? null,
        retry_required: body.retry_required ?? false,
      })
      .select("*")
      .single();
    if (oErr || !outcome) {
      return json({ error: `outcome insert failed: ${oErr?.message}` }, 500);
    }

    // Update dispatch
    await admin
      .from("boardroom_followthrough_dispatches")
      .update({ state: "outcome_tracked", outcome_record_id: outcome.id })
      .eq("id", dispatch.id);

    // Update boardroom_item
    await admin
      .from("boardroom_items")
      .update({
        followthrough_state: "outcome_tracked",
        outcome_status: body.outcome_status,
        outcome_recorded_at: new Date().toISOString(),
        last_followthrough_event_at: new Date().toISOString(),
      })
      .eq("id", dispatch.boardroom_item_id);

    // Timeline event
    await admin.from("timeline_events").insert({
      user_id: dispatch.user_id,
      event_type: "boardroom.followthrough.outcome_tracked",
      actor_type: isServiceCall ? "system" : "user",
      actor_id: isServiceCall ? "agent-executor" : userId ?? "operator",
      subject_type: "boardroom_item",
      subject_id: dispatch.boardroom_item_id,
      action: body.outcome_status,
      description: "Outcome recorded for Boardroom follow-through",
      domain: "boardroom",
      metadata: {
        correlation_id: dispatch.correlation_id,
        dispatch_id: dispatch.id,
        outcome_id: outcome.id,
        outcome_status: body.outcome_status,
        verification_source: body.verification_source ?? (isServiceCall ? "auto" : "operator"),
      },
    });

    return json({ ok: true, outcome }, 200);
  } catch (e) {
    console.error("[boardroom-outcome-record] error", e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
