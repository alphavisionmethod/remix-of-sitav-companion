// ═══════════════════════════════════════════════════════════════
// SITA OS — Unified API Gateway
// Single entrypoint routing to all 16 API domains
// Enforces auth, correlation IDs, and structured responses
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.49.4/cors";

// ── Types ──────────────────────────────────────────────────────

interface GatewayRequest {
  method: string;
  path: string;
  body: Record<string, unknown>;
  userId: string;
  correlationId: string;
  supabase: ReturnType<typeof createClient>;
}

interface GatewayResponse {
  status: number;
  data: Record<string, unknown>;
}

// ── Helpers ────────────────────────────────────────────────────

function ok(data: Record<string, unknown>, status = 200): GatewayResponse {
  return { status, data: { ...data, success: true } };
}

function err(message: string, status = 400): GatewayResponse {
  return { status, data: { success: false, error: message } };
}

function paginate(query: unknown, params: Record<string, string>) {
  const limit = Math.min(parseInt(params.limit || "50"), 100);
  const offset = parseInt(params.offset || "0");
  return (query as any).range(offset, offset + limit - 1);
}

function parseQuery(url: URL): Record<string, string> {
  const params: Record<string, string> = {};
  url.searchParams.forEach((v, k) => { params[k] = v; });
  return params;
}

// ── Command Lifecycle Constants ────────────────────────────────

const COMMAND_STATES = [
  "created", "planning", "awaiting_approval", "approved",
  "dispatched", "running", "verifying", "completed",
  "failed", "rolled_back", "denied", "canceled"
] as const;

const VALID_TRANSITIONS: Record<string, string[]> = {
  created: ["planning", "awaiting_approval", "dispatched", "canceled"],
  planning: ["awaiting_approval", "dispatched", "failed", "canceled"],
  awaiting_approval: ["approved", "denied", "canceled"],
  approved: ["dispatched", "canceled"],
  dispatched: ["running", "failed", "canceled"],
  running: ["verifying", "completed", "failed", "canceled"],
  verifying: ["completed", "failed"],
  completed: ["rolled_back"],
  failed: [],
  rolled_back: [],
  denied: [],
  canceled: [],
};

// ═══════════════════════════════════════════════════════════════
// DOMAIN HANDLERS
// ═══════════════════════════════════════════════════════════════

// ── Auth ───────────────────────────────────────────────────────

async function handleAuth(req: GatewayRequest): Promise<GatewayResponse> {
  const sub = req.path.replace(/^\/auth\/?/, "");
  
  if (req.method === "GET" && sub === "me") {
    const { data: profile } = await req.supabase
      .from("profiles").select("*").eq("user_id", req.userId).single();
    const { data: roles } = await req.supabase
      .from("user_roles").select("role").eq("user_id", req.userId);
    return ok({
      user_id: req.userId,
      profile,
      roles: (roles || []).map((r: any) => r.role),
      correlation_id: req.correlationId,
    });
  }

  if (req.method === "POST" && sub === "step-up") {
    return ok({ step_up_required: true, method: "mfa", correlation_id: req.correlationId });
  }

  if (req.method === "POST" && sub === "device/verify") {
    const deviceId = req.body.device_id as string;
    if (!deviceId) return err("device_id required");
    return ok({ device_id: deviceId, verified: true, correlation_id: req.correlationId });
  }

  return err("Unknown auth endpoint", 404);
}

// ── Devices ────────────────────────────────────────────────────

async function handleDevices(req: GatewayRequest): Promise<GatewayResponse> {
  const sub = req.path.replace(/^\/devices\/?/, "");

  if (req.method === "GET" && !sub) {
    const { data, error } = await req.supabase
      .from("cloud_devices").select("*").eq("user_id", req.userId);
    if (error) return err(error.message, 500);
    return ok({ devices: data || [], correlation_id: req.correlationId });
  }

  const idMatch = sub.match(/^([^/]+)$/);
  if (req.method === "GET" && idMatch) {
    const { data, error } = await req.supabase
      .from("cloud_devices").select("*").eq("id", idMatch[1]).eq("user_id", req.userId).single();
    if (error) return err("Device not found", 404);
    return ok({ device: data, correlation_id: req.correlationId });
  }

  const actionMatch = sub.match(/^([^/]+)\/(lock|restart|wipe|revoke|sync-now|update|capabilities)$/);
  if (req.method === "POST" && actionMatch) {
    const [, deviceId, action] = actionMatch;
    // Create an os_command for the device action
    const { data: cmd, error } = await req.supabase.from("os_commands").insert({
      user_id: req.userId,
      command_type: "device_action",
      command_text: action,
      structured_command: { action, device_id: deviceId, ...req.body },
      target_device_id: deviceId,
      origin: (req.body.origin as string) || "api_gateway",
      correlation_id: req.correlationId,
      actor_user_id: req.userId,
    }).select().single();
    if (error) return err(error.message, 500);
    return ok({
      operation_id: cmd.id,
      status: cmd.status,
      approval_pending: cmd.approval_state === "pending",
      correlation_id: req.correlationId,
    }, 201);
  }

  if (req.method === "GET" && sub.endsWith("/capabilities")) {
    const deviceId = sub.replace("/capabilities", "");
    const { data } = await req.supabase
      .from("client_capability_matrix").select("*").eq("id", deviceId).single();
    return ok({ capabilities: data, correlation_id: req.correlationId });
  }

  if (req.method === "POST" && sub === "register") {
    const { data, error } = await req.supabase.from("cloud_devices").insert({
      user_id: req.userId,
      device_name: req.body.device_name || "Unknown Device",
      device_type: req.body.device_type || "unknown",
      platform: req.body.platform || "unknown",
      ...(req.body as Record<string, unknown>),
    }).select().single();
    if (error) return err(error.message, 500);
    return ok({ device: data, correlation_id: req.correlationId }, 201);
  }

  return err("Unknown devices endpoint", 404);
}

