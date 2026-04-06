import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { handleCors, corsHeaders, corsResponse, corsError } from "../_shared/cors.ts";
import { EdgeLogger } from "../_shared/logger.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";
import { z } from "https://esm.sh/zod@3.23.8";

const AGENT_COUNCILS = [
  { id: "reliability-ops", name: "Reliability Operations", agents: ["connector-health", "stale-workflow", "data-freshness", "incident-response", "self-healing-controller"] },
  { id: "security-trust", name: "Security & Trust", agents: ["fraud-sentinel", "trust-auditor", "access-monitor", "policy-validator"] },
  { id: "runtime-cost", name: "Runtime Cost", agents: ["cost-guardrail", "model-router", "token-optimizer", "budget-enforcer"] },
  { id: "knowledge-coordination", name: "Knowledge Coordination", agents: ["memory-curator", "knowledge-indexer", "runbook-updater"] },
  { id: "product-build", name: "Product Build", agents: ["feature-governance", "contract-validator", "schema-checker"] },
  { id: "architecture-governance", name: "Architecture Governance", agents: ["boundary-enforcer", "dependency-auditor", "api-contract-checker"] },
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Zod input validation
  if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
    try {
      const BodySchema = z.object({ agent_id: z.string().min(1), status: z.string().optional(), metadata: z.record(z.unknown()).optional() });
      const body = await req.json();
      const parsed = BodySchema.safeParse(body);
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
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const telemetryRecords = [];
    const now = new Date().toISOString();

    for (const council of AGENT_COUNCILS) {
      for (const agentId of council.agents) {
        telemetryRecords.push({
          user_id: user.id,
          agent_id: agentId,
          metric_name: "heartbeat",
          metric_value: 1,
          metadata: { council: council.id, council_name: council.name, timestamp: now },
        });
      }
    }

    const { error: insertError } = await supabase.from("agent_telemetry").insert(telemetryRecords);
    if (insertError) throw insertError;

    return new Response(JSON.stringify({
      status: "ok",
      agents_reported: telemetryRecords.length,
      councils: AGENT_COUNCILS.length,
      timestamp: now,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("agent-heartbeat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
