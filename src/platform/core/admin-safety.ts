// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Action Safety Rails
// Dry-run, confirmation, cooldown, dual-approval for destructive ops
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

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
    const { data } = await supabase
      .from("admin_safety_actions" as never)
      .select("*" as never);

    const rows = (data ?? []) as unknown as Array<Record<string, unknown>>;
    const actions = rows.map((row) => ({
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

  async requestDryRun(actionKey: string, params: Record<string, unknown>): Promise<DryRunResult> {
    const safety = await this.getSafetyRequirements(actionKey);
    if (!safety) throw new Error(`Unknown safety action: ${actionKey}`);
    return this.analyzeDryRun(actionKey, params);
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

    const cooldownActive = await this.getCooldownStatus(actionKey);
    if (cooldownActive.active) {
      throw new Error(`Action ${actionKey} is in cooldown until ${cooldownActive.expiresAt}`);
    }

    const cooldownExpiresAt = safety.cooldownSeconds > 0
      ? new Date(Date.now() + safety.cooldownSeconds * 1000).toISOString()
      : null;

    const insertData = {
      action_key: actionKey,
      actor_user_id: actorUserId,
      justification,
      status: safety.requiresDualApproval ? "pending_dual_approval" : "pending",
      params: params as unknown as Json,
      dry_run_result: dryRunResult ? (dryRunResult as unknown as Json) : null,
      impact_summary: dryRunResult?.impactSummary ?? "",
      cooldown_expires_at: cooldownExpiresAt,
      correlation_id: crypto.randomUUID(),
    };

    const { data, error } = await supabase
      .from("admin_action_confirmations" as never)
      .insert(insertData as never)
      .select("*" as never)
      .single();

    if (error) throw error;
    const row = data as unknown as Record<string, unknown>;
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
      .from("admin_action_confirmations" as never)
      .select("cooldown_expires_at" as never)
      .eq("action_key" as never, actionKey)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!data) return { active: false, expiresAt: null };
    const row = data as unknown as { cooldown_expires_at: string | null };
    if (!row.cooldown_expires_at) return { active: false, expiresAt: null };
    const expires = new Date(row.cooldown_expires_at);
    return expires > new Date()
      ? { active: true, expiresAt: row.cooldown_expires_at }
      : { active: false, expiresAt: null };
  }

  async getPendingConfirmations(): Promise<ConfirmationRequest[]> {
    const { data } = await supabase
      .from("admin_action_confirmations" as never)
      .select("*" as never)
      .order("created_at", { ascending: false });

    const rows = (data ?? []) as unknown as Array<Record<string, unknown>>;
    return rows
      .filter((row) => ["pending", "pending_dual_approval"].includes(row.status as string))
      .map((row) => ({
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
      .from("admin_action_confirmations" as never)
      .update({ status: "approved", approved_by: approverUserId, approved_at: new Date().toISOString() } as never)
      .eq("id" as never, confirmationId);
  }

  async rejectConfirmation(confirmationId: string, rejectorUserId: string): Promise<void> {
    await supabase
      .from("admin_action_confirmations" as never)
      .update({ status: "rejected", rejected_by: rejectorUserId, rejected_at: new Date().toISOString() } as never)
      .eq("id" as never, confirmationId);
  }

  getAllSafetyActions(): SafetyRequirements[] {
    return Array.from(this.safetyCache.values());
  }

  private analyzeDryRun(actionKey: string, params: Record<string, unknown>): DryRunResult {
    const templates: Record<string, () => DryRunResult> = {
      "quota.override": () => ({
        actionKey, params,
        impactSummary: `Quota override for user ${params.userId ?? "unknown"}. New limit: ${params.newQuota ?? "unchanged"}.`,
        affectedCount: 1,
        risks: ["User may lose access to files exceeding new quota"],
        reversible: true,
        estimatedDuration: "< 1s",
      }),
      "device.mass_revoke": () => ({
        actionKey, params,
        impactSummary: `Mass device revocation. Criteria: ${JSON.stringify(params.criteria ?? {})}`,
        affectedCount: (params.estimatedCount as number) ?? 0,
        risks: ["Users will be logged out", "Sync will stop on affected devices", "Data loss if unsynced changes exist"],
        reversible: false,
        estimatedDuration: "1-5 minutes",
      }),
      "policy.global_edit": () => ({
        actionKey, params,
        impactSummary: `Global policy change: ${params.policyKey ?? "unknown"}`,
        affectedCount: (params.estimatedUsers as number) ?? 0,
        risks: ["All users affected immediately", "May break existing workflows"],
        reversible: true,
        estimatedDuration: "< 30s propagation",
      }),
      "feature.global_kill": () => ({
        actionKey, params,
        impactSummary: `Kill switch for feature: ${params.featureKey ?? "unknown"}`,
        affectedCount: (params.estimatedUsers as number) ?? 0,
        risks: ["Feature disabled for ALL users immediately"],
        reversible: true,
        estimatedDuration: "< 1s",
      }),
      "user.suspend": () => ({
        actionKey, params,
        impactSummary: `Suspend user account: ${params.userId ?? "unknown"}`,
        affectedCount: 1,
        risks: ["User loses all access", "Active sync stops"],
        reversible: true,
        estimatedDuration: "< 1s",
      }),
      "sync.force_reset": () => ({
        actionKey, params,
        impactSummary: `Force sync reset for user: ${params.userId ?? "unknown"}`,
        affectedCount: 1,
        risks: ["All sync state destroyed", "User must re-sync from scratch"],
        reversible: false,
        estimatedDuration: "1-2 minutes",
      }),
      "data.bulk_repair": () => ({
        actionKey, params,
        impactSummary: `Bulk repair: ${params.repairType ?? "unknown"}`,
        affectedCount: (params.estimatedCount as number) ?? 0,
        risks: ["Large-scale data modification", "Performance impact"],
        reversible: false,
        estimatedDuration: "5-30 minutes",
      }),
      "account.purge": () => ({
        actionKey, params,
        impactSummary: `Permanent account purge: ${params.userId ?? "unknown"}`,
        affectedCount: 1,
        risks: ["ALL user data permanently deleted", "Cannot be undone"],
        reversible: false,
        estimatedDuration: "2-5 minutes",
      }),
    };

    const generator = templates[actionKey];
    if (generator) return generator();

    return {
      actionKey, params,
      impactSummary: `Action: ${actionKey}`,
      affectedCount: 0,
      risks: ["Impact unknown — review carefully"],
      reversible: false,
      estimatedDuration: "Unknown",
    };
  }
}

export const adminSafety = new AdminSafetyEngine();