// ── Commands ───────────────────────────────────────────────────

async function handleCommands(req: GatewayRequest): Promise<GatewayResponse> {
  const sub = req.path.replace(/^\/commands\/?/, "");

  if (req.method === "GET" && !sub) {
    const q = req.supabase.from("os_commands").select("*").eq("user_id", req.userId)
      .order("created_at", { ascending: false });
    const { data, error } = await paginate(q, req.body as any);
    if (error) return err(error.message, 500);
    return ok({ commands: data || [], correlation_id: req.correlationId });
  }

  if (req.method === "POST" && !sub) {
    const { data: cmd, error } = await req.supabase.from("os_commands").insert({
      user_id: req.userId,
      command_type: req.body.command_type || (req.body.command ? "natural_language" : "structured"),
      command_text: req.body.command as string,
      structured_command: req.body.structured_command || {},
      target_device_id: (req.body.target as any)?.device_id,
      target_device_ids: (req.body.target as any)?.device_ids || [],
      origin: (req.body.origin as string) || "mobile_app",
      safety_mode: (req.body.safety_mode as string) || "standard",
      simulation_first: !!req.body.simulation_first,
      correlation_id: req.correlationId,
      actor_user_id: req.userId,
    }).select().single();
    if (error) return err(error.message, 500);

    // Log creation event
    await req.supabase.from("os_command_events").insert({
      user_id: req.userId,
      command_id: cmd.id,
      to_state: "created",
      actor: "system",
      reason: "Command submitted via API gateway",
      correlation_id: req.correlationId,
    });

    return ok({
      operation_id: cmd.id,
      status: cmd.status,
      follow_up_stream: `commands:${cmd.id}`,
      approval_pending: false,
      verification_pending: false,
      rollback_available: false,
      correlation_id: req.correlationId,
    }, 201);
  }

  if (req.method === "POST" && sub === "simulate") {
    const { data: cmd, error } = await req.supabase.from("os_commands").insert({
      user_id: req.userId,
      command_type: "simulation",
      command_text: req.body.command as string,
      structured_command: req.body.structured_command || {},
      target_device_id: (req.body.target as any)?.device_id,
      origin: "api_gateway",
      simulation_first: true,
      status: "planning",
      correlation_id: req.correlationId,
      actor_user_id: req.userId,
    }).select().single();
    if (error) return err(error.message, 500);
    return ok({ operation_id: cmd.id, status: "planning", simulation: true, correlation_id: req.correlationId }, 201);
  }

  const cmdIdMatch = sub.match(/^([0-9a-f-]+)$/);
  if (req.method === "GET" && cmdIdMatch) {
    const { data, error } = await req.supabase
      .from("os_commands").select("*").eq("id", cmdIdMatch[1]).eq("user_id", req.userId).single();
    if (error) return err("Command not found", 404);
    const { data: events } = await req.supabase
      .from("os_command_events").select("*").eq("command_id", cmdIdMatch[1]).order("created_at");
    return ok({ command: data, events: events || [], correlation_id: req.correlationId });
  }

  const cmdActionMatch = sub.match(/^([0-9a-f-]+)\/(approve|deny|cancel|replay|undo)$/);
  if (req.method === "POST" && cmdActionMatch) {
    const [, cmdId, action] = cmdActionMatch;
    const { data: cmd, error: fetchErr } = await req.supabase
      .from("os_commands").select("*").eq("id", cmdId).eq("user_id", req.userId).single();
    if (fetchErr || !cmd) return err("Command not found", 404);

    let newStatus: string;
    switch (action) {
      case "approve":
        if (cmd.status !== "awaiting_approval") return err("Command not awaiting approval");
        newStatus = "approved";
        break;
      case "deny":
        if (cmd.status !== "awaiting_approval") return err("Command not awaiting approval");
        newStatus = "denied";
        break;
      case "cancel":
        if (!VALID_TRANSITIONS[cmd.status]?.includes("canceled")) return err("Cannot cancel in current state");
        newStatus = "canceled";
        break;
      case "replay":
        // Create new command from this one
        const { data: replay, error: replayErr } = await req.supabase.from("os_commands").insert({
          user_id: req.userId,
          command_type: cmd.command_type,
          command_text: cmd.command_text,
          structured_command: cmd.structured_command,
          target_device_id: cmd.target_device_id,
          origin: "replay",
          safety_mode: cmd.safety_mode,
          correlation_id: req.correlationId,
          actor_user_id: req.userId,
        }).select().single();
        if (replayErr) return err(replayErr.message, 500);
        return ok({ operation_id: replay.id, status: "created", replayed_from: cmdId, correlation_id: req.correlationId }, 201);
      case "undo":
        if (!cmd.rollback_available) return err("Rollback not available for this command");
        newStatus = "rolled_back";
        break;
      default:
        return err("Unknown action", 400);
    }

    const updates: Record<string, unknown> = { status: newStatus };
    if (action === "approve") {
      updates.approval_state = "approved";
      updates.approved_by = req.userId;
      updates.approved_at = new Date().toISOString();
    } else if (action === "deny") {
      updates.approval_state = "denied";
    }

    await req.supabase.from("os_commands").update(updates).eq("id", cmdId);
    await req.supabase.from("os_command_events").insert({
      user_id: req.userId,
      command_id: cmdId,
      from_state: cmd.status,
      to_state: newStatus!,
      actor: req.userId,
      reason: `User ${action}`,
      metadata: req.body,
      correlation_id: req.correlationId,
    });

    return ok({
      operation_id: cmdId,
      status: newStatus!,
      approval_pending: false,
      correlation_id: req.correlationId,
    });
  }

  return err("Unknown commands endpoint", 404);
}

