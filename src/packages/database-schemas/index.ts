// ═══════════════════════════════════════════════════════════════
// SITA OS — Database Schema Contracts
// TypeScript types mapping to the 11 Supabase tables
// ═══════════════════════════════════════════════════════════════

// ── receipts ─────────────────────────────────────────────────

export interface ReceiptRow {
  id: string;
  user_id: string;
  type: string;
  domain: string;
  entity_id: string | null;
  payload: Record<string, unknown>;
  hash: string | null;
  created_at: string;
}

export type ReceiptInsert = Omit<ReceiptRow, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};

// ── execution_envelopes ──────────────────────────────────────

export interface ExecutionEnvelopeRow {
  id: string;
  user_id: string;
  capability_id: string;
  status: "pending" | "executing" | "completed" | "failed" | "rolled-back";
  intent: Record<string, unknown>;
  result: Record<string, unknown> | null;
  approved_by: string | null;
  created_at: string;
}

export type ExecutionEnvelopeInsert = Omit<ExecutionEnvelopeRow, "id" | "created_at" | "status"> & {
  id?: string;
  status?: ExecutionEnvelopeRow["status"];
  created_at?: string;
};

// ── projections ──────────────────────────────────────────────

export interface ProjectionRow {
  id: string;
  user_id: string;
  domain: string;
  type: string;
  data: Record<string, unknown>;
  generated_at: string;
}

export type ProjectionInsert = Omit<ProjectionRow, "id" | "generated_at"> & {
  id?: string;
  generated_at?: string;
};

// ── capabilities ─────────────────────────────────────────────

export interface CapabilityRow {
  id: string;
  name: string;
  domain: string;
  description: string | null;
  enabled: boolean;
  risk_tier: "low" | "medium" | "high" | "critical";
}

export type CapabilityInsert = Omit<CapabilityRow, "id" | "enabled"> & {
  id?: string;
  enabled?: boolean;
};

// ── trust_state ──────────────────────────────────────────────

export interface TrustStateRow {
  id: string;
  user_id: string;
  entity_type: string;
  entity_id: string;
  trust_level: string;
  score: number;
  updated_at: string;
}

export type TrustStateInsert = Omit<TrustStateRow, "id" | "updated_at" | "score" | "trust_level"> & {
  id?: string;
  trust_level?: string;
  score?: number;
  updated_at?: string;
};

// ── bookings ─────────────────────────────────────────────────

export interface BookingRow {
  id: string;
  user_id: string;
  type: string;
  title: string;
  provider: string | null;
  status: string;
  date: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

export type BookingInsert = Omit<BookingRow, "id" | "created_at" | "status"> & {
  id?: string;
  status?: string;
  created_at?: string;
};

// ── budgets ──────────────────────────────────────────────────

export interface BudgetRow {
  id: string;
  user_id: string;
  category: string;
  allocated: number;
  spent: number;
  period: string;
  created_at: string;
}

export type BudgetInsert = Omit<BudgetRow, "id" | "created_at" | "allocated" | "spent"> & {
  id?: string;
  allocated?: number;
  spent?: number;
  created_at?: string;
};

// ── deals ────────────────────────────────────────────────────

export interface DealRow {
  id: string;
  user_id: string;
  name: string;
  value: number;
  stage: string;
  probability: number;
  customer_id: string | null;
  created_at: string;
}

export type DealInsert = Omit<DealRow, "id" | "created_at" | "value" | "probability"> & {
  id?: string;
  value?: number;
  probability?: number;
  created_at?: string;
};

// ── sync_logs ────────────────────────────────────────────────

export interface SyncLogRow {
  id: string;
  user_id: string;
  connector_id: string;
  status: string;
  records_synced: number;
  error: string | null;
  synced_at: string;
}

export type SyncLogInsert = Omit<SyncLogRow, "id" | "synced_at" | "records_synced"> & {
  id?: string;
  records_synced?: number;
  synced_at?: string;
};

// ── connector_credentials ────────────────────────────────────

export interface ConnectorCredentialRow {
  id: string;
  user_id: string;
  connector_id: string;
  provider: string;
  status: string;
  encrypted_token: string | null;
  created_at: string;
}

export type ConnectorCredentialInsert = Omit<ConnectorCredentialRow, "id" | "created_at" | "status"> & {
  id?: string;
  status?: string;
  created_at?: string;
};

// ── tenant_firewall_logs ─────────────────────────────────────

export interface TenantFirewallLogRow {
  id: string;
  user_id: string;
  action: string;
  source_ip: string | null;
  rule_matched: string | null;
  blocked: boolean;
  created_at: string;
}

export type TenantFirewallLogInsert = Omit<TenantFirewallLogRow, "id" | "created_at" | "blocked"> & {
  id?: string;
  blocked?: boolean;
  created_at?: string;
};

// ── Table name union ─────────────────────────────────────────

export type SitaTableName =
  | "receipts"
  | "execution_envelopes"
  | "projections"
  | "capabilities"
  | "trust_state"
  | "bookings"
  | "budgets"
  | "deals"
  | "sync_logs"
  | "connector_credentials"
  | "tenant_firewall_logs";
