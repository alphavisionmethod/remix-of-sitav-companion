import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, Outlet } from "react-router-dom";
import { getAdminRoutes } from "@/routes/AdminRoutes";
import { getOwnerRoutes } from "@/routes/OwnerRoutes";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ConnectivityProvider } from "@/contexts/ConnectivityContext";
import { OfflineBanner } from "@/components/sita/OfflineBanner";
import { useUserPreferences } from "@/hooks/use-user-preferences";
import { DataModeProvider } from "@/contexts/DataModeContext";
import { DemoModeProvider } from "@/contexts/DemoModeProvider";
import { DisplayModeProvider } from "@/contexts/DisplayModeContext";
import { InspectorProvider } from "@/contexts/InspectorContext";
import { EntityContextProvider } from "@/contexts/EntityContext";
import { SitaKernelProvider } from "@/contexts/SitaKernelContext";
import { AppPlatformProvider } from "@/contexts/AppPlatformContext";
import { OSRuntimeProvider } from "@/lib/hooks/useOSRuntime";
import { RealityModeProvider } from "@/lib/dual-reality/reality-mode-context";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ShellLayout } from "@/components/sita/ShellLayout";
import { GlobalErrorBoundary } from "@/components/sita/GlobalErrorBoundary";
import { RouteErrorBoundary } from "@/components/sita/RouteErrorBoundary";
import { createQueryClient } from "@/lib/query-config";
import { Suspense, lazy, type ReactNode } from "react";
import { PlatformInit } from "@/components/sita/PlatformInit";
import { PublicLayout } from "@/layouts/PublicLayout";
import { AdminCommandPalette } from "@/components/admin/AdminCommandPalette";
import { AdminKeyboardShortcuts } from "@/components/admin/AdminKeyboardShortcuts";
import { AdminShell } from "@/components/admin/shells/AdminShell";
import { OwnerWorkspaceShell } from "@/components/admin/shells/OwnerWorkspaceShell";
import { RevenueOfficeModeProvider } from "@/contexts/RevenueOfficeModeContext";

const AdminCommandPaletteWrapper = () => <AdminCommandPalette />;
const AdminKeyboardShortcutsWrapper = () => <AdminKeyboardShortcuts />;
const AdminShellLayout = () => <AdminShell><Outlet /></AdminShell>;
const OwnerShellLayout = () => <OwnerWorkspaceShell><Outlet /></OwnerWorkspaceShell>;
const RevenueOfficeModeLayout = () => <RevenueOfficeModeProvider><Outlet /></RevenueOfficeModeProvider>;

