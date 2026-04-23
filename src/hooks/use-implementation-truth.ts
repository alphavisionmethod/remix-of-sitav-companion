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
  required_shells: string[];
  required_endpoints: string[];
  required_schemas: string[];
  required_docs: string[];
  required_screens: string[];
  required_projections: string[];
  implementation_status: ImplementationStatus;
  prompt_origin: string | null;
  acceptance_criteria: string[];
  dependencies: string[];
  drift_state: string;
  spec_score: number;
  ui_score: number;
  contract_score: number;
  wiring_score: number;
  runtime_score: number;
  architecture_score: number;
  test_score: number;
  docs_score: number;
  proof_score: number;
  policy_score: number;
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
  dimensionAverages: Record<string, number>;
  topGaps: { spec_id: string; canonical_name: string; overall_readiness: number }[];
}

// ── Keys ──

const SPEC_KEY = ["implementation-spec-registry"];
const WIRING_KEY = (specId: string) => ["implementation-wiring-edges", specId];

// ── Score dimensions ──

export const ALL_DIMENSIONS: { key: keyof SpecRegistryEntry; label: string }[] = [
  { key: "spec_score", label: "Spec Completeness" },
  { key: "ui_score", label: "UI Completeness" },
  { key: "contract_score", label: "Contract Completeness" },
  { key: "wiring_score", label: "Wiring Completeness" },
  { key: "runtime_score", label: "Runtime Evidence" },
  { key: "architecture_score", label: "Architecture Compliance" },
  { key: "test_score", label: "Test Coverage" },
  { key: "docs_score", label: "Documentation" },
  { key: "proof_score", label: "Proof / Trust" },
  { key: "policy_score", label: "Policy / Production" },
];

// ── Contract type inference ──

export type ContractType = "api" | "event" | "schema" | "view_model" | "action_state" | "proof" | "policy" | "other";

export function inferContractType(name: string): ContractType {
  const n = name.toLowerCase();
  if (n.includes("event") || n.includes("log") || n.includes("signal")) return "event";
  if (n.includes("schema") || n.includes("model") || n.includes("profile")) return "schema";
  if (n.includes("receipt") || n.includes("proof") || n.includes("chain")) return "proof";
  if (n.includes("policy") || n.includes("evaluation") || n.includes("budget")) return "policy";
  if (n.includes("action") || n.includes("state") || n.includes("workflow")) return "action_state";
  if (n.includes("view") || n.includes("snapshot") || n.includes("twin")) return "view_model";
  if (n.includes("api") || n.includes("endpoint") || n.includes("routing") || n.includes("registry")) return "api";
  return "other";
}

// ── Demo Data ──

const demoBase = {
  required_shells: [] as string[],
  required_endpoints: [] as string[],
  required_schemas: [] as string[],
  required_docs: [] as string[],
  required_screens: [] as string[],
  required_projections: [] as string[],
  drift_state: "unknown",
  architecture_score: 0,
  test_score: 0,
  docs_score: 0,
  proof_score: 0,
  policy_score: 0,
};

