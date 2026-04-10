// ═══════════════════════════════════════════════════════════════
// SITA OS — Implementation Truth Center Data Hooks
// CRUD for spec registry, wiring edges, stats, drift detection
// ═══════════════════════════════════════════════════════════════

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDataMode } from "@/contexts/DataModeContext";
import { toast } from "sonner";

// ── Types ──

export type ImplementationStatus =
  | "not_started" | "scaffolded" | "partial"
  | "advanced_unwired" | "wired_unproven" | "proven" | "launch_ready";

export interface SpecRegistryEntry {
  id: string;
  user_id: string;
  spec_id: string;
  canonical_name: string;
  owning_module: string;
  description: string | null;
  required_routes: string[];
  required_components: string[];
  required_services: string[];
  required_contracts: string[];
  required_events: string[];
  required_tests: string[];
  required_proofs: string[];
  implementation_status: ImplementationStatus;
  prompt_origin: string | null;
  acceptance_criteria: string[];
  dependencies: string[];
  spec_score: number;
  ui_score: number;
  contract_score: number;
  wiring_score: number;
  runtime_score: number;
  overall_readiness: number;
  last_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface WiringEdge {
  id: string;
  user_id: string;
  spec_id: string;
  source_type: string;
  source_name: string;
  target_type: string;
  target_name: string;
  edge_status: "connected" | "broken" | "missing";
  evidence: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ImplementationStats {
  total: number;
  byStatus: Record<ImplementationStatus, number>;
  avgReadiness: number;
  topGaps: { spec_id: string; canonical_name: string; overall_readiness: number }[];
}

// ── Keys ──

const SPEC_KEY = ["implementation-spec-registry"];
const WIRING_KEY = (specId: string) => ["implementation-wiring-edges", specId];
const STATS_KEY = ["implementation-stats"];

// ── Demo Data ──

const DEMO_SPECS: SpecRegistryEntry[] = [
  {
    id: "demo-1", user_id: "demo", spec_id: "money-office",
    canonical_name: "Money Office", owning_module: "money",
    description: "Full financial management: accounts, budgets, safe-to-spend, stress radar",
    required_routes: ["/money", "/money/accounts", "/money/budget", "/money/safe-to-spend"],
    required_components: ["MoneyCenter", "SafeToSpendHero", "StressHeatmap"],
    required_services: ["finance-os", "account-aggregation"],
    required_contracts: ["money-profile", "financial-account", "safe-to-spend-snapshot"],
    required_events: ["money.account.synced", "money.budget.updated"],
    required_tests: ["money-route-render", "account-sync", "safe-to-spend-calc"],
    required_proofs: ["account-load", "budget-mutation-receipt"],
    implementation_status: "wired_unproven", prompt_origin: "Phase 2 — Money Office prompt",
    acceptance_criteria: ["Accounts sync from connectors", "Budget persists across sessions"],
    dependencies: ["connector-hub", "receipt-service"],
    spec_score: 85, ui_score: 90, contract_score: 70, wiring_score: 75, runtime_score: 40, overall_readiness: 72,
    last_verified_at: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: "demo-2", user_id: "demo", spec_id: "revenue-office",
    canonical_name: "Revenue Office", owning_module: "revenue",
    description: "CRM, pipeline, campaigns, booking, offers, retention, growth advisors",
    required_routes: ["/revenue", "/revenue/pipeline", "/revenue/campaigns", "/revenue/booking"],
    required_components: ["GrowthBoardroom", "PipelineStudio", "CampaignOrchestrator"],
    required_services: ["revenue-intelligence", "campaign-engine"],
    required_contracts: ["revenue-pipeline", "campaign-config"],
    required_events: ["revenue.deal.closed", "revenue.campaign.launched"],
    required_tests: ["revenue-route-render", "pipeline-flow"],
    required_proofs: ["deal-close-receipt", "campaign-launch-proof"],
    implementation_status: "partial", prompt_origin: "Phase 2 — Revenue Office prompt",
    acceptance_criteria: ["Pipeline loads from real data", "Campaign mutations persist"],
    dependencies: ["money-office", "connector-hub"],
    spec_score: 80, ui_score: 85, contract_score: 60, wiring_score: 50, runtime_score: 20, overall_readiness: 59,
    last_verified_at: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: "demo-3", user_id: "demo", spec_id: "ai-engineering-board",
    canonical_name: "AI Engineering Board", owning_module: "ai-engineering",
    description: "AI team roster, missions, fixes, self-healing, design studio, learning, approvals",
    required_routes: ["/admin/ai-engineering", "/admin/ai-team", "/admin/ai-missions", "/admin/ai-fixes"],
    required_components: ["AIEngineeringBoard", "AITeamRoster", "AIMissionCenter"],
    required_services: ["ai-orchestrator", "self-healing-engine"],
    required_contracts: ["ai-mission", "ai-fix-proposal"],
    required_events: ["ai.mission.started", "ai.fix.applied"],
    required_tests: ["ai-board-render", "mission-lifecycle"],
    required_proofs: ["fix-applied-receipt", "mission-completion-proof"],
    implementation_status: "advanced_unwired", prompt_origin: "Phase 2 — AI Engineering prompt",
    acceptance_criteria: ["Mission lifecycle persists", "Fix proposals generate receipts"],
    dependencies: ["sag-gateway", "receipt-service"],
    spec_score: 90, ui_score: 95, contract_score: 80, wiring_score: 60, runtime_score: 30, overall_readiness: 71,
    last_verified_at: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: "demo-4", user_id: "demo", spec_id: "compute-governance",
    canonical_name: "Compute Governance Board", owning_module: "compute",
    description: "AI budget policies, provider health, model registry, routing, cost control",
    required_routes: ["/admin/compute-governance", "/admin/ai-budget"],
    required_components: ["ComputeGovernanceBoard", "AIBudgetCenter"],
    required_services: ["budget-policy-engine", "provider-health-monitor"],
    required_contracts: ["ai-budget-policy", "provider-health"],
    required_events: ["compute.budget.exceeded", "compute.provider.degraded"],
    required_tests: ["budget-enforcement", "provider-fallback"],
    required_proofs: ["budget-check-receipt", "fallback-event-proof"],
    implementation_status: "wired_unproven", prompt_origin: "Phase 2 — Compute Governance prompt",
    acceptance_criteria: ["Budget policies enforce limits", "Provider fallback chains work"],
    dependencies: ["sag-gateway", "ai-model-registry"],
    spec_score: 85, ui_score: 80, contract_score: 75, wiring_score: 70, runtime_score: 35, overall_readiness: 69,
    last_verified_at: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: "demo-5", user_id: "demo", spec_id: "admin-control-plane",
    canonical_name: "Admin Control Plane", owning_module: "admin",
    description: "Unified admin shell, mission control, observability, fleet health, security",
    required_routes: ["/admin", "/admin/mission-control", "/admin/fleet-health", "/admin/security"],
    required_components: ["AdminShell", "MissionControlHome", "FleetHealthPage"],
    required_services: ["admin-state-service", "observability-service"],
    required_contracts: ["admin-shell-contract", "fleet-health-contract"],
    required_events: ["admin.mode.changed", "admin.alert.triggered"],
    required_tests: ["admin-shell-render", "navigation-integrity"],
    required_proofs: ["admin-action-receipt"],
    implementation_status: "proven", prompt_origin: "Phase 1 — Admin Control Plane",
    acceptance_criteria: ["All admin routes render", "Shell wraps all admin pages"],
    dependencies: [],
    spec_score: 95, ui_score: 95, contract_score: 85, wiring_score: 90, runtime_score: 80, overall_readiness: 89,
    last_verified_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
];

const DEMO_EDGES: WiringEdge[] = [
  { id: "e1", user_id: "demo", spec_id: "money-office", source_type: "route", source_name: "/money", target_type: "component", target_name: "MoneyCenter", edge_status: "connected", evidence: "Route renders MoneyCenter", verified_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "e2", user_id: "demo", spec_id: "money-office", source_type: "component", source_name: "MoneyCenter", target_type: "hook", target_name: "useFinancialAccounts", edge_status: "connected", evidence: "Import found", verified_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "e3", user_id: "demo", spec_id: "money-office", source_type: "hook", source_name: "useFinancialAccounts", target_type: "service", target_name: "finance-os", edge_status: "broken", evidence: "Service exists but hook uses demo data", verified_at: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "e4", user_id: "demo", spec_id: "revenue-office", source_type: "route", source_name: "/revenue", target_type: "component", target_name: "GrowthBoardroom", edge_status: "connected", evidence: "Route exists", verified_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "e5", user_id: "demo", spec_id: "revenue-office", source_type: "component", source_name: "GrowthBoardroom", target_type: "contract", target_name: "revenue-pipeline", edge_status: "missing", evidence: null, verified_at: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

// ── fromDynamicTable helper (matches project pattern) ──

function fromSpecRegistry() {
  return supabase.from("implementation_spec_registry" as any);
}
function fromWiringEdges() {
  return supabase.from("implementation_wiring_edges" as any);
}

// ── Hooks ──

export function useSpecRegistry() {
  const { user } = useAuth();
  const { isDemoMode } = useDataMode();

  return useQuery({
    queryKey: SPEC_KEY,
    queryFn: async (): Promise<SpecRegistryEntry[]> => {
      if (isDemoMode || !user) return DEMO_SPECS;
      const { data, error } = await fromSpecRegistry()
        .select("*")
        .eq("user_id", user.id)
        .order("canonical_name");
      if (error) throw error;
      const live = (data as unknown as SpecRegistryEntry[]) ?? [];
      return live.length > 0 ? live : DEMO_SPECS;
    },
  });
}

export function useUpsertSpec() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (spec: Partial<SpecRegistryEntry> & { spec_id: string; canonical_name: string }) => {
      if (!user) throw new Error("Auth required");
      const payload = { ...spec, user_id: user.id };
      const { error } = await fromSpecRegistry().upsert(payload as any, { onConflict: "user_id,spec_id" });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: SPEC_KEY }); toast.success("Spec saved"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteSpec() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await fromSpecRegistry().delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: SPEC_KEY }); toast.success("Spec removed"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useWiringEdges(specId: string) {
  const { user } = useAuth();
  const { isDemoMode } = useDataMode();

  return useQuery({
    queryKey: WIRING_KEY(specId),
    queryFn: async (): Promise<WiringEdge[]> => {
      if (isDemoMode || !user) return DEMO_EDGES.filter(e => e.spec_id === specId);
      const { data, error } = await fromWiringEdges()
        .select("*")
        .eq("user_id", user.id)
        .eq("spec_id", specId);
      if (error) throw error;
      const live = (data as unknown as WiringEdge[]) ?? [];
      return live.length > 0 ? live : DEMO_EDGES.filter(e => e.spec_id === specId);
    },
    enabled: !!specId,
  });
}

export function useUpsertWiringEdge() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (edge: Partial<WiringEdge> & { spec_id: string; source_type: string; source_name: string; target_type: string; target_name: string }) => {
      if (!user) throw new Error("Auth required");
      const { error } = await fromWiringEdges().insert({ ...edge, user_id: user.id } as any);
      if (error) throw error;
    },
    onSuccess: (_, vars) => { qc.invalidateQueries({ queryKey: WIRING_KEY(vars.spec_id) }); toast.success("Edge saved"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useImplementationStats(specs?: SpecRegistryEntry[]): ImplementationStats {
  const statuses: ImplementationStatus[] = ["not_started", "scaffolded", "partial", "advanced_unwired", "wired_unproven", "proven", "launch_ready"];
  const byStatus = Object.fromEntries(statuses.map(s => [s, 0])) as Record<ImplementationStatus, number>;

  if (!specs || specs.length === 0) {
    return { total: 0, byStatus, avgReadiness: 0, topGaps: [] };
  }

  specs.forEach(s => { byStatus[s.implementation_status] = (byStatus[s.implementation_status] || 0) + 1; });
  const avgReadiness = Math.round(specs.reduce((a, s) => a + s.overall_readiness, 0) / specs.length);
  const topGaps = [...specs]
    .sort((a, b) => a.overall_readiness - b.overall_readiness)
    .slice(0, 5)
    .map(s => ({ spec_id: s.spec_id, canonical_name: s.canonical_name, overall_readiness: s.overall_readiness }));

  return { total: specs.length, byStatus, avgReadiness, topGaps };
}

export function useContractVerification(specs?: SpecRegistryEntry[]) {
  // Aggregates contract requirements across all specs
  if (!specs) return { totalRequired: 0, contracts: [] };
  const contractMap = new Map<string, { contract: string; requiredBy: string[]; status: "present" | "missing" }>();

  specs.forEach(s => {
    s.required_contracts.forEach(c => {
      const existing = contractMap.get(c);
      if (existing) {
        existing.requiredBy.push(s.canonical_name);
      } else {
        contractMap.set(c, { contract: c, requiredBy: [s.canonical_name], status: s.contract_score > 50 ? "present" : "missing" });
      }
    });
  });

  return {
    totalRequired: contractMap.size,
    contracts: Array.from(contractMap.values()),
  };
}

export function useDriftDetection(specs?: SpecRegistryEntry[]) {
  if (!specs) return { drifts: [], driftCount: 0 };

  const drifts: { spec_id: string; canonical_name: string; issue: string; severity: "high" | "medium" | "low" }[] = [];

  specs.forEach(s => {
    if (s.spec_score > 70 && s.runtime_score < 30) {
      drifts.push({ spec_id: s.spec_id, canonical_name: s.canonical_name, issue: "Spec complete but runtime unverified", severity: "high" });
    }
    if (s.ui_score > 80 && s.wiring_score < 40) {
      drifts.push({ spec_id: s.spec_id, canonical_name: s.canonical_name, issue: "UI exists but wiring incomplete", severity: "high" });
    }
    if (s.contract_score > 60 && s.runtime_score < 20) {
      drifts.push({ spec_id: s.spec_id, canonical_name: s.canonical_name, issue: "Contracts defined but no runtime evidence", severity: "medium" });
    }
    if (s.implementation_status === "not_started" && s.required_routes.length > 0) {
      drifts.push({ spec_id: s.spec_id, canonical_name: s.canonical_name, issue: "Spec registered but implementation not started", severity: "low" });
    }
  });

  return { drifts: drifts.sort((a, b) => (a.severity === "high" ? -1 : b.severity === "high" ? 1 : 0)), driftCount: drifts.length };
}

// Status tier ordering for displays
export const STATUS_TIERS: { value: ImplementationStatus; label: string; color: string }[] = [
  { value: "not_started", label: "Not Started", color: "text-muted-foreground" },
  { value: "scaffolded", label: "Scaffolded", color: "text-muted-foreground" },
  { value: "partial", label: "Partial", color: "text-yellow-500" },
  { value: "advanced_unwired", label: "Advanced (Unwired)", color: "text-orange-500" },
  { value: "wired_unproven", label: "Wired (Unproven)", color: "text-blue-500" },
  { value: "proven", label: "Proven", color: "text-green-500" },
  { value: "launch_ready", label: "Launch Ready", color: "text-emerald-600" },
];
