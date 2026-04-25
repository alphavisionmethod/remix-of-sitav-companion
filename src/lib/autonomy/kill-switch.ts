// ═══════════════════════════════════════════════════════════════
// SITA OS — Global Kill-Switch (Phase 9 of Autonomy Roadmap)
// One-tap emergency stop that halts every advisor controller,
// standing mission, and queue execution at the next state check.
//
// Hard rules:
//  - When engaged, NO controller cycle runs to completion. NO
//    standing mission fires. NO queue item executes.
//  - Engage/release events are immutably audited.
//  - Domain-scoped halts honor `advisor_agents.domain` so an
//    owner can pause finance without freezing inbox triage.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type KillSwitchRow =
  Database["public"]["Tables"]["autonomy_kill_switch"]["Row"];

export type KillSwitchStatus = {
  engaged: boolean;
  reason: string | null;
  domainScope: string | null;
  engagedAt: string | null;
};

const DEFAULT_STATUS: KillSwitchStatus = {
  engaged: false,
  reason: null,
  domainScope: null,
  engagedAt: null,
};

/** Pure: should an action in `domain` be blocked given current status? */
export function shouldHalt(
  status: KillSwitchStatus,
  domain?: string | null,
): boolean {
  if (!status.engaged) return false;
  if (!status.domainScope) return true; // global halt
  if (!domain) return true;
  return status.domainScope === domain;
}

/** Fetch current status for the signed-in user. Safe default = not engaged. */
export async function getKillSwitchStatus(): Promise<KillSwitchStatus> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return DEFAULT_STATUS;

  const { data } = await supabase
    .from("autonomy_kill_switch")
    .select("engaged, reason, domain_scope, engaged_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) return DEFAULT_STATUS;
  return {
    engaged: !!data.engaged,
    reason: data.reason,
    domainScope: data.domain_scope,
    engagedAt: data.engaged_at,
  };
}

/** Engage the kill-switch. Idempotent. */
export async function engageKillSwitch(input: {
  reason: string;
  domainScope?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return { ok: false, error: "not_authenticated" };

  const nowIso = new Date().toISOString();
  const { error } = await supabase
    .from("autonomy_kill_switch")
    .upsert(
      {
        user_id: userId,
        engaged: true,
        reason: input.reason,
        domain_scope: input.domainScope ?? null,
        engaged_at: nowIso,
        engaged_by: userId,
        released_at: null,
        released_by: null,
      },
      { onConflict: "user_id" },
    );

  if (error) return { ok: false, error: error.message };

  await supabase.from("autonomy_kill_switch_audit").insert({
    user_id: userId,
    actor_user_id: userId,
    action: "engaged",
    reason: input.reason,
    domain_scope: input.domainScope ?? null,
  });

  return { ok: true };
}

/** Release the kill-switch. Resumes the autonomy loop on next cycle. */
export async function releaseKillSwitch(input: {
  reason?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return { ok: false, error: "not_authenticated" };

  const nowIso = new Date().toISOString();
  const { error } = await supabase
    .from("autonomy_kill_switch")
    .upsert(
      {
        user_id: userId,
        engaged: false,
        reason: null,
        domain_scope: null,
        released_at: nowIso,
        released_by: userId,
      },
      { onConflict: "user_id" },
    );

  if (error) return { ok: false, error: error.message };

  await supabase.from("autonomy_kill_switch_audit").insert({
    user_id: userId,
    actor_user_id: userId,
    action: "released",
    reason: input.reason ?? "released_by_owner",
  });

  return { ok: true };
}

export type KillSwitchAuditRow =
  Database["public"]["Tables"]["autonomy_kill_switch_audit"]["Row"];

export async function fetchKillSwitchAudit(limit = 25): Promise<KillSwitchAuditRow[]> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return [];
  const { data } = await supabase
    .from("autonomy_kill_switch_audit")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as KillSwitchAuditRow[];
}