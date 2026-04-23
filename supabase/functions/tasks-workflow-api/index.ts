// ═══════════════════════════════════════════════════════════════
// SITA OS — Tasks & Workflow API
// Task CRUD, workflow templates, status transitions
// ═══════════════════════════════════════════════════════════════

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleCors, corsResponse, corsError } from "../_shared/cors.ts";
import { requireAuth } from "../_shared/auth.ts";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const cors = handleCors(req);
  if (cors) return cors;

  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  try {
    const body = req.method === "GET" ? { action: "list" } : await req.json();
    const { action, ...params } = body;

    switch (action) {
      case "list": {
        const query = auth.supabase
          .from("tasks")
          .select("*")
          .eq("user_id", auth.user.id)
          .order("created_at", { ascending: false });

        if (params.status) query.eq("status", params.status);
        if (params.domain) query.eq("domain", params.domain);

        const { data, error } = await query.limit(params.limit || 100);
        if (error) return corsError(error.message, 400);
        return corsResponse({ tasks: data });
      }

      case "create": {
        const { data, error } = await auth.supabase
          .from("tasks")
          .insert({
            user_id: auth.user.id,
            title: params.title,
            description: params.description,
            status: "pending",
            priority: params.priority || "medium",
            domain: params.domain || "general",
            due_date: params.due_date,
          })
          .select()
          .single();
        if (error) return corsError(error.message, 400);
        return corsResponse({ task: data }, 201);
      }

      case "update-status": {
        const validTransitions: Record<string, string[]> = {
          pending: ["in_progress", "cancelled"],
          in_progress: ["completed", "blocked", "cancelled"],
          blocked: ["in_progress", "cancelled"],
          completed: [],
          cancelled: ["pending"],
        };

        const { data: current } = await auth.supabase
          .from("tasks")
          .select("status")
          .eq("id", params.task_id)
          .eq("user_id", auth.user.id)
          .single();

        if (!current) return corsError("Task not found", 404);

        const allowed = validTransitions[current.status] || [];
        if (!allowed.includes(params.new_status)) {
          return corsError(`Cannot transition from ${current.status} to ${params.new_status}`, 400);
        }

        const { data, error } = await auth.supabase
          .from("tasks")
          .update({ status: params.new_status })
          .eq("id", params.task_id)
          .eq("user_id", auth.user.id)
          .select()
          .single();
        if (error) return corsError(error.message, 400);
        return corsResponse({ task: data });
      }

      case "list-templates": {
        const { data, error } = await auth.supabase
          .from("workflow_templates")
          .select("*")
          .or(`user_id.eq.${auth.user.id},is_public.eq.true`)
          .order("name");
        if (error) return corsError(error.message, 400);
        return corsResponse({ templates: data });
      }

      default:
        return corsError("Unknown action", 400);
    }
  } catch (err) {
    console.error("[TasksWorkflowAPI]", err);
    return corsError("Internal server error", 500);
  }
});
