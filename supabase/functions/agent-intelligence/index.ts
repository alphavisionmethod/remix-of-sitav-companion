import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { handleCors, corsHeaders, corsResponse, corsError } from "../_shared/cors.ts";
import { EdgeLogger } from "../_shared/logger.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";
import { z } from "https://esm.sh/zod@3.23.8";

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
    const { action = "fleet-status" } = req.method === "POST" ? await req.json() : { action: url.searchParams.get("action") || "fleet-status" };

    switch (action) {
      // ── Fleet Status ──
      case "fleet-status": {
        const { data: telemetry } = await supabase.from("agent_telemetry").select("agent_id, metric_value, metadata, recorded_at")
          .eq("user_id", user.id).order("recorded_at", { ascending: false }).limit(200);

        // Latest status per agent
        const agentStatus: Record<string, any> = {};
        for (const t of telemetry || []) {
          if (!agentStatus[t.agent_id]) {
            agentStatus[t.agent_id] = {
              agent_id: t.agent_id, health: t.metadata?.health || "unknown",
              lastRun: t.recorded_at, metricValue: t.metric_value,
            };
          }
        }

        const agents = Object.values(agentStatus);
        const healthy = agents.filter((a: any) => a.health === "healthy").length;
        const warning = agents.filter((a: any) => a.health === "warning").length;
        const critical = agents.filter((a: any) => a.health === "critical" || a.health === "degraded").length;

        return respond({ fleetSize: agents.length, healthy, warning, critical, agents, overallHealth: critical > 0 ? "critical" : warning > 0 ? "warning" : "healthy" });
      }

      // ── Council Status ──
      case "council-status": {
        const councilId = url.searchParams.get("council") || "reliability-ops";
        const councilAgents = COUNCIL_AGENTS[councilId] || [];

        const { data: telemetry } = await supabase.from("agent_telemetry").select("*")
          .eq("user_id", user.id).in("agent_id", councilAgents)
          .order("recorded_at", { ascending: false }).limit(100);

        const agentHealth: Record<string, string> = {};
        for (const t of telemetry || []) {
          if (!agentHealth[t.agent_id]) agentHealth[t.agent_id] = t.metadata?.health || "unknown";
        }

        return respond({ council: councilId, agents: councilAgents.map(a => ({ agent_id: a, health: agentHealth[a] || "idle" })), totalRuns: telemetry?.length || 0 });
      }

      // ── Agent History ──
      case "agent-history": {
        const agentId = url.searchParams.get("agent_id") || "";
        const { data: receipts } = await supabase.from("agent_action_receipts").select("*")
          .eq("user_id", user.id).eq("agent_id", agentId)
          .order("created_at", { ascending: false }).limit(50);

        return respond({ agent_id: agentId, executions: receipts || [], count: receipts?.length || 0 });
      }

      // ── Escalations ──
      case "escalations": {
        const { data: signals } = await supabase.from("agent_signals").select("*")
          .eq("user_id", user.id).eq("signal_type", "escalation")
          .order("created_at", { ascending: false }).limit(30);

        return respond({ escalations: signals || [], count: signals?.length || 0 });
      }

      // ── Budget ──
      case "budget": {
        const { data: receipts } = await supabase.from("agent_action_receipts").select("cost_tokens, agent_id, created_at")
          .eq("user_id", user.id).order("created_at", { ascending: false }).limit(200);

        const { data: responses } = await supabase.from("advisor_responses").select("tokens_used, model_used")
          .eq("user_id", user.id).order("created_at", { ascending: false }).limit(200);

        const agentTokens = (receipts || []).reduce((s: number, r: any) => s + (r.cost_tokens || 0), 0);
        const advisorTokens = (responses || []).reduce((s: number, r: any) => s + (r.tokens_used || 0), 0);

        const modelBreakdown: Record<string, number> = {};
        for (const r of responses || []) {
          const m = r.model_used || "unknown";
          modelBreakdown[m] = (modelBreakdown[m] || 0) + (r.tokens_used || 0);
        }

        return respond({
          agentTokens, advisorTokens, totalTokens: agentTokens + advisorTokens,
          estimatedCost: `$${((agentTokens + advisorTokens) * 0.002 / 1000).toFixed(4)}`,
          modelBreakdown,
        });
      }

      // ── Signals ──
      case "signals": {
        const { data: signals } = await supabase.from("agent_signals").select("*")
          .eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);

        return respond({ signals: signals || [], count: signals?.length || 0 });
      }

      default:
        return respond({ error: "Unknown action. Use: fleet-status, council-status, agent-history, escalations, budget, signals" }, 400);
    }
  } catch (e) {
    console.error("agent-intelligence error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function respond(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify({ ...data, timestamp: new Date().toISOString() }), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