const SPECS: SpecRegistryEntry[] = [
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
    required_shells: ["OwnerWorkspaceShell"], required_endpoints: ["/api/money/accounts", "/api/money/budget"],
    required_schemas: ["MoneyProfile", "FinancialAccount"], required_docs: ["money-office-spec.md"],
    required_screens: ["MoneyDashboard", "AccountDetail", "BudgetEditor"], required_projections: ["spending-forecast"],
    implementation_status: "wired_unproven", prompt_origin: "Phase 2 — Money Office prompt",
    acceptance_criteria: ["Accounts sync from connectors", "Budget persists across sessions"],
    dependencies: ["connector-hub", "receipt-service"], drift_state: "drifted",
    spec_score: 85, ui_score: 90, contract_score: 70, wiring_score: 75, runtime_score: 40,
    architecture_score: 65, test_score: 45, docs_score: 50, proof_score: 55, policy_score: 60,
    overall_readiness: 64,
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
    required_shells: ["OwnerWorkspaceShell"], required_endpoints: ["/api/revenue/pipeline"],
    required_schemas: ["RevenuePipeline", "CampaignConfig"], required_docs: ["revenue-office-spec.md"],
    required_screens: ["RevenueDashboard", "PipelineView"], required_projections: ["revenue-forecast"],
    implementation_status: "partial", prompt_origin: "Phase 2 — Revenue Office prompt",
    acceptance_criteria: ["Pipeline loads from real data", "Campaign mutations persist"],
    dependencies: ["money-office", "connector-hub"], drift_state: "drifted",
    spec_score: 80, ui_score: 85, contract_score: 60, wiring_score: 50, runtime_score: 20,
    architecture_score: 55, test_score: 30, docs_score: 40, proof_score: 35, policy_score: 45,
    overall_readiness: 50,
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
    required_shells: ["AdminShellLayout"], required_endpoints: ["/api/ai/missions", "/api/ai/fixes"],
    required_schemas: ["AIMission", "AIFixProposal"], required_docs: ["ai-engineering-spec.md"],
    required_screens: ["AIBoard", "MissionDetail", "FixCenter"], required_projections: ["fix-success-rate"],
    implementation_status: "advanced_unwired", prompt_origin: "Phase 2 — AI Engineering prompt",
    acceptance_criteria: ["Mission lifecycle persists", "Fix proposals generate receipts"],
    dependencies: ["sag-gateway", "receipt-service"], drift_state: "partial",
    spec_score: 90, ui_score: 95, contract_score: 80, wiring_score: 60, runtime_score: 30,
    architecture_score: 75, test_score: 40, docs_score: 55, proof_score: 50, policy_score: 65,
    overall_readiness: 64,
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
    required_shells: ["AdminShellLayout"], required_endpoints: ["/api/compute/budget"],
    required_schemas: ["AIBudgetPolicy", "ProviderHealth"], required_docs: ["compute-governance-spec.md"],
    required_screens: ["BudgetDashboard", "ProviderHealth"], required_projections: ["cost-projection"],
    implementation_status: "wired_unproven", prompt_origin: "Phase 2 — Compute Governance prompt",
    acceptance_criteria: ["Budget policies enforce limits", "Provider fallback chains work"],
    dependencies: ["sag-gateway", "ai-model-registry"], drift_state: "aligned",
    spec_score: 85, ui_score: 80, contract_score: 75, wiring_score: 70, runtime_score: 35,
    architecture_score: 70, test_score: 50, docs_score: 60, proof_score: 55, policy_score: 70,
    overall_readiness: 65,
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
    required_shells: ["AdminShellLayout"], required_endpoints: ["/api/admin/state"],
    required_schemas: ["AdminState"], required_docs: ["admin-control-plane-spec.md"],
    required_screens: ["MissionControl", "FleetHealth", "SecurityPosture"], required_projections: [],
    implementation_status: "proven", prompt_origin: "Phase 1 — Admin Control Plane",
    acceptance_criteria: ["All admin routes render", "Shell wraps all admin pages"],
    dependencies: [], drift_state: "aligned",
    spec_score: 95, ui_score: 95, contract_score: 85, wiring_score: 90, runtime_score: 80,
    architecture_score: 90, test_score: 75, docs_score: 80, proof_score: 85, policy_score: 85,
    overall_readiness: 86,
    last_verified_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
];

