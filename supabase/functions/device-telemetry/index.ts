import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { handleCors, corsHeaders, corsResponse, corsError } from "../_shared/cors.ts";
import { EdgeLogger } from "../_shared/logger.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const body = await req.json();
    const { device_id, user_id, hostname, metrics, version, channel } = body;

    if (!device_id) {
      return new Response(JSON.stringify({ error: "device_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Upsert device status
    await adminClient.from("device_statuses").upsert({
      id: device_id,
      user_id: user_id || "00000000-0000-0000-0000-000000000000",
      device_name: hostname || "unknown",
      device_type: "sita-os",
      status: "online",
      last_seen: new Date().toISOString(),
      os: `SITA OS ${version || "unknown"}`,
      metadata: {
        ...metrics,
        channel: channel || "stable",
        reported_at: new Date().toISOString(),
      },
    }, { onConflict: "id" });

    // Also update system_update_devices if it exists
    await adminClient.from("system_update_devices").upsert({
      device_id,
      user_id: user_id || "00000000-0000-0000-0000-000000000000",
      hostname: hostname || "unknown",
      current_version: version || "0.0.0",
      channel: channel || "stable",
      hardware_profile: metrics || {},
      last_check_at: new Date().toISOString(),
    }, { onConflict: "device_id" }).then(() => {}).catch(() => {});

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("device-telemetry error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
