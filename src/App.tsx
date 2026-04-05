import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ConnectivityProvider } from "@/contexts/ConnectivityContext";
import { useUserPreferences } from "@/hooks/use-user-preferences";
import { DataModeProvider } from "@/contexts/DataModeContext";
import { DisplayModeProvider } from "@/contexts/DisplayModeContext";
import { InspectorProvider } from "@/contexts/InspectorContext";
import { EntityContextProvider } from "@/contexts/EntityContext";
import { SitaKernelProvider } from "@/contexts/SitaKernelContext";
import { OSRuntimeProvider } from "@/lib/hooks/useOSRuntime";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ShellLayout } from "@/components/sita/ShellLayout";
import { GlobalErrorBoundary } from "@/components/sita/GlobalErrorBoundary";
import { createQueryClient } from "@/lib/query-config";
import { Suspense, lazy } from "react";

// ═══════════════════════════════════════════════════
// CODE-SPLIT: Lazy-load all page components
// ═══════════════════════════════════════════════════
const DailyPulse = lazy(() => import("./pages/DailyPulse"));
const BusinessCenter = lazy(() => import("./pages/BusinessCenter"));
const CustomerDetail = lazy(() => import("./pages/CustomerDetail"));
const MoneyCenter = lazy(() => import("./pages/MoneyCenter"));
const ConciergeCenter = lazy(() => import("./pages/ConciergeCenter"));
const WorkflowsCenter = lazy(() => import("./pages/WorkflowsCenter"));
const ProofCenter = lazy(() => import("./pages/ProofCenter"));
const Boardroom = lazy(() => import("./pages/Boardroom"));
const BoardroomReplay = lazy(() => import("./pages/boardroom/BoardroomReplay"));
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
const NotFound = lazy(() => import("./pages/NotFound"));
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
const OldAppDetailPage = lazy(() => import("./pages/store/AppDetailPage"));
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
const TeamManagement = lazy(() => import("./pages/admin/TeamManagement"));
const SystemManagement = lazy(() => import("./pages/admin/SystemManagement"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const AITokenDashboard = lazy(() => import("./pages/admin/AITokenDashboard"));
const PersonalBrain = lazy(() => import("./pages/PersonalBrain"));
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
const DocumentEditor = lazy(() => import("./pages/DocumentEditor"));
const ReportingWorkspace = lazy(() => import("./pages/ReportingWorkspace"));
const TrustCenter = lazy(() => import("./pages/TrustCenter"));
const MediaWorkspace = lazy(() => import("./pages/MediaWorkspace"));
const TemplateCenter = lazy(() => import("./pages/TemplateCenter"));
const ImportExportCenter = lazy(() => import("./pages/ImportExportCenter"));
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
const RevenueDecisionTheater = lazy(() => import("./pages/revenue-office/DecisionTheater"));
const WhatBreaksGrowth = lazy(() => import("./pages/revenue-office/WhatBreaksGrowth"));
const GrowthDNA = lazy(() => import("./pages/revenue-office/GrowthDNA"));
const GrowthOperatingModes = lazy(() => import("./pages/revenue-office/GrowthOperatingModes"));
const ChiefRevenueSynthesis = lazy(() => import("./pages/revenue-office/ChiefRevenueSynthesis"));
const CommercialMemoryFeed = lazy(() => import("./pages/revenue-office/CommercialMemoryFeed"));

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
  if (loading || prefsLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isDemo && !preferences.onboardingCompleted && window.location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }
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
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const App = () => (
  <GlobalErrorBoundary>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ConnectivityProvider>
          <ThemeProvider>
          <DataModeProvider>
          <DisplayModeProvider>
          <EntityContextProvider>
          <SitaKernelProvider>
          <OSRuntimeProvider>
          <InspectorProvider>
          <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/auth/callback" element={<EmailVerificationHandler />} />
            <Route path="/first-win" element={<ProtectedRoute><FirstWinActivation /></ProtectedRoute>} />

            <Route path="/mobile" element={<ProtectedRoute><MobileHome /></ProtectedRoute>} />
            <Route path="/mobile/approvals" element={<ProtectedRoute><MobileApprovals /></ProtectedRoute>} />
            <Route path="/mobile/proof" element={<ProtectedRoute><MobileProof /></ProtectedRoute>} />
            <Route path="/mobile/alerts" element={<ProtectedRoute><MobileAlerts /></ProtectedRoute>} />
            <Route path="/mobile/boardroom" element={<ProtectedRoute><MobileBoardroom /></ProtectedRoute>} />
            <Route path="/mobile/workflow/:id" element={<ProtectedRoute><MobileWorkflowDetail /></ProtectedRoute>} />
            <Route path="/mobile/receipt/:id" element={<ProtectedRoute><MobileReceiptDetail /></ProtectedRoute>} />
            <Route path="/mobile/approval/:id" element={<ProtectedRoute><MobileApprovalDetail /></ProtectedRoute>} />
            <Route path="/mobile/settings" element={<ProtectedRoute><MobileSettings /></ProtectedRoute>} />

            <Route path="*" element={
              <ProtectedRoute>
                <ShellLayout>
                  <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<DailyPulse />} />
                    <Route path="/life" element={<LifeDashboard />} />
                    <Route path="/life-simulator" element={<LifeSimulator />} />
                    <Route path="/my-activity" element={<MyActivity />} />

                    {/* Business — parent container handles sub-routing via tabs */}
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

                    {/* Money — parent container handles sub-routing via tabs */}
                    <Route path="/money" element={<MoneyCenter />} />
                    <Route path="/money/overview" element={<MoneyCenter />} />
                    <Route path="/money/bills" element={<MoneyCenter />} />
                    <Route path="/money/subscriptions" element={<MoneyCenter />} />
                    <Route path="/money/reserves" element={<MoneyCenter />} />
                    <Route path="/money/cash-timing" element={<MoneyCenter />} />
                    <Route path="/money/receivables" element={<MoneyCenter />} />
                    <Route path="/money/investment-office" element={<MoneyCenter />} />
                    <Route path="/money/family-office" element={<MoneyCenter />} />
                    <Route path="/money/approvals" element={<MoneyCenter />} />
                    <Route path="/money/proof" element={<MoneyCenter />} />
                    <Route path="/money/files" element={<MoneyCenter />} />
                    <Route path="/money/documents" element={<MoneyCenter />} />
                    <Route path="/money/boardroom" element={<MoneyCenter />} />
                    <Route path="/money/settings" element={<MoneyCenter />} />

                    {/* Investment Office */}
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
                    <Route path="/money/investments" element={<InvestmentGate />} />

                    {/* Revenue Office */}
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

                    {/* Concierge — parent container handles sub-routing via tabs */}
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
                    <Route path="/integrations" element={<IntegrationConcierge />} />
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

                    {/* Redirect /incidents to mission-control/incidents */}
                    <Route path="/incidents" element={<Navigate to="/mission-control" replace />} />

                    {/* Owner — Advanced Workspace (Layer 2) */}
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
                    <Route path="/service-architecture" element={<Navigate to="/observability" replace />} />

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

                    {/* Admin */}
                    <Route path="/admin/generated-truth" element={<GeneratedTruthDashboard />} />
                    <Route path="/admin/fleet-health" element={<FleetHealthPage />} />
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/team" element={<TeamManagement />} />
                    <Route path="/admin/system" element={<SystemManagement />} />
                    <Route path="/admin/users" element={<UserManagement />} />
                    <Route path="/admin/ai-tokens" element={<AITokenDashboard />} />
                    <Route path="/personal-brain" element={<PersonalBrain />} />

                    {/* OS Apps */}
                    <Route path="/apps/email" element={<EmailApp />} />
                    <Route path="/apps/messenger" element={<MessengerApp />} />
                    <Route path="/apps/vault" element={<VaultApp />} />
                    <Route path="/apps/health" element={<HealthApp />} />
                    <Route path="/apps/gallery" element={<GalleryApp />} />
                    <Route path="/apps/weather-news" element={<WeatherNewsApp />} />

                    {/* New Workspaces */}
                    <Route path="/calendar" element={<CalendarWorkspace />} />
                    <Route path="/notes" element={<NotesWorkspace />} />
                    <Route path="/people" element={<PeopleWorkspace />} />
                    <Route path="/team" element={<TeamWorkspace />} />
                    <Route path="/editor" element={<DocumentEditor />} />
                    <Route path="/reporting" element={<ReportingWorkspace />} />
                    <Route path="/trust" element={<TrustCenter />} />
                    <Route path="/media" element={<MediaWorkspace />} />
                    <Route path="/templates" element={<TemplateCenter />} />
                    <Route path="/import-export" element={<ImportExportCenter />} />

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  </Suspense>
                </ShellLayout>
              </ProtectedRoute>
            } />
          </Routes>
          </Suspense>
          </InspectorProvider>
          </OSRuntimeProvider>
          </SitaKernelProvider>
          </EntityContextProvider>
          </DisplayModeProvider>
          </DataModeProvider>
          </ThemeProvider>
          </ConnectivityProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </GlobalErrorBoundary>
);

export default App;
