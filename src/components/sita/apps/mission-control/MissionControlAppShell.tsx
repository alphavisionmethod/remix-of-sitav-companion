import React, { useState, useCallback, useEffect, useMemo, lazy, Suspense } from "react";
import {
  LayoutDashboard, Terminal, Activity, Cloud, HardDrive, Users, Smartphone,
  Shield, Layers, Rocket, Brain, AlertTriangle, ScrollText, Flag, DollarSign,
  Wrench, HeadphonesIcon, BookOpen, ChevronDown, ChevronRight, PanelLeftClose,
  PanelLeft, Settings, Sparkles, SlidersHorizontal, ShieldAlert, FileText,
  Zap, Monitor, Radio, RotateCcw, Network, Search, Eye, Globe, Cpu,
  Database, Lock, BarChart3, GitBranch, Workflow, BrainCircuit, Crown,
  Fingerprint, Scale, Target, Microscope, Gauge, TrendingUp, Lightbulb
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

// ── Lazy-loaded admin page components ──
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const TeamManagement = lazy(() => import("@/pages/admin/TeamManagement"));
const SystemManagement = lazy(() => import("@/pages/admin/SystemManagement"));
const UserManagement = lazy(() => import("@/pages/admin/UserManagement"));
const AITokenDashboard = lazy(() => import("@/pages/admin/AITokenDashboard"));
const GeneratedTruthDashboard = lazy(() => import("@/pages/admin/GeneratedTruthDashboard"));
const FleetHealthPage = lazy(() => import("@/pages/admin/FleetHealthPage"));
const TruthIndexDashboard = lazy(() => import("@/pages/admin/TruthIndexDashboard"));
const SecurityCommandCenter = lazy(() => import("@/pages/admin/SecurityCommandCenter"));
const CommunicationHub = lazy(() => import("@/pages/admin/CommunicationHub"));

// ECO / SEC / SYS / OS / Cloud
const ECO01EcosystemCommand = lazy(() => import("@/pages/admin/ECO01EcosystemCommand"));
const SEC01SessionSecrets = lazy(() => import("@/pages/admin/SEC01SessionSecrets"));
const SEC02SecurityFoundation = lazy(() => import("@/pages/admin/SEC02SecurityFoundation"));
const SYS01SystemIntelligence = lazy(() => import("@/pages/admin/SYS01SystemIntelligence"));
const OS01PlatformCommandCenter = lazy(() => import("@/pages/admin/OS01PlatformCommandCenter"));
const CloudBackboneAdmin = lazy(() => import("@/pages/admin/cloud/CloudBackboneAdmin"));

// MC modules
const MCDevicesCenter = lazy(() => import("@/pages/admin/modules/MCDevicesCenter"));
const MCStorageCenter = lazy(() => import("@/pages/admin/modules/MCStorageCenter"));
const MCUsersCenter = lazy(() => import("@/pages/admin/modules/MCUsersCenter"));
const MCWorkspacesContinuity = lazy(() => import("@/pages/admin/modules/MCWorkspacesContinuity"));
const MCSyncCloud = lazy(() => import("@/pages/admin/modules/MCSyncCloud"));
const MCJobsMaintenance = lazy(() => import("@/pages/admin/modules/MCJobsMaintenance"));
const MCTrustSecurity = lazy(() => import("@/pages/admin/modules/MCTrustSecurity"));
const MCReleasesUpdates = lazy(() => import("@/pages/admin/modules/MCReleasesUpdates"));
const MCAIControl = lazy(() => import("@/pages/admin/modules/MCAIControl"));
const MCIncidents = lazy(() => import("@/pages/admin/modules/MCIncidents"));
const MCPoliciesFlags = lazy(() => import("@/pages/admin/modules/MCPoliciesFlags"));
const MCCostsAIBudgets = lazy(() => import("@/pages/admin/modules/MCCostsAIBudgets"));
const MCLogsAudit = lazy(() => import("@/pages/admin/modules/MCLogsAudit"));
const MCSupport = lazy(() => import("@/pages/admin/modules/MCSupport"));
const MCKnowledgeBase = lazy(() => import("@/pages/admin/modules/MCKnowledgeBase"));
const MCSystemHealth = lazy(() => import("@/pages/admin/modules/MCSystemHealth"));
const MCAuthorityMatrix = lazy(() => import("@/pages/admin/modules/MCAuthorityMatrix"));
const MCControlReceipts = lazy(() => import("@/pages/admin/modules/MCControlReceipts"));
const MCEmergencyAuthority = lazy(() => import("@/pages/admin/modules/MCEmergencyAuthority"));
const MCPlatformAdaptation = lazy(() => import("@/pages/admin/modules/MCPlatformAdaptation"));
const MCStateAuthority = lazy(() => import("@/pages/admin/modules/MCStateAuthority"));
const MCArchitectureDashboard = lazy(() => import("@/pages/admin/modules/MCArchitectureDashboard"));
const MCFeatureOwnership = lazy(() => import("@/pages/admin/modules/MCFeatureOwnership"));
const MCCommandRouting = lazy(() => import("@/pages/admin/modules/MCCommandRouting"));
const MCApprovalFlow = lazy(() => import("@/pages/admin/modules/MCApprovalFlow"));
const MCFailureRecovery = lazy(() => import("@/pages/admin/modules/MCFailureRecovery"));
const MCEventRouting = lazy(() => import("@/pages/admin/modules/MCEventRouting"));
const MCArchitectureTests = lazy(() => import("@/pages/admin/modules/MCArchitectureTests"));

// AI Team
const AIT01TeamOverview = lazy(() => import("@/pages/admin/AIT01TeamOverview"));
const AIT02RoleRegistry = lazy(() => import("@/pages/admin/AIT02RoleRegistry"));
const AIT03TaskInvocation = lazy(() => import("@/pages/admin/AIT03TaskInvocation"));
const AIT04ActivityFeed = lazy(() => import("@/pages/admin/AIT04to08Boards").then(m => ({ default: m.AIT04ActivityFeed })));
const AIT05CostEfficiency = lazy(() => import("@/pages/admin/AIT05CostEfficiency").then(m => ({ default: m.AIT05CostEfficiency })));
const AIT06Recommendations = lazy(() => import("@/pages/admin/AIT04to08Boards").then(m => ({ default: m.AIT06Recommendations })));
const AIT07ApprovalQueue = lazy(() => import("@/pages/admin/AIT04to08Boards").then(m => ({ default: m.AIT07ApprovalQueue })));
const AIT08LaunchTruth = lazy(() => import("@/pages/admin/AIT04to08Boards").then(m => ({ default: m.AIT08LaunchTruth })));
const HQApprovalQueue = lazy(() => import("@/pages/admin/HQApprovalQueue"));
const AITSetupChecklist = lazy(() => import("@/pages/admin/AITSetupChecklist"));

// AI Gateway
const AIG01ProviderRegistry = lazy(() => import("@/pages/admin/AIG01ProviderRegistry"));
const AIG02ModelRegistry = lazy(() => import("@/pages/admin/AIG02ModelRegistry"));
const AIG03RoutingMatrix = lazy(() => import("@/pages/admin/AIG03RoutingMatrix"));
const AIG04BudgetCenter = lazy(() => import("@/pages/admin/AIG04BudgetCenter"));
const AIG05ReceiptsExplorer = lazy(() => import("@/pages/admin/AIG05ReceiptsExplorer"));
const AIG06LaunchTruth = lazy(() => import("@/pages/admin/AIG06LaunchTruth"));
const AIG07LaunchTruth = lazy(() => import("@/pages/admin/AIG07LaunchTruth"));
const AIG08DegradedDiagnostics = lazy(() => import("@/pages/admin/AIG08DegradedDiagnostics"));
const AIG09RuntimeVerification = lazy(() => import("@/pages/admin/AIG09RuntimeVerification"));

// Intelligence Layer
const IntelligenceReuseOverview = lazy(() => import("@/pages/admin/intelligence/IntelligenceReuseOverview"));
const IntelligenceAssetLibrary = lazy(() => import("@/pages/admin/intelligence/IntelligenceAssetLibrary"));
const DifferentialReasoningExplorer = lazy(() => import("@/pages/admin/intelligence/DifferentialReasoningExplorer"));
const IntelligencePacketInspector = lazy(() => import("@/pages/admin/intelligence/IntelligencePacketInspector"));
const AIEfficiencyScoreboard = lazy(() => import("@/pages/admin/intelligence/AIEfficiencyScoreboard"));
const OutcomeEconomicsBoard = lazy(() => import("@/pages/admin/intelligence/OutcomeEconomicsBoard"));
const EscalationControlCenter = lazy(() => import("@/pages/admin/intelligence/EscalationControlCenter"));
const PatternLearningCenter = lazy(() => import("@/pages/admin/intelligence/PatternLearningCenter"));
const ZeroWastePromptView = lazy(() => import("@/pages/admin/intelligence/ZeroWastePromptView"));
const SmartDigestCenter = lazy(() => import("@/pages/admin/intelligence/SmartDigestCenter"));
const CrossTenantGovernance = lazy(() => import("@/pages/admin/intelligence/CrossTenantGovernance"));
const IntelligenceLayerAdmin = lazy(() => import("@/pages/admin/intelligence/IntelligenceLayerAdmin"));

// Strategic Dashboards
const IntelligenceCapitalDashboard = lazy(() => import("@/pages/admin/strategic/IntelligenceCapitalDashboard"));
const CostToConfidenceDashboard = lazy(() => import("@/pages/admin/strategic/CostToConfidenceDashboard"));
const QualityFloorDashboard = lazy(() => import("@/pages/admin/strategic/QualityFloorDashboard"));
const IntelligenceInsuranceDashboard = lazy(() => import("@/pages/admin/strategic/IntelligenceInsuranceDashboard"));
const IntelligenceMarketDashboard = lazy(() => import("@/pages/admin/strategic/IntelligenceMarketDashboard"));
const TimeToTruthDashboard = lazy(() => import("@/pages/admin/strategic/TimeToTruthDashboard"));
const ReasoningReplayDashboard = lazy(() => import("@/pages/admin/strategic/ReasoningReplayDashboard"));
const DecayMonitorDashboard = lazy(() => import("@/pages/admin/strategic/DecayMonitorDashboard"));
const PortfolioAllocationDashboard = lazy(() => import("@/pages/admin/strategic/PortfolioAllocationDashboard"));
const BenchmarkLabDashboard = lazy(() => import("@/pages/admin/strategic/BenchmarkLabDashboard"));
const ValueRiskDashboard = lazy(() => import("@/pages/admin/strategic/ValueRiskDashboard"));
const OperatorTasteDashboard = lazy(() => import("@/pages/admin/strategic/OperatorTasteDashboard"));

// CAI
const CAI01PersonalGraphExplorer = lazy(() => import("@/pages/admin/CAI01PersonalGraphExplorer"));
const CAI02IntentTraceBoard = lazy(() => import("@/pages/admin/CAI02IntentTraceBoard"));
const CAI03AttentionCenter = lazy(() => import("@/pages/admin/CAI03AttentionCenter"));
const CAI04ContinuityCenter = lazy(() => import("@/pages/admin/CAI04ContinuityCenter"));
const CAI05TrustActionsBoard = lazy(() => import("@/pages/admin/CAI05TrustActionsBoard"));
const CAI06ChiefOfStaffCenter = lazy(() => import("@/pages/admin/CAI06ChiefOfStaffCenter"));
const CAI07TimingStudio = lazy(() => import("@/pages/admin/CAI07TimingStudio"));
const CAI08RelationshipCenter = lazy(() => import("@/pages/admin/CAI08RelationshipCenter"));
const CAI09DigestConsole = lazy(() => import("@/pages/admin/CAI09DigestConsole"));
const CAI10ModesCenter = lazy(() => import("@/pages/admin/CAI10ModesCenter"));
const CAI11InterfaceProfiler = lazy(() => import("@/pages/admin/CAI11InterfaceProfiler"));
const CAI12OpportunityBoard = lazy(() => import("@/pages/admin/CAI12OpportunityBoard"));
const CAI13MemoryGovernance = lazy(() => import("@/pages/admin/CAI13MemoryGovernance"));
const CAI14BoundaryControl = lazy(() => import("@/pages/admin/CAI14BoundaryControl"));
const CAI15SignatureStudio = lazy(() => import("@/pages/admin/CAI15SignatureStudio"));

// FCC: Founder Command Control
const FCC01FounderCommandConsole = lazy(() => import("@/pages/admin/FCC01FounderCommandConsole"));
const FCC02TaskDecompositionGraph = lazy(() => import("@/pages/admin/FCC02TaskDecompositionGraph"));
const FCC03CICDPipelineBoard = lazy(() => import("@/pages/admin/FCC03CICDPipelineBoard"));
const FCC04RunbookCenter = lazy(() => import("@/pages/admin/FCC04RunbookCenter"));
const FCC05FounderDashboard = lazy(() => import("@/pages/admin/FCC05FounderDashboard"));
const FCC06ProgramManagementBoard = lazy(() => import("@/pages/admin/FCC06ProgramManagementBoard"));
const FCC07PlatformCostCapacity = lazy(() => import("@/pages/admin/FCC07PlatformCostCapacity"));
const FCC08SyncStorageOps = lazy(() => import("@/pages/admin/FCC08SyncStorageOps"));
const FCC09SecurityRiskCenter = lazy(() => import("@/pages/admin/FCC09SecurityRiskCenter"));
const FCC10HumanOversightEscalation = lazy(() => import("@/pages/admin/FCC10HumanOversightEscalation"));
const FCC11IncidentResponseTimeline = lazy(() => import("@/pages/admin/FCC11IncidentResponseTimeline"));
const FCC12KnowledgeMemorySystem = lazy(() => import("@/pages/admin/FCC12KnowledgeMemorySystem"));

// SRE: Engineering Governance
const SRE01ValidationCenter = lazy(() => import("@/pages/admin/SRE01ValidationCenter"));
const SRE02BuilderCriticConsole = lazy(() => import("@/pages/admin/SRE02BuilderCriticConsole"));
const SRE03SimulationLab = lazy(() => import("@/pages/admin/SRE03SimulationLab"));
const SRE04CodeStandardsTestGen = lazy(() => import("@/pages/admin/SRE04CodeStandardsTestGen"));
const SRE05ChaosTestingFramework = lazy(() => import("@/pages/admin/SRE05ChaosTestingFramework"));
const SRE06AutoRollbackCenter = lazy(() => import("@/pages/admin/SRE06AutoRollbackCenter"));
const SRE07VersionIntelligence = lazy(() => import("@/pages/admin/SRE07VersionIntelligence"));
const SRE08SelfOptimizationBudgets = lazy(() => import("@/pages/admin/SRE08SelfOptimizationBudgets"));

// ── Module map ──
const MODULE_MAP: Record<string, React.LazyExoticComponent<any>> = {
  dashboard: AdminDashboard,
  "team": TeamManagement,
  "system": SystemManagement,
  "users": UserManagement,
  "ai-tokens": AITokenDashboard,
  "generated-truth": GeneratedTruthDashboard,
  "fleet-health": FleetHealthPage,
  "truth-indices": TruthIndexDashboard,
  "security-command-center": SecurityCommandCenter,
  "communication-hub": CommunicationHub,
  "ecosystem-command": ECO01EcosystemCommand,
  "security-sessions": SEC01SessionSecrets,
  "security-foundation": SEC02SecurityFoundation,
  "system-intelligence": SYS01SystemIntelligence,
  "os-platform": OS01PlatformCommandCenter,
  "cloud-backbone": CloudBackboneAdmin,
  // MC modules
  "mc-devices": MCDevicesCenter,
  "mc-storage": MCStorageCenter,
  "mc-users": MCUsersCenter,
  "mc-workspaces": MCWorkspacesContinuity,
  "mc-sync-cloud": MCSyncCloud,
  "mc-jobs": MCJobsMaintenance,
  "mc-trust-security": MCTrustSecurity,
  "mc-releases": MCReleasesUpdates,
  "mc-ai-control": MCAIControl,
  "mc-incidents": MCIncidents,
  "mc-policies": MCPoliciesFlags,
  "mc-costs": MCCostsAIBudgets,
  "mc-logs": MCLogsAudit,
  "mc-support": MCSupport,
  "mc-knowledge": MCKnowledgeBase,
  "mc-system-health": MCSystemHealth,
  "mc-authority-matrix": MCAuthorityMatrix,
  "mc-control-receipts": MCControlReceipts,
  "mc-emergency": MCEmergencyAuthority,
  "mc-platform-adaptation": MCPlatformAdaptation,
  "mc-state-authority": MCStateAuthority,
  "mc-architecture": MCArchitectureDashboard,
  "mc-feature-ownership": MCFeatureOwnership,
  "mc-command-routing": MCCommandRouting,
  "mc-approval-flow": MCApprovalFlow,
  "mc-failure-recovery": MCFailureRecovery,
  "mc-event-routing": MCEventRouting,
  "mc-architecture-tests": MCArchitectureTests,
  // AI Team
  "ai-team-overview": AIT01TeamOverview,
  "ai-team-roles": AIT02RoleRegistry,
  "ai-team-invoke": AIT03TaskInvocation,
  "ai-team-activity": AIT04ActivityFeed,
  "ai-team-cost": AIT05CostEfficiency,
  "ai-team-recommendations": AIT06Recommendations,
  "ai-team-approvals": AIT07ApprovalQueue,
  "ai-team-launch-truth": AIT08LaunchTruth,
  "ai-team-approval-queue": HQApprovalQueue,
  "ai-team-setup": AITSetupChecklist,
  // AI Gateway
  "aig-providers": AIG01ProviderRegistry,
  "aig-models": AIG02ModelRegistry,
  "aig-routing": AIG03RoutingMatrix,
  "aig-budget": AIG04BudgetCenter,
  "aig-receipts": AIG05ReceiptsExplorer,
  "aig-honesty": AIG06LaunchTruth,
  "aig-launch-truth": AIG07LaunchTruth,
  "aig-diagnostics": AIG08DegradedDiagnostics,
  "aig-verification": AIG09RuntimeVerification,
  // Intelligence Layer
  "intel-reuse": IntelligenceReuseOverview,
  "intel-assets": IntelligenceAssetLibrary,
  "intel-differential": DifferentialReasoningExplorer,
  "intel-packets": IntelligencePacketInspector,
  "intel-efficiency": AIEfficiencyScoreboard,
  "intel-outcomes": OutcomeEconomicsBoard,
  "intel-escalation": EscalationControlCenter,
  "intel-patterns": PatternLearningCenter,
  "intel-prompts": ZeroWastePromptView,
  "intel-digests": SmartDigestCenter,
  "intel-cross-tenant": CrossTenantGovernance,
  "intel-layer": IntelligenceLayerAdmin,
  // Strategic
  "strat-capital": IntelligenceCapitalDashboard,
  "strat-cost-confidence": CostToConfidenceDashboard,
  "strat-quality-floor": QualityFloorDashboard,
  "strat-insurance": IntelligenceInsuranceDashboard,
  "strat-market": IntelligenceMarketDashboard,
  "strat-time-to-truth": TimeToTruthDashboard,
  "strat-reasoning-replay": ReasoningReplayDashboard,
  "strat-decay": DecayMonitorDashboard,
  "strat-portfolio": PortfolioAllocationDashboard,
  "strat-benchmark": BenchmarkLabDashboard,
  "strat-value-risk": ValueRiskDashboard,
  "strat-operator-taste": OperatorTasteDashboard,
  // CAI
  "cai-graph": CAI01PersonalGraphExplorer,
  "cai-intent": CAI02IntentTraceBoard,
  "cai-attention": CAI03AttentionCenter,
  "cai-continuity": CAI04ContinuityCenter,
  "cai-trust-actions": CAI05TrustActionsBoard,
  "cai-chief-of-staff": CAI06ChiefOfStaffCenter,
  "cai-timing": CAI07TimingStudio,
  "cai-relationships": CAI08RelationshipCenter,
  "cai-digest": CAI09DigestConsole,
  "cai-modes": CAI10ModesCenter,
  "cai-interface": CAI11InterfaceProfiler,
  "cai-opportunities": CAI12OpportunityBoard,
  "cai-memory": CAI13MemoryGovernance,
  "cai-boundaries": CAI14BoundaryControl,
  "cai-signature": CAI15SignatureStudio,
  // FCC
  "fcc-command": FCC01FounderCommandConsole,
  "fcc-tasks": FCC02TaskDecompositionGraph,
  "fcc-cicd": FCC03CICDPipelineBoard,
  "fcc-runbooks": FCC04RunbookCenter,
  "fcc-dashboard": FCC05FounderDashboard,
  "fcc-programs": FCC06ProgramManagementBoard,
  "fcc-cost": FCC07PlatformCostCapacity,
  "fcc-sync-ops": FCC08SyncStorageOps,
  "fcc-security": FCC09SecurityRiskCenter,
  "fcc-oversight": FCC10HumanOversightEscalation,
  "fcc-incidents": FCC11IncidentResponseTimeline,
  "fcc-knowledge": FCC12KnowledgeMemorySystem,
  // SRE
  "sre-validation": SRE01ValidationCenter,
  "sre-builder-critic": SRE02BuilderCriticConsole,
  "sre-simulation": SRE03SimulationLab,
  "sre-standards": SRE04CodeStandardsTestGen,
  "sre-chaos": SRE05ChaosTestingFramework,
  "sre-rollback": SRE06AutoRollbackCenter,
  "sre-version-intel": SRE07VersionIntelligence,
  "sre-optimization": SRE08SelfOptimizationBudgets,
};

// ── Sidebar nav groups ──
interface NavItem {
  label: string;
  icon: React.ElementType;
  moduleId: string;
  badge?: number | string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
  defaultOpen?: boolean;
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Overview",
    defaultOpen: true,
    items: [
      { label: "Dashboard", icon: LayoutDashboard, moduleId: "dashboard" },
      { label: "Command Center", icon: Terminal, moduleId: "fcc-command" },
      { label: "System Health", icon: Activity, moduleId: "mc-system-health" },
    ],
  },
  {
    title: "Infrastructure",
    items: [
      { label: "Sync Cloud", icon: Cloud, moduleId: "mc-sync-cloud" },
      { label: "Communication Hub", icon: Network, moduleId: "communication-hub" },
      { label: "Storage", icon: HardDrive, moduleId: "mc-storage" },
      { label: "Devices", icon: Smartphone, moduleId: "mc-devices" },
      { label: "Workspaces", icon: Layers, moduleId: "mc-workspaces" },
    ],
  },
  {
    title: "People & Trust",
    items: [
      { label: "Users", icon: Users, moduleId: "mc-users" },
      { label: "Trust & Security", icon: Shield, moduleId: "mc-trust-security" },
    ],
  },
  {
    title: "Intelligence",
    items: [
      { label: "AI Control", icon: Brain, moduleId: "mc-ai-control" },
      { label: "Costs & Budgets", icon: DollarSign, moduleId: "mc-costs" },
      { label: "Policies & Flags", icon: Flag, moduleId: "mc-policies" },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Releases", icon: Rocket, moduleId: "mc-releases" },
      { label: "Incidents", icon: AlertTriangle, moduleId: "mc-incidents" },
      { label: "Jobs & Maintenance", icon: Wrench, moduleId: "mc-jobs" },
      { label: "Logs & Audit", icon: ScrollText, moduleId: "mc-logs" },
    ],
  },
  {
    title: "Support & Knowledge",
    items: [
      { label: "Support", icon: HeadphonesIcon, moduleId: "mc-support" },
      { label: "Knowledge Base", icon: BookOpen, moduleId: "mc-knowledge" },
    ],
  },
  {
    title: "Authority & Control",
    items: [
      { label: "Authority Matrix", icon: Shield, moduleId: "mc-authority-matrix" },
      { label: "Control Receipts", icon: FileText, moduleId: "mc-control-receipts" },
      { label: "Emergency Authority", icon: ShieldAlert, moduleId: "mc-emergency" },
      { label: "Platform Adaptation", icon: Zap, moduleId: "mc-platform-adaptation" },
      { label: "State Authority Map", icon: Layers, moduleId: "mc-state-authority" },
    ],
  },
  {
    title: "Architecture Governance",
    items: [
      { label: "Dashboard", icon: Network, moduleId: "mc-architecture" },
      { label: "Feature Ownership", icon: Layers, moduleId: "mc-feature-ownership" },
      { label: "Command Routing", icon: Radio, moduleId: "mc-command-routing" },
      { label: "Approval Flow", icon: ShieldAlert, moduleId: "mc-approval-flow" },
      { label: "Failure & Recovery", icon: RotateCcw, moduleId: "mc-failure-recovery" },
      { label: "Event Routing", icon: Activity, moduleId: "mc-event-routing" },
      { label: "Architecture Tests", icon: Shield, moduleId: "mc-architecture-tests" },
    ],
  },
  {
    title: "Security",
    items: [
      { label: "Command Center", icon: Lock, moduleId: "security-command-center" },
      { label: "Sessions & Secrets", icon: Fingerprint, moduleId: "security-sessions" },
      { label: "Foundation", icon: Shield, moduleId: "security-foundation" },
      { label: "Risk Center", icon: ShieldAlert, moduleId: "fcc-security" },
    ],
  },
  {
    title: "Engineering",
    items: [
      { label: "Validation", icon: Target, moduleId: "sre-validation" },
      { label: "Builder & Critic", icon: Scale, moduleId: "sre-builder-critic" },
      { label: "Simulation Lab", icon: Microscope, moduleId: "sre-simulation" },
      { label: "Code Standards", icon: FileText, moduleId: "sre-standards" },
      { label: "Chaos Testing", icon: Zap, moduleId: "sre-chaos" },
      { label: "Auto Rollback", icon: RotateCcw, moduleId: "sre-rollback" },
      { label: "Version Intelligence", icon: GitBranch, moduleId: "sre-version-intel" },
      { label: "Self-Optimization", icon: Gauge, moduleId: "sre-optimization" },
    ],
  },
  {
    title: "Founder",
    items: [
      { label: "Dashboard", icon: Crown, moduleId: "fcc-dashboard" },
      { label: "Task Graph", icon: Workflow, moduleId: "fcc-tasks" },
      { label: "CI/CD Pipeline", icon: GitBranch, moduleId: "fcc-cicd" },
      { label: "Runbooks", icon: BookOpen, moduleId: "fcc-runbooks" },
      { label: "Programs", icon: BarChart3, moduleId: "fcc-programs" },
      { label: "Cost & Capacity", icon: DollarSign, moduleId: "fcc-cost" },
      { label: "Sync & Storage Ops", icon: Database, moduleId: "fcc-sync-ops" },
      { label: "Human Oversight", icon: Eye, moduleId: "fcc-oversight" },
      { label: "Incident Timeline", icon: AlertTriangle, moduleId: "fcc-incidents" },
      { label: "Knowledge & Memory", icon: BrainCircuit, moduleId: "fcc-knowledge" },
    ],
  },
  {
    title: "AI Team",
    items: [
      { label: "Team Overview", icon: Users, moduleId: "ai-team-overview" },
      { label: "Role Registry", icon: Shield, moduleId: "ai-team-roles" },
      { label: "Task Invocation", icon: Zap, moduleId: "ai-team-invoke" },
      { label: "Activity Feed", icon: Activity, moduleId: "ai-team-activity" },
      { label: "Cost Efficiency", icon: DollarSign, moduleId: "ai-team-cost" },
      { label: "Recommendations", icon: Lightbulb, moduleId: "ai-team-recommendations" },
      { label: "Approval Queue", icon: Shield, moduleId: "ai-team-approvals" },
      { label: "Launch Truth", icon: Target, moduleId: "ai-team-launch-truth" },
      { label: "Setup Checklist", icon: FileText, moduleId: "ai-team-setup" },
    ],
  },
  {
    title: "AI Gateway",
    items: [
      { label: "Providers", icon: Globe, moduleId: "aig-providers" },
      { label: "Models", icon: Cpu, moduleId: "aig-models" },
      { label: "Routing Matrix", icon: Network, moduleId: "aig-routing" },
      { label: "Budget Center", icon: DollarSign, moduleId: "aig-budget" },
      { label: "Receipts", icon: FileText, moduleId: "aig-receipts" },
      { label: "Honesty Audit", icon: Eye, moduleId: "aig-honesty" },
      { label: "Diagnostics", icon: Wrench, moduleId: "aig-diagnostics" },
      { label: "Runtime Verification", icon: Shield, moduleId: "aig-verification" },
    ],
  },
  {
    title: "Intelligence Layer",
    items: [
      { label: "Reuse Overview", icon: BarChart3, moduleId: "intel-reuse" },
      { label: "Asset Library", icon: Database, moduleId: "intel-assets" },
      { label: "Differential Reasoning", icon: Brain, moduleId: "intel-differential" },
      { label: "Packet Inspector", icon: Search, moduleId: "intel-packets" },
      { label: "Efficiency Scoreboard", icon: Gauge, moduleId: "intel-efficiency" },
      { label: "Outcome Economics", icon: TrendingUp, moduleId: "intel-outcomes" },
      { label: "Escalation Control", icon: AlertTriangle, moduleId: "intel-escalation" },
      { label: "Pattern Learning", icon: BrainCircuit, moduleId: "intel-patterns" },
      { label: "Prompt View", icon: FileText, moduleId: "intel-prompts" },
      { label: "Smart Digest", icon: ScrollText, moduleId: "intel-digests" },
      { label: "Cross-Tenant", icon: Globe, moduleId: "intel-cross-tenant" },
      { label: "Layer Admin", icon: Settings, moduleId: "intel-layer" },
    ],
  },
  {
    title: "Strategic",
    items: [
      { label: "Intelligence Capital", icon: TrendingUp, moduleId: "strat-capital" },
      { label: "Cost ↔ Confidence", icon: Scale, moduleId: "strat-cost-confidence" },
      { label: "Quality Floor", icon: Shield, moduleId: "strat-quality-floor" },
      { label: "Insurance", icon: Lock, moduleId: "strat-insurance" },
      { label: "Market", icon: Globe, moduleId: "strat-market" },
      { label: "Time to Truth", icon: Target, moduleId: "strat-time-to-truth" },
      { label: "Reasoning Replay", icon: RotateCcw, moduleId: "strat-reasoning-replay" },
      { label: "Decay Monitor", icon: Activity, moduleId: "strat-decay" },
      { label: "Portfolio Allocation", icon: BarChart3, moduleId: "strat-portfolio" },
      { label: "Benchmark Lab", icon: Microscope, moduleId: "strat-benchmark" },
      { label: "Value & Risk", icon: AlertTriangle, moduleId: "strat-value-risk" },
      { label: "Operator Taste", icon: Sparkles, moduleId: "strat-operator-taste" },
    ],
  },
  {
    title: "CAI — Ambient Intelligence",
    items: [
      { label: "Personal Graph", icon: Network, moduleId: "cai-graph" },
      { label: "Intent Trace", icon: Search, moduleId: "cai-intent" },
      { label: "Attention Center", icon: Eye, moduleId: "cai-attention" },
      { label: "Continuity", icon: Layers, moduleId: "cai-continuity" },
      { label: "Trust Actions", icon: Shield, moduleId: "cai-trust-actions" },
      { label: "Chief of Staff", icon: Crown, moduleId: "cai-chief-of-staff" },
      { label: "Timing Studio", icon: Activity, moduleId: "cai-timing" },
      { label: "Relationships", icon: Users, moduleId: "cai-relationships" },
      { label: "Digest Console", icon: ScrollText, moduleId: "cai-digest" },
      { label: "Modes Center", icon: SlidersHorizontal, moduleId: "cai-modes" },
      { label: "Interface Profiler", icon: Monitor, moduleId: "cai-interface" },
      { label: "Opportunities", icon: Lightbulb, moduleId: "cai-opportunities" },
      { label: "Memory Governance", icon: Database, moduleId: "cai-memory" },
      { label: "Boundary Control", icon: ShieldAlert, moduleId: "cai-boundaries" },
      { label: "Signature Studio", icon: Fingerprint, moduleId: "cai-signature" },
    ],
  },
];

