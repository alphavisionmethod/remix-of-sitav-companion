import { Route, Navigate } from "react-router-dom";
import { lazy } from "react";
import { PermissionGatedRoute } from "@/components/auth/PermissionGatedRoute";
import { WorkflowStepStub } from "@/components/admin/hubs/WorkflowStepStub";
import AdminRootLanding from "@/routes/AdminRootLanding";
import { ADMIN_REDIRECTS } from "@/admin/redirects/admin-redirect-map";

/** Helper to wrap a page element with a permission gate */
function gated(permission: string, element: React.ReactNode) {
  return <PermissionGatedRoute permission={permission}>{element}</PermissionGatedRoute>;
}

// ── ECO: Ecosystem Orchestrator ──
const ECO01EcosystemCommand = lazy(() => import("@/pages/admin/ECO01EcosystemCommand"));
const SEC01SessionSecrets = lazy(() => import("@/pages/admin/SEC01SessionSecrets"));
const SEC02SecurityFoundation = lazy(() => import("@/pages/admin/SEC02SecurityFoundation"));
const SYS01SystemIntelligence = lazy(() => import("@/pages/admin/SYS01SystemIntelligence"));
const OS01PlatformCommandCenter = lazy(() => import("@/pages/admin/OS01PlatformCommandCenter"));
const SecurityCommandCenter = lazy(() => import("@/pages/admin/SecurityCommandCenter"));
const CloudBackboneAdmin = lazy(() => import("@/pages/admin/cloud/CloudBackboneAdmin"));

// ── MC: Mission Control Module Pages ──
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

// ── MC: Authority & Control Module Pages ──
const MCAuthorityMatrix = lazy(() => import("@/pages/admin/modules/MCAuthorityMatrix"));
const MCControlReceipts = lazy(() => import("@/pages/admin/modules/MCControlReceipts"));
const MCEmergencyAuthority = lazy(() => import("@/pages/admin/modules/MCEmergencyAuthority"));
const MCPlatformAdaptation = lazy(() => import("@/pages/admin/modules/MCPlatformAdaptation"));
const MCStateAuthority = lazy(() => import("@/pages/admin/modules/MCStateAuthority"));

// ── MC: Architecture Governance Module Pages ──
const MCArchitectureDashboard = lazy(() => import("@/pages/admin/modules/MCArchitectureDashboard"));
const MCFeatureOwnership = lazy(() => import("@/pages/admin/modules/MCFeatureOwnership"));
const MCCommandRouting = lazy(() => import("@/pages/admin/modules/MCCommandRouting"));
const MCAIOrchestration = lazy(() => import("@/pages/admin/modules/MCAIOrchestration"));
const KnowledgeSpineBoard = lazy(() => import("@/pages/admin/architecture/KnowledgeSpineBoard"));
const SemanticSpineBoard = lazy(() => import("@/pages/admin/architecture/SemanticSpineBoard"));
const LiveCortexBoard = lazy(() => import("@/pages/admin/architecture/LiveCortexBoard"));
const MCModuleRegistry = lazy(() => import("@/pages/admin/modules/MCModuleRegistry"));
const MCApprovalFlow = lazy(() => import("@/pages/admin/modules/MCApprovalFlow"));
const MCFailureRecovery = lazy(() => import("@/pages/admin/modules/MCFailureRecovery"));
const MCEventRouting = lazy(() => import("@/pages/admin/modules/MCEventRouting"));
const MCArchitectureTests = lazy(() => import("@/pages/admin/modules/MCArchitectureTests"));

const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const TeamManagement = lazy(() => import("@/pages/admin/TeamManagement"));
const SystemManagement = lazy(() => import("@/pages/admin/SystemManagement"));
const UserManagement = lazy(() => import("@/pages/admin/UserManagement"));
const AITokenDashboard = lazy(() => import("@/pages/admin/AITokenDashboard"));
const GeneratedTruthDashboard = lazy(() => import("@/pages/admin/GeneratedTruthDashboard"));
const RuntimeTierGovernanceDashboard = lazy(() => import("@/pages/admin/RuntimeTierGovernanceDashboard"));
const FleetHealthPage = lazy(() => import("@/pages/admin/FleetHealthPage"));
const BackendTopologyDashboard = lazy(() => import("@/pages/admin/BackendTopologyDashboard"));
const DbTruthExplorer = lazy(() => import("@/pages/admin/DbTruthExplorer"));

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

const AIG01ProviderRegistry = lazy(() => import("@/pages/admin/AIG01ProviderRegistry"));
const AIG02ModelRegistry = lazy(() => import("@/pages/admin/AIG02ModelRegistry"));
const AIG03RoutingMatrix = lazy(() => import("@/pages/admin/AIG03RoutingMatrix"));
const AIG04BudgetCenter = lazy(() => import("@/pages/admin/AIG04BudgetCenter"));
const AIG05ReceiptsExplorer = lazy(() => import("@/pages/admin/AIG05ReceiptsExplorer"));
const AIG06LaunchTruth = lazy(() => import("@/pages/admin/AIG06LaunchTruth"));
const AIG07LaunchTruth = lazy(() => import("@/pages/admin/AIG07LaunchTruth"));
const AIG08DegradedDiagnostics = lazy(() => import("@/pages/admin/AIG08DegradedDiagnostics"));
const AIG09RuntimeVerification = lazy(() => import("@/pages/admin/AIG09RuntimeVerification"));

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
const TruthIndexDashboard = lazy(() => import("@/pages/admin/TruthIndexDashboard"));

// ── CAI: Coordinated Ambient Intelligence Operator Consoles ──
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

// ── Communication Hub ──
const CommunicationHub = lazy(() => import("@/pages/admin/CommunicationHub"));

// ── FCC: Founder Command Control ──
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

