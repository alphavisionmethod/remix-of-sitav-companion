// ═══════════════════════════════════════════════════════════════
// SITA OS — License Gateway Edge Function
// Server-side license validation, activation, heartbeat, revocation
// + HMAC-SHA256 signed license keys & activation tokens
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function getClientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") || "unknown";
}

// ── HMAC Signing Utilities ──────────────────────────────────────

async function getHmacKey(): Promise<CryptoKey> {
  const secret = Deno.env.get("LICENSE_HMAC_SECRET");
  if (!secret) throw new Error("LICENSE_HMAC_SECRET not configured");
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function hmacSign(payload: string): Promise<string> {
  const key = await getHmacKey();
  const enc = new TextEncoder();
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacVerify(payload: string, signature: string): Promise<boolean> {
  const key = await getHmacKey();
  const enc = new TextEncoder();
  const sigBytes = new Uint8Array(
    signature.match(/.{2}/g)!.map((h) => parseInt(h, 16))
  );
  return crypto.subtle.verify("HMAC", key, sigBytes, enc.encode(payload));
}

/**
 * Creates an HMAC-signed activation token containing:
 * license_id, device_fingerprint, product_tier, issued_at
 */
async function createSignedActivationToken(
  licenseId: string,
  deviceFingerprint: string,
  productTier: string
): Promise<{ token: string; signature: string }> {
  const payload = JSON.stringify({
    lid: licenseId,
    dfp: deviceFingerprint,
    tier: productTier,
    iat: Math.floor(Date.now() / 1000),
  });
  const tokenB64 = btoa(payload);
  const signature = await hmacSign(tokenB64);
  return { token: tokenB64, signature };
}

/**
 * Verifies an HMAC-signed activation token
 */
async function verifySignedToken(
  token: string,
  signature: string
): Promise<{ valid: boolean; payload?: Record<string, unknown> }> {
  const isValid = await hmacVerify(token, signature);
  if (!isValid) return { valid: false };
  try {
    const payload = JSON.parse(atob(token));
    return { valid: true, payload };
  } catch {
    return { valid: false };
  }
}

/**
 * Generates an HMAC-signed license key: SITA-XXXX-XXXX-XXXX + signature suffix
 */
async function generateSignedLicenseKey(): Promise<{
  license_key: string;
  key_signature: string;
}> {
  const segments = [];
  for (let i = 0; i < 3; i++) {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    segments.push(
      Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase()
        .slice(0, 4)
    );
  }
  const license_key = `SITA-${segments.join("-")}`;
  const key_signature = await hmacSign(license_key);
  return { license_key, key_signature };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const svc = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const { action } = body;
    const ip = getClientIp(req);

    // Check if HMAC is configured (graceful degradation)
    const hmacConfigured = !!Deno.env.get("LICENSE_HMAC_SECRET");

    switch (action) {
      // ── Generate Key (Admin Only) ─────────────────────────────
      case "generate_key": {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) return json({ error: "Auth required" }, 401);

        const userClient = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_ANON_KEY")!,
          { global: { headers: { Authorization: authHeader } } }
        );
        const { data: { user } } = await userClient.auth.getUser();
        if (!user) return json({ error: "Unauthorized" }, 401);

        const { data: isAdmin } = await svc.rpc("has_role", { _user_id: user.id, _role: "admin" });
        if (!isAdmin) return json({ error: "Admin role required" }, 403);

        if (!hmacConfigured) {
          return json({ error: "HMAC secret not configured — cannot generate signed keys" }, 500);
        }

        const { product_tier, max_devices, expires_in_days, owner_email } = body;

        const { license_key, key_signature } = await generateSignedLicenseKey();

        const expiresAt = expires_in_days
          ? new Date(Date.now() + expires_in_days * 86400000).toISOString()
          : null;

        const { data: license, error: insertErr } = await svc
          .from("licenses")
          .insert({
            license_key,
            key_signature,
            product_tier: product_tier || "standard",
            max_devices: max_devices || 3,
            expires_at: expiresAt,
            owner_email: owner_email || null,
            status: "active",
            user_id: user.id,
          })
          .select("id, license_key, product_tier, max_devices, expires_at")
          .single();

        if (insertErr) return json({ error: insertErr.message }, 500);

        await svc.from("license_audit_log").insert({
          license_id: license.id,
          event: "key_generated_hmac",
          ip_address: ip,
          details: { generated_by: user.id, product_tier, hmac_signed: true },
        });

        return json({
          license_key,
          key_signature: key_signature.slice(0, 16) + "...",
          product_tier: license.product_tier,
          max_devices: license.max_devices,
          expires_at: license.expires_at,
          hmac_signed: true,
        });
      }

      // ── Activate ────────────────────────────────────────────
      case "activate": {
        const { license_key, device_fingerprint, device_name, platform } = body;
        if (!license_key || !device_fingerprint) {
          return json({ error: "Missing license_key or device_fingerprint" }, 400);
        }

        // Find license
        const { data: license, error: licErr } = await svc
          .from("licenses")
          .select("*")
          .eq("license_key", license_key)
          .single();

        if (licErr || !license) {
          return json({ activated: false, error: "Invalid license key" }, 404);
        }

        // ── HMAC Key Verification ──────────────────────────────
        if (hmacConfigured && license.key_signature) {
          const keyValid = await hmacVerify(license_key, license.key_signature);
          if (!keyValid) {
            await svc.from("license_audit_log").insert({
              license_id: license.id,
              event: "activation_denied_hmac_invalid",
              device_fingerprint,
              ip_address: ip,
              details: { reason: "HMAC signature mismatch — possible forged key" },
            });
            return json({ activated: false, error: "License key signature invalid" }, 403);
          }
        }

        if (license.status !== "active") {
          return json({ activated: false, error: `License is ${license.status}` }, 403);
        }

        // Check expiry
        if (license.expires_at && new Date(license.expires_at) < new Date()) {
          return json({ activated: false, error: "License expired" }, 403);
        }

        // Count active devices
        const { count } = await svc
          .from("license_activations")
          .select("*", { count: "exact", head: true })
          .eq("license_id", license.id)
          .eq("is_active", true);

        // Check if this device is already activated
        const { data: existing } = await svc
          .from("license_activations")
          .select("id")
          .eq("license_id", license.id)
          .eq("device_fingerprint", device_fingerprint)
          .eq("is_active", true)
          .maybeSingle();

        if (existing) {
          await svc
            .from("license_activations")
            .update({ last_heartbeat: new Date().toISOString() })
            .eq("id", existing.id);

          // Create signed activation token
          let activation_token: string = license.id;
          let token_signature: string | null = null;
          if (hmacConfigured) {
            const signed = await createSignedActivationToken(
              license.id,
              device_fingerprint,
              license.product_tier || "standard"
            );
            activation_token = signed.token;
            token_signature = signed.signature;
          }

          await svc.from("license_audit_log").insert({
            license_id: license.id,
            event: "reactivated",
            device_fingerprint,
            ip_address: ip,
            details: { device_name, platform, hmac_signed: hmacConfigured },
          });

          return json({
            activated: true,
            product_tier: license.product_tier,
            activation_token,
            token_signature,
            hmac_signed: hmacConfigured,
          });
        }

        // Check device limit
        if ((count || 0) >= license.max_devices) {
          await svc.from("license_audit_log").insert({
            license_id: license.id,
            event: "activation_denied_max_devices",
            device_fingerprint,
            ip_address: ip,
            details: { current_count: count, max: license.max_devices },
          });
          return json({ activated: false, error: `Max devices (${license.max_devices}) reached` }, 403);
        }

        // Create activation
        await svc.from("license_activations").insert({
          license_id: license.id,
          device_fingerprint,
          device_name: device_name || "Unknown",
          platform: platform || "unknown",
        });

        // Create signed activation token
        let activation_token: string = license.id;
        let token_signature: string | null = null;
        if (hmacConfigured) {
          const signed = await createSignedActivationToken(
            license.id,
            device_fingerprint,
            license.product_tier || "standard"
          );
          activation_token = signed.token;
          token_signature = signed.signature;
        }

        await svc.from("license_audit_log").insert({
          license_id: license.id,
          event: "activated",
          device_fingerprint,
          ip_address: ip,
          details: { device_name, platform, hmac_signed: hmacConfigured },
        });

        return json({
          activated: true,
          product_tier: license.product_tier,
          activation_token,
          token_signature,
          hmac_signed: hmacConfigured,
        });
      }

      // ── Heartbeat ───────────────────────────────────────────
      case "heartbeat": {
        const { license_key, device_fingerprint, activation_token, token_signature } = body;
        if (!license_key || !device_fingerprint) {
          return json({ valid: false, reason: "missing_params" }, 400);
        }

        // Verify HMAC token if provided
        if (hmacConfigured && activation_token && token_signature) {
          const tokenCheck = await verifySignedToken(activation_token, token_signature);
          if (!tokenCheck.valid) {
            return json({ valid: false, reason: "hmac_token_invalid" });
          }
          // Verify the token payload matches the request
          if (tokenCheck.payload?.dfp !== device_fingerprint) {
            return json({ valid: false, reason: "hmac_fingerprint_mismatch" });
          }
        }

        const { data: license } = await svc
          .from("licenses")
          .select("id, status, expires_at")
          .eq("license_key", license_key)
          .single();

        if (!license) return json({ valid: false, reason: "invalid_key" });
        if (license.status !== "active") return json({ valid: false, reason: license.status });
        if (license.expires_at && new Date(license.expires_at) < new Date()) {
          return json({ valid: false, reason: "expired" });
        }

        const { data: activation } = await svc
          .from("license_activations")
          .update({ last_heartbeat: new Date().toISOString() })
          .eq("license_id", license.id)
          .eq("device_fingerprint", device_fingerprint)
          .eq("is_active", true)
          .select("id")
          .maybeSingle();

        if (!activation) return json({ valid: false, reason: "device_not_activated" });

        return json({ valid: true, reason: "ok" });
      }

      // ── Validate ────────────────────────────────────────────
      case "validate": {
        const { license_key, device_fingerprint, activation_token, token_signature } = body;

        // Verify HMAC token if provided
        if (hmacConfigured && activation_token && token_signature) {
          const tokenCheck = await verifySignedToken(activation_token, token_signature);
          if (!tokenCheck.valid) {
            return json({ valid: false, reason: "hmac_token_invalid" });
          }
          if (tokenCheck.payload?.dfp !== device_fingerprint) {
            return json({ valid: false, reason: "hmac_fingerprint_mismatch" });
          }
        }

        const { data: license } = await svc
          .from("licenses")
          .select("id, status, product_tier, expires_at, key_signature")
          .eq("license_key", license_key)
          .single();

        if (!license) return json({ valid: false, reason: "invalid_key" });

        // Verify key signature
        if (hmacConfigured && license.key_signature) {
          const keyValid = await hmacVerify(license_key, license.key_signature);
          if (!keyValid) {
            return json({ valid: false, reason: "hmac_key_signature_invalid" });
          }
        }

        if (license.status !== "active") return json({ valid: false, reason: license.status });
        if (license.expires_at && new Date(license.expires_at) < new Date()) {
          return json({ valid: false, reason: "expired" });
        }

        const { data: activation } = await svc
          .from("license_activations")
          .select("id")
          .eq("license_id", license.id)
          .eq("device_fingerprint", device_fingerprint)
          .eq("is_active", true)
          .maybeSingle();

        if (!activation) return json({ valid: false, reason: "device_not_activated" });

        return json({ valid: true, product_tier: license.product_tier });
      }

      // ── Deactivate ──────────────────────────────────────────
      case "deactivate": {
        const { license_key, device_fingerprint } = body;

        const { data: license } = await svc
          .from("licenses")
          .select("id")
          .eq("license_key", license_key)
          .single();

        if (!license) return json({ error: "Invalid license" }, 404);

        await svc
          .from("license_activations")
          .update({ is_active: false })
          .eq("license_id", license.id)
          .eq("device_fingerprint", device_fingerprint);

        await svc.from("license_audit_log").insert({
          license_id: license.id,
          event: "deactivated",
          device_fingerprint,
          ip_address: ip,
        });

        return json({ deactivated: true });
      }

      // ── Revoke (Admin Only) ─────────────────────────────────
      case "revoke": {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) return json({ error: "Auth required" }, 401);

        const userClient = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_ANON_KEY")!,
          { global: { headers: { Authorization: authHeader } } }
        );
        const { data: { user } } = await userClient.auth.getUser();
        if (!user) return json({ error: "Unauthorized" }, 401);

        const { data: isAdmin } = await svc.rpc("has_role", { _user_id: user.id, _role: "admin" });
        if (!isAdmin) return json({ error: "Admin role required" }, 403);

        const { license_id, reason } = body;
        await svc
          .from("licenses")
          .update({ status: "revoked" })
          .eq("id", license_id);

        await svc
          .from("license_activations")
          .update({ is_active: false })
          .eq("license_id", license_id);

        await svc.from("license_audit_log").insert({
          license_id,
          event: "revoked",
          ip_address: ip,
          details: { reason: reason || "admin_action", revoked_by: user.id },
        });

        return json({ revoked: true });
      }

      // ── Verify Key Signature (Public) ───────────────────────
      case "verify_key_signature": {
        if (!hmacConfigured) {
          return json({ error: "HMAC not configured" }, 500);
        }
        const { license_key: lk } = body;
        if (!lk) return json({ error: "Missing license_key" }, 400);

        const { data: lic } = await svc
          .from("licenses")
          .select("key_signature")
          .eq("license_key", lk)
          .single();

        if (!lic || !lic.key_signature) {
          return json({ valid: false, reason: "no_signature" });
        }

        const isValid = await hmacVerify(lk, lic.key_signature);
        return json({ valid: isValid });
      }

      default:
        return json({ error: `Unknown action: ${action}` }, 400);
    }
  } catch (e) {
    return json({ error: e.message }, 500);
  }
});
