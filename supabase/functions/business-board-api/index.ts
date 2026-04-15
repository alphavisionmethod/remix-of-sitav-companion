import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function jsonResp(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

function errResp(msg: string, status = 400) {
  return jsonResp({ error: msg }, status);
}

async function getUser(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return null;
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user ? { user, supabase } : null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = await getUser(req);
    if (!auth) return errResp("Unauthorized", 401);
    const { user, supabase } = auth;
    const userId = user.id;

    const body = await req.json();
    const { action, payload = {} } = body;
    if (!action) return errResp("Missing action");

    // ─── BOARDROOM STATE ──────────────────────────────────────
    if (action === "boardroom.summary") {
      const [recs, actions, health, signals, policies] = await Promise.all([
        supabase.from("advisor_board_recommendations").select("*").eq("user_id", userId).in("status", ["new", "accepted"]).order("urgency_score", { ascending: false }).limit(20),
        supabase.from("advisor_board_actions").select("*").eq("user_id", userId).in("status", ["proposed", "approved", "executing"]).order("created_at", { ascending: false }).limit(20),
        supabase.from("business_health_scores").select("*").eq("user_id", userId).order("scored_at", { ascending: false }).limit(9),
        supabase.from("profit_signals").select("*").eq("user_id", userId).eq("status", "detected").order("created_at", { ascending: false }).limit(10),
        supabase.from("advisor_autonomy_policies").select("*").eq("user_id", userId),
      ]);

      return jsonResp({
        recommendations: recs.data ?? [],
        actions: actions.data ?? [],
        healthScores: health.data ?? [],
        profitSignals: signals.data ?? [],
        autonomyPolicies: policies.data ?? [],
        timestamp: new Date().toISOString(),
      });
    }

    // ─── RECOMMENDATIONS ──────────────────────────────────────
    if (action === "recommendations.list") {
      const status = payload.status ?? "new";
      const limit = payload.limit ?? 50;
      const { data, error } = await supabase
        .from("advisor_board_recommendations")
        .select("*")
        .eq("user_id", userId)
        .eq("status", status)
        .order("urgency_score", { ascending: false })
        .limit(limit);
      if (error) return errResp(error.message, 500);
      return jsonResp({ recommendations: data });
    }

    if (action === "recommendations.generate") {
      // Trigger the cognitive pipeline via advisor-deep-intelligence
      const { data, error } = await supabase.functions.invoke("advisor-deep-intelligence", {
        body: { ...payload, _userId: userId, _persist: true },
      });
      if (error) return errResp(error.message, 500);

      // Persist generated recommendations
      const recs = data?.recommendations ?? [];
      if (recs.length > 0) {
        const rows = recs.map((r: Record<string, unknown>) => ({
          user_id: userId,
          advisor_id: r.advisorId ?? "ceo",
          title: r.title ?? "Recommendation",
          summary: r.summary ?? "",
          rationale: r.rationale ?? r.summary ?? "",
          domain: r.domain ?? "business",
          category: r.category ?? "general",
          confidence_score: r.confidence ?? 0.5,
          urgency_score: r.confidenceProfile ? (r.confidenceProfile as Record<string, number>).urgency / 100 : 0.5,
          business_impact_score: r.confidenceProfile ? (r.confidenceProfile as Record<string, number>).businessImpact / 100 : 0.5,
          reversibility_score: r.confidenceProfile ? (r.confidenceProfile as Record<string, number>).reversibility / 100 : 0.8,
          profitability_score: r.confidenceProfile ? (r.confidenceProfile as Record<string, number>).profitRelevance / 100 : 0.5,
          relationship_risk_score: r.confidenceProfile ? (r.confidenceProfile as Record<string, number>).relationshipRisk / 100 : 0.2,
          operational_risk_score: r.confidenceProfile ? (r.confidenceProfile as Record<string, number>).operationalRisk / 100 : 0.2,
          clarity_score: r.confidenceProfile ? (r.confidenceProfile as Record<string, number>).clarity / 100 : 0.7,
          contributing_advisors: r.contributingAdvisors ?? [],
          evidence_refs: r.riskFlags ?? [],
          action_plan: { suggestedActions: r.suggestedActions ?? [] },
          status: "new",
        }));

        const svc = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
        await svc.from("advisor_board_recommendations").insert(rows);
      }

      return jsonResp({ recommendations: recs, persisted: recs.length });
    }

    if (action === "recommendations.update") {
      const { id, status: newStatus, resolution_notes } = payload;
      if (!id) return errResp("Missing recommendation id");
      const update: Record<string, unknown> = { status: newStatus };
      if (newStatus === "accepted" || newStatus === "dismissed" || newStatus === "executed") {
        update.resolved_at = new Date().toISOString();
      }
      if (resolution_notes) update.resolution_notes = resolution_notes;

      const { error } = await supabase
        .from("advisor_board_recommendations")
        .update(update)
        .eq("id", id)
        .eq("user_id", userId);
      if (error) return errResp(error.message, 500);
      return jsonResp({ success: true });
    }

    // ─── ACTIONS ──────────────────────────────────────────────
    if (action === "actions.list") {
      const { data, error } = await supabase
        .from("advisor_board_actions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(payload.limit ?? 50);
      if (error) return errResp(error.message, 500);
      return jsonResp({ actions: data });
    }

    if (action === "actions.create") {
      const row = {
        user_id: userId,
        recommendation_id: payload.recommendation_id ?? null,
        advisor_id: payload.advisor_id ?? "ceo",
        title: payload.title,
        description: payload.description ?? "",
        action_type: payload.action_type ?? "task",
        domain: payload.domain ?? "business",
        risk_tier: payload.risk_tier ?? "standard",
        confidence: payload.confidence ?? 0.7,
        requires_approval: payload.requires_approval ?? true,
        parameters: payload.parameters ?? {},
      };
      const { data, error } = await supabase
        .from("advisor_board_actions")
        .insert(row)
        .select()
        .single();
      if (error) return errResp(error.message, 500);
      return jsonResp({ action: data });
    }

    if (action === "actions.update") {
      const { id, ...updates } = payload;
      if (!id) return errResp("Missing action id");
      const { error } = await supabase
        .from("advisor_board_actions")
        .update(updates)
        .eq("id", id)
        .eq("user_id", userId);
      if (error) return errResp(error.message, 500);
      return jsonResp({ success: true });
    }

    // ─── MEMORY ───────────────────────────────────────────────
    if (action === "memory.list") {
      const query = supabase
        .from("advisor_board_memory")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .order("importance", { ascending: false });

      if (payload.advisor_id) query.eq("advisor_id", payload.advisor_id);
      if (payload.memory_layer) query.eq("memory_layer", payload.memory_layer);

      const { data, error } = await query.limit(payload.limit ?? 100);
      if (error) return errResp(error.message, 500);
      return jsonResp({ memories: data });
    }

    if (action === "memory.store") {
      const row = {
        user_id: userId,
        advisor_id: payload.advisor_id ?? "system",
        memory_layer: payload.memory_layer ?? "short_term",
        category: payload.category ?? "general",
        content: payload.content,
        context_ref: payload.context_ref,
        importance: payload.importance ?? 0.5,
        confidence: payload.confidence ?? 0.7,
        metadata: payload.metadata ?? {},
      };
      const { data, error } = await supabase
        .from("advisor_board_memory")
        .insert(row)
        .select()
        .single();
      if (error) return errResp(error.message, 500);
      return jsonResp({ memory: data });
    }

    if (action === "memory.correct") {
      const { id, content, confidence } = payload;
      if (!id) return errResp("Missing memory id");
      const update: Record<string, unknown> = {};
      if (content !== undefined) update.content = content;
      if (confidence !== undefined) update.confidence = confidence;
      const { error } = await supabase
        .from("advisor_board_memory")
        .update(update)
        .eq("id", id)
        .eq("user_id", userId);
      if (error) return errResp(error.message, 500);
      return jsonResp({ success: true });
    }

    if (action === "memory.archive") {
      const { id } = payload;
      if (!id) return errResp("Missing memory id");
      const { error } = await supabase
        .from("advisor_board_memory")
        .update({ status: "archived" })
        .eq("id", id)
        .eq("user_id", userId);
      if (error) return errResp(error.message, 500);
      return jsonResp({ success: true });
    }

    if (action === "memory.reset-slice") {
      const { memory_layer, advisor_id } = payload;
      const query = supabase
        .from("advisor_board_memory")
        .update({ status: "archived" })
        .eq("user_id", userId);
      if (memory_layer) query.eq("memory_layer", memory_layer);
      if (advisor_id) query.eq("advisor_id", advisor_id);
      const { error } = await query;
      if (error) return errResp(error.message, 500);
      return jsonResp({ success: true });
    }

    // ─── AUTONOMY / POLICY ────────────────────────────────────
    if (action === "autonomy.get") {
      const { data, error } = await supabase
        .from("advisor_autonomy_policies")
        .select("*")
        .eq("user_id", userId);
      if (error) return errResp(error.message, 500);
      return jsonResp({ policies: data });
    }

    if (action === "autonomy.upsert") {
      const { domain = "global", ...settings } = payload;
      const svc = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      const { data, error } = await svc
        .from("advisor_autonomy_policies")
        .upsert({ user_id: userId, domain, ...settings }, { onConflict: "user_id,domain" })
        .select()
        .single();
      if (error) return errResp(error.message, 500);
      return jsonResp({ policy: data });
    }

    if (action === "autonomy.emergency-stop") {
      const svc = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      await svc
        .from("advisor_autonomy_policies")
        .update({ emergency_stop: true, paused_at: new Date().toISOString() })
        .eq("user_id", userId);
      return jsonResp({ success: true, message: "Emergency stop activated" });
    }

    if (action === "autonomy.resume") {
      const svc = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      await svc
        .from("advisor_autonomy_policies")
        .update({ emergency_stop: false, paused_at: null })
        .eq("user_id", userId);
      return jsonResp({ success: true, message: "Automation resumed" });
    }

    // ─── HEALTH SCORES ────────────────────────────────────────
    if (action === "health.get") {
      const { data, error } = await supabase
        .from("business_health_scores")
        .select("*")
        .eq("user_id", userId)
        .order("scored_at", { ascending: false })
        .limit(payload.limit ?? 9);
      if (error) return errResp(error.message, 500);
      return jsonResp({ scores: data });
    }

    if (action === "health.record") {
      const rows = (payload.dimensions ?? []).map((d: Record<string, unknown>) => ({
        user_id: userId,
        dimension: d.dimension,
        score: d.score,
        previous_score: d.previous_score,
        trend: d.trend ?? "stable",
        contributing_signals: d.contributing_signals ?? [],
        biggest_drag: d.biggest_drag,
        biggest_mover: d.biggest_mover,
        improvement_opportunity: d.improvement_opportunity,
      }));
      if (rows.length === 0) return errResp("No dimensions provided");
      const svc = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      const { error } = await svc.from("business_health_scores").insert(rows);
      if (error) return errResp(error.message, 500);
      return jsonResp({ success: true, recorded: rows.length });
    }

    // ─── PROFIT SIGNALS ───────────────────────────────────────
    if (action === "profitability.list") {
      const { data, error } = await supabase
        .from("profit_signals")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(payload.limit ?? 50);
      if (error) return errResp(error.message, 500);
      return jsonResp({ signals: data });
    }

    if (action === "profitability.record") {
      const row = {
        user_id: userId,
        signal_type: payload.signal_type,
        category: payload.category ?? "leak",
        title: payload.title,
        description: payload.description ?? "",
        estimated_impact_cents: payload.estimated_impact_cents,
        confidence: payload.confidence ?? 0.5,
        urgency: payload.urgency ?? "medium",
        source_data: payload.source_data ?? {},
      };
      const { data, error } = await supabase
        .from("profit_signals")
        .insert(row)
        .select()
        .single();
      if (error) return errResp(error.message, 500);
      return jsonResp({ signal: data });
    }

    if (action === "profitability.resolve") {
      const { id, outcome, actual_impact_cents } = payload;
      if (!id) return errResp("Missing signal id");
      const { error } = await supabase
        .from("profit_signals")
        .update({
          status: "resolved",
          resolved_at: new Date().toISOString(),
          resolution_outcome: outcome,
          actual_impact_cents,
        })
        .eq("id", id)
        .eq("user_id", userId);
      if (error) return errResp(error.message, 500);
      return jsonResp({ success: true });
    }

    // ─── REFLECTIONS ──────────────────────────────────────────
    if (action === "reflections.record") {
      const row = {
        user_id: userId,
        recommendation_id: payload.recommendation_id,
        advisor_id: payload.advisor_id ?? "system",
        owner_action: payload.owner_action ?? "ignored",
        owner_feedback: payload.owner_feedback,
        outcome_observed: payload.outcome_observed,
        outcome_quality: payload.outcome_quality,
        lesson_learned: payload.lesson_learned,
        should_repeat: payload.should_repeat,
        pattern_tags: payload.pattern_tags ?? [],
      };
      const { data, error } = await supabase
        .from("advisor_board_reflections")
        .insert(row)
        .select()
        .single();
      if (error) return errResp(error.message, 500);
      return jsonResp({ reflection: data });
    }

    if (action === "reflections.list") {
      const { data, error } = await supabase
        .from("advisor_board_reflections")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(payload.limit ?? 50);
      if (error) return errResp(error.message, 500);
      return jsonResp({ reflections: data });
    }

    // ─── TOOL EXECUTIONS ──────────────────────────────────────
    if (action === "tools.list") {
      const { data, error } = await supabase
        .from("advisor_board_tool_executions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(payload.limit ?? 50);
      if (error) return errResp(error.message, 500);
      return jsonResp({ executions: data });
    }

    if (action === "tools.record") {
      const row = {
        user_id: userId,
        action_id: payload.action_id,
        advisor_id: payload.advisor_id ?? "system",
        tool_category: payload.tool_category,
        tool_name: payload.tool_name,
        operation: payload.operation,
        parameters: payload.parameters ?? {},
        status: payload.status ?? "pending",
        approval_state: payload.approval_state ?? "pending",
        rollback_capable: payload.rollback_capable ?? false,
      };
      const { data, error } = await supabase
        .from("advisor_board_tool_executions")
        .insert(row)
        .select()
        .single();
      if (error) return errResp(error.message, 500);
      return jsonResp({ execution: data });
    }

    return errResp(`Unknown action: ${action}`, 400);
  } catch (e) {
    console.error("business-board-api error:", e);
    return errResp(e instanceof Error ? e.message : "Internal error", 500);
  }
});
