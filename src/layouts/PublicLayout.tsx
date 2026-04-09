// ═══════════════════════════════════════════════════════════════
// SITA OS — Public Layout (canonical location)
// Minimal wrapper for unauthenticated routes:
// AuthProvider + ThemeProvider are above in the App tree.
// This layout adds only Suspense — no kernel, no OS runtime.
// ═══════════════════════════════════════════════════════════════

import { ReactNode, Suspense } from "react";

const MinimalLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background" role="status" aria-label="Loading">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

/**
 * Lightweight layout wrapper for public/auth routes.
 * Boots only Suspense — AuthProvider & ThemeProvider are already above in the tree.
 * Skips: SitaKernelProvider, OSRuntimeProvider, EntityContext,
 *        DataMode, DemoMode, DisplayMode, Inspector, PlatformInit.
 */
export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<MinimalLoader />}>
      {children}
    </Suspense>
  );
}
