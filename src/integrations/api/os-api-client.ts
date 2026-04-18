// ═══════════════════════════════════════════════════════════════
// SITA OS — Typed OS API Client SDK
// Wraps the unified api-gateway edge function with typed methods
// for all 16 API domains. Uses supabase.functions.invoke().
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

// ── Core Types ─────────────────────────────────────────────────

export interface ApiResponse<T = Record<string, unknown>> {
  data: T | null;
  error: string | null;
  correlationId: string | null;
}

export interface OperationResult {
  operation_id: string;
  status: string;
  follow_up_stream?: string;
  approval_pending?: boolean;
  verification_pending?: boolean;
  rollback_available?: boolean;
  correlation_id: string;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

// ── Command Types ──────────────────────────────────────────────

export type CommandStatus =
  | "created" | "planning" | "awaiting_approval" | "approved"
  | "dispatched" | "running" | "verifying" | "completed"
  | "failed" | "rolled_back" | "denied" | "canceled";

export interface OsCommand {
  id: string;
  user_id: string;
  command_type: string;
  command_text: string | null;
  structured_command: Record<string, unknown>;
  target_device_id: string | null;
  origin: string;
  safety_mode: string;
  simulation_first: boolean;
  status: CommandStatus;
  plan_json: Record<string, unknown> | null;
  approval_state: string;
  verification_state: string;
  rollback_available: boolean;
  correlation_id: string;
  result: Record<string, unknown> | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface CommandEvent {
  id: string;
  command_id: string;
  from_state: string | null;
  to_state: string;
  actor: string | null;
  reason: string | null;
  metadata: Record<string, unknown>;
  correlation_id: string | null;
  created_at: string;
}

export interface CreateCommandParams {
  command?: string;
  structured_command?: Record<string, unknown>;
  target?: { device_id?: string; device_ids?: string[] };
  origin?: string;
  safety_mode?: string;
  simulation_first?: boolean;
}

// ── Policy Types ───────────────────────────────────────────────

export interface OsPolicy {
  id: string;
  policy_key: string;
  display_name: string;
  description: string | null;
  scope: string;
  scope_ref: string | null;
  conditions: unknown[];
  actions: unknown[];
  priority: number;
  enabled: boolean;
  domain: string;
  created_at: string;
  updated_at: string;
}

// ── ManagedApp Types ───────────────────────────────────────────

export interface ManagedApp {
  id: string;
  app_key: string;
  display_name: string;
  description: string | null;
  version: string;
  trust_level: string;
  health_status: string;
  install_source: string;
  install_state: string;
  permissions: unknown[];
  crash_count: number;
  last_crash_at: string | null;
  domain: string;
  device_id: string | null;
  created_at: string;
  updated_at: string;
}

// ── Internal caller ────────────────────────────────────────────

async function callGateway<T = Record<string, unknown>>(
  path: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: Record<string, unknown>,
  correlationId?: string,
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {};
  if (correlationId) headers["X-Correlation-ID"] = correlationId;

  try {
    const { data, error } = await supabase.functions.invoke("api-gateway", {
      body: { __gateway_path: path, __gateway_method: method, ...body },
      method: "POST",
      headers,
    });

    if (error) {
      return { data: null, error: error.message, correlationId: null };
    }

    return {
      data: data as T,
      error: data?.success === false ? data.error : null,
      correlationId: data?.correlation_id || null,
    };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
      correlationId: null,
    };
  }
}

// We need to send path info via the URL. Let's use a cleaner approach:
// The edge function reads the path from the URL, so we construct the invoke URL manually.

async function gateway<T = Record<string, unknown>>(
  path: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: Record<string, unknown>,
  correlationId?: string,
): Promise<ApiResponse<T>> {
  const cid = correlationId || crypto.randomUUID();

  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) return { data: null, error: "Not authenticated", correlationId: cid };

