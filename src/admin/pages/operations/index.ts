// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Pages: Operations / Automation / System Health
// Canonical import: @/admin/pages/operations
// ═══════════════════════════════════════════════════════════════

// ── AR (Automation Runtime) ──
export { default as AR01AutomationOverview } from "@/pages/admin/AR01AutomationOverview";
export { default as AR02ScheduledJobRegistry } from "@/pages/admin/AR02ScheduledJobRegistry";
export { default as AR03SelfHealingBoard } from "@/pages/admin/AR03SelfHealingBoard";
export { default as AR04AgentScheduler } from "@/pages/admin/AR04AgentScheduler";
export { default as AR05SystemMaintenanceBoard } from "@/pages/admin/AR05SystemMaintenanceBoard";
export { default as AR06ExecutionTraceExplorer } from "@/pages/admin/AR06ExecutionTraceExplorer";
export { default as AR07RetryFailureCenter } from "@/pages/admin/AR07RetryFailureCenter";
export { default as AR08KillSwitchCenter } from "@/pages/admin/AR08KillSwitchCenter";
export { default as AR09AutomationLaunchGate } from "@/pages/admin/AR09AutomationLaunchGate";

// ── Action/Alert ──
export { default as ActionLineageExplorer } from "@/pages/admin/ActionLineageExplorer";
export { default as ActionStateDriftViewer } from "@/pages/admin/ActionStateDriftViewer";
export { default as AlertTriageBoard } from "@/pages/admin/AlertTriageBoard";

// ── Delivery ──
export { default as DeliveryReadinessBoard } from "@/pages/admin/DeliveryReadinessBoard";
export { default as DeliveryWavePlanner } from "@/pages/admin/DeliveryWavePlanner";

// ── Fleet/System ──
export { default as FleetHealthPage } from "@/pages/admin/FleetHealthPage";
export { default as LaunchReadinessBoard } from "@/pages/admin/LaunchReadinessBoard";
export { default as ReleaseRingCommandBoard } from "@/pages/admin/ReleaseRingCommandBoard";
export { default as ReplayRecoveryConsole } from "@/pages/admin/ReplayRecoveryConsole";
export { default as RuntimeContinuityBoard } from "@/pages/admin/RuntimeContinuityBoard";
export { default as SystemHealthDashboard } from "@/pages/admin/SystemHealthDashboard";
export { default as SystemManagement } from "@/pages/admin/SystemManagement";
export { default as WorkflowReplayAudit } from "@/pages/admin/WorkflowReplayAudit";
export { default as ReleaseEngineeringPage } from "@/pages/admin/ReleaseEngineeringPage";
export { default as EventStreamExplorer } from "@/pages/admin/EventStreamExplorer";

// ── Revenue Operations ──
export { default as RevenueAutopilotMonitor } from "@/pages/admin/RevenueAutopilotMonitor";

// ── Admin Operations ──
export { default as AdminDeploymentRings } from "@/pages/admin/AdminDeploymentRings";
export { default as AdminMutationAudit } from "@/pages/admin/AdminMutationAudit";
export { default as AdminTruthClaims } from "@/pages/admin/AdminTruthClaims";
export { default as AdminProjectionModels } from "@/pages/admin/AdminProjectionModels";

// ── MC Operations pages (from modules/) ──
export { default as MCCostsAIBudgets } from "@/pages/admin/modules/MCCostsAIBudgets";
export { default as MCDevicesCenter } from "@/pages/admin/modules/MCDevicesCenter";
export { default as MCIncidents } from "@/pages/admin/modules/MCIncidents";
export { default as MCJobsMaintenance } from "@/pages/admin/modules/MCJobsMaintenance";
export { default as MCKnowledgeBase } from "@/pages/admin/modules/MCKnowledgeBase";
export { default as MCLogsAudit } from "@/pages/admin/modules/MCLogsAudit";
export { default as MCPoliciesFlags } from "@/pages/admin/modules/MCPoliciesFlags";
export { default as MCReleasesUpdates } from "@/pages/admin/modules/MCReleasesUpdates";
export { default as MCStorageCenter } from "@/pages/admin/modules/MCStorageCenter";
export { default as MCSupport } from "@/pages/admin/modules/MCSupport";
export { default as MCSyncCloud } from "@/pages/admin/modules/MCSyncCloud";
export { default as MCSystemHealth } from "@/pages/admin/modules/MCSystemHealth";
export { default as MCUsersCenter } from "@/pages/admin/modules/MCUsersCenter";
export { default as MCWorkspacesContinuity } from "@/pages/admin/modules/MCWorkspacesContinuity";
