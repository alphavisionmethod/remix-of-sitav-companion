// ═══════════════════════════════════════════════════════════════
// SITA OS — License Gateway Edge Function
// Server-side license validation, activation, heartbeat, revocation
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

    switch (action) {
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
          // Already activated on this device — refresh heartbeat
          await svc
            .from("license_activations")
            .update({ last_heartbeat: new Date().toISOString() })
            .eq("id", existing.id);

          await svc.from("license_audit_log").insert({
            license_id: license.id,
            event: "reactivated",
            device_fingerprint,
            ip_address: ip,
            details: { device_name, platform },
          });

          return json({
            activated: true,
            product_tier: license.product_tier,
            activation_token: license.id,
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

        await svc.from("license_audit_log").insert({
          license_id: license.id,
          event: "activated",
          device_fingerprint,
          ip_address: ip,
          details: { device_name, platform },
        });

        return json({
          activated: true,
          product_tier: license.product_tier,
          activation_token: license.id,
        });
      }

      // ── Heartbeat ───────────────────────────────────────────
      case "heartbeat": {
        const { license_key, device_fingerprint } = body;
        if (!license_key || !device_fingerprint) {
          return json({ valid: false, reason: "missing_params" }, 400);
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

        // Update heartbeat
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
        const { license_key, device_fingerprint } = body;

        const { data: license } = await svc
          .from("licenses")
          .select("id, status, product_tier, expires_at")
          .eq("license_key", license_key)
          .single();

        if (!license) return json({ valid: false, reason: "invalid_key" });
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

        // Deactivate all devices
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

      default:
        return json({ error: `Unknown action: ${action}` }, 400);
    }
  } catch (e) {
    return json({ error: e.message }, 500);
  }
});
