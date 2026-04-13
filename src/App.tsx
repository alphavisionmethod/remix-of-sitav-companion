// ═══════════════════════════════════════════════════════════════
// SITA OS — App.tsx (Thin Orchestrator)
// Composes providers + route families into the application
// ═══════════════════════════════════════════════════════════════

import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, Outlet } from "react-router-dom";
import { AdminRoute } from "@/components/auth/AdminRoute";
import { getAdminRoutes } from "@/routes/AdminRoutes";

import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ConnectivityProvider } from "@/contexts/ConnectivityContext";
import { OfflineBanner } from "@/components/sita/OfflineBanner";
import { useUserPreferences } from "@/hooks/use-user-preferences";
import { DataModeProvider } from "@/contexts/DataModeContext";
import { AppearanceProvider } from "@/contexts/AppearanceContext";
import { InspectorProvider } from "@/contexts/InspectorContext";
import { EntityContextProvider } from "@/contexts/EntityContext";
import { RuntimeProvider } from "@/contexts/RuntimeProvider";
import { AppPlatformProvider } from "@/contexts/AppPlatformContext";
import { OSRuntimeProvider } from "@/lib/hooks/useOSRuntime";
import { RealityModeProvider } from "@/lib/dual-reality/reality-mode-context";
import { ThemeProvider } from "@/contexts/AppearanceContext";
import { ShellLayout } from "@/components/sita/ShellLayout";
import { GlobalErrorBoundary } from "@/components/sita/GlobalErrorBoundary";
import { RouteErrorBoundary } from "@/components/sita/RouteErrorBoundary";
import { createQueryClient } from "@/lib/query-config";
import { Suspense, lazy, forwardRef, useState, useEffect, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PlatformInit } from "@/components/sita/PlatformInit";
import { PublicLayout } from "@/layouts/PublicLayout";
import { AdminCommandPalette } from "@/components/admin/AdminCommandPalette";
import { AdminKeyboardShortcuts } from "@/components/admin/AdminKeyboardShortcuts";
import { AdminShell } from "@/components/admin/shells/AdminShell";
import { OwnerWorkspaceShell } from "@/components/admin/shells/OwnerWorkspaceShell";

// Route families
import { getOSRoutes } from "@/routes/os-routes";
import { getBusinessRoutes } from "@/routes/business-routes";
import { getMoneyRoutes } from "@/routes/money-routes";
import { getConciergeRoutes } from "@/routes/concierge-routes";
import { getFilesRoutes } from "@/routes/files-routes";
import { getBoardroomRoutes } from "@/routes/boardroom-routes";
import { getAdvisorRoutes } from "@/routes/advisor-routes";
import { getExperimentalRoutes } from "@/routes/experimental-routes";
import { getOwnerRoutes } from "@/routes/OwnerRoutes";
import { MobileRoutes } from "@/routes/MobileRoutes";

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
    (supabase as any).rpc("has_role", { _user_id: user.id, _role: "admin" })
      .then(({ data }: any) => setIsAdmin(!!data))
      .catch(() => {});
  }, [user, isDemo]);
  if (!isAdmin) return null;
  return <><AdminCommandPaletteWrapper /><AdminKeyboardShortcutsWrapper /></>;
};

const AdminShellLayout = () => <AdminShell><Outlet /></AdminShell>;
const OwnerShellLayout = () => <OwnerWorkspaceShell><Outlet /></OwnerWorkspaceShell>;

// ═══════════════════════════════════════════════════════════════
// Loading & auth guards
// ═══════════════════════════════════════════════════════════════
const queryClient = createQueryClient();

import { PageSkeleton } from "@/components/sita/PageSkeleton";
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

const HomeRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background" role="status" aria-label="Loading"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  if (!user) return <LandingPage />;
  return <Navigate to="/desktop" replace />;
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
  {children}
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
            {/* TIER 1: PUBLIC */}
            <Route path="/login" element={<PublicLayout><PublicRoute><Login /></PublicRoute></PublicLayout>} />
            <Route path="/signup" element={<PublicLayout><PublicRoute><Signup /></PublicRoute></PublicLayout>} />
            <Route path="/forgot-password" element={<PublicLayout><PublicRoute><ForgotPassword /></PublicRoute></PublicLayout>} />
            <Route path="/reset-password" element={<PublicLayout><ResetPassword /></PublicLayout>} />
            <Route path="/" element={<PublicLayout><HomeRoute /></PublicLayout>} />

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

                {/* TIER 3: FULL OS SHELL */}
                <Route path="*" element={
                  <ProtectedRoute>
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
                        {getExperimentalRoutes()}

                        {/* Owner workspace */}
                        <Route element={<OwnerShellLayout />}>
                          {getOwnerRoutes()}
                        </Route>

                        {/* Admin */}
                        <Route element={<AdminRoute><AdminShellLayout /></AdminRoute>}>
                          {getAdminRoutes()}
                        </Route>

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
