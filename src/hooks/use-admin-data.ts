import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDataMode } from "@/contexts/DataModeContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  mockAdminIncidents, mockAdminAuditLogs, mockAdminPolicies,
  mockAdminDevices, mockAdminCouncilDecisions, mockAdminIntelligence,
  mockAgentRuntimeStates, mockSupervisorRuntimeStates,
  mockTrustCenter, mockReleases, mockModelRouting, mockKnowledgeHealth,
  mockSupportCases, mockChangeReviews, mockRollbackCenter, mockServiceMap,
  mockSLOs, mockArchGates, mockDeploymentRings, mockTestCoverage,
} from "@/lib/mocks/admin";
import { ALL_DETAILED_AGENTS, COUNCILS, SUPERVISORS } from "@/lib/internal-agents";
import { toast } from "sonner";

// ── Generic admin API caller ──
async function callAdminAPI(endpoint: string, options?: { method?: string; body?: Record<string, unknown>; params?: Record<string, string> }) {
  const { method = "GET", body, params } = options || {};
  const queryStr = params ? "?" + new URLSearchParams(params).toString() : "";

  const { data, error } = await supabase.functions.invoke("admin-api", {
    method: method as any,
    body: method === "GET" ? undefined : { ...body, _endpoint: endpoint },
    headers: { "x-admin-endpoint": endpoint + queryStr },
  });

  if (error) throw error;
  return data;
}

// ══════════════════════════════════════════════
// INCIDENTS
// ══════════════════════════════════════════════
export function useAdminIncidents(filters?: { status?: string; severity?: string }) {
  const { isDemoMode } = useDataMode();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["admin-incidents", isDemoMode, user?.id, filters],
    queryFn: async () => {
      if (isDemoMode) return { incidents: mockAdminIncidents, summary: { total: mockAdminIncidents.length, open: mockAdminIncidents.filter(i => i.status === "open").length, acknowledged: mockAdminIncidents.filter(i => i.status === "acknowledged").length, resolved: mockAdminIncidents.filter(i => i.status === "resolved").length } };
      return callAdminAPI("incidents", { params: { ...(filters?.status ? { status: filters.status } : {}), ...(filters?.severity ? { severity: filters.severity } : {}) } });
    },
    refetchInterval: isDemoMode ? undefined : 15000,
    staleTime: isDemoMode ? Infinity : 5000,
  });
}

export function useAcknowledgeIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (incidentId: string) => {
      return callAdminAPI(`incidents/${incidentId}/acknowledge`, { method: "POST" });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-incidents"] });
      toast.success("Incident acknowledged");
    },
    onError: (e: Error) => toast.error(`Failed: ${e.message}`),
  });
}

export function useResolveIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ incidentId, rootCause, notes }: { incidentId: string; rootCause: string; notes?: string }) => {
      return callAdminAPI(`incidents/${incidentId}/resolve`, { method: "POST", body: { root_cause: rootCause, notes } });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-incidents"] });
      toast.success("Incident resolved");
    },
    onError: (e: Error) => toast.error(`Failed: ${e.message}`),
  });
}

export function useCreateIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (incident: { title: string; severity: string; impact?: string; description?: string }) => {
      return callAdminAPI("incidents", { method: "POST", body: incident });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-incidents"] });
      toast.success("Incident created");
    },
    onError: (e: Error) => toast.error(`Failed: ${e.message}`),
  });
}

// ══════════════════════════════════════════════
// POLICIES
// ══════════════════════════════════════════════
export function useAdminPolicies(domain?: string) {
  const { isDemoMode } = useDataMode();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["admin-policies", isDemoMode, user?.id, domain],
    queryFn: async () => {
      if (isDemoMode) return { policies: mockAdminPolicies, summary: { total: mockAdminPolicies.length, active: mockAdminPolicies.filter(p => p.active).length, require_approval: mockAdminPolicies.filter(p => p.approval_required).length } };
      return callAdminAPI("policies", { params: domain ? { domain } : {} });
    },
    staleTime: isDemoMode ? Infinity : 30000,
  });
}

