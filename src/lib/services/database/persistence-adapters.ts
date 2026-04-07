// ═══════════════════════════════════════════════════════════════
// SITA OS — Database Persistence Adapters
// Wires 8 database tables to their in-memory service counterparts
// Uses the DatabaseService abstraction for all Supabase calls
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { fromTable, fromDynamicTable } from "@/lib/supabase-helpers";

// ── Helpers ────────────────────────────────────────────────────

async function getUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

async function safeQuery<T>(fn: () => PromiseLike<{ data: T | null; error: unknown }>): Promise<T | null> {
  try {
    const { data, error } = await fn();
    if (error) { console.warn("[persistence]", (error as Error)?.message ?? String(error); return null; }
    return data;
  } catch (e) { console.warn("[persistence]", e); return null; }
}

// ── 1. Trust State Events ──────────────────────────────────────

export interface TrustStateEventRow {
  id: string;
  user_id: string;
  entity_id: string;
  event_type: string;
  trust_score_before: number | null;
  trust_score_after: number | null;
  delta: number | null;
  reason: string | null;
  source: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export const trustStateEventsAdapter = {
  async insert(event: Omit<TrustStateEventRow, "id" | "user_id" | "created_at">): Promise<TrustStateEventRow | null> {
    const userId = await getUserId();
    if (!userId) return null;
    return safeQuery(() =>
      fromDynamicTable("trust_state_events")
        .insert({ ...event, user_id: userId })
        .select()
        .single()
    );
  },

  async listByEntity(entityId: string, limit = 50): Promise<TrustStateEventRow[]> {
    const userId = await getUserId();
    if (!userId) return [];
    const data = await safeQuery<TrustStateEventRow[]>(() =>
      fromDynamicTable("trust_state_events")
        .select("*")
        .eq("user_id", userId)
        .eq("entity_id", entityId)
        .order("created_at", { ascending: false })
        .limit(limit)
    );
    return data ?? [];
  },

  async getRecent(limit = 100): Promise<TrustStateEventRow[]> {
    const userId = await getUserId();
    if (!userId) return [];
    const data = await safeQuery<TrustStateEventRow[]>(() =>
      fromDynamicTable("trust_state_events")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit)
    );
    return data ?? [];
  },
};

// ── 2. Encrypted Secrets ───────────────────────────────────────

export interface EncryptedSecretRow {
  id: string;
  user_id: string;
  key_name: string;
  encrypted_value: string;
  provider: string | null;
  scope: string;
  rotation_due_at: string | null;
  last_rotated_at: string | null;
  created_at: string;
  updated_at: string;
}

export const encryptedSecretsAdapter = {
  async upsert(keyName: string, encryptedValue: string, opts?: { provider?: string; scope?: string; rotationDueAt?: string }): Promise<EncryptedSecretRow | null> {
    const userId = await getUserId();
    if (!userId) return null;
    return safeQuery(() =>
      fromDynamicTable("encrypted_secrets")
        .upsert({
          user_id: userId,
          key_name: keyName,
          encrypted_value: encryptedValue,
          provider: opts?.provider ?? null,
          scope: opts?.scope ?? "personal",
          rotation_due_at: opts?.rotationDueAt ?? null,
          last_rotated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id,key_name" })
        .select()
        .single()
    );
  },

  async get(keyName: string): Promise<EncryptedSecretRow | null> {
    const userId = await getUserId();
    if (!userId) return null;
    return safeQuery(() =>
      fromDynamicTable("encrypted_secrets")
        .select("*")
        .eq("user_id", userId)
        .eq("key_name", keyName)
        .single()
    );
  },

  async list(): Promise<EncryptedSecretRow[]> {
    const userId = await getUserId();
    if (!userId) return [];
    const data = await safeQuery<EncryptedSecretRow[]>(() =>
      fromDynamicTable("encrypted_secrets")
        .select("*")
        .eq("user_id", userId)
        .order("key_name")
    );
    return data ?? [];
  },

  async remove(keyName: string): Promise<boolean> {
    const userId = await getUserId();
    if (!userId) return false;
    const { error } = await fromDynamicTable("encrypted_secrets")
      .delete()
      .eq("user_id", userId)
      .eq("key_name", keyName);
    return !error;
  },
};

// ── 3. Notifications Queue ─────────────────────────────────────

export interface NotificationRow {
  id: string;
  user_id: string;
  category: string;
  channel: string;
  title: string;
  body: string | null;
  urgency: string;
  status: string;
  action_url: string | null;
  metadata: Record<string, unknown>;
  scheduled_at: string | null;
  sent_at: string | null;
  read_at: string | null;
  created_at: string;
}

export const notificationsAdapter = {
  async enqueue(notification: Omit<NotificationRow, "id" | "user_id" | "status" | "created_at" | "sent_at" | "read_at">): Promise<NotificationRow | null> {
    const userId = await getUserId();
    if (!userId) return null;
    return safeQuery(() =>
      fromDynamicTable("notifications_queue")
        .insert({ ...notification, user_id: userId, status: "pending" })
        .select()
        .single()
    );
  },

  async markRead(id: string): Promise<boolean> {
    const { error } = await fromDynamicTable("notifications_queue")
      .update({ status: "read", read_at: new Date().toISOString() })
      .eq("id", id);
    return !error;
  },

  async listPending(limit = 50): Promise<NotificationRow[]> {
    const userId = await getUserId();
    if (!userId) return [];
    const data = await safeQuery<NotificationRow[]>(() =>
      fromDynamicTable("notifications_queue")
        .select("*")
        .eq("user_id", userId)
        .in("status", ["pending", "sent", "delivered"])
        .order("created_at", { ascending: false })
        .limit(limit)
    );
    return data ?? [];
  },

  async listAll(limit = 100): Promise<NotificationRow[]> {
    const userId = await getUserId();
    if (!userId) return [];
    const data = await safeQuery<NotificationRow[]>(() =>
      fromDynamicTable("notifications_queue")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit)
    );
    return data ?? [];
  },
};

// ── 4. AI Agent Tasks ──────────────────────────────────────────

export interface AIAgentTaskRow {
  id: string;
  user_id: string;
  agent_id: string;
  agent_name: string;
  capability_id: string;
  status: string;
  input_payload: Record<string, unknown>;
  output_payload: Record<string, unknown> | null;
  error_message: string | null;
  trust_score_at_execution: number | null;
  autonomy_level: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export const aiAgentTasksAdapter = {
  async create(task: Omit<AIAgentTaskRow, "id" | "user_id" | "status" | "output_payload" | "error_message" | "completed_at" | "created_at">): Promise<AIAgentTaskRow | null> {
    const userId = await getUserId();
    if (!userId) return null;
    return safeQuery(() =>
      fromDynamicTable("ai_agent_tasks")
        .insert({ ...task, user_id: userId, status: "pending" })
        .select()
        .single()
    );
  },

  async updateStatus(id: string, status: string, output?: Record<string, unknown>, error?: string): Promise<boolean> {
    const update: Record<string, unknown> = { status };
    if (output) update.output_payload = output;
    if (error) update.error_message = error;
    if (status === "running") update.started_at = new Date().toISOString();
    if (["completed", "failed"].includes(status)) update.completed_at = new Date().toISOString();
    const { error: err } = await fromDynamicTable("ai_agent_tasks").update(update).eq("id", id);
    return !err;
  },

  async listByAgent(agentId: string, limit = 50): Promise<AIAgentTaskRow[]> {
    const userId = await getUserId();
    if (!userId) return [];
    const data = await safeQuery<AIAgentTaskRow[]>(() =>
      fromDynamicTable("ai_agent_tasks")
        .select("*")
        .eq("user_id", userId)
        .eq("agent_id", agentId)
        .order("created_at", { ascending: false })
        .limit(limit)
    );
    return data ?? [];
  },

  async listRecent(limit = 100): Promise<AIAgentTaskRow[]> {
    const userId = await getUserId();
    if (!userId) return [];
    const data = await safeQuery<AIAgentTaskRow[]>(() =>
      fromDynamicTable("ai_agent_tasks")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit)
    );
    return data ?? [];
  },
};

// ── 5. AI Cost Ledger ──────────────────────────────────────────

export interface AICostLedgerRow {
  id: string;
  user_id: string;
  agent_id: string | null;
  model_id: string;
  provider: string;
  input_tokens: number;
  output_tokens: number;
  cost_cents: number;
  capability_id: string | null;
  correlation_id: string | null;
  domain: string | null;
  created_at: string;
}

export const aiCostLedgerAdapter = {
  async record(entry: Omit<AICostLedgerRow, "id" | "user_id" | "created_at">): Promise<AICostLedgerRow | null> {
    const userId = await getUserId();
    if (!userId) return null;
    return safeQuery(() =>
      fromDynamicTable("ai_cost_ledger")
        .insert({ ...entry, user_id: userId })
        .select()
        .single()
    );
  },

  async getSpendByPeriod(since: string): Promise<{ totalCents: number; totalTokens: number; entries: AICostLedgerRow[] }> {
    const userId = await getUserId();
    if (!userId) return { totalCents: 0, totalTokens: 0, entries: [] };
    const data = await safeQuery<AICostLedgerRow[]>(() =>
      fromDynamicTable("ai_cost_ledger")
        .select("*")
        .eq("user_id", userId)
        .gte("created_at", since)
        .order("created_at", { ascending: false })
    );
    const entries = data ?? [];
    return {
      totalCents: entries.reduce((s, e) => s + e.cost_cents, 0),
      totalTokens: entries.reduce((s, e) => s + e.input_tokens + e.output_tokens, 0),
      entries,
    };
  },

  async getSpendByModel(): Promise<Array<{ model_id: string; provider: string; total_cents: number; count: number }>> {
    const userId = await getUserId();
    if (!userId) return [];
    const data = await safeQuery<AICostLedgerRow[]>(() =>
      fromDynamicTable("ai_cost_ledger")
        .select("*")
        .eq("user_id", userId)
    );
    const entries = data ?? [];
    const byModel = new Map<string, { model_id: string; provider: string; total_cents: number; count: number }>();
    for (const e of entries) {
      const key = `${e.model_id}::${e.provider}`;
      const existing = byModel.get(key) ?? { model_id: e.model_id, provider: e.provider, total_cents: 0, count: 0 };
      existing.total_cents += e.cost_cents;
      existing.count++;
      byModel.set(key, existing);
    }
    return Array.from(byModel.values()).sort((a, b) => b.total_cents - a.total_cents);
  },
};

// ── 6. Capital Allocations ─────────────────────────────────────

export interface CapitalAllocationRow {
  id: string;
  user_id: string;
  allocation_name: string;
  category: string;
  amount_cents: number;
  currency: string;
  status: string;
  utilization_pct: number;
  threshold_warning_pct: number;
  threshold_critical_pct: number;
  period_start: string | null;
  period_end: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const capitalAllocationsAdapter = {
  async create(allocation: Omit<CapitalAllocationRow, "id" | "user_id" | "created_at" | "updated_at">): Promise<CapitalAllocationRow | null> {
    const userId = await getUserId();
    if (!userId) return null;
    return safeQuery(() =>
      fromDynamicTable("capital_allocations")
        .insert({ ...allocation, user_id: userId })
        .select()
        .single()
    );
  },

  async updateUtilization(id: string, utilizationPct: number): Promise<boolean> {
    const status = utilizationPct >= 100 ? "depleted" : "active";
    const { error } = await fromDynamicTable("capital_allocations")
      .update({ utilization_pct: utilizationPct, status, updated_at: new Date().toISOString() })
      .eq("id", id);
    return !error;
  },

  async listActive(): Promise<CapitalAllocationRow[]> {
    const userId = await getUserId();
    if (!userId) return [];
    const data = await safeQuery<CapitalAllocationRow[]>(() =>
      fromDynamicTable("capital_allocations")
        .select("*")
        .eq("user_id", userId)
        .in("status", ["active", "pending"])
        .order("category")
    );
    return data ?? [];
  },

  async listAll(): Promise<CapitalAllocationRow[]> {
    const userId = await getUserId();
    if (!userId) return [];
    const data = await safeQuery<CapitalAllocationRow[]>(() =>
      fromDynamicTable("capital_allocations")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
    );
    return data ?? [];
  },
};

// ── 7. Communication Log ───────────────────────────────────────

export interface CommunicationLogRow {
  id: string;
  user_id: string;
  channel: string;
  direction: string;
  contact_name: string | null;
  contact_identifier: string | null;
  subject: string | null;
  body_preview: string | null;
  status: string;
  domain: string | null;
  correlation_id: string | null;
  metadata: Record<string, unknown>;
  sent_at: string | null;
  delivered_at: string | null;
  read_at: string | null;
  created_at: string;
}

export const communicationLogAdapter = {
  async log(entry: Omit<CommunicationLogRow, "id" | "user_id" | "created_at">): Promise<CommunicationLogRow | null> {
    const userId = await getUserId();
    if (!userId) return null;
    return safeQuery(() =>
      fromDynamicTable("communication_log")
        .insert({ ...entry, user_id: userId })
        .select()
        .single()
    );
  },

  async updateStatus(id: string, status: string): Promise<boolean> {
    const update: Record<string, unknown> = { status };
    if (status === "delivered") update.delivered_at = new Date().toISOString();
    if (status === "read") update.read_at = new Date().toISOString();
    const { error } = await fromDynamicTable("communication_log").update(update).eq("id", id);
    return !error;
  },

  async listByChannel(channel?: string, limit = 100): Promise<CommunicationLogRow[]> {
    const userId = await getUserId();
    if (!userId) return [];
    let q = fromDynamicTable("communication_log")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (channel) q = q.eq("channel", channel);
    const data = await safeQuery<CommunicationLogRow[]>(() => q);
    return data ?? [];
  },

  async getStats(): Promise<{ total: number; byChannel: Record<string, number>; byStatus: Record<string, number> }> {
    const userId = await getUserId();
    if (!userId) return { total: 0, byChannel: {}, byStatus: {} };
    const data = await safeQuery<CommunicationLogRow[]>(() =>
      fromDynamicTable("communication_log")
        .select("channel,status")
        .eq("user_id", userId)
    );
    const entries = data ?? [];
    const byChannel: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    for (const e of entries) {
      byChannel[e.channel] = (byChannel[e.channel] ?? 0) + 1;
      byStatus[e.status] = (byStatus[e.status] ?? 0) + 1;
    }
    return { total: entries.length, byChannel, byStatus };
  },
};

// ── 8. Sovereign Exports ───────────────────────────────────────

export interface SovereignExportRow {
  id: string;
  user_id: string;
  export_type: string;
  domain: string | null;
  status: string;
  format: string;
  file_path: string | null;
  file_size_bytes: number | null;
  record_count: number;
  requested_at: string;
  completed_at: string | null;
  expires_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export const sovereignExportsAdapter = {
  async request(exportType: string, format: string, opts?: { domain?: string; metadata?: Record<string, unknown> }): Promise<SovereignExportRow | null> {
    const userId = await getUserId();
    if (!userId) return null;
    return safeQuery(() =>
      fromDynamicTable("sovereign_exports")
        .insert({
          user_id: userId,
          export_type: exportType,
          format,
          domain: opts?.domain ?? null,
          metadata: opts?.metadata ?? {},
          status: "pending",
          expires_at: new Date(Date.now() + 7 * 86400_000).toISOString(),
        })
        .select()
        .single()
    );
  },

  async updateProgress(id: string, status: string, opts?: { filePath?: string; fileSizeBytes?: number; recordCount?: number }): Promise<boolean> {
    const update: Record<string, unknown> = { status };
    if (opts?.filePath) update.file_path = opts.filePath;
    if (opts?.fileSizeBytes) update.file_size_bytes = opts.fileSizeBytes;
    if (opts?.recordCount) update.record_count = opts.recordCount;
    if (status === "completed") update.completed_at = new Date().toISOString();
    const { error } = await fromDynamicTable("sovereign_exports").update(update).eq("id", id);
    return !error;
  },

  async listExports(limit = 20): Promise<SovereignExportRow[]> {
    const userId = await getUserId();
    if (!userId) return [];
    const data = await safeQuery<SovereignExportRow[]>(() =>
      fromDynamicTable("sovereign_exports")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit)
    );
    return data ?? [];
  },

  async getExport(id: string): Promise<SovereignExportRow | null> {
    return safeQuery(() =>
      fromDynamicTable("sovereign_exports")
        .select("*")
        .eq("id", id)
        .single()
    );
  },
};

