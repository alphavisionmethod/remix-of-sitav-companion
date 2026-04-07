// ═══════════════════════════════════════════════════════════════
// SITA OS — Public Layout
// Minimal provider tree for unauthenticated routes:
// AuthProvider + ThemeProvider only — no kernel, no OS runtime.
// ═══════════════════════════════════════════════════════════════

import { ReactNode, Suspense } from "react";
import { ThemeProvider } from "@/contexts/ThemeContext";

const MinimalLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background" role="status" aria-label="Loading">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

/**
 * Lightweight layout wrapper for public/auth routes.
 * Boots only ThemeProvider — AuthProvider is already above in the tree.
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
