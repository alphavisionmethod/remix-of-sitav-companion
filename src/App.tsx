// ═══════════════════════════════════════════════════════════════
// SITA OS — App.tsx (Thin Orchestrator)
// Composes providers + route families into the application
// ═══════════════════════════════════════════════════════════════

import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { AdminRoute } from "@/platform/auth/components/auth/AdminRoute";


import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { PortraitPerfHud } from "@/platform/settings/components/settings/PortraitPerfHud";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ConnectivityProvider } from "@/contexts/ConnectivityContext";
import { OfflineBanner } from "@/platform/sita/components/sita/OfflineBanner";
import { useUserPreferences } from "@/hooks/use-user-preferences";
import { DataModeProvider } from "@/contexts/DataModeContext";
import { AppearanceProvider } from "@/contexts/AppearanceContext";
import { InspectorProvider } from "@/contexts/InspectorContext";
import { EntityContextProvider } from "@/contexts/EntityContext";
import { RuntimeProvider } from "@/contexts/RuntimeProvider";
import { AppPlatformProvider } from "@/contexts/AppPlatformContext";
import { OSRuntimeProvider } from "@/hooks/useOSRuntime";
import { RealityModeProvider } from "@/lib/dual-reality/reality-mode-context";
import { ThemeProvider } from "@/contexts/AppearanceContext";
import { SitaVoiceProvider } from "@/contexts/SitaVoiceContext";
// MobileRuntimeProvider archived — Ubuntu-native is canonical native platform.
// See docs/PLATFORM_SCOPE.md and archive/src/mobile-platform/.
import { ShellLayout } from "@/platform/sita/components/sita/ShellLayout";
import { GlobalErrorBoundary } from "@/platform/sita/components/sita/GlobalErrorBoundary";
import { RouteErrorBoundary } from "@/platform/sita/components/sita/RouteErrorBoundary";
import { EnvErrorBoundary } from "@/platform/sita/components/sita/EnvErrorBoundary";
import { createQueryClient } from "@/lib/query-config";
import { initErrorMonitoring } from "@/lib/services/error-monitoring-service";

// Initialize error monitoring before React render
initErrorMonitoring();
import { Suspense, lazy, forwardRef, useState, useEffect, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PlatformInit } from "@/platform/sita/components/sita/PlatformInit";
import { PublicLayout } from "@/layouts/PublicLayout";
import { AdminCommandPalette } from "@/platform/admin/components/admin/AdminCommandPalette";
import { AdminKeyboardShortcuts } from "@/platform/admin/components/admin/AdminKeyboardShortcuts";

// Route families
import { getOSRoutes } from "@/routes/os-routes";
import { getBusinessRoutes } from "@/routes/business-routes";
import { getMoneyRoutes } from "@/routes/money-routes";
import { getConciergeRoutes } from "@/routes/concierge-routes";
import { getFilesRoutes } from "@/routes/files-routes";
import { getBoardroomRoutes } from "@/routes/boardroom-routes";
import { getAdvisorRoutes } from "@/routes/advisor-routes";
import { getBusinessAdvisorRoutes } from "@/routes/business-advisor-routes";
import { getExperimentalRoutes } from "@/routes/experimental-routes";
import { getInvestmentRoutes } from "@/routes/investment-routes";
import { getInvestmentOfficeRoutes } from "@/routes/investment-office-routes";
import InvestmentShellPage from "@/pages/investment-office/InvestmentShellPage";
import { USER_REDIRECTS } from "@/routes/redirects/user-redirect-map";
import { getOwnerRoutes } from "@/routes/OwnerRoutes";
import { MobileRoutes } from "@/routes/MobileRoutes";
import { getCommunicationsRoutes } from "@/routes/communications-routes";
import { getAppsRoutes } from "@/routes/apps-routes";
import { getSettingsRoutes } from "@/routes/settings-routes";
import { getTrustRoutes } from "@/routes/trust-routes";
import { getHealthRoutes } from "@/routes/health-routes";