// ── SRE: Engineering Governance ──
const SRE01ValidationCenter = lazy(() => import("@/pages/admin/SRE01ValidationCenter"));
const SRE02BuilderCriticConsole = lazy(() => import("@/pages/admin/SRE02BuilderCriticConsole"));
const SRE03SimulationLab = lazy(() => import("@/pages/admin/SRE03SimulationLab"));
const SRE04CodeStandardsTestGen = lazy(() => import("@/pages/admin/SRE04CodeStandardsTestGen"));
const SRE05ChaosTestingFramework = lazy(() => import("@/pages/admin/SRE05ChaosTestingFramework"));
const SRE06AutoRollbackCenter = lazy(() => import("@/pages/admin/SRE06AutoRollbackCenter"));
const SRE07VersionIntelligence = lazy(() => import("@/pages/admin/SRE07VersionIntelligence"));
const SRE08SelfOptimizationBudgets = lazy(() => import("@/pages/admin/SRE08SelfOptimizationBudgets"));

// ── BOA: Board of Advisors Admin ──
const AdvisorBoardCatalog = lazy(() => import("@/pages/admin/AdvisorBoardCatalog"));
const AdvisorRecommendationMonitor = lazy(() => import("@/pages/admin/AdvisorRecommendationMonitor"));
const AdvisorActionApprovalAdmin = lazy(() => import("@/pages/admin/AdvisorActionApprovalAdmin"));
const AdvisorMemoryInspectorAdmin = lazy(() => import("@/pages/admin/AdvisorMemoryInspector"));
const AdvisorAutonomyPolicyEditor = lazy(() => import("@/pages/admin/AdvisorAutonomyPolicyEditor"));
const AdvisorProfitabilityDashboard = lazy(() => import("@/pages/admin/AdvisorProfitabilityDashboard"));

// ── Control Domain Admin Pages ──
const ReleaseEngineeringPage = lazy(() => import("@/pages/admin/ReleaseEngineeringPage"));
const GraphIntelligencePage = lazy(() => import("@/pages/admin/GraphIntelligencePage"));
const AIGovernancePage = lazy(() => import("@/pages/admin/AIGovernancePage"));
const SimulationCenterPage = lazy(() => import("@/pages/admin/SimulationCenterPage"));
// MobileParityDashboard + MOB01StoreReadinessCenter archived (Ubuntu-native canonical).
// Routes redirected to /admin/web/deployability + /admin/desktop/deployability.
const WEB01DeployabilityCenter = lazy(() => import("@/pages/admin/WEB01DeployabilityCenter"));
const DSK01DeployabilityCenter = lazy(() => import("@/pages/admin/DSK01DeployabilityCenter"));
const APP01ApplianceDeployabilityCenter = lazy(() => import("@/pages/admin/APP01ApplianceDeployabilityCenter"));
const BAP01BackendApiDeployabilityCenter = lazy(() => import("@/pages/admin/BAP01BackendApiDeployabilityCenter"));
const EFH01EdgeFunctionHealthCenter = lazy(() => import("@/pages/admin/EFH01EdgeFunctionHealthCenter"));

// ── Phase 3 + Phase 25: Canonical Domain Hubs (12-domain IA) ──
const OverviewHome = lazy(() => import("@/pages/admin/overview/OverviewHome"));
const AlertsHome = lazy(() => import("@/pages/admin/alerts/AlertsHome"));
const ApprovalsHome = lazy(() => import("@/pages/admin/approvals/ApprovalsHome"));
const EnvironmentsHome = lazy(() => import("@/pages/admin/environments/EnvironmentsHome"));
const ReleasesHome = lazy(() => import("@/pages/admin/releases/ReleasesHome"));
const SupportHome = lazy(() => import("@/pages/admin/support/SupportHome"));
const AdminRecoveryOperations = lazy(() => import("@/pages/admin/support/AdminRecoveryOperations"));
const EnvironmentConfigVerification = lazy(() => import("@/pages/admin/releases/EnvironmentConfigVerification"));
const HealthHome = lazy(() => import("@/pages/admin/health/HealthHome"));
const ErrorPatrolBoard = lazy(() => import("@/pages/admin/health/ErrorPatrolBoard"));
const TrustSecurityHome = lazy(() => import("@/pages/admin/trust-security/TrustSecurityHome"));
const VerificationHome = lazy(() => import("@/pages/admin/verification/VerificationHome"));
const CrossDomainCoherence = lazy(() => import("@/pages/admin/verification/CrossDomainCoherence"));
const SelfHealRunsDashboard = lazy(() => import("@/pages/admin/verification/SelfHealRunsDashboard"));
const CostSpotlight = lazy(() => import("@/pages/admin/health/CostSpotlight"));
const SbomHistory = lazy(() => import("@/pages/admin/releases/SbomHistory"));
const AIRuntimeHome = lazy(() => import("@/pages/admin/ai-runtime/AIRuntimeHome"));
const InternalAgentIntentTimeline = lazy(() => import("@/pages/admin/ai-runtime/InternalAgentIntentTimeline"));
const ReflectionBoard = lazy(() => import("@/pages/admin/ai-runtime/ReflectionBoard"));
const SuggestionsBoard = lazy(() => import("@/pages/admin/ai-runtime/SuggestionsBoard"));
const WeeklyDigestBoard = lazy(() => import("@/pages/admin/ai-runtime/WeeklyDigestBoard"));
const DependencyFindingsBoard = lazy(() => import("@/pages/admin/ai-runtime/DependencyFindingsBoard"));
const PolicyDraftReviewBoard = lazy(() => import("@/pages/admin/ai-runtime/PolicyDraftReviewBoard"));
const TrustLadderBoard = lazy(() => import("@/pages/admin/ai-runtime/TrustLadderBoard"));
const CrossCouncilBoard = lazy(() => import("@/pages/admin/ai-runtime/CrossCouncilBoard"));
const SLOObservabilityBoard = lazy(() => import("@/pages/admin/ai-runtime/SLOObservabilityBoard"));
const OwnerCopilotBriefings = lazy(() => import("@/pages/admin/ai-runtime/OwnerCopilotBriefings"));
const OwnerCopilotSessionConsole = lazy(() => import("@/pages/admin/ai-runtime/OwnerCopilotSessionConsole"));
const ProductionLaunchAttestationConsole = lazy(() => import("@/pages/admin/ai-runtime/ProductionLaunchAttestationConsole"));
const BoardroomSLADrillDown = lazy(() => import("@/pages/admin/ai-runtime/BoardroomSLADrillDown"));
const TenantFederationBoard = lazy(() => import("@/pages/admin/ai-runtime/TenantFederationBoard"));
// ── Phase 8: Continuous Assurance, External API, Knowledge Federation ──
const AssuranceChaosBoard = lazy(() => import("@/pages/admin/ai-runtime/AssuranceChaosBoard"));
const ExternalWorkforceApiBoard = lazy(() => import("@/pages/admin/ai-runtime/ExternalWorkforceApiBoard"));
const KnowledgeFederationBoard = lazy(() => import("@/pages/admin/ai-runtime/KnowledgeFederationBoard"));
const SovereignDeploymentDRBoard = lazy(() => import("@/pages/admin/ai-runtime/SovereignDeploymentDRBoard"));
const ComplianceAttestationBoard = lazy(() => import("@/pages/admin/ai-runtime/ComplianceAttestationBoard"));
const TenantSelfServiceConsole = lazy(() => import("@/pages/tenant/TenantSelfServiceConsole"));
const IntegrationsHome = lazy(() => import("@/pages/admin/integrations/IntegrationsHome"));
const ConfigHome = lazy(() => import("@/pages/admin/config/ConfigHome"));

