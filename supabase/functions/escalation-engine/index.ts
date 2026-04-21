// ═══════════════════════════════════════════════════════════════
// SITA OS — Escalation Engine Edge Function
// Scans active alerts, applies escalation policies, auto-declares
// incidents, and triggers multi-tier routing.
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 1. Fetch enabled escalation policies
    const { data: policies } = await supabase
      .from("escalation_policies")
      .select("*")
      .eq("enabled", true);

    if (!policies || policies.length === 0) {
      return new Response(JSON.stringify({ ok: true, escalated: 0, reason: "no_policies" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Fetch active alerts that haven't been recently escalated
    const { data: alerts } = await supabase
      .from("alerts")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: true });

    if (!alerts || alerts.length === 0) {
      return new Response(JSON.stringify({ ok: true, escalated: 0, reason: "no_active_alerts" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const now = Date.now();
    let escalatedCount = 0;
    const incidentsToCreate: Array<Record<string, unknown>> = [];
    const escalationLogs: Array<Record<string, unknown>> = [];

    for (const alert of alerts) {
      const alertAge = (now - new Date(alert.created_at).getTime()) / 60_000; // minutes

      // Find matching policy
      const matchedPolicy = policies.find((p: Record<string, unknown>) => {
        const severities = p.severity_match as string[];
        return severities.includes(alert.severity);
      });

      if (!matchedPolicy) continue;

      const threshold = matchedPolicy.auto_escalate_after_minutes as number;
      const currentEscCount = alert.escalation_count ?? 0;

      // Check if alert age exceeds threshold and hasn't been escalated at this tier
      if (alertAge < threshold) continue;

      // Multi-tier: escalate to next tier based on escalation_count
      const targets = matchedPolicy.escalation_targets as Array<{
        channel: string;
        target: string;
        delay_minutes: number;
      }>;

      const applicableTargets = targets.filter(
        (t) => alertAge >= threshold + t.delay_minutes
      );

      // Skip if already escalated to all applicable tiers
      if (currentEscCount >= applicableTargets.length) continue;

      // Update alert escalation count
      await supabase
        .from("alerts")
        .update({
          escalation_count: currentEscCount + 1,
          last_escalated_at: new Date().toISOString(),
        })
        .eq("id", alert.id);

      // Auto-declare incident if first escalation
      if (currentEscCount === 0) {
        incidentsToCreate.push({
          subsystem: alert.source || "unknown",
          symptom: alert.message || alert.title || "Alert escalated",
          severity: alert.severity,
          runbook_ref: null,
          suggested_kill_switch: null,
          status: "open",
        });
      }

      // Log escalation to council_escalations
      escalationLogs.push({
        source_agent_id: "escalation-engine",
        target_council: "ops",
        severity: alert.severity === "critical" ? "critical" : "high",
        reason: `Alert auto-escalated after ${Math.round(alertAge)}min (policy: ${matchedPolicy.name})`,
        evidence: {
          alert_id: alert.id,
          alert_severity: alert.severity,
          escalation_tier: currentEscCount + 1,
          policy_id: matchedPolicy.id,
        },
        status: "open",
      });

      escalatedCount++;
    }

    // Batch insert incidents
    if (incidentsToCreate.length > 0) {
      await supabase.from("incident_classifications").insert(incidentsToCreate);
    }

    // Batch insert escalation logs
    if (escalationLogs.length > 0) {
      await supabase.from("council_escalations").insert(escalationLogs);
    }

    // Trigger alert-route for each escalation
    for (const log of escalationLogs) {
      try {
        await supabase.functions.invoke("alert-route", {
          body: {
            alert_id: (log.evidence as Record<string, unknown>).alert_id,
            severity: log.severity,
            channel: "webhook",
            escalated: true,
          },
        });
      } catch {
        // Non-fatal: routing failure shouldn't block escalation
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        escalated: escalatedCount,
        incidents_created: incidentsToCreate.length,
        alerts_scanned: alerts.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[escalation-engine] error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});