// ═══════════════════════════════════════════════════════════════
// SITA OS — Boardroom Session canonical edge function (Phase 24.D)
// Actions: assemble | add-item | add-evidence | recommend | vote |
//          decide | adjourn
// Every state transition writes a boardroom_decision_receipts row
// (when terminal) and updates session/item state with audit trail.
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Action = "assemble" | "add-item" | "add-evidence" | "recommend" | "vote" | "decide" | "adjourn";

interface RequestBody {
  action: Action;
  session_id?: string;
  item_id?: string;
  recommendation_id?: string;
  payload?: Record<string, unknown>;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }
    const userId = userData.user.id;

    const body = (await req.json()) as RequestBody;
    if (!body?.action) return jsonResponse({ error: "Missing action" }, 400);

    switch (body.action) {
      case "assemble": {
        const { data, error } = await supabase
          .from("boardroom_sessions")
          .insert({
            user_id: userId,
            session_type: (body.payload?.session_type as string) ?? "weekly",
            scope: (body.payload?.scope as string) ?? "general",
            status: "in-session",
            session_mode: "review",
            participating_advisors: body.payload?.advisors ?? [],
            opened_at: new Date().toISOString(),
          })
          .select()
          .single();
        if (error) throw error;
        return jsonResponse({ ok: true, session: data });
      }

      case "add-item": {
        if (!body.session_id) return jsonResponse({ error: "session_id required" }, 400);
        const { data, error } = await supabase
          .from("boardroom_items")
          .insert({
            session_id: body.session_id,
            user_id: userId,
            ...(body.payload ?? {}),
          })
          .select()
          .single();
        if (error) throw error;
        return jsonResponse({ ok: true, item: data });
      }

      case "add-evidence": {
        if (!body.item_id) return jsonResponse({ error: "item_id required" }, 400);
        const { data, error } = await supabase
          .from("boardroom_evidence")
          .insert({
            item_id: body.item_id,
            user_id: userId,
            ...(body.payload ?? {}),
          })
          .select()
          .single();
        if (error) throw error;
        return jsonResponse({ ok: true, evidence: data });
      }

      case "recommend": {
        if (!body.item_id) return jsonResponse({ error: "item_id required" }, 400);
        const { data, error } = await supabase
          .from("boardroom_recommendations")
          .insert({
            item_id: body.item_id,
            user_id: userId,
            ...(body.payload ?? {}),
          })
          .select()
          .single();
        if (error) throw error;
        return jsonResponse({ ok: true, recommendation: data });
      }

      case "vote": {
        if (!body.recommendation_id) return jsonResponse({ error: "recommendation_id required" }, 400);
        const vote = (body.payload?.vote as string) ?? "approve";
        const newStatus = vote === "approve" ? "endorsed" : "rejected";
        const { data, error } = await supabase
          .from("boardroom_recommendations")
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq("id", body.recommendation_id)
          .eq("user_id", userId)
          .select()
          .single();
        if (error) throw error;
        return jsonResponse({ ok: true, recommendation: data });
      }

      case "decide": {
        if (!body.session_id) return jsonResponse({ error: "session_id required" }, 400);
        // Snapshot evidence + simulation + write a permanent decision receipt
        const { data: evidenceRows } = await supabase
          .from("boardroom_evidence")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(20);

        const { data: receipt, error: receiptErr } = await supabase
          .from("boardroom_decision_receipts")
          .insert({
            user_id: userId,
            session_id: body.session_id,
            item_id: body.item_id ?? null,
            recommendation_id: body.recommendation_id ?? null,
            approved_motion: (body.payload?.approved_motion as string) ?? "Decision recorded",
            rationale_summary: (body.payload?.rationale_summary as string) ?? "",
            evidence_snapshot: evidenceRows ?? [],
            simulation_snapshot: body.payload?.simulation_snapshot ?? {},
            approval_conditions: body.payload?.approval_conditions ?? [],
            status: "recorded",
            expected_outcome: (body.payload?.expected_outcome as string) ?? null,
            linked_execution_items: body.payload?.linked_execution_items ?? [],
            proof_trail: {
              decided_at: new Date().toISOString(),
              decided_by: userId,
              source: "boardroom-session",
              action: "decide",
            },
          })
          .select()
          .single();
        if (receiptErr) throw receiptErr;

        // Update session status
        await supabase
          .from("boardroom_sessions")
          .update({ status: "deciding", updated_at: new Date().toISOString() })
          .eq("id", body.session_id)
          .eq("user_id", userId);

        return jsonResponse({ ok: true, receipt });
      }

      case "adjourn": {
        if (!body.session_id) return jsonResponse({ error: "session_id required" }, 400);
        const { data, error } = await supabase
          .from("boardroom_sessions")
          .update({
            status: "adjourned",
            closed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", body.session_id)
          .eq("user_id", userId)
          .select()
          .single();
        if (error) throw error;
        return jsonResponse({ ok: true, session: data });
      }

      default:
        return jsonResponse({ error: `Unknown action: ${body.action}` }, 400);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return jsonResponse({ error: message }, 500);
  }
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