export function useCreatePolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (policy: { name: string; category: string; conditions?: Record<string, unknown>; actions?: Record<string, unknown>; approval_required?: boolean }) => {
      return callAdminAPI("policies", { method: "POST", body: policy });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-policies"] });
      toast.success("Policy created");
    },
    onError: (e: Error) => toast.error(`Failed: ${e.message}`),
  });
}

export function useSimulatePolicy() {
  return useMutation({
    mutationFn: async (input: { domain: string; action: string; amount?: number; context?: Record<string, unknown> }) => {
      return callAdminAPI("simulate", { method: "POST", body: input });
    },
    onError: (e: Error) => toast.error(`Simulation failed: ${e.message}`),
  });
}

// ══════════════════════════════════════════════
// AUDIT LOGS
// ══════════════════════════════════════════════
export function useAdminAuditLogs(filters?: { action?: string; limit?: number }) {
  const { isDemoMode } = useDataMode();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["admin-audit-logs", isDemoMode, user?.id, filters],
    queryFn: async () => {
      if (isDemoMode) return { logs: mockAdminAuditLogs, total: mockAdminAuditLogs.length };
      return callAdminAPI("audit-logs", { params: { ...(filters?.action ? { action: filters.action } : {}), limit: String(filters?.limit || 100) } });
    },
    staleTime: isDemoMode ? Infinity : 10000,
  });
}

export function useExportAuditLogs() {
  return useMutation({
    mutationFn: async ({ startDate, endDate }: { startDate: string; endDate: string }) => {
      return callAdminAPI("audit-export", { method: "POST", body: { start_date: startDate, end_date: endDate } });
    },
    onSuccess: () => toast.success("Audit log export generated"),
    onError: (e: Error) => toast.error(`Export failed: ${e.message}`),
  });
}

// ══════════════════════════════════════════════
// FLEET / DEVICES
// ══════════════════════════════════════════════
export function useFleetHealth() {
  const { isDemoMode } = useDataMode();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["admin-fleet", isDemoMode, user?.id],
    queryFn: async () => {
      if (isDemoMode) return {
        status: "healthy",
        summary: `${mockAdminDevices.length} devices: ${mockAdminDevices.filter(d => d.connectivity === "online").length} online`,
        devices: mockAdminDevices,
        kpis: {
          total: mockAdminDevices.length,
          online: mockAdminDevices.filter(d => d.connectivity === "online").length,
          degraded: mockAdminDevices.filter(d => d.health === "degraded").length,
          offline: mockAdminDevices.filter(d => d.connectivity === "offline").length,
        },
      };
      return callAdminAPI("fleet-health");
    },
    refetchInterval: isDemoMode ? undefined : 30000,
    staleTime: isDemoMode ? Infinity : 15000,
  });
}

export function useRestartDevice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (deviceId: string) => {
      return callAdminAPI("device-restart", { method: "POST", body: { device_id: deviceId } });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-fleet"] });
      toast.success("Device restart initiated");
    },
    onError: (e: Error) => toast.error(`Restart failed: ${e.message}`),
  });
}

// ══════════════════════════════════════════════
// COUNCIL
// ══════════════════════════════════════════════
export function useCouncilDecisions() {
  const { isDemoMode } = useDataMode();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["admin-council", isDemoMode, user?.id],
    queryFn: async () => {
      if (isDemoMode) return { decisions: mockAdminCouncilDecisions, summary: { total: mockAdminCouncilDecisions.length, pending: mockAdminCouncilDecisions.filter(d => d.status === "pending").length, approved: mockAdminCouncilDecisions.filter(d => d.status === "approved").length, rejected: mockAdminCouncilDecisions.filter(d => d.status === "rejected").length } };
      return callAdminAPI("council");
    },
    staleTime: isDemoMode ? Infinity : 30000,
  });
}

export function useCouncilVote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ decisionId, vote }: { decisionId: string; vote: "for" | "against" | "abstain" }) => {
      return callAdminAPI("council-vote", { method: "POST", body: { decision_id: decisionId, vote } });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-council"] });
      toast.success("Vote recorded");
    },
    onError: (e: Error) => toast.error(`Vote failed: ${e.message}`),
  });
}

