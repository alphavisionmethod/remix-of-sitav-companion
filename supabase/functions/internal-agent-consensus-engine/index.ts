// ═══════════════════════════════════════════════════════════════
// Phase 6A — Cross-Council Consensus Engine
// Opens, advances, and resolves multi-agent consensus sessions.
// L3 hard ceiling enforced via DB RPC; this function NEVER bypasses it.
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface OpenSessionPayload {
  action: "open";
  session_key: string;
  topic: string;
  initiating_agent_id: string;
  participating_councils: string[];
  participating_agent_ids: string[];
  quorum_required?: number;
  action_class?: string;
  proposed_autonomy_level?: number;
}

interface CastVotePayload {
  action: "vote";
  session_id: string;
  agent_id: string;
  council: string;
  position: "approve" | "reject" | "abstain" | "escalate";
  confidence: number;
  rationale: string;
  evidence_refs?: unknown[];
}

interface ResolvePayload {
  action: "resolve";
  session_id: string;
  resolved_by?: string;
}

type Payload = OpenSessionPayload | CastVotePayload | ResolvePayload;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

    const body = (await req.json()) as Payload;

    if (body.action === "open") {
      const { data, error } = await supabase.rpc("open_internal_agent_consensus", {
        p_session_key: body.session_key,
        p_topic: body.topic,
        p_initiating_agent_id: body.initiating_agent_id,
        p_participating_councils: body.participating_councils,
        p_participating_agent_ids: body.participating_agent_ids,
        p_quorum_required: body.quorum_required ?? 3,
        p_action_class: body.action_class ?? "recommendation",
        p_proposed_autonomy_level: Math.min(body.proposed_autonomy_level ?? 0, 6),
      });
      if (error) throw error;
      return json({ ok: true, session_id: data, ceiling: "L3 (cross-council)" });
    }

    if (body.action === "vote") {
      const { data, error } = await supabase.rpc("cast_internal_agent_consensus_vote", {
        p_session_id: body.session_id,
        p_agent_id: body.agent_id,
        p_council: body.council,
        p_position: body.position,
        p_confidence: Math.max(0, Math.min(1, body.confidence)),
        p_rationale: body.rationale ?? "",
        p_evidence_refs: body.evidence_refs ?? [],
      });
      if (error) throw error;
      return json({ ok: true, vote_id: data });
    }

    if (body.action === "resolve") {
      const { data, error } = await supabase.rpc("resolve_internal_agent_consensus", {
        p_session_id: body.session_id,
        p_resolved_by: body.resolved_by ?? "system",
      });
      if (error) throw error;
      return json({ ok: true, resolution: data });
    }

    return json({ ok: false, error: "unknown_action" }, 400);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    return json({ ok: false, error: message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
