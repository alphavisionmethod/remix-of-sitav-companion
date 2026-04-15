// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Action Safety Rails
// Dry-run, confirmation, cooldown, dual-approval for destructive ops
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

export interface SafetyRequirements {
  actionKey: string;
  displayName: string;
  riskLevel: string;
  requiresDryRun: boolean;
  requiresConfirmation: boolean;
  requiresDualApproval: boolean;
  requiresJustification: boolean;
  cooldownSeconds: number;
  requiredPermission: string;
  impactSummaryTemplate: string;
}

export interface DryRunResult {
  actionKey: string;
  params: Record<string, unknown>;
  impactSummary: string;
  affectedCount: number;
  risks: string[];
  reversible: boolean;
  estimatedDuration: string;
}

export interface ConfirmationRequest {
  id: string;
  actionKey: string;
  actorUserId: string;
  justification: string;
  status: string;
  dryRunResult: DryRunResult | null;
  impactSummary: string;
  createdAt: string;
  cooldownExpiresAt: string | null;
}

class AdminSafetyEngine {
  private safetyCache = new Map<string, SafetyRequirements>();

  async loadSafetyActions(): Promise<SafetyRequirements[]> {
    const { data } = await supabase.from("admin_safety_actions").select("*");

    const actions = ((data ?? []) as Array<Record<string, unknown>>).map((row) => ({
      actionKey: row.action_key as string,
      displayName: row.display_name as string,
      riskLevel: row.risk_level as string,
      requiresDryRun: row.requires_dry_run as boolean,
      requiresConfirmation: row.requires_confirmation as boolean,
      requiresDualApproval: row.requires_dual_approval as boolean,
      requiresJustification: row.requires_justification as boolean,
      cooldownSeconds: row.cooldown_seconds as number,
      requiredPermission: row.required_permission as string,
      impactSummaryTemplate: (row.impact_summary_template as string) ?? "",
    }));

    this.safetyCache.clear();
    actions.forEach((a) => this.safetyCache.set(a.actionKey, a));
    return actions;
  }

  async getSafetyRequirements(actionKey: string): Promise<SafetyRequirements | null> {
    if (this.safetyCache.size === 0) await this.loadSafetyActions();
    return this.safetyCache.get(actionKey) ?? null;
  }

  async requestDryRun(
    actionKey: string,
    params: Record<string, unknown>
  ): Promise<DryRunResult> {
    const safety = await this.getSafetyRequirements(actionKey);
    if (!safety) throw new Error(`Unknown safety action: ${actionKey}`);

    // Simulate dry-run analysis based on action type
    const analysis = this.analyzeDryRun(actionKey, params);

    return {
      actionKey,
      params,
      impactSummary: analysis.summary,
      affectedCount: analysis.affected,
      risks: analysis.risks,
      reversible: analysis.reversible,
      estimatedDuration: analysis.duration,
    };
  }

  async requestConfirmation(
    actionKey: string,
    actorUserId: string,
    justification: string,
    params: Record<string, unknown> = {},
    dryRunResult?: DryRunResult
  ): Promise<ConfirmationRequest> {
    const safety = await this.getSafetyRequirements(actionKey);
    if (!safety) throw new Error(`Unknown safety action: ${actionKey}`);

    // Check cooldown
    const cooldownActive = await this.getCooldownStatus(actionKey);
    if (cooldownActive.active) {
      throw new Error(`Action ${actionKey} is in cooldown until ${cooldownActive.expiresAt}`);
    }

    const cooldownExpiresAt = safety.cooldownSeconds > 0
      ? new Date(Date.now() + safety.cooldownSeconds * 1000).toISOString()
      : null;

    const { data, error } = await supabase
      .from("admin_action_confirmations")
      .insert({
        action_key: actionKey,
        actor_user_id: actorUserId,
        justification,
        status: safety.requiresDualApproval ? "pending_dual_approval" : "pending",
        params,
        dry_run_result: dryRunResult ? (dryRunResult as unknown as Record<string, unknown>) : null,
        impact_summary: dryRunResult?.impactSummary ?? "",
        cooldown_expires_at: cooldownExpiresAt,
        correlation_id: crypto.randomUUID(),
      })
      .select()
      .single();

    if (error) throw error;

    const row = data as Record<string, unknown>;
    return {
      id: row.id as string,
      actionKey: row.action_key as string,
      actorUserId: row.actor_user_id as string,
      justification: row.justification as string,
      status: row.status as string,
      dryRunResult: dryRunResult ?? null,
      impactSummary: (row.impact_summary as string) ?? "",
      createdAt: row.created_at as string,
      cooldownExpiresAt: row.cooldown_expires_at as string | null,
    };
  }

  async getCooldownStatus(actionKey: string): Promise<{ active: boolean; expiresAt: string | null }> {
    const { data } = await supabase
      .from("admin_action_confirmations")
      .select("cooldown_expires_at")
      .eq("action_key", actionKey)
      .not("cooldown_expires_at", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!data) return { active: false, expiresAt: null };

    const row = data as Record<string, string>;
    const expires = new Date(row.cooldown_expires_at);
    if (expires > new Date()) {
      return { active: true, expiresAt: row.cooldown_expires_at };
    }
    return { active: false, expiresAt: null };
  }

