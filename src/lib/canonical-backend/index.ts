// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Backend Truth Layer SDK
// Type-safe accessors for the 15 net-new canonical tables created
// by the "Canonical Backend Truth Tables" migration.
//
// Strategy: Add only the 16 missing tables (no aliases).
// Sibling cloud_* / platform_* tables continue to operate.
// ═══════════════════════════════════════════════════════════════
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

// Convenience aliases — pulled from the auto-generated Supabase types
// so every read/write here is fully type-checked.
export type ApprovalRequestRow         = Database["public"]["Tables"]["approval_requests"]["Row"];
export type ApprovalRequestInsert      = Database["public"]["Tables"]["approval_requests"]["Insert"];
export type ReceiptRow                 = Database["public"]["Tables"]["receipts"]["Row"];
export type ReceiptInsert              = Database["public"]["Tables"]["receipts"]["Insert"];
export type NotificationDeliveryRow    = Database["public"]["Tables"]["notification_deliveries"]["Row"];
export type NotificationDeliveryInsert = Database["public"]["Tables"]["notification_deliveries"]["Insert"];
export type SyncConflictRow            = Database["public"]["Tables"]["sync_conflicts"]["Row"];
export type SyncConflictInsert         = Database["public"]["Tables"]["sync_conflicts"]["Insert"];
export type UpdateRow                  = Database["public"]["Tables"]["updates"]["Row"];
export type UpdateInsert               = Database["public"]["Tables"]["updates"]["Insert"];
export type ReleaseRingRow             = Database["public"]["Tables"]["release_rings"]["Row"];
export type ReleaseArtifactRow         = Database["public"]["Tables"]["release_artifacts"]["Row"];
export type RollbackRow                = Database["public"]["Tables"]["rollbacks"]["Row"];
export type RollbackInsert             = Database["public"]["Tables"]["rollbacks"]["Insert"];
export type PolicyRow                  = Database["public"]["Tables"]["policies"]["Row"];
export type AiInvocationRow            = Database["public"]["Tables"]["ai_invocations"]["Row"];
export type AiInvocationInsert         = Database["public"]["Tables"]["ai_invocations"]["Insert"];
export type AiActionReceiptRow         = Database["public"]["Tables"]["ai_action_receipts"]["Row"];
export type AiActionReceiptInsert      = Database["public"]["Tables"]["ai_action_receipts"]["Insert"];
export type GraphNodeRow               = Database["public"]["Tables"]["graph_nodes"]["Row"];
export type GraphNodeInsert            = Database["public"]["Tables"]["graph_nodes"]["Insert"];
export type ObservabilityMetricRow     = Database["public"]["Tables"]["observability_metrics"]["Row"];
export type ObservabilityMetricInsert  = Database["public"]["Tables"]["observability_metrics"]["Insert"];
export type AuditLogRow                = Database["public"]["Tables"]["audit_logs"]["Row"];
export type AuditLogInsert             = Database["public"]["Tables"]["audit_logs"]["Insert"];
export type RecoverySnapshotRow        = Database["public"]["Tables"]["recovery_snapshots"]["Row"];
export type RecoverySnapshotInsert     = Database["public"]["Tables"]["recovery_snapshots"]["Insert"];

// ───────────────────────────────────────────────────────────────
// Receipts — append-only proof layer
// ───────────────────────────────────────────────────────────────
export async function recordReceipt(input: Omit<ReceiptInsert, "user_id">): Promise<ReceiptRow> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("recordReceipt: not authenticated");
  const { data, error } = await supabase
    .from("receipts")
    .insert({ ...input, user_id: auth.user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function listReceipts(opts: { receiptClass?: string; limit?: number } = {}) {
  let q = supabase.from("receipts").select("*").order("created_at", { ascending: false });
  if (opts.receiptClass) q = q.eq("receipt_class", opts.receiptClass);
  if (opts.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

// ───────────────────────────────────────────────────────────────
// Approval requests
// ───────────────────────────────────────────────────────────────
export async function createApprovalRequest(input: Omit<ApprovalRequestInsert, "user_id" | "requested_by">): Promise<ApprovalRequestRow> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("createApprovalRequest: not authenticated");
  const { data, error } = await supabase
    .from("approval_requests")
    .insert({ ...input, user_id: auth.user.id, requested_by: auth.user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function listPendingApprovals(): Promise<ApprovalRequestRow[]> {
  const { data, error } = await supabase
    .from("approval_requests")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ───────────────────────────────────────────────────────────────
// Audit logs — append-only privileged-action log
// ───────────────────────────────────────────────────────────────
export async function recordAuditLog(input: Omit<AuditLogInsert, "actor_user_id">): Promise<AuditLogRow> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("recordAuditLog: not authenticated");
  const { data, error } = await supabase
    .from("audit_logs")
    .insert({ ...input, actor_user_id: auth.user.id, user_id: input.user_id ?? auth.user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ───────────────────────────────────────────────────────────────
// AI invocations + action receipts
// ───────────────────────────────────────────────────────────────
export async function recordAiInvocation(input: Omit<AiInvocationInsert, "user_id">): Promise<AiInvocationRow> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("recordAiInvocation: not authenticated");
  const { data, error } = await supabase
    .from("ai_invocations")
    .insert({ ...input, user_id: auth.user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function recordAiActionReceipt(input: Omit<AiActionReceiptInsert, "user_id">): Promise<AiActionReceiptRow> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("recordAiActionReceipt: not authenticated");
  const { data, error } = await supabase
    .from("ai_action_receipts")
    .insert({ ...input, user_id: auth.user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ───────────────────────────────────────────────────────────────
// Observability metrics — append-only
// ───────────────────────────────────────────────────────────────
export async function recordMetric(input: Omit<ObservabilityMetricInsert, "user_id">): Promise<ObservabilityMetricRow> {
  const { data: auth } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("observability_metrics")
    .insert({ ...input, user_id: auth.user?.id ?? null })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ───────────────────────────────────────────────────────────────
// Canonical table registry — for truth dashboards & audits
// ───────────────────────────────────────────────────────────────
export const CANONICAL_BACKEND_TABLES = [
  { name: "approval_requests",       domain: "platform-core",  realtime: true,  appendOnly: false },
  { name: "receipts",                domain: "platform-core",  realtime: true,  appendOnly: true  },
  { name: "notification_deliveries", domain: "notification",   realtime: true,  appendOnly: false },
  { name: "sync_conflicts",          domain: "sync",           realtime: true,  appendOnly: false },
  { name: "updates",                 domain: "release",        realtime: true,  appendOnly: false },
  { name: "release_rings",           domain: "release",        realtime: false, appendOnly: false },
  { name: "release_artifacts",       domain: "release",        realtime: false, appendOnly: false },
  { name: "rollbacks",               domain: "release",        realtime: true,  appendOnly: false },
  { name: "policies",                domain: "policy",         realtime: false, appendOnly: false },
  { name: "ai_invocations",          domain: "ai-workforce",   realtime: false, appendOnly: true  },
  { name: "ai_action_receipts",      domain: "ai-workforce",   realtime: true,  appendOnly: false },
  { name: "graph_nodes",             domain: "graph",          realtime: false, appendOnly: false },
  { name: "observability_metrics",   domain: "observability",  realtime: false, appendOnly: true  },
  { name: "audit_logs",              domain: "compliance",     realtime: false, appendOnly: true  },
  { name: "recovery_snapshots",      domain: "recovery",       realtime: false, appendOnly: false },
] as const;

export type CanonicalBackendTableName = typeof CANONICAL_BACKEND_TABLES[number]["name"];
