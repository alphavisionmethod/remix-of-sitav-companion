// ═══════════════════════════════════════════════════════════════
// SITA OS — Webhook Replay (Edge Function)
// Admin-only: fetch failed webhooks and replay them.
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Verify caller is admin
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin");

    if (!roles || roles.length === 0) {
      return new Response(JSON.stringify({ error: "Admin role required" }), { status: 403, headers: corsHeaders });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "list";

    if (action === "list") {
      // List failed webhook deliveries from webhook_delivery_log
      const { data: failures, error } = await supabase
        .from("webhook_delivery_log")
        .select("*")
        .in("status", ["failed", "error", "timeout"])
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
      }

      return new Response(JSON.stringify({ failures: failures ?? [], count: failures?.length ?? 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "replay") {
      const { webhook_id } = await req.json();
      if (!webhook_id) {
        return new Response(JSON.stringify({ error: "webhook_id required" }), { status: 400, headers: corsHeaders });
      }

      // Fetch the original webhook entry
      const { data: webhook, error: fetchErr } = await supabase
        .from("webhook_delivery_log")
        .select("*")
        .eq("id", webhook_id)
        .maybeSingle();

      if (fetchErr || !webhook) {
        return new Response(JSON.stringify({ error: "Webhook not found" }), { status: 404, headers: corsHeaders });
      }

      // Attempt replay — re-deliver the payload to the target URL
      let replayStatus = "replayed";
      let replayError: string | null = null;

      if (webhook.target_url) {
        try {
          const resp = await fetch(webhook.target_url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(webhook.payload ?? {}),
          });
          if (!resp.ok) {
            replayStatus = "replay_failed";
            replayError = `HTTP ${resp.status}`;
          }
        } catch (e) {
          replayStatus = "replay_failed";
          replayError = String(e);
        }
      } else {
        // No target URL — mark as replayed (simulated)
        replayStatus = "replayed_simulated";
      }

      // Update original record
      await supabase
        .from("webhook_delivery_log")
        .update({
          status: replayStatus,
          retry_count: (webhook.retry_count ?? 0) + 1,
          last_error: replayError,
          updated_at: new Date().toISOString(),
        })
        .eq("id", webhook_id);

      // Audit
      await supabase.from("admin_action_audit").insert({
        actor_user_id: user.id,
        action: "webhook_replay",
        target_type: "webhook",
        target_id: webhook_id,
        plane: "support",
        severity: "medium",
        justification: `Replayed webhook ${webhook_id}`,
        metadata: { replay_status: replayStatus, replay_error: replayError },
      });

      return new Response(JSON.stringify({ success: true, webhook_id, replay_status: replayStatus, replay_error: replayError }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: corsHeaders });
  }
});