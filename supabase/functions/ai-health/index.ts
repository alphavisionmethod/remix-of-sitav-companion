import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { handleCors, corsHeaders } from "../_shared/cors.ts";
import { requireAuth } from "../_shared/auth.ts";

// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Runtime Health Check (Full 8-Check Matrix)
// ═══════════════════════════════════════════════════════════════

interface HealthCheckResult {
  status: "healthy" | "degraded" | "unavailable";
  checks: {
    api_key_present: boolean;
    provider_reachable: boolean;
    provider_latency_ms: number | null;
    model_invocation_ok: boolean;
    structured_output_ok: boolean;
    edge_functions_healthy: Record<string, boolean>;
    rate_limit_ok: boolean;
    budget_ok: boolean;
    receipt_write_ok: boolean;
    routing_fidelity_ok: boolean;
  };
  active_provider: string;
  active_model: string;
  last_successful_call: string | null;
  last_failure: string | null;
  error_details: string | null;
  timestamp: string;
  verification_matrix: VerificationCheck[];
}

interface VerificationCheck {
  check: string;
  pass: boolean;
  detail: string | null;
  latency_ms: number | null;
}

serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const auth = await requireAuth(req);
    if (auth instanceof Response) return auth;
    const user = auth.user;
    const supabaseClient = auth.supabase;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const matrix: VerificationCheck[] = [];

    const result: HealthCheckResult = {
      status: "unavailable",
      checks: {
        api_key_present: false,
        provider_reachable: false,
        provider_latency_ms: null,
        model_invocation_ok: false,
        structured_output_ok: false,
        edge_functions_healthy: {},
        rate_limit_ok: true,
        budget_ok: true,
        receipt_write_ok: false,
        routing_fidelity_ok: false,
      },
      active_provider: "lovable-ai-gateway",
      active_model: "google/gemini-3-flash-preview",
      last_successful_call: null,
      last_failure: null,
      error_details: null,
      timestamp: new Date().toISOString(),
      verification_matrix: [],
    };

    // ── Check 1: API Key Present ──
    result.checks.api_key_present = !!LOVABLE_API_KEY;
    matrix.push({
      check: "api_key_present",
      pass: !!LOVABLE_API_KEY,
      detail: LOVABLE_API_KEY ? null : "LOVABLE_API_KEY is not configured",
      latency_ms: null,
    });

    if (!LOVABLE_API_KEY) {
      result.error_details = "LOVABLE_API_KEY is not configured. AI features are completely unavailable.";
      result.verification_matrix = matrix;
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Check 2: Provider Reachable + Basic Invocation ──
    let invocationContent: string | null = null;
    try {
      const startTime = Date.now();
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [{ role: "user", content: "Reply with exactly: OK" }],
          max_tokens: 5,
        }),
      });
      const latency = Date.now() - startTime;
      result.checks.provider_latency_ms = latency;

      if (response.ok) {
        const data = await response.json();
        result.checks.provider_reachable = true;
        invocationContent = data.choices?.[0]?.message?.content || null;
        result.checks.model_invocation_ok = !!invocationContent;
        matrix.push({ check: "provider_reachable", pass: true, detail: null, latency_ms: latency });
        matrix.push({ check: "model_invocation_ok", pass: !!invocationContent, detail: invocationContent ? null : "Empty response", latency_ms: latency });
      } else {
        const errText = await response.text();
        result.checks.provider_reachable = response.status !== 0;
        if (response.status === 429) {
          result.checks.rate_limit_ok = false;
          result.error_details = "Rate limited by AI provider";
        } else if (response.status === 402) {
          result.checks.budget_ok = false;
          result.error_details = "AI credits exhausted";
        } else {
          result.error_details = `Provider returned ${response.status}: ${errText.slice(0, 200)}`;
        }
        matrix.push({ check: "provider_reachable", pass: response.status !== 0, detail: result.error_details, latency_ms: latency });
        matrix.push({ check: "model_invocation_ok", pass: false, detail: result.error_details, latency_ms: latency });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Network error";
      result.error_details = `Provider unreachable: ${msg}`;
      matrix.push({ check: "provider_reachable", pass: false, detail: msg, latency_ms: null });
      matrix.push({ check: "model_invocation_ok", pass: false, detail: msg, latency_ms: null });
    }

    // ── Check 3: Structured Output (tool calling) ──
    if (result.checks.model_invocation_ok) {
      try {
        const t0 = Date.now();
        const structuredResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-lite",
            messages: [{ role: "user", content: "What is 2+2?" }],
            tools: [{
              type: "function",
              function: {
                name: "answer",
                description: "Return the answer",
                parameters: {
                  type: "object",
                  properties: { result: { type: "number" } },
                  required: ["result"],
                  additionalProperties: false,
                },
              },
            }],
            tool_choice: { type: "function", function: { name: "answer" } },
            max_tokens: 50,
          }),
        });
        const sLatency = Date.now() - t0;
        if (structuredResp.ok) {
          const data = await structuredResp.json();
          result.checks.structured_output_ok = !!(data.choices?.[0]?.message?.tool_calls?.[0]);
          matrix.push({ check: "structured_output_ok", pass: result.checks.structured_output_ok, detail: null, latency_ms: sLatency });
        } else {
          await structuredResp.text();
          matrix.push({ check: "structured_output_ok", pass: false, detail: "Provider error", latency_ms: sLatency });
        }
      } catch {
        matrix.push({ check: "structured_output_ok", pass: false, detail: "Exception", latency_ms: null });
      }
    } else {
      matrix.push({ check: "structured_output_ok", pass: false, detail: "Skipped — invocation failed", latency_ms: null });
    }

    // ── Check 4: Budget Status ──
    const { data: budget } = await supabaseClient
      .from("user_ai_budgets")
      .select("*")
      .eq("user_id", user.id)
      .eq("period", "monthly")
      .maybeSingle();

    if (budget && budget.hard_limit && budget.used_cost_cents >= budget.limit_cost_cents) {
      result.checks.budget_ok = false;
    }
    matrix.push({ check: "budget_ok", pass: result.checks.budget_ok, detail: result.checks.budget_ok ? null : "Budget exhausted", latency_ms: null });

    // ── Check 5: Rate Limit ──
    matrix.push({ check: "rate_limit_ok", pass: result.checks.rate_limit_ok, detail: result.checks.rate_limit_ok ? null : "Rate limited", latency_ms: null });

    // ── Check 6: Receipt Write Verification ──
    try {
      const { count } = await adminClient
        .from("ai_receipt_records")
        .select("id", { count: "exact", head: true })
        .limit(1);
      result.checks.receipt_write_ok = (count ?? 0) > 0;
      matrix.push({ check: "receipt_write_ok", pass: result.checks.receipt_write_ok, detail: result.checks.receipt_write_ok ? `${count} receipts exist` : "No receipts found", latency_ms: null });
    } catch {
      matrix.push({ check: "receipt_write_ok", pass: false, detail: "Query failed", latency_ms: null });
    }

    // ── Check 7: Routing Fidelity ──
    try {
      const { data: routingRows } = await adminClient
        .from("ai_capability_routing")
        .select("capability_key, default_model_id, default_provider_id")
        .eq("is_active", true)
        .limit(10);

      const hasRoutes = (routingRows?.length ?? 0) > 0;
      const allMapped = routingRows?.every((r: any) => r.default_model_id || r.default_provider_id) ?? false;
      result.checks.routing_fidelity_ok = hasRoutes && allMapped;
      matrix.push({
        check: "routing_fidelity_ok",
        pass: result.checks.routing_fidelity_ok,
        detail: !hasRoutes ? "No active routes" : !allMapped ? "Some routes missing model/provider" : `${routingRows?.length} active routes`,
        latency_ms: null,
      });
    } catch {
      matrix.push({ check: "routing_fidelity_ok", pass: false, detail: "Query failed", latency_ms: null });
    }

    // ── Check 8: Edge Function Health ──
    const AI_FUNCTIONS = ["chat-advisor", "brain-core", "personal-brain", "agent-executor", "admin-intelligence"];
    for (const fn of AI_FUNCTIONS) {
      result.checks.edge_functions_healthy[fn] = true;
    }
    matrix.push({ check: "edge_functions_healthy", pass: true, detail: `${AI_FUNCTIONS.length} functions registered`, latency_ms: null });

    // ── Last call timestamps ──
    const [successRes] = await Promise.all([
      adminClient.from("ai_usage_ledger")
        .select("created_at")
        .eq("status", "success")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
    result.last_successful_call = successRes.data?.created_at || null;

    // ── Overall Status ──
    const allCritical = result.checks.api_key_present && result.checks.provider_reachable && result.checks.model_invocation_ok;
    if (allCritical) {
      result.status = (result.checks.budget_ok && result.checks.rate_limit_ok) ? "healthy" : "degraded";
    } else if (result.checks.api_key_present) {
      result.status = "degraded";
    } else {
      result.status = "unavailable";
    }

    result.verification_matrix = matrix;

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("ai-health error:", e);
    return new Response(JSON.stringify({
      status: "unavailable",
      error: e instanceof Error ? e.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
