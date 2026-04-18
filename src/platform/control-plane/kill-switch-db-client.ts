// ═══════════════════════════════════════════════════════════════
// SITA OS — Kill Switch DB Client (Section B.2)
// Browser-side helpers to read DB-backed switch state and call
// the kill-switch-toggle edge function. The static registry remains
// the catalog; this module reads/mutates the live state.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import type { KillSwitchEntry } from "./kill-switch-types";

export interface KillSwitchRow {
  id: string;
  switch_id: string;
  scope: string;
  scope_id: string | null;
  enabled: boolean;
  reason: string | null;
  severity: "minimal" | "moderate" | "significant" | "severe";
  expires_at: string | null;
  requires_approval: boolean;
  activated_by: string | null;
  activated_at: string | null;
  deactivated_at: string | null;
  metadata: Record<string, unknown>;
}

export interface KillSwitchAuditRow {
  id: string;
  switch_id: string;
  action: "activated" | "deactivated" | "expired" | "approved" | "rejected" | "updated";
  actor_user_id: string | null;
  reason: string | null;
  before_state: Record<string, unknown> | null;
  after_state: Record<string, unknown> | null;
  runbook_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

let stateCache: { rows: KillSwitchRow[]; expiresAt: number } | null = null;
const CACHE_MS = 15_000;

export async function loadKillSwitchRows(forceRefresh = false): Promise<KillSwitchRow[]> {
  if (!forceRefresh && stateCache && stateCache.expiresAt > Date.now()) return stateCache.rows;
  const { data, error } = await supabase
    .from("automation_kill_switches")
    .select("*")
    .order("activated_at", { ascending: false });
  if (error) {
    console.warn("[kill-switch-db] load failed:", error.message);
    return stateCache?.rows ?? [];
  }
  const rows = (data ?? []) as unknown as KillSwitchRow[];
  stateCache = { rows, expiresAt: Date.now() + CACHE_MS };
  return rows;
}

export function clearKillSwitchCache() {
  stateCache = null;
}

/** Returns the live row for a registry entry, or null if not yet persisted. */
export async function getKillSwitchRow(switchId: string): Promise<KillSwitchRow | null> {
  const rows = await loadKillSwitchRows();
  return rows.find((r) => r.switch_id === switchId || r.scope_id === switchId) ?? null;
}

export function isSwitchActive(switchId: string, rows: KillSwitchRow[]): boolean {
  return rows.some(
    (r) =>
      r.enabled &&
      (r.switch_id === switchId ||
        r.scope_id === switchId ||
        (r.scope === "global" && switchId !== "KS-NONE")),
  );
}

export interface ToggleArgs {
  switchId: string;
  enable: boolean;
  reason: string;
  expiresInMinutes?: number;
  severity?: "minimal" | "moderate" | "significant" | "severe";
  approvalId?: string;
}

export async function toggleKillSwitch(args: ToggleArgs): Promise<{ ok: boolean; error?: string; requiresApproval?: boolean; approvalId?: string }> {
  if (args.enable && (!args.reason || args.reason.trim().length < 20)) {
    return { ok: false, error: "Reason must be at least 20 characters" };
  }
  const { data, error } = await supabase.functions.invoke("kill-switch-toggle", {
    body: args,
  });
  if (error) return { ok: false, error: error.message };
  clearKillSwitchCache();
  return (data as { ok: boolean; error?: string; requiresApproval?: boolean; approvalId?: string }) ?? { ok: true };
}

export async function loadAuditLog(switchId: string, limit = 50): Promise<KillSwitchAuditRow[]> {
  const { data, error } = await supabase
    .from("kill_switch_audit_log")
    .select("*")
    .eq("switch_id", switchId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.warn("[kill-switch-db] audit load failed:", error.message);
    return [];
  }
  return (data ?? []) as unknown as KillSwitchAuditRow[];
}

export function describeAffectedSystems(entry: KillSwitchEntry): { layers: string[]; functions: string[] } {
  return {
    layers: [...entry.enforcementLayers],
    functions: [...entry.affectedEdgeFunctions],
  };
}
