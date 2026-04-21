// ═══════════════════════════════════════════════════════════════
// SITA OS — Webhook Replay (Edge Function)
// Admin-only: fetch failed webhooks and replay them.
// Uses shared CORS helper to prevent esm.sh import failures.
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { withCors } from "../_shared/cors.ts";

Deno.serve(withCors("webhook-replay", async (req, ctx) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Verify caller is admin
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return ctx.error("Unauthorized", 401);

  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin");

  if (!roles || roles.length === 0) return ctx.error("Admin role required", 403);

  const url = new URL(req.url);
  const action = url.searchParams.get("action") || "list";

  if (action === "list") {
    const { data: failures, error } = await supabase
      .from("webhook_delivery_log")
      .select("*")
      .in("status", ["failed", "error", "timeout"])
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) return ctx.error(error.message, 500);
    return ctx.json({ failures: failures ?? [], count: failures?.length ?? 0 });
  }

  if (action === "replay") {
    const { webhook_id } = await req.json();
    if (!webhook_id) return ctx.error("webhook_id required", 400);

    const { data: webhook, error: fetchErr } = await supabase
      .from("webhook_delivery_log")
      .select("*")
      .eq("id", webhook_id)
      .maybeSingle();

    if (fetchErr || !webhook) return ctx.error("Webhook not found", 404);

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
        await resp.text(); // consume body
      } catch (e) {
        replayStatus = "replay_failed";
        replayError = String(e);
      }
    } else {
      replayStatus = "replayed_simulated";
    }

    await supabase
      .from("webhook_delivery_log")
      .update({ status: replayStatus, retry_count: (webhook.retry_count ?? 0) + 1, last_error: replayError, updated_at: new Date().toISOString() })
      .eq("id", webhook_id);

    await supabase.from("admin_action_audit").insert({
      actor_user_id: user.id, action: "webhook_replay", target_type: "webhook", target_id: webhook_id,
      plane: "support", severity: "medium", justification: `Replayed webhook ${webhook_id}`,
      metadata: { replay_status: replayStatus, replay_error: replayError, _requestId: ctx.requestId },
    });

    return ctx.json({ success: true, webhook_id, replay_status: replayStatus, replay_error: replayError });
  }

  return ctx.error("Unknown action", 400);
}));