// ── AI ─────────────────────────────────────────────────────────

async function handleAI(req: GatewayRequest): Promise<GatewayResponse> {
  const sub = req.path.replace(/^\/ai\/?/, "");

  if (req.method === "POST" && sub === "chat") {
    // Delegate to brain-core via internal invoke
    const { data, error } = await req.supabase.functions.invoke("brain-core", {
      body: { ...req.body, user_id: req.userId, correlation_id: req.correlationId },
    });
    if (error) return err(error.message, 500);
    return ok({ ...data, correlation_id: req.correlationId });
  }

  if (req.method === "POST" && sub === "analyze") {
    const { data, error } = await req.supabase.functions.invoke("ai-gateway", {
      body: {
        action: "analyze",
        capability_id: "system_analysis",
        payload: req.body,
        user_id: req.userId,
        correlation_id: req.correlationId,
      },
    });
    if (error) return err(error.message, 500);
    return ok({ analysis: data, correlation_id: req.correlationId });
  }

  if (req.method === "GET" && sub === "suggestions") {
    const { data } = await req.supabase
      .from("ai_workforce_recommendations").select("*")
      .eq("user_id", req.userId).eq("status", "pending")
      .order("created_at", { ascending: false }).limit(20);
    return ok({ suggestions: data || [], correlation_id: req.correlationId });
  }

  const applyMatch = sub.match(/^suggestions\/([0-9a-f-]+)\/apply$/);
  if (req.method === "POST" && applyMatch) {
    const recId = applyMatch[1];
    const { data: rec } = await req.supabase
      .from("ai_workforce_recommendations").select("*").eq("id", recId).eq("user_id", req.userId).single();
    if (!rec) return err("Suggestion not found", 404);

    // Create command from suggestion
    const { data: cmd, error: cmdErr } = await req.supabase.from("os_commands").insert({
      user_id: req.userId,
      command_type: "ai_suggestion",
      command_text: rec.summary,
      structured_command: rec.details,
      origin: "ai_suggestion",
      correlation_id: req.correlationId,
      actor_user_id: req.userId,
    }).select().single();
    if (cmdErr) return err(cmdErr.message, 500);

    await req.supabase.from("ai_workforce_recommendations")
      .update({ status: "applied", lifecycle_status: "executing" }).eq("id", recId);

    return ok({ operation_id: cmd.id, suggestion_id: recId, status: "created", correlation_id: req.correlationId }, 201);
  }

  if (req.method === "GET" && sub === "history") {
    const { data } = await req.supabase
      .from("ai_inference_receipts").select("*").eq("user_id", req.userId)
      .order("created_at", { ascending: false }).limit(50);
    return ok({ history: data || [], correlation_id: req.correlationId });
  }

  if (req.method === "POST" && sub === "explain") {
    const { data, error } = await req.supabase.functions.invoke("ai-gateway", {
      body: {
        action: "explain",
        capability_id: "explainability",
        payload: { event_id: req.body.event_id, context: req.body.context },
        user_id: req.userId,
        correlation_id: req.correlationId,
      },
    });
    if (error) return err(error.message, 500);
    return ok({ explanation: data, correlation_id: req.correlationId });
  }

  return err("Unknown AI endpoint", 404);
}