// ── Phase 25: Workflow step pages (real or aliased) ──
const LaunchReadinessBoard = lazy(() => import("@/pages/admin/LaunchReadinessBoard"));
const LaunchHonestyBoard = lazy(() => import("@/pages/admin/LaunchHonestyBoard"));
const AdminDeploymentRings = lazy(() => import("@/pages/admin/AdminDeploymentRings"));
const AuditComplianceWorkspace = lazy(() => import("@/pages/admin/AuditComplianceWorkspace"));

// ── Phase 7: Meta-Architecture Surfaces ──
const META01ArchitectureAtlas = lazy(() => import("@/pages/admin/META01ArchitectureAtlas"));
const META02ControlPlaneCenter = lazy(() => import("@/pages/admin/META02ControlPlaneCenter"));
const META03GoldenPathHealth = lazy(() => import("@/pages/admin/META03GoldenPathHealth"));

// ── Phase 8/9/10: CI Umbrella + Product Reality + Completeness ──
const CI01CIUmbrellaCenter = lazy(() => import("@/pages/admin/CI01CIUmbrellaCenter"));
const META04ProductReality = lazy(() => import("@/pages/admin/META04ProductReality"));
const META05CompletenessMatrix = lazy(() => import("@/pages/admin/META05CompletenessMatrix"));

// ── Phase 27: Kill-Switch & Safety Center (canonical mount) ──
const AR08KillSwitchCenter = lazy(() => import("@/pages/admin/AR08KillSwitchCenter"));
const AdminRunbookViewerPage = lazy(() => import("@/pages/admin/AdminRunbookViewerPage"));

// ── C-014: Data Retention Dashboard ──
const DataRetentionDashboard = lazy(() => import("@/pages/admin/DataRetentionDashboard"));

// ── C-020: User Seed Health Dashboard ──
const UserSeedHealth = lazy(() => import("@/pages/admin/UserSeedHealth"));

// ── Phase 33: Platform Readiness + Live Incident Dashboard ──
const PlatformReadinessScorecard = lazy(() => import("@/pages/admin/PlatformReadinessScorecard"));
const IncidentDashboardPage = lazy(() => import("@/pages/admin/IncidentDashboardPage"));
const SLAMonitoringDashboard = lazy(() => import("@/pages/admin/SLAMonitoringDashboard"));

// ── Alert Simulation Lab ──
const AlertSimulationLab = lazy(() => import("@/pages/admin/AlertSimulationLab"));

// ── Admin Consolidation Explorer ──
const AdminConsolidationExplorer = lazy(() => import("@/pages/admin/AdminConsolidationExplorer"));

// ── Performance Dashboard ──
const AdminPerformanceDashboard = lazy(() => import("@/pages/admin/AdminPerformanceDashboard"));

// ── Data Source Debug ──
const DataSourceDebugPage = lazy(() => import("@/pages/admin/DataSourceDebugPage"));

