// ═══════════════════════════════════════════════════════════════
// SITA OS — Domain Runtime Status Service
// Tracks per-domain truth: real vs demo vs scaffold
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

export interface DomainRuntimeRecord {
  id: string;
  domain_key: string;
  domain_name: string;
  runtime_class: "real" | "demo" | "scaffold" | "partial";
  has_real_data: boolean;
  has_real_service: boolean;
  has_db_tables: boolean;
  has_rls_policies: boolean;
  has_edge_functions: boolean;
  demo_provider_exists: boolean;
  empty_state_handled: boolean;
  truth_score: number;
  last_verified_at: string | null;
  notes: string | null;
}

const SITA_DOMAINS = [
  { key: "auth", name: "Authentication & Identity" },
  { key: "finance", name: "Finance & Money" },
  { key: "crm", name: "CRM & Relationships" },
  { key: "household", name: "Household Operations" },
  { key: "documents", name: "Document Management" },
  { key: "calendar", name: "Calendar & Scheduling" },
  { key: "ai_gateway", name: "AI Gateway & Intelligence" },
  { key: "connectors", name: "External Connectors" },
  { key: "notifications", name: "Notifications & Alerts" },
  { key: "workflows", name: "Workflow Engine" },
  { key: "advisors", name: "AI Advisors" },
  { key: "boardroom", name: "Boardroom & Strategy" },
  { key: "approvals", name: "Approvals & Trust" },
  { key: "analytics", name: "Analytics & Insights" },
  { key: "storage", name: "File Storage" },
] as const;

export async function getDomainRuntimeStatuses(): Promise<DomainRuntimeRecord[]> {
  const { data, error } = await supabase
    .from("domain_runtime_status")
    .select("*")
    .order("domain_key");

  if (error) {
    console.error("[DomainRuntime] Error fetching statuses:", error);
    return [];
  }
  return (data ?? []) as unknown as DomainRuntimeRecord[];
}

export async function upsertDomainStatus(
  userId: string,
  record: Omit<DomainRuntimeRecord, "id">
): Promise<void> {
  const truthScore = calculateTruthScore(record);
  const { error } = await supabase
    .from("domain_runtime_status")
    .upsert({
      user_id: userId,
      domain_key: record.domain_key,
      domain_name: record.domain_name,
      runtime_class: record.runtime_class,
      has_real_data: record.has_real_data,
      has_real_service: record.has_real_service,
      has_db_tables: record.has_db_tables,
      has_rls_policies: record.has_rls_policies,
      has_edge_functions: record.has_edge_functions,
      demo_provider_exists: record.demo_provider_exists,
      empty_state_handled: record.empty_state_handled,
      truth_score: truthScore,
      last_verified_at: new Date().toISOString(),
      notes: record.notes,
    }, { onConflict: "user_id,domain_key" });

  if (error) console.error("[DomainRuntime] Upsert error:", error);
}

function calculateTruthScore(r: Partial<DomainRuntimeRecord>): number {
  let score = 0;
  if (r.has_db_tables) score += 15;
  if (r.has_rls_policies) score += 15;
  if (r.has_real_service) score += 20;
  if (r.has_real_data) score += 15;
  if (r.has_edge_functions) score += 10;
  if (r.demo_provider_exists) score += 10;
  if (r.empty_state_handled) score += 10;
  if (r.runtime_class === "real") score += 5;
  return Math.min(score, 100);
}

export function getRuntimeTruthIndex(records: DomainRuntimeRecord[]): number {
  if (records.length === 0) return 0;
  const total = records.reduce((sum, r) => sum + r.truth_score, 0);
  return Math.round(total / records.length);
}

export function getDomainList() {
  return SITA_DOMAINS;
}
