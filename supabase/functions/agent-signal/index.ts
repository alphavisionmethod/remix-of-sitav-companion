import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { handleCors, corsHeaders, corsResponse, corsError } from "../_shared/cors.ts";
import { EdgeLogger } from "../_shared/logger.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";
import { z } from "https://esm.sh/zod@3.23.8";

// Council membership for broadcast routing
const COUNCIL_AGENTS: Record<string, string[]> = {
  "product-build": ["feature-governance", "contract-validator", "schema-checker"],
  "reliability-ops": ["connector-health", "stale-workflow", "incident-response", "release-safety", "self-healing-controller"],
  "security-trust": ["fraud-sentinel", "access-monitor", "policy-validator"],
  "runtime-cost": ["cost-anomaly", "cost-guardrail", "model-router", "budget-enforcer"],
  "architecture-governance": ["boundary-enforcer", "dependency-auditor"],
  "knowledge-coordination": ["data-freshness", "memory-curator", "runbook-updater"],
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Parse body once — Deno Request.json() can only be called once
  let parsedBody: Record<string, unknown> = {};
  if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
    try {
      parsedBody = await req.json();
      const BodySchema = z.object({ agent_id: z.string().min(1), signal_type: z.string().min(1), payload: z.record(z.unknown()).optional() });
      const parsed = BodySchema.safeParse(parsedBody);
      if (!parsed.success) {
        return new Response(JSON.stringify({ error: "Validation failed", details: parsed.error.flatten().fieldErrors }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    } catch (_) { /* non-JSON or GET */ }
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();

    // ── GET: retrieve signals for an agent ──
    if (req.method === "GET") {
      const agentId = url.searchParams.get("agent_id");
      const status = url.searchParams.get("status") || "pending";
      const limit = parseInt(url.searchParams.get("limit") || "20");

      let query = supabase.from("agent_signals").select("*")
        .eq("user_id", user.id).eq("status", status)
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(limit);

      if (agentId) query = query.eq("to_agent", agentId);

      const { data: signals, error } = await query;
      if (error) throw error;

      return new Response(JSON.stringify({ signals: signals || [], count: signals?.length || 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── POST: send a signal ──
    const { from_agent, to_agent, signal_type, payload = {}, priority = 5, broadcast_council } = parsedBody as Record<string, unknown>;

    if (!from_agent || !signal_type) {
      return new Response(JSON.stringify({ error: "from_agent and signal_type required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const signals: Array<Record<string, unknown>> = [];

    // Broadcast to entire council
    if (broadcast_council && COUNCIL_AGENTS[broadcast_council]) {
      for (const agent of COUNCIL_AGENTS[broadcast_council]) {
        if (agent !== from_agent) {
          signals.push({
            user_id: user.id, from_agent, to_agent: agent,
            signal_type, payload, priority,
          });
        }
      }
    } else if (to_agent) {
      signals.push({
        user_id: user.id, from_agent, to_agent,
        signal_type, payload, priority,
      });
    } else {
      return new Response(JSON.stringify({ error: "to_agent or broadcast_council required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error } = await supabase.from("agent_signals").insert(signals);
    if (error) throw error;

    // ── Process: mark signals as processed ──
    if (path === "process") {
      const { signal_ids } = parsedBody as Record<string, unknown>;
      if (signal_ids?.length) {
        await supabase.from("agent_signals")
          .update({ status: "processed", processed_at: new Date().toISOString() })
          .in("id", signal_ids).eq("user_id", user.id);
      }
    }

    return new Response(JSON.stringify({ sent: signals.length, timestamp: new Date().toISOString() }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("agent-signal error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