export function getAdminRoutes() {
  return [
    // ── Phase 3: Canonical Domain Hubs (12-domain IA) ──
    <Route key="hub-overview" path="/admin/overview" element={<OverviewHome />} />,
    <Route key="hub-alerts" path="/admin/alerts" element={<AlertsHome />} />,
    <Route key="alert-sim-lab" path="/admin/alerts/simulation" element={<AlertSimulationLab />} />,
    <Route key="hub-approvals" path="/admin/approvals" element={gated("support.grant", <ApprovalsHome />)} />,
    <Route key="consolidation-explorer" path="/admin/consolidation" element={gated("audit.view", <AdminConsolidationExplorer />)} />,
    <Route key="perf-dashboard" path="/admin/performance" element={gated("audit.view", <AdminPerformanceDashboard />)} />,
    <Route key="data-source-debug" path="/admin/data-source-debug" element={gated("audit.view", <DataSourceDebugPage />)} />,
    <Route key="hub-environments" path="/admin/environments" element={gated("users.view", <EnvironmentsHome />)} />,
    <Route key="hub-releases" path="/admin/releases" element={gated("audit.view", <ReleasesHome />)} />,
    <Route key="hub-support" path="/admin/support" element={gated("support.view", <SupportHome />)} />,
    <Route key="hub-health" path="/admin/health" element={gated("maintenance.view", <HealthHome />)} />,
    <Route key="hub-trustsec" path="/admin/trust-security" element={gated("audit.view", <TrustSecurityHome />)} />,
    <Route key="hub-verification" path="/admin/verification" element={gated("audit.view", <VerificationHome />)} />,
    <Route key="hub-airuntime" path="/admin/ai-runtime" element={gated("flags.view", <AIRuntimeHome />)} />,
    <Route key="ws-airuntime-intents" path="/admin/ai-runtime/internal-agent-intents" element={gated("audit.view", <InternalAgentIntentTimeline />)} />,
    <Route key="ws-airuntime-reflection" path="/admin/ai-runtime/reflection-board" element={gated("audit.view", <ReflectionBoard />)} />,
    <Route key="ws-airuntime-suggestions" path="/admin/ai-runtime/suggestions" element={gated("audit.view", <SuggestionsBoard />)} />,
    <Route key="ws-airuntime-weekly-digest" path="/admin/ai-runtime/weekly-digest" element={gated("audit.view", <WeeklyDigestBoard />)} />,
    <Route key="ws-airuntime-dep-findings" path="/admin/ai-runtime/dependency-findings" element={gated("audit.view", <DependencyFindingsBoard />)} />,
    <Route key="ws-airuntime-policy-drafts" path="/admin/ai-runtime/policy-drafts" element={gated("audit.view", <PolicyDraftReviewBoard />)} />,
    <Route key="ws-airuntime-trust-ladder" path="/admin/ai-runtime/trust-ladder" element={gated("audit.view", <TrustLadderBoard />)} />,
    <Route key="ws-airuntime-cross-council" path="/admin/ai-runtime/cross-council" element={gated("audit.view", <CrossCouncilBoard />)} />,
    <Route key="ws-airuntime-observatory" path="/admin/ai-runtime/observatory" element={gated("audit.view", <SLOObservabilityBoard />)} />,
    <Route key="ws-airuntime-owner-copilot" path="/admin/ai-runtime/owner-copilot" element={gated("audit.view", <OwnerCopilotBriefings />)} />,
    <Route key="ws-airuntime-owner-copilot-sessions" path="/admin/ai-runtime/owner-copilot-sessions" element={gated("audit.view", <OwnerCopilotSessionConsole />)} />,
    <Route key="ws-airuntime-launch-attestation" path="/admin/ai-runtime/launch-attestation" element={gated("audit.view", <ProductionLaunchAttestationConsole />)} />,
    <Route key="ws-airuntime-boardroom-sla" path="/admin/ai-runtime/boardroom-sla" element={gated("audit.view", <BoardroomSLADrillDown />)} />,
    <Route key="ws-airuntime-tenant-federation" path="/admin/ai-runtime/tenant-federation" element={gated("flags.rollout", <TenantFederationBoard />)} />,
    <Route key="ws-airuntime-assurance" path="/admin/ai-runtime/assurance" element={gated("audit.view", <AssuranceChaosBoard />)} />,
    <Route key="ws-airuntime-external-api" path="/admin/ai-runtime/external-api" element={gated("flags.rollout", <ExternalWorkforceApiBoard />)} />,
    <Route key="ws-airuntime-federation" path="/admin/ai-runtime/federation" element={gated("flags.rollout", <KnowledgeFederationBoard />)} />,
    <Route key="ws-airuntime-sovereign-dr" path="/admin/ai-runtime/sovereign-dr" element={gated("flags.rollout", <SovereignDeploymentDRBoard />)} />,
    <Route key="ws-airuntime-compliance" path="/admin/ai-runtime/compliance" element={gated("audit.view", <ComplianceAttestationBoard />)} />,
    <Route key="ws-tenant-self-service" path="/admin/tenant-console" element={gated("audit.view", <TenantSelfServiceConsole />)} />,
    <Route key="hub-integrations" path="/admin/integrations" element={gated("maintenance.view", <IntegrationsHome />)} />,
    <Route key="hub-config" path="/admin/config" element={gated("maintenance.view", <ConfigHome />)} />,
    // /admin → profile-aware landing (operator → OperatorHome, user → /admin/overview)
    <Route key="hub-root" path="/admin" element={<AdminRootLanding />} />,

    // ── Phase 25: Workflow step routes (every OwnerWorkflow step resolves) ──
    <Route key="ws-daily-incidents" path="/admin/health/incidents" element={gated("maintenance.view", <MCIncidents />)} />,
    <Route key="ws-health-error-patrol" path="/admin/health/error-patrol" element={gated("maintenance.view", <ErrorPatrolBoard />)} />,
    <Route key="ws-daily-launchready" path="/admin/releases/launch-readiness" element={gated("audit.view", <LaunchReadinessBoard />)} />,
    <Route key="ws-weekly-truth" path="/admin/overview/generated-truth" element={<Navigate to="/admin/generated-truth" replace />} />,
    <Route key="ws-weekly-aieff" path="/admin/ai-runtime/intelligence/efficiency" element={<Navigate to="/admin/intelligence/efficiency" replace />} />,
    <Route key="ws-weekly-honesty" path="/admin/verification/launch-honesty" element={gated("audit.view", <LaunchHonestyBoard />)} />,
    <Route key="ws-verification-cross-domain" path="/admin/verification/cross-domain-coherence" element={gated("audit.view", <CrossDomainCoherence />)} />,
    <Route key="ws-verification-self-heal" path="/admin/verification/self-heal" element={gated("audit.view", <SelfHealRunsDashboard />)} />,
    <Route key="ws-health-cost-spotlight" path="/admin/health/cost-spotlight" element={gated("maintenance.view", <CostSpotlight />)} />,
    <Route key="ws-releases-sbom-history" path="/admin/releases/sbom-history" element={gated("audit.view", <SbomHistory />)} />,
    <Route key="ws-weekly-costs" path="/admin/ai-runtime/costs" element={<Navigate to="/admin/ai-team/cost" replace />} />,
    <Route key="ws-support-users" path="/admin/environments/users" element={<Navigate to="/admin/users" replace />} />,
    <Route key="ws-support-devices" path="/admin/environments/devices" element={<Navigate to="/admin/mc/devices" replace />} />,
    <Route key="ws-support-intstate" path="/admin/environments/integration-state" element={gated("users.view", <WorkflowStepStub domain="integrations" heading="Integration State" intent="Inspect integration state for the selected environment." />)} />,
    <Route key="ws-support-wfstate" path="/admin/environments/workflow-state" element={gated("users.view", <WorkflowStepStub domain="environments" heading="Workflow State" intent="Inspect workflow status for the selected environment." />)} />,
    <Route key="ws-support-cases" path="/admin/support/cases" element={<Navigate to="/admin/mc/support" replace />} />,
    <Route key="ws-support-replay" path="/admin/support/replay" element={gated("support.view", <WorkflowStepStub domain="support" heading="Session Replay" intent="Replay an environment session for diagnosis." />)} />,
    <Route key="ws-support-recovery" path="/admin/support/recovery" element={gated("support.view", <MCFailureRecovery />)} />,
    <Route key="ws-support-recovery-ops" path="/admin/support/recovery-ops" element={gated("support.view", <AdminRecoveryOperations />)} />,
    <Route key="ws-env-config" path="/admin/releases/env-config" element={gated("audit.view", <EnvironmentConfigVerification />)} />,
    <Route key="ws-rel-mobile" path="/admin/releases/mobile-parity" element={<Navigate to="/admin/web/deployability" replace />} />,
    <Route key="ws-rel-rings" path="/admin/releases/deployment-rings" element={gated("flags.rollout", <AdminDeploymentRings />)} />,
    <Route key="ws-rel-rollback" path="/admin/releases/rollback" element={<Navigate to="/admin/engineering/rollback" replace />} />,
    <Route key="ws-ts-policies" path="/admin/trust-security/policies" element={<Navigate to="/admin/mc/policies" replace />} />,
    <Route key="ws-ts-proofs" path="/admin/trust-security/proofs" element={<Navigate to="/admin/mc/control-receipts" replace />} />,
    <Route key="ws-ts-perms" path="/admin/trust-security/permissions" element={<Navigate to="/admin/mc/authority-matrix" replace />} />,
    <Route key="ws-ts-sensitive" path="/admin/trust-security/sensitive-actions" element={<Navigate to="/admin/mc/state-authority" replace />} />,
    <Route key="ws-ts-audit" path="/admin/trust-security/audit" element={gated("audit.view", <AuditComplianceWorkspace />)} />,
    <Route key="ws-ts-retention" path="/admin/data-retention" element={gated("audit.view", <DataRetentionDashboard />)} />,
    <Route key="ws-onboarding-seed-health" path="/admin/user-seed-health" element={gated("audit.view", <UserSeedHealth />)} />,

    // ── Phase 33: Platform Readiness Scorecard + Live Incident Dashboard ──
    <Route key="phase33-readiness" path="/admin/readiness" element={gated("audit.view", <PlatformReadinessScorecard />)} />,
    <Route key="phase33-incidents-dashboard" path="/admin/incidents/dashboard" element={gated("maintenance.view", <IncidentDashboardPage />)} />,
    <Route key="sla-monitoring" path="/admin/sla-monitoring" element={gated("maintenance.view", <SLAMonitoringDashboard />)} />,

    // ── Phase 7: Meta-Architecture Surfaces ──
    <Route key="meta-arch-root" path="/admin/meta-arch" element={<Navigate to="/admin/meta-arch/atlas" replace />} />,
    <Route key="meta01" path="/admin/meta-arch/atlas" element={gated("audit.view", <META01ArchitectureAtlas />)} />,
    <Route key="meta02" path="/admin/meta-arch/control-plane" element={gated("audit.view", <META02ControlPlaneCenter />)} />,
    <Route key="meta03" path="/admin/meta-arch/golden-paths" element={gated("audit.view", <META03GoldenPathHealth />)} />,
    <Route key="meta04" path="/admin/meta/reality" element={gated("audit.view", <META04ProductReality />)} />,
    <Route key="meta05" path="/admin/meta/completeness" element={gated("audit.view", <META05CompletenessMatrix />)} />,

    // ── Phase 8: CI Umbrella ──
    <Route key="ci01" path="/admin/ci/umbrella" element={gated("audit.view", <CI01CIUmbrellaCenter />)} />,

    <Route key="a1" path="/admin/generated-truth" element={gated("audit.view", <GeneratedTruthDashboard />)} />,
    <Route key="a1b" path="/admin/runtime-tier-governance" element={gated("audit.view", <RuntimeTierGovernanceDashboard />)} />,
    <Route key="a2" path="/admin/fleet-health" element={gated("maintenance.view", <FleetHealthPage />)} />,
    <Route key="a3" path="/admin/dashboard" element={<AdminDashboard />} />,
    <Route key="a4" path="/admin/team" element={gated("users.view", <TeamManagement />)} />,
    <Route key="a5" path="/admin/system" element={gated("maintenance.view", <SystemManagement />)} />,
    <Route key="a6" path="/admin/users" element={gated("users.view", <UserManagement />)} />,
    <Route key="a7" path="/admin/ai-tokens" element={gated("flags.view", <AITokenDashboard />)} />,
    <Route key="a8" path="/admin/intelligence-efficiency" element={<Navigate to="/admin/intelligence/efficiency" replace />} />,
    <Route key="a9" path="/admin/truth-indices" element={gated("audit.view", <TruthIndexDashboard />)} />,
    // ── AI Team ──
    <Route key="a10" path="/admin/ai-team/overview" element={gated("flags.view", <AIT01TeamOverview />)} />,
    <Route key="a11" path="/admin/ai-team/roles" element={gated("flags.view", <AIT02RoleRegistry />)} />,
    <Route key="a12" path="/admin/ai-team/invoke" element={gated("flags.rollout", <AIT03TaskInvocation />)} />,
    <Route key="a13" path="/admin/ai-team/activity" element={gated("audit.view", <AIT04ActivityFeed />)} />,
    <Route key="a14" path="/admin/ai-team/cost" element={gated("flags.view", <AIT05CostEfficiency />)} />,
    <Route key="a15" path="/admin/ai-team/recommendations" element={gated("flags.view", <AIT06Recommendations />)} />,
    <Route key="a16" path="/admin/ai-team/approvals" element={gated("support.grant", <AIT07ApprovalQueue />)} />,
    <Route key="a17" path="/admin/ai-team/launch-truth" element={gated("audit.view", <AIT08LaunchTruth />)} />,
    <Route key="a18" path="/admin/ai-team/approval-queue" element={gated("support.grant", <HQApprovalQueue />)} />,
    <Route key="a19" path="/admin/ai-team/setup-checklist" element={gated("flags.view", <AITSetupChecklist />)} />,
    // ── Intelligence Layer ──
    <Route key="a20" path="/admin/intelligence/reuse" element={gated("audit.view", <IntelligenceReuseOverview />)} />,
    <Route key="a21" path="/admin/intelligence/assets" element={gated("audit.view", <IntelligenceAssetLibrary />)} />,
    <Route key="a22" path="/admin/intelligence/differential" element={gated("audit.view", <DifferentialReasoningExplorer />)} />,
    <Route key="a23" path="/admin/intelligence/packets" element={gated("audit.view", <IntelligencePacketInspector />)} />,
    <Route key="a24" path="/admin/intelligence/efficiency" element={gated("audit.view", <AIEfficiencyScoreboard />)} />,
    <Route key="a25" path="/admin/intelligence/outcomes" element={gated("audit.view", <OutcomeEconomicsBoard />)} />,
    <Route key="a26" path="/admin/intelligence/escalation" element={gated("support.view", <EscalationControlCenter />)} />,
    <Route key="a27" path="/admin/intelligence/patterns" element={gated("audit.view", <PatternLearningCenter />)} />,
    <Route key="a28" path="/admin/intelligence/prompts" element={gated("flags.view", <ZeroWastePromptView />)} />,
    <Route key="a29" path="/admin/intelligence/digests" element={gated("audit.view", <SmartDigestCenter />)} />,
    <Route key="a30" path="/admin/intelligence/cross-tenant" element={gated("policy.view", <CrossTenantGovernance />)} />,
    <Route key="a31b" path="/admin/intelligence/layer" element={gated("flags.view", <IntelligenceLayerAdmin />)} />,
    // ── AI Gateway ──
    <Route key="a31" path="/admin/ai-gateway/providers" element={gated("flags.view", <AIG01ProviderRegistry />)} />,
    <Route key="a32" path="/admin/ai-gateway/models" element={gated("flags.view", <AIG02ModelRegistry />)} />,
    <Route key="a33" path="/admin/ai-gateway/routing" element={gated("flags.rollout", <AIG03RoutingMatrix />)} />,
    <Route key="a34" path="/admin/ai-gateway/budget" element={gated("flags.view", <AIG04BudgetCenter />)} />,
    <Route key="a35" path="/admin/ai-gateway/receipts" element={gated("audit.view", <AIG05ReceiptsExplorer />)} />,
    <Route key="a36" path="/admin/ai-gateway/honesty" element={gated("audit.view", <AIG06LaunchTruth />)} />,
    <Route key="a37" path="/admin/ai-gateway/launch-truth" element={gated("audit.view", <AIG07LaunchTruth />)} />,
    <Route key="a38" path="/admin/ai-gateway/diagnostics" element={gated("maintenance.view", <AIG08DegradedDiagnostics />)} />,
    <Route key="a39" path="/admin/ai-gateway/verification" element={gated("audit.view", <AIG09RuntimeVerification />)} />,
    // ── Strategic Dashboards ──
    <Route key="a40" path="/admin/strategic/capital" element={gated("audit.view", <IntelligenceCapitalDashboard />)} />,
    <Route key="a41" path="/admin/strategic/cost-confidence" element={gated("audit.view", <CostToConfidenceDashboard />)} />,
    <Route key="a42" path="/admin/strategic/quality-floor" element={gated("audit.view", <QualityFloorDashboard />)} />,
    <Route key="a43" path="/admin/strategic/insurance" element={gated("audit.view", <IntelligenceInsuranceDashboard />)} />,
    <Route key="a44" path="/admin/strategic/market" element={gated("audit.view", <IntelligenceMarketDashboard />)} />,
    <Route key="a45" path="/admin/strategic/time-to-truth" element={gated("audit.view", <TimeToTruthDashboard />)} />,
    <Route key="a46" path="/admin/strategic/reasoning-replay" element={gated("audit.view", <ReasoningReplayDashboard />)} />,
    <Route key="a47" path="/admin/strategic/decay" element={gated("maintenance.view", <DecayMonitorDashboard />)} />,
    <Route key="a48" path="/admin/strategic/portfolio" element={gated("audit.view", <PortfolioAllocationDashboard />)} />,
    <Route key="a49" path="/admin/strategic/benchmark" element={gated("audit.view", <BenchmarkLabDashboard />)} />,
    <Route key="a50" path="/admin/strategic/value-risk" element={gated("audit.view", <ValueRiskDashboard />)} />,
    <Route key="a51" path="/admin/strategic/operator-taste" element={gated("audit.view", <OperatorTasteDashboard />)} />,
    // ── CAI: Coordinated Ambient Intelligence ──
    <Route key="cai01" path="/admin/cai/graph" element={gated("audit.view", <CAI01PersonalGraphExplorer />)} />,
    <Route key="cai02" path="/admin/cai/intent" element={gated("audit.view", <CAI02IntentTraceBoard />)} />,
    <Route key="cai03" path="/admin/cai/attention" element={gated("audit.view", <CAI03AttentionCenter />)} />,
    <Route key="cai04" path="/admin/cai/continuity" element={gated("sync.view", <CAI04ContinuityCenter />)} />,
    <Route key="cai05" path="/admin/cai/trust-actions" element={gated("audit.view", <CAI05TrustActionsBoard />)} />,
    <Route key="cai06" path="/admin/cai/chief-of-staff" element={gated("support.view", <CAI06ChiefOfStaffCenter />)} />,
    <Route key="cai07" path="/admin/cai/timing" element={gated("audit.view", <CAI07TimingStudio />)} />,
    <Route key="cai08" path="/admin/cai/relationships" element={gated("audit.view", <CAI08RelationshipCenter />)} />,
    <Route key="cai09" path="/admin/cai/digest" element={gated("audit.view", <CAI09DigestConsole />)} />,
    <Route key="cai10" path="/admin/cai/modes" element={gated("policy.view", <CAI10ModesCenter />)} />,
    <Route key="cai11" path="/admin/cai/interface" element={gated("audit.view", <CAI11InterfaceProfiler />)} />,
    <Route key="cai12" path="/admin/cai/opportunities" element={gated("audit.view", <CAI12OpportunityBoard />)} />,
    <Route key="cai13" path="/admin/cai/memory" element={gated("policy.view", <CAI13MemoryGovernance />)} />,
    <Route key="cai14" path="/admin/cai/boundaries" element={gated("policy.view", <CAI14BoundaryControl />)} />,
    <Route key="cai15" path="/admin/cai/signature" element={gated("audit.view", <CAI15SignatureStudio />)} />,
    // ── ECO: Ecosystem Orchestrator ──
    <Route key="eco01" path="/admin/ecosystem/command" element={gated("maintenance.view", <ECO01EcosystemCommand />)} />,
    // ── SEC: Session & Security ──
    <Route key="sec01" path="/admin/security/sessions" element={gated("audit.view", <SEC01SessionSecrets />)} />,
    <Route key="sec02" path="/admin/security/foundation" element={gated("audit.view", <SEC02SecurityFoundation />)} />,
    <Route key="sec03" path="/admin/security/command-center" element={gated("audit.view", <SecurityCommandCenter />)} />,
    // ── SYS: System Intelligence ──
    <Route key="sys01" path="/admin/system-intelligence" element={gated("maintenance.view", <SYS01SystemIntelligence />)} />,
    <Route key="os01" path="/admin/os-platform" element={gated("maintenance.view", <OS01PlatformCommandCenter />)} />,
    <Route key="cloud01" path="/admin/cloud-backbone" element={gated("storage.view", <CloudBackboneAdmin />)} />,
    // ── Communication Architecture Hub ──
    <Route key="comm-hub" path="/admin/communication-hub" element={gated("maintenance.view", <CommunicationHub />)} />,
    // ── FCC: Founder Command Control (Internal Execution Plane) ──
    <Route key="fcc01" path="/admin/founder/command" element={gated("maintenance.emergency", <FCC01FounderCommandConsole />)} />,
    <Route key="fcc02" path="/admin/founder/tasks" element={gated("maintenance.run", <FCC02TaskDecompositionGraph />)} />,
    <Route key="fcc03" path="/admin/founder/cicd" element={gated("maintenance.run", <FCC03CICDPipelineBoard />)} />,
    <Route key="fcc04" path="/admin/founder/runbooks" element={gated("maintenance.view", <FCC04RunbookCenter />)} />,
    <Route key="runbooks-canonical" path="/admin/support/runbooks" element={gated("maintenance.view", <FCC04RunbookCenter />)} />,
    <Route key="runbook-viewer" path="/admin/support/runbooks/:id" element={gated("maintenance.view", <AdminRunbookViewerPage />)} />,
    <Route key="fcc05" path="/admin/founder/dashboard" element={gated("maintenance.view", <FCC05FounderDashboard />)} />,
    <Route key="fcc06" path="/admin/founder/programs" element={gated("maintenance.run", <FCC06ProgramManagementBoard />)} />,
    <Route key="fcc07" path="/admin/founder/cost" element={gated("maintenance.view", <FCC07PlatformCostCapacity />)} />,
    <Route key="fcc08" path="/admin/founder/sync-ops" element={gated("sync.repair", <FCC08SyncStorageOps />)} />,
    <Route key="fcc09" path="/admin/founder/security" element={gated("audit.view", <FCC09SecurityRiskCenter />)} />,
    <Route key="fcc10" path="/admin/founder/oversight" element={gated("maintenance.emergency", <FCC10HumanOversightEscalation />)} />,
    <Route key="fcc11" path="/admin/founder/incidents" element={gated("maintenance.view", <FCC11IncidentResponseTimeline />)} />,
    <Route key="fcc12" path="/admin/founder/knowledge" element={gated("maintenance.view", <FCC12KnowledgeMemorySystem />)} />,
    // ── SRE: Engineering Governance (Internal Execution Plane) ──
    <Route key="sre01" path="/admin/engineering/validation" element={gated("maintenance.run", <SRE01ValidationCenter />)} />,
    <Route key="sre02" path="/admin/engineering/builder-critic" element={gated("maintenance.run", <SRE02BuilderCriticConsole />)} />,
    <Route key="sre03" path="/admin/engineering/simulation" element={gated("maintenance.run", <SRE03SimulationLab />)} />,
    <Route key="sre04" path="/admin/engineering/standards" element={gated("maintenance.view", <SRE04CodeStandardsTestGen />)} />,
    <Route key="sre05" path="/admin/engineering/chaos" element={gated("maintenance.emergency", <SRE05ChaosTestingFramework />)} />,
    <Route key="sre06" path="/admin/engineering/rollback" element={gated("maintenance.emergency", <SRE06AutoRollbackCenter />)} />,
    <Route key="sre07" path="/admin/engineering/version-intel" element={gated("maintenance.view", <SRE07VersionIntelligence />)} />,
    <Route key="sre08" path="/admin/engineering/optimization" element={gated("maintenance.view", <SRE08SelfOptimizationBudgets />)} />,
    // ── MC: Mission Control Module Pages ──
    <Route key="mc01" path="/admin/mc/devices" element={gated("maintenance.view", <MCDevicesCenter />)} />,
    <Route key="mc02" path="/admin/mc/storage" element={gated("storage.view", <MCStorageCenter />)} />,
    <Route key="mc03" path="/admin/mc/users" element={gated("users.view", <MCUsersCenter />)} />,
    <Route key="mc04" path="/admin/mc/workspaces" element={gated("sync.view", <MCWorkspacesContinuity />)} />,
    <Route key="mc05" path="/admin/mc/sync-cloud" element={gated("sync.view", <MCSyncCloud />)} />,
    <Route key="mc06" path="/admin/mc/jobs" element={gated("maintenance.view", <MCJobsMaintenance />)} />,
    <Route key="mc07" path="/admin/mc/trust-security" element={gated("audit.view", <MCTrustSecurity />)} />,
    <Route key="mc08" path="/admin/mc/releases" element={gated("flags.rollout", <MCReleasesUpdates />)} />,
    <Route key="mc09" path="/admin/mc/ai-control" element={gated("flags.view", <MCAIControl />)} />,
    <Route key="mc10" path="/admin/mc/incidents" element={gated("maintenance.view", <MCIncidents />)} />,
    <Route key="mc11" path="/admin/mc/policies" element={gated("policy.view", <MCPoliciesFlags />)} />,
    <Route key="mc12" path="/admin/mc/costs" element={gated("flags.view", <MCCostsAIBudgets />)} />,
    <Route key="mc13" path="/admin/mc/logs" element={gated("audit.view", <MCLogsAudit />)} />,
    <Route key="mc14" path="/admin/mc/support" element={gated("support.view", <MCSupport />)} />,
    <Route key="mc15" path="/admin/mc/knowledge" element={gated("maintenance.view", <MCKnowledgeBase />)} />,
    <Route key="mc16" path="/admin/mc/system-health" element={gated("maintenance.view", <MCSystemHealth />)} />,
    <Route key="mc17" path="/admin/mc/authority-matrix" element={gated("audit.view", <MCAuthorityMatrix />)} />,
    <Route key="mc18" path="/admin/mc/control-receipts" element={gated("audit.view", <MCControlReceipts />)} />,
    <Route key="mc19" path="/admin/mc/emergency" element={gated("maintenance.emergency", <MCEmergencyAuthority />)} />,
    <Route key="mc20" path="/admin/mc/platform-adaptation" element={gated("policy.view", <MCPlatformAdaptation />)} />,
    <Route key="mc21" path="/admin/mc/state-authority" element={gated("audit.view", <MCStateAuthority />)} />,
    // ── MC: Architecture Governance ──
    <Route key="mc-arch" path="/admin/mc/architecture" element={gated("audit.view", <MCArchitectureDashboard />)} />,
    <Route key="mc-arch-modules" path="/admin/architecture/modules" element={gated("audit.view", <MCModuleRegistry />)} />,
    <Route key="mc-ai-orch" path="/admin/architecture/ai-orchestration" element={gated("audit.view", <MCAIOrchestration />)} />,
    <Route key="mc-knowledge-spine" path="/admin/architecture/knowledge-spine" element={gated("audit.view", <KnowledgeSpineBoard />)} />,
    <Route key="mc-semantic-spine" path="/admin/architecture/semantic-spine" element={gated("audit.view", <SemanticSpineBoard />)} />,
    <Route key="mc22" path="/admin/mc/feature-ownership" element={gated("audit.view", <MCFeatureOwnership />)} />,
    <Route key="mc23" path="/admin/mc/command-routing" element={gated("audit.view", <MCCommandRouting />)} />,
    <Route key="mc24" path="/admin/mc/approval-flow" element={gated("audit.view", <MCApprovalFlow />)} />,
    <Route key="mc25" path="/admin/mc/failure-recovery" element={gated("audit.view", <MCFailureRecovery />)} />,
    <Route key="mc26" path="/admin/mc/event-routing" element={gated("audit.view", <MCEventRouting />)} />,
    <Route key="mc27" path="/admin/mc/architecture-tests" element={gated("audit.view", <MCArchitectureTests />)} />,
    // ── Board of Advisors Admin ──
    <Route key="boa01" path="/admin/advisor-board/catalog" element={gated("flags.view", <AdvisorBoardCatalog />)} />,
    <Route key="boa02" path="/admin/advisor-board/recommendations" element={gated("audit.view", <AdvisorRecommendationMonitor />)} />,
    <Route key="boa03" path="/admin/advisor-board/actions" element={gated("audit.view", <AdvisorActionApprovalAdmin />)} />,
    <Route key="boa04" path="/admin/advisor-board/memory" element={gated("audit.view", <AdvisorMemoryInspectorAdmin />)} />,
    <Route key="boa05" path="/admin/advisor-board/autonomy" element={gated("policy.view", <AdvisorAutonomyPolicyEditor />)} />,
    <Route key="boa06" path="/admin/advisor-board/profitability" element={gated("audit.view", <AdvisorProfitabilityDashboard />)} />,
    // ── Control Domain Pages ──
    <Route key="cd01" path="/admin/release-engineering" element={gated("maintenance.view", <ReleaseEngineeringPage />)} />,
    <Route key="cd02" path="/admin/graph-intelligence" element={gated("audit.view", <GraphIntelligencePage />)} />,
    <Route key="cd03" path="/admin/ai-governance" element={gated("policy.view", <AIGovernancePage />)} />,
    <Route key="cd04" path="/admin/simulation-center" element={gated("maintenance.view", <SimulationCenterPage />)} />,
    // ── Backend Topology & DB Health ──
    <Route key="bt01" path="/admin/backend-topology" element={gated("maintenance.view", <BackendTopologyDashboard />)} />,
    <Route key="bt02" path="/admin/db-truth-explorer" element={gated("audit.view", <DbTruthExplorer />)} />,
    // ── Mobile platform archived (Ubuntu-native canonical). Legacy redirects:
    <Route key="mob01" path="/admin/mobile-parity" element={<Navigate to="/admin/web/deployability" replace />} />,
    <Route key="mob02" path="/admin/mobile/store-readiness" element={<Navigate to="/admin/desktop/deployability" replace />} />,
    <Route key="web01" path="/admin/web/deployability" element={gated("audit.view", <WEB01DeployabilityCenter />)} />,
    <Route key="dsk01" path="/admin/desktop/deployability" element={gated("audit.view", <DSK01DeployabilityCenter />)} />,
    <Route key="app01" path="/admin/appliance/deployability" element={gated("audit.view", <APP01ApplianceDeployabilityCenter />)} />,
    <Route key="bap01" path="/admin/backend-api/deployability" element={gated("audit.view", <BAP01BackendApiDeployabilityCenter />)} />,
    <Route key="efh01" path="/admin/edge-functions/health" element={gated("maintenance.view", <EFH01EdgeFunctionHealthCenter />)} />,
    // ── Phase 27: Kill-Switch & Safety Center ──
    <Route key="ar08-kill-switches" path="/admin/automation/kill-switches" element={gated("flags.view", <AR08KillSwitchCenter />)} />,

    // ── Phase 2 (Page Consolidation): Auto-generated redirect & alias layer ──
    // Every duplicate / deprecated admin URL resolves to its canonical target.
    // Source: src/admin/redirects/admin-redirect-map.ts (derived from
    // admin-page-consolidation-map.ts). Bookmark-safe forever.
    ...ADMIN_REDIRECTS.map((r) => (
      <Route
        key={`redirect-${r.from}`}
        path={r.from}
        element={<Navigate to={r.to} replace />}
      />
    )),
  ];
}
