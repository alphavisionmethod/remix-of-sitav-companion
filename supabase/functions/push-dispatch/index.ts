// ═══════════════════════════════════════════════════════════════
// SITA OS — Push Dispatch Edge Function
// Delivers push notifications via FCM, APNs, and Web Push (VAPID)
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders, handleCors, corsResponse, corsError } from "../_shared/cors.ts";

interface PushPayload {
  notification_id: string;
  user_id: string;
  title: string;
  body?: string;
  urgency?: string;
  action_url?: string;
  category?: string;
}

interface DeviceToken {
  id: string;
  platform: "web" | "ios" | "android" | "electron";
  token: string;
  endpoint: string | null;
  auth_key: string | null;
  p256dh: string | null;
}

// ── Web Push (VAPID) ─────────────────────────────────────────

function base64UrlEncode(data: Uint8Array): string {
  let binary = "";
  for (const byte of data) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function importVapidKey(pem: string): Promise<CryptoKey> {
  const b64 = pem
    .replace(/-----BEGIN EC PRIVATE KEY-----/, "")
    .replace(/-----END EC PRIVATE KEY-----/, "")
    .replace(/\s/g, "");
  const der = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey("pkcs8", der, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
}

async function createVapidAuthHeader(
  audience: string,
  subject: string,
  publicKey: string,
  privateKeyPem: string,
): Promise<string> {
  const header = base64UrlEncode(new TextEncoder().encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const now = Math.floor(Date.now() / 1000);
  const payload = base64UrlEncode(
    new TextEncoder().encode(JSON.stringify({ aud: audience, exp: now + 86400, sub: subject })),
  );
  const signingInput = `${header}.${payload}`;
  const key = await importVapidKey(privateKeyPem);
  const sig = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    new TextEncoder().encode(signingInput),
  );
  // Convert DER signature to raw r||s
  const rawSig = new Uint8Array(sig);
  const token = `${signingInput}.${base64UrlEncode(rawSig)}`;
  return `vapid t=${token},k=${publicKey}`;
}

async function sendWebPush(
  token: DeviceToken,
  payload: PushPayload,
): Promise<{ success: boolean; removeToken?: boolean }> {
  const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
  const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
  const vapidSubject = Deno.env.get("VAPID_SUBJECT") || "mailto:admin@sita-os.app";

  if (!vapidPublicKey || !vapidPrivateKey || !token.endpoint) {
    return { success: false };
  }

  try {
    const audience = new URL(token.endpoint).origin;
    const authorization = await createVapidAuthHeader(audience, vapidSubject, vapidPublicKey, vapidPrivateKey);

    const body = JSON.stringify({
      title: payload.title,
      body: payload.body || "",
      icon: "/pwa-192x192.png",
      badge: "/pwa-64x64.png",
      data: { action_url: payload.action_url, notification_id: payload.notification_id },
      tag: payload.category || "default",
    });

    const res = await fetch(token.endpoint, {
      method: "POST",
      headers: {
        Authorization: authorization,
        "Content-Type": "application/json",
        TTL: "86400",
        Urgency: payload.urgency === "critical" ? "high" : "normal",
      },
      body,
    });

    if (res.status === 410 || res.status === 404) {
      return { success: false, removeToken: true };
    }

    return { success: res.ok };
  } catch {
    return { success: false };
  }
}

// ── FCM (v1 HTTP API) ────────────────────────────────────────

async function getFcmAccessToken(serviceAccountJson: string): Promise<string | null> {
  try {
    const sa = JSON.parse(serviceAccountJson);
    const now = Math.floor(Date.now() / 1000);
    const header = base64UrlEncode(new TextEncoder().encode(JSON.stringify({ alg: "RS256", typ: "JWT" })));
    const claimSet = base64UrlEncode(
      new TextEncoder().encode(
        JSON.stringify({
          iss: sa.client_email,
          scope: "https://www.googleapis.com/auth/firebase.messaging",
          aud: "https://oauth2.googleapis.com/token",
          iat: now,
          exp: now + 3600,
        }),
      ),
    );

    const pem = sa.private_key
      .replace(/-----BEGIN RSA PRIVATE KEY-----/, "")
      .replace(/-----END RSA PRIVATE KEY-----/, "")
      .replace(/-----BEGIN PRIVATE KEY-----/, "")
      .replace(/-----END PRIVATE KEY-----/, "")
      .replace(/\s/g, "");
    const keyData = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));
    const key = await crypto.subtle.importKey("pkcs8", keyData, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);

    const sigInput = `${header}.${claimSet}`;
    const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(sigInput));
    const jwt = `${sigInput}.${base64UrlEncode(new Uint8Array(signature))}`;

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
    });

    const data = await tokenRes.json();
    return data.access_token || null;
  } catch {
    return null;
  }
}

