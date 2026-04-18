// ═══════════════════════════════════════════════════════════════
// Edge Function: boardroom-followthrough-dispatch
// Receives an approved Boardroom recommendation and dispatches it
// to the canonical agent-executor, persisting the full chain
// (dispatch row → command_step pointer → state transitions).
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface DispatchPayload {
  boardroom_item_id: string;
  recommendation_id?: string;
  approval_queue_id?: string;
  action_type: string;
  action_payload: Record<string, unknown>;
  risk_tier?: "standard" | "elevated" | "critical";
  metadata?: Record<string, unknown>;
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
    if (!authHeader) {
      return json({ error: "missing authorization" }, 401);
    }

    // Validate JWT — get the calling user
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userRes, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userRes.user) {
      return json({ error: "invalid token" }, 401);
    }
    const userId = userRes.user.id;

    const body = (await req.json()) as DispatchPayload;
    if (!body.boardroom_item_id || !body.action_type) {
      return json({ error: "boardroom_item_id and action_type required" }, 400);
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Verify item belongs to user
    const { data: item, error: itemErr } = await admin
      .from("boardroom_items")
      .select("id, user_id, domain, title")
      .eq("id", body.boardroom_item_id)
      .single();
    if (itemErr || !item || item.user_id !== userId) {
      return json({ error: "boardroom item not found or forbidden" }, 404);
    }

    const correlationId = `cor_brd_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 10)}`;

    // 1. Insert dispatch row (state: dispatch_pending)
    const { data: dispatch, error: dispErr } = await admin
      .from("boardroom_followthrough_dispatches")
      .insert({
        user_id: userId,
        boardroom_item_id: body.boardroom_item_id,
        recommendation_id: body.recommendation_id ?? null,
        approval_queue_id: body.approval_queue_id ?? null,
        approved_by: userId,
        correlation_id: correlationId,
        risk_tier: body.risk_tier ?? "standard",
        action_type: body.action_type,
        action_payload: body.action_payload ?? {},
        metadata: body.metadata ?? {},
        state: "dispatch_pending",
      })
      .select("*")
      .single();
    if (dispErr || !dispatch) {
      return json({ error: `dispatch insert failed: ${dispErr?.message}` }, 500);
    }

    await admin
      .from("boardroom_items")
      .update({
        dispatch_id: dispatch.id,
        followthrough_state: "dispatch_pending",
      })
      .eq("id", body.boardroom_item_id);

    // 2. Create os_commands + command_step
    const { data: cmd, error: cmdErr } = await admin
      .from("os_commands")
      .insert({
        user_id: userId,
        command_type: "boardroom_followthrough",
        payload: {
          boardroom_item_id: body.boardroom_item_id,
          dispatch_id: dispatch.id,
          action_type: body.action_type,
          action_payload: body.action_payload,
          correlation_id: correlationId,
        },
        status: "pending",
        priority: body.risk_tier === "critical" ? "high" : "normal",
      })
      .select("id")
      .single();

    let commandId: string | null = null;
    let stepId: string | null = null;

    if (!cmdErr && cmd) {
      commandId = cmd.id;
      const { data: step } = await admin
        .from("command_steps")
        .insert({
          command_id: cmd.id,
          user_id: userId,
          step_index: 0,
          action: body.action_type,
          target: `boardroom_item:${body.boardroom_item_id}`,
          status: "pending",
        })
        .select("id")
        .single();
      stepId = step?.id ?? null;
    }

    // 3. Transition → dispatched
    await admin
      .from("boardroom_followthrough_dispatches")
      .update({
        state: "dispatched",
        command_id: commandId,
        command_step_id: stepId,
      })
      .eq("id", dispatch.id);

    await admin
      .from("boardroom_items")
      .update({
        followthrough_state: "dispatched",
        execution_command_step_id: stepId,
        last_followthrough_event_at: new Date().toISOString(),
      })
      .eq("id", body.boardroom_item_id);

    // 4. Emit timeline event
    await admin.from("timeline_events").insert({
      user_id: userId,
      event_type: "boardroom.followthrough.dispatched",
      actor_type: "system",
      actor_id: "boardroom-followthrough-dispatch",
      subject_type: "boardroom_item",
      subject_id: body.boardroom_item_id,
      action: "dispatched",
      description: `Dispatched: ${item.title}`,
      domain: item.domain ?? "general",
      metadata: {
        correlation_id: correlationId,
        dispatch_id: dispatch.id,
        command_id: commandId,
        command_step_id: stepId,
        risk_tier: body.risk_tier ?? "standard",
      },
    });

    // 5. Invoke agent-executor (best-effort — executor can be picked up async by workers too)
    let executorResult: unknown = null;
    let executorError: string | null = null;
    try {
      const execResp = await fetch(`${SUPABASE_URL}/functions/v1/agent-executor`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SERVICE_KEY}`,
          "Content-Type": "application/json",
          apikey: SERVICE_KEY,
        },
        body: JSON.stringify({
          source: "boardroom-followthrough",
          dispatch_id: dispatch.id,
          command_id: commandId,
          command_step_id: stepId,
          boardroom_item_id: body.boardroom_item_id,
          action_type: body.action_type,
          action_payload: body.action_payload,
          correlation_id: correlationId,
          user_id: userId,
        }),
      });
      if (execResp.ok) {
        executorResult = await execResp.json().catch(() => ({}));
      } else {
        executorError = `executor http ${execResp.status}`;
        await execResp.text().catch(() => "");
      }
    } catch (e) {
      executorError = (e as Error).message;
    }

    return json(
      {
        ok: true,
        dispatch_id: dispatch.id,
        correlation_id: correlationId,
        command_id: commandId,
        command_step_id: stepId,
        executor: executorResult,
        executor_error: executorError,
      },
      200,
    );
  } catch (e) {
    console.error("[boardroom-followthrough-dispatch] error", e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