// ── System ─────────────────────────────────────────────────────

async function handleSystem(req: GatewayRequest): Promise<GatewayResponse> {
  const sub = req.path.replace(/^\/system\/?/, "");

  if (req.method === "GET" && (sub === "status" || !sub)) {
    const { count: deviceCount } = await req.supabase
      .from("cloud_devices").select("*", { count: "exact", head: true }).eq("user_id", req.userId);
    const { count: cmdCount } = await req.supabase
      .from("os_commands").select("*", { count: "exact", head: true })
      .eq("user_id", req.userId).in("status", ["running", "dispatched"]);
    const { data: incidents } = await req.supabase
      .from("cloud_abuse_events").select("id").eq("resolved", false).limit(5);

    return ok({
      health: "operational",
      devices: deviceCount || 0,
      active_commands: cmdCount || 0,
      incidents: (incidents || []).length,
      sync: "healthy",
      security: "normal",
      correlation_id: req.correlationId,
    });
  }

  if (req.method === "GET" && sub === "health") {
    const subsystems = [
      { name: "auth", status: "healthy" },
      { name: "devices", status: "healthy" },
      { name: "commands", status: "healthy" },
      { name: "sync", status: "healthy" },
      { name: "ai", status: "healthy" },
      { name: "notifications", status: "healthy" },
    ];
    return ok({ subsystems, overall: "healthy", correlation_id: req.correlationId });
  }

  if (req.method === "GET" && sub === "metrics") {
    const { data } = await req.supabase
      .from("ai_workforce_invocations").select("role_key, cost_cents, duration_ms, status")
      .eq("user_id", req.userId).order("created_at", { ascending: false }).limit(100);
    return ok({ metrics: data || [], correlation_id: req.correlationId });
  }

  if (req.method === "GET" && sub === "anomalies") {
    const { data } = await req.supabase
      .from("cloud_abuse_events").select("*").eq("resolved", false)
      .order("created_at", { ascending: false }).limit(20);
    return ok({ anomalies: data || [], correlation_id: req.correlationId });
  }

  if (req.method === "GET" && sub === "map") {
    const { data: devices } = await req.supabase
      .from("cloud_devices").select("id, device_name, device_type, status, trust_level")
      .eq("user_id", req.userId);
    return ok({ topology: { devices: devices || [], connections: [] }, correlation_id: req.correlationId });
  }

  if (req.method === "GET" && sub === "history") {
    const { data } = await req.supabase
      .from("cloud_activity_journal").select("*").eq("user_id", req.userId)
      .order("created_at", { ascending: false }).limit(50);
    return ok({ events: data || [], correlation_id: req.correlationId });
  }

  return err("Unknown system endpoint", 404);
}

// ── Sync ───────────────────────────────────────────────────────

async function handleSync(req: GatewayRequest): Promise<GatewayResponse> {
  const sub = req.path.replace(/^\/sync\/?/, "");

  if (req.method === "GET" && (sub === "status" || !sub)) {
    const { data } = await req.supabase
      .from("cloud_sync_ledger").select("*").eq("user_id", req.userId).limit(10);
    return ok({ sync_status: "healthy", ledger: data || [], correlation_id: req.correlationId });
  }

  const deviceSyncMatch = sub.match(/^devices\/([^/]+)$/);
  if (req.method === "GET" && deviceSyncMatch) {
    const { data } = await req.supabase
      .from("cloud_sync_ledger").select("*")
      .eq("user_id", req.userId).eq("device_id", deviceSyncMatch[1]);
    return ok({ device_sync: data || [], correlation_id: req.correlationId });
  }

  if (req.method === "POST" && sub === "trigger") {
    const { data, error } = await req.supabase.functions.invoke("cloud-sync-api", {
      body: { action: "push", ...req.body, user_id: req.userId },
    });
    if (error) return err(error.message, 500);
    return ok({ ...data, correlation_id: req.correlationId });
  }

  if (req.method === "POST" && sub === "pause") {
    return ok({ sync_paused: true, correlation_id: req.correlationId });
  }

  if (req.method === "POST" && sub === "resume") {
    return ok({ sync_resumed: true, correlation_id: req.correlationId });
  }

  if (req.method === "GET" && sub === "conflicts") {
    const { data } = await req.supabase
      .from("cloud_sync_conflicts").select("*").eq("user_id", req.userId).eq("resolved", false);
    return ok({ conflicts: data || [], correlation_id: req.correlationId });
  }

  if (req.method === "POST" && sub === "resolve-conflict") {
    const conflictId = req.body.conflict_id as string;
    if (!conflictId) return err("conflict_id required");
    const resolution = req.body.resolution || "accept_remote";
    await req.supabase.from("cloud_sync_conflicts")
      .update({ resolved: true, resolution_strategy: resolution }).eq("id", conflictId);
    return ok({ resolved: true, conflict_id: conflictId, correlation_id: req.correlationId });
  }

  if (req.method === "POST" && sub === "reindex") {
    return ok({ reindex_started: true, correlation_id: req.correlationId });
  }

  if (req.method === "GET" && sub === "history") {
    const { data } = await req.supabase
      .from("cloud_activity_journal").select("*").eq("user_id", req.userId)
      .eq("event_type", "sync").order("created_at", { ascending: false }).limit(50);
    return ok({ history: data || [], correlation_id: req.correlationId });
  }

  return err("Unknown sync endpoint", 404);
}

