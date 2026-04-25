import { lazy } from "react";
import { Route } from "react-router-dom";

const TrustHome = lazy(() => import("@/pages/trust/TrustHome"));
const TrustReceipts = lazy(() => import("@/pages/trust/TrustReceipts"));
const TrustApprovals = lazy(() => import("@/pages/trust/TrustApprovals"));
const TrustPermissions = lazy(() => import("@/pages/trust/TrustPermissions"));
const TrustAutomationAuthority = lazy(() => import("@/pages/trust/TrustAutomationAuthority"));
const TrustAudit = lazy(() => import("@/pages/trust/TrustAudit"));

/**
 * Trust Center route group — surfaces the cross-cutting trust platform layer
 * as a discoverable, unified destination at /trust/*.
 * Some sub-routes (approvals, permissions) re-surface existing canonical
 * pages via redirects so we don't fork their implementations.
 */
export const getTrustRoutes = () => (
  <>
    <Route path="/trust" element={<TrustHome />} />
    <Route path="/trust/receipts" element={<TrustReceipts />} />
    <Route path="/trust/approvals" element={<TrustApprovals />} />
    <Route path="/trust/permissions" element={<TrustPermissions />} />
    <Route path="/trust/automation-authority" element={<TrustAutomationAuthority />} />
    <Route path="/trust/audit" element={<TrustAudit />} />
  </>
);