// ═══════════════════════════════════════════════════════════════
// Minimal lazy-loaded pages not covered by route families
// ═══════════════════════════════════════════════════════════════
const LandingPage = lazy(() => import("./pages/LandingPage"));
const DesktopPage = lazy(() => import("./pages/DesktopPage"));
const DailyPulse = lazy(() => import("./pages/DailyPulse"));
const Onboarding = lazy(() => import("./pages/OnboardingWrapper"));
const LearnLaterPage = lazy(() => import("./pages/LearnLaterPage"));
const FirstWinActivation = lazy(() => import("./pages/FirstWinActivation"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Login = lazy(() => import("./pages/auth/Login"));
const Signup = lazy(() => import("./pages/auth/Signup"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const PublicSign = lazy(() => import("./pages/PublicSign"));

// Marketing site pages removed from routes — reference only.
// Build the marketing website separately using the pages in src/pages/marketing/ as templates.

// ═══════════════════════════════════════════════════════════════
// Admin tools wrapper
// ═══════════════════════════════════════════════════════════════
const AdminCommandPaletteWrapper = forwardRef<HTMLDivElement>((_, ref) => <div ref={ref}><AdminCommandPalette /></div>);
AdminCommandPaletteWrapper.displayName = "AdminCommandPaletteWrapper";
const AdminKeyboardShortcutsWrapper = forwardRef<HTMLDivElement>((_, ref) => <div ref={ref}><AdminKeyboardShortcuts /></div>);
AdminKeyboardShortcutsWrapper.displayName = "AdminKeyboardShortcutsWrapper";

const ConditionalAdminTools = () => {
  const { user, isDemo } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    if (isDemo) { setIsAdmin(true); return; }
    if (!user) return;
    const checkRole = async () => {
      try {
        const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
        setIsAdmin(!!data);
      } catch {
        // silently fail — non-admin
      }
    };
    checkRole();
  }, [user, isDemo]);
  if (!isAdmin) return null;
  return <><AdminCommandPaletteWrapper /><AdminKeyboardShortcutsWrapper /></>;
};

const AdminCenter = lazy(() => import("@/pages/AdminCenter"));

// ═══════════════════════════════════════════════════════════════
// Loading & auth guards
// ═══════════════════════════════════════════════════════════════
const queryClient = createQueryClient();

import { PageSkeleton } from "@/platform/sita/components/sita/PageSkeleton";
const PageLoader = () => (
  <div className="p-4 md:p-6 max-w-[1400px] mx-auto"><PageSkeleton rows={3} /></div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isDemo } = useAuth();
  const { preferences, isLoading: prefsLoading } = useUserPreferences();
  if (loading || prefsLoading) return <div className="min-h-screen flex items-center justify-center bg-background" role="status" aria-label="Loading"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isDemo && !preferences.onboardingCompleted && window.location.pathname !== "/onboarding") return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
};

const OnboardingGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background" role="status" aria-label="Loading"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

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
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background" role="status" aria-label="Loading"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const useIsMobileViewport = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    const handler = () => setIsMobile(mql.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);
  return isMobile;
};

const HomeRoute = () => {
  const { user, loading } = useAuth();
  const isMobile = useIsMobileViewport();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background" role="status" aria-label="Loading"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  if (!user) return <LandingPage />;
  if (isMobile) return <Navigate to="/mobile" replace />;
  return <Navigate to="/desktop" replace />;
};

// Redirect mobile users away from desktop OS shell to /mobile
const MOBILE_ROUTE_MAP: Record<string, string> = {
  "/desktop": "/mobile",
  "/business": "/mobile/business",
  "/money": "/mobile/money",
  "/concierge": "/mobile/concierge",
  "/boardroom": "/mobile/boardroom",
  "/settings": "/mobile/settings",
  "/files": "/mobile/files",
  "/investment": "/mobile/investment",
  "/approvals": "/mobile/approvals",
};
// Additional desktop→mobile route mappings for DailyPulse & Tasks
const MOBILE_ROUTE_MAP_EXTENDED: Record<string, string> = {
  ...MOBILE_ROUTE_MAP,
  "/daily-pulse": "/mobile",
  "/pulse": "/mobile",
  "/workflows": "/mobile/more",
  "/tasks": "/mobile/more",
  "/proof": "/mobile/proof",
  "/receipts": "/mobile/proof",
};

const MobileGuard = ({ children }: { children: ReactNode }) => {
  const isMobile = useIsMobileViewport();
  const location = useLocation();
  if (isMobile) {
    // Check for exact route mapping first
    for (const [desktop, mobile] of Object.entries(MOBILE_ROUTE_MAP_EXTENDED)) {
      if (location.pathname === desktop || location.pathname.startsWith(desktop + "/")) {
        return <Navigate to={mobile} replace />;
      }
    }
    // Default: send to /mobile home
    return <Navigate to="/mobile" replace />;
  }
  return <>{children}</>;
};