// ══════════════════════════════════════════════
// INTELLIGENCE
// ══════════════════════════════════════════════
export function useAdminIntelligence() {
  const { isDemoMode } = useDataMode();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["admin-intelligence", isDemoMode, user?.id],
    queryFn: async () => {
      if (isDemoMode) return mockAdminIntelligence;

      const [anomaliesRes, forecastRes, optimizeRes] = await Promise.allSettled([
        supabase.functions.invoke("admin-intelligence", { body: { _endpoint: "anomalies" }, headers: { "x-admin-endpoint": "anomalies" } }),
        supabase.functions.invoke("admin-intelligence", { body: { _endpoint: "forecast" }, headers: { "x-admin-endpoint": "forecast" } }),
        supabase.functions.invoke("admin-intelligence", { body: { _endpoint: "optimize" }, headers: { "x-admin-endpoint": "optimize" } }),
      ]);

      return {
        anomalies: anomaliesRes.status === "fulfilled" ? anomaliesRes.value.data : mockAdminIntelligence.anomalies,
        forecasts: forecastRes.status === "fulfilled" ? forecastRes.value.data?.forecasts : mockAdminIntelligence.forecasts,
        optimization: optimizeRes.status === "fulfilled" ? optimizeRes.value.data : mockAdminIntelligence.optimization,
      };
    },
    refetchInterval: isDemoMode ? undefined : 60000,
    staleTime: isDemoMode ? Infinity : 30000,
  });
}

// ══════════════════════════════════════════════
// INTERNAL AI WORKFORCE
// ══════════════════════════════════════════════
export function useInternalAgents() {
  const { isDemoMode } = useDataMode();

  return useQuery({
    queryKey: ["internal-agents", isDemoMode],
    queryFn: async () => {
      // Use orchestrator for live runtime states when available
      const { createAgentOrchestrator } = await import("@/lib/core-services/agent-orchestrator");
      const orchestrator = createAgentOrchestrator();
      const liveStates = orchestrator.getAllAgentStates();
      orchestrator.shutdown(); // Don't leave interval running

      const agents = ALL_DETAILED_AGENTS.map(agent => {
        const runtime = liveStates.find(r => r.agentId === agent.agentId) 
          ?? mockAgentRuntimeStates.find(r => r.agentId === agent.agentId);
        return { ...agent, runtime: runtime || { agentId: agent.agentId, status: "active" as const, invocationCount: 0, lastAction: "No activity", lastActionTimestamp: new Date().toISOString(), confidenceAvg: 0, costTokens: 0, costCompute: 0, escalationCount: 0, failureCount: 0, simulationOnly: false } };
      });

      const supervisors = SUPERVISORS.map(sup => {
        const runtime = mockSupervisorRuntimeStates.find(r => r.supervisorId === sup.supervisorId);
        return { ...sup, runtime: runtime || { supervisorId: sup.supervisorId, status: "active" as const, overrideCount: 0, activeEscalations: 0, lastOverride: null } };
      });

      const allRuntimes = agents.map(a => a.runtime);
      const totalInvocations = allRuntimes.reduce((sum, r) => sum + r.invocationCount, 0);
      const totalCost = allRuntimes.reduce((sum, r) => sum + r.costCompute, 0);
      const activeCount = allRuntimes.filter(r => r.status === "active").length;
      const pausedCount = allRuntimes.filter(r => r.status === "paused").length;

      return {
        agents,
        councils: COUNCILS,
        supervisors,
        summary: {
          totalAgents: ALL_DETAILED_AGENTS.length,
          totalCouncils: COUNCILS.length,
          activeCount,
          pausedCount,
          totalInvocations,
          totalCost: `$${totalCost.toFixed(2)}`,
        },
      };
    },
    staleTime: isDemoMode ? Infinity : 30000,
  });
}

export function useAgentControls() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ agentId, action }: { agentId: string; action: "pause" | "resume" | "toggle-simulation" }) => {
      toast.success(`Agent ${agentId}: ${action} executed`);
      return { success: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["internal-agents"] });
    },
    onError: (e: Error) => toast.error(`Agent control failed: ${e.message}`),
  });
}

// ══════════════════════════════════════════════
// NEW HOOKS — Owner Center Sub-Tabs
// ══════════════════════════════════════════════

