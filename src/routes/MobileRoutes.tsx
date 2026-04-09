import { Route, Navigate } from "react-router-dom";
import { lazy } from "react";

const MobileHome = lazy(() => import("@/pages/mobile/MobileHome"));
const MobileApprovals = lazy(() => import("@/pages/mobile/MobileApprovals"));
const MobileProof = lazy(() => import("@/pages/mobile/MobileProof"));
const MobileAlerts = lazy(() => import("@/pages/mobile/MobileAlerts"));
const MobileBoardroom = lazy(() => import("@/pages/mobile/MobileBoardroom"));
const MobileWorkflowDetail = lazy(() => import("@/pages/mobile/MobileWorkflowDetail"));
const MobileReceiptDetail = lazy(() => import("@/pages/mobile/MobileReceiptDetail"));
const MobileApprovalDetail = lazy(() => import("@/pages/mobile/MobileApprovalDetail"));
const MobileSettings = lazy(() => import("@/pages/mobile/MobileSettings"));
const MobileDeviceTrust = lazy(() => import("@/pages/mobile/MobileDeviceTrust"));
const MobileEmergencyActions = lazy(() => import("@/pages/mobile/MobileEmergencyActions"));
const MobileQuickCapture = lazy(() => import("@/pages/mobile/MobileQuickCapture"));

export const MobileRoutes = ({ ProtectedRoute }: { ProtectedRoute: React.ComponentType<{ children: React.ReactNode }> }) => (
  <>
    <Route path="/mobile" element={<ProtectedRoute><MobileHome /></ProtectedRoute>} />
    <Route path="/mobile/approvals" element={<ProtectedRoute><MobileApprovals /></ProtectedRoute>} />
    <Route path="/mobile/proof" element={<ProtectedRoute><MobileProof /></ProtectedRoute>} />
    <Route path="/mobile/alerts" element={<ProtectedRoute><MobileAlerts /></ProtectedRoute>} />
    <Route path="/mobile/boardroom" element={<ProtectedRoute><MobileBoardroom /></ProtectedRoute>} />
    <Route path="/mobile/workflow/:id" element={<ProtectedRoute><MobileWorkflowDetail /></ProtectedRoute>} />
    <Route path="/mobile/receipt/:id" element={<ProtectedRoute><MobileReceiptDetail /></ProtectedRoute>} />
    <Route path="/mobile/approval/:id" element={<ProtectedRoute><MobileApprovalDetail /></ProtectedRoute>} />
    <Route path="/mobile/settings" element={<ProtectedRoute><MobileSettings /></ProtectedRoute>} />
    <Route path="/mobile/device-trust" element={<ProtectedRoute><MobileDeviceTrust /></ProtectedRoute>} />
    <Route path="/mobile/emergency" element={<ProtectedRoute><MobileEmergencyActions /></ProtectedRoute>} />
    <Route path="/mobile/capture" element={<ProtectedRoute><MobileQuickCapture /></ProtectedRoute>} />
  </>
);
