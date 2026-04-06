// ═══════════════════════════════════════════════════════════════
// SITA OS — Connector OAuth Edge Function
// Handles Google OAuth initiate + callback + token exchange
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders, handleCors, corsResponse, corsError } from "../_shared/cors.ts";
import { requireAuth } from "../_shared/auth.ts";
import { z } from "https://esm.sh/zod@3.23.8";

const InitiateSchema = z.object({
  action: z.literal("initiate"),
  connector_id: z.string().min(1),
  scopes: z.array(z.string()).optional(),
  redirect_uri: z.string().url().optional(),
});

const CallbackSchema = z.object({
  action: z.literal("callback"),
  code: z.string().min(1),
  state: z.string().min(1),
});

const DisconnectSchema = z.object({
  action: z.literal("disconnect"),
  account_id: z.string().uuid(),
});

const DEFAULT_SCOPES: Record<string, string[]> = {
  google_drive: [
    "https://www.googleapis.com/auth/drive.readonly",
    "https://www.googleapis.com/auth/drive.metadata.readonly",
  ],
  gmail_intake: [
    "https://www.googleapis.com/auth/gmail.readonly",
  ],
  google_calendar: [
    "https://www.googleapis.com/auth/calendar.readonly",
  ],
};

Deno.serve(async (req) => {
  const corsRes = handleCors(req);
  if (corsRes) return corsRes;

  try {
    const authResult = await requireAuth(req);
    if (authResult instanceof Response) return authResult;
    const { user, supabase } = authResult;

    const body = await req.json();
    const { action } = body;

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    switch (action) {
      case "initiate":
        return await handleInitiate(body, user, serviceClient);
      case "callback":
        return await handleCallback(body, user, serviceClient);
      case "disconnect":
        return await handleDisconnect(body, user, serviceClient);
      case "check_config":
        return await handleCheckConfig();
      default:
        return corsError(`Unknown action: ${action}`, 400);
    }
  } catch (err) {
    console.error("connector-oauth error:", err);
    return corsError(err instanceof Error ? err.message : "Internal error", 500);
  }
});

async function handleCheckConfig(): Promise<Response> {
  const clientId = Deno.env.get("GOOGLE_CONNECTOR_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLE_CONNECTOR_CLIENT_SECRET");
  
  return corsResponse({
    google_oauth_configured: !!(clientId && clientSecret),
    has_client_id: !!clientId,
    has_client_secret: !!clientSecret,
  });
}

async function handleInitiate(
  body: unknown,
  user: { id: string },
  supabase: ReturnType<typeof createClient>,
): Promise<Response> {
  const parsed = InitiateSchema.safeParse(body);
  if (!parsed.success) return corsError("Invalid initiate request", 400);

  const { connector_id, scopes: customScopes, redirect_uri } = parsed.data;

  const clientId = Deno.env.get("GOOGLE_CONNECTOR_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLE_CONNECTOR_CLIENT_SECRET");
  
  if (!clientId || !clientSecret) {
    return corsResponse({
      success: false,
      error: "google_oauth_not_configured",
      message: "Google connector OAuth client is not configured. Set GOOGLE_CONNECTOR_CLIENT_ID and GOOGLE_CONNECTOR_CLIENT_SECRET.",
      launch_honesty: "config_missing",
    }, 503);
  }

  const scopes = customScopes || DEFAULT_SCOPES[connector_id] || DEFAULT_SCOPES.google_drive;
  const state = crypto.randomUUID();
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const callbackUrl = redirect_uri || `${supabaseUrl}/functions/v1/connector-oauth`;

  // Persist the flow record
  await supabase.from("connector_oauth_flows").insert({
    user_id: user.id,
    connector_type: connector_id,
    state_token: state,
    requested_scopes: scopes,
    redirect_uri: callbackUrl,
    status: "pending",
  });

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", callbackUrl);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", scopes.join(" "));
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("prompt", "consent");

  return corsResponse({
    success: true,
    authorization_url: authUrl.toString(),
    state,
    scopes_requested: scopes,
    connector_id,
  });
}