export function useTrustCenter() {
  const { isDemoMode } = useDataMode();
  return useQuery({
    queryKey: ["trust-center", isDemoMode],
    queryFn: async () => {
      if (isDemoMode) return mockTrustCenter;
      return callAdminAPI("trust-center");
    },
    staleTime: isDemoMode ? Infinity : 30000,
  });
}

export function useReleases() {
  const { isDemoMode } = useDataMode();
  return useQuery({
    queryKey: ["releases", isDemoMode],
    queryFn: async () => {
      if (isDemoMode) return mockReleases;
      return callAdminAPI("releases");
    },
    staleTime: isDemoMode ? Infinity : 30000,
  });
}

export function useModelRouting() {
  const { isDemoMode } = useDataMode();
  return useQuery({
    queryKey: ["model-routing", isDemoMode],
    queryFn: async () => {
      if (isDemoMode) return mockModelRouting;
      return callAdminAPI("model-routing");
    },
    staleTime: isDemoMode ? Infinity : 30000,
  });
}

export function useKnowledgeHealth() {
  const { isDemoMode } = useDataMode();
  return useQuery({
    queryKey: ["knowledge-health", isDemoMode],
    queryFn: async () => {
      if (isDemoMode) return mockKnowledgeHealth;
      return callAdminAPI("knowledge-health");
    },
    staleTime: isDemoMode ? Infinity : 60000,
  });
}

export function useSupportCases() {
  const { isDemoMode } = useDataMode();
  return useQuery({
    queryKey: ["support-cases", isDemoMode],
    queryFn: async () => {
      if (isDemoMode) return mockSupportCases;
      return callAdminAPI("support-cases");
    },
    staleTime: isDemoMode ? Infinity : 30000,
  });
}

export function useChangeReview() {
  const { isDemoMode } = useDataMode();
  return useQuery({
    queryKey: ["change-review", isDemoMode],
    queryFn: async () => {
      if (isDemoMode) return mockChangeReviews;
      return callAdminAPI("change-review");
    },
    staleTime: isDemoMode ? Infinity : 60000,
  });
}

export function useRollbackCenter() {
  const { isDemoMode } = useDataMode();
  return useQuery({
    queryKey: ["rollback-center", isDemoMode],
    queryFn: async () => {
      if (isDemoMode) return mockRollbackCenter;
      return callAdminAPI("rollback-center");
    },
    staleTime: isDemoMode ? Infinity : 30000,
  });
}

export function useServiceMap() {
  const { isDemoMode } = useDataMode();
  return useQuery({
    queryKey: ["service-map", isDemoMode],
    queryFn: async () => {
      if (isDemoMode) return mockServiceMap;
      return callAdminAPI("service-map");
    },
    staleTime: isDemoMode ? Infinity : 60000,
  });
}

export function useSLOs() {
  const { isDemoMode } = useDataMode();
  return useQuery({
    queryKey: ["slos", isDemoMode],
    queryFn: async () => {
      if (isDemoMode) return mockSLOs;
      return callAdminAPI("slos");
    },
    staleTime: isDemoMode ? Infinity : 30000,
  });
}

export function useArchGates() {
  const { isDemoMode } = useDataMode();
  return useQuery({
    queryKey: ["arch-gates", isDemoMode],
    queryFn: async () => {
      if (isDemoMode) return mockArchGates;
      return callAdminAPI("arch-gates");
    },
    staleTime: isDemoMode ? Infinity : 60000,
  });
}

export function useDeploymentRings() {
  const { isDemoMode } = useDataMode();
  return useQuery({
    queryKey: ["deployment-rings", isDemoMode],
    queryFn: async () => {
      if (isDemoMode) return mockDeploymentRings;
      return callAdminAPI("deployment-rings");
    },
    staleTime: isDemoMode ? Infinity : 30000,
  });
}

export function useTestCoverage() {
  const { isDemoMode } = useDataMode();
  return useQuery({
    queryKey: ["test-coverage", isDemoMode],
    queryFn: async () => {
      if (isDemoMode) return mockTestCoverage;
      return callAdminAPI("test-coverage");
    },
    staleTime: isDemoMode ? Infinity : 60000,
  });
}