async function sendFcm(
  token: DeviceToken,
  payload: PushPayload,
): Promise<{ success: boolean; removeToken?: boolean }> {
  const serviceAccountJson = Deno.env.get("FCM_SERVICE_ACCOUNT_JSON");
  if (!serviceAccountJson) return { success: false };

  try {
    const sa = JSON.parse(serviceAccountJson);
    const projectId = sa.project_id;
    const accessToken = await getFcmAccessToken(serviceAccountJson);
    if (!accessToken) return { success: false };

    const res = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          token: token.token,
          notification: { title: payload.title, body: payload.body || "" },
          data: {
            action_url: payload.action_url || "",
            notification_id: payload.notification_id,
            urgency: payload.urgency || "low",
          },
          android: {
            priority: payload.urgency === "critical" ? "HIGH" : "NORMAL",
            notification: { channel_id: "sita_os_default" },
          },
        },
      }),
    });

    const body = await res.text();
    if (body.includes("NOT_FOUND") || body.includes("UNREGISTERED")) {
      return { success: false, removeToken: true };
    }

    return { success: res.ok };
  } catch {
    return { success: false };
  }
}

// ── APNs ─────────────────────────────────────────────────────

async function sendApns(
  token: DeviceToken,
  payload: PushPayload,
): Promise<{ success: boolean; removeToken?: boolean }> {
  const keyId = Deno.env.get("APNS_KEY_ID");
  const teamId = Deno.env.get("APNS_TEAM_ID");
  const privateKey = Deno.env.get("APNS_PRIVATE_KEY");
  const bundleId = Deno.env.get("APNS_BUNDLE_ID");

  if (!keyId || !teamId || !privateKey || !bundleId) return { success: false };

  try {
    const now = Math.floor(Date.now() / 1000);
    const header = base64UrlEncode(new TextEncoder().encode(JSON.stringify({ alg: "ES256", kid: keyId })));
    const claims = base64UrlEncode(
      new TextEncoder().encode(JSON.stringify({ iss: teamId, iat: now })),
    );

    const key = await importVapidKey(privateKey);
    const sigInput = `${header}.${claims}`;
    const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, new TextEncoder().encode(sigInput));
    const jwt = `${sigInput}.${base64UrlEncode(new Uint8Array(sig))}`;

    const apnsHost = "https://api.push.apple.com";
    const res = await fetch(`${apnsHost}/3/device/${token.token}`, {
      method: "POST",
      headers: {
        Authorization: `bearer ${jwt}`,
        "apns-topic": bundleId,
        "apns-priority": payload.urgency === "critical" ? "10" : "5",
        "apns-push-type": "alert",
      },
      body: JSON.stringify({
        aps: {
          alert: { title: payload.title, body: payload.body || "" },
          badge: 1,
          sound: "default",
          "mutable-content": 1,
        },
        action_url: payload.action_url,
        notification_id: payload.notification_id,
      }),
    });

    if (res.status === 410) {
      return { success: false, removeToken: true };
    }

    await res.text();
    return { success: res.ok };
  } catch {
    return { success: false };
  }
}

// ── Main Handler ─────────────────────────────────────────────

Deno.serve(async (req) => {
  const corsRes = handleCors(req);
  if (corsRes) return corsRes;

  try {
    const payload: PushPayload = await req.json();

    if (!payload.user_id || !payload.title) {
      return corsError("Missing user_id or title", 400);
    }

    // Get service client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Fetch active tokens for user
    const { data: tokens, error: tokensErr } = await supabase
      .from("device_push_tokens")
      .select("id, platform, token, endpoint, auth_key, p256dh")
      .eq("user_id", payload.user_id)
      .eq("active", true);

    if (tokensErr || !tokens?.length) {
      return corsResponse({ sent: 0, reason: "no_active_tokens" });
    }

    const results: Array<{ platform: string; success: boolean }> = [];
    const tokensToRemove: string[] = [];

    for (const t of tokens as DeviceToken[]) {
      let result: { success: boolean; removeToken?: boolean };

      switch (t.platform) {
        case "web":
          result = await sendWebPush(t, payload);
          break;
        case "android":
          result = await sendFcm(t, payload);
          break;
        case "ios":
          result = await sendApns(t, payload);
          break;
        case "electron":
          // Electron uses realtime channel, not push — skip
          result = { success: true };
          break;
        default:
          result = { success: false };
      }

      results.push({ platform: t.platform, success: result.success });

      if (result.removeToken) {
        tokensToRemove.push(t.id);
      } else if (result.success) {
        // Update last_used_at
        await supabase
          .from("device_push_tokens")
          .update({ last_used_at: new Date().toISOString() })
          .eq("id", t.id);
      }
    }

    // Remove invalid tokens
    if (tokensToRemove.length > 0) {
      await supabase
        .from("device_push_tokens")
        .update({ active: false })
        .in("id", tokensToRemove);
    }

    // Update notification status
    if (payload.notification_id) {
      await supabase
        .from("notifications_queue")
        .update({ status: results.some((r) => r.success) ? "delivered" : "failed" })
        .eq("id", payload.notification_id);
    }

    return corsResponse({
      sent: results.filter((r) => r.success).length,
      total: results.length,
      results,
      removed_tokens: tokensToRemove.length,
    });
  } catch (err) {
    console.error("push-dispatch error:", err);
    return corsError("Internal error", 500);
  }
});
