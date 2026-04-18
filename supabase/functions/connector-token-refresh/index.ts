// ═══════════════════════════════════════════════════════════════
// SITA OS — Connector Token Refresh Worker (Phase M8 — Real Google)
// Real Google OAuth refresh via oauth2.googleapis.com.
// Other providers fall through to no-op rotation (manual track).
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TokenRow {
  id: string;
  user_id: string;
  account_id: string;
  provider: string;
  refresh_token: string;
  rotation_count: number | null;
}

interface RefreshOutcome {
  newAccessToken: string;
  newRefreshToken?: string;
  expiresInSec: number;
}

async function refreshGoogle(refreshToken: string): Promise<RefreshOutcome> {
  const clientId = Deno.env.get("GOOGLE_CONNECTOR_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLE_CONNECTOR_CLIENT_SECRET");
  if (!clientId || !clientSecret) throw new Error("missing-google-oauth-secrets");
  const body = new URLSearchParams({
    client_id: clientId, client_secret: clientSecret,
    refresh_token: refreshToken, grant_type: "refresh_token",
  });
  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`google-refresh-failed:${resp.status}:${text.slice(0, 120)}`);
  }
  const data = await resp.json();
  return {
    newAccessToken: data.access_token,
    newRefreshToken: data.refresh_token,
    expiresInSec: typeof data.expires_in === "number" ? data.expires_in : 3600,
  };
}

async function refreshForProvider(provider: string, refreshToken: string): Promise<{ outcome: RefreshOutcome; mode: "real" | "noop" }> {
  if (provider === "google") return { outcome: await refreshGoogle(refreshToken), mode: "real" };
  return { outcome: { newAccessToken: "", expiresInSec: 3600 }, mode: "noop" };
}

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

  let rotated = 0, realRotated = 0, failed = 0;

  for (const tok of (due ?? []) as TokenRow[]) {
    try {
      const { outcome, mode } = await refreshForProvider(tok.provider, tok.refresh_token);
      const newExpiresAt = new Date(Date.now() + outcome.expiresInSec * 1000).toISOString();
      const update: Record<string, unknown> = {
        last_refreshed_at: new Date().toISOString(),
        rotation_count: (tok.rotation_count ?? 0) + 1,
        expires_at: newExpiresAt,
      };
      if (mode === "real" && outcome.newAccessToken) {
        update.access_token = outcome.newAccessToken;
        if (outcome.newRefreshToken) update.refresh_token = outcome.newRefreshToken;
      }
      const { error: upErr } = await supabase
        .from("connector_oauth_tokens")
        .update(update)
        .eq("id", tok.id);
      if (upErr) throw upErr;

      await supabase.from("connector_receipts").insert({
        user_id: tok.user_id,
        account_id: tok.account_id,
        connector_type: tok.provider,
        event_type: "refresh",
        details: { rotation_count: (tok.rotation_count ?? 0) + 1, mode },
      });
      rotated++;
      if (mode === "real") realRotated++;
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

  return new Response(JSON.stringify({ ok: true, candidates: due?.length ?? 0, rotated, realRotated, failed }), {
    status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
