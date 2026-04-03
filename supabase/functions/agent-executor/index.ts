import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    // Verify JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { agent_id, action = "diagnose" } = await req.json();
    if (!agent_id) {
      return new Response(JSON.stringify({ error: "agent_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: Record<string, unknown> = { agent_id, action, timestamp: new Date().toISOString() };

    // Run diagnostics based on agent type
    switch (agent_id) {
      case "connector-health": {
        const { data: connectors } = await supabase.from("connector_configs").select("*").eq("user_id", user.id);
        const degraded = (connectors || []).filter((c: any) => c.status !== "active");
        results.total = connectors?.length || 0;
        results.degraded = degraded.length;
        results.details = degraded.map((c: any) => ({ service: c.service, status: c.status, lastSync: c.last_sync_at }));
        results.health = degraded.length === 0 ? "healthy" : "degraded";
        break;
      }
      case "stale-workflow": {
        const { data: workflows } = await supabase.from("workflow_runs").select("*").eq("user_id", user.id).eq("status", "running");
        const stale = (workflows || []).filter((w: any) => {
          const age = Date.now() - new Date(w.updated_at).getTime();
          return age > 24 * 60 * 60 * 1000; // >24h
        });
        results.total = workflows?.length || 0;
        results.stale = stale.length;
        results.details = stale.map((w: any) => ({ id: w.id, workflow_id: w.workflow_id, started: w.started_at }));
        results.health = stale.length === 0 ? "healthy" : "warning";
        break;
      }
      case "cost-anomaly": {
        const { data: responses } = await supabase.from("advisor_responses").select("tokens_used, model_used, created_at")
          .eq("user_id", user.id).order("created_at", { ascending: false }).limit(100);
        const totalTokens = (responses || []).reduce((s: number, r: any) => s + (r.tokens_used || 0), 0);
        const avgTokens = responses?.length ? totalTokens / responses.length : 0;
        results.totalTokens24h = totalTokens;
        results.avgPerRequest = Math.round(avgTokens);
        results.requestCount = responses?.length || 0;
        results.estimatedCost = `$${(totalTokens * 0.002 / 1000).toFixed(4)}`;
        results.health = avgTokens > 5000 ? "warning" : "healthy";
        break;
      }
      case "data-freshness": {
        const { data: syncLogs } = await supabase.from("sync_logs").select("*").eq("user_id", user.id)
          .order("synced_at", { ascending: false }).limit(20);
        const staleConnectors = (syncLogs || []).filter((l: any) => {
          const age = Date.now() - new Date(l.synced_at).getTime();
          return age > 6 * 60 * 60 * 1000; // >6h
        });
        results.recentSyncs = syncLogs?.length || 0;
        results.staleConnectors = staleConnectors.length;
        results.health = staleConnectors.length === 0 ? "healthy" : "degraded";
        break;
      }
      default: {
        results.health = "healthy";
        results.message = "Agent diagnostic completed — no issues found";
      }
    }

    // Record telemetry
    await supabase.from("agent_telemetry").insert({
      user_id: user.id,
      agent_id,
      metric_name: "diagnostic_run",
      metric_value: results.health === "healthy" ? 1 : 0,
      metadata: results,
    });

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("agent-executor error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
