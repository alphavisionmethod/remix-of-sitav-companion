import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { handleCors, corsHeaders, corsResponse, corsError } from "../_shared/cors.ts";

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
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const checks: Array<{ name: string; status: string; details?: string; autoFixed?: boolean }> = [];

    // 1. Check for stuck workflows (>24h running)
    const { data: stuckWorkflows } = await supabase.from("workflow_runs")
      .select("id, workflow_id, started_at, status")
      .eq("user_id", user.id).eq("status", "running");

    const stuck = (stuckWorkflows || []).filter((w: any) => {
      return Date.now() - new Date(w.started_at).getTime() > 24 * 60 * 60 * 1000;
    });

    if (stuck.length > 0) {
      // Auto-mark as failed
      for (const w of stuck) {
        await supabase.from("workflow_runs").update({ status: "failed", completed_at: new Date().toISOString() }).eq("id", w.id);
      }
      checks.push({ name: "stuck-workflows", status: "auto-fixed", details: `${stuck.length} workflows marked as failed`, autoFixed: true });

      // Create incident
      await supabase.from("incidents").insert({
        user_id: user.id,
        title: `Self-healing: ${stuck.length} stuck workflow(s) recovered`,
        description: `Workflows running >24h were automatically marked as failed: ${stuck.map((w: any) => w.id).join(", ")}`,
        severity: "medium",
        source: "self-healing",
        status: "resolved",
        resolved_at: new Date().toISOString(),
      });
    } else {
      checks.push({ name: "stuck-workflows", status: "healthy" });
    }

    // 2. Check connector freshness
    const { data: connectors } = await supabase.from("connector_configs")
      .select("id, service, status, last_sync_at")
      .eq("user_id", user.id).eq("status", "active");

    const staleConnectors = (connectors || []).filter((c: any) => {
      if (!c.last_sync_at) return true;
      return Date.now() - new Date(c.last_sync_at).getTime() > 12 * 60 * 60 * 1000;
    });

    if (staleConnectors.length > 0) {
      checks.push({ name: "connector-freshness", status: "warning", details: `${staleConnectors.length} connectors have stale data` });
    } else {
      checks.push({ name: "connector-freshness", status: "healthy" });
    }

    // 3. Check for unread high-urgency notifications
    const { count } = await supabase.from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id).eq("read", false).eq("urgency", "high");

    checks.push({
      name: "unread-urgent-notifications",
      status: (count || 0) > 5 ? "warning" : "healthy",
      details: `${count || 0} unread high-urgency notifications`,
    });

    // Record heartbeat telemetry
    const healthyCount = checks.filter(c => c.status === "healthy").length;
    await supabase.from("agent_telemetry").insert({
      user_id: user.id,
      agent_id: "self-healing-controller",
      metric_name: "heartbeat",
      metric_value: healthyCount / checks.length,
      metadata: { checks, timestamp: new Date().toISOString() },
    });

    return new Response(JSON.stringify({
      status: checks.every(c => c.status === "healthy") ? "all-clear" : "issues-found",
      checks,
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("self-healing error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
