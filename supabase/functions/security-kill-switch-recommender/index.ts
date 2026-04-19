// Phase 4 — Kill switch recommendation router
// Validates a security finding/threshold breach and routes it through
// propose_kill_switch_recommendation. Does NOT arm any kill switch.
// Approval still requires admin via existing kill_switch_approvals workflow.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  switch_id: string;
  source_finding_id?: string | null;
  source_agent_id: string;
  severity: "low" | "medium" | "high" | "critical";
  recommended_action: "activate" | "deactivate";
  reason: string;
  evidence: Record<string, unknown>;
  blast_radius: "unknown" | "single-tenant" | "single-service" | "multi-service" | "platform-wide";
  urgency: "low" | "normal" | "high" | "critical";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Strict validation
  if (!body.switch_id || !body.source_agent_id || !body.reason) {
    return new Response(JSON.stringify({ error: "missing_required_fields" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!["activate", "deactivate"].includes(body.recommended_action)) {
    return new Response(JSON.stringify({ error: "invalid_recommended_action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!["low", "medium", "high", "critical"].includes(body.severity)) {
    return new Response(JSON.stringify({ error: "invalid_severity" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Hard guardrail — this function NEVER arms kill switches.
  // It only creates a recommendation row. Admins must go through the
  // existing kill_switch_approvals dual-approval workflow to actually arm.
  const { data: recId, error } = await supabase.rpc("propose_kill_switch_recommendation", {
    _switch_id: body.switch_id,
    _source_finding_id: body.source_finding_id ?? null,
    _source_agent_id: body.source_agent_id,
    _severity: body.severity,
    _recommended_action: body.recommended_action,
    _reason: body.reason,
    _evidence: body.evidence ?? {},
    _blast_radius: body.blast_radius ?? "unknown",
    _urgency: body.urgency ?? "normal",
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({
      ok: true,
      recommendation_id: recId,
      status: "pending",
      next_step: "human_review_required",
      approval_workflow: "kill_switch_approvals (dual-approval)",
      arms_kill_switch: false,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
