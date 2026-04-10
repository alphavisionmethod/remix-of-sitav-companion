// ═══════════════════════════════════════════════════════════════
// SITA OS — Spec Registry Seeder
// Seeds ~20 canonical spec entries from the actual codebase
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface SeedSpec {
  spec_id: string;
  canonical_name: string;
  owning_module: string;
  description: string;
  required_routes: string[];
  required_components: string[];
  required_services: string[];
  required_contracts: string[];
  implementation_status: string;
  prompt_origin: string;
  spec_score: number;
  ui_score: number;
  contract_score: number;
  wiring_score: number;
  runtime_score: number;
  overall_readiness: number;
}

const CANONICAL_SPECS: SeedSpec[] = [
  {
    spec_id: "money-office", canonical_name: "Money Office", owning_module: "money",
    description: "Financial management: accounts, budgets, safe-to-spend, stress radar, money twin",
    required_routes: ["/money", "/money/onboarding"],
    required_components: ["MoneyCenter", "MoneyOnboarding"],
    required_services: ["finance-os", "account-aggregation"],
    required_contracts: ["money-profile", "financial-account"],
    implementation_status: "partial", prompt_origin: "Phase 2 — Money Office",
    spec_score: 80, ui_score: 85, contract_score: 60, wiring_score: 50, runtime_score: 20, overall_readiness: 59,
  },
  {
    spec_id: "revenue-office", canonical_name: "Revenue Office", owning_module: "revenue",
    description: "CRM, pipeline, campaigns, booking, offers, retention, growth advisors",
    required_routes: ["/revenue", "/revenue/pipeline", "/revenue/campaigns", "/revenue/booking"],
    required_components: ["GrowthBoardroom", "PipelineStudio", "CampaignOrchestrator", "BookingCenter"],
    required_services: ["revenue-intelligence", "campaign-engine"],
    required_contracts: ["revenue-pipeline", "campaign-config"],
    implementation_status: "partial", prompt_origin: "Phase 2 — Revenue Office",
    spec_score: 80, ui_score: 85, contract_score: 55, wiring_score: 45, runtime_score: 15, overall_readiness: 56,
  },
  {
    spec_id: "digital-presence-office", canonical_name: "Digital Presence Office", owning_module: "digital-presence",
    description: "Website, SEO, social, content, brand, analytics",
    required_routes: ["/business"],
    required_components: ["BusinessCenter"],
    required_services: ["presence-engine"],
    required_contracts: ["digital-presence-profile"],
    implementation_status: "scaffolded", prompt_origin: "Phase 2 — Digital Presence",
    spec_score: 60, ui_score: 70, contract_score: 30, wiring_score: 25, runtime_score: 10, overall_readiness: 39,
  },
  {
    spec_id: "investment-office", canonical_name: "Investment Office", owning_module: "investment",
    description: "Market explorer, portfolio, strategy, execution, research, risk, capital twin",
    required_routes: ["/investment", "/investment/market", "/investment/portfolio", "/investment/strategy"],
    required_components: ["InvestmentBoardroom", "MarketExplorer", "PortfolioOffice", "StrategyStudio"],
    required_services: ["investment-intelligence", "market-data-service"],
    required_contracts: ["investment-portfolio", "market-instrument"],
    implementation_status: "partial", prompt_origin: "Phase 2 — Investment Office",
    spec_score: 85, ui_score: 90, contract_score: 65, wiring_score: 55, runtime_score: 20, overall_readiness: 63,
  },
  {
    spec_id: "ai-engineering-board", canonical_name: "AI Engineering Board", owning_module: "ai-engineering",
    description: "AI team, missions, fixes, self-healing, design studio, learning, approvals, releases",
    required_routes: ["/admin/ai-engineering", "/admin/ai-team", "/admin/ai-missions", "/admin/ai-fixes"],
    required_components: ["AIEngineeringBoard", "AITeamRoster", "AIMissionCenter", "AIFixCenter"],
    required_services: ["ai-orchestrator", "self-healing-engine"],
    required_contracts: ["ai-mission", "ai-fix-proposal"],
    implementation_status: "wired_unproven", prompt_origin: "Phase 2 — AI Engineering",
    spec_score: 90, ui_score: 95, contract_score: 80, wiring_score: 70, runtime_score: 35, overall_readiness: 74,
  },
  {
    spec_id: "compute-governance", canonical_name: "Compute Governance Board", owning_module: "compute",
    description: "AI budget policies, provider health, model registry, routing, cost control",
    required_routes: ["/admin/compute-governance"],
    required_components: ["ComputeGovernanceBoard"],
    required_services: ["budget-policy-engine", "provider-health-monitor"],
    required_contracts: ["ai-budget-policy", "provider-health"],
    implementation_status: "wired_unproven", prompt_origin: "Phase 2 — Compute Governance",
    spec_score: 85, ui_score: 80, contract_score: 75, wiring_score: 70, runtime_score: 35, overall_readiness: 69,
  },
  {
    spec_id: "sovereign-ai-gateway", canonical_name: "Sovereign AI Gateway", owning_module: "sag",
    description: "Provider registry, model registry, routing policy, economics, receipts, compliance",
    required_routes: ["/admin/sag", "/admin/sag/models", "/admin/sag/routing", "/admin/sag/economics"],
    required_components: ["SAGOverview", "SAGModelRegistry", "SAGRoutingPolicy", "SAGEconomicsBoard"],
    required_services: ["sag-router", "sag-receipt-writer"],
    required_contracts: ["ai-provider-registry", "ai-model-registry", "ai-capability-routing"],
    implementation_status: "wired_unproven", prompt_origin: "Phase 2 — SAG",
    spec_score: 90, ui_score: 90, contract_score: 85, wiring_score: 75, runtime_score: 40, overall_readiness: 76,
  },
  {
    spec_id: "admin-control-plane", canonical_name: "Admin Control Plane", owning_module: "admin",
    description: "Unified admin shell, mission control, observability, fleet health, security",
    required_routes: ["/admin", "/admin/mission-control", "/admin/fleet-health"],
    required_components: ["AdminShell", "MissionControlHome", "FleetHealthPage"],
    required_services: ["admin-state-service"],
    required_contracts: ["admin-shell-contract"],
    implementation_status: "proven", prompt_origin: "Phase 1 — Admin Control Plane",
    spec_score: 95, ui_score: 95, contract_score: 85, wiring_score: 90, runtime_score: 80, overall_readiness: 89,
  },
  {
    spec_id: "onboarding-ceremony", canonical_name: "Onboarding Ceremony", owning_module: "onboarding",
    description: "First-use boot, personalization, trust calibration, desktop arrival",
    required_routes: ["/onboarding", "/desktop"],
    required_components: ["Onboarding", "DesktopPage"],
    required_services: ["onboarding-state-service"],
    required_contracts: ["onboarding-profile"],
    implementation_status: "partial", prompt_origin: "Phase 1 — Onboarding Ceremony",
    spec_score: 75, ui_score: 80, contract_score: 50, wiring_score: 55, runtime_score: 30, overall_readiness: 58,
  },
  {
    spec_id: "core-persistence-substrate", canonical_name: "Core Persistence Substrate", owning_module: "kernel",
    description: "EventBus, MemoryService, PolicyEngine, ActionStateMachine, Receipt persistence",
    required_routes: ["/admin/core-persistence", "/admin/event-stream", "/admin/memory-continuity", "/admin/policy-ledger"],
    required_components: ["CorePersistenceOverview", "EventStreamExplorer", "MemoryContinuityCenter"],
    required_services: ["event-bus", "memory-service", "policy-engine", "receipt-service"],
    required_contracts: ["os-event-log", "os-memory-scoped", "os-policy-evaluations"],
    implementation_status: "proven", prompt_origin: "Phase 3 — Core Persistence Substrate",
    spec_score: 95, ui_score: 90, contract_score: 90, wiring_score: 85, runtime_score: 75, overall_readiness: 87,
  },
  {
    spec_id: "automation-office", canonical_name: "Automation Office", owning_module: "automation",
    description: "Workflow engine, scheduled jobs, self-healing, kill switches, retry/failure center",
    required_routes: ["/workflows", "/admin/automation", "/admin/ar02-jobs", "/admin/ar03-self-healing"],
    required_components: ["WorkflowsCenter", "AR01AutomationOverview", "AR02ScheduledJobRegistry"],
    required_services: ["workflow-engine", "scheduler-service"],
    required_contracts: ["workflow-definition", "workflow-run"],
    implementation_status: "partial", prompt_origin: "Phase 2 — Automation Office",
    spec_score: 75, ui_score: 80, contract_score: 60, wiring_score: 50, runtime_score: 25, overall_readiness: 58,
  },
  {
    spec_id: "advisor-system", canonical_name: "Advisor System", owning_module: "advisors",
    description: "Multi-advisor orchestration, council, workspace, knowledge, memory, feedback",
    required_routes: ["/advisors", "/advisors/workspace", "/advisors/council"],
    required_components: ["AdvisorWorkspace", "AdvisorCouncilDashboard", "AdvisorRegistry"],
    required_services: ["advisor-orchestrator", "advisor-memory-service"],
    required_contracts: ["advisor-config", "advisor-response"],
    implementation_status: "wired_unproven", prompt_origin: "Phase 2 — Advisors",
    spec_score: 85, ui_score: 90, contract_score: 75, wiring_score: 65, runtime_score: 30, overall_readiness: 69,
  },
  {
    spec_id: "proof-system", canonical_name: "Proof & Receipt System", owning_module: "proof",
    description: "Receipt generation, proof chains, canonical chain explorer, proof matrix",
    required_routes: ["/proof", "/admin/proof-matrix", "/admin/canonical-chain"],
    required_components: ["ProofCenter", "ProofMatrixExplorer", "CanonicalChainExplorer"],
    required_services: ["receipt-service", "proof-chain-service"],
    required_contracts: ["sita-receipt", "sita-proof-record"],
    implementation_status: "proven", prompt_origin: "Phase 1 — Proof System",
    spec_score: 90, ui_score: 85, contract_score: 90, wiring_score: 85, runtime_score: 70, overall_readiness: 84,
  },
  {
    spec_id: "connector-hub", canonical_name: "Connector Hub", owning_module: "connectors",
    description: "Integration catalog, connections, OAuth, health, governance",
    required_routes: ["/integrations", "/integrations/catalog", "/integrations/connections"],
    required_components: ["IntegrationsCatalog", "ConnectionsList", "ConnectorHub"],
    required_services: ["connector-registry", "oauth-service"],
    required_contracts: ["connector-definition", "connection-status"],
    implementation_status: "partial", prompt_origin: "Phase 2 — Connector Hub",
    spec_score: 80, ui_score: 85, contract_score: 65, wiring_score: 55, runtime_score: 25, overall_readiness: 62,
  },
  {
    spec_id: "notification-system", canonical_name: "Notification System", owning_module: "notifications",
    description: "Push notifications, routing, calm policies, fatigue, cross-device delivery",
    required_routes: ["/notifications", "/notifications/settings"],
    required_components: ["NotificationCenter", "NotificationSettingsPage"],
    required_services: ["notification-dispatcher", "calm-policy-engine"],
    required_contracts: ["notification-queue", "notification-preference"],
    implementation_status: "partial", prompt_origin: "Phase 2 — Notifications",
    spec_score: 75, ui_score: 80, contract_score: 60, wiring_score: 50, runtime_score: 20, overall_readiness: 57,
  },
  {
    spec_id: "launch-readiness", canonical_name: "Launch Readiness Command Center", owning_module: "launch",
    description: "Flagship readiness, claim safety, blocker command, narrative guide, go/no-go",
    required_routes: ["/admin/launch-readiness", "/admin/launch-flagship", "/admin/launch-go-nogo"],
    required_components: ["LAUNCH01ReadinessExecutive", "LAUNCH02FlagshipReadiness", "LAUNCH07GoNoGo"],
    required_services: ["readiness-assessor"],
    required_contracts: ["launch-gate", "claim-safety"],
    implementation_status: "advanced_unwired", prompt_origin: "Phase 2 — Launch Readiness",
    spec_score: 85, ui_score: 90, contract_score: 70, wiring_score: 55, runtime_score: 20, overall_readiness: 64,
  },
  {
    spec_id: "security-command", canonical_name: "Security Command Center", owning_module: "security",
    description: "Posture executive, privileged actions, sensitive assets, edge audit, incident recovery",
    required_routes: ["/admin/security/posture", "/admin/security/privileged", "/admin/security/assets"],
    required_components: ["SEC01PostureExecutive", "SEC02PrivilegedActions", "SEC03SensitiveAssets"],
    required_services: ["security-posture-service"],
    required_contracts: ["security-finding", "privileged-action"],
    implementation_status: "advanced_unwired", prompt_origin: "Phase 2 — Security",
    spec_score: 85, ui_score: 85, contract_score: 70, wiring_score: 50, runtime_score: 25, overall_readiness: 63,
  },
  {
    spec_id: "fip-system", canonical_name: "Feature Integration Protocol", owning_module: "fip",
    description: "Feature intake, spec studio, ownership, capability registry, compliance, execution",
    required_routes: ["/admin/fip/intake", "/admin/fip/spec-studio", "/admin/fip/compliance"],
    required_components: ["FIPIntakeDesk", "FIPSpecStudio", "FIPComplianceBoard"],
    required_services: ["fip-engine"],
    required_contracts: ["feature-spec", "fip-compliance-record"],
    implementation_status: "wired_unproven", prompt_origin: "Phase 2 — FIP",
    spec_score: 90, ui_score: 90, contract_score: 75, wiring_score: 70, runtime_score: 30, overall_readiness: 71,
  },
  {
    spec_id: "dual-reality-system", canonical_name: "Dual Reality System", owning_module: "reality",
    description: "Demo/live mode, scenario library, entity graph, policy safety, truth labeling",
    required_routes: ["/admin/drs01-overview", "/admin/drs02-registry", "/admin/drs09-truth-labeling"],
    required_components: ["DRS01RealityModeOverview", "DRS02ModeRegistryConsole", "DRS09TruthLabeling"],
    required_services: ["reality-mode-service", "demo-data-provider"],
    required_contracts: ["reality-mode", "demo-scenario"],
    implementation_status: "wired_unproven", prompt_origin: "Phase 2 — Dual Reality",
    spec_score: 85, ui_score: 90, contract_score: 80, wiring_score: 70, runtime_score: 40, overall_readiness: 73,
  },
  {
    spec_id: "implementation-truth", canonical_name: "Implementation Truth Center", owning_module: "verification",
    description: "Spec registry, contract verification, wiring graph, readiness scorecards, drift radar",
    required_routes: ["/admin/implementation-truth", "/admin/implementation-truth/specs", "/admin/implementation-truth/contracts", "/admin/implementation-truth/wiring", "/admin/implementation-truth/readiness", "/admin/implementation-truth/drift"],
    required_components: ["ITC01Overview", "ITC02SpecRegistry", "ITC03ContractVerification", "ITC04WiringGraph", "ITC05ReadinessScoreboard", "ITC06DriftRadar"],
    required_services: ["spec-registry-service"],
    required_contracts: ["implementation-spec", "wiring-edge"],
    implementation_status: "proven", prompt_origin: "Phase 3 — Implementation Truth",
    spec_score: 95, ui_score: 95, contract_score: 90, wiring_score: 90, runtime_score: 80, overall_readiness: 90,
  },
];

export function useSeedSpecs() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Auth required");
      const rows = CANONICAL_SPECS.map(s => ({ ...s, user_id: user.id }));
      const { error } = await supabase
        .from("implementation_spec_registry" as any)
        .upsert(rows as any, { onConflict: "user_id,spec_id" });
      if (error) throw error;
      return rows.length;
    },
    onSuccess: (count) => {
      qc.invalidateQueries({ queryKey: ["implementation-spec-registry"] });
      toast.success(`Seeded ${count} canonical specs`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export { CANONICAL_SPECS };
