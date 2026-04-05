import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleCors, corsResponse, corsError } from "../_shared/cors.ts";
import { requireAdmin, getServiceClient } from "../_shared/auth.ts";
import { validateBody } from "../_shared/validate.ts";

const ALLOWED_COMMANDS = ["restart-service", "update-now", "run-backup", "clear-cache", "rotate-certs", "health-check"];

serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const auth = await requireAdmin(req);
    if (auth instanceof Response) return auth;

    if (req.method === "POST") {
      const body = await validateBody(req, {
        device_id: { type: "string", required: true, maxLength: 255 },
        command: { type: "string", required: true, enum: ALLOWED_COMMANDS },
        params: { type: "object" },
      });
      if (body instanceof Response) return body;
      const { device_id, command, params } = body as { device_id: string; command: string; params?: Record<string, unknown> };

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
