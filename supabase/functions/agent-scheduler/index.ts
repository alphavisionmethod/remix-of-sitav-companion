import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { handleCors, corsHeaders, corsResponse, corsError } from "../_shared/cors.ts";
import { EdgeLogger } from "../_shared/logger.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";

// Schedule intervals in milliseconds
const SCHEDULE_INTERVALS: Record<string, number> = {
  continuous: 5 * 60 * 1000,    // 5 min
  hourly: 60 * 60 * 1000,       // 1h
  daily: 24 * 60 * 60 * 1000,   // 24h
};

// Default agent schedules (matches internal-agent-config definitions)
const DEFAULT_AGENTS: Array<{ agent_id: string; schedule_type: string }> = [
  { agent_id: "connector-health", schedule_type: "continuous" },
  { agent_id: "stale-workflow", schedule_type: "hourly" },
  { agent_id: "cost-anomaly", schedule_type: "hourly" },
  { agent_id: "data-freshness", schedule_type: "continuous" },
  { agent_id: "fraud-sentinel", schedule_type: "continuous" },
  { agent_id: "access-monitor", schedule_type: "daily" },
  { agent_id: "policy-validator", schedule_type: "daily" },
  { agent_id: "cost-guardrail", schedule_type: "hourly" },
  { agent_id: "model-router", schedule_type: "daily" },
  { agent_id: "budget-enforcer", schedule_type: "hourly" },
  { agent_id: "feature-governance", schedule_type: "daily" },
  { agent_id: "contract-validator", schedule_type: "daily" },
  { agent_id: "schema-checker", schedule_type: "daily" },
  { agent_id: "boundary-enforcer", schedule_type: "daily" },
  { agent_id: "dependency-auditor", schedule_type: "daily" },
  { agent_id: "memory-curator", schedule_type: "daily" },
  { agent_id: "runbook-updater", schedule_type: "daily" },
  { agent_id: "incident-response", schedule_type: "continuous" },
  { agent_id: "release-safety", schedule_type: "daily" },
  { agent_id: "self-healing-controller", schedule_type: "continuous" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Auth — accepts service role or user JWT
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    // Get all active schedules
    const { data: schedules } = await supabase.from("agent_schedules")
      .select("*").eq("is_active", true);

    // If no schedules exist yet, use defaults for the requesting user
    const activeSchedules = schedules?.length ? schedules : (userId ? DEFAULT_AGENTS.map(a => ({
      user_id: userId, agent_id: a.agent_id, schedule_type: a.schedule_type,
      last_run_at: null, is_active: true,
    })) : []);

    const now = Date.now();
    const dueAgents: Array<{ user_id: string; agent_id: string; schedule_type: string }> = [];

    for (const schedule of activeSchedules) {
      const interval = SCHEDULE_INTERVALS[schedule.schedule_type] || SCHEDULE_INTERVALS.daily;
      const lastRun = schedule.last_run_at ? new Date(schedule.last_run_at).getTime() : 0;

      if (now - lastRun >= interval) {
        dueAgents.push(schedule as any);
      }
    }

    // Execute due agents
    const results: Array<{ agent_id: string; status: string; health?: string }> = [];

    for (const agent of dueAgents) {
      try {
        // Call agent-executor for each due agent
        const execResponse = await fetch(`${supabaseUrl}/functions/v1/agent-executor`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": authHeader || `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({ agent_id: agent.agent_id, action: "scheduled-run" }),
        });

        const execResult = await execResponse.json();

        // Update schedule record
        await supabase.from("agent_schedules").upsert({
          user_id: agent.user_id, agent_id: agent.agent_id,
          schedule_type: agent.schedule_type, last_run_at: new Date().toISOString(),
          next_run_at: new Date(now + (SCHEDULE_INTERVALS[agent.schedule_type] || SCHEDULE_INTERVALS.daily)).toISOString(),
          run_count: (schedules?.find(s => s.agent_id === agent.agent_id)?.run_count || 0) + 1,
          is_active: true,
        }, { onConflict: "user_id,agent_id" });

        results.push({ agent_id: agent.agent_id, status: "executed", health: execResult.health });
      } catch (err) {
        results.push({ agent_id: agent.agent_id, status: "error" });
      }
    }

    return new Response(JSON.stringify({
      scheduled: dueAgents.length, executed: results.filter(r => r.status === "executed").length,
      results, timestamp: new Date().toISOString(),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("agent-scheduler error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
