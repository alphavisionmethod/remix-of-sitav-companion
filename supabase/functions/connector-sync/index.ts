import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { checkAnyKillSwitchOrReject } from "../_shared/kill-switch.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const FAILURE_WINDOW_MS = 10 * 60 * 1000;
const FAILURE_THRESHOLD = 3;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function recordSyncFailure(
  svc: ReturnType<typeof createClient>,
  userId: string,
  accountId: string,
  connectorType: string,
  reason: string,
): Promise<void> {
  const cutoff = new Date(Date.now() - FAILURE_WINDOW_MS).toISOString();

  await svc.from("connector_receipts").insert({
    user_id: userId,
    account_id: accountId,
    event_type: "sync_failure",
    connector_type: connectorType,
    details: { reason, at: new Date().toISOString() },
  });

  const { count } = await svc
    .from("connector_receipts")
    .select("id", { count: "exact", head: true })
    .eq("account_id", accountId)
    .in("event_type", ["sync_failure", "proxy_failure"])
    .gte("created_at", cutoff);

  if ((count ?? 0) >= FAILURE_THRESHOLD) {
    await svc
      .from("connector_accounts")
      .update({ status: "degraded", demo_mode: true })
      .eq("id", accountId);

    await svc.from("connector_receipts").insert({
      user_id: userId,
      account_id: accountId,
      event_type: "fallback_engaged",
      connector_type: connectorType,
      details: {
        reason: `${FAILURE_THRESHOLD} failures in ${FAILURE_WINDOW_MS / 60000}min`,
        policy: "auto_3x10min",
      },
    });
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing authorization" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return json({ error: "Unauthorized" }, 401);

    const svc = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Phase 27 — KS-CONNECTORS + KS-SYNC enforcement
    const killed = await checkAnyKillSwitchOrReject(
      ["KS-CONNECTORS", "KS-SYNC"],
      svc,
    );
    if (killed) return killed;

    const body = await req.json();
    const { action, connector_id, account_id, resource_type } = body;

    switch (action) {
      case "sync": {
        try {
          // Read last cursor for this account+resource
          let cursorRow = null;
          if (account_id && resource_type) {
            const { data } = await svc
              .from("connector_sync_cursors")
              .select("cursor, last_synced_at")
              .eq("account_id", account_id)
              .eq("resource_type", resource_type)
              .maybeSingle();
            cursorRow = data;
          }

          // Record sync run
          const { data: run } = await svc.from("connector_sync_runs").insert({
            user_id: user.id,
            account_id,
            connector_type: connector_id,
            resource_type: resource_type ?? "default",
            status: "running",
            started_at: new Date().toISOString(),
            cursor: cursorRow?.cursor ?? null,
            direction: "pull",
          }).select().maybeSingle();

          // Stub: in real impl, call provider here. Advance cursor.
          const newCursor = `cur_${Date.now()}`;
          if (account_id && resource_type) {
            await svc.from("connector_sync_cursors").upsert({
              account_id,
              resource_type,
              cursor: newCursor,
              last_synced_at: new Date().toISOString(),
            }, { onConflict: "account_id,resource_type" });
          }

          if (run?.id) {
            await svc.from("connector_sync_runs").update({
              status: "completed",
              completed_at: new Date().toISOString(),
              cursor: newCursor,
              last_cursor: cursorRow?.cursor ?? null,
              records_synced: 0,
            }).eq("id", run.id);
          }

          // Receipt
          if (account_id) {
            await svc.from("connector_receipts").insert({
              user_id: user.id,
              account_id,
              event_type: "sync_complete",
              connector_type: connector_id,
              details: { cursor: newCursor, resource_type },
            });
          }

          return json({
            status: "sync_completed",
            connector_id,
            account_id,
            resource_type,
            cursor: newCursor,
            initiated_at: new Date().toISOString(),
          });
        } catch (syncErr) {
          // Wire auto-fallback policy
          if (account_id) {
            await recordSyncFailure(
              svc,
              user.id,
              account_id,
              connector_id,
              syncErr instanceof Error ? syncErr.message : "sync_error",
            );
          }
          return json({ error: "sync_failed", details: String(syncErr) }, 500);
        }
      }
      case "status": {
        return json({ status: "healthy", connector_id, checked_at: new Date().toISOString() });
      }
      case "history": {
        const { data } = await svc
          .from("connector_sync_runs")
          .select("*")
          .eq("connector_type", connector_id)
          .order("started_at", { ascending: false })
          .limit(20);
        return json({ history: data ?? [], connector_id });
      }
      default:
        return json({ error: `Unknown action: ${action}` }, 400);
    }
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "error" }, 500);
  }
});
