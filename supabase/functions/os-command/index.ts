import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleCors, corsResponse, corsError } from "../_shared/cors.ts";
import { requireAdmin, getServiceClient } from "../_shared/auth.ts";
import { validateBody } from "../_shared/validate.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";
import { EdgeLogger } from "../_shared/logger.ts";
import { corsHeaders } from "../_shared/cors.ts";

const ALLOWED_COMMANDS = ["restart-service", "update-now", "run-backup", "clear-cache", "rotate-certs", "health-check"];
const logger = new EdgeLogger("os-command");

serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const auth = await requireAdmin(req);
    if (auth instanceof Response) return auth;

    const rl = checkRateLimit(`os-command:${auth.user.id}`, 20, 60_000);
    if (!rl.allowed) return rateLimitResponse(rl, corsHeaders);
    logger.info("os-command request", { userId: auth.user.id });

    if (req.method === "POST") {
      const body = await validateBody(req, {
        device_id: { type: "string", required: true, maxLength: 255 },
        command: { type: "string", required: true, enum: ALLOWED_COMMANDS },
        params: { type: "object" },
      });
      if (body instanceof Response) return body;
      const { device_id, command, params } = body as { device_id: string; command: string; params?: Record<string, unknown> };

      const adminClient = getServiceClient();

      // Store command for device to poll
      await adminClient.from("agent_signals").insert({
        agent_id: device_id,
        user_id: auth.user.id,
        signal_type: `os_command:${command}`,
        payload: { command, params: params || {}, issued_by: auth.user.id, issued_at: new Date().toISOString() },
        priority: command === "update-now" ? "high" : "normal",
      });

      await adminClient.from("audit_logs").insert({
        user_id: auth.user.id,
        action: `os_command:${command}`,
        category: "admin",
        actor: "admin",
        target_type: "device",
        target_id: device_id,
        severity: "high",
        details: { command, params },
      });

      return corsResponse({ success: true, message: `Command '${command}' queued for device ${device_id}` });
    }

    if (req.method === "GET") {
      const url = new URL(req.url);
      const deviceId = url.searchParams.get("device_id");
      if (!deviceId) return corsError("device_id required", 400);

      const adminClient = getServiceClient();
      const { data: commands } = await adminClient.from("agent_signals")
        .select("*")
        .eq("agent_id", deviceId)
        .like("signal_type", "os_command:%")
        .eq("processed", false)
        .order("created_at", { ascending: true });

      return corsResponse({ commands: commands || [] });
    }

    return corsError("Method not allowed", 405);
  } catch (e) {
    console.error("os-command error:", e);
    return corsError(e instanceof Error ? e.message : "Unknown", 500);
  }
});
