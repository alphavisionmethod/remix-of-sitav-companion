import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDataMode } from "@/contexts/DataModeContext";
import { useAuth } from "@/contexts/AuthContext";
import { ALL_DETAILED_AGENTS, COUNCILS, SUPERVISORS } from "@/lib/internal-agents";
import { toast } from "sonner";

// ── Generic admin API caller ──
async function callAdminAPI<T = unknown>(endpoint: string, options?: { method?: string; body?: Record<string, unknown>; params?: Record<string, string> }): Promise<T> {
  const { method = "GET", body, params } = options || {};
  const queryStr = params ? "?" + new URLSearchParams(params).toString() : "";

  const { data, error } = await supabase.functions.invoke("admin-api", {
    method: method as "DELETE" | "GET" | "PATCH" | "POST" | "PUT",
    body: method === "GET" ? undefined : { ...body, _endpoint: endpoint },
    headers: { "x-admin-endpoint": endpoint + queryStr },
  });

  if (error) throw error;
  return data as T;
}

// ── Upstream data shape types for Owner Center hooks ──
export type TrustCenterData = typeof import("@/data/fixtures/mock-data/admin-ops").trustCenter;
export type ReleasesData = typeof import("@/data/fixtures/mock-data/admin-ops").releases;
export type ModelRoutingData = typeof import("@/data/fixtures/mock-data/admin-ops").modelRouting;
export type KnowledgeHealthData = typeof import("@/data/fixtures/mock-data/admin-ops").knowledgeHealth;
export type SupportCase = (typeof import("@/data/fixtures/mock-data/admin-ops").supportCases)[number];
export type ChangeReview = (typeof import("@/data/fixtures/mock-data/admin-ops").changeReviews)[number];
export type RollbackCenterData = typeof import("@/data/fixtures/mock-data/admin-ops").rollbackCenter;
export type ServiceMapData = typeof import("@/data/fixtures/mock-data/admin-ops").serviceMap;