const AuthenticatedProviders = ({ children }: { children: ReactNode }) => (
  <DataModeProvider>
  <AppearanceProvider>
  <EntityContextProvider>
  <RuntimeProvider>
  <OSRuntimeProvider>
  <AppPlatformProvider>
  <InspectorProvider>
  <PlatformInit />
  <SitaVoiceProvider>
    {children}
  </SitaVoiceProvider>
  </InspectorProvider>
  </AppPlatformProvider>
  </OSRuntimeProvider>
  </RuntimeProvider>
  </EntityContextProvider>
  </AppearanceProvider>
  </DataModeProvider>
);

// ═══════════════════════════════════════════════════════════════
// App — Thin orchestrator composing route families
// ═══════════════════════════════════════════════════════════════
const App = () => (
  <EnvErrorBoundary>
  <GlobalErrorBoundary>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <PortraitPerfHud />
      <BrowserRouter>
        <AuthProvider>
          <ConnectivityProvider>
          <OfflineBanner />
          <ThemeProvider>
          <RealityModeProvider>
          <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* TIER 1: PUBLIC */}
            <Route path="/login" element={<PublicLayout><PublicRoute><Login /></PublicRoute></PublicLayout>} />
            <Route path="/signup" element={<PublicLayout><PublicRoute><Signup /></PublicRoute></PublicLayout>} />
            <Route path="/forgot-password" element={<PublicLayout><PublicRoute><ForgotPassword /></PublicRoute></PublicLayout>} />
            <Route path="/reset-password" element={<PublicLayout><ResetPassword /></PublicLayout>} />
            {/* Public e-sign — no auth, token-gated by edge function */}
            <Route path="/sign/:token" element={<PublicLayout><PublicSign /></PublicLayout>} />

            {/* TIER 2+3: AUTHENTICATED */}
            <Route path="/*" element={
              <AuthenticatedProviders>
              <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* No-shell routes */}
                <Route path="/onboarding" element={<OnboardingGuard><Onboarding /></OnboardingGuard>} />
                <Route path="/auth/callback" element={<EmailVerificationHandler />} />
                <Route path="/first-win" element={<ProtectedRoute><FirstWinActivation /></ProtectedRoute>} />
                <Route path="/learn-later" element={<ProtectedRoute><LearnLaterPage /></ProtectedRoute>} />

                {/* Mobile */}
                {MobileRoutes({ ProtectedRoute })}

                {/* TIER 3: FULL OS SHELL — desktop/tablet only */}
                <Route path="*" element={<MobileGuard><ProtectedRoute>
                    <ShellLayout>
                      <ConditionalAdminTools />
                      <RouteErrorBoundary>
                      <Suspense fallback={<PageLoader />}>
                      <Routes>
                        {/* Desktop home */}
                        <Route path="/" element={<DesktopPage />} />

                        {/* Route families */}
                        {getOSRoutes()}
                        {getBusinessRoutes()}
                        {getMoneyRoutes()}
                        {getConciergeRoutes()}
                        {getFilesRoutes()}
                        {getBoardroomRoutes()}
                        {getAdvisorRoutes()}
                        {getBusinessAdvisorRoutes()}
                        {getExperimentalRoutes()}
                        {getInvestmentRoutes()}
                        {getInvestmentOfficeRoutes()}
                        {getCommunicationsRoutes()}
                        {getAppsRoutes()}
                        {getSettingsRoutes()}
                        {getTrustRoutes()}
                        {getHealthRoutes()}

                        {/* Phase 2 (Page Consolidation): user-domain redirect layer */}
                        {USER_REDIRECTS.map((r) => (
                          <Route
                            key={`user-redirect-${r.from}`}
                            path={r.from}
                            element={<Navigate to={r.to} replace />}
                          />
                        ))}

                        {/* Owner workspace */}
                        {getOwnerRoutes()}

                        {/* Admin — redirect shim to windowed Mission Control app */}
                        <Route path="/admin/*" element={<AdminRoute><AdminCenter /></AdminRoute>} />

                        <Route path="*" element={<NotFound />} />
                      </Routes>
                      </Suspense>
                      </RouteErrorBoundary>
                    </ShellLayout>
                  </ProtectedRoute>
                </MobileGuard>} />
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
  </EnvErrorBoundary>
);

export default App;
