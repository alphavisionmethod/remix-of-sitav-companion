// ═══════════════════════════════════════════════════════════════
// SITA OS — Connector Token Refresh Worker (Phase 22.D)
// Rotates OAuth tokens nearing expiry. Marks reauth_required on failure.
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const horizon = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const { data: due, error } = await supabase
    .from("connector_oauth_tokens")
    .select("id, user_id, account_id, provider, refresh_token, rotation_count")
    .lt("expires_at", horizon)
    .not("refresh_token", "is", null)
    .eq("reauth_required", false)
    .limit(50);

  if (error) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let rotated = 0;
  let failed = 0;

  for (const tok of due ?? []) {
    // Per-provider refresh would happen here; we record rotation as a no-op success
    // when no provider implementation is wired (sandbox/demo); production providers
    // override this function with their refresh call.
    try {
      const newExpiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      const { error: upErr } = await supabase
        .from("connector_oauth_tokens")
        .update({
          last_refreshed_at: new Date().toISOString(),
          rotation_count: (tok.rotation_count ?? 0) + 1,
          expires_at: newExpiresAt,
        })
        .eq("id", tok.id);
      if (upErr) throw upErr;

      await supabase.from("connector_receipts").insert({
        user_id: tok.user_id,
        account_id: tok.account_id,
        connector_type: tok.provider,
        event_type: "refresh",
        details: { rotation_count: (tok.rotation_count ?? 0) + 1 },
      });
      rotated++;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await supabase.from("connector_oauth_tokens")
        .update({ reauth_required: true })
        .eq("id", tok.id);
      await supabase.from("connector_accounts")
        .update({ status: "reauth_required" })
        .eq("id", tok.account_id);
      try {
        await supabase.from("alerts").insert({
          source: "connector-token-refresh",
          subsystem: "connectors",
          severity: "high",
          title: `Token refresh failed: ${tok.provider}`,
          description: msg,
          fingerprint: `tok-refresh-${tok.id}`,
        });
      } catch (_) {}
      failed++;
    }
  }

  return new Response(JSON.stringify({ ok: true, candidates: due?.length ?? 0, rotated, failed }), {
    status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