// ═══════════════════════════════════════════════════
// CODE-SPLIT: Lazy-load all page components
// ═══════════════════════════════════════════════════
const DailyPulse = lazy(() => import("./pages/DailyPulse"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const UserProfilePage = lazy(() => import("./pages/UserProfilePage"));
const BusinessCenter = lazy(() => import("./pages/BusinessCenter"));
const CustomerDetail = lazy(() => import("./pages/CustomerDetail"));
const MoneyCenter = lazy(() => import("./pages/MoneyCenter"));
const ConciergeCenter = lazy(() => import("./pages/ConciergeCenter"));
const WorkflowsCenter = lazy(() => import("./pages/WorkflowsCenter"));
const ProofCenter = lazy(() => import("./pages/ProofCenter"));
const Boardroom = lazy(() => import("./pages/Boardroom"));
const BoardroomReplay = lazy(() => import("./pages/boardroom/BoardroomReplay"));
const BoardroomHistory = lazy(() => import("./pages/boardroom/BoardroomHistory"));
const FilesCenter = lazy(() => import("./pages/FilesCenter"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const MissionControl = lazy(() => import("./pages/mission-control/MissionControlPage"));
const MissionOverview = lazy(() => import("./pages/mission/MissionOverviewPage"));
const ConnectorDetail = lazy(() => import("./pages/mission/ConnectorDetailPage"));
const IncidentDetail = lazy(() => import("./pages/mission/IncidentDetailPage"));
const PolicySimulator = lazy(() => import("./pages/mission/PolicySimulatorPage"));
const MissionError = lazy(() => import("./pages/mission/MissionErrorPage"));
const AdvisorWorkspace = lazy(() => import("./pages/advisors/AdvisorWorkspace"));
const AdvisorCouncilDashboard = lazy(() => import("./pages/advisors/AdvisorCouncilDashboard"));
const Onboarding = lazy(() => import("./pages/OnboardingWrapper"));
const LearnLaterPage = lazy(() => import("./pages/LearnLaterPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const DesktopPage = lazy(() => import("./pages/DesktopPage"));
const Login = lazy(() => import("./pages/auth/Login"));
const Signup = lazy(() => import("./pages/auth/Signup"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const PersonalizationStudio = lazy(() => import("./pages/PersonalizationStudio"));
const MemoryCenter = lazy(() => import("./pages/MemoryCenter"));
const InboxCapture = lazy(() => import("./pages/InboxCapture"));
const ActivityStream = lazy(() => import("./pages/ActivityStream"));
const OpportunityEngine = lazy(() => import("./pages/OpportunityEngine"));
const AutomationCenter = lazy(() => import("./pages/AutomationCenter"));
const SystemStatus = lazy(() => import("./pages/SystemStatus"));
const OwnerCenter = lazy(() => import("./pages/OwnerCenter"));
const ApprovalsCenter = lazy(() => import("./pages/ApprovalsCenter"));
const ApprovalChamber = lazy(() => import("./pages/ApprovalChamber"));
const ProductivityHub = lazy(() => import("./pages/ProductivityHub"));
const DocsWorkspace = lazy(() => import("./pages/workspace/DocsWorkspace"));
const SheetsWorkspace = lazy(() => import("./pages/workspace/SheetsWorkspace"));
const SlidesWorkspace = lazy(() => import("./pages/workspace/SlidesWorkspace"));
const PrincipalWorkspace = lazy(() => import("./pages/workspace/PrincipalWorkspace"));
const OperatorWorkspace = lazy(() => import("./pages/workspace/OperatorWorkspace"));
const GovernanceDashboard = lazy(() => import("./pages/GovernanceDashboard"));
const PackStorePage = lazy(() => import("./pages/store/PackStorePage"));
const PackDetailPage = lazy(() => import("./pages/store/PackDetailPage"));
const PackInstalledPage = lazy(() => import("./pages/store/PackInstalledPage"));
const OldAppDetailPage = lazy(() => import("./pages/store/StoreAppDetailPage"));
const StoreCategoryPage = lazy(() => import("./pages/store/StoreCategoryPage"));
const StoreAnalyticsPage = lazy(() => import("./pages/store/StoreAnalyticsPage"));
const AppStorePage = lazy(() => import("./pages/app-platform/AppStorePage"));
const AppPlatformDetailPage = lazy(() => import("./pages/app-platform/AppDetailPage"));
const AppLibraryPage = lazy(() => import("./pages/app-platform/AppLibraryPage"));
const BundleDetailPage = lazy(() => import("./pages/app-platform/BundleDetailPage"));
const AppUpdatesPage = lazy(() => import("./pages/app-platform/AppUpdatesPage"));
const AppPermissionsCenterPage = lazy(() => import("./pages/app-platform/AppPermissionsCenterPage"));
const AppAssociationsPage = lazy(() => import("./pages/app-platform/AppAssociationsPage"));
const AppComparePage = lazy(() => import("./pages/app-platform/AppComparePage"));
const AppManagePage = lazy(() => import("./pages/app-platform/AppManagePage"));
const WebAppInstallPage = lazy(() => import("./pages/app-platform/WebAppInstallPage"));
const ExternalInstallerPage = lazy(() => import("./pages/app-platform/ExternalInstallerPage"));
const AppReceiptsPage = lazy(() => import("./pages/app-platform/AppReceiptsPage"));
const AppReceiptDetailPage = lazy(() => import("./pages/app-platform/AppReceiptDetailPage"));
const EnterpriseCatalogPage = lazy(() => import("./pages/app-platform/EnterpriseCatalogPage"));
const DevToolsCatalogPage = lazy(() => import("./pages/app-platform/DevToolsCatalogPage"));
const OpenWithPage = lazy(() => import("./pages/app-platform/OpenWithPage"));
const FirstLaunchPage = lazy(() => import("./pages/app-platform/FirstLaunchPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const PolicyEditor = lazy(() => import("./pages/PolicyEditor"));
const ConnectorHub = lazy(() => import("./pages/ConnectorHub"));
const AdvisorRegistry = lazy(() => import("./pages/advisors/AdvisorRegistry"));
const RecoveryCenter = lazy(() => import("./pages/RecoveryCenter"));
const LifeDashboard = lazy(() => import("./pages/LifeDashboard"));
const LifeSimulator = lazy(() => import("./pages/LifeSimulator"));
const MyActivity = lazy(() => import("./pages/MyActivity"));
const PermissionsCenter = lazy(() => import("./pages/PermissionsCenter"));
const AgentActivityDashboard = lazy(() => import("./pages/AgentActivityDashboard"));
const RevenueCallingPage = lazy(() => import("./pages/RevenueCallingPage"));
const FormsBuilder = lazy(() => import("./pages/revenue-office/FormsBuilder"));
const SegmentationEngine = lazy(() => import("./pages/revenue-office/SegmentationEngine"));
const ClientOnboarding = lazy(() => import("./pages/revenue-office/ClientOnboarding"));
const ServiceArchitectureDashboard = lazy(() => import("./pages/ServiceArchitectureDashboard"));
const PricingEditor = lazy(() => import("./pages/owner/PricingEditor"));
const PackEditorPage = lazy(() => import("./pages/owner/PackEditor"));
const AdvisorConfigPage = lazy(() => import("./pages/owner/AdvisorConfig"));
const LeaseDashboard = lazy(() => import("./pages/owner/LeaseDashboard"));
const ConstitutionEditor = lazy(() => import("./pages/owner/ConstitutionEditor"));
const OwnerPulsePage = lazy(() => import("./pages/owner/OwnerPulsePage"));
const OwnerApprovalsPage = lazy(() => import("./pages/owner/OwnerApprovalsPage"));
const OwnerAiTeamUpdatesPage = lazy(() => import("./pages/owner/OwnerAiTeamUpdatesPage"));
const ObservabilityPage = lazy(() => import("./pages/ObservabilityPage"));
const UsersAdminPage = lazy(() => import("./pages/UsersAdminPage"));
const MissionRegistryPage = lazy(() => import("./pages/mission/MissionRegistryPage"));
const MissionReleaseDetailPage = lazy(() => import("./pages/mission/MissionReleaseDetailPage"));
const MissionWorkflowReplayPage = lazy(() => import("./pages/mission/MissionWorkflowReplayPage"));
const EnterpriseControlPlane = lazy(() => import("./pages/enterprise/EnterpriseControlPlane"));
const EnterpriseMaturityDashboard = lazy(() => import("./pages/EnterpriseMaturityDashboard"));
const IntegrationConcierge = lazy(() => import("./pages/IntegrationConcierge"));
const IntegrationsCatalog = lazy(() => import("./pages/integrations/IntegrationsCatalog"));
const ProviderDetail = lazy(() => import("./pages/integrations/ProviderDetail"));
const ConnectionsList = lazy(() => import("./pages/integrations/ConnectionsList"));
const ConnectionDetail = lazy(() => import("./pages/integrations/ConnectionDetail"));
const ActionsApprovals = lazy(() => import("./pages/integrations/ActionsApprovals"));
const DigitalTwinsPage = lazy(() => import("./pages/DigitalTwinsPage"));
const ScenarioLabPage = lazy(() => import("./pages/ScenarioLabPage"));
const AIEconomicsPage = lazy(() => import("./pages/AIEconomicsPage"));
const RecoveredValuePage = lazy(() => import("./pages/RecoveredValuePage"));
const OutcomeEnginePage = lazy(() => import("./pages/OutcomeEnginePage"));
const SpilloverDashboard = lazy(() => import("./pages/SpilloverDashboard"));
const FirstWinActivation = lazy(() => import("./pages/FirstWinActivation"));
const AIWorkforcePage = lazy(() => import("./pages/AIWorkforcePage"));
const CapitalAllocationPage = lazy(() => import("./pages/CapitalAllocationPage"));
const SovereignExportPage = lazy(() => import("./pages/SovereignExportPage"));
const CommunicationsPage = lazy(() => import("./pages/CommunicationsPage"));
const NotificationSettingsPage = lazy(() => import("./pages/NotificationSettingsPage"));
const NotificationCenter = lazy(() => import("./pages/NotificationCenter"));
const CustomerHealthPage = lazy(() => import("./pages/CustomerHealthPage"));
const GeneratedTruthDashboard = lazy(() => import("./pages/admin/GeneratedTruthDashboard"));
const FleetHealthPage = lazy(() => import("./pages/admin/FleetHealthPage"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const IncidentCommandCenter = lazy(() => import("./pages/admin/IncidentCommandCenter"));
const AdminDeploymentTruthCenter = lazy(() => import("./pages/admin/AdminDeploymentRings"));
const ProofMatrixExplorer = lazy(() => import("./pages/admin/ProofMatrixExplorer"));
const ConnectorGovernanceCenter = lazy(() => import("./pages/admin/ConnectorGovernanceCenter"));
const LaunchReadinessBoard = lazy(() => import("./pages/admin/LaunchReadinessBoard"));
const TeamManagement = lazy(() => import("./pages/admin/TeamManagement"));
const SystemManagement = lazy(() => import("./pages/admin/SystemManagement"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const AITokenDashboard = lazy(() => import("./pages/admin/AITokenDashboard"));
const MissionControlHome = lazy(() => import("./pages/admin/MissionControlHome"));
const AdminDurabilityBoardPage = lazy(() => import("./pages/admin/AdminMutationAudit"));
const AdminProjectionControl = lazy(() => import("./pages/admin/AdminProjectionModels"));
const AdminOperationsCommand = lazy(() => import("./pages/admin/AdminOperationsHub"));
const SecurityPostureBoard = lazy(() => import("./pages/admin/SecurityPostureBoard"));
const AdminTruthRegistry = lazy(() => import("./pages/admin/AdminTruthClaims"));
const ConciergeRuntimeBoard = lazy(() => import("./pages/admin/ConciergeRuntimeBoard"));
const AlertTriageBoard = lazy(() => import("./pages/admin/AlertTriageBoard"));
const AdminPolicySimulator = lazy(() => import("./pages/admin/PolicySimulator"));
const WorkflowReplayAudit = lazy(() => import("./pages/admin/WorkflowReplayAudit"));
const IntelligenceDashboard = lazy(() => import("./pages/admin/IntelligenceDashboard"));
const FounderCouncilBoard = lazy(() => import("./pages/admin/FounderCouncilBoard"));
const CanonicalChainExplorer = lazy(() => import("./pages/admin/CanonicalChainExplorer"));
const ReleaseRingCommandBoard = lazy(() => import("./pages/admin/ReleaseRingCommandBoard"));
const ComputeGovernanceBoard = lazy(() => import("./pages/admin/ComputeGovernanceBoard"));
const SystemHealthDashboard = lazy(() => import("./pages/admin/SystemHealthDashboard"));
const BrainCoreDashboard = lazy(() => import("./pages/admin/BrainCoreDashboard"));
const ConscienceGateDashboard = lazy(() => import("./pages/admin/ConscienceGateDashboard"));
const IntegrationConciergePage = lazy(() => import("./pages/admin/IntegrationConciergePage"));
const RevenueAutopilotMonitor = lazy(() => import("./pages/admin/RevenueAutopilotMonitor"));
const InvestorProofLedger = lazy(() => import("./pages/admin/InvestorProofLedger"));
const RealityClassificationMatrix = lazy(() => import("./pages/admin/RealityClassificationMatrix"));
const MockReplacementProgram = lazy(() => import("./pages/admin/MockReplacementProgram"));
const RealityConversionOverview = lazy(() => import("./pages/admin/RealityConversionOverview"));
const FeatureRealityDetail = lazy(() => import("./pages/admin/FeatureRealityDetail"));
const MockSourceInventory = lazy(() => import("./pages/admin/MockSourceInventory"));
const SimulatedCoreServicesBoard = lazy(() => import("./pages/admin/SimulatedCoreServicesBoard"));
const RouteRealityHeatmap = lazy(() => import("./pages/admin/RouteRealityHeatmap"));
const ContractBackendReadiness = lazy(() => import("./pages/admin/ContractBackendReadiness"));
const LaunchHonestyBoard = lazy(() => import("./pages/admin/LaunchHonestyBoard"));
const MigrationWavePlanner = lazy(() => import("./pages/admin/MigrationWavePlanner"));
const RealityProgressTimeline = lazy(() => import("./pages/admin/RealityProgressTimeline"));
const RuntimeRealityValidation = lazy(() => import("./pages/admin/RuntimeRealityValidation"));
const PersonalBrain = lazy(() => import("./pages/PersonalBrain"));
const PersonalLifeWorkspace = lazy(() => import("./pages/PersonalLifeWorkspace"));
const DownloadsCenter = lazy(() => import("./pages/DownloadsCenter"));
const StorageManager = lazy(() => import("./pages/StorageManager"));
const NetworkUtility = lazy(() => import("./pages/NetworkUtility"));
const PlanningCanvas = lazy(() => import("./pages/PlanningCanvas"));
const PDFViewerWorkspace = lazy(() => import("./pages/PDFViewerWorkspace"));
const SpreadsheetWorkspace = lazy(() => import("./pages/SpreadsheetWorkspace"));
const ClipboardHistory = lazy(() => import("./pages/ClipboardHistory"));
const PrintScanCenter = lazy(() => import("./pages/PrintScanCenter"));

// ── AI Engineering Board ──
const AIEngineeringBoard = lazy(() => import("./pages/admin/AIEngineeringBoard"));
const AITeamRoster = lazy(() => import("./pages/admin/AITeamRoster"));
const AIMissionCenter = lazy(() => import("./pages/admin/AIMissionCenter"));
const AIFixCenter = lazy(() => import("./pages/admin/AIFixCenter"));
const AISelfHealing = lazy(() => import("./pages/admin/AISelfHealing"));
const AIDesignStudio = lazy(() => import("./pages/admin/AIDesignStudio"));
const AILearningCenter = lazy(() => import("./pages/admin/AILearningCenter"));
const AIApprovalDesk = lazy(() => import("./pages/admin/AIApprovalDesk"));
const AIReleasesCenter = lazy(() => import("./pages/admin/AIReleasesCenter"));
const AIRootCauseGraph = lazy(() => import("./pages/admin/AIRootCauseGraph"));
const AIDesignDiffTheater = lazy(() => import("./pages/admin/AIDesignDiffTheater"));
const AITimeMachine = lazy(() => import("./pages/admin/AITimeMachine"));
const AIAgentDebate = lazy(() => import("./pages/admin/AIAgentDebate"));
const AISelfLearningLedger = lazy(() => import("./pages/admin/AISelfLearningLedger"));
const AIChangePlanViewer = lazy(() => import("./pages/admin/AIChangePlanViewer"));
const AIHumanBoundaryControls = lazy(() => import("./pages/admin/AIHumanBoundaryControls"));
const AIEvidenceBundleComposer = lazy(() => import("./pages/admin/AIEvidenceBundleComposer"));

// ── CPS: Core Persistence Substrate Admin Pages ──
const CorePersistenceOverview = lazy(() => import("./pages/admin/CorePersistenceOverview"));
const EventStreamExplorer = lazy(() => import("./pages/admin/EventStreamExplorer"));
const MemoryContinuityCenter = lazy(() => import("./pages/admin/MemoryContinuityCenter"));
const PolicyDecisionLedger = lazy(() => import("./pages/admin/PolicyDecisionLedger"));
const IntelligenceArtifactLibrary = lazy(() => import("./pages/admin/IntelligenceArtifactLibrary"));
const ActionLineageExplorer = lazy(() => import("./pages/admin/ActionLineageExplorer"));
const ReplayRecoveryConsole = lazy(() => import("./pages/admin/ReplayRecoveryConsole"));
const CoreServiceMigrationBoard = lazy(() => import("./pages/admin/CoreServiceMigrationBoard"));
const PersistenceDriftRadar = lazy(() => import("./pages/admin/PersistenceDriftRadar"));
const RuntimeContinuityBoard = lazy(() => import("./pages/admin/RuntimeContinuityBoard"));

// ── Phase 4 Unification Pages ──
const TrustStateRegistry = lazy(() => import("./pages/admin/TrustStateRegistry"));
const ActionStateDriftViewer = lazy(() => import("./pages/admin/ActionStateDriftViewer"));
const CrossDomainMemoryExplorer = lazy(() => import("./pages/admin/CrossDomainMemoryExplorer"));

// Delivery OS surfaces
const FeatureIntakeDesk = lazy(() => import("./pages/admin/FeatureIntakeDesk"));
const FeatureLifecycleBoard = lazy(() => import("./pages/admin/FeatureLifecycleBoard"));
const FeatureFactoryConsole = lazy(() => import("./pages/admin/FeatureFactoryConsole"));
const DomainMethodologyPacks = lazy(() => import("./pages/admin/DomainMethodologyPacks"));
const DependencyMapViewer = lazy(() => import("./pages/admin/DependencyMapViewer"));
const ChangeImpactAnalyzer = lazy(() => import("./pages/admin/ChangeImpactAnalyzer"));
const DeliveryReadinessBoard = lazy(() => import("./pages/admin/DeliveryReadinessBoard"));
const PlatformMaturityDashboard = lazy(() => import("./pages/admin/PlatformMaturityDashboard"));
const BuilderKnowledgeBase = lazy(() => import("./pages/admin/BuilderKnowledgeBase"));
const DeliveryWavePlanner = lazy(() => import("./pages/admin/DeliveryWavePlanner"));

// FIP — Feature Integration Protocol Enforcement System
const FIPIntakeDesk = lazy(() => import("./pages/admin/fip/FIPIntakeDesk"));
const FIPSpecStudio = lazy(() => import("./pages/admin/fip/FIPSpecStudio"));
const FIPOwnerBoundary = lazy(() => import("./pages/admin/fip/FIPOwnerBoundary"));
const FIPCapabilityRegistry = lazy(() => import("./pages/admin/fip/FIPCapabilityRegistry"));
const FIPComplianceBoard = lazy(() => import("./pages/admin/fip/FIPComplianceBoard"));
const FIPExecutionExplorer = lazy(() => import("./pages/admin/fip/FIPExecutionExplorer"));
const FIPPolicyTrustBoard = lazy(() => import("./pages/admin/fip/FIPPolicyTrustBoard"));
const FIPMemoryGraphStudio = lazy(() => import("./pages/admin/fip/FIPMemoryGraphStudio"));
const FIPObservabilityCenter = lazy(() => import("./pages/admin/fip/FIPObservabilityCenter"));
const FIPRolloutPlanner = lazy(() => import("./pages/admin/fip/FIPRolloutPlanner"));
const FIPGeneratedTruthBoard = lazy(() => import("./pages/admin/fip/FIPGeneratedTruthBoard"));
const FIPReadinessGateReview = lazy(() => import("./pages/admin/fip/FIPReadinessGateReview"));
const FIPDeprecationManager = lazy(() => import("./pages/admin/fip/FIPDeprecationManager"));
const FIPBuilderConsole = lazy(() => import("./pages/admin/fip/FIPBuilderConsole"));

// SAG — Sovereign AI Gateway
const AIRuntimeStatus = lazy(() => import("./pages/admin/AIRuntimeStatus"));
const PersistenceStatus = lazy(() => import("./pages/admin/PersistenceStatus"));
const DRS01RealityModeOverview = lazy(() => import("./pages/admin/DRS01RealityModeOverview"));
const DRS02ModeRegistryConsole = lazy(() => import("./pages/admin/DRS02ModeRegistryConsole"));
const DRS03ScenarioLibrary = lazy(() => import("./pages/admin/DRS03ScenarioLibrary"));
const DRS04ScenarioEntityGraph = lazy(() => import("./pages/admin/DRS04ScenarioEntityGraph"));
const DRS05ProviderConsole = lazy(() => import("./pages/admin/DRS05ProviderConsole"));
const DRS06DemoPolicySafety = lazy(() => import("./pages/admin/DRS06DemoPolicySafety"));
const DRS07DemoAIControl = lazy(() => import("./pages/admin/DRS07DemoAIControl"));
const DRS08AnalyticsSegregation = lazy(() => import("./pages/admin/DRS08AnalyticsSegregation"));
const DRS09TruthLabeling = lazy(() => import("./pages/admin/DRS09TruthLabeling"));
const DRS10DualRealityLaunchGate = lazy(() => import("./pages/admin/DRS10DualRealityLaunchGate"));
const MockEliminationCenter = lazy(() => import("./pages/admin/MockEliminationCenter"));
const DomainRealityBoard = lazy(() => import("./pages/admin/DomainRealityBoard"));
const RouteSourceDiagnostics = lazy(() => import("./pages/admin/RouteSourceDiagnostics"));
const AR01AutomationOverview = lazy(() => import("./pages/admin/AR01AutomationOverview"));
const AR02ScheduledJobRegistry = lazy(() => import("./pages/admin/AR02ScheduledJobRegistry"));
const AR03SelfHealingBoard = lazy(() => import("./pages/admin/AR03SelfHealingBoard"));
const AR04AgentScheduler = lazy(() => import("./pages/admin/AR04AgentScheduler"));
const AR05SystemMaintenanceBoard = lazy(() => import("./pages/admin/AR05SystemMaintenanceBoard"));
const AR06ExecutionTraceExplorer = lazy(() => import("./pages/admin/AR06ExecutionTraceExplorer"));
const AR07RetryFailureCenter = lazy(() => import("./pages/admin/AR07RetryFailureCenter"));
const AR08KillSwitchCenter = lazy(() => import("./pages/admin/AR08KillSwitchCenter"));
const AR09AutomationLaunchGate = lazy(() => import("./pages/admin/AR09AutomationLaunchGate"));

// LT — Launch Truth / CI / E2E / Behavioral Truth / Launch Gate
const LT01BehavioralTruthOverview = lazy(() => import("./pages/admin/LT01BehavioralTruthOverview"));
const LT02CIPipelineCenter = lazy(() => import("./pages/admin/LT02CIPipelineCenter"));
const LT03E2EJourneyBoard = lazy(() => import("./pages/admin/LT03E2EJourneyBoard"));
const LT04RuntimeProbeCenter = lazy(() => import("./pages/admin/LT04RuntimeProbeCenter"));
const LT05LaunchGateBoard = lazy(() => import("./pages/admin/LT05LaunchGateBoard"));
const LT06RouteInteractionTruth = lazy(() => import("./pages/admin/LT06RouteInteractionTruth"));
const LT07TruthRegressionRadar = lazy(() => import("./pages/admin/LT07TruthRegressionRadar"));

// V — Behavioral Truth Verification Boards
const V01SurfaceInventoryBoard = lazy(() => import("./pages/admin/verification/V01SurfaceInventoryBoard"));
const V02InteractionCoverageBoard = lazy(() => import("./pages/admin/verification/V02InteractionCoverageBoard"));
const V03P0JourneyBoard = lazy(() => import("./pages/admin/verification/V03P0JourneyBoard"));
const V04ModeVerificationBoard = lazy(() => import("./pages/admin/verification/V04ModeVerificationBoard"));
const V05FailureTriageBoard = lazy(() => import("./pages/admin/verification/V05FailureTriageBoard"));
const V06EvidenceExplorer = lazy(() => import("./pages/admin/verification/V06EvidenceExplorer"));
const V07LaunchBlockerBoard = lazy(() => import("./pages/admin/verification/V07LaunchBlockerBoard"));

// CJ — Customer Journey Proof System
const CJ01ExecutiveReport = lazy(() => import("./pages/admin/customer-journey/CJ01ExecutiveReport"));
const CJ02JourneyTruthMatrix = lazy(() => import("./pages/admin/customer-journey/CJ02JourneyTruthMatrix"));
const CJ03JourneyDetailView = lazy(() => import("./pages/admin/customer-journey/CJ03JourneyDetailView"));
const CJ04LaunchBlockerView = lazy(() => import("./pages/admin/customer-journey/CJ04LaunchBlockerView"));
const CJ05DemoVsRealComparison = lazy(() => import("./pages/admin/customer-journey/CJ05DemoVsRealComparison"));
const CJ06BrokenClicksExplorer = lazy(() => import("./pages/admin/customer-journey/CJ06BrokenClicksExplorer"));
const CJ07OwnerRemediationView = lazy(() => import("./pages/admin/customer-journey/CJ07OwnerRemediationView"));
const CJ08RouteActionCoverage = lazy(() => import("./pages/admin/customer-journey/CJ08RouteActionCoverage"));
const CJ09RecentVerificationRuns = lazy(() => import("./pages/admin/customer-journey/CJ09RecentVerificationRuns"));

const CN01ConnectorRealityOverview = lazy(() => import("./pages/admin/CN01ConnectorRealityOverview"));
const CN02ConnectorRegistryConsole = lazy(() => import("./pages/admin/CN02ConnectorRegistryConsole"));
const CN03AccountLinkageBoard = lazy(() => import("./pages/admin/CN03AccountLinkageBoard"));
const CN04SyncTruthCenter = lazy(() => import("./pages/admin/CN04SyncTruthCenter"));
const CN05ConnectorHealthBoard = lazy(() => import("./pages/admin/CN05ConnectorHealthBoard"));
const CN06ConnectorDemoReview = lazy(() => import("./pages/admin/CN06ConnectorDemoReview"));
const CN07ConnectorLaunchGate = lazy(() => import("./pages/admin/CN07ConnectorLaunchGate"));

const MSA01MultiSurfaceOverview = lazy(() => import("./pages/admin/MSA01MultiSurfaceOverview"));
const MSA02CoreSurfaceBoundary = lazy(() => import("./pages/admin/MSA02CoreSurfaceBoundary"));
const MSA03CapabilityPortability = lazy(() => import("./pages/admin/MSA03CapabilityPortability"));
const MSA04SurfaceAdapterRegistry = lazy(() => import("./pages/admin/MSA04SurfaceAdapterRegistry"));
const MSA05CompatibilityRadar = lazy(() => import("./pages/admin/MSA05CompatibilityRadar"));

const PFA01ProviderFamilyRegistry = lazy(() => import("./pages/admin/PFA01ProviderFamilyRegistry"));
const PFA02ProviderCapabilityMatrix = lazy(() => import("./pages/admin/PFA02ProviderCapabilityMatrix"));
const PFA03OAuthClientRegistry = lazy(() => import("./pages/admin/PFA03OAuthClientRegistry"));
const PFA04ConsentLedgerExplorer = lazy(() => import("./pages/admin/PFA04ConsentLedgerExplorer"));
const PFA05ScopePolicyMatrix = lazy(() => import("./pages/admin/PFA05ScopePolicyMatrix"));
const PFA06PermissionUpgradeCenter = lazy(() => import("./pages/admin/PFA06PermissionUpgradeCenter"));
const PFA07ConnectorHealthDrift = lazy(() => import("./pages/admin/PFA07ConnectorHealthDrift"));
const PFA08AccountGraphExplorer = lazy(() => import("./pages/admin/PFA08AccountGraphExplorer"));
const PFA09ConnectedAccountsCenter = lazy(() => import("./pages/admin/PFA09ConnectedAccountsCenter"));
const PFA10IntegrationLaunchHonesty = lazy(() => import("./pages/admin/PFA10IntegrationLaunchHonesty"));
const GoogleProviderFamilyDashboard = lazy(() => import("./pages/admin/GoogleProviderFamilyDashboard"));
const GoogleConnectedAccounts = lazy(() => import("./pages/settings/GoogleConnectedAccounts"));

const ISA01IdentityProviderRegistryBoard = lazy(() => import("./pages/admin/ISA01IdentityProviderRegistryBoard"));
const ISA02ConnectorProviderRegistryBoard = lazy(() => import("./pages/admin/ISA02ConnectorProviderRegistryBoard"));
const ISA03OAuthClientRegistryConsole = lazy(() => import("./pages/admin/ISA03OAuthClientRegistryConsole"));
const ISA04ConsentLedgerExplorer = lazy(() => import("./pages/admin/ISA04ConsentLedgerExplorer"));
const ISA05ScopePolicyMatrixBoard = lazy(() => import("./pages/admin/ISA05ScopePolicyMatrixBoard"));
const ISA06UnifiedAccountGraphExplorer = lazy(() => import("./pages/admin/ISA06UnifiedAccountGraphExplorer"));
const ISA07AuthConnectorTruthBoard = lazy(() => import("./pages/admin/ISA07AuthConnectorTruthBoard"));

const AIG01ProviderRegistry = lazy(() => import("./pages/admin/AIG01ProviderRegistry"));
const AIG02ModelRegistry = lazy(() => import("./pages/admin/AIG02ModelRegistry"));
const AIG03RoutingMatrix = lazy(() => import("./pages/admin/AIG03RoutingMatrix"));
const AIG04BudgetCenter = lazy(() => import("./pages/admin/AIG04BudgetCenter"));
const AIG05ReceiptsExplorer = lazy(() => import("./pages/admin/AIG05ReceiptsExplorer"));
const AIG06LaunchTruth = lazy(() => import("./pages/admin/AIG06LaunchTruth"));
const AIG07LaunchTruth = lazy(() => import("./pages/admin/AIG07LaunchTruth"));
const AIG08DegradedDiagnostics = lazy(() => import("./pages/admin/AIG08DegradedDiagnostics"));
const AIG09RuntimeVerification = lazy(() => import("./pages/admin/AIG09RuntimeVerification"));

const UAO01PresenceContinuity = lazy(() => import("./pages/admin/UAO01PresenceContinuity"));
const UAO02ConnectedDevices = lazy(() => import("./pages/admin/UAO02ConnectedDevices"));
const UAO03AmbientTeamControl = lazy(() => import("./pages/admin/UAO03AmbientTeamControl"));
const UAO04NotificationRouter = lazy(() => import("./pages/admin/UAO04NotificationRouter"));
const UAO05HealthReadiness = lazy(() => import("./pages/admin/UAO05HealthReadiness"));
const UAO06DeviceTrust = lazy(() => import("./pages/admin/UAO06DeviceTrust"));
const UAO07CrossSurfaceJourney = lazy(() => import("./pages/admin/UAO07CrossSurfaceJourney"));
const UAO08AmbientLaunchReadiness = lazy(() => import("./pages/admin/UAO08AmbientLaunchReadiness"));

// ── DWE: Device & Wearable Expansion ──
const DWE01ConnectedDevicesCenter = lazy(() => import("./pages/admin/DWE01ConnectedDevicesCenter"));
const DWE02PresenceContinuityCenter = lazy(() => import("./pages/admin/DWE02PresenceContinuityCenter"));
const DWE03WearableSignalsCenter = lazy(() => import("./pages/admin/DWE03WearableSignalsCenter"));
const DWE04NotificationRoutingStudio = lazy(() => import("./pages/admin/DWE04NotificationRoutingStudio"));
const DWE05DeviceTrustApprovalsCenter = lazy(() => import("./pages/admin/DWE05DeviceTrustApprovalsCenter"));
const DWE06AmbientAssistantCenter = lazy(() => import("./pages/admin/DWE06AmbientAssistantCenter"));
const DWE07DeviceLaunchHonestyBoard = lazy(() => import("./pages/admin/DWE07DeviceLaunchHonestyBoard"));

// ── APL: Apple Ecosystem ──
const APL01AppleEcosystemCenter = lazy(() => import("./pages/admin/APL01AppleEcosystemCenter"));
const APL02AppleDevicesTrust = lazy(() => import("./pages/admin/APL02AppleDevicesTrust"));
const APL03AppleWatchExperience = lazy(() => import("./pages/admin/APL03AppleWatchExperience"));
const APL04AppleIdentityAccounts = lazy(() => import("./pages/admin/APL04AppleIdentityAccounts"));
const APL05AppleHealthConsent = lazy(() => import("./pages/admin/APL05AppleHealthConsent"));
const APL06AppleLaunchReadiness = lazy(() => import("./pages/admin/APL06AppleLaunchReadiness"));

// ── AND: Android Ecosystem ──
const AND01AndroidEcosystemCenter = lazy(() => import("./pages/admin/AND01AndroidEcosystemCenter"));
const AND02WearOSExperience = lazy(() => import("./pages/admin/AND02WearOSExperience"));
const AND03AndroidTrustApprovals = lazy(() => import("./pages/admin/AND03AndroidTrustApprovals"));
const AND04AndroidHealthConsent = lazy(() => import("./pages/admin/AND04AndroidHealthConsent"));
const AND05AndroidLaunchReadiness = lazy(() => import("./pages/admin/AND05AndroidLaunchReadiness"));

// ── HRS: Health / Readiness / Signal Intelligence ──
const HRS01HealthConsentCenter = lazy(() => import("./pages/admin/HRS01HealthConsentCenter"));
const HRS02SignalSourcesBoard = lazy(() => import("./pages/admin/HRS02SignalSourcesBoard"));
const HRS03ReadinessExplanation = lazy(() => import("./pages/admin/HRS03ReadinessExplanation"));
const HRS04NotificationInfluence = lazy(() => import("./pages/admin/HRS04NotificationInfluence"));
const HRS05AssistantTimingBoard = lazy(() => import("./pages/admin/HRS05AssistantTimingBoard"));
const HRS06SignalLaunchHonesty = lazy(() => import("./pages/admin/HRS06SignalLaunchHonesty"));

// ── NRC: Notification Routing + Calm Assistant ──
const NRC01RoutingStudio = lazy(() => import("./pages/admin/NRC01RoutingStudio"));
const NRC02CalmnessCenter = lazy(() => import("./pages/admin/NRC02CalmnessCenter"));
const NRC03FatigueBoard = lazy(() => import("./pages/admin/NRC03FatigueBoard"));
const NRC04QueueInterruptMatrix = lazy(() => import("./pages/admin/NRC04QueueInterruptMatrix"));
const NRC05CrossDeviceDelivery = lazy(() => import("./pages/admin/NRC05CrossDeviceDelivery"));
const NRC06NotificationLaunchHonesty = lazy(() => import("./pages/admin/NRC06NotificationLaunchHonesty"));
const NOT03DeliveryReceiptsExplorer = lazy(() => import("./pages/admin/NOT03DeliveryReceiptsExplorer"));
const NOT01NotificationRuntimeVerification = lazy(() => import("./pages/admin/NOT01NotificationRuntimeVerification"));
const NOT02NotificationRoutingBoard = lazy(() => import("./pages/admin/NOT02NotificationRoutingBoard"));
const NOT04CalmPolicyBoard = lazy(() => import("./pages/admin/NOT04CalmPolicyBoard"));
const NOT05NotificationPreferencesBoard = lazy(() => import("./pages/admin/NOT05NotificationPreferencesBoard"));
const NotificationPreferences = lazy(() => import("./pages/settings/NotificationPreferences"));

// ── NSS: Native Shell Strategy ──
const NSS01StrategyBoard = lazy(() => import("./pages/admin/NSS01StrategyBoard"));
const NSS02CapabilityMatrix = lazy(() => import("./pages/admin/NSS02CapabilityMatrix"));
const NSS03TrustContinuity = lazy(() => import("./pages/admin/NSS03TrustContinuity"));
const NSS04MobileLaunchHonesty = lazy(() => import("./pages/admin/NSS04MobileLaunchHonesty"));

const SAGOverview = lazy(() => import("./pages/admin/sag/SAGOverview"));
const SAGModelRegistry = lazy(() => import("./pages/admin/sag/SAGModelRegistry"));
const SAGRoutingPolicy = lazy(() => import("./pages/admin/sag/SAGRoutingPolicy"));
const SAGProviderHealth = lazy(() => import("./pages/admin/sag/SAGProviderHealth"));
const SAGPromptRegistry = lazy(() => import("./pages/admin/sag/SAGPromptRegistry"));
const SAGEconomicsBoard = lazy(() => import("./pages/admin/sag/SAGEconomicsBoard"));
const SAGCostConfidenceLab = lazy(() => import("./pages/admin/sag/SAGCostConfidenceLab"));
const SAGMultiStageExplorer = lazy(() => import("./pages/admin/sag/SAGMultiStageExplorer"));
const SAGReceiptExplorer = lazy(() => import("./pages/admin/sag/SAGReceiptExplorer"));
const SAGFallbackCenter = lazy(() => import("./pages/admin/sag/SAGFallbackCenter"));
const SAGBuilderConsole = lazy(() => import("./pages/admin/sag/SAGBuilderConsole"));
const SAGComplianceGate = lazy(() => import("./pages/admin/sag/SAGComplianceGate"));

// ── REX: Recommendation → Execution Loop ──
const REX01RecommendationIntelligence = lazy(() => import("./pages/admin/REX01RecommendationIntelligence"));
const REX02ApprovalQueueCompletion = lazy(() => import("./pages/admin/REX02ApprovalQueueCompletion"));
const REX03RecommendationExecution = lazy(() => import("./pages/admin/REX03RecommendationExecution"));
const REX04RemediationPrograms = lazy(() => import("./pages/admin/REX04RemediationPrograms"));
const REX05OutcomeVerification = lazy(() => import("./pages/admin/REX05OutcomeVerification"));

// ── FL: Flagship Loops ──
const FL01FlagshipLoopsExecutive = lazy(() => import("./pages/admin/FL01FlagshipLoopsExecutive"));
const FL02FlagshipLoopDetail = lazy(() => import("./pages/admin/FL02FlagshipLoopDetail"));

// ── SERV: Service Ownership & Traceability ──
const SERV01ServiceOwnership = lazy(() => import("./pages/admin/SERV01ServiceOwnership"));
const SERV02DomainOwnership = lazy(() => import("./pages/admin/SERV02DomainOwnership"));
const SERV03RouteServiceTrace = lazy(() => import("./pages/admin/SERV03RouteServiceTrace"));
const SERV04ServiceDuplication = lazy(() => import("./pages/admin/SERV04ServiceDuplication"));
const SERV05CanonicalActions = lazy(() => import("./pages/admin/SERV05CanonicalActions"));
const SERV06FlagshipTraceability = lazy(() => import("./pages/admin/SERV06FlagshipTraceability"));

// ── LAUNCH: Launch Readiness Command Center ──
const LAUNCH01ReadinessExecutive = lazy(() => import("./pages/admin/launch/LAUNCH01ReadinessExecutive"));
const LAUNCH02FlagshipReadiness = lazy(() => import("./pages/admin/launch/LAUNCH02FlagshipReadiness"));
const LAUNCH03ClaimSafetyMatrix = lazy(() => import("./pages/admin/launch/LAUNCH03ClaimSafetyMatrix"));
const LAUNCH04BlockerCommand = lazy(() => import("./pages/admin/launch/LAUNCH04BlockerCommand"));
const LAUNCH06NarrativeGuide = lazy(() => import("./pages/admin/launch/LAUNCH06NarrativeGuide"));
const LAUNCH07GoNoGo = lazy(() => import("./pages/admin/launch/LAUNCH07GoNoGo"));

// Security Command Center
const SEC01PostureExecutive = lazy(() => import("./pages/admin/security/SEC01PostureExecutive"));
const SEC02PrivilegedActions = lazy(() => import("./pages/admin/security/SEC02PrivilegedActions"));
const SEC03SensitiveAssets = lazy(() => import("./pages/admin/security/SEC03SensitiveAssets"));
const SEC04EdgeFunctionAudit = lazy(() => import("./pages/admin/security/SEC04EdgeFunctionAudit"));
const SEC05ClaimSafety = lazy(() => import("./pages/admin/security/SEC05ClaimSafety"));
const SEC06IncidentRecovery = lazy(() => import("./pages/admin/security/SEC06IncidentRecovery"));

// Frontend Quality
const FE01QualityMatrix = lazy(() => import("./pages/admin/frontend/FE01QualityMatrix"));
const FE02DesignGovernance = lazy(() => import("./pages/admin/frontend/FE02DesignGovernance"));

// Architecture
const GodTierIntegrationBoard = lazy(() => import("./pages/admin/architecture/GodTierIntegrationBoard"));
const GodTierRuntimeBoard = lazy(() => import("./pages/admin/architecture/GodTierRuntimeBoard"));
const EpistemicFirewallBoard = lazy(() => import("./pages/admin/architecture/EpistemicFirewallBoard"));

const EmailApp = lazy(() => import("./pages/apps/EmailApp"));
const MessengerApp = lazy(() => import("./pages/apps/MessengerApp"));
const VaultApp = lazy(() => import("./pages/apps/VaultApp"));
const HealthApp = lazy(() => import("./pages/apps/HealthApp"));
const GalleryApp = lazy(() => import("./pages/apps/GalleryApp"));
const WeatherNewsApp = lazy(() => import("./pages/apps/WeatherNewsApp"));
const CalendarWorkspace = lazy(() => import("./pages/CalendarWorkspace"));
const NotesWorkspace = lazy(() => import("./pages/NotesWorkspace"));
const PeopleWorkspace = lazy(() => import("./pages/PeopleWorkspace"));
const TeamWorkspace = lazy(() => import("./pages/TeamWorkspace"));
const TasksWorkflowsCenter = lazy(() => import("./pages/TasksWorkflowsCenter"));
const DocumentEditor = lazy(() => import("./pages/DocumentEditor"));
const ReportingWorkspace = lazy(() => import("./pages/ReportingWorkspace"));
const TrustCenter = lazy(() => import("./pages/TrustCenter"));
const MediaWorkspace = lazy(() => import("./pages/MediaWorkspace"));
const TemplateCenter = lazy(() => import("./pages/TemplateCenter"));
const ImportExportCenter = lazy(() => import("./pages/ImportExportCenter"));
const PolicySimulatorHub = lazy(() => import("./pages/PolicySimulatorHub"));
const WorkflowReplayHub = lazy(() => import("./pages/WorkflowReplayHub"));
const MobileHome = lazy(() => import("./pages/mobile/MobileHome"));
const MobileApprovals = lazy(() => import("./pages/mobile/MobileApprovals"));
const MobileProof = lazy(() => import("./pages/mobile/MobileProof"));
const MobileAlerts = lazy(() => import("./pages/mobile/MobileAlerts"));
const MobileBoardroom = lazy(() => import("./pages/mobile/MobileBoardroom"));
const MobileWorkflowDetail = lazy(() => import("./pages/mobile/MobileWorkflowDetail"));
const MobileReceiptDetail = lazy(() => import("./pages/mobile/MobileReceiptDetail"));
const MobileApprovalDetail = lazy(() => import("./pages/mobile/MobileApprovalDetail"));
const MobileSettings = lazy(() => import("./pages/mobile/MobileSettings"));

// ── Investment Office ──
const InvestmentBoardroom = lazy(() => import("./pages/investment-office/InvestmentBoardroom"));
const MarketExplorer = lazy(() => import("./pages/investment-office/MarketExplorer"));
const InstrumentDetail = lazy(() => import("./pages/investment-office/InstrumentDetail"));
const PortfolioOffice = lazy(() => import("./pages/investment-office/PortfolioOffice"));
const StrategyStudio = lazy(() => import("./pages/investment-office/StrategyStudio"));
const ExecutionDesk = lazy(() => import("./pages/investment-office/ExecutionDesk"));
const ResearchLibrary = lazy(() => import("./pages/investment-office/ResearchLibrary"));
const ThesisJournal = lazy(() => import("./pages/investment-office/ThesisJournal"));
const RiskOffice = lazy(() => import("./pages/investment-office/RiskOffice"));
const InvestmentAdvisorBoard = lazy(() => import("./pages/investment-office/AdvisorBoard"));
const PlatformConnections = lazy(() => import("./pages/investment-office/PlatformConnections"));
const InvestmentGate = lazy(() => import("./pages/investment-office/InvestmentGate"));
const EventMarketsWorkspace = lazy(() => import("./pages/investment-office/EventMarketsWorkspace"));
const WatchlistsSignals = lazy(() => import("./pages/investment-office/WatchlistsSignals"));
const InvestmentReceipts = lazy(() => import("./pages/investment-office/InvestmentReceipts"));
const BeginnerMode = lazy(() => import("./pages/investment-office/BeginnerMode"));
const AdvancedMode = lazy(() => import("./pages/investment-office/AdvancedMode"));
const CapitalTwin = lazy(() => import("./pages/investment-office/CapitalTwin"));
const DecisionTheater = lazy(() => import("./pages/investment-office/DecisionTheater"));
const TimeMachineReview = lazy(() => import("./pages/investment-office/TimeMachineReview"));
const CatalystWarRoom = lazy(() => import("./pages/investment-office/CatalystWarRoom"));
const OpportunityMap = lazy(() => import("./pages/investment-office/OpportunityMap"));
const InvestmentConstitution = lazy(() => import("./pages/investment-office/InvestmentConstitution"));
const BehavioralFirewall = lazy(() => import("./pages/investment-office/BehavioralFirewall"));
const MarketMemoryFeed = lazy(() => import("./pages/investment-office/MarketMemoryFeed"));
const IntelligenceDossier = lazy(() => import("./pages/investment-office/IntelligenceDossier"));
const EventProbabilityLab = lazy(() => import("./pages/investment-office/EventProbabilityLab"));
const StrategyDNA = lazy(() => import("./pages/investment-office/StrategyDNA"));
const PostTradeLoop = lazy(() => import("./pages/investment-office/PostTradeLoop"));
const CrossAssetStoryEngine = lazy(() => import("./pages/investment-office/CrossAssetStoryEngine"));
const ConvictionEngine = lazy(() => import("./pages/investment-office/ConvictionEngine"));
const PositionSizingCoach = lazy(() => import("./pages/investment-office/PositionSizingCoach"));
const OperatingModes = lazy(() => import("./pages/investment-office/OperatingModes"));
const DecisionReadiness = lazy(() => import("./pages/investment-office/DecisionReadiness"));
const CapitalPurpose = lazy(() => import("./pages/investment-office/CapitalPurpose"));
const WhatWouldBreak = lazy(() => import("./pages/investment-office/WhatWouldBreak"));
const DisagreementEngine = lazy(() => import("./pages/investment-office/DisagreementEngine"));
const FamilyOffice = lazy(() => import("./pages/investment-office/FamilyOffice"));
const KnowledgeGraph = lazy(() => import("./pages/investment-office/KnowledgeGraph"));
const RevenueGate = lazy(() => import("./pages/revenue-office/RevenueGate"));
const GrowthBoardroom = lazy(() => import("./pages/revenue-office/GrowthBoardroom"));
const RelationshipCenter = lazy(() => import("./pages/revenue-office/RelationshipCenter"));
const PipelineStudio = lazy(() => import("./pages/revenue-office/PipelineStudio"));
const FunnelBuilder = lazy(() => import("./pages/revenue-office/FunnelBuilder"));
const CampaignOrchestrator = lazy(() => import("./pages/revenue-office/CampaignOrchestrator"));
const BookingCenter = lazy(() => import("./pages/revenue-office/BookingCenter"));
const OffersWorkspace = lazy(() => import("./pages/revenue-office/OffersWorkspace"));
const ReputationEngine = lazy(() => import("./pages/revenue-office/ReputationEngine"));
const RevenueIntelligence = lazy(() => import("./pages/revenue-office/RevenueIntelligence"));
const RetentionOffice = lazy(() => import("./pages/revenue-office/RetentionOffice"));
const GrowthAdvisorBoard = lazy(() => import("./pages/revenue-office/GrowthAdvisorBoard"));
const JourneyTwin = lazy(() => import("./pages/revenue-office/JourneyTwin"));
const LeakDetector = lazy(() => import("./pages/revenue-office/LeakDetector"));
const ConversionLab = lazy(() => import("./pages/revenue-office/ConversionLab"));
const MembershipCourseOffice = lazy(() => import("./pages/revenue-office/MembershipCourseOffice"));
const OpportunityBoard = lazy(() => import("./pages/revenue-office/OpportunityBoard"));
const TrustPulse = lazy(() => import("./pages/revenue-office/TrustPulse"));
const WhiteLabelOffice = lazy(() => import("./pages/revenue-office/WhiteLabelOffice"));
const BusinessTimeMachine = lazy(() => import("./pages/revenue-office/BusinessTimeMachine"));
const RevenueDecisionTheater = lazy(() => import("./pages/revenue-office/RevenueDecisionTheater"));
const WhatBreaksGrowth = lazy(() => import("./pages/revenue-office/WhatBreaksGrowth"));
const GrowthDNA = lazy(() => import("./pages/revenue-office/GrowthDNA"));
const GrowthOperatingModes = lazy(() => import("./pages/revenue-office/GrowthOperatingModes"));
const ChiefRevenueSynthesis = lazy(() => import("./pages/revenue-office/ChiefRevenueSynthesis"));
const CommercialMemoryFeed = lazy(() => import("./pages/revenue-office/CommercialMemoryFeed"));
const AutomationOffice = lazy(() => import("./pages/revenue-office/AutomationOffice"));
const AutomationBuilder = lazy(() => import("./pages/revenue-office/AutomationBuilder"));
const AutomationTemplates = lazy(() => import("./pages/revenue-office/AutomationTemplates"));
const AutomationSimLab = lazy(() => import("./pages/revenue-office/AutomationSimLab"));
const AutomationHealth = lazy(() => import("./pages/revenue-office/AutomationHealth"));
const AutomationReceipts = lazy(() => import("./pages/revenue-office/AutomationReceipts"));
const AutomationPolicy = lazy(() => import("./pages/revenue-office/AutomationPolicy"));
const QuoteStudio = lazy(() => import("./pages/revenue-office/QuoteStudio"));
const CallDesk = lazy(() => import("./pages/revenue-office/CallDesk"));
const BusinessOnboarding = lazy(() => import("./pages/revenue-office/BusinessOnboarding"));

// ── Digital Presence Office ──
const PresenceGate = lazy(() => import("./pages/digital-presence/PresenceGate"));
const PresenceBoardroom = lazy(() => import("./pages/digital-presence/PresenceBoardroom"));
const WebsiteTwin = lazy(() => import("./pages/digital-presence/WebsiteTwin"));
const SiteBuilder = lazy(() => import("./pages/digital-presence/SiteBuilder"));
const BrandStudio = lazy(() => import("./pages/digital-presence/BrandStudio"));
const ConnectedSites = lazy(() => import("./pages/digital-presence/ConnectedSites"));
const CROOffice = lazy(() => import("./pages/digital-presence/CROOffice"));
const EcommerceOffice = lazy(() => import("./pages/digital-presence/EcommerceOffice"));
const PromotionsOffice = lazy(() => import("./pages/digital-presence/PromotionsOffice"));
const AIWebTeam = lazy(() => import("./pages/digital-presence/AIWebTeam"));
const ErrorRadar = lazy(() => import("./pages/digital-presence/ErrorRadar"));
const ContentFreshness = lazy(() => import("./pages/digital-presence/ContentFreshness"));
const LaunchWarRoom = lazy(() => import("./pages/digital-presence/LaunchWarRoom"));
const PresenceTimeMachine = lazy(() => import("./pages/digital-presence/PresenceTimeMachine"));
const SelfHealingQueue = lazy(() => import("./pages/digital-presence/SelfHealingQueue"));
const AppExperienceStudio = lazy(() => import("./pages/digital-presence/AppExperienceStudio"));
const PresenceAnalytics = lazy(() => import("./pages/digital-presence/PresenceAnalytics"));
const DomainPublishManager = lazy(() => import("./pages/digital-presence/DomainPublishManager"));
const DPOOnboarding = lazy(() => import("./pages/digital-presence/DPOOnboarding"));

// ── ATLAS Gap Closure ──
const ProjectionControlCenter = lazy(() => import("./pages/atlas/ProjectionControlCenter"));
const ProofCoverageBoard = lazy(() => import("./pages/atlas/ProofCoverageBoard"));
const DeploymentTruthCenter = lazy(() => import("./pages/atlas/DeploymentTruthCenter"));
const OperationsCommandCenter = lazy(() => import("./pages/atlas/OperationsCommandCenter"));
const ConnectorControlCenter = lazy(() => import("./pages/atlas/ConnectorControlCenter"));
const ConciergeCommandCenter = lazy(() => import("./pages/atlas/ConciergeCommandCenter"));
const PlatformTruthRegistry = lazy(() => import("./pages/atlas/PlatformTruthRegistry"));
const OperationalInfraMonitor = lazy(() => import("./pages/atlas/OperationalInfraMonitor"));
const DataProtectionPosture = lazy(() => import("./pages/atlas/DataProtectionPosture"));
const ValidationCommandCenter = lazy(() => import("./pages/atlas/ValidationCommandCenter"));
const AdminDurabilityBoard = lazy(() => import("./pages/atlas/AdminDurabilityBoard"));
const AtlasHub = lazy(() => import("./pages/atlas/AtlasHub"));
const CalmFocusMode = lazy(() => import("./pages/CalmFocusMode"));
const WeeklyBoardroom = lazy(() => import("./pages/WeeklyBoardroom"));
const AccessibilitySettings = lazy(() => import("./pages/settings/AccessibilitySettings"));
const DeviceSettingsPage = lazy(() => import("./pages/settings/DeviceSettings"));
const TrustedDeviceManager = lazy(() => import("./pages/settings/TrustedDeviceManager"));
const CommunicationInbox = lazy(() => import("./pages/CommunicationInbox"));

// ── Part V: Shell/Admin/Mobile additions ──
const MobileDeviceTrust = lazy(() => import("./pages/mobile/MobileDeviceTrust"));
const MobileEmergencyActions = lazy(() => import("./pages/mobile/MobileEmergencyActions"));
const MobileQuickCapture = lazy(() => import("./pages/mobile/MobileQuickCapture"));
const EnvironmentAppliancePage = lazy(() => import("./pages/admin/EnvironmentAppliancePage"));
const AuditComplianceWorkspace = lazy(() => import("./pages/admin/AuditComplianceWorkspace"));
const CommandHistory = lazy(() => import("./pages/CommandHistory"));
const EnvironmentSwitcherPage = lazy(() => import("./pages/EnvironmentSwitcher"));
const UpdateCenterPage = lazy(() => import("./pages/UpdateCenter"));

const queryClient = createQueryClient();

// Premium loading skeleton — uses PageSkeleton for content-aware loading
import { PageSkeleton } from "@/components/sita/PageSkeleton";
const PageLoader = () => (
  <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
    <PageSkeleton rows={3} />
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isDemo } = useAuth();
  const { preferences, isLoading: prefsLoading } = useUserPreferences();
  if (loading || prefsLoading) return <div className="min-h-screen flex items-center justify-center bg-background" role="status" aria-label="Loading"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isDemo && !preferences.onboardingCompleted && window.location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
};

// Auth gate for onboarding — requires auth but skips onboarding-completion redirect
const OnboardingGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background" role="status" aria-label="Loading"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// Handle email verification — detect ?type=signup in hash and redirect to onboarding
const EmailVerificationHandler = () => {
  const { user } = useAuth();
  const hash = window.location.hash;
  if (hash.includes("type=signup") || hash.includes("type=email")) {
    if (user) return <Navigate to="/onboarding" replace />;
    return <Navigate to="/login" replace />;
  }
  return null;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background" role="status" aria-label="Loading">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

// Conditional home: landing page for unauthenticated, DailyPulse for authenticated
const HomeRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background" role="status" aria-label="Loading"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  if (!user) return <LandingPage />;
  return <Navigate to="/home" replace />;
};

const AuthenticatedProviders = ({ children }: { children: ReactNode }) => (
  <DataModeProvider>
  <DemoModeProvider>
  <DisplayModeProvider>
  <EntityContextProvider>
  <SitaKernelProvider>
  <OSRuntimeProvider>
  <AppPlatformProvider>
  <InspectorProvider>
  <PlatformInit />
  {children}
  </InspectorProvider>
  </AppPlatformProvider>
  </OSRuntimeProvider>
  </SitaKernelProvider>
  </EntityContextProvider>
  </DisplayModeProvider>
  </DemoModeProvider>
  </DataModeProvider>
);

const App = () => (
  <GlobalErrorBoundary>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
           <ConnectivityProvider>
           <OfflineBanner />
           <ThemeProvider>
          <RealityModeProvider>
          <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* ═══════════════════════════════════════════════════════════════
                TIER 1: PUBLIC — No kernel, no OS runtime, PublicLayout only
                5 routes: landing, login, signup, forgot/reset password
               ═══════════════════════════════════════════════════════════════ */}
            <Route path="/login" element={<PublicLayout><PublicRoute><Login /></PublicRoute></PublicLayout>} />
            <Route path="/signup" element={<PublicLayout><PublicRoute><Signup /></PublicRoute></PublicLayout>} />
            <Route path="/forgot-password" element={<PublicLayout><PublicRoute><ForgotPassword /></PublicRoute></PublicLayout>} />
            <Route path="/reset-password" element={<PublicLayout><ResetPassword /></PublicLayout>} />
            <Route path="/" element={<PublicLayout><HomeRoute /></PublicLayout>} />

            {/* ═══════════════════════════════════════════════════════════════
                TIER 2: AUTHENTICATED, NO SHELL — OS providers active, no sidebar
                Onboarding ceremony, mobile shell, auth callback
               ═══════════════════════════════════════════════════════════════ */}
            <Route path="/*" element={
              <AuthenticatedProviders>
              <Suspense fallback={<PageLoader />}>
              <Routes>
            <Route path="/onboarding" element={<OnboardingGuard><Onboarding /></OnboardingGuard>} />
            <Route path="/auth/callback" element={<EmailVerificationHandler />} />
            <Route path="/first-win" element={<ProtectedRoute><FirstWinActivation /></ProtectedRoute>} />
            <Route path="/learn-later" element={<ProtectedRoute><LearnLaterPage /></ProtectedRoute>} />

            <Route path="/mobile" element={<ProtectedRoute><MobileHome /></ProtectedRoute>} />
            <Route path="/mobile/approvals" element={<ProtectedRoute><MobileApprovals /></ProtectedRoute>} />
            <Route path="/mobile/proof" element={<ProtectedRoute><MobileProof /></ProtectedRoute>} />
            <Route path="/mobile/alerts" element={<ProtectedRoute><MobileAlerts /></ProtectedRoute>} />
            <Route path="/mobile/boardroom" element={<ProtectedRoute><MobileBoardroom /></ProtectedRoute>} />
            <Route path="/mobile/workflow/:id" element={<ProtectedRoute><MobileWorkflowDetail /></ProtectedRoute>} />
            <Route path="/mobile/receipt/:id" element={<ProtectedRoute><MobileReceiptDetail /></ProtectedRoute>} />
            <Route path="/mobile/approval/:id" element={<ProtectedRoute><MobileApprovalDetail /></ProtectedRoute>} />
            <Route path="/mobile/settings" element={<ProtectedRoute><MobileSettings /></ProtectedRoute>} />
            <Route path="/mobile/device-trust" element={<ProtectedRoute><MobileDeviceTrust /></ProtectedRoute>} />
            <Route path="/mobile/emergency" element={<ProtectedRoute><MobileEmergencyActions /></ProtectedRoute>} />
            <Route path="/mobile/capture" element={<ProtectedRoute><MobileQuickCapture /></ProtectedRoute>} />

            {/* ═══════════════════════════════════════════════════════════════
                TIER 3: FULL OS SHELL — Authenticated + ShellLayout (sidebar, header, command palette)
                ~380 routes: OS Core, Offices, Workspaces, Built-in Apps, App Platform
               ═══════════════════════════════════════════════════════════════ */}
            <Route path="*" element={
              <ProtectedRoute>
                <ShellLayout>
                  <AdminCommandPaletteWrapper />
                  <AdminKeyboardShortcutsWrapper />
                  <RouteErrorBoundary>
                  <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* ── 3A: OS Home & Desktop ── */}
                    <Route path="/" element={<DesktopPage />} />
                    <Route path="/home" element={<DailyPulse />} />
                    <Route path="/desktop" element={<DesktopPage />} />
                    <Route path="/profile" element={<UserProfilePage />} />
                    <Route path="/life" element={<LifeDashboard />} />
                    <Route path="/life-simulator" element={<LifeSimulator />} />
                    <Route path="/personal-life" element={<PersonalLifeWorkspace />} />
                    <Route path="/downloads" element={<DownloadsCenter />} />
                    <Route path="/storage" element={<StorageManager />} />
                    <Route path="/network" element={<NetworkUtility />} />
                    <Route path="/planning-canvas" element={<PlanningCanvas />} />
                    <Route path="/my-activity" element={<MyActivity />} />

                    {/* ── 3B: OS Core Space — Business ── */}
                    <Route path="/business" element={<BusinessCenter />} />
                    <Route path="/business/overview" element={<BusinessCenter />} />
                    <Route path="/business/leads" element={<BusinessCenter />} />
                    <Route path="/business/customers" element={<BusinessCenter />} />
                    <Route path="/business/opportunities" element={<BusinessCenter />} />
                    <Route path="/business/quotes" element={<BusinessCenter />} />
                    <Route path="/business/invoices" element={<BusinessCenter />} />
                    <Route path="/business/collections" element={<BusinessCenter />} />
                     <Route path="/business/revenue-autopilot" element={<BusinessCenter />} />
                     <Route path="/business/autopilot-hub" element={<BusinessCenter />} />
                     <Route path="/business/revenue-impact" element={<BusinessCenter />} />
                      <Route path="/business/playbook-builder" element={<BusinessCenter />} />
                      <Route path="/business/revenue-forecast" element={<BusinessCenter />} />
                    <Route path="/business/communications" element={<BusinessCenter />} />
                    <Route path="/business/boardroom" element={<BusinessCenter />} />
                    <Route path="/business/proof" element={<BusinessCenter />} />
                    <Route path="/business/files" element={<BusinessCenter />} />
                    <Route path="/business/settings" element={<BusinessCenter />} />
                    <Route path="/business/customers/:id" element={<CustomerDetail />} />
                    <Route path="/business/customer-health" element={<CustomerHealthPage />} />

                    {/* ── 3B: OS Core Space — Money ── */}
                    <Route path="/money" element={<MoneyCenter />} />
                    <Route path="/money/overview" element={<MoneyCenter />} />
                    <Route path="/money/bills" element={<MoneyCenter />} />
                    <Route path="/money/subscriptions" element={<MoneyCenter />} />
                    <Route path="/money/reserves" element={<MoneyCenter />} />
                    <Route path="/money/cash-timing" element={<MoneyCenter />} />
                    <Route path="/money/receivables" element={<MoneyCenter />} />
                    <Route path="/money/investment-office" element={<MoneyCenter />} />
                    <Route path="/money/tax" element={<MoneyCenter />} />
                    <Route path="/money/family-office" element={<MoneyCenter />} />
                    <Route path="/money/approvals" element={<MoneyCenter />} />
                    <Route path="/money/proof" element={<MoneyCenter />} />
                    <Route path="/money/files" element={<MoneyCenter />} />
                    <Route path="/money/documents" element={<MoneyCenter />} />
                    <Route path="/money/boardroom" element={<MoneyCenter />} />
                    <Route path="/money/settings" element={<MoneyCenter />} />

                    {/* ── 3B: OS Office — Investment Office (38 routes) ── */}
                    <Route path="/investments" element={<InvestmentGate />} />
                    <Route path="/investments/boardroom" element={<InvestmentBoardroom />} />
                    <Route path="/investments/markets" element={<MarketExplorer />} />
                    <Route path="/investments/instrument/:instrumentId" element={<InstrumentDetail />} />
                    <Route path="/investments/portfolio" element={<PortfolioOffice />} />
                    <Route path="/investments/strategy" element={<StrategyStudio />} />
                    <Route path="/investments/execute" element={<ExecutionDesk />} />
                    <Route path="/investments/research" element={<ResearchLibrary />} />
                    <Route path="/investments/journal" element={<ThesisJournal />} />
                    <Route path="/investments/risk" element={<RiskOffice />} />
                    <Route path="/investments/advisors" element={<InvestmentAdvisorBoard />} />
                    <Route path="/investments/platforms" element={<PlatformConnections />} />
                    <Route path="/investments/events" element={<EventMarketsWorkspace />} />
                    <Route path="/investments/watchlists" element={<WatchlistsSignals />} />
                    <Route path="/investments/receipts" element={<InvestmentReceipts />} />
                    <Route path="/investments/beginner" element={<BeginnerMode />} />
                    <Route path="/investments/advanced" element={<AdvancedMode />} />
                    <Route path="/investments/capital-twin" element={<CapitalTwin />} />
                    <Route path="/investments/decision-theater" element={<DecisionTheater />} />
                    <Route path="/investments/time-machine" element={<TimeMachineReview />} />
                    <Route path="/investments/catalysts" element={<CatalystWarRoom />} />
                    <Route path="/investments/opportunity-map" element={<OpportunityMap />} />
                    <Route path="/investments/constitution" element={<InvestmentConstitution />} />
                    <Route path="/investments/behavioral" element={<BehavioralFirewall />} />
                    <Route path="/investments/memory" element={<MarketMemoryFeed />} />
                    <Route path="/investments/dossier" element={<IntelligenceDossier />} />
                    <Route path="/investments/probability-lab" element={<EventProbabilityLab />} />
                    <Route path="/investments/strategy-dna" element={<StrategyDNA />} />
                    <Route path="/investments/post-trade" element={<PostTradeLoop />} />
                    <Route path="/investments/cross-asset" element={<CrossAssetStoryEngine />} />
                    <Route path="/investments/conviction" element={<ConvictionEngine />} />
                    <Route path="/investments/sizing" element={<PositionSizingCoach />} />
                    <Route path="/investments/modes" element={<OperatingModes />} />
                    <Route path="/investments/readiness" element={<DecisionReadiness />} />
                    <Route path="/investments/capital-purpose" element={<CapitalPurpose />} />
                    <Route path="/investments/what-would-break" element={<WhatWouldBreak />} />
                    <Route path="/investments/disagreements" element={<DisagreementEngine />} />
                    <Route path="/investments/family-office" element={<FamilyOffice />} />
                    <Route path="/investments/knowledge-graph" element={<KnowledgeGraph />} />
                    <Route path="/money/investments" element={<InvestmentGate />} />

                    {/* ── 3B: OS Office — Revenue Office (40 routes) ── */}
                    <Route element={<RevenueOfficeModeLayout />}>
                     <Route path="/revenue-office" element={<RevenueGate />} />
                     <Route path="/revenue-office/boardroom" element={<GrowthBoardroom />} />
                     <Route path="/revenue-office/relationships" element={<RelationshipCenter />} />
                     <Route path="/revenue-office/pipeline" element={<PipelineStudio />} />
                     <Route path="/revenue-office/funnels" element={<FunnelBuilder />} />
                     <Route path="/revenue-office/campaigns" element={<CampaignOrchestrator />} />
                     <Route path="/revenue-office/bookings" element={<BookingCenter />} />
                     <Route path="/revenue-office/offers" element={<OffersWorkspace />} />
                     <Route path="/revenue-office/reputation" element={<ReputationEngine />} />
                     <Route path="/revenue-office/intelligence" element={<RevenueIntelligence />} />
                     <Route path="/revenue-office/retention" element={<RetentionOffice />} />
                     <Route path="/revenue-office/advisors" element={<GrowthAdvisorBoard />} />
                     <Route path="/revenue-office/journey-twin" element={<JourneyTwin />} />
                     <Route path="/revenue-office/leaks" element={<LeakDetector />} />
                     <Route path="/revenue-office/conversion-lab" element={<ConversionLab />} />
                     <Route path="/revenue-office/memberships" element={<MembershipCourseOffice />} />
                     <Route path="/revenue-office/opportunities" element={<OpportunityBoard />} />
                     <Route path="/revenue-office/trust-pulse" element={<TrustPulse />} />
                     <Route path="/revenue-office/white-label" element={<WhiteLabelOffice />} />
                     <Route path="/revenue-office/time-machine" element={<BusinessTimeMachine />} />
                     <Route path="/revenue-office/decision-theater" element={<RevenueDecisionTheater />} />
                     <Route path="/revenue-office/what-breaks" element={<WhatBreaksGrowth />} />
                     <Route path="/revenue-office/growth-dna" element={<GrowthDNA />} />
                     <Route path="/revenue-office/operating-modes" element={<GrowthOperatingModes />} />
                     <Route path="/revenue-office/synthesis" element={<ChiefRevenueSynthesis />} />
                     <Route path="/revenue-office/memory-feed" element={<CommercialMemoryFeed />} />
                     <Route path="/revenue-office/forms" element={<FormsBuilder />} />
                     <Route path="/revenue-office/segmentation" element={<SegmentationEngine />} />
                     <Route path="/revenue-office/client-onboarding" element={<ClientOnboarding />} />
                     <Route path="/revenue-office/automation" element={<AutomationOffice />} />
                     <Route path="/revenue-office/automation/builder" element={<AutomationBuilder />} />
                     <Route path="/revenue-office/automation/templates" element={<AutomationTemplates />} />
                     <Route path="/revenue-office/automation/simulation" element={<AutomationSimLab />} />
                     <Route path="/revenue-office/automation/health" element={<AutomationHealth />} />
                     <Route path="/revenue-office/automation/receipts" element={<AutomationReceipts />} />
                     <Route path="/revenue-office/automation/policy" element={<AutomationPolicy />} />
                     <Route path="/revenue-office/quotes" element={<QuoteStudio />} />
                     <Route path="/revenue-office/calls" element={<CallDesk />} />
                     <Route path="/revenue-office/onboarding" element={<BusinessOnboarding />} />
                    </Route>

                    {/* ═══════════════════════════════════════════════════════════════
                        TIER 4: ADMIN / BUILDER — Platform governance, /admin/* prefix
                        ~280 routes: AI Engineering, DRS, SAG, Automation, Launch, Security, etc.
                       ═══════════════════════════════════════════════════════════════ */}
                    {/* AI Runtime */}
                    <Route path="/admin/ai-runtime" element={<AIRuntimeStatus />} />
                    <Route path="/admin/persistence-status" element={<PersistenceStatus />} />
                    <Route path="/admin/system-health" element={<SystemHealthDashboard />} />
                    <Route path="/admin/brain-core" element={<BrainCoreDashboard />} />
                    <Route path="/admin/conscience-gate" element={<ConscienceGateDashboard />} />
                    <Route path="/admin/drs/overview" element={<DRS01RealityModeOverview />} />
                    <Route path="/admin/drs/registry" element={<DRS02ModeRegistryConsole />} />
                    <Route path="/admin/drs/scenarios" element={<DRS03ScenarioLibrary />} />
                    <Route path="/admin/drs/entities" element={<DRS04ScenarioEntityGraph />} />
                    <Route path="/admin/drs/providers" element={<DRS05ProviderConsole />} />
                    <Route path="/admin/drs/safety" element={<DRS06DemoPolicySafety />} />
                    <Route path="/admin/drs/ai-control" element={<DRS07DemoAIControl />} />
                    <Route path="/admin/drs/analytics" element={<DRS08AnalyticsSegregation />} />
                    <Route path="/admin/drs/truth" element={<DRS09TruthLabeling />} />
                    <Route path="/admin/drs/launch-gate" element={<DRS10DualRealityLaunchGate />} />
                    <Route path="/admin/mock-elimination" element={<MockEliminationCenter />} />
                    <Route path="/admin/domain-reality" element={<DomainRealityBoard />} />
                    <Route path="/admin/route-diagnostics" element={<RouteSourceDiagnostics />} />

                    {/* AR — Automation Reality */}
                    <Route path="/admin/automation/overview" element={<AR01AutomationOverview />} />
                    <Route path="/admin/automation/jobs" element={<AR02ScheduledJobRegistry />} />
                    <Route path="/admin/automation/self-healing" element={<AR03SelfHealingBoard />} />
                    <Route path="/admin/automation/agent-scheduler" element={<AR04AgentScheduler />} />
                    <Route path="/admin/automation/maintenance" element={<AR05SystemMaintenanceBoard />} />
                    <Route path="/admin/automation/traces" element={<AR06ExecutionTraceExplorer />} />
                    <Route path="/admin/automation/failures" element={<AR07RetryFailureCenter />} />
                    <Route path="/admin/automation/kill-switches" element={<AR08KillSwitchCenter />} />
                    <Route path="/admin/automation/launch-gate" element={<AR09AutomationLaunchGate />} />

                    {/* SAG — Sovereign AI Gateway */}
                    <Route path="/admin/sag/overview" element={<SAGOverview />} />
                    <Route path="/admin/sag/models" element={<SAGModelRegistry />} />
                    <Route path="/admin/sag/routing" element={<SAGRoutingPolicy />} />
                    <Route path="/admin/sag/health" element={<SAGProviderHealth />} />
                    <Route path="/admin/sag/prompts" element={<SAGPromptRegistry />} />
                    <Route path="/admin/sag/economics" element={<SAGEconomicsBoard />} />
                    <Route path="/admin/sag/cost-confidence" element={<SAGCostConfidenceLab />} />
                    <Route path="/admin/sag/multi-stage" element={<SAGMultiStageExplorer />} />
                    <Route path="/admin/sag/receipts" element={<SAGReceiptExplorer />} />
                    <Route path="/admin/sag/fallback" element={<SAGFallbackCenter />} />
                    <Route path="/admin/sag/builder" element={<SAGBuilderConsole />} />
                    <Route path="/admin/sag/compliance" element={<SAGComplianceGate />} />

                    {/* LT — Launch Truth / CI / E2E / Probes / Gates */}
                    <Route path="/admin/truth/behavioral" element={<LT01BehavioralTruthOverview />} />
                    <Route path="/admin/truth/ci-pipeline" element={<LT02CIPipelineCenter />} />
                    <Route path="/admin/truth/e2e-journeys" element={<LT03E2EJourneyBoard />} />
                    <Route path="/admin/truth/runtime-probes" element={<LT04RuntimeProbeCenter />} />
                    <Route path="/admin/truth/launch-gate" element={<LT05LaunchGateBoard />} />
                    <Route path="/admin/truth/route-interaction" element={<LT06RouteInteractionTruth />} />
                    <Route path="/admin/truth/regression-radar" element={<LT07TruthRegressionRadar />} />

                    {/* V — Behavioral Truth Verification Boards */}
                    <Route path="/admin/verification/surfaces" element={<V01SurfaceInventoryBoard />} />
                    <Route path="/admin/verification/coverage" element={<V02InteractionCoverageBoard />} />
                    <Route path="/admin/verification/p0-journeys" element={<V03P0JourneyBoard />} />
                    <Route path="/admin/verification/modes" element={<V04ModeVerificationBoard />} />
                    <Route path="/admin/verification/failures" element={<V05FailureTriageBoard />} />
                    <Route path="/admin/verification/evidence" element={<V06EvidenceExplorer />} />
                    <Route path="/admin/verification/blockers" element={<V07LaunchBlockerBoard />} />

                    {/* CJ — Customer Journey Proof System */}
                    <Route path="/admin/customer-journey/executive" element={<CJ01ExecutiveReport />} />
                    <Route path="/admin/customer-journey/matrix" element={<CJ02JourneyTruthMatrix />} />
                    <Route path="/admin/customer-journey/detail" element={<CJ03JourneyDetailView />} />
                    <Route path="/admin/customer-journey/blockers" element={<CJ04LaunchBlockerView />} />
                    <Route path="/admin/customer-journey/demo-vs-real" element={<CJ05DemoVsRealComparison />} />
                    <Route path="/admin/customer-journey/broken-clicks" element={<CJ06BrokenClicksExplorer />} />
                    <Route path="/admin/customer-journey/remediation" element={<CJ07OwnerRemediationView />} />
                    <Route path="/admin/customer-journey/coverage" element={<CJ08RouteActionCoverage />} />
                    <Route path="/admin/customer-journey/recent-runs" element={<CJ09RecentVerificationRuns />} />

                    {/* ── 3B: OS Office — Digital Presence Office (19 routes) ── */}
                    <Route path="/digital-presence" element={<PresenceGate />} />
                    <Route path="/digital-presence/boardroom" element={<PresenceBoardroom />} />
                    <Route path="/digital-presence/website-twin" element={<WebsiteTwin />} />
                    <Route path="/digital-presence/builder" element={<SiteBuilder />} />
                    <Route path="/digital-presence/brand-studio" element={<BrandStudio />} />
                    <Route path="/digital-presence/connected-sites" element={<ConnectedSites />} />
                    <Route path="/digital-presence/cro" element={<CROOffice />} />
                    <Route path="/digital-presence/ecommerce" element={<EcommerceOffice />} />
                    <Route path="/digital-presence/promotions" element={<PromotionsOffice />} />
                    <Route path="/digital-presence/ai-team" element={<AIWebTeam />} />
                    <Route path="/digital-presence/radar" element={<ErrorRadar />} />
                    <Route path="/digital-presence/content-freshness" element={<ContentFreshness />} />
                    <Route path="/digital-presence/launch" element={<LaunchWarRoom />} />
                    <Route path="/digital-presence/time-machine" element={<PresenceTimeMachine />} />
                    <Route path="/digital-presence/self-healing" element={<SelfHealingQueue />} />
                    <Route path="/digital-presence/app-studio" element={<AppExperienceStudio />} />
                    <Route path="/digital-presence/analytics" element={<PresenceAnalytics />} />
                    <Route path="/digital-presence/domains" element={<DomainPublishManager />} />
                    <Route path="/digital-presence/onboarding" element={<DPOOnboarding />} />

                    {/* ── 3B: OS Core Space — Concierge ── */}
                    <Route path="/concierge" element={<ConciergeCenter />} />
                    <Route path="/concierge/overview" element={<ConciergeCenter />} />
                    <Route path="/concierge/calendar" element={<ConciergeCenter />} />
                    <Route path="/concierge/tasks" element={<ConciergeCenter />} />
                    <Route path="/concierge/school" element={<ConciergeCenter />} />
                    <Route path="/concierge/grocery" element={<ConciergeCenter />} />
                    <Route path="/concierge/appointments" element={<ConciergeCenter />} />
                    <Route path="/concierge/travel" element={<ConciergeCenter />} />
                    <Route path="/concierge/providers" element={<ConciergeCenter />} />
                    <Route path="/concierge/events" element={<ConciergeCenter />} />
                    <Route path="/concierge/workflows" element={<ConciergeCenter />} />
                    <Route path="/concierge/proof" element={<ConciergeCenter />} />
                    <Route path="/concierge/files" element={<ConciergeCenter />} />
                    <Route path="/concierge/boardroom" element={<ConciergeCenter />} />
                    <Route path="/concierge/settings" element={<ConciergeCenter />} />

                    {/* Intelligence */}
                    <Route path="/inbox" element={<InboxCapture />} />
                    <Route path="/inbox/capture" element={<InboxCapture />} />
                    <Route path="/inbox/processed" element={<InboxCapture />} />
                    <Route path="/inbox/review" element={<InboxCapture />} />
                    <Route path="/activity" element={<ActivityStream />} />
                    <Route path="/opportunities" element={<OpportunityEngine />} />
                    <Route path="/outcomes" element={<OutcomeEnginePage />} />
                    <Route path="/spillovers" element={<SpilloverDashboard />} />
                    <Route path="/ai-workforce" element={<AIWorkforcePage />} />
                    <Route path="/capital-allocation" element={<CapitalAllocationPage />} />
                    <Route path="/sovereign-export" element={<SovereignExportPage />} />
                    <Route path="/communications" element={<CommunicationsPage />} />
                    <Route path="/notifications/settings" element={<NotificationSettingsPage />} />
                    <Route path="/settings/notifications" element={<NotificationPreferences />} />
                    <Route path="/notifications" element={<NotificationCenter />} />

                    {/* Approvals — explicit sub-routes */}
                    <Route path="/approvals" element={<ApprovalsCenter />} />
                    <Route path="/approvals/pending" element={<ApprovalsCenter />} />
                    <Route path="/approvals/simulated" element={<ApprovalsCenter />} />
                    <Route path="/approvals/history" element={<ApprovalsCenter />} />

                    {/* Approval Chamber — premium governed surface */}
                    <Route path="/approval-chamber" element={<ApprovalChamber />} />

                    {/* Advisor Workspace — explicit sub-routes + wildcard */}
                    <Route path="/advisors" element={<AdvisorWorkspace />} />
                    <Route path="/advisors/council-dashboard" element={<AdvisorCouncilDashboard />} />
                    <Route path="/advisors/overview" element={<AdvisorWorkspace />} />
                    <Route path="/advisors/compare" element={<AdvisorWorkspace />} />
                    <Route path="/advisors/simulations" element={<AdvisorWorkspace />} />
                    <Route path="/advisors/approvals" element={<AdvisorWorkspace />} />
                    <Route path="/advisors/proof" element={<AdvisorWorkspace />} />
                    <Route path="/advisors/memory" element={<AdvisorWorkspace />} />
                    <Route path="/advisors/:advisorId" element={<AdvisorWorkspace />} />

                    {/* Productivity Hub */}
                    <Route path="/productivity" element={<ProductivityHub />} />
                    <Route path="/productivity/docs" element={<ProductivityHub />} />
                    <Route path="/productivity/sheets" element={<ProductivityHub />} />
                    <Route path="/productivity/slides" element={<ProductivityHub />} />
                    {/* Legacy flat routes */}
                    <Route path="/docs" element={<DocsWorkspace />} />
                    <Route path="/sheets" element={<SheetsWorkspace />} />
                    <Route path="/slides" element={<SlidesWorkspace />} />

                    {/* Pack Store — explicit category routes + dynamic */}
                    <Route path="/store" element={<PackStorePage />} />
                    <Route path="/store/featured" element={<PackStorePage />} />
                    <Route path="/store/installed" element={<PackInstalledPage />} />
                    <Route path="/store/analytics" element={<StoreAnalyticsPage />} />
                    <Route path="/store/packs/:packId" element={<PackDetailPage />} />
                    <Route path="/store/apps/:appId" element={<OldAppDetailPage />} />
                    <Route path="/store/founders" element={<StoreCategoryPage />} />
                    <Route path="/store/families" element={<StoreCategoryPage />} />
                    <Route path="/store/finance" element={<StoreCategoryPage />} />
                    <Route path="/store/connectors" element={<StoreCategoryPage />} />
                    <Route path="/store/surfaces" element={<StoreCategoryPage />} />
                    <Route path="/store/:segment" element={<StoreCategoryPage />} />

                    {/* App Platform */}
                    <Route path="/app-store" element={<AppStorePage />} />
                    <Route path="/app-store/app/:appId" element={<AppPlatformDetailPage />} />
                    <Route path="/app-store/bundle/:bundleId" element={<BundleDetailPage />} />
                    <Route path="/app-store/library" element={<AppLibraryPage />} />
                    <Route path="/app-store/updates" element={<AppUpdatesPage />} />
                    <Route path="/app-store/permissions" element={<AppPermissionsCenterPage />} />
                    <Route path="/app-store/associations" element={<AppAssociationsPage />} />
                    <Route path="/app-store/compare" element={<AppComparePage />} />
                    <Route path="/app-store/manage/:appId" element={<AppManagePage />} />
                    <Route path="/app-store/web-install" element={<WebAppInstallPage />} />
                    <Route path="/app-store/external-install" element={<ExternalInstallerPage />} />
                    <Route path="/app-store/receipts" element={<AppReceiptsPage />} />
                    <Route path="/app-store/receipts/:appId" element={<AppReceiptsPage />} />
                    <Route path="/app-store/receipt/:receiptId" element={<AppReceiptDetailPage />} />
                    <Route path="/app-store/enterprise" element={<EnterpriseCatalogPage />} />
                    <Route path="/app-store/dev-tools" element={<DevToolsCatalogPage />} />
                    <Route path="/app-store/open-with" element={<OpenWithPage />} />
                    <Route path="/app-store/first-launch/:appId" element={<FirstLaunchPage />} />

                    {/* Proof Center — explicit sub-routes */}
                    <Route path="/proof" element={<ProofCenter />} />
                    <Route path="/proof/receipts" element={<ProofCenter />} />
                    <Route path="/proof/executions" element={<ProofCenter />} />
                    <Route path="/proof/verifications" element={<ProofCenter />} />
                    <Route path="/proof/rollbacks" element={<ProofCenter />} />

                    {/* Boardroom — explicit domain sub-routes */}
                    <Route path="/boardroom" element={<Boardroom />} />
                    <Route path="/boardroom/business" element={<Boardroom />} />
                    <Route path="/boardroom/finance" element={<Boardroom />} />
                    <Route path="/boardroom/family" element={<Boardroom />} />
                    <Route path="/boardroom/opportunity" element={<Boardroom />} />
                    <Route path="/boardroom/morning" element={<Boardroom />} />
                    <Route path="/boardroom/weekly" element={<Boardroom />} />
                    <Route path="/boardroom/incidents" element={<Boardroom />} />
                    <Route path="/boardroom/replay" element={<BoardroomReplay />} />
                    <Route path="/boardroom/history" element={<BoardroomHistory />} />

                    {/* Workflows */}
                    <Route path="/workflows" element={<WorkflowsCenter />} />
                    <Route path="/workflows/active" element={<WorkflowsCenter />} />
                    <Route path="/workflows/history" element={<WorkflowsCenter />} />
                    <Route path="/workflows/templates" element={<WorkflowsCenter />} />

                    {/* Files — parent container handles sub-routing */}
                    <Route path="/files" element={<FilesCenter />} />
                    <Route path="/files/overview" element={<FilesCenter />} />
                    <Route path="/files/all" element={<FilesCenter />} />
                    <Route path="/files/processing" element={<FilesCenter />} />
                    <Route path="/files/review" element={<FilesCenter />} />
                    <Route path="/files/search" element={<FilesCenter />} />
                    <Route path="/files/memory" element={<FilesCenter />} />
                    <Route path="/files/memory-review" element={<FilesCenter />} />
                    <Route path="/files/sensitive" element={<FilesCenter />} />
                    <Route path="/files/settings" element={<FilesCenter />} />
                    <Route path="/files/pdf-viewer" element={<PDFViewerWorkspace />} />

                    {/* Data Grid / Spreadsheet */}
                    <Route path="/workspace/data-grid" element={<SpreadsheetWorkspace />} />

                    {/* System Utilities */}
                    <Route path="/clipboard-history" element={<ClipboardHistory />} />
                    <Route path="/print-scan" element={<PrintScanCenter />} />
                    <Route path="/recovery" element={<RecoveryCenter />} />

                    {/* Control */}
                    <Route path="/personalization" element={<PersonalizationStudio />} />
                    <Route path="/personalization/profile" element={<PersonalizationStudio />} />
                    <Route path="/personalization/preferences" element={<PersonalizationStudio />} />
                    <Route path="/personalization/memory" element={<PersonalizationStudio />} />
                    <Route path="/personalization/automation" element={<PersonalizationStudio />} />
                    <Route path="/personalization/boardroom" element={<PersonalizationStudio />} />
                    <Route path="/memory" element={<MemoryCenter />} />
                    <Route path="/memory/profile" element={<MemoryCenter />} />
                    <Route path="/memory/business" element={<MemoryCenter />} />
                    <Route path="/memory/money" element={<MemoryCenter />} />
                    <Route path="/memory/household" element={<MemoryCenter />} />
                    <Route path="/memory/workflows" element={<MemoryCenter />} />
                    <Route path="/memory/preferences" element={<MemoryCenter />} />
                    <Route path="/automation" element={<AutomationCenter />} />
                    <Route path="/automation/rules" element={<AutomationCenter />} />
                    <Route path="/automation/trust" element={<AutomationCenter />} />
                    <Route path="/automation/delegations" element={<AutomationCenter />} />
                    <Route path="/system" element={<SystemStatus />} />
                    <Route path="/system/trust" element={<SystemStatus />} />
                    <Route path="/system/health" element={<SystemStatus />} />
                    <Route path="/system/connectors" element={<SystemStatus />} />
                    <Route path="/system/history" element={<SystemStatus />} />
                    <Route path="/system/slos" element={<SystemStatus />} />
                    <Route path="/system/self-healing" element={<SystemStatus />} />
                    <Route path="/system/incidents" element={<SystemStatus />} />
                    <Route path="/system/fleet" element={<SystemStatus />} />

                    {/* Agent Activity Dashboard */}
                    <Route path="/agent-activity" element={<AgentActivityDashboard />} />
                    <Route path="/revenue-calling" element={<RevenueCallingPage />} />

                    {/* Phase 5 — Platform Intelligence */}
                    <Route path="/integration-concierge" element={<IntegrationConcierge />} />
                    <Route path="/integrations" element={<IntegrationsCatalog />} />
                    <Route path="/integrations/provider/:providerId" element={<ProviderDetail />} />
                    <Route path="/integrations/connections" element={<ConnectionsList />} />
                    <Route path="/integrations/connections/:connectionId" element={<ConnectionDetail />} />
                    <Route path="/integrations/actions" element={<ActionsApprovals />} />
                    <Route path="/digital-twins" element={<DigitalTwinsPage />} />
                    <Route path="/digital-twins/business" element={<DigitalTwinsPage />} />
                    <Route path="/digital-twins/money" element={<DigitalTwinsPage />} />
                    <Route path="/digital-twins/household" element={<DigitalTwinsPage />} />
                    <Route path="/scenario-lab" element={<ScenarioLabPage />} />
                    <Route path="/ai-economics" element={<AIEconomicsPage />} />
                    <Route path="/recovered-value" element={<RecoveredValuePage />} />

                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/settings/trust" element={<SettingsPage />} />
                    <Route path="/settings/profile" element={<SettingsPage />} />
                    <Route path="/settings/connectors" element={<SettingsPage />} />
                    <Route path="/settings/permissions" element={<SettingsPage />} />
                    <Route path="/settings/billing" element={<SettingsPage />} />
                    <Route path="/settings/notifications" element={<SettingsPage />} />
                    <Route path="/settings/privacy" element={<SettingsPage />} />
                    <Route path="/settings/appearance" element={<SettingsPage />} />
                    <Route path="/settings/accessibility" element={<AccessibilitySettings />} />
                    <Route path="/settings/device" element={<DeviceSettingsPage />} />
                    <Route path="/settings/trusted-devices" element={<TrustedDeviceManager />} />

                    {/* Display Modes */}
                    <Route path="/display-modes" element={<CalmFocusMode />} />

                    {/* Weekly Boardroom */}
                    <Route path="/boardroom/weekly-review" element={<WeeklyBoardroom />} />

                    {/* Unified Communication Inbox */}
                    <Route path="/communication-inbox" element={<CommunicationInbox />} />

                    {/* Part V: Shell/Admin additions */}
                    <Route path="/command-history" element={<CommandHistory />} />
                    <Route path="/environment-switcher" element={<EnvironmentSwitcherPage />} />
                    <Route path="/update-center" element={<UpdateCenterPage />} />
                    <Route path="/admin/environment-appliance" element={<EnvironmentAppliancePage />} />
                    <Route path="/admin/audit-compliance" element={<AuditComplianceWorkspace />} />

                    {/* Mission Control — explicit sub-routes */}
                    <Route path="/mission-control" element={<MissionControl />} />
                    <Route path="/mission-control/agents" element={<MissionControl />} />
                    <Route path="/mission-control/incidents" element={<MissionControl />} />
                    <Route path="/mission-control/connectors" element={<MissionControl />} />
                    <Route path="/mission-control/workflows" element={<MissionControl />} />
                    <Route path="/mission-control/costs" element={<MissionControl />} />
                    <Route path="/mission-control/policies" element={<MissionControl />} />
                    <Route path="/mission-control/releases" element={<MissionControl />} />
                    <Route path="/mission-control/safe-mode" element={<MissionControl />} />
                    <Route path="/mission-control/permissions" element={<MissionControl />} />
                    <Route path="/mission-control/platform-truth" element={<MissionControl />} />

                    {/* Mission Drill-Downs (Layer 2 — Advanced Ops) */}
                    <Route path="/mission/overview" element={<MissionOverview />} />
                    <Route path="/mission/connectors/:connectorId" element={<ConnectorDetail />} />
                    <Route path="/mission/connectors/:connectorId/health" element={<ConnectorDetail />} />
                    <Route path="/mission/connectors/:connectorId/logs" element={<ConnectorDetail />} />
                    <Route path="/mission/incidents/:incidentId" element={<IncidentDetail />} />
                    <Route path="/mission/policies/simulate" element={<PolicySimulator />} />
                    <Route path="/mission/registry" element={<MissionRegistryPage />} />
                    <Route path="/mission/releases/:releaseId" element={<MissionReleaseDetailPage />} />
                    <Route path="/mission/workflows/:workflowId/replay" element={<MissionWorkflowReplayPage />} />
                    <Route path="/mission/error" element={<MissionError />} />
                    <Route path="/mission/policy-simulator" element={<PolicySimulatorHub />} />
                    <Route path="/mission/workflow-replay" element={<WorkflowReplayHub />} />

                    {/* ATLAS Gap Closure — Operator Command Surfaces */}
                    <Route path="/atlas" element={<AtlasHub />} />
                    <Route path="/atlas/admin" element={<AdminDurabilityBoard />} />
                    <Route path="/atlas/projections" element={<ProjectionControlCenter />} />
                    <Route path="/atlas/proof" element={<ProofCoverageBoard />} />
                    <Route path="/atlas/deployment" element={<DeploymentTruthCenter />} />
                    <Route path="/atlas/operations" element={<OperationsCommandCenter />} />
                    <Route path="/atlas/connectors" element={<ConnectorControlCenter />} />
                    <Route path="/atlas/concierge" element={<ConciergeCommandCenter />} />
                    <Route path="/atlas/truth-registry" element={<PlatformTruthRegistry />} />
                    <Route path="/atlas/data-protection" element={<DataProtectionPosture />} />
                    <Route path="/atlas/validation" element={<ValidationCommandCenter />} />
                    <Route path="/atlas/infrastructure" element={<OperationalInfraMonitor />} />

                    <Route path="/incidents" element={<Navigate to="/mission-control" replace />} />

                    {/* Owner — Advanced Workspace (Layer 2) — wrapped in OwnerWorkspaceShell */}
                    <Route element={<OwnerShellLayout />}>
                      <Route path="/owner" element={<OwnerCenter />} />
                      <Route path="/owner/home" element={<Navigate to="/owner" replace />} />
                      <Route path="/owner/health" element={<Navigate to="/owner" replace />} />
                      <Route path="/owner/pulse" element={<OwnerPulsePage />} />
                      <Route path="/owner/trust" element={<Navigate to="/owner/trust-center" replace />} />
                      <Route path="/owner/approvals" element={<OwnerApprovalsPage />} />
                      <Route path="/owner/ai-team" element={<Navigate to="/owner/internal-agents" replace />} />
                      <Route path="/owner/ai-team/updates" element={<OwnerAiTeamUpdatesPage />} />
                      <Route path="/owner/incidents" element={<OwnerCenter />} />
                      <Route path="/owner/intelligence" element={<OwnerCenter />} />
                      <Route path="/owner/policies" element={<OwnerCenter />} />
                      <Route path="/owner/fleet" element={<OwnerCenter />} />
                      <Route path="/owner/council" element={<OwnerCenter />} />
                      <Route path="/owner/audit" element={<OwnerCenter />} />
                      <Route path="/owner/connector-health" element={<OwnerCenter />} />
                      <Route path="/owner/connectors" element={<OwnerCenter />} />
                      <Route path="/owner/costs" element={<OwnerCenter />} />
                      <Route path="/owner/internal-agents" element={<OwnerCenter />} />
                      <Route path="/owner/workflow-control" element={<OwnerCenter />} />
                      <Route path="/owner/trust-center" element={<OwnerCenter />} />
                      <Route path="/owner/autopilot" element={<OwnerCenter />} />
                      <Route path="/owner/billing" element={<OwnerCenter />} />
                      <Route path="/owner/releases" element={<OwnerCenter />} />
                      <Route path="/owner/model-routing" element={<OwnerCenter />} />
                      <Route path="/owner/system-map" element={<OwnerCenter />} />
                      <Route path="/owner/knowledge" element={<OwnerCenter />} />
                      <Route path="/owner/support" element={<OwnerCenter />} />
                      <Route path="/owner/change-review" element={<OwnerCenter />} />
                      <Route path="/owner/rollback-center" element={<OwnerCenter />} />
                      <Route path="/owner/governance" element={<OwnerCenter />} />
                      <Route path="/owner/pricing" element={<PricingEditor />} />
                      <Route path="/owner/packs" element={<PackEditorPage />} />
                      <Route path="/owner/advisors" element={<AdvisorConfigPage />} />
                      <Route path="/owner/leases" element={<LeaseDashboard />} />
                      <Route path="/owner/constitution" element={<ConstitutionEditor />} />
                    </Route>

                    {/* Owner Mode — redirects to /owner */}
                    <Route path="/owner-mode" element={<Navigate to="/owner" replace />} />
                    <Route path="/owner-mode/home" element={<Navigate to="/owner" replace />} />

                    {/* Workspace — Dual Reality */}
                    <Route path="/workspace/principal" element={<PrincipalWorkspace />} />
                    <Route path="/workspace/operator" element={<OperatorWorkspace />} />

                    {/* Governance Dashboard */}
                    <Route path="/governance" element={<GovernanceDashboard />} />
                    <Route path="/governance/trust-debt" element={<GovernanceDashboard />} />
                    <Route path="/governance/execution-debt" element={<GovernanceDashboard />} />
                    <Route path="/governance/drag" element={<GovernanceDashboard />} />
                    <Route path="/governance/readiness" element={<GovernanceDashboard />} />
                    <Route path="/governance/delegation" element={<GovernanceDashboard />} />

                    {/* Global Admin Surfaces — redirected to canonical locations */}
                    <Route path="/workflow-replay" element={<Navigate to="/mission/workflows/latest/replay" replace />} />
                    <Route path="/observability" element={<ObservabilityPage />} />
                    <Route path="/users" element={<UsersAdminPage />} />
                    <Route path="/policy-simulator" element={<Navigate to="/mission/policies/simulate" replace />} />
                    <Route path="/system-status" element={<Navigate to="/observability" replace />} />
                    <Route path="/service-architecture" element={<ServiceArchitectureDashboard />} />
                    <Route path="/permissions" element={<PermissionsCenter />} />

                    {/* Redirects — merge rule */}
                    <Route path="/policies/simulator" element={<Navigate to="/mission/policies/simulate" replace />} />

                    <Route path="/enterprise" element={<EnterpriseControlPlane />} />
                    <Route path="/enterprise/roles" element={<EnterpriseControlPlane />} />
                    <Route path="/enterprise/compliance" element={<EnterpriseControlPlane />} />
                    <Route path="/enterprise/sla" element={<EnterpriseControlPlane />} />
                    <Route path="/enterprise/fleet" element={<EnterpriseControlPlane />} />
                    <Route path="/enterprise/maturity" element={<EnterpriseMaturityDashboard />} />
                    <Route path="/enterprise-maturity" element={<EnterpriseMaturityDashboard />} />

                    {/* Policy Engine */}
                    <Route path="/policies" element={<PolicyEditor />} />

                    {/* Connector Hub */}
                    <Route path="/connectors" element={<ConnectorHub />} />

                    {/* Advisor Registry */}
                    <Route path="/advisors/registry" element={<AdvisorRegistry />} />

                    {/* Household Command Center */}
                    <Route path="/concierge/household" element={<ConciergeCenter />} />

                    {/* Global Search */}
                    <Route path="/search" element={<SearchPage />} />

                    {/* Admin — wrapped in AdminShell */}
                    <Route element={<AdminShellLayout />}>
                    <Route path="/admin/generated-truth" element={<GeneratedTruthDashboard />} />
                    <Route path="/admin/fleet-health" element={<FleetHealthPage />} />
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/team" element={<TeamManagement />} />
                    <Route path="/admin/system" element={<SystemManagement />} />
                    <Route path="/admin/users" element={<UserManagement />} />
                    <Route path="/admin/ai-tokens" element={<AITokenDashboard />} />
                    <Route path="/admin/incidents" element={<IncidentCommandCenter />} />
                    <Route path="/admin/deployment" element={<AdminDeploymentTruthCenter />} />
                    <Route path="/admin/proof-matrix" element={<ProofMatrixExplorer />} />
                    <Route path="/admin/connectors" element={<ConnectorGovernanceCenter />} />
                    <Route path="/admin/connectors/overview" element={<CN01ConnectorRealityOverview />} />
                    <Route path="/admin/connectors/registry" element={<CN02ConnectorRegistryConsole />} />
                    <Route path="/admin/connectors/accounts" element={<CN03AccountLinkageBoard />} />
                    <Route path="/admin/connectors/sync" element={<CN04SyncTruthCenter />} />
                    <Route path="/admin/connectors/health" element={<CN05ConnectorHealthBoard />} />
                    <Route path="/admin/connectors/demo" element={<CN06ConnectorDemoReview />} />
                    <Route path="/admin/connectors/launch-gate" element={<CN07ConnectorLaunchGate />} />
                    <Route path="/admin/msa/overview" element={<MSA01MultiSurfaceOverview />} />
                    <Route path="/admin/msa/boundary" element={<MSA02CoreSurfaceBoundary />} />
                    <Route path="/admin/msa/capabilities" element={<MSA03CapabilityPortability />} />
                    <Route path="/admin/msa/adapters" element={<MSA04SurfaceAdapterRegistry />} />
                    <Route path="/admin/msa/compatibility" element={<MSA05CompatibilityRadar />} />
                    <Route path="/admin/pfa/families" element={<PFA01ProviderFamilyRegistry />} />
                    <Route path="/admin/pfa/capabilities" element={<PFA02ProviderCapabilityMatrix />} />
                    <Route path="/admin/pfa/oauth-clients" element={<PFA03OAuthClientRegistry />} />
                    <Route path="/admin/pfa/consent" element={<PFA04ConsentLedgerExplorer />} />
                    <Route path="/admin/pfa/scope-policy" element={<PFA05ScopePolicyMatrix />} />
                    <Route path="/admin/pfa/upgrades" element={<PFA06PermissionUpgradeCenter />} />
                    <Route path="/admin/pfa/health-drift" element={<PFA07ConnectorHealthDrift />} />
                    <Route path="/admin/pfa/account-graph" element={<PFA08AccountGraphExplorer />} />
                     </Route>
                     <Route path="/settings/connected-accounts" element={<PFA09ConnectedAccountsCenter />} />
                     <Route path="/settings/google" element={<GoogleConnectedAccounts />} />
                     <Route element={<AdminShellLayout />}>
                    <Route path="/admin/pfa/launch-honesty" element={<PFA10IntegrationLaunchHonesty />} />
                    <Route path="/admin/pfa/google" element={<GoogleProviderFamilyDashboard />} />
                    <Route path="/admin/isa/identity-providers" element={<ISA01IdentityProviderRegistryBoard />} />
                    <Route path="/admin/isa/connector-providers" element={<ISA02ConnectorProviderRegistryBoard />} />
                    <Route path="/admin/isa/oauth-clients" element={<ISA03OAuthClientRegistryConsole />} />
                    <Route path="/admin/isa/consent-ledger" element={<ISA04ConsentLedgerExplorer />} />
                    <Route path="/admin/isa/scope-policy" element={<ISA05ScopePolicyMatrixBoard />} />
                    <Route path="/admin/isa/account-graph" element={<ISA06UnifiedAccountGraphExplorer />} />
                    <Route path="/admin/isa/truth-board" element={<ISA07AuthConnectorTruthBoard />} />
                    <Route path="/admin/aig/providers" element={<AIG01ProviderRegistry />} />
                    <Route path="/admin/aig/models" element={<AIG02ModelRegistry />} />
                    <Route path="/admin/aig/routing" element={<AIG03RoutingMatrix />} />
                    <Route path="/admin/aig/budget" element={<AIG04BudgetCenter />} />
                    <Route path="/admin/aig/receipts" element={<AIG05ReceiptsExplorer />} />
                    <Route path="/admin/aig/launch-truth" element={<AIG06LaunchTruth />} />
                    <Route path="/admin/aig/launch-truth-detail" element={<AIG07LaunchTruth />} />
                    <Route path="/admin/aig/degraded" element={<AIG08DegradedDiagnostics />} />
                    <Route path="/admin/aig/runtime-verification" element={<AIG09RuntimeVerification />} />
                    <Route path="/admin/uao/presence" element={<UAO01PresenceContinuity />} />
                    <Route path="/admin/uao/devices" element={<UAO02ConnectedDevices />} />
                    <Route path="/admin/uao/team" element={<UAO03AmbientTeamControl />} />
                    <Route path="/admin/uao/notifications" element={<UAO04NotificationRouter />} />
                    <Route path="/admin/uao/health" element={<UAO05HealthReadiness />} />
                    <Route path="/admin/uao/trust" element={<UAO06DeviceTrust />} />
                    <Route path="/admin/uao/journeys" element={<UAO07CrossSurfaceJourney />} />
                    <Route path="/admin/uao/launch" element={<UAO08AmbientLaunchReadiness />} />
                    {/* DWE — Device & Wearable Expansion */}
                    <Route path="/admin/dwe/devices" element={<DWE01ConnectedDevicesCenter />} />
                    <Route path="/admin/dwe/presence" element={<DWE02PresenceContinuityCenter />} />
                    <Route path="/admin/dwe/wearables" element={<DWE03WearableSignalsCenter />} />
                    <Route path="/admin/dwe/notifications" element={<DWE04NotificationRoutingStudio />} />
                    <Route path="/admin/dwe/trust" element={<DWE05DeviceTrustApprovalsCenter />} />
                    <Route path="/admin/dwe/assistant" element={<DWE06AmbientAssistantCenter />} />
                    <Route path="/admin/dwe/launch-honesty" element={<DWE07DeviceLaunchHonestyBoard />} />
                    {/* APL — Apple Ecosystem */}
                    <Route path="/admin/apl/ecosystem" element={<APL01AppleEcosystemCenter />} />
                    <Route path="/admin/apl/devices-trust" element={<APL02AppleDevicesTrust />} />
                    <Route path="/admin/apl/watch" element={<APL03AppleWatchExperience />} />
                    <Route path="/admin/apl/identity" element={<APL04AppleIdentityAccounts />} />
                    <Route path="/admin/apl/health-consent" element={<APL05AppleHealthConsent />} />
                    <Route path="/admin/apl/launch-readiness" element={<APL06AppleLaunchReadiness />} />
                    {/* AND — Android Ecosystem */}
                    <Route path="/admin/and/ecosystem" element={<AND01AndroidEcosystemCenter />} />
                    <Route path="/admin/and/wearos" element={<AND02WearOSExperience />} />
                    <Route path="/admin/and/trust" element={<AND03AndroidTrustApprovals />} />
                    <Route path="/admin/and/health-consent" element={<AND04AndroidHealthConsent />} />
                    <Route path="/admin/and/launch-readiness" element={<AND05AndroidLaunchReadiness />} />
                    {/* HRS — Health / Readiness / Signal Intelligence */}
                    <Route path="/admin/hrs/consent" element={<HRS01HealthConsentCenter />} />
                    <Route path="/admin/hrs/sources" element={<HRS02SignalSourcesBoard />} />
                    <Route path="/admin/hrs/readiness" element={<HRS03ReadinessExplanation />} />
                    <Route path="/admin/hrs/notification-influence" element={<HRS04NotificationInfluence />} />
                    <Route path="/admin/hrs/assistant-timing" element={<HRS05AssistantTimingBoard />} />
                    <Route path="/admin/hrs/launch-honesty" element={<HRS06SignalLaunchHonesty />} />
                    {/* NRC — Notification Routing + Calm Assistant */}
                    <Route path="/admin/nrc/routing" element={<NRC01RoutingStudio />} />
                    <Route path="/admin/nrc/calmness" element={<NRC02CalmnessCenter />} />
                    <Route path="/admin/nrc/fatigue" element={<NRC03FatigueBoard />} />
                    <Route path="/admin/nrc/queue-matrix" element={<NRC04QueueInterruptMatrix />} />
                    <Route path="/admin/nrc/cross-device" element={<NRC05CrossDeviceDelivery />} />
                    <Route path="/admin/nrc/launch-honesty" element={<NRC06NotificationLaunchHonesty />} />
                    <Route path="/admin/nrc/delivery-receipts" element={<NOT03DeliveryReceiptsExplorer />} />
                    <Route path="/admin/nrc/runtime-verification" element={<NOT01NotificationRuntimeVerification />} />
                    <Route path="/admin/nrc/routing-board" element={<NOT02NotificationRoutingBoard />} />
                    <Route path="/admin/nrc/calm-policy" element={<NOT04CalmPolicyBoard />} />
                    <Route path="/admin/nrc/notification-preferences" element={<NOT05NotificationPreferencesBoard />} />
                    {/* NSS — Native Shell Strategy */}
                    <Route path="/admin/nss/strategy" element={<NSS01StrategyBoard />} />
                    <Route path="/admin/nss/capability-matrix" element={<NSS02CapabilityMatrix />} />
                    <Route path="/admin/nss/trust-continuity" element={<NSS03TrustContinuity />} />
                    <Route path="/admin/nss/launch-honesty" element={<NSS04MobileLaunchHonesty />} />
                    <Route path="/admin/launch-readiness" element={<LaunchReadinessBoard />} />
                    <Route path="/admin/mission-control" element={<MissionControlHome />} />
                    <Route path="/admin/durability" element={<AdminDurabilityBoardPage />} />
                    <Route path="/admin/projections" element={<AdminProjectionControl />} />
                    <Route path="/admin/operations" element={<AdminOperationsCommand />} />
                    <Route path="/admin/security-posture" element={<SecurityPostureBoard />} />
                    <Route path="/admin/truth-registry" element={<AdminTruthRegistry />} />
                    <Route path="/admin/concierge-runtime" element={<ConciergeRuntimeBoard />} />
                    <Route path="/admin/alert-triage" element={<AlertTriageBoard />} />
                    <Route path="/admin/policy-simulator" element={<AdminPolicySimulator />} />
                    <Route path="/admin/workflow-replay" element={<WorkflowReplayAudit />} />
                    <Route path="/admin/intelligence" element={<IntelligenceDashboard />} />
                    <Route path="/admin/founder-council" element={<FounderCouncilBoard />} />
                    <Route path="/admin/chain-explorer" element={<CanonicalChainExplorer />} />
                    <Route path="/admin/release-ring" element={<ReleaseRingCommandBoard />} />
                    <Route path="/admin/compute-governance" element={<ComputeGovernanceBoard />} />
                    <Route path="/admin/integration-concierge" element={<IntegrationConciergePage />} />
                    <Route path="/admin/revenue-autopilot" element={<RevenueAutopilotMonitor />} />
                    <Route path="/admin/proof-ledger" element={<InvestorProofLedger />} />
                    <Route path="/admin/reality-matrix" element={<RealityClassificationMatrix />} />
                    <Route path="/admin/mock-replacement" element={<MockReplacementProgram />} />
                    <Route path="/admin/reality-overview" element={<RealityConversionOverview />} />
                    <Route path="/admin/feature-reality" element={<FeatureRealityDetail />} />
                    <Route path="/admin/mock-sources" element={<MockSourceInventory />} />
                    <Route path="/admin/core-services" element={<SimulatedCoreServicesBoard />} />
                    <Route path="/admin/route-heatmap" element={<RouteRealityHeatmap />} />
                    <Route path="/admin/backend-readiness" element={<ContractBackendReadiness />} />
                    <Route path="/admin/launch-honesty" element={<LaunchHonestyBoard />} />
                    <Route path="/admin/wave-planner" element={<MigrationWavePlanner />} />
                    <Route path="/admin/reality-progress" element={<RealityProgressTimeline />} />
                    <Route path="/admin/runtime-validation" element={<RuntimeRealityValidation />} />

                    {/* CPS: Core Persistence Substrate */}
                    <Route path="/admin/core-persistence" element={<CorePersistenceOverview />} />
                    <Route path="/admin/event-stream" element={<EventStreamExplorer />} />
                    <Route path="/admin/memory-continuity" element={<MemoryContinuityCenter />} />
                    <Route path="/admin/policy-ledger" element={<PolicyDecisionLedger />} />
                    <Route path="/admin/intelligence-library" element={<IntelligenceArtifactLibrary />} />
                    <Route path="/admin/action-lineage" element={<ActionLineageExplorer />} />
                    <Route path="/admin/replay-console" element={<ReplayRecoveryConsole />} />
                    <Route path="/admin/service-migration" element={<CoreServiceMigrationBoard />} />
                    <Route path="/admin/persistence-drift" element={<PersistenceDriftRadar />} />
                    <Route path="/admin/runtime-continuity" element={<RuntimeContinuityBoard />} />
                    {/* Phase 4 Unification */}
                    <Route path="/admin/trust-state" element={<TrustStateRegistry />} />
                    <Route path="/admin/action-state" element={<ActionStateDriftViewer />} />
                    <Route path="/admin/cross-domain-memory" element={<CrossDomainMemoryExplorer />} />
                    {/* Delivery OS */}
                    <Route path="/admin/feature-intake" element={<FeatureIntakeDesk />} />
                    <Route path="/admin/feature-lifecycle" element={<FeatureLifecycleBoard />} />
                    <Route path="/admin/feature-factory" element={<FeatureFactoryConsole />} />
                    <Route path="/admin/domain-packs" element={<DomainMethodologyPacks />} />
                    <Route path="/admin/dependency-map" element={<DependencyMapViewer />} />
                    <Route path="/admin/change-impact" element={<ChangeImpactAnalyzer />} />
                    <Route path="/admin/delivery-readiness" element={<DeliveryReadinessBoard />} />
                    <Route path="/admin/platform-maturity" element={<PlatformMaturityDashboard />} />
                    <Route path="/admin/builder-knowledge" element={<BuilderKnowledgeBase />} />
                    <Route path="/admin/delivery-waves" element={<DeliveryWavePlanner />} />
                    {/* FIP — Feature Integration Protocol */}
                    <Route path="/admin/fip/intake" element={<FIPIntakeDesk />} />
                    <Route path="/admin/fip/spec-studio" element={<FIPSpecStudio />} />
                    <Route path="/admin/fip/owner-boundary" element={<FIPOwnerBoundary />} />
                    <Route path="/admin/fip/capability-registry" element={<FIPCapabilityRegistry />} />
                    <Route path="/admin/fip/compliance" element={<FIPComplianceBoard />} />
                    <Route path="/admin/fip/execution-paths" element={<FIPExecutionExplorer />} />
                    <Route path="/admin/fip/policy-trust" element={<FIPPolicyTrustBoard />} />
                    <Route path="/admin/fip/memory-graph" element={<FIPMemoryGraphStudio />} />
                    <Route path="/admin/fip/observability" element={<FIPObservabilityCenter />} />
                    <Route path="/admin/fip/rollout" element={<FIPRolloutPlanner />} />
                    <Route path="/admin/fip/generated-truth" element={<FIPGeneratedTruthBoard />} />
                    <Route path="/admin/fip/readiness" element={<FIPReadinessGateReview />} />
                    <Route path="/admin/fip/deprecation" element={<FIPDeprecationManager />} />
                    <Route path="/admin/fip/builder" element={<FIPBuilderConsole />} />

                    <Route path="/admin/ai-engineering" element={<AIEngineeringBoard />} />
                    <Route path="/admin/ai-team-roster" element={<AITeamRoster />} />
                    <Route path="/admin/ai-missions" element={<AIMissionCenter />} />
                    <Route path="/admin/ai-fix-center" element={<AIFixCenter />} />
                    <Route path="/admin/ai-self-healing" element={<AISelfHealing />} />
                    <Route path="/admin/ai-design-studio" element={<AIDesignStudio />} />
                    <Route path="/admin/ai-learning" element={<AILearningCenter />} />
                    <Route path="/admin/ai-approvals" element={<AIApprovalDesk />} />
                    <Route path="/admin/ai-releases" element={<AIReleasesCenter />} />
                    <Route path="/admin/ai-root-cause" element={<AIRootCauseGraph />} />
                    <Route path="/admin/ai-design-diffs" element={<AIDesignDiffTheater />} />
                    <Route path="/admin/ai-time-machine" element={<AITimeMachine />} />
                    <Route path="/admin/ai-agent-debate" element={<AIAgentDebate />} />
                    <Route path="/admin/ai-self-learning" element={<AISelfLearningLedger />} />
                     <Route path="/admin/ai-change-plans" element={<AIChangePlanViewer />} />
                    <Route path="/admin/ai-boundary-controls" element={<AIHumanBoundaryControls />} />
                    <Route path="/admin/ai-evidence-bundles" element={<AIEvidenceBundleComposer />} />
                     {/* REX — Recommendation → Execution Loop */}
                     <Route path="/admin/rex/intelligence" element={<REX01RecommendationIntelligence />} />
                     <Route path="/admin/rex/approval-queue" element={<REX02ApprovalQueueCompletion />} />
                     <Route path="/admin/rex/execution" element={<REX03RecommendationExecution />} />
                     <Route path="/admin/rex/programs" element={<REX04RemediationPrograms />} />
                     <Route path="/admin/rex/outcomes" element={<REX05OutcomeVerification />} />
                     {/* FL — Flagship Loops */}
                     <Route path="/admin/flagship/executive" element={<FL01FlagshipLoopsExecutive />} />
                     <Route path="/admin/flagship/detail" element={<FL02FlagshipLoopDetail />} />
                     {/* SERV — Service Ownership & Traceability */}
                     <Route path="/admin/services/ownership" element={<SERV01ServiceOwnership />} />
                     <Route path="/admin/services/domains" element={<SERV02DomainOwnership />} />
                     <Route path="/admin/services/route-trace" element={<SERV03RouteServiceTrace />} />
                     <Route path="/admin/services/duplication" element={<SERV04ServiceDuplication />} />
                     <Route path="/admin/services/canonical-actions" element={<SERV05CanonicalActions />} />
                     <Route path="/admin/services/flagship-trace" element={<SERV06FlagshipTraceability />} />
                     {/* LAUNCH — Launch Readiness Command Center */}
                     <Route path="/admin/launch/readiness" element={<LAUNCH01ReadinessExecutive />} />
                     <Route path="/admin/launch/flagship-loops" element={<LAUNCH02FlagshipReadiness />} />
                     <Route path="/admin/launch/claim-safety" element={<LAUNCH03ClaimSafetyMatrix />} />
                     <Route path="/admin/launch/blockers" element={<LAUNCH04BlockerCommand />} />
                     <Route path="/admin/launch/narrative" element={<LAUNCH06NarrativeGuide />} />
                     <Route path="/admin/launch/go-no-go" element={<LAUNCH07GoNoGo />} />

                     {/* Security Command Center */}
                     <Route path="/admin/security/posture" element={<SEC01PostureExecutive />} />
                     <Route path="/admin/security/privileged-actions" element={<SEC02PrivilegedActions />} />
                     <Route path="/admin/security/sensitive-assets" element={<SEC03SensitiveAssets />} />
                     <Route path="/admin/security/edge-functions" element={<SEC04EdgeFunctionAudit />} />
                     <Route path="/admin/security/claim-safety" element={<SEC05ClaimSafety />} />
                     <Route path="/admin/security/incident-recovery" element={<SEC06IncidentRecovery />} />

                     {/* Frontend Quality */}
                     <Route path="/admin/frontend/quality-matrix" element={<FE01QualityMatrix />} />
                     <Route path="/admin/frontend/design-governance" element={<FE02DesignGovernance />} />

                     {/* Architecture */}
                     <Route path="/admin/architecture/god-tier-integration" element={<GodTierIntegrationBoard />} />
                     <Route path="/admin/architecture/god-tier-runtime" element={<GodTierRuntimeBoard />} />
                     <Route path="/admin/architecture/epistemic-firewall" element={<EpistemicFirewallBoard />} />

                    </Route>

                     <Route path="/personal-brain" element={<PersonalBrain />} />

                    {/* ── 3C: OS Built-in Apps ── */}
                    <Route path="/apps/email" element={<EmailApp />} />
                    <Route path="/apps/messenger" element={<MessengerApp />} />
                    <Route path="/apps/vault" element={<VaultApp />} />
                    <Route path="/apps/health" element={<HealthApp />} />
                    <Route path="/apps/gallery" element={<GalleryApp />} />
                    <Route path="/apps/weather-news" element={<WeatherNewsApp />} />

                    {/* ── 3D: OS Workspaces ── */}
                    <Route path="/calendar" element={<CalendarWorkspace />} />
                    <Route path="/tasks" element={<TasksWorkflowsCenter />} />
                    <Route path="/notes" element={<NotesWorkspace />} />
                    <Route path="/people" element={<PeopleWorkspace />} />
                    <Route path="/team" element={<TeamWorkspace />} />
                    <Route path="/editor" element={<DocumentEditor />} />
                    <Route path="/reporting" element={<ReportingWorkspace />} />
                    <Route path="/trust" element={<TrustCenter />} />
                    <Route path="/media" element={<MediaWorkspace />} />
                    <Route path="/templates" element={<TemplateCenter />} />
                    <Route path="/import-export" element={<ImportExportCenter />} />

                    {/* ── Supplementary Admin Routes ── */}
                    <Route element={<AdminShellLayout />}>
                      {getAdminRoutes()}
                    </Route>

                    {/* ── Supplementary Owner Routes (from src/routes/OwnerRoutes.tsx — deduplicated) ── */}

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  </Suspense>
                  </RouteErrorBoundary>
                </ShellLayout>
              </ProtectedRoute>
            } />
          </Routes>
          </Suspense>
              </AuthenticatedProviders>
            } />
          </Routes>
          </Suspense>
          </RealityModeProvider>
          </ThemeProvider>
          </ConnectivityProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </GlobalErrorBoundary>
);

export default App;