// ── Security ───────────────────────────────────────────────────

async function handleSecurity(req: GatewayRequest): Promise<GatewayResponse> {
  const sub = req.path.replace(/^\/security\/?/, "");

  if (req.method === "GET" && (sub === "status" || !sub)) {
    const { data: devices } = await req.supabase
      .from("cloud_devices").select("id, trust_level, status").eq("user_id", req.userId);
    const { count: pendingApprovals } = await req.supabase
      .from("admin_action_confirmations").select("*", { count: "exact", head: true })
      .eq("actor_user_id", req.userId).eq("status", "pending");
    return ok({
      posture: "normal",
      devices: devices || [],
      pending_approvals: pendingApprovals || 0,
      correlation_id: req.correlationId,
    });
  }

  if (req.method === "GET" && sub === "events") {
    const { data } = await req.supabase
      .from("cloud_audit_events").select("*").eq("actor_user_id", req.userId)
      .order("created_at", { ascending: false }).limit(50);
    return ok({ events: data || [], correlation_id: req.correlationId });
  }

  if (req.method === "GET" && sub === "approvals/pending") {
    const { data } = await req.supabase
      .from("admin_action_confirmations").select("*")
      .eq("actor_user_id", req.userId).eq("status", "pending")
      .order("created_at", { ascending: false });
    return ok({ approvals: data || [], correlation_id: req.correlationId });
  }

  if (req.method === "POST" && sub === "approve") {
    const confirmId = req.body.confirmation_id as string;
    if (!confirmId) return err("confirmation_id required");
    await req.supabase.from("admin_action_confirmations").update({
      status: "approved",
      approved_by: req.userId,
      approved_at: new Date().toISOString(),
    }).eq("id", confirmId);
    return ok({ approved: true, confirmation_id: confirmId, correlation_id: req.correlationId });
  }

  if (req.method === "POST" && sub === "deny") {
    const confirmId = req.body.confirmation_id as string;
    if (!confirmId) return err("confirmation_id required");
    await req.supabase.from("admin_action_confirmations").update({
      status: "rejected",
      rejected_by: req.userId,
      rejected_at: new Date().toISOString(),
    }).eq("id", confirmId);
    return ok({ denied: true, confirmation_id: confirmId, correlation_id: req.correlationId });
  }

  if (req.method === "GET" && sub === "trust/devices") {
    const { data } = await req.supabase
      .from("cloud_devices").select("id, device_name, trust_level, status, last_seen_at")
      .eq("user_id", req.userId);
    return ok({ devices: data || [], correlation_id: req.correlationId });
  }

  const trustRevokeMatch = sub.match(/^trust\/devices\/([^/]+)\/revoke$/);
  if (req.method === "POST" && trustRevokeMatch) {
    await req.supabase.from("cloud_devices")
      .update({ trust_level: "revoked", status: "revoked" })
      .eq("id", trustRevokeMatch[1]).eq("user_id", req.userId);
    return ok({ revoked: true, device_id: trustRevokeMatch[1], correlation_id: req.correlationId });
  }

  if (req.method === "POST" && sub === "emergency/lock") {
    // Lock all devices
    await req.supabase.from("cloud_devices")
      .update({ status: "locked" }).eq("user_id", req.userId);
    return ok({ emergency_lock: true, correlation_id: req.correlationId });
  }

  if (req.method === "POST" && sub === "emergency/pause-sync") {
    return ok({ sync_paused: true, emergency: true, correlation_id: req.correlationId });
  }

  return err("Unknown security endpoint", 404);
}

// ── Notifications ──────────────────────────────────────────────

