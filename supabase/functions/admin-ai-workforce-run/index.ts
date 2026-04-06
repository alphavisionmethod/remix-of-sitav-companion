import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface InvocationRequest {
  role_key: string;
  task_key: string;
  scope_type?: string;
  scope_ref?: string;
  scope_payload?: Record<string, unknown>;
  budget_posture?: string;
  mode?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const supabaseUser = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body: InvocationRequest = await req.json();
    const { role_key, task_key, scope_type = "system", scope_ref, scope_payload = {}, budget_posture = "auto", mode = "real" } = body;

    // STEP 1: Validate role
    const { data: role, error: roleErr } = await supabaseAdmin
      .from("ai_workforce_roles")
      .select("*")
      .eq("user_id", user.id)
      .eq("role_key", role_key)
      .eq("is_active", true)
      .maybeSingle();

    if (roleErr || !role) {
      return new Response(JSON.stringify({ error: `Role '${role_key}' not found or inactive`, step: "validate_role" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // STEP 2: Validate task
    const { data: task, error: taskErr } = await supabaseAdmin
      .from("ai_workforce_task_types")
      .select("*")
      .eq("user_id", user.id)
      .eq("task_key", task_key)
      .eq("is_active", true)
      .maybeSingle();

    if (taskErr || !task) {
      return new Response(JSON.stringify({ error: `Task '${task_key}' not found or inactive`, step: "validate_task" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // STEP 3: Check role-task permission
    const { data: perm } = await supabaseAdmin
      .from("ai_workforce_role_task_permissions")
      .select("*")
      .eq("role_id", role.id)
      .eq("task_id", task.id)
      .eq("allowed", true)
      .maybeSingle();

    if (!perm) {
      return new Response(JSON.stringify({ error: `Role '${role_key}' not permitted for task '${task_key}'`, step: "validate_permission" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // STEP 4: Resolve budget class
    const resolvedBudgetClass = perm.preferred_budget_class || (task as any).budget_class || role.budget_class || "balanced_admin";
    const resolvedRoutingClass = perm.preferred_routing_class || (task as any).routing_class || role.default_routing_class || "balanced_assistant";

    // STEP 5: Budget check
    const budgetCheck = await supabaseAdmin.rpc("check_ai_budget_policies", {
      p_user_id: user.id,
      p_capability_key: `workforce:${role_key}:${task_key}`,
      p_estimated_cost_usd: ((task as any).max_cost_cents || 50) / 100,
    });

    if (budgetCheck.data && !budgetCheck.data.allowed) {
      // Record blocked invocation
      await supabaseAdmin.from("ai_workforce_invocations").insert({
        user_id: user.id,
        role_key,
        task_type: task_key,
        budget_class: resolvedBudgetClass,
        status: "blocked_budget",
        mode,
        scope_type,
        scope_ref,
        scope_payload,
        requested_budget_posture: budget_posture,
        resolved_routing_class: resolvedRoutingClass,
        invoked_by_user_id: user.id,
        cost_cents: 0,
        tokens_used: 0,
        latency_ms: 0,
        fallback_occurred: false,
      });

      return new Response(JSON.stringify({
        status: "blocked_budget",
        reason: budgetCheck.data.reason,
        policy_key: budgetCheck.data.policy_key,
      }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // STEP 6: Check cache
    let cachedOutput = null;
    if ((task as any).allows_cached_output !== false) {
      const scopeHash = btoa(JSON.stringify({ role_key, task_key, scope_type, scope_ref, scope_payload })).slice(0, 64);
      const { data: cached } = await supabaseAdmin
        .from("ai_workforce_cached_outputs")
        .select("*")
        .eq("scope_hash", scopeHash)
        .gt("fresh_until", new Date().toISOString())
        .maybeSingle();

      if (cached) {
        cachedOutput = cached;
      }
    }

    // STEP 7: Create invocation record
    const startedAt = new Date().toISOString();
    const { data: invocation, error: invErr } = await supabaseAdmin
      .from("ai_workforce_invocations")
      .insert({
        user_id: user.id,
        role_key,
        task_type: task_key,
        budget_class: resolvedBudgetClass,
        status: cachedOutput ? "success" : "running",
        mode,
        scope_type,
        scope_ref,
        scope_payload,
        requested_budget_posture: budget_posture,
        resolved_routing_class: resolvedRoutingClass,
        used_cached_output: !!cachedOutput,
        cached_output_ref: cachedOutput?.id || null,
        invoked_by_user_id: user.id,
        started_at: startedAt,
        cost_cents: 0,
        tokens_used: 0,
        latency_ms: 0,
        fallback_occurred: false,
      })
      .select()
      .single();

    if (invErr || !invocation) {
      return new Response(JSON.stringify({ error: "Failed to create invocation", detail: invErr?.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // If cached, return early
    if (cachedOutput) {
      // Increment reuse count
      await supabaseAdmin
        .from("ai_workforce_cached_outputs")
        .update({ reuse_count: (cachedOutput.reuse_count || 0) + 1 })
        .eq("id", cachedOutput.id);

      // Update invocation as complete
      await supabaseAdmin
        .from("ai_workforce_invocations")
        .update({ status: "success", completed_at: new Date().toISOString(), cost_cents: 0 })
        .eq("id", invocation.id);

      return new Response(JSON.stringify({
        status: "success",
        invocation_id: invocation.id,
        cached: true,
        cache_reuse_count: (cachedOutput.reuse_count || 0) + 1,
        output: { summary: "Cached result returned", type: "cached" },
        recommendations_count: 0,
        approval_items_created: 0,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // STEP 8: Simulate AI gateway call (structured output)
    // In production, this would call the real AI provider gateway
    const simulatedOutput = {
      type: (task as any).task_family || "summary",
      title: `${role.display_name}: ${task.display_name}`,
      summary: `Analysis complete for scope: ${scope_type}/${scope_ref || "all"}. Budget class: ${resolvedBudgetClass}. Routing: ${resolvedRoutingClass}.`,
      structured_payload: {
        role_key,
        task_key,
        scope: { type: scope_type, ref: scope_ref, payload: scope_payload },
        findings: [],
        recommendations: [],
        confidence: 0.82,
        mode,
      },
      confidence_class: "high",
      cost_cents: resolvedBudgetClass === "premium_architecture" ? 25 : resolvedBudgetClass === "economy_admin" ? 3 : 8,
      tokens_used: resolvedBudgetClass === "premium_architecture" ? 2500 : resolvedBudgetClass === "economy_admin" ? 500 : 1200,
      latency_ms: Math.floor(Math.random() * 3000) + 500,
    };

    // STEP 9: Persist output
    const { data: output } = await supabaseAdmin
      .from("ai_workforce_outputs")
      .insert({
        user_id: user.id,
        invocation_id: invocation.id,
        output_type: simulatedOutput.type,
        title: simulatedOutput.title,
        summary_text: simulatedOutput.summary,
        structured_payload: simulatedOutput.structured_payload,
        confidence_class: simulatedOutput.confidence_class,
        launch_honesty_class: role.launch_honesty_class || "internal_only",
        contains_recommendations: false,
        contains_proposed_actions: false,
        contains_sensitive_suggestions: false,
      })
      .select()
      .single();

    // STEP 10: Update invocation with results
    const completedAt = new Date().toISOString();
    await supabaseAdmin
      .from("ai_workforce_invocations")
      .update({
        status: "success",
        completed_at: completedAt,
        cost_cents: simulatedOutput.cost_cents,
        tokens_used: simulatedOutput.tokens_used,
        latency_ms: simulatedOutput.latency_ms,
        output_summary: simulatedOutput.summary,
        output_data: simulatedOutput.structured_payload,
        provider_used: "simulated",
        model_used: resolvedBudgetClass === "premium_architecture" ? "gpt-4o" : "gpt-4o-mini",
      })
      .eq("id", invocation.id);

    // Update role health
    await supabaseAdmin
      .from("ai_workforce_role_health")
      .upsert({
        user_id: user.id,
        role_id: role.id,
        health_state: "healthy",
        last_success_at: completedAt,
        last_used_at: completedAt,
      }, { onConflict: "role_id" })
      .select();

    // Cache output
    if ((task as any).allows_cached_output !== false) {
      const scopeHash = btoa(JSON.stringify({ role_key, task_key, scope_type, scope_ref, scope_payload })).slice(0, 64);
      const freshUntil = new Date(Date.now() + 3600_000).toISOString(); // 1 hour
      await supabaseAdmin
        .from("ai_workforce_cached_outputs")
        .upsert({
          user_id: user.id,
          role_id: role.id,
          task_id: task.id,
          scope_hash: scopeHash,
          scope_summary: `${scope_type}/${scope_ref || "all"}`,
          output_id: output?.id,
          fresh_until: freshUntil,
          reuse_count: 0,
        }, { onConflict: "role_id,task_id,scope_hash" })
        .select();
    }

    return new Response(JSON.stringify({
      status: "success",
      invocation_id: invocation.id,
      output_id: output?.id,
      cached: false,
      output: {
        type: simulatedOutput.type,
        title: simulatedOutput.title,
        summary: simulatedOutput.summary,
        confidence: simulatedOutput.confidence_class,
        launch_honesty: role.launch_honesty_class,
      },
      cost: {
        cents: simulatedOutput.cost_cents,
        tokens: simulatedOutput.tokens_used,
        budget_class: resolvedBudgetClass,
        routing_class: resolvedRoutingClass,
      },
      latency_ms: simulatedOutput.latency_ms,
      recommendations_count: 0,
      approval_items_created: 0,
      degraded: false,
      fallback: false,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    console.error("Workforce run error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
