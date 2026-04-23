import { handleCors, corsResponse, corsError } from "../_shared/cors.ts";
import { requireAuth } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const cors = handleCors(req);
  if (cors) return cors;

  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;
  const { user, supabase } = auth;

  const url = new URL(req.url);
  const action = url.searchParams.get("action") || "";
  const body = await req.json().catch(() => ({}));

  try {
    // LIST devices
    if (action === "list" || req.method === "GET") {
      const { data: devices } = await supabase.from("cloud_devices")
        .select("*").eq("user_id", user.id).order("last_seen_at", { ascending: false });

      const { data: sessions } = await supabase.from("cloud_device_sessions")
        .select("*").eq("user_id", user.id);

      return corsResponse({ devices: devices || [], sessions: sessions || [] });
    }

    // REGISTER device
    if (action === "register") {
      const { device_name, platform, client_version, user_agent } = body;
      if (!device_name || !platform) return corsError("device_name and platform required", 400);

      const { data: device, error } = await supabase.from("cloud_devices").insert({
        user_id: user.id,
        device_name,
        platform,
        client_version: client_version || "1.0.0",
        user_agent: user_agent || null,
        trust_state: "pending",
        ip_address: req.headers.get("x-forwarded-for") || null,
        last_seen_at: new Date().toISOString(),
      }).select().single();

      if (error) return corsError(error.message, 500);

      // Create session
      const { data: session } = await supabase.from("cloud_device_sessions").insert({
        user_id: user.id,
        device_id: device.id,
        last_ip: req.headers.get("x-forwarded-for") || null,
        last_seen: new Date().toISOString(),
      }).select().single();

      return corsResponse({ device, session });
    }

    // REVOKE device
    if (action === "revoke") {
      const { device_id } = body;
      if (!device_id) return corsError("device_id required", 400);

      await supabase.from("cloud_devices")
        .update({ trust_state: "revoked" })
        .eq("id", device_id).eq("user_id", user.id);

      await supabase.from("cloud_device_sessions")
        .update({ revoked_at: new Date().toISOString() })
        .eq("device_id", device_id).eq("user_id", user.id);

      return corsResponse({ success: true });
    }

    // UPDATE TRUST
    if (action === "trust") {
      const { device_id, trust_state } = body;
      if (!device_id || !trust_state) return corsError("device_id and trust_state required", 400);

      const validStates = ["trusted", "suspicious", "revoked", "pending"];
      if (!validStates.includes(trust_state)) return corsError("Invalid trust_state", 400);

      await supabase.from("cloud_devices")
        .update({ trust_state })
        .eq("id", device_id).eq("user_id", user.id);

      return corsResponse({ success: true });
    }

    // HEARTBEAT — update last_seen
    if (action === "heartbeat") {
      const { device_id } = body;
      if (!device_id) return corsError("device_id required", 400);

      await supabase.from("cloud_devices")
        .update({ last_seen_at: new Date().toISOString(), ip_address: req.headers.get("x-forwarded-for") || null })
        .eq("id", device_id).eq("user_id", user.id);

      return corsResponse({ success: true });
    }

    // RENAME
    if (action === "rename") {
      const { device_id, new_name } = body;
      if (!device_id || !new_name) return corsError("device_id and new_name required", 400);

      await supabase.from("cloud_devices")
        .update({ device_name: new_name })
        .eq("id", device_id).eq("user_id", user.id);

      return corsResponse({ success: true });
    }

    return corsError(`Unknown action: ${action}`, 400);
  } catch (err) {
    return corsError(err instanceof Error ? err.message : "Internal error", 500);
  }
});