// ── Path → module mapping for deep linking ──
const PATH_TO_MODULE: Record<string, string> = {
  "dashboard": "dashboard",
  "team": "team",
  "system": "system",
  "users": "users",
  "ai-tokens": "ai-tokens",
  "generated-truth": "generated-truth",
  "fleet-health": "fleet-health",
  "truth-indices": "truth-indices",
  "mc/devices": "mc-devices",
  "mc/storage": "mc-storage",
  "mc/users": "mc-users",
  "mc/workspaces": "mc-workspaces",
  "mc/sync-cloud": "mc-sync-cloud",
  "mc/jobs": "mc-jobs",
  "mc/trust-security": "mc-trust-security",
  "mc/releases": "mc-releases",
  "mc/ai-control": "mc-ai-control",
  "mc/incidents": "mc-incidents",
  "mc/policies": "mc-policies",
  "mc/costs": "mc-costs",
  "mc/logs": "mc-logs",
  "mc/support": "mc-support",
  "mc/knowledge": "mc-knowledge",
  "mc/system-health": "mc-system-health",
  "mc/authority-matrix": "mc-authority-matrix",
  "mc/control-receipts": "mc-control-receipts",
  "mc/emergency": "mc-emergency",
  "mc/platform-adaptation": "mc-platform-adaptation",
  "mc/state-authority": "mc-state-authority",
  "mc/architecture": "mc-architecture",
  "mc/feature-ownership": "mc-feature-ownership",
  "mc/command-routing": "mc-command-routing",
  "mc/approval-flow": "mc-approval-flow",
  "mc/failure-recovery": "mc-failure-recovery",
  "mc/event-routing": "mc-event-routing",
  "mc/architecture-tests": "mc-architecture-tests",
  "ai-team/overview": "ai-team-overview",
  "ai-team/roles": "ai-team-roles",
  "ai-team/invoke": "ai-team-invoke",
  "ai-team/activity": "ai-team-activity",
  "ai-team/cost": "ai-team-cost",
  "ai-team/recommendations": "ai-team-recommendations",
  "ai-team/approvals": "ai-team-approvals",
  "ai-team/launch-truth": "ai-team-launch-truth",
  "ai-team/approval-queue": "ai-team-approval-queue",
  "ai-team/setup-checklist": "ai-team-setup",
  "ai-gateway/providers": "aig-providers",
  "ai-gateway/models": "aig-models",
  "ai-gateway/routing": "aig-routing",
  "ai-gateway/budget": "aig-budget",
  "ai-gateway/receipts": "aig-receipts",
  "ai-gateway/honesty": "aig-honesty",
  "ai-gateway/launch-truth": "aig-launch-truth",
  "ai-gateway/diagnostics": "aig-diagnostics",
  "ai-gateway/verification": "aig-verification",
  "intelligence/reuse": "intel-reuse",
  "intelligence/assets": "intel-assets",
  "intelligence/differential": "intel-differential",
  "intelligence/packets": "intel-packets",
  "intelligence/efficiency": "intel-efficiency",
  "intelligence/outcomes": "intel-outcomes",
  "intelligence/escalation": "intel-escalation",
  "intelligence/patterns": "intel-patterns",
  "intelligence/prompts": "intel-prompts",
  "intelligence/digests": "intel-digests",
  "intelligence/cross-tenant": "intel-cross-tenant",
  "intelligence/layer": "intel-layer",
  "strategic/capital": "strat-capital",
  "strategic/cost-confidence": "strat-cost-confidence",
  "strategic/quality-floor": "strat-quality-floor",
  "strategic/insurance": "strat-insurance",
  "strategic/market": "strat-market",
  "strategic/time-to-truth": "strat-time-to-truth",
  "strategic/reasoning-replay": "strat-reasoning-replay",
  "strategic/decay": "strat-decay",
  "strategic/portfolio": "strat-portfolio",
  "strategic/benchmark": "strat-benchmark",
  "strategic/value-risk": "strat-value-risk",
  "strategic/operator-taste": "strat-operator-taste",
  "cai/graph": "cai-graph",
  "cai/intent": "cai-intent",
  "cai/attention": "cai-attention",
  "cai/continuity": "cai-continuity",
  "cai/trust-actions": "cai-trust-actions",
  "cai/chief-of-staff": "cai-chief-of-staff",
  "cai/timing": "cai-timing",
  "cai/relationships": "cai-relationships",
  "cai/digest": "cai-digest",
  "cai/modes": "cai-modes",
  "cai/interface": "cai-interface",
  "cai/opportunities": "cai-opportunities",
  "cai/memory": "cai-memory",
  "cai/boundaries": "cai-boundaries",
  "cai/signature": "cai-signature",
  "ecosystem/command": "ecosystem-command",
  "security/sessions": "security-sessions",
  "security/foundation": "security-foundation",
  "security/command-center": "security-command-center",
  "system-intelligence": "system-intelligence",
  "os-platform": "os-platform",
  "cloud-backbone": "cloud-backbone",
  "communication-hub": "communication-hub",
  "founder/command": "fcc-command",
  "founder/tasks": "fcc-tasks",
  "founder/cicd": "fcc-cicd",
  "founder/runbooks": "fcc-runbooks",
  "founder/dashboard": "fcc-dashboard",
  "founder/programs": "fcc-programs",
  "founder/cost": "fcc-cost",
  "founder/sync-ops": "fcc-sync-ops",
  "founder/security": "fcc-security",
  "founder/oversight": "fcc-oversight",
  "founder/incidents": "fcc-incidents",
  "founder/knowledge": "fcc-knowledge",
  "engineering/validation": "sre-validation",
  "engineering/builder-critic": "sre-builder-critic",
  "engineering/simulation": "sre-simulation",
  "engineering/standards": "sre-standards",
  "engineering/chaos": "sre-chaos",
  "engineering/rollback": "sre-rollback",
  "engineering/version-intel": "sre-version-intel",
  "engineering/optimization": "sre-optimization",
};