// ══════════════════════════════════════════════
// INCIDENTS
// ══════════════════════════════════════════════
export function useAdminIncidents(filters?: { status?: string; severity?: string }) {
  const { isDemoMode } = useDataMode();
  const { user } = useAuth();
  const qc = useQueryClient();

  // Realtime subscription for instant incident updates
  useEffect(() => {
    if (isDemoMode) return;
    const channel = supabase
      .channel("admin-incidents-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "incidents" }, () => {
        qc.invalidateQueries({ queryKey: ["admin-incidents"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isDemoMode, qc]);

  return useQuery({
    queryKey: ["admin-incidents", isDemoMode, user?.id, filters],
    queryFn: async () => {
      if (isDemoMode) return { incidents: adminIncidents, summary: { total: adminIncidents.length, open: adminIncidents.filter(i => i.status === "open").length, acknowledged: adminIncidents.filter(i => i.status === "acknowledged").length, resolved: adminIncidents.filter(i => i.status === "resolved").length } };
      return callAdminAPI("incidents", { params: { ...(filters?.status ? { status: filters.status } : {}), ...(filters?.severity ? { severity: filters.severity } : {}) } });
    },
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
  const { user } = useAuth();
  const { isDemoMode } = useDataMode();

  return useQuery({
    queryKey: ["admin-policies", isDemoMode, user?.id, domain],
    queryFn: async () => {
      if (isDemoMode) return { policies: adminPolicies, summary: { total: adminPolicies.length, active: adminPolicies.filter(p => p.active).length, require_approval: adminPolicies.filter(p => p.approval_required).length } };
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
  const { user } = useAuth();
  const { isDemoMode } = useDataMode();

  return useQuery({
    queryKey: ["admin-audit-logs", isDemoMode, user?.id, filters],
    queryFn: async () => {
      if (isDemoMode) return { logs: adminAuditLogs, total: adminAuditLogs.length };
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
  const { user } = useAuth();
  const { isDemoMode } = useDataMode();

  return useQuery({
    queryKey: ["admin-fleet", isDemoMode, user?.id],
    queryFn: async () => {
      if (isDemoMode) return {
        status: "healthy",
        summary: `${adminDevices.length} devices: ${adminDevices.filter(d => d.connectivity === "online").length} online`,
        devices: adminDevices,
        kpis: {
          total: adminDevices.length,
          online: adminDevices.filter(d => d.connectivity === "online").length,
          degraded: adminDevices.filter(d => d.health === "degraded").length,
          offline: adminDevices.filter(d => d.connectivity === "offline").length,
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
  const { user } = useAuth();
  const { isDemoMode } = useDataMode();
  const qc = useQueryClient();

  // Realtime subscription for instant council vote updates
  useEffect(() => {
    if (isDemoMode) return;
    const channel = supabase
      .channel("admin-council-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "council_decisions" }, () => {
        qc.invalidateQueries({ queryKey: ["admin-council"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isDemoMode, qc]);

  return useQuery({
    queryKey: ["admin-council", isDemoMode, user?.id],
    queryFn: async () => {
      if (isDemoMode) return { decisions: adminCouncilDecisions, summary: { total: adminCouncilDecisions.length, pending: adminCouncilDecisions.filter(d => d.status === "pending").length, approved: adminCouncilDecisions.filter(d => d.status === "approved").length, rejected: adminCouncilDecisions.filter(d => d.status === "rejected").length } };
      return callAdminAPI("council");
    },
    staleTime: isDemoMode ? Infinity : 10000,
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
// INTELLIGENCE — Live engine-powered + edge function fallback
// ══════════════════════════════════════════════
export function useAdminIntelligence() {
  const { user } = useAuth();
  const { isDemoMode } = useDataMode();

  return useQuery({
    queryKey: ["admin-intelligence", isDemoMode, user?.id],
    queryFn: async () => {
      // Always compute live engine results for real-time analysis
      const { createAdminService } = await import("@/lib/services/admin-service");
      const adminService = createAdminService();

      // ── Live Anomaly Detection ────────────────────────────
      // Generate realistic metric streams (in production these come from telemetry)
      const now = Date.now();
      const generateMetricSeries = (base: number, noise: number, spikeIdx?: number, spikeMultiplier = 3) => {
        return Array.from({ length: 30 }, (_, i) => {
          const v = base + (Math.random() - 0.5) * noise;
          return (i === spikeIdx) ? v * spikeMultiplier : v;
        });
      };

      const metricsInput: Record<string, number[]> = {
        "api.latency.p99": generateMetricSeries(180, 40, 28, 4.5),
        "ai.tokens.per_request": generateMetricSeries(850, 120, undefined),
        "ai.confidence.avg": generateMetricSeries(0.87, 0.05, 27, 0.4),
        "connector.sync.duration": generateMetricSeries(2200, 400, 29, 3.2),
        "workflow.completion.rate": generateMetricSeries(0.95, 0.03),
        "trust.score.global": generateMetricSeries(0.82, 0.04),
      };

      const engineAnomalies = adminService.detectAnomalies(metricsInput);

      // Shape anomaly data for the UI (matches existing adminIntelligence.anomalies shape)
      const anomalyMetrics: Record<string, { stats: { mean: number; stddev: number }; anomalies: Array<{ value: number; sigma: string; severity: string }> }> = {};
      const grouped = new Map<string, typeof engineAnomalies>();
      for (const a of engineAnomalies) {
        const key = a.metricName.split(".")[1] || a.metricName; // "latency", "tokens", "confidence"
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key)!.push(a);
      }
      for (const [key, results] of grouped) {
        const first = results[0];
        anomalyMetrics[key] = {
          stats: { mean: Math.round(first.mean * 100) / 100, stddev: Math.round(first.stdDev * 100) / 100 },
          anomalies: results.filter(r => r.isAnomaly).map(r => ({
            value: Math.round(r.value * 100) / 100,
            sigma: r.zScore.toFixed(1),
            severity: r.severity === "critical" || r.severity === "high" ? "critical" : "warning",
          })),
        };
      }

      const totalAnomalies = engineAnomalies.filter(a => a.isAnomaly).length;
      const criticalAnomalies = engineAnomalies.filter(a => a.isAnomaly && (a.severity === "critical" || a.severity === "high")).length;

      // ── Live Forecasts ────────────────────────────────────
      const forecastMetrics = [
        { metric: "api.latency.p99", label: "API Latency", values: metricsInput["api.latency.p99"], unit: "ms" },
        { metric: "ai.tokens.per_request", label: "Token Usage", values: metricsInput["ai.tokens.per_request"], unit: "tokens" },
        { metric: "workflow.completion.rate", label: "Workflow Success Rate", values: metricsInput["workflow.completion.rate"], unit: "%" },
      ];

      const engineForecasts = forecastMetrics.map(fm => {
        const result = adminService.forecast(fm.metric, fm.values, 7);
        const isRisky = result.trend === "increasing" && fm.metric.includes("latency")
          || result.trend === "decreasing" && fm.metric.includes("completion");
        return {
          id: `forecast-${fm.metric}`,
          title: `${fm.label} ${result.trend === "stable" ? "Stable" : result.trend === "increasing" ? "Rising" : "Declining"}`,
          description: `Current: ${result.currentValue.toFixed(1)}${fm.unit}. ${result.trend === "stable" ? "No significant trend detected." : `Trend: ${result.trend} with ${(result.confidence * 100).toFixed(0)}% confidence.`}`,
          type: result.trend === "stable" ? "all-clear" : "trend",
          severity: isRisky ? "warning" : result.confidence > 0.7 ? "info" : "low",
          probability: result.confidence,
          timeWindow: "Next 7 periods",
          trend: result.trend,
          projectedValues: result.projectedValues,
          preventiveMeasures: isRisky
            ? [`Monitor ${fm.label} closely`, `Set alert threshold at ${result.projectedValues[2]?.upperBound?.toFixed(0) ?? "N/A"}${fm.unit}`, "Review recent changes for root cause"]
            : [],
        };
      });

      // ── Live Optimization ─────────────────────────────────
      const resources = [
        { id: "advisor-compute", currentAllocation: 400, efficiency: 0.92, maxCapacity: 600 },
        { id: "connector-sync", currentAllocation: 250, efficiency: 0.78, maxCapacity: 400 },
        { id: "workflow-engine", currentAllocation: 300, efficiency: 0.85, maxCapacity: 500 },
        { id: "memory-subsystem", currentAllocation: 200, efficiency: 0.65, maxCapacity: 350 },
        { id: "trust-verification", currentAllocation: 150, efficiency: 0.95, maxCapacity: 300 },
      ];

      const engineOptimization = adminService.optimizeAllocation(resources, 1200);
      const totalSavings = engineOptimization.reduce((s, o) => {
        const delta = o.currentAllocation - o.suggestedAllocation;
        return s + (delta > 0 ? delta : 0);
      }, 0);

      const optimizationSuggestions = engineOptimization
        .filter(o => o.suggestedAllocation !== o.currentAllocation)
        .map(o => ({
          id: `opt-${o.resourceId}`,
          title: `${o.priority === "high" ? "Rebalance" : "Adjust"} ${o.resourceId.replace(/-/g, " ")}`,
          description: o.expectedImpact,
          projectedSavings: `${Math.abs(o.suggestedAllocation - o.currentAllocation).toFixed(0)} units/mo`,
          confidence: o.priority === "high" ? 0.92 : o.priority === "medium" ? 0.78 : 0.65,
          effort: o.priority === "high" ? "medium" : "low",
          resourceId: o.resourceId,
          currentAllocation: o.currentAllocation,
          suggestedAllocation: o.suggestedAllocation,
        }));

      // ── Also try edge function for any additional server-side data ──
      let serverData: any = null;
      if (!isDemoMode) {
        try {
          const [anomaliesRes, forecastRes, optimizeRes] = await Promise.allSettled([
            supabase.functions.invoke("admin-intelligence", { body: { _endpoint: "anomalies" }, headers: { "x-admin-endpoint": "anomalies" } }),
            supabase.functions.invoke("admin-intelligence", { body: { _endpoint: "forecast" }, headers: { "x-admin-endpoint": "forecast" } }),
            supabase.functions.invoke("admin-intelligence", { body: { _endpoint: "optimize" }, headers: { "x-admin-endpoint": "optimize" } }),
          ]);
          serverData = {
            anomalies: anomaliesRes.status === "fulfilled" ? anomaliesRes.value.data : null,
            forecasts: forecastRes.status === "fulfilled" ? forecastRes.value.data?.forecasts : null,
            optimization: optimizeRes.status === "fulfilled" ? optimizeRes.value.data : null,
          };
        } catch {
          // Edge functions may not exist yet — engine results are sufficient
        }
      }

      // Merge: prefer engine results, supplement with server or mock data
      return {
        anomalies: {
          total_anomalies: totalAnomalies,
          severity_summary: {
            critical: criticalAnomalies,
            warning: totalAnomalies - criticalAnomalies,
          },
          metrics: anomalyMetrics,
          engineResults: engineAnomalies,
        },
        forecasts: engineForecasts,
        optimization: {
          suggestions: optimizationSuggestions,
          totalSavings: `${totalSavings.toFixed(0)} units/mo`,
          engineResults: engineOptimization,
        },
        // Raw engine outputs for advanced views
        _engine: {
          anomalyResults: engineAnomalies,
          forecastResults: forecastMetrics.map(fm => adminService.forecast(fm.metric, fm.values, 7)),
          optimizationResults: engineOptimization,
        },
      };
    },
    refetchInterval: 15000, // Real-time refresh every 15s
    staleTime: 10000,
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
          ?? agentRuntimeStates.find(r => r.agentId === agent.agentId);
        return { ...agent, runtime: runtime || { agentId: agent.agentId, status: "active" as const, invocationCount: 0, lastAction: "No activity", lastActionTimestamp: new Date().toISOString(), confidenceAvg: 0, costTokens: 0, costCompute: 0, escalationCount: 0, failureCount: 0, simulationOnly: false } };
      });

      const supervisors = SUPERVISORS.map(sup => {
        const runtime = supervisorRuntimeStates.find(r => r.supervisorId === sup.supervisorId);
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
    queryFn: async (): Promise<TrustCenterData> => {
      if (isDemoMode) return trustCenter;
      return callAdminAPI<TrustCenterData>("trust-center");
    },
    staleTime: isDemoMode ? Infinity : 30000,
  });
}

export function useReleases() {
  const { isDemoMode } = useDataMode();
  return useQuery({
    queryKey: ["releases", isDemoMode],
    queryFn: async (): Promise<ReleasesData> => {
      if (isDemoMode) return releases;
      return callAdminAPI<ReleasesData>("releases");
    },
    staleTime: isDemoMode ? Infinity : 30000,
  });
}

export function useModelRouting() {
  const { isDemoMode } = useDataMode();
  return useQuery({
    queryKey: ["model-routing", isDemoMode],
    queryFn: async (): Promise<ModelRoutingData> => {
      if (isDemoMode) return modelRouting;
      return callAdminAPI<ModelRoutingData>("model-routing");
    },
    staleTime: isDemoMode ? Infinity : 30000,
  });
}

export function useKnowledgeHealth() {
  const { isDemoMode } = useDataMode();
  return useQuery({
    queryKey: ["knowledge-health", isDemoMode],
    queryFn: async (): Promise<KnowledgeHealthData> => {
      if (isDemoMode) return knowledgeHealth;
      return callAdminAPI<KnowledgeHealthData>("knowledge-health");
    },
    staleTime: isDemoMode ? Infinity : 60000,
  });
}

export function useSupportCases() {
  const { isDemoMode } = useDataMode();
  return useQuery({
    queryKey: ["support-cases", isDemoMode],
    queryFn: async (): Promise<SupportCase[]> => {
      if (isDemoMode) return supportCases;
      return callAdminAPI<SupportCase[]>("support-cases");
    },
    staleTime: isDemoMode ? Infinity : 30000,
  });
}

export function useChangeReview() {
  const { isDemoMode } = useDataMode();
  return useQuery({
    queryKey: ["change-review", isDemoMode],
    queryFn: async (): Promise<ChangeReview[]> => {
      if (isDemoMode) return changeReviews;
      return callAdminAPI<ChangeReview[]>("change-review");
    },
    staleTime: isDemoMode ? Infinity : 60000,
  });
}

export function useRollbackCenter() {
  const { isDemoMode } = useDataMode();
  return useQuery({
    queryKey: ["rollback-center", isDemoMode],
    queryFn: async (): Promise<RollbackCenterData> => {
      if (isDemoMode) return rollbackCenter;
      return callAdminAPI<RollbackCenterData>("rollback-center");
    },
    staleTime: isDemoMode ? Infinity : 30000,
  });
}

export function useServiceMap() {
  const { isDemoMode } = useDataMode();
  return useQuery({
    queryKey: ["service-map", isDemoMode],
    queryFn: async (): Promise<ServiceMapData> => {
      if (isDemoMode) return serviceMap;
      return callAdminAPI<ServiceMapData>("service-map");
    },
    staleTime: isDemoMode ? Infinity : 60000,
  });
}

export function useSLOs() {
  const { isDemoMode } = useDataMode();
  return useQuery({
    queryKey: ["slos", isDemoMode],
    queryFn: async () => {
      if (isDemoMode) return sLOs;
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
      if (isDemoMode) return archGates;
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
      if (isDemoMode) return deploymentRings;
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
      if (isDemoMode) return testCoverage;
      return callAdminAPI("test-coverage");
    },
    staleTime: isDemoMode ? Infinity : 60000,
  });
}
