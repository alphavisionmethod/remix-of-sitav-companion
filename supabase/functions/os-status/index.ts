import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { handleCors, corsHeaders, corsResponse, corsError } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    if (req.method === "POST") {
      const body = await req.json();
      const { device_id, cpu_percent, ram_percent, disk_percent, docker_containers, tls_expiry_days, backup_age_hours, uptime_seconds } = body;

      if (!device_id) {
        return new Response(JSON.stringify({ error: "device_id required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Store metrics in device_statuses metadata
      await adminClient.from("device_statuses").upsert({
        id: device_id,
        user_id: body.user_id || "00000000-0000-0000-0000-000000000000",
        device_name: body.hostname || "unknown",
        device_type: "sita-os",
        status: cpu_percent > 90 || ram_percent > 95 ? "degraded" : "online",
        last_seen: new Date().toISOString(),
        metadata: {
          cpu_percent, ram_percent, disk_percent,
          docker_containers: docker_containers || [],
          tls_expiry_days: tls_expiry_days || null,
          backup_age_hours: backup_age_hours || null,
          uptime_seconds: uptime_seconds || 0,
          reported_at: new Date().toISOString(),
        },
      }, { onConflict: "id" });

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "GET") {
      // Return all device statuses (admin query)
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
      const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await userClient.auth.getUser();
      if (!user) {
        return new Response(JSON.stringify({ error: "Invalid token" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: devices } = await userClient.from("device_statuses")
        .select("*").eq("device_type", "sita-os").order("last_seen", { ascending: false });

      return new Response(JSON.stringify({ devices: devices || [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("os-status error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