export function pathToModuleId(adminPath: string): string {
  // Strip "/admin/" prefix
  const sub = adminPath.replace(/^\/admin\//, "");
  return PATH_TO_MODULE[sub] || "dashboard";
}

// ── Component ──
export function MissionControlAppShell() {
  const [activeModule, setActiveModule] = useState<string>(
    () => (window as any).__missionControlInitialModule || "dashboard"
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    NAV_GROUPS.forEach(g => {
      init[g.title] = g.defaultOpen ?? false;
      if (g.items.some(item => item.moduleId === ((window as any).__missionControlInitialModule || "dashboard"))) {
        init[g.title] = true;
      }
    });
    return init;
  });
  const [searchQuery, setSearchQuery] = useState("");

  // Listen for deep-link navigation events
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.module) {
        setActiveModule(detail.module);
        // Auto-open containing group
        NAV_GROUPS.forEach(g => {
          if (g.items.some(item => item.moduleId === detail.module)) {
            setOpenGroups(prev => ({ ...prev, [g.title]: true }));
          }
        });
      }
    };
    window.addEventListener("sita-mission-control-navigate", handler);
    return () => window.removeEventListener("sita-mission-control-navigate", handler);
  }, []);

  const toggleGroup = useCallback((title: string) => {
    setOpenGroups(prev => ({ ...prev, [title]: !prev[title] }));
  }, []);

  const ModuleComponent = MODULE_MAP[activeModule];

  // Find current module label for breadcrumb
  const currentLabel = useMemo(() => {
    for (const g of NAV_GROUPS) {
      const item = g.items.find(i => i.moduleId === activeModule);
      if (item) return item.label;
    }
    return "Dashboard";
  }, [activeModule]);

  // Filtered groups for search
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return NAV_GROUPS;
    const q = searchQuery.toLowerCase();
    return NAV_GROUPS.map(g => ({
      ...g,
      items: g.items.filter(i => i.label.toLowerCase().includes(q) || i.moduleId.includes(q)),
    })).filter(g => g.items.length > 0);
  }, [searchQuery]);

  return (
    <div className="flex h-full w-full overflow-hidden rounded-b-xl bg-background/95 backdrop-blur-3xl">
      {/* Sidebar */}
      <div
        className={cn(
          "flex flex-col shrink-0 border-r border-border/20 bg-card/40 backdrop-blur-xl transition-all duration-200",
          sidebarCollapsed ? "w-12" : "w-56"
        )}
      >
        {/* Sidebar header */}
        <div className="px-2 py-2.5 border-b border-border/15 flex items-center gap-2">
          {!sidebarCollapsed && (
            <>
              <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="text-[11px] font-semibold text-foreground tracking-tight truncate">Mission Control</span>
            </>
          )}
          <button
            onClick={() => setSidebarCollapsed(c => !c)}
            className={cn("p-1 hover:bg-muted/40 rounded transition-colors", sidebarCollapsed && "mx-auto")}
          >
            {sidebarCollapsed ? (
              <PanelLeft className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <PanelLeftClose className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
            )}
          </button>
        </div>

        {/* Environment badge */}
        {!sidebarCollapsed && (
          <div className="px-2 py-1.5 border-b border-border/10">
            <Badge variant="outline" className="text-[8px] h-3.5 w-full justify-center bg-primary/5 text-primary border-primary/20">
              Production Environment
            </Badge>
          </div>
        )}

        {/* Search */}
        {!sidebarCollapsed && (
          <div className="px-2 py-1.5 border-b border-border/10">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/20 border border-border/10">
              <Search className="h-3 w-3 text-muted-foreground shrink-0" />
              <input
                type="text"
                placeholder="Search modules..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-[11px] text-foreground placeholder:text-muted-foreground/60 outline-none"
              />
            </div>
          </div>
        )}

        {/* Nav */}
        <div className="flex-1 overflow-y-auto py-1 scrollbar-thin">
          {sidebarCollapsed ? (
            // Collapsed: icon-only
            <div className="flex flex-col items-center gap-0.5 px-1">
              {NAV_GROUPS.flatMap(g => g.items).slice(0, 16).map(item => (
                <button
                  key={item.moduleId}
                  onClick={() => setActiveModule(item.moduleId)}
                  title={item.label}
                  className={cn(
                    "p-1.5 rounded-md transition-colors relative",
                    activeModule === item.moduleId
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                  )}
                >
                  <item.icon className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>
          ) : (
            // Expanded: full sidebar
            filteredGroups.map(group => (
              <div key={group.title}>
                <button
                  onClick={() => toggleGroup(group.title)}
                  className="w-full px-2.5 py-1 flex items-center justify-between hover:bg-muted/15 transition-colors"
                >
                  <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider truncate">{group.title}</span>
                  {openGroups[group.title] ? (
                    <ChevronDown className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
                  )}
                </button>
                <AnimatePresence>
                  {openGroups[group.title] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-px pb-0.5">
                        {group.items.map(item => (
                          <button
                            key={item.moduleId}
                            onClick={() => setActiveModule(item.moduleId)}
                            className={cn(
                              "w-full mx-1 px-2 py-1 rounded-md flex items-center gap-2 text-[11px] transition-all text-left",
                              activeModule === item.moduleId
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-muted-foreground hover:bg-muted/20 hover:text-foreground"
                            )}
                            style={{ maxWidth: "calc(100% - 8px)" }}
                          >
                            <item.icon className="h-3 w-3 shrink-0" />
                            <span className="truncate">{item.label}</span>
                            {item.badge !== undefined && Number(item.badge) > 0 && (
                              <Badge variant="destructive" className="text-[7px] h-3.5 px-1 ml-auto">{item.badge}</Badge>
                            )}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          )}
        </div>

        {/* Sidebar footer */}
        {!sidebarCollapsed && (
          <div className="px-2 py-1.5 border-t border-border/15 space-y-px">
            <button
              onClick={() => setActiveModule("system")}
              className="w-full flex items-center gap-2 px-2 py-1 rounded-md text-[11px] text-muted-foreground hover:bg-muted/20 hover:text-foreground transition-colors"
            >
              <Settings className="h-3 w-3" />
              <span>Platform Settings</span>
            </button>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Breadcrumb bar */}
        <div className="h-8 border-b border-border/15 bg-card/20 flex items-center px-3 gap-2 shrink-0">
          <span className="text-[10px] text-muted-foreground">Mission Control</span>
          <ChevronRight className="h-2.5 w-2.5 text-muted-foreground/50" />
          <span className="text-[10px] font-medium text-foreground">{currentLabel}</span>
        </div>

        {/* Module content */}
        <div className="flex-1 overflow-y-auto">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-64">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            }
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeModule}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="min-h-full"
              >
                {ModuleComponent ? <ModuleComponent /> : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
                    Module not found: {activeModule}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </Suspense>
        </div>
      </div>
    </div>
  );
}
