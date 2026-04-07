// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Durable State Hooks
// All admin mutations are persistence-backed, audit-visible,
// and generate proof records for operator actions.
// ═══════════════════════════════════════════════════════════════

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
// ── Operator Action Logger ───────────────────────────────────
async function logOperatorAction(
  userId: string,
  actionType: string,
  targetTable: string,
  targetId: string | null,
  payload: Record<string, unknown>,
  result: Record<string, unknown> = {}
) {
  await fromTable("operator_actions").insert({
    user_id: userId,
    action_type: actionType,
    target_table: targetTable,
    target_id: targetId,
    payload,
    result,
  });
}

// ── Proof Record for Admin Action ────────────────────────────
async function emitAdminProof(
  userId: string,
  actionSummary: string,
  domain: string,
  category: string,
  correlationId?: string
) {
  await fromTable("proof_records").insert({
    user_id: userId,
    action_summary: actionSummary,
    domain,
    category,
    verification: "system-verified",
    result: "completed",
    correlation_id: correlationId || crypto.randomUUID(),
  });
}

// ── Governance Data Hooks ────────────────────────────────────

export function useGovernanceSummary() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["governance-summary", user?.id],
    enabled: !!user,
    refetchInterval: 30000,
    queryFn: async () => {
      const [incidents, policies, approvals, proofs, connectors, trustState] = await Promise.all([
        fromTable("incidents").select("id, severity, status, created_at").order("created_at", { ascending: false }).limit(100),
        fromTable("policies").select("id, active, category, approval_required"),
        fromTable("approval_queue").select("id, status, action_type, created_at").eq("status", "pending"),
        fromTable("proof_records").select("id, verification, result, domain, created_at").order("created_at", { ascending: false }).limit(50),
        fromTable("connector_configs").select("id, service, status, last_sync_at"),
        fromTable("trust_state").select("id, trust_level, score, entity_type"),
      ]);

      const incidentData = incidents.data || [];
      const policyData = policies.data || [];
      const approvalData = approvals.data || [];
      const proofData = proofs.data || [];
      const connectorData = connectors.data || [];
      const trustData = trustState.data || [];

      const openIncidents = incidentData.filter((i: any) => i.status === "open");
      const activePolicies = policyData.filter((p: any) => p.active);
      const verifiedProofs = proofData.filter((p: any) => p.verification === "system-verified" || p.result === "completed");
      const activeConnectors = connectorData.filter((c: any) => c.status === "active");
      const avgTrust = trustData.length > 0 ? Math.round(trustData.reduce((s: number, t: any) => s + (t.score || 0), 0) / trustData.length) : 0;

      return {
        incidents: { total: incidentData.length, open: openIncidents.length, data: incidentData },
        policies: { total: policyData.length, active: activePolicies.length, data: policyData },
        approvals: { pending: approvalData.length, data: approvalData },
        proofs: { total: proofData.length, verified: verifiedProofs.length, rate: proofData.length > 0 ? Math.round((verifiedProofs.length / proofData.length) * 100) : 100, data: proofData },
        connectors: { total: connectorData.length, active: activeConnectors.length, data: connectorData },
        trust: { avgScore: avgTrust, entries: trustData.length, data: trustData },
        lastUpdated: new Date().toISOString(),
      };
    },
  });
}

// ── Incident Mutations ───────────────────────────────────────

export function useIncidentMutations() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const resolveIncident = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { error } = await fromTable("incidents").update({
        status: "resolved",
        resolved_at: new Date().toISOString(),
        resolution_notes: notes,
      }).eq("id", id);
      if (error) throw error;

      await logOperatorAction(user!.id, "resolve_incident", "incidents", id, { notes }, { status: "resolved" });
      await emitAdminProof(user!.id, `Incident resolved: ${notes.slice(0, 80)}`, "system", "incident_resolution");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["governance-summary"] });
      qc.invalidateQueries({ queryKey: ["incidents"] });
      toast.success("Incident resolved with proof");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const acknowledgeIncident = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await fromTable("incidents").update({
        acknowledged_at: new Date().toISOString(),
        acknowledged_by: user!.id,
      }).eq("id", id);
      if (error) throw error;

      await logOperatorAction(user!.id, "acknowledge_incident", "incidents", id, {}, { acknowledged: true });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["governance-summary"] });
      toast.success("Incident acknowledged");
    },
  });

  return { resolveIncident, acknowledgeIncident };
}

// ── Policy Version Tracking ──────────────────────────────────

export function usePolicyVersioning() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const updatePolicyWithVersion = useMutation({
    mutationFn: async ({ policyId, changes, versionNumber }: { policyId: string; changes: Record<string, unknown>; versionNumber: number }) => {
      // Update the policy
      const { error } = await fromTable("policies").update(changes).eq("id", policyId);
      if (error) throw error;

      // Create version record
      await fromTable("policy_versions").insert({
        user_id: user!.id,
        policy_id: policyId,
        version_number: versionNumber,
        diff_json: changes,
        changed_by: user!.id,
      });

      await logOperatorAction(user!.id, "update_policy", "policies", policyId, changes, { version: versionNumber });
      await emitAdminProof(user!.id, `Policy updated (v${versionNumber})`, "system", "policy_change");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["policies"] });
      qc.invalidateQueries({ queryKey: ["governance-summary"] });
      toast.success("Policy updated with version history");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { updatePolicyWithVersion };
}

// ── Connector Sync History ───────────────────────────────────

export function useConnectorSyncHistory(connectorId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["connector-sync-history", connectorId, user?.id],
    enabled: !!user && !!connectorId,
    queryFn: async () => {
      const { data, error } = await fromTable("connector_sync_history")
        .select("*")
        .eq("connector_id", connectorId)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
  });
}

export function useConnectorSyncMutation() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ connectorId, status, error: syncError, recordsSynced }: { connectorId: string; status: string; error?: string; recordsSynced?: number }) => {
      await fromTable("connector_sync_history").insert({
        user_id: user!.id,
        connector_id: connectorId,
        status,
        error: syncError,
        records_synced: recordsSynced || 0,
        completed_at: status !== "pending" ? new Date().toISOString() : null,
      });

      await logOperatorAction(user!.id, "connector_sync", "connector_configs", connectorId, { status, recordsSynced }, { status });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["connector-sync-history"] });
      qc.invalidateQueries({ queryKey: ["governance-summary"] });
    },
  });
}

// ── Operator Actions Feed ────────────────────────────────────

export function useOperatorActions(limit = 50) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["operator-actions", user?.id, limit],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await fromTable("operator_actions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data || [];
    },
  });
}
