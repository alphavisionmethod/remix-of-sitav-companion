// ═══════════════════════════════════════════════════════════════
// SITA OS — AdminShell (Phase 2 — Deprecation Shim)
// Forwards every legacy `<AdminShell>` usage to the canonical
// AdminControlPlaneShell. Preserves the original prop surface so
// existing pages compile and render unchanged.
// Will be removed in Phase 7 once all imports have been rewritten
// to AdminControlPlaneShell directly.
// ═══════════════════════════════════════════════════════════════

import { ReactNode } from "react";
import { AdminControlPlaneShell } from "./AdminControlPlaneShell";

export interface AdminShellProps {
  children: ReactNode;
  /** Legacy: previously used to highlight a path. Now derived from URL. */
  activePath?: string;
  contextScope?: string;
  /** Legacy: density is now controlled inside the canonical shell. */
  layoutMode?: "default" | "dense" | "comfortable";
  showDegradedBanner?: boolean;
  degradedMessage?: string;
}

export function AdminShell({
  children,
  contextScope,
  showDegradedBanner,
  degradedMessage,
}: AdminShellProps) {
  return (
    <AdminControlPlaneShell
      contextScope={contextScope}
      showDegradedBanner={showDegradedBanner}
      degradedMessage={degradedMessage}
    >
      {children}
    </AdminControlPlaneShell>
  );
}