const EDGES: WiringEdge[] = [
  { id: "e1", user_id: "demo", spec_id: "money-office", source_type: "route", source_name: "/money", target_type: "component", target_name: "MoneyCenter", edge_status: "connected", evidence: "Route renders MoneyCenter", verified_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "e2", user_id: "demo", spec_id: "money-office", source_type: "component", source_name: "MoneyCenter", target_type: "hook", target_name: "useFinancialAccounts", edge_status: "connected", evidence: "Import found", verified_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "e3", user_id: "demo", spec_id: "money-office", source_type: "hook", source_name: "useFinancialAccounts", target_type: "service", target_name: "finance-os", edge_status: "broken", evidence: "Service exists but hook uses demo data", verified_at: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "e4", user_id: "demo", spec_id: "revenue-office", source_type: "route", source_name: "/revenue", target_type: "component", target_name: "GrowthBoardroom", edge_status: "connected", evidence: "Route exists", verified_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "e5", user_id: "demo", spec_id: "revenue-office", source_type: "component", source_name: "GrowthBoardroom", target_type: "contract", target_name: "revenue-pipeline", edge_status: "missing", evidence: null, verified_at: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

// ── fromDynamicTable helper (matches project pattern) ──

function fromSpecRegistry() {
  return ( supabase as any).from("implementation_spec_registry" as any);
}
function fromWiringEdges() {
  return ( supabase as any).from("implementation_wiring_edges" as any);
}

// ── Hooks ──

export function useSpecRegistry() {
  const { user } = useAuth();
  const { isDemoMode } = useDataMode();

  return useQuery({
    queryKey: SPEC_KEY,
    queryFn: async (): Promise<SpecRegistryEntry[]> => {
      if (isDemoMode || !user) return SPECS;
      const { data, error } = await fromSpecRegistry()
        .select("*")
        .eq("user_id", user.id)
        .order("canonical_name");
      if (error) throw error;
      const live = (data as unknown as SpecRegistryEntry[]) ?? [];
      return live.length > 0 ? live : SPECS;
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
  const { isDemoMode } = useDataMode();
  const { user } = useAuth();

  return useQuery({
    queryKey: WIRING_KEY(specId),
    queryFn: async (): Promise<WiringEdge[]> => {
      if (isDemoMode || !user) return EDGES.filter(e => e.spec_id === specId);
      const { data, error } = await fromWiringEdges()
        .select("*")
        .eq("user_id", user.id)
        .eq("spec_id", specId);
      if (error) throw error;
      const live = (data as unknown as WiringEdge[]) ?? [];
      return live.length > 0 ? live : EDGES.filter(e => e.spec_id === specId);
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

export function useDeleteWiringEdge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, spec_id }: { id: string; spec_id: string }) => {
      const { error } = await fromWiringEdges().delete().eq("id", id);
      if (error) throw error;
      return spec_id;
    },
    onSuccess: (spec_id) => { qc.invalidateQueries({ queryKey: WIRING_KEY(spec_id) }); toast.success("Edge removed"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useImplementationStats(specs?: SpecRegistryEntry[]): ImplementationStats {
  const statuses: ImplementationStatus[] = ["not_started", "scaffolded", "partial", "advanced_unwired", "wired_unproven", "proven", "launch_ready"];
  const byStatus = Object.fromEntries(statuses.map(s => [s, 0])) as Record<ImplementationStatus, number>;

  if (!specs || specs.length === 0) {
    return { total: 0, byStatus, avgReadiness: 0, dimensionAverages: {}, topGaps: [] };
  }

  specs.forEach(s => { byStatus[s.implementation_status] = (byStatus[s.implementation_status] || 0) + 1; });
  const avgReadiness = Math.round(specs.reduce((a, s) => a + s.overall_readiness, 0) / specs.length);

  const dimensionAverages: Record<string, number> = {};
  ALL_DIMENSIONS.forEach(d => {
    dimensionAverages[d.key] = Math.round(specs.reduce((a, s) => a + ((s[d.key] as number) || 0), 0) / specs.length);
  });

  const topGaps = [...specs]
    .sort((a, b) => a.overall_readiness - b.overall_readiness)
    .slice(0, 5)
    .map(s => ({ spec_id: s.spec_id, canonical_name: s.canonical_name, overall_readiness: s.overall_readiness }));

  return { total: specs.length, byStatus, avgReadiness, dimensionAverages, topGaps };
}

export function useContractVerification(specs?: SpecRegistryEntry[]) {
  if (!specs) return { totalRequired: 0, contracts: [] };
  const contractMap = new Map<string, { contract: string; requiredBy: string[]; status: "present" | "missing"; type: ContractType; consumers: number }>();

  specs.forEach(s => {
    s.required_contracts.forEach(c => {
      const existing = contractMap.get(c);
      if (existing) {
        existing.requiredBy.push(s.canonical_name);
        existing.consumers++;
      } else {
        contractMap.set(c, {
          contract: c,
          requiredBy: [s.canonical_name],
          status: s.contract_score > 50 ? "present" : "missing",
          type: inferContractType(c),
          consumers: 1,
        });
      }
    });
  });

  // Orphan detection: contracts with only 1 consumer and missing status
  const orphans = Array.from(contractMap.values()).filter(c => c.consumers === 1 && c.status === "missing");

  return {
    totalRequired: contractMap.size,
    contracts: Array.from(contractMap.values()),
    orphans,
  };
}

export function useDriftDetection(specs?: SpecRegistryEntry[]) {
  if (!specs) return { drifts: [], driftCount: 0 };

  const drifts: { spec_id: string; canonical_name: string; issue: string; severity: "high" | "medium" | "low" }[] = [];

  specs.forEach(s => {
    // Original 4 rules
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
    // New deeper rules
    if (s.required_shells.length > 0 && s.architecture_score < 30) {
      drifts.push({ spec_id: s.spec_id, canonical_name: s.canonical_name, issue: "Required shells specified but architecture score low", severity: "medium" });
    }
    if (s.required_endpoints.length > 0 && s.wiring_score < 30) {
      drifts.push({ spec_id: s.spec_id, canonical_name: s.canonical_name, issue: "Required endpoints specified but wiring unproven", severity: "high" });
    }
    if (s.required_projections.length > 0 && s.runtime_score === 0) {
      drifts.push({ spec_id: s.spec_id, canonical_name: s.canonical_name, issue: "Projections required but runtime score is 0", severity: "medium" });
    }
    if (s.required_docs.length > 0 && s.docs_score === 0) {
      drifts.push({ spec_id: s.spec_id, canonical_name: s.canonical_name, issue: "Docs required but docs score is 0", severity: "low" });
    }
    if (s.test_score === 0 && s.required_tests.length > 0) {
      drifts.push({ spec_id: s.spec_id, canonical_name: s.canonical_name, issue: "Tests listed but test score is 0", severity: "medium" });
    }
    if (s.proof_score === 0 && s.required_proofs.length > 0) {
      drifts.push({ spec_id: s.spec_id, canonical_name: s.canonical_name, issue: "Proofs required but proof score is 0", severity: "medium" });
    }
    if (s.drift_state === "drifted") {
      drifts.push({ spec_id: s.spec_id, canonical_name: s.canonical_name, issue: "Drift state explicitly marked as drifted", severity: "high" });
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