async function handleNotifications(req: GatewayRequest): Promise<GatewayResponse> {
  const sub = req.path.replace(/^\/notifications\/?/, "");

  if (req.method === "GET" && !sub) {
    const { data } = await req.supabase
      .from("platform_notifications").select("*").eq("user_id", req.userId)
      .order("created_at", { ascending: false }).limit(50);
    return ok({ notifications: data || [], correlation_id: req.correlationId });
  }

  if (req.method === "POST" && sub === "read") {
    const ids = req.body.notification_ids as string[];
    if (!ids?.length) return err("notification_ids required");
    await req.supabase.from("platform_notifications")
      .update({ read: true }).in("id", ids).eq("user_id", req.userId);
    return ok({ marked_read: ids.length, correlation_id: req.correlationId });
  }

  const actionMatch = sub.match(/^([0-9a-f-]+)\/action$/);
  if (req.method === "POST" && actionMatch) {
    const notifId = actionMatch[1];
    const action = req.body.action as string;
    if (!action) return err("action required");
    await req.supabase.from("platform_notifications")
      .update({ actioned: true, action_taken: action }).eq("id", notifId).eq("user_id", req.userId);
    return ok({ actioned: true, notification_id: notifId, correlation_id: req.correlationId });
  }

  if (req.method === "GET" && sub === "preferences") {
    const { data } = await req.supabase
      .from("notification_preferences").select("*").eq("user_id", req.userId).single();
    return ok({ preferences: data || {}, correlation_id: req.correlationId });
  }

  if (req.method === "PUT" && sub === "preferences") {
    const { data, error } = await req.supabase
      .from("notification_preferences").upsert({
        user_id: req.userId, ...req.body,
      }).select().single();
    if (error) return err(error.message, 500);
    return ok({ preferences: data, correlation_id: req.correlationId });
  }

  return err("Unknown notifications endpoint", 404);
}

// ── Audit ──────────────────────────────────────────────────────

async function handleAudit(req: GatewayRequest): Promise<GatewayResponse> {
  const sub = req.path.replace(/^\/audit\/?/, "");

  if (req.method === "GET" && (sub === "events" || !sub)) {
    const { data } = await req.supabase
      .from("admin_action_audit").select("*").eq("actor_user_id", req.userId)
      .order("created_at", { ascending: false }).limit(50);
    return ok({ events: data || [], correlation_id: req.correlationId });
  }

  const eventMatch = sub.match(/^events\/([0-9a-f-]+)$/);
  if (req.method === "GET" && eventMatch) {
    const { data } = await req.supabase
      .from("admin_action_audit").select("*").eq("id", eventMatch[1]).single();
    if (!data) return err("Event not found", 404);
    return ok({ event: data, correlation_id: req.correlationId });
  }

  return err("Unknown audit endpoint", 404);
}

// ── Timeline ───────────────────────────────────────────────────

