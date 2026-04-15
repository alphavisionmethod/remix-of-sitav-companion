// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Pages: Fleet / Flagship / Platform Command
// Canonical import: @/admin/pages/fleet
// ═══════════════════════════════════════════════════════════════

// ── FL (Flagship Loops) ──
export { default as FL01FlagshipLoopsExecutive } from "@/pages/admin/FL01FlagshipLoopsExecutive";
export { default as FL02FlagshipLoopDetail } from "@/pages/admin/FL02FlagshipLoopDetail";
export { default as FL03FlagshipPrioritization } from "@/pages/admin/FL03FlagshipPrioritization";

// ── FCC (Founder Command Console) ──
export { default as FCC01FounderCommandConsole } from "@/pages/admin/FCC01FounderCommandConsole";
export { default as FCC02TaskDecompositionGraph } from "@/pages/admin/FCC02TaskDecompositionGraph";
export { default as FCC03CICDPipelineBoard } from "@/pages/admin/FCC03CICDPipelineBoard";
export { default as FCC04RunbookCenter } from "@/pages/admin/FCC04RunbookCenter";
export { default as FCC05FounderDashboard } from "@/pages/admin/FCC05FounderDashboard";
export { default as FCC06ProgramManagementBoard } from "@/pages/admin/FCC06ProgramManagementBoard";
export { default as FCC07PlatformCostCapacity } from "@/pages/admin/FCC07PlatformCostCapacity";
export { default as FCC08SyncStorageOps } from "@/pages/admin/FCC08SyncStorageOps";
export { default as FCC09SecurityRiskCenter } from "@/pages/admin/FCC09SecurityRiskCenter";
export { default as FCC10HumanOversightEscalation } from "@/pages/admin/FCC10HumanOversightEscalation";
export { default as FCC11IncidentResponseTimeline } from "@/pages/admin/FCC11IncidentResponseTimeline";
export { default as FCC12KnowledgeMemorySystem } from "@/pages/admin/FCC12KnowledgeMemorySystem";

// ── ECO / OS / SYS / Kernel ──
export { default as ECO01EcosystemCommand } from "@/pages/admin/ECO01EcosystemCommand";
export { default as OS01PlatformCommandCenter } from "@/pages/admin/OS01PlatformCommandCenter";
export { default as SYS01SystemIntelligence } from "@/pages/admin/SYS01SystemIntelligence";
export { default as KernelDashboard } from "@/pages/admin/KernelDashboard";

// ── Cloud subdirectory (named exports) ──
export { CloudDashboard } from "@/pages/admin/cloud/CloudDashboard";
export { AdminAuditExplorer } from "@/pages/admin/cloud/AdminAuditExplorer";
export { AdminRBACConsole } from "@/pages/admin/cloud/AdminRBACConsole";
export { AdminSafetyRails } from "@/pages/admin/cloud/AdminSafetyRails";
export { AdminTokenManager } from "@/pages/admin/cloud/AdminTokenManager";
export { ApiGatewayRoutesAdmin } from "@/pages/admin/cloud/ApiGatewayRoutesAdmin";
export { ClientCapabilityAdmin } from "@/pages/admin/cloud/ClientCapabilityAdmin";
export { CloudActivityAdmin } from "@/pages/admin/cloud/CloudActivityAdmin";
export { CloudAdminLayout } from "@/pages/admin/cloud/CloudAdminLayout";
export { CloudAuditAdmin } from "@/pages/admin/cloud/CloudAuditAdmin";
export { default as CloudBackboneAdmin } from "@/pages/admin/cloud/CloudBackboneAdmin";
export { CloudBootstrapAdmin } from "@/pages/admin/cloud/CloudBootstrapAdmin";
export { CloudCollaborationAdmin } from "@/pages/admin/cloud/CloudCollaborationAdmin";
export { CloudComplianceAdmin } from "@/pages/admin/cloud/CloudComplianceAdmin";
export { CloudCostCapacityAdmin } from "@/pages/admin/cloud/CloudCostCapacityAdmin";
export { CloudDeviceIdentityAdmin } from "@/pages/admin/cloud/CloudDeviceIdentityAdmin";
export { CloudDevicesAdmin } from "@/pages/admin/cloud/CloudDevicesAdmin";
export { CloudEncryptionAdmin } from "@/pages/admin/cloud/CloudEncryptionAdmin";
export { CloudFeatureFlagsAdmin } from "@/pages/admin/cloud/CloudFeatureFlagsAdmin";
export { CloudGovernanceAdmin } from "@/pages/admin/cloud/CloudGovernanceAdmin";
export { CloudIntegrityAdmin } from "@/pages/admin/cloud/CloudIntegrityAdmin";
export { CloudJobsAdmin } from "@/pages/admin/cloud/CloudJobsAdmin";
export { CloudLifecycleAdmin } from "@/pages/admin/cloud/CloudLifecycleAdmin";
export { CloudMaintenanceModeAdmin } from "@/pages/admin/cloud/CloudMaintenanceModeAdmin";
export { CloudMonitoringAdmin } from "@/pages/admin/cloud/CloudMonitoringAdmin";
export { CloudNamespacesAdmin } from "@/pages/admin/cloud/CloudNamespacesAdmin";
export { CloudObservabilityAdmin } from "@/pages/admin/cloud/CloudObservabilityAdmin";
export { CloudPolicyAdmin } from "@/pages/admin/cloud/CloudPolicyAdmin";
export { CloudRecoveryAdmin } from "@/pages/admin/cloud/CloudRecoveryAdmin";
export { CloudSharingAdmin } from "@/pages/admin/cloud/CloudSharingAdmin";
export { CloudStorageAdmin } from "@/pages/admin/cloud/CloudStorageAdmin";
export { CloudStorageHealthAdmin } from "@/pages/admin/cloud/CloudStorageHealthAdmin";
export { CloudSupportConsole } from "@/pages/admin/cloud/CloudSupportConsole";
export { CloudSyncAdmin } from "@/pages/admin/cloud/CloudSyncAdmin";
export { CloudSyncObjectsAdmin } from "@/pages/admin/cloud/CloudSyncObjectsAdmin";
export { CloudTenantAdmin } from "@/pages/admin/cloud/CloudTenantAdmin";
export { CloudUsersAdmin } from "@/pages/admin/cloud/CloudUsersAdmin";
export { CloudWorkerOpsAdmin } from "@/pages/admin/cloud/CloudWorkerOpsAdmin";
export { ConfigChangeHistory } from "@/pages/admin/cloud/ConfigChangeHistory";
export { DataFlowMapAdmin } from "@/pages/admin/cloud/DataFlowMapAdmin";
export { DomainOwnershipAdmin } from "@/pages/admin/cloud/DomainOwnershipAdmin";
export { EnvironmentSwitcher } from "@/pages/admin/cloud/EnvironmentSwitcher";
export { PlatformPlaneOverview } from "@/pages/admin/cloud/PlatformPlaneOverview";
export { ReadModelSnapshotsAdmin } from "@/pages/admin/cloud/ReadModelSnapshotsAdmin";
export { ReleaseGovernanceAdmin } from "@/pages/admin/cloud/ReleaseGovernanceAdmin";
export { ServiceIdentityAdmin } from "@/pages/admin/cloud/ServiceIdentityAdmin";
export { SupportCaseManager } from "@/pages/admin/cloud/SupportCaseManager";
export { SupportConsoleSafe } from "@/pages/admin/cloud/SupportConsoleSafe";