  async getPendingConfirmations(): Promise<ConfirmationRequest[]> {
    const { data } = await supabase
      .from("admin_action_confirmations")
      .select("*")
      .in("status", ["pending", "pending_dual_approval"])
      .order("created_at", { ascending: false });

    return ((data ?? []) as Array<Record<string, unknown>>).map((row) => ({
      id: row.id as string,
      actionKey: row.action_key as string,
      actorUserId: row.actor_user_id as string,
      justification: row.justification as string,
      status: row.status as string,
      dryRunResult: row.dry_run_result as DryRunResult | null,
      impactSummary: (row.impact_summary as string) ?? "",
      createdAt: row.created_at as string,
      cooldownExpiresAt: row.cooldown_expires_at as string | null,
    }));
  }

  async approveConfirmation(confirmationId: string, approverUserId: string): Promise<void> {
    await supabase
      .from("admin_action_confirmations")
      .update({
        status: "approved",
        approved_by: approverUserId,
        approved_at: new Date().toISOString(),
      })
      .eq("id", confirmationId);
  }

  async rejectConfirmation(confirmationId: string, rejectorUserId: string): Promise<void> {
    await supabase
      .from("admin_action_confirmations")
      .update({
        status: "rejected",
        rejected_by: rejectorUserId,
        rejected_at: new Date().toISOString(),
      })
      .eq("id", confirmationId);
  }

  getAllSafetyActions(): SafetyRequirements[] {
    return Array.from(this.safetyCache.values());
  }

  // ── Private helpers ──────────────────────────────────────

  private analyzeDryRun(actionKey: string, params: Record<string, unknown>): {
    summary: string; affected: number; risks: string[]; reversible: boolean; duration: string;
  } {
    const analyses: Record<string, () => ReturnType<typeof this.analyzeDryRun>> = {
      "quota.override": () => ({
        summary: `Quota override for user ${params.userId ?? "unknown"}. New limit: ${params.newQuota ?? "unchanged"}.`,
        affected: 1,
        risks: ["User may lose access to files exceeding new quota"],
        reversible: true,
        duration: "< 1s",
      }),
      "device.mass_revoke": () => ({
        summary: `Mass device revocation. Criteria: ${JSON.stringify(params.criteria ?? {})}`,
        affected: (params.estimatedCount as number) ?? 0,
        risks: ["Users will be logged out", "Sync will stop on affected devices", "Data loss if unsynced changes exist"],
        reversible: false,
        duration: "1-5 minutes",
      }),
      "policy.global_edit": () => ({
        summary: `Global policy change: ${params.policyKey ?? "unknown"}`,
        affected: (params.estimatedUsers as number) ?? 0,
        risks: ["All users affected immediately", "May break existing workflows", "Requires propagation time"],
        reversible: true,
        duration: "< 30s propagation",
      }),
      "feature.global_kill": () => ({
        summary: `Kill switch for feature: ${params.featureKey ?? "unknown"}`,
        affected: (params.estimatedUsers as number) ?? 0,
        risks: ["Feature disabled for ALL users immediately", "May interrupt active sessions"],
        reversible: true,
        duration: "< 1s",
      }),
      "user.suspend": () => ({
        summary: `Suspend user account: ${params.userId ?? "unknown"}`,
        affected: 1,
        risks: ["User loses all access", "Active sync stops", "Shared files become inaccessible to collaborators"],
        reversible: true,
        duration: "< 1s",
      }),
      "sync.force_reset": () => ({
        summary: `Force sync reset for user: ${params.userId ?? "unknown"}`,
        affected: 1,
        risks: ["All sync state destroyed", "User must re-sync from scratch", "Potential data conflicts on reconnect"],
        reversible: false,
        duration: "1-2 minutes",
      }),
      "data.bulk_repair": () => ({
        summary: `Bulk repair operation: ${params.repairType ?? "unknown"}`,
        affected: (params.estimatedCount as number) ?? 0,
        risks: ["Large-scale data modification", "Performance impact during execution", "May trigger reconciliation"],
        reversible: false,
        duration: "5-30 minutes",
      }),
      "account.purge": () => ({
        summary: `Permanent account purge: ${params.userId ?? "unknown"}`,
        affected: 1,
        risks: ["ALL user data permanently deleted", "Cannot be undone", "GDPR compliance action"],
        reversible: false,
        duration: "2-5 minutes",
      }),
    };

    const analyzer = analyses[actionKey];
    if (analyzer) return analyzer();

    return {
      summary: `Action: ${actionKey}`,
      affected: 0,
      risks: ["Impact unknown — review carefully"],
      reversible: false,
      duration: "Unknown",
    };
  }
}

export const adminSafety = new AdminSafetyEngine();
