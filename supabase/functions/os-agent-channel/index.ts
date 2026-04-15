// ═══════════════════════════════════════════════════════════════
// SITA OS — OS Agent Communication Channel (Sections 22-24)
// Structured REST protocol for OS agents: register, heartbeat,
// command poll, ack, progress, result, and telemetry.
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-device-id, x-agent-token",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function adminClient() {
  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function err(message: string, status = 400) {
  return json({ error: message }, status);
}

// ── Valid command state transitions ────────────────────────────

const VALID_TRANSITIONS: Record<string, string[]> = {
  created: ["planning", "canceled"],
  planning: ["awaiting_approval", "dispatched", "failed"],
  awaiting_approval: ["approved", "denied", "canceled"],
  approved: ["dispatched"],
  dispatched: ["running", "failed"],
  running: ["verifying", "completed", "failed"],
  verifying: ["completed", "failed"],
  completed: [],
  failed: ["rolled_back"],
  rolled_back: [],
  denied: [],
  canceled: [],
};

function isValidTransition(from: string, to: string): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

// ── Route Handler ─────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/os-agent-channel\/?/, "/");
  const method = req.method;
  const db = adminClient();
  const deviceId = req.headers.get("x-device-id");

  try {
    // ── POST /register ─────────────────────────────────────────
    if (method === "POST" && path === "/register") {
      const body = await req.json();
      const { device_id, device_name, platform, capabilities, client_version } = body;

      if (!device_id || !device_name) {
        return err("device_id and device_name required");
      }

      const { data, error } = await db
        .from("cloud_devices")
        .upsert(
          {
            id: device_id,
            device_name,
            platform: platform ?? "unknown",
            client_version: client_version ?? "1.0.0",
            trust_state: "untrusted",
            last_seen_at: new Date().toISOString(),
            user_id: body.user_id,
          },
          { onConflict: "id" },
        )
        .select()
        .single();

      if (error) return err(error.message, 500);

      // Audit
      await db.from("cloud_activity_journal").insert({
        user_id: body.user_id,
        event_type: "agent.registered",
        device_id,
        device_name,
        object_type: "device",
        object_id: device_id,
        details: { capabilities, platform },
      });

      return json({ status: "registered", device: data });
    }

    // ── POST /heartbeat ────────────────────────────────────────
    if (method === "POST" && path === "/heartbeat") {
      const body = await req.json();
      const agentDeviceId = body.device_id ?? deviceId;

      if (!agentDeviceId) return err("device_id required");

      const { error } = await db
        .from("cloud_devices")
        .update({
          last_seen_at: new Date().toISOString(),
          trust_state: "trusted",
        })
        .eq("id", agentDeviceId);

      if (error) return err(error.message, 500);

      // Insert telemetry if provided
      if (body.telemetry) {
        await db.from("communication_metrics").insert({
          metric_type: "agent_heartbeat",
          value: 1,
          device_id: agentDeviceId,
          user_id: body.user_id ?? "system",
          metadata: body.telemetry,
        });
      }

      return json({ status: "ok", ts: new Date().toISOString() });
    }

    // ── GET /commands ──────────────────────────────────────────
    if (method === "GET" && path === "/commands") {
      const agentDeviceId = url.searchParams.get("device_id") ?? deviceId;
      if (!agentDeviceId) return err("device_id required");

      const { data, error } = await db
        .from("os_commands")
        .select("*")
        .or(`status.eq.dispatched,status.eq.approved`)
        .order("created_at", { ascending: true })
        .limit(10);

      if (error) return err(error.message, 500);

      // Filter by device target if present
      const filtered = (data ?? []).filter((cmd: Record<string, unknown>) => {
        const target = cmd.target as Record<string, string> | null;
        return !target?.device_id || target.device_id === agentDeviceId;
      });

      return json({
        commands: filtered.map((cmd: Record<string, unknown>) => ({
          command_id: cmd.id,
          operation: cmd.command,
          target: cmd.target,
          constraints: cmd.constraints,
          priority: cmd.priority,
          status: cmd.status,
          created_at: cmd.created_at,
        })),
      });
    }

    // ── POST /commands/:id/ack ─────────────────────────────────
    const ackMatch = path.match(/^\/commands\/([^/]+)\/ack$/);
    if (method === "POST" && ackMatch) {
      const commandId = ackMatch[1];

      const { data: cmd, error: fetchErr } = await db
        .from("os_commands")
        .select("status")
        .eq("id", commandId)
        .single();

      if (fetchErr || !cmd) return err("Command not found", 404);

      if (!isValidTransition(cmd.status, "running")) {
        return err(`Cannot transition from ${cmd.status} to running`);
      }

      const { error } = await db
        .from("os_commands")
        .update({ status: "running", updated_at: new Date().toISOString() })
        .eq("id", commandId);

      if (error) return err(error.message, 500);

      await db.from("os_command_events").insert({
        command_id: commandId,
        event_type: "status_changed",
        from_status: cmd.status,
        to_status: "running",
        actor: deviceId ?? "os-agent",
        details: { acked_at: new Date().toISOString() },
      });

      return json({ status: "acknowledged", command_id: commandId });
    }

    // ── POST /commands/:id/progress ────────────────────────────
    const progressMatch = path.match(/^\/commands\/([^/]+)\/progress$/);
    if (method === "POST" && progressMatch) {
      const commandId = progressMatch[1];
      const body = await req.json();

      await db.from("os_command_events").insert({
        command_id: commandId,
        event_type: "progress",
        details: {
          progress: body.progress ?? 0,
          phase: body.phase ?? "executing",
          message: body.message,
          timestamp: new Date().toISOString(),
        },
        actor: deviceId ?? "os-agent",
      });

      return json({ status: "recorded" });
    }

    // ── POST /commands/:id/result ──────────────────────────────
    const resultMatch = path.match(/^\/commands\/([^/]+)\/result$/);
    if (method === "POST" && resultMatch) {
      const commandId = resultMatch[1];
      const body = await req.json();
      const success = body.success ?? true;
      const newStatus = success ? "completed" : "failed";

      const { data: cmd, error: fetchErr } = await db
        .from("os_commands")
        .select("status")
        .eq("id", commandId)
        .single();

      if (fetchErr || !cmd) return err("Command not found", 404);

      if (!isValidTransition(cmd.status, newStatus)) {
        return err(`Cannot transition from ${cmd.status} to ${newStatus}`);
      }

      const { error } = await db
        .from("os_commands")
        .update({
          status: newStatus,
          result: body.result ?? null,
          error_message: body.error ?? null,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", commandId);

      if (error) return err(error.message, 500);

      await db.from("os_command_events").insert({
        command_id: commandId,
        event_type: "status_changed",
        from_status: cmd.status,
        to_status: newStatus,
        actor: deviceId ?? "os-agent",
        details: {
          success,
          result: body.result,
          error: body.error,
          verification: body.verification,
        },
      });

      // Audit
      await db.from("cloud_activity_journal").insert({
        user_id: body.user_id ?? "system",
        event_type: `command.${newStatus}`,
        object_type: "command",
        object_id: commandId,
        device_id: deviceId,
        details: { success, result: body.result },
      });

      return json({ status: newStatus, command_id: commandId });
    }

    // ── POST /telemetry ────────────────────────────────────────
    if (method === "POST" && path === "/telemetry") {
      const body = await req.json();
      const agentDeviceId = body.device_id ?? deviceId;

      if (!agentDeviceId) return err("device_id required");

      const metrics = Array.isArray(body.metrics) ? body.metrics : [body];

      const entries = metrics.map((m: Record<string, unknown>) => ({
        metric_type: (m.metric_type as string) ?? "agent_telemetry",
        value: (m.value as number) ?? 0,
        device_id: agentDeviceId,
        user_id: (m.user_id as string) ?? "system",
        metadata: m.metadata ?? m,
      }));

      const { error } = await db.from("communication_metrics").insert(entries);
      if (error) return err(error.message, 500);

      return json({ status: "recorded", count: entries.length });
    }

    return err("Not found", 404);
  } catch (e) {
    console.error("[os-agent-channel] Error:", e);
    return err("Internal server error", 500);
  }
});
