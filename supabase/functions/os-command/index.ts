import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ALLOWED_COMMANDS = ["restart-service", "update-now", "run-backup", "clear-cache", "rotate-certs", "health-check"];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Admin-only
    const { data: isAdmin } = await userClient.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST") {
      const { device_id, command, params } = await req.json();

      if (!device_id || !command) {
        return new Response(JSON.stringify({ error: "device_id and command required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!ALLOWED_COMMANDS.includes(command)) {
        return new Response(JSON.stringify({ error: `Command not allowed. Valid: ${ALLOWED_COMMANDS.join(", ")}` }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

      // Store command for device to poll
      await adminClient.from("agent_signals").insert({
        agent_id: device_id,
        user_id: user.id,
        signal_type: `os_command:${command}`,
        payload: { command, params: params || {}, issued_by: user.id, issued_at: new Date().toISOString() },
        priority: command === "update-now" ? "high" : "normal",
      });

      // Audit log
      await adminClient.from("audit_logs").insert({
        user_id: user.id,
        action: `os_command:${command}`,
        category: "admin",
        actor: "admin",
        target_type: "device",
        target_id: device_id,
        severity: "high",
        details: { command, params },
      });

      return new Response(JSON.stringify({ success: true, message: `Command '${command}' queued for device ${device_id}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET: list pending commands for a device (polled by OS agent)
    if (req.method === "GET") {
      const url = new URL(req.url);
      const deviceId = url.searchParams.get("device_id");
      if (!deviceId) {
        return new Response(JSON.stringify({ error: "device_id required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
      const { data: commands } = await adminClient.from("agent_signals")
        .select("*")
        .eq("agent_id", deviceId)
        .like("signal_type", "os_command:%")
        .eq("processed", false)
        .order("created_at", { ascending: true });

      return new Response(JSON.stringify({ commands: commands || [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("os-command error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
