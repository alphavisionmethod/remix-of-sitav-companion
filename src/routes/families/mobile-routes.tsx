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
const MobileBusiness = lazy(() => import("@/pages/mobile/MobileBusiness"));
const MobileMoney = lazy(() => import("@/pages/mobile/MobileMoney"));
const MobileConcierge = lazy(() => import("@/pages/mobile/MobileConcierge"));
const MobileMore = lazy(() => import("@/pages/mobile/MobileMore"));
const MobileInvestment = lazy(() => import("@/pages/mobile/MobileInvestment"));
const MobileFiles = lazy(() => import("@/pages/mobile/MobileFiles"));
const MobileCommand = lazy(() => import("@/pages/mobile/MobileCommand"));
const MobileAIChat = lazy(() => import("@/pages/mobile/MobileAIChat"));
const MobileSystemMonitor = lazy(() => import("@/pages/mobile/MobileSystemMonitor"));
const MobileSyncControl = lazy(() => import("@/pages/mobile/MobileSyncControl"));
const MobileNotificationCenter = lazy(() => import("@/pages/mobile/MobileNotificationCenter"));
const MobileTimeline = lazy(() => import("@/pages/mobile/MobileTimeline"));
const MobileInbox = lazy(() => import("@/pages/mobile/MobileInbox"));

export const MobileRoutes = ({ ProtectedRoute }: { ProtectedRoute: React.ComponentType<{ children: React.ReactNode }> }) => (
  <>
    <Route path="/mobile" element={<ProtectedRoute><MobileHome /></ProtectedRoute>} />
    <Route path="/mobile/business" element={<ProtectedRoute><MobileBusiness /></ProtectedRoute>} />
    <Route path="/mobile/money" element={<ProtectedRoute><MobileMoney /></ProtectedRoute>} />
    <Route path="/mobile/concierge" element={<ProtectedRoute><MobileConcierge /></ProtectedRoute>} />
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
    <Route path="/mobile/more" element={<ProtectedRoute><MobileMore /></ProtectedRoute>} />
    <Route path="/mobile/investment" element={<ProtectedRoute><MobileInvestment /></ProtectedRoute>} />
    <Route path="/mobile/files" element={<ProtectedRoute><MobileFiles /></ProtectedRoute>} />
    <Route path="/mobile/command" element={<ProtectedRoute><MobileCommand /></ProtectedRoute>} />
    <Route path="/mobile/ai-chat" element={<ProtectedRoute><MobileAIChat /></ProtectedRoute>} />
    <Route path="/mobile/system-monitor" element={<ProtectedRoute><MobileSystemMonitor /></ProtectedRoute>} />
    <Route path="/mobile/sync" element={<ProtectedRoute><MobileSyncControl /></ProtectedRoute>} />
    <Route path="/mobile/notifications" element={<ProtectedRoute><MobileNotificationCenter /></ProtectedRoute>} />
    <Route path="/mobile/timeline" element={<ProtectedRoute><MobileTimeline /></ProtectedRoute>} />
    <Route path="/mobile/inbox" element={<ProtectedRoute><MobileInbox /></ProtectedRoute>} />
  </>
);
