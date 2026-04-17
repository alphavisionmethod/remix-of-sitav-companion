// ═══════════════════════════════════════════════════════════════
// alert-actions (Phase 20.D)
// Handles ack / suppress / assign / resolve actions on alerts.
// Admin-only — verified by has_role RPC against caller's JWT.
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Action = "ack" | "suppress" | "assign" | "resolve";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method-not-allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !serviceKey || !anonKey) {
    return new Response(JSON.stringify({ error: "server-not-configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Identify user
  const userClient = createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });
  const { data: userRes } = await userClient.auth.getUser();
  const userId = userRes?.user?.id;
  if (!userId) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Verify admin role
  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data: isAdmin } = await admin.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (!isAdmin) {
    return new Response(JSON.stringify({ error: "forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: {
    action?: Action;
    alert_id?: string;
    note?: string;
    suppress_until?: string;
    assignee_user_id?: string;
  };
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "invalid-json" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { action, alert_id } = body;
  if (!action || !alert_id) {
    return new Response(JSON.stringify({ error: "missing-fields" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const now = new Date().toISOString();
  let update: Record<string, unknown> = {};

  switch (action) {
    case "ack":
      update = { status: "acknowledged", ack_at: now, ack_by: userId };
      break;
    case "suppress":
      if (!body.suppress_until) {
        return new Response(JSON.stringify({ error: "missing-suppress_until" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      update = { status: "suppressed", suppressed_until: body.suppress_until };
      break;
    case "assign":
      if (!body.assignee_user_id) {
        return new Response(JSON.stringify({ error: "missing-assignee" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      update = { assignee_user_id: body.assignee_user_id };
      break;
    case "resolve":
      update = { status: "resolved", resolved_at: now, resolved_by: userId };
      break;
    default:
      return new Response(JSON.stringify({ error: "unknown-action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
  }

  if (body.note) {
    // Append note to metadata.notes[]
    const { data: existing } = await admin.from("alerts").select("metadata").eq("id", alert_id).maybeSingle();
    const meta = (existing?.metadata ?? {}) as Record<string, unknown>;
    const notes = Array.isArray(meta.notes) ? (meta.notes as unknown[]) : [];
    notes.push({ at: now, by: userId, note: String(body.note).slice(0, 500) });
    update.metadata = { ...meta, notes };
  }

  const { data: updated, error } = await admin
    .from("alerts")
    .update(update)
    .eq("id", alert_id)
    .select("id, status, assignee_user_id, ack_at, resolved_at")
    .maybeSingle();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true, alert: updated }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
