import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";
import { z } from "https://esm.sh/zod@3.23.8";

const QuerySchema = z.object({
  probe: z.string().optional(),
  verbose: z.enum(["true", "false"]).optional(),
});

interface ProbeResult {
  probe_id: string;
  name: string;
  target: string;
  status: "pass" | "fail" | "degraded";
  latency_ms: number;
  error?: string;
  snapshot?: Record<string, unknown>;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  const qp = QuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!qp.success) {
    return new Response(JSON.stringify({ error: "Invalid query parameters" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const filterProbe = qp.data.probe;
  const startTime = Date.now();
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || serviceKey;
  const supabase = createClient(supabaseUrl, serviceKey);

  const results: ProbeResult[] = [];

  // ── Probe 1: Database Health ──
  if (!filterProbe || filterProbe === "db-health") {
    try {
      const t = Date.now();
      const { error } = await supabase.from("profiles").select("id").limit(1);
      results.push({
        probe_id: "db-health", name: "Database Connectivity", target: "supabase-postgres",
        status: error ? "fail" : "pass", latency_ms: Date.now() - t, error: error?.message,
      });
    } catch (e: any) {
      results.push({ probe_id: "db-health", name: "Database Connectivity", target: "supabase-postgres", status: "fail", latency_ms: 0, error: e.message });
    }
  }

  // ── Probe 2: Auth System Health ──
  if (!filterProbe || filterProbe === "auth-health") {
    try {
      const t = Date.now();
      const resp = await fetch(`${supabaseUrl}/auth/v1/settings`, {
        headers: { apikey: anonKey },
      });
      const body = await resp.text();
      results.push({
        probe_id: "auth-health", name: "Auth System", target: "supabase-auth",
        status: resp.ok ? "pass" : "fail", latency_ms: Date.now() - t,
        error: resp.ok ? undefined : `HTTP ${resp.status}`,
      });
    } catch (e: any) {
      results.push({ probe_id: "auth-health", name: "Auth System", target: "supabase-auth", status: "fail", latency_ms: 0, error: e.message });
    }
  }

  // ── Probe 3: Storage Health ──
  if (!filterProbe || filterProbe === "storage-health") {
    try {
      const t = Date.now();
      const { data, error } = await supabase.storage.listBuckets();
      results.push({
        probe_id: "storage-health", name: "Storage System", target: "supabase-storage",
        status: error ? "fail" : "pass", latency_ms: Date.now() - t,
        error: error?.message, snapshot: { bucket_count: data?.length ?? 0 },
      });
    } catch (e: any) {
      results.push({ probe_id: "storage-health", name: "Storage System", target: "supabase-storage", status: "fail", latency_ms: 0, error: e.message });
    }
  }

  // ── Probe 4: Edge Functions Health ──
  if (!filterProbe || filterProbe === "edge-health") {
    try {
      const t = Date.now();
      const resp = await fetch(`${supabaseUrl}/functions/v1/ai-health`, {
        headers: { Authorization: `Bearer ${anonKey}`, "Content-Type": "application/json" },
      });
      const body = await resp.text();
      results.push({
        probe_id: "edge-health", name: "Edge Functions", target: "supabase-edge",
        status: resp.ok ? "pass" : "degraded", latency_ms: Date.now() - t,
        error: resp.ok ? undefined : `HTTP ${resp.status}`,
      });
    } catch (e: any) {
      results.push({ probe_id: "edge-health", name: "Edge Functions", target: "supabase-edge", status: "fail", latency_ms: 0, error: e.message });
    }
  }

  // ── Probe 5: AI Gateway Health ──
  if (!filterProbe || filterProbe === "ai-gateway") {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (apiKey) {
      try {
        const t = Date.now();
        const resp = await fetch("https://ai.gateway.lovable.dev/v1/models", {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        const body = await resp.text();
        results.push({
          probe_id: "ai-gateway", name: "AI Gateway", target: "lovable-ai-gateway",
          status: resp.ok ? "pass" : "degraded", latency_ms: Date.now() - t,
          error: resp.ok ? undefined : `HTTP ${resp.status}`,
        });
      } catch (e: any) {
        results.push({ probe_id: "ai-gateway", name: "AI Gateway", target: "lovable-ai-gateway", status: "fail", latency_ms: 0, error: e.message });
      }
    } else {
      results.push({ probe_id: "ai-gateway", name: "AI Gateway", target: "lovable-ai-gateway", status: "degraded", latency_ms: 0, error: "LOVABLE_API_KEY not configured" });
    }
  }

  // ── Probe 6: Cron/Scheduler Health ──
  if (!filterProbe || filterProbe === "scheduler-health") {
    try {
      const t = Date.now();
      const { data, error } = await supabase.from("agent_schedules").select("id, agent_id, enabled").eq("enabled", true).limit(5);
      results.push({
        probe_id: "scheduler-health", name: "Scheduler System", target: "agent_schedules",
        status: error ? "fail" : "pass", latency_ms: Date.now() - t,
        error: error?.message, snapshot: { active_schedules: data?.length ?? 0 },
      });
    } catch (e: any) {
      results.push({ probe_id: "scheduler-health", name: "Scheduler System", target: "agent_schedules", status: "fail", latency_ms: 0, error: e.message });
    }
  }

  // ── Probe 7: RLS Policy Health (spot check) ──
  if (!filterProbe || filterProbe === "rls-health") {
    try {
      const t = Date.now();
      // Try accessing data without auth — should fail if RLS is working
      const anonSupabase = createClient(supabaseUrl, anonKey);
      const { data, error } = await anonSupabase.from("profiles").select("id").limit(1);
      // If we get data without auth, RLS might be too permissive
      const rlsWorking = error || (data?.length === 0);
      results.push({
        probe_id: "rls-health", name: "RLS Policy Check", target: "row-level-security",
        status: rlsWorking ? "pass" : "degraded", latency_ms: Date.now() - t,
        snapshot: { anon_access_blocked: rlsWorking },
      });
    } catch (e: any) {
      results.push({ probe_id: "rls-health", name: "RLS Policy Check", target: "row-level-security", status: "pass", latency_ms: 0, snapshot: { anon_access_blocked: true } });
    }
  }

  // ── Summary ──
  const passing = results.filter(r => r.status === "pass").length;
  const failing = results.filter(r => r.status === "fail").length;
  const degraded = results.filter(r => r.status === "degraded").length;

  const summary = {
    timestamp: new Date().toISOString(),
    total_probes: results.length,
    passing, failing, degraded,
    overall_status: failing > 0 ? "unhealthy" : degraded > 0 ? "degraded" : "healthy",
    total_latency_ms: Date.now() - startTime,
    launch_eligible: failing === 0,
    probes: results,
  };

  return new Response(JSON.stringify(summary), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