    const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-gateway${path}`;
    const headers: Record<string, string> = {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      "X-Correlation-ID": cid,
    };

    const fetchOpts: RequestInit = { method, headers };
    if (method !== "GET" && body) {
      fetchOpts.body = JSON.stringify(body);
    }

    const response = await fetch(baseUrl, fetchOpts);
    const data = await response.json();

    return {
      data: data as T,
      error: data?.success === false ? data.error : null,
      correlationId: data?.correlation_id || cid,
    };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
      correlationId: cid,
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// API DOMAIN CLIENTS
// ═══════════════════════════════════════════════════════════════

export const osApi = {
  // ── Auth ───────────────────────────────────────────────────
  auth: {
    me: () => gateway("/auth/me"),
    stepUp: () => gateway("/auth/step-up", "POST"),
    verifyDevice: (deviceId: string) =>
      gateway("/auth/device/verify", "POST", { device_id: deviceId }),
  },

  // ── Devices ────────────────────────────────────────────────
  devices: {
    list: () => gateway<{ devices: unknown[] }>("/devices"),
    get: (id: string) => gateway(`/devices/${id}`),
    register: (params: Record<string, unknown>) =>
      gateway("/devices/register", "POST", params),
    lock: (id: string) => gateway<OperationResult>(`/devices/${id}/lock`, "POST"),
    restart: (id: string) => gateway<OperationResult>(`/devices/${id}/restart`, "POST"),
    wipe: (id: string) => gateway<OperationResult>(`/devices/${id}/wipe`, "POST"),
    revoke: (id: string) => gateway<OperationResult>(`/devices/${id}/revoke`, "POST"),
    syncNow: (id: string) => gateway<OperationResult>(`/devices/${id}/sync-now`, "POST"),
    update: (id: string) => gateway<OperationResult>(`/devices/${id}/update`, "POST"),
    capabilities: (id: string) => gateway(`/devices/${id}/capabilities`),
  },

  // ── Commands ───────────────────────────────────────────────
  commands: {
    list: (params?: PaginationParams) =>
      gateway<{ commands: OsCommand[] }>(`/commands?limit=${params?.limit || 50}&offset=${params?.offset || 0}`),
    get: (id: string) => gateway<{ command: OsCommand; events: CommandEvent[] }>(`/commands/${id}`),
    create: (params: CreateCommandParams) =>
      gateway<OperationResult>("/commands", "POST", params as unknown as Record<string, unknown>),
    simulate: (params: CreateCommandParams) =>
      gateway<OperationResult>("/commands/simulate", "POST", params as unknown as Record<string, unknown>),
    approve: (id: string) => gateway<OperationResult>(`/commands/${id}/approve`, "POST"),
    deny: (id: string) => gateway<OperationResult>(`/commands/${id}/deny`, "POST"),
    cancel: (id: string) => gateway<OperationResult>(`/commands/${id}/cancel`, "POST"),
    replay: (id: string) => gateway<OperationResult>(`/commands/${id}/replay`, "POST"),
    undo: (id: string) => gateway<OperationResult>(`/commands/${id}/undo`, "POST"),
  },

  // ── AI ─────────────────────────────────────────────────────
  ai: {
    chat: (messages: unknown[], mode?: string) =>
      gateway("/ai/chat", "POST", { messages, mode }),
    analyze: (payload: Record<string, unknown>) =>
      gateway("/ai/analyze", "POST", payload),
    suggestions: () => gateway<{ suggestions: unknown[] }>("/ai/suggestions"),
    applySuggestion: (id: string) =>
      gateway<OperationResult>(`/ai/suggestions/${id}/apply`, "POST"),
    history: () => gateway<{ history: unknown[] }>("/ai/history"),
    explain: (eventId: string, context?: Record<string, unknown>) =>
      gateway("/ai/explain", "POST", { event_id: eventId, context }),
  },

  // ── System ─────────────────────────────────────────────────
  system: {
    status: () => gateway("/system/status"),
    health: () => gateway<{ subsystems: unknown[]; overall: string }>("/system/health"),
    metrics: () => gateway<{ metrics: unknown[] }>("/system/metrics"),
    anomalies: () => gateway<{ anomalies: unknown[] }>("/system/anomalies"),
    map: () => gateway("/system/map"),
    history: () => gateway<{ events: unknown[] }>("/system/history"),
  },

  // ── Sync ───────────────────────────────────────────────────
  sync: {
    status: () => gateway("/sync/status"),
    device: (deviceId: string) => gateway(`/sync/devices/${deviceId}`),
    trigger: (params?: Record<string, unknown>) =>
      gateway("/sync/trigger", "POST", params),
    pause: () => gateway("/sync/pause", "POST"),
    resume: () => gateway("/sync/resume", "POST"),
    conflicts: () => gateway<{ conflicts: unknown[] }>("/sync/conflicts"),
    resolveConflict: (conflictId: string, resolution?: string) =>
      gateway("/sync/resolve-conflict", "POST", { conflict_id: conflictId, resolution }),
    reindex: () => gateway("/sync/reindex", "POST"),
    history: () => gateway<{ history: unknown[] }>("/sync/history"),
  },

  // ── Security ───────────────────────────────────────────────
  security: {
    status: () => gateway("/security/status"),
    events: () => gateway<{ events: unknown[] }>("/security/events"),
    pendingApprovals: () => gateway<{ approvals: unknown[] }>("/security/approvals/pending"),
    approve: (confirmationId: string) =>
      gateway("/security/approve", "POST", { confirmation_id: confirmationId }),
    deny: (confirmationId: string) =>
      gateway("/security/deny", "POST", { confirmation_id: confirmationId }),
    trustDevices: () => gateway<{ devices: unknown[] }>("/security/trust/devices"),
    revokeDevice: (deviceId: string) =>
      gateway(`/security/trust/devices/${deviceId}/revoke`, "POST"),
    emergencyLock: () => gateway("/security/emergency/lock", "POST"),
    emergencyPauseSync: () => gateway("/security/emergency/pause-sync", "POST"),
  },

  // ── Notifications ──────────────────────────────────────────
  notifications: {
    list: () => gateway<{ notifications: unknown[] }>("/notifications"),
    markRead: (ids: string[]) =>
      gateway("/notifications/read", "POST", { notification_ids: ids }),
    action: (id: string, action: string) =>
      gateway(`/notifications/${id}/action`, "POST", { action }),
    preferences: () => gateway("/notifications/preferences"),
    updatePreferences: (prefs: Record<string, unknown>) =>
      gateway("/notifications/preferences", "PUT", prefs),
  },

  // ── Audit ──────────────────────────────────────────────────
  audit: {
    events: () => gateway<{ events: unknown[] }>("/audit/events"),
    event: (id: string) => gateway(`/audit/events/${id}`),
  },

  // ── Timeline ───────────────────────────────────────────────
  timeline: {
    get: () => gateway<{ timeline: unknown[] }>("/timeline"),
  },

  // ── Updates ────────────────────────────────────────────────
  updates: {
    list: () => gateway<{ devices: unknown[] }>("/updates"),
    device: (id: string) => gateway(`/updates/${id}`),
    install: (deviceId: string, version?: string) =>
      gateway<OperationResult>("/updates/install", "POST", { device_id: deviceId, version }),
    schedule: (deviceId: string, scheduledAt: string) =>
      gateway("/updates/schedule", "POST", { device_id: deviceId, scheduled_at: scheduledAt }),
    rollback: (deviceId: string) =>
      gateway<OperationResult>("/updates/rollback", "POST", { device_id: deviceId }),
    history: () => gateway<{ history: unknown[] }>("/updates/history"),
    rollout: () => gateway("/updates/rollout"),
  },

  // ── Policies ───────────────────────────────────────────────
  policies: {
    list: () => gateway<{ policies: OsPolicy[] }>("/policies"),
    get: (id: string) => gateway<{ policy: OsPolicy }>(`/policies/${id}`),
    create: (params: Partial<OsPolicy>) =>
      gateway<{ policy: OsPolicy }>("/policies", "POST", params),
    update: (id: string, params: Partial<OsPolicy>) =>
      gateway<{ policy: OsPolicy }>(`/policies/${id}`, "PUT", params),
    effective: (scope?: string) =>
      gateway<{ effective_policy: OsPolicy | null }>("/policies/effective", "GET"),
    simulate: (params: Record<string, unknown>) =>
      gateway("/policies/simulate", "POST", params),
  },

  // ── Apps ───────────────────────────────────────────────────
  apps: {
    list: () => gateway<{ apps: ManagedApp[] }>("/apps"),
    get: (id: string) => gateway<{ app: ManagedApp }>(`/apps/${id}`),
    install: (params: Partial<ManagedApp>) =>
      gateway<OperationResult>("/apps/install", "POST", params),
    remove: (appId: string) =>
      gateway("/apps/remove", "POST", { app_id: appId }),
    update: (appId: string, version?: string) =>
      gateway("/apps/update", "POST", { app_id: appId, version }),
    health: (id: string) => gateway(`/apps/${id}/health`),
  },

  // ── Logs ───────────────────────────────────────────────────
  logs: {
    list: () => gateway<{ logs: unknown[] }>("/logs"),
    get: (id: string) => gateway(`/logs/${id}`),
  },
};
