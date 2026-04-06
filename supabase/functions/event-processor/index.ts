import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { handleCors, corsHeaders, corsResponse, corsError } from "../_shared/cors.ts";
import { EdgeLogger } from "../_shared/logger.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";
import { z } from "https://esm.sh/zod@3.23.8";
import { requireAuth } from "../_shared/auth.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Zod input validation
  if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
    try {
      const BodySchema = z.object({ event_type: z.string().min(1), payload: z.record(z.unknown()).optional() });
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
    // ── Standardized auth ──
    const authResult = await requireAuth(req);
    if (authResult instanceof Response) return authResult;
    const { user } = authResult;

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const userId = user.id;

    const body = await req.json().catch(() => ({}));
    const mode = body.mode || "process"; // "process" | "emit"

    // ── Emit Mode: Create a new event ──
    if (mode === "emit") {
      if (!userId) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!body.type) {
        return new Response(JSON.stringify({ error: "Event type required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: event, error } = await supabase.from("events").insert({
        user_id: userId,
        type: body.type,
        source: body.source || "user",
        payload: body.payload || {},
      }).select("id").single();

      if (error) throw error;

      return new Response(JSON.stringify({ event_id: event.id, status: "emitted" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Process Mode: Process unprocessed events ──
    // Fetch unprocessed events (optionally filter by user)
    let query = supabase
      .from("events")
      .select("*")
      .eq("processed", false)
      .order("created_at", { ascending: true })
      .limit(50);

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data: events, error: fetchError } = await query;
    if (fetchError) throw fetchError;

    if (!events || events.length === 0) {
      return new Response(JSON.stringify({ processed: 0, message: "No events to process" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: Array<{ event_id: string; type: string; workflows_triggered: number }> = [];

    for (const event of events) {
      // Find matching workflows for this event type
      const { data: workflows } = await supabase
        .from("workflows")
        .select("*")
        .eq("user_id", event.user_id)
        .eq("trigger_event", event.type)
        .eq("active", true);

      let workflowsTriggered = 0;

      if (workflows && workflows.length > 0) {
        for (const workflow of workflows) {
          // Check conditions
          const conditions = workflow.conditions as Record<string, unknown>;
          let conditionsMet = true;

          if (conditions && Object.keys(conditions).length > 0) {
            for (const [key, expected] of Object.entries(conditions)) {
              if (event.payload[key] !== expected) {
                conditionsMet = false;
                break;
              }
            }
          }

          if (!conditionsMet) continue;

          // Create workflow run
          const { data: run } = await supabase.from("workflow_runs").insert({
            user_id: event.user_id,
            workflow_id: workflow.id,
            status: "running",
            current_step: 0,
            context: { trigger_event: event.type, trigger_payload: event.payload },
          }).select("id").single();

          if (run) {
            // Create step records for tracking
            const steps = workflow.steps as Array<{ action: string; config?: Record<string, unknown> }>;
            for (let i = 0; i < steps.length; i++) {
              await supabase.from("workflow_steps").insert({
                user_id: event.user_id,
                run_id: run.id,
                step_index: i,
                action: steps[i].action,
                status: i === 0 ? "running" : "pending",
                input: steps[i].config || {},
              });
            }

            // Execute first step (simple actions only — complex ones go to Brain Core)
            const firstStep = steps[0];
            if (firstStep) {
              const stepResult = await executeStep(supabase, event.user_id, firstStep, event.payload);

              // Update first step
              await supabase.from("workflow_steps")
                .update({ status: "completed", result: stepResult, completed_at: new Date().toISOString() })
                .eq("run_id", run.id)
                .eq("step_index", 0);

              // If only one step, mark run complete
              if (steps.length === 1) {
                await supabase.from("workflow_runs")
                  .update({ status: "completed", completed_at: new Date().toISOString() })
                  .eq("id", run.id);
              } else {
                // Advance to next step
                await supabase.from("workflow_runs")
                  .update({ current_step: 1 })
                  .eq("id", run.id);
              }
            }

            workflowsTriggered++;
          }
        }
      }

      // Write memory from event if applicable
      await updateMemoryFromEvent(supabase, event);

      // Mark event as processed
      await supabase.from("events")
        .update({ processed: true, processed_at: new Date().toISOString() })
        .eq("id", event.id);

      results.push({ event_id: event.id, type: event.type, workflows_triggered: workflowsTriggered });
    }

    return new Response(JSON.stringify({ processed: results.length, results }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("Event processor error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// ── Step Executor ───────────────────────────────────────────────────────────
// deno-lint-ignore no-explicit-any
async function executeStep(
  supabase: any,
  userId: string,
  step: { action: string; config?: Record<string, unknown> },
  payload: Record<string, unknown>
): Promise<Record<string, unknown>> {
  switch (step.action) {
    case "create_task": {
      const { data } = await supabase.from("tasks").insert({
        user_id: userId,
        title: (step.config?.title as string) || `Auto-task: ${payload.type || "workflow"}`,
        description: (step.config?.description as string) || JSON.stringify(payload),
        priority: (step.config?.priority as string) || "medium",
        category: (step.config?.category as string) || "workflow",
        status: "todo",
      }).select("id").single();
      return { task_id: data?.id, status: "created" };
    }

    case "emit_event": {
      const { data } = await supabase.from("events").insert({
        user_id: userId,
        type: (step.config?.event_type as string) || "workflow.step_completed",
        source: "workflow",
        payload: { ...payload, ...(step.config?.payload as Record<string, unknown> || {}) },
      }).select("id").single();
      return { event_id: data?.id, status: "emitted" };
    }

    case "update_memory": {
      await supabase.from("user_memory").upsert({
        user_id: userId,
        category: (step.config?.category as string) || "context",
        key: (step.config?.key as string) || "workflow_result",
        value: step.config?.value || payload,
        source: "workflow",
      }, { onConflict: "user_id,category,key" }).select();
      return { status: "memory_updated" };
    }

    case "create_proof": {
      await supabase.from("proof_records").insert({
        user_id: userId,
        action_summary: (step.config?.summary as string) || "Workflow action completed",
        result: "completed",
        verification: "system-verified",
        category: (step.config?.category as string) || "workflow",
      });
      return { status: "proof_created" };
    }

    case "request_approval": {
      const { data } = await supabase.from("approval_queue").insert({
        user_id: userId,
        action_summary: (step.config?.summary as string) || "Workflow requires approval",
        proposed_action: step.config || {},
        status: "pending",
      }).select("id").single();
      return { approval_id: data?.id, status: "pending_approval" };
    }

    default:
      return { status: "unknown_action", action: step.action };
  }
}

// ── Memory Updater ──────────────────────────────────────────────────────────
// deno-lint-ignore no-explicit-any
async function updateMemoryFromEvent(
  supabase: any,
  event: { user_id: string; type: string; payload: Record<string, unknown> }
) {
  const memoryMappings: Record<string, { category: string; key: string }> = {
    "invoice.paid": { category: "history", key: "last_invoice_paid" },
    "bill.paid": { category: "history", key: "last_bill_paid" },
    "lead.converted": { category: "pattern", key: "last_lead_converted" },
    "subscription.cancelled": { category: "history", key: "last_sub_cancelled" },
  };

  const mapping = memoryMappings[event.type];
  if (mapping) {
    await supabase.from("user_memory").upsert({
      user_id: event.user_id,
      category: mapping.category,
      key: mapping.key,
      value: { ...event.payload, timestamp: new Date().toISOString() },
      source: "event_processor",
    }, { onConflict: "user_id,category,key" }).select();
  }
}