async function handleCallback(
  body: unknown,
  user: { id: string },
  supabase: ReturnType<typeof createClient>,
): Promise<Response> {
  const parsed = CallbackSchema.safeParse(body);
  if (!parsed.success) return corsError("Invalid callback request", 400);

  const { code, state } = parsed.data;

  // Look up the flow
  const { data: flow, error: flowErr } = await supabase
    .from("connector_oauth_flows")
    .select("*")
    .eq("state_token", state)
    .eq("user_id", user.id)
    .eq("status", "pending")
    .single();

  if (flowErr || !flow) {
    return corsError("Invalid or expired OAuth state", 400);
  }

  const clientId = Deno.env.get("GOOGLE_CONNECTOR_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLE_CONNECTOR_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    return corsError("Google connector OAuth not configured", 503);
  }

  // Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: flow.redirect_uri || "",
      grant_type: "authorization_code",
    }),
  });

  const tokenData = await tokenRes.json();

  if (!tokenRes.ok || !tokenData.access_token) {
    // Update flow as failed
    await supabase.from("connector_oauth_flows").update({
      status: "failed",
      error_message: tokenData.error_description || tokenData.error || "Token exchange failed",
    }).eq("id", flow.id);

    return corsResponse({
      success: false,
      error: "token_exchange_failed",
      details: tokenData.error_description || tokenData.error,
    }, 400);
  }

  // Update flow as completed
  await supabase.from("connector_oauth_flows").update({
    status: "completed",
    granted_scopes: tokenData.scope?.split(" ") || flow.requested_scopes,
  }).eq("id", flow.id);

  // Get or find registry entry
  const { data: registry } = await supabase
    .from("connector_registry")
    .select("id")
    .eq("connector_id", flow.connector_type)
    .eq("user_id", user.id)
    .single();

  // Upsert connector account
  const { data: account } = await supabase.from("connector_accounts").upsert({
    user_id: user.id,
    registry_id: registry?.id,
    connector_type: flow.connector_type,
    display_name: `Google ${flow.connector_type.replace(/_/g, " ")}`,
    account_email: tokenData.id_token ? "connected" : "connected",
    status: "connected",
    connected_at: new Date().toISOString(),
    demo_mode: false,
  }, { onConflict: "connector_type,user_id" }).select().single();

  // Store tokens securely
  if (account) {
    const expiresAt = new Date(Date.now() + (tokenData.expires_in || 3600) * 1000).toISOString();
    
    await supabase.from("connector_oauth_tokens").upsert({
      user_id: user.id,
      account_id: account.id,
      provider: "google",
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || null,
      token_type: tokenData.token_type || "Bearer",
      scopes_granted: tokenData.scope?.split(" ") || flow.requested_scopes,
      expires_at: expiresAt,
      reauth_required: false,
    }, { onConflict: "account_id" }).select();

    // Write consent scope records
    const grantedScopes = tokenData.scope?.split(" ") || flow.requested_scopes || [];
    for (const scope of grantedScopes) {
      await supabase.from("consent_scope_records").insert({
        user_id: user.id,
        provider_family: "google",
        scope_value: scope,
        scope_label: scope.split("/").pop() || scope,
        scope_category: "connector",
        consent_type: "explicit",
        granted: true,
        granted_at: new Date().toISOString(),
      }).select();
    }

    // Write connector receipt
    await supabase.from("connector_receipts").insert({
      user_id: user.id,
      account_id: account.id,
      event_type: "oauth_connect",
      connector_type: flow.connector_type,
      details: {
        scopes_granted: grantedScopes,
        token_expires_at: expiresAt,
        has_refresh_token: !!tokenData.refresh_token,
      },
    });

    // Write consent ledger entry
    await supabase.from("consent_ledger").insert({
      user_id: user.id,
      provider_family: "google",
      consent_action: "grant",
      consent_type: "connector_oauth",
      scopes: grantedScopes,
      surface: "connector_hub",
    });
  }

  return corsResponse({
    success: true,
    connector_type: flow.connector_type,
    account_id: account?.id,
    scopes_granted: tokenData.scope?.split(" ") || [],
    token_expires_in: tokenData.expires_in,
    has_refresh_token: !!tokenData.refresh_token,
  });
}

async function handleDisconnect(
  body: unknown,
  user: { id: string },
  supabase: ReturnType<typeof createClient>,
): Promise<Response> {
  const parsed = DisconnectSchema.safeParse(body);
  if (!parsed.success) return corsError("Invalid disconnect request", 400);

  const { account_id } = parsed.data;

  // Get account info
  const { data: account } = await supabase
    .from("connector_accounts")
    .select("connector_type")
    .eq("id", account_id)
    .eq("user_id", user.id)
    .single();

  if (!account) return corsError("Account not found", 404);

  // Get token to revoke
  const { data: token } = await supabase
    .from("connector_oauth_tokens")
    .select("access_token")
    .eq("account_id", account_id)
    .single();

  // Revoke token at Google
  if (token?.access_token) {
    try {
      await fetch(`https://oauth2.googleapis.com/revoke?token=${token.access_token}`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
    } catch {
      // Best effort revocation
    }
  }

  // Delete token, update account
  await supabase.from("connector_oauth_tokens").delete().eq("account_id", account_id);
  await supabase.from("connector_accounts").update({
    status: "disconnected",
    disconnected_at: new Date().toISOString(),
  }).eq("id", account_id).eq("user_id", user.id);

  // Write receipt
  await supabase.from("connector_receipts").insert({
    user_id: user.id,
    account_id,
    event_type: "disconnect",
    connector_type: account.connector_type,
    details: { revoked_at_google: !!token?.access_token },
  });

  // Write consent ledger
  await supabase.from("consent_ledger").insert({
    user_id: user.id,
    provider_family: "google",
    consent_action: "revoke",
    consent_type: "connector_oauth",
    scopes: [],
    surface: "connector_hub",
  });

  return corsResponse({ success: true, disconnected: account_id });
}

function corsResponseWithStatus(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
