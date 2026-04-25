// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Root Landing Resolver
//
// `/admin` resolves to:
//   - operator profile → OperatorHome (workflow-first landing)
//   - user profile      → /admin/overview (legacy entry, role-gated)
// ═══════════════════════════════════════════════════════════════

import { Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { isOperatorProfile } from "@/runtimes/deployment-profile";

const OperatorHome = lazy(() => import("@/pages/admin/OperatorHome"));

export default function AdminRootLanding() {
  if (isOperatorProfile()) {
    return (
      <Suspense fallback={<div className="p-6 text-muted-foreground">Loading operator home…</div>}>
        <OperatorHome />
      </Suspense>
    );
  }
  return <Navigate to="/admin/overview" replace />;
}
