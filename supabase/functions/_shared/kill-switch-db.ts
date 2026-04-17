// ═══════════════════════════════════════════════════════════════
// SITA OS — Kill Switch DB Helper (Edge Function side)
// Used by kill-switch-toggle and kill-switch-state to read/mutate
// the canonical state with admin gating + audit + runbook hints.
// ═══════════════════════════════════════════════════════════════

// deno-lint-ignore-file no-explicit-any

const HIGH_RISK_DUAL_APPROVAL_SWITCHES = new Set<string>([
  "KS-PAYMENTS",
  "KS-MODEL-PROVIDERS",
  "KS-RELEASE-ROLLOUT",
  "KS-APPLIANCE-UPDATE",
]);

export function isDualApprovalSwitch(switchId: string): boolean {
  return HIGH_RISK_DUAL_APPROVAL_SWITCHES.has(switchId);
}

export interface ToggleResult {
  ok: boolean;
  error?: string;
  requiresApproval?: boolean;
  approvalId?: string;
  rowId?: string;
}

export async function getCurrentSwitchRow(supabase: any, switchId: string) {
  const { data } = await supabase
    .from("automation_kill_switches")
    .select("*")
    .or(`switch_id.eq.${switchId},scope_id.eq.${switchId}`)
    .order("activated_at", { ascending: false })
    .limit(1);
  return Array.isArray(data) && data.length > 0 ? data[0] : null;
}

export async function applyToggle(
  supabase: any,
  args: {
    switchId: string;
    enable: boolean;
    reason: string;
    actorUserId: string;
    expiresInMinutes?: number;
    severity?: string;
  },
): Promise<ToggleResult> {
  const expiresAt = args.expiresInMinutes
    ? new Date(Date.now() + args.expiresInMinutes * 60_000).toISOString()
    : null;

  const existing = await getCurrentSwitchRow(supabase, args.switchId);

  if (existing) {
    const update: Record<string, unknown> = {
      enabled: args.enable,
      reason: args.reason,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
      switch_id: args.switchId,
    };
    if (args.enable) {
      update.activated_by = args.actorUserId;
      update.activated_at = new Date().toISOString();
      update.deactivated_at = null;
    } else {
      update.deactivated_by = args.actorUserId;
      update.deactivated_at = new Date().toISOString();
    }
    if (args.severity) update.severity = args.severity;

    const { error } = await supabase
      .from("automation_kill_switches")
      .update(update)
      .eq("id", existing.id);
    if (error) return { ok: false, error: error.message };
    return { ok: true, rowId: existing.id };
  }

  const { data, error } = await supabase
    .from("automation_kill_switches")
    .insert({
      user_id: args.actorUserId,
      switch_id: args.switchId,
      scope: "domain",
      scope_id: args.switchId,
      enabled: args.enable,
      reason: args.reason,
      expires_at: expiresAt,
      severity: args.severity ?? "moderate",
      requires_approval: isDualApprovalSwitch(args.switchId),
      activated_by: args.enable ? args.actorUserId : null,
      activated_at: args.enable ? new Date().toISOString() : null,
      deactivated_by: args.enable ? null : args.actorUserId,
      deactivated_at: args.enable ? null : new Date().toISOString(),
      metadata: {},
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, rowId: data?.id };
}

export async function requireAdmin(supabase: any, userId: string): Promise<boolean> {
  const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (data === true) return true;
  const { data: perm } = await supabase.rpc("has_admin_permission", {
    _user_id: userId,
    _permission: "flags.toggle",
  });
  return perm === true;
}
