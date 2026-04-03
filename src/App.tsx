import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useUserPreferences } from "@/hooks/use-user-preferences";
import { DataModeProvider } from "@/contexts/DataModeContext";
import { DisplayModeProvider } from "@/contexts/DisplayModeContext";
import { InspectorProvider } from "@/contexts/InspectorContext";
import { EntityContextProvider } from "@/contexts/EntityContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ShellLayout } from "@/components/sita/ShellLayout";
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
const ProductivityHub = lazy(() => import("./pages/ProductivityHub"));
const DocsWorkspace = lazy(() => import("./pages/workspace/DocsWorkspace"));
const SheetsWorkspace = lazy(() => import("./pages/workspace/SheetsWorkspace"));
const SlidesWorkspace = lazy(() => import("./pages/workspace/SlidesWorkspace"));
const PackStorePage = lazy(() => import("./pages/store/PackStorePage"));
const PackDetailPage = lazy(() => import("./pages/store/PackDetailPage"));
const PackInstalledPage = lazy(() => import("./pages/store/PackInstalledPage"));
const AppDetailPage = lazy(() => import("./pages/store/AppDetailPage"));
const StoreCategoryPage = lazy(() => import("./pages/store/StoreCategoryPage"));
const StoreAnalyticsPage = lazy(() => import("./pages/store/StoreAnalyticsPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const PolicyEditor = lazy(() => import("./pages/PolicyEditor"));
const ConnectorHub = lazy(() => import("./pages/ConnectorHub"));
const AdvisorRegistry = lazy(() => import("./pages/advisors/AdvisorRegistry"));
const RecoveryCenter = lazy(() => import("./pages/RecoveryCenter"));
const LifeDashboard = lazy(() => import("./pages/LifeDashboard"));
const PermissionsCenter = lazy(() => import("./pages/PermissionsCenter"));
const AgentActivityDashboard = lazy(() => import("./pages/AgentActivityDashboard"));
const RevenueCallingPage = lazy(() => import("./pages/RevenueCallingPage"));
const ServiceArchitectureDashboard = lazy(() => import("./pages/ServiceArchitectureDashboard"));

// Mobile Trusted Device
const MobileHome = lazy(() => import("./pages/mobile/MobileHome"));
const MobileApprovals = lazy(() => import("./pages/mobile/MobileApprovals"));
const MobileProof = lazy(() => import("./pages/mobile/MobileProof"));
const MobileAlerts = lazy(() => import("./pages/mobile/MobileAlerts"));
const MobileBoardroom = lazy(() => import("./pages/mobile/MobileBoardroom"));
const MobileWorkflowDetail = lazy(() => import("./pages/mobile/MobileWorkflowDetail"));
const MobileReceiptDetail = lazy(() => import("./pages/mobile/MobileReceiptDetail"));
const MobileApprovalDetail = lazy(() => import("./pages/mobile/MobileApprovalDetail"));
const MobileSettings = lazy(() => import("./pages/mobile/MobileSettings"));

const queryClient = new QueryClient();

// Premium loading skeleton
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="h-10 w-10 rounded-xl gradient-sita animate-pulse" />
        <div className="absolute inset-0 h-10 w-10 rounded-xl gradient-sita opacity-50 animate-ping" />
      </div>
      <div className="flex gap-1">
        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isDemo } = useAuth();
  const { preferences, isLoading: prefsLoading } = useUserPreferences();
  if (loading || prefsLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  // Gate: redirect to onboarding if not completed (skip for demo users)
  if (!isDemo && !preferences.onboardingCompleted && window.location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
          <DataModeProvider>
          <DisplayModeProvider>
          <EntityContextProvider>
          <InspectorProvider>
          <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/onboarding" element={<Onboarding />} />

            {/* Mobile Trusted Device — standalone shell (no ShellLayout) */}
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

                    {/* Approvals — explicit sub-routes */}
                    <Route path="/approvals" element={<ApprovalsCenter />} />
                    <Route path="/approvals/pending" element={<ApprovalsCenter />} />
                    <Route path="/approvals/simulated" element={<ApprovalsCenter />} />
                    <Route path="/approvals/history" element={<ApprovalsCenter />} />

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
                    <Route path="/store/apps/:appId" element={<AppDetailPage />} />
                    <Route path="/store/founders" element={<StoreCategoryPage />} />
                    <Route path="/store/families" element={<StoreCategoryPage />} />
                    <Route path="/store/finance" element={<StoreCategoryPage />} />
                    <Route path="/store/connectors" element={<StoreCategoryPage />} />
                    <Route path="/store/surfaces" element={<StoreCategoryPage />} />
                    <Route path="/store/:segment" element={<StoreCategoryPage />} />

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
                    <Route path="/service-architecture" element={<ServiceArchitectureDashboard />} />

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

                    {/* Owner Center */}
                    <Route path="/owner" element={<OwnerCenter />} />
                    <Route path="/owner/ai-team" element={<OwnerCenter />} />
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
                    <Route path="/owner/releases" element={<OwnerCenter />} />
                    <Route path="/owner/model-routing" element={<OwnerCenter />} />
                    <Route path="/owner/system-map" element={<OwnerCenter />} />
                    <Route path="/owner/knowledge" element={<OwnerCenter />} />
                    <Route path="/owner/support" element={<OwnerCenter />} />
                    <Route path="/owner/change-review" element={<OwnerCenter />} />
                    <Route path="/owner/rollback-center" element={<OwnerCenter />} />

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

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  </Suspense>
                </ShellLayout>
              </ProtectedRoute>
            } />
          </Routes>
          </Suspense>
          </InspectorProvider>
          </EntityContextProvider>
          </DisplayModeProvider>
          </DataModeProvider>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
