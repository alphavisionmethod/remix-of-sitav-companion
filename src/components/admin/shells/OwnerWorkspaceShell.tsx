// ═══════════════════════════════════════════════════════════════
// SITA OS — OwnerWorkspaceShell (Phase 2 — Deprecation Shim)
// The owner workspace was a parallel shell hierarchy. Phase 2
// collapses it onto the canonical AdminControlPlaneShell so all
// admin/owner pages share one shell grammar. The original
// drag-and-drop tab strip is preserved in
// `OwnerWorkspaceShell.legacy.tsx` for reference until Phase 7.
// ═══════════════════════════════════════════════════════════════

import { ReactNode } from "react";
import { AdminControlPlaneShell } from "./AdminControlPlaneShell";

interface OwnerWorkspaceShellProps {
  children: ReactNode;
  contextScope?: string;
}

export function OwnerWorkspaceShell({ children, contextScope }: OwnerWorkspaceShellProps) {
  return (
    <AdminControlPlaneShell contextScope={contextScope ?? "Owner Workspace"}>
      {children}
    </AdminControlPlaneShell>
  );
}