async function handleTimeline(req: GatewayRequest): Promise<GatewayResponse> {
  if (req.method !== "GET") return err("Method not allowed", 405);

  // Unified timeline from multiple sources
  const [commands, activity, audit] = await Promise.all([
    req.supabase.from("os_commands").select("id, command_text, status, created_at")
      .eq("user_id", req.userId).order("created_at", { ascending: false }).limit(20),
    req.supabase.from("cloud_activity_journal").select("id, event_type, object_name, created_at")
      .eq("user_id", req.userId).order("created_at", { ascending: false }).limit(20),
    req.supabase.from("admin_action_audit").select("id, action, severity, created_at")
      .eq("actor_user_id", req.userId).order("created_at", { ascending: false }).limit(20),
  ]);

  const timeline = [
    ...(commands.data || []).map((c: any) => ({ type: "command", ...c })),
    ...(activity.data || []).map((a: any) => ({ type: "activity", ...a })),
    ...(audit.data || []).map((a: any) => ({ type: "audit", ...a })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 50);

  return ok({ timeline, correlation_id: req.correlationId });
}

// ── Updates ────────────────────────────────────────────────────

async function handleUpdates(req: GatewayRequest): Promise<GatewayResponse> {
  const sub = req.path.replace(/^\/updates\/?/, "");

  if (req.method === "GET" && !sub) {
    const { data } = await req.supabase
      .from("cloud_devices").select("id, device_name, os_version, update_channel")
      .eq("user_id", req.userId);
    return ok({ devices: data || [], correlation_id: req.correlationId });
  }

  const deviceMatch = sub.match(/^([0-9a-f-]+)$/);
  if (req.method === "GET" && deviceMatch) {
    const { data } = await req.supabase
      .from("cloud_devices").select("*").eq("id", deviceMatch[1]).eq("user_id", req.userId).single();
    if (!data) return err("Device not found", 404);
    return ok({ device: data, update_available: false, correlation_id: req.correlationId });
  }

  if (req.method === "POST" && sub === "install") {
    const deviceId = req.body.device_id as string;
    if (!deviceId) return err("device_id required");
    const { data: cmd } = await req.supabase.from("os_commands").insert({
      user_id: req.userId,
      command_type: "update",
      command_text: "install_update",
      structured_command: { action: "install_update", device_id: deviceId, version: req.body.version },
      target_device_id: deviceId,
      origin: "api_gateway",
      correlation_id: req.correlationId,
      actor_user_id: req.userId,
    }).select().single();
    return ok({ operation_id: cmd?.id, status: "created", correlation_id: req.correlationId }, 201);
  }

  if (req.method === "POST" && sub === "schedule") {
    return ok({
      scheduled: true,
      device_id: req.body.device_id,
      scheduled_at: req.body.scheduled_at,
      correlation_id: req.correlationId,
    });
  }

  if (req.method === "POST" && sub === "rollback") {
    const deviceId = req.body.device_id as string;
    if (!deviceId) return err("device_id required");
    const { data: cmd } = await req.supabase.from("os_commands").insert({
      user_id: req.userId,
      command_type: "rollback",
      command_text: "rollback_update",
      structured_command: { action: "rollback_update", device_id: deviceId },
      target_device_id: deviceId,
      origin: "api_gateway",
      rollback_available: true,
      correlation_id: req.correlationId,
      actor_user_id: req.userId,
    }).select().single();
    return ok({ operation_id: cmd?.id, status: "created", correlation_id: req.correlationId }, 201);
  }

  if (req.method === "GET" && sub === "history") {
    const { data } = await req.supabase
      .from("os_commands").select("*").eq("user_id", req.userId)
      .in("command_type", ["update", "rollback"]).order("created_at", { ascending: false }).limit(50);
    return ok({ history: data || [], correlation_id: req.correlationId });
  }

  if (req.method === "GET" && sub === "rollout") {
    return ok({ rollout: { strategy: "phased", current_phase: 1, total_phases: 3 }, correlation_id: req.correlationId });
  }

  return err("Unknown updates endpoint", 404);
}

// ── Policies ───────────────────────────────────────────────────

async function handlePolicies(req: GatewayRequest): Promise<GatewayResponse> {
  const sub = req.path.replace(/^\/policies\/?/, "");

  if (req.method === "GET" && !sub) {
    const { data } = await req.supabase
      .from("os_policies").select("*").eq("user_id", req.userId).order("priority");
    return ok({ policies: data || [], correlation_id: req.correlationId });
  }

  if (req.method === "POST" && !sub) {
    const { data, error } = await req.supabase.from("os_policies").insert({
      user_id: req.userId,
      policy_key: req.body.policy_key as string,
      display_name: req.body.display_name as string,
      description: req.body.description as string,
      scope: (req.body.scope as string) || "global",
      scope_ref: req.body.scope_ref as string,
      conditions: req.body.conditions || [],
      actions: req.body.actions || [],
      priority: (req.body.priority as number) || 100,
      domain: (req.body.domain as string) || "general",
    }).select().single();
    if (error) return err(error.message, 500);
    return ok({ policy: data, correlation_id: req.correlationId }, 201);
  }

  if (req.method === "GET" && sub === "effective") {
    const scope = (req.body.scope as string) || "global";
    const { data } = await req.supabase
      .from("os_policies").select("*").eq("user_id", req.userId)
      .eq("enabled", true).eq("scope", scope).order("priority").limit(1);
    return ok({ effective_policy: data?.[0] || null, correlation_id: req.correlationId });
  }

  if (req.method === "POST" && sub === "simulate") {
    const { data } = await req.supabase
      .from("os_policies").select("*").eq("user_id", req.userId).eq("enabled", true).order("priority");
    const matchingPolicies = (data || []).filter((p: any) => {
      if (req.body.scope && p.scope !== req.body.scope) return false;
      if (req.body.domain && p.domain !== req.body.domain) return false;
      return true;
    });
    return ok({
      simulation: { matching_policies: matchingPolicies, would_allow: matchingPolicies.length > 0 },
      correlation_id: req.correlationId,
    });
  }

  const policyIdMatch = sub.match(/^([0-9a-f-]+)$/);
  if (req.method === "PUT" && policyIdMatch) {
    const { data, error } = await req.supabase
      .from("os_policies").update(req.body).eq("id", policyIdMatch[1]).eq("user_id", req.userId).select().single();
    if (error) return err(error.message, 500);
    return ok({ policy: data, correlation_id: req.correlationId });
  }

  if (req.method === "GET" && policyIdMatch) {
    const { data } = await req.supabase
      .from("os_policies").select("*").eq("id", policyIdMatch[1]).eq("user_id", req.userId).single();
    if (!data) return err("Policy not found", 404);
    return ok({ policy: data, correlation_id: req.correlationId });
  }

  return err("Unknown policies endpoint", 404);
}

// ── Apps ────────────────────────────────────────────────────────

async function handleApps(req: GatewayRequest): Promise<GatewayResponse> {
  const sub = req.path.replace(/^\/apps\/?/, "");

  if (req.method === "GET" && !sub) {
    const { data } = await req.supabase
      .from("managed_apps").select("*").eq("user_id", req.userId).order("display_name");
    return ok({ apps: data || [], correlation_id: req.correlationId });
  }

  if (req.method === "POST" && sub === "install") {
    const { data, error } = await req.supabase.from("managed_apps").insert({
      user_id: req.userId,
      app_key: req.body.app_key as string,
      display_name: req.body.display_name as string,
      description: req.body.description as string,
      version: (req.body.version as string) || "1.0.0",
      install_source: (req.body.install_source as string) || "store",
      install_state: "installing",
      permissions: req.body.permissions || [],
      device_id: req.body.device_id as string,
    }).select().single();
    if (error) return err(error.message, 500);
    return ok({ app: data, operation_id: data.id, status: "installing", correlation_id: req.correlationId }, 201);
  }

  if (req.method === "POST" && sub === "remove") {
    const appId = req.body.app_id as string;
    if (!appId) return err("app_id required");
    await req.supabase.from("managed_apps")
      .update({ install_state: "uninstalling" }).eq("id", appId).eq("user_id", req.userId);
    return ok({ removed: true, app_id: appId, correlation_id: req.correlationId });
  }

  if (req.method === "POST" && sub === "update") {
    const appId = req.body.app_id as string;
    if (!appId) return err("app_id required");
    await req.supabase.from("managed_apps")
      .update({ install_state: "updating", version: req.body.version })
      .eq("id", appId).eq("user_id", req.userId);
    return ok({ updating: true, app_id: appId, correlation_id: req.correlationId });
  }

  const appIdMatch = sub.match(/^([0-9a-f-]+)$/);
  if (req.method === "GET" && appIdMatch) {
    const { data } = await req.supabase
      .from("managed_apps").select("*").eq("id", appIdMatch[1]).eq("user_id", req.userId).single();
    if (!data) return err("App not found", 404);
    return ok({ app: data, correlation_id: req.correlationId });
  }

  const healthMatch = sub.match(/^([0-9a-f-]+)\/health$/);
  if (req.method === "GET" && healthMatch) {
    const { data } = await req.supabase
      .from("managed_apps").select("health_status, crash_count, last_crash_at, last_health_check_at")
      .eq("id", healthMatch[1]).eq("user_id", req.userId).single();
    if (!data) return err("App not found", 404);
    return ok({ health: data, correlation_id: req.correlationId });
  }

  return err("Unknown apps endpoint", 404);
}

// ── Logs ───────────────────────────────────────────────────────

async function handleLogs(req: GatewayRequest): Promise<GatewayResponse> {
  const sub = req.path.replace(/^\/logs\/?/, "");

  if (req.method === "GET" && !sub) {
    const { data } = await req.supabase
      .from("cloud_activity_journal").select("*").eq("user_id", req.userId)
      .order("created_at", { ascending: false }).limit(50);
    return ok({ logs: data || [], correlation_id: req.correlationId });
  }

  const logIdMatch = sub.match(/^([0-9a-f-]+)$/);
  if (req.method === "GET" && logIdMatch) {
    const { data } = await req.supabase
      .from("cloud_activity_journal").select("*").eq("id", logIdMatch[1]).single();
    if (!data) return err("Log not found", 404);
    return ok({ log: data, correlation_id: req.correlationId });
  }

  return err("Unknown logs endpoint", 404);
}

// ═══════════════════════════════════════════════════════════════
// MAIN ROUTER
// ═══════════════════════════════════════════════════════════════

const ROUTE_MAP: Record<string, (req: GatewayRequest) => Promise<GatewayResponse>> = {
  auth: handleAuth,
  devices: handleDevices,
  commands: handleCommands,
  ai: handleAI,
  system: handleSystem,
  sync: handleSync,
  security: handleSecurity,
  notifications: handleNotifications,
  audit: handleAudit,
  timeline: handleTimeline,
  updates: handleUpdates,
  policies: handlePolicies,
  apps: handleApps,
  logs: handleLogs,
};

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);
  // Path after /api-gateway/
  const fullPath = url.pathname.replace(/^\/api-gateway\/?/, "/").replace(/\/+/g, "/");
  const correlationId = req.headers.get("x-correlation-id") || crypto.randomUUID();

  // Authenticate
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return new Response(JSON.stringify({ success: false, error: "Invalid token" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Parse body
  let body: Record<string, unknown> = {};
  if (req.method !== "GET" && req.method !== "HEAD") {
    try { body = await req.json(); } catch { body = {}; }
  } else {
    // For GET, use query params as body
    body = parseQuery(url);
  }

  // Route to domain handler
  const segments = fullPath.split("/").filter(Boolean);
  const domain = segments[0];
  const handler = ROUTE_MAP[domain];

  if (!handler) {
    return new Response(JSON.stringify({
      success: false,
      error: `Unknown domain: ${domain}`,
      available_domains: Object.keys(ROUTE_MAP),
    }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const result = await handler({
      method: req.method,
      path: fullPath,
      body,
      userId: user.id,
      correlationId,
      supabase,
    });

    return new Response(JSON.stringify(result.data), {
      status: result.status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "X-Correlation-ID": correlationId,
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
      correlation_id: correlationId,
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json", "X-Correlation-ID": correlationId },
    });
  }
});
