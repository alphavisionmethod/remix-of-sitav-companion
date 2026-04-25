import { useState } from "react";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import { PageSkeleton } from "@/platform/sita/components/sita/PageSkeleton";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { CloudAdminLayout, type CloudTab } from "./CloudAdminLayout";
import { CloudDashboard } from "./CloudDashboard";
import { CloudUsersAdmin } from "./CloudUsersAdmin";
import { CloudDevicesAdmin } from "./CloudDevicesAdmin";
import { CloudStorageAdmin } from "./CloudStorageAdmin";
import { CloudSyncAdmin } from "./CloudSyncAdmin";
import { CloudAuditAdmin } from "./CloudAuditAdmin";
import { CloudJobsAdmin } from "./CloudJobsAdmin";
import { CloudPolicyAdmin } from "./CloudPolicyAdmin";
import { CloudRecoveryAdmin } from "./CloudRecoveryAdmin";
import { CloudMonitoringAdmin } from "./CloudMonitoringAdmin";
import { CloudActivityAdmin } from "./CloudActivityAdmin";
import { CloudCollaborationAdmin } from "./CloudCollaborationAdmin";
import { CloudSharingAdmin } from "./CloudSharingAdmin";
import { CloudGovernanceAdmin } from "./CloudGovernanceAdmin";
import { CloudSyncObjectsAdmin } from "./CloudSyncObjectsAdmin";
import { CloudDeviceIdentityAdmin } from "./CloudDeviceIdentityAdmin";
import { CloudEncryptionAdmin } from "./CloudEncryptionAdmin";
import { CloudNamespacesAdmin } from "./CloudNamespacesAdmin";
import { CloudTenantAdmin } from "./CloudTenantAdmin";
import { CloudStorageHealthAdmin } from "./CloudStorageHealthAdmin";
import { CloudWorkerOpsAdmin } from "./CloudWorkerOpsAdmin";
import { CloudCostCapacityAdmin } from "./CloudCostCapacityAdmin";
import { CloudSupportConsole } from "./CloudSupportConsole";
import { CloudIntegrityAdmin } from "./CloudIntegrityAdmin";
import { CloudLifecycleAdmin } from "./CloudLifecycleAdmin";
import { CloudComplianceAdmin } from "./CloudComplianceAdmin";
import { CloudFeatureFlagsAdmin } from "./CloudFeatureFlagsAdmin";
import { CloudMaintenanceModeAdmin } from "./CloudMaintenanceModeAdmin";
import { CloudObservabilityAdmin } from "./CloudObservabilityAdmin";
import { CloudBootstrapAdmin } from "./CloudBootstrapAdmin";
// Platform Plane tabs
import { PlatformPlaneOverview } from "./PlatformPlaneOverview";
import { AdminRBACConsole } from "./AdminRBACConsole";
import { AdminAuditExplorer } from "./AdminAuditExplorer";
import { EnvironmentSwitcher } from "./EnvironmentSwitcher";
import { SupportConsoleSafe } from "./SupportConsoleSafe";
import { AdminTokenManager } from "./AdminTokenManager";
import { ApiGatewayRoutesAdmin } from "./ApiGatewayRoutesAdmin";
// Part 2 — Platform Glue tabs
import { DomainOwnershipAdmin } from "./DomainOwnershipAdmin";
import { ServiceIdentityAdmin } from "./ServiceIdentityAdmin";
import { AdminSafetyRails } from "./AdminSafetyRails";
import { SupportCaseManager } from "./SupportCaseManager";
import { ConfigChangeHistory } from "./ConfigChangeHistory";
import { ClientCapabilityAdmin } from "./ClientCapabilityAdmin";
import { ReleaseGovernanceAdmin } from "./ReleaseGovernanceAdmin";
import { ReadModelSnapshotsAdmin } from "./ReadModelSnapshotsAdmin";
import { DataFlowMapAdmin } from "./DataFlowMapAdmin";

const tabComponents: Record<CloudTab, React.ComponentType> = {
  dashboard: CloudDashboard,
  users: CloudUsersAdmin,
  tenants: CloudTenantAdmin,
  devices: CloudDevicesAdmin,
  storage: CloudStorageAdmin,
  "storage-health": CloudStorageHealthAdmin,
  sync: CloudSyncAdmin,
  "sync-objects": CloudSyncObjectsAdmin,
  "device-identity": CloudDeviceIdentityAdmin,
  encryption: CloudEncryptionAdmin,
  namespaces: CloudNamespacesAdmin,
  workers: CloudWorkerOpsAdmin,
  lifecycle: CloudLifecycleAdmin,
  cost: CloudCostCapacityAdmin,
  integrity: CloudIntegrityAdmin,
  audit: CloudAuditAdmin,
  compliance: CloudComplianceAdmin,
  support: CloudSupportConsole,
  "feature-flags": CloudFeatureFlagsAdmin,
  maintenance: CloudMaintenanceModeAdmin,
  observability: CloudObservabilityAdmin,
  bootstrap: CloudBootstrapAdmin,
  jobs: CloudJobsAdmin,
  recovery: CloudRecoveryAdmin,
  monitoring: CloudMonitoringAdmin,
  activity: CloudActivityAdmin,
  collaboration: CloudCollaborationAdmin,
  sharing: CloudSharingAdmin,
  governance: CloudGovernanceAdmin,
  policy: CloudPolicyAdmin,
  // Platform Plane tabs
  planes: PlatformPlaneOverview,
  rbac: AdminRBACConsole,
  "admin-audit": AdminAuditExplorer,
  environments: EnvironmentSwitcher,
  "support-safe": SupportConsoleSafe,
  tokens: AdminTokenManager,
  "gateway-routes": ApiGatewayRoutesAdmin,
  // Part 2 — Platform Glue tabs
  "domain-ownership": DomainOwnershipAdmin,
  "service-identity": ServiceIdentityAdmin,
  "safety-rails": AdminSafetyRails,
  "support-cases": SupportCaseManager,
  "config-history": ConfigChangeHistory,
  "client-capability": ClientCapabilityAdmin,
  "release-governance": ReleaseGovernanceAdmin,
  "read-models": ReadModelSnapshotsAdmin,
  "data-flows": DataFlowMapAdmin,
};

export default function CloudBackboneAdmin() {
  const { isAdmin, loading } = useRequireAdmin();
  const [activeTab, setActiveTab] = useState<CloudTab>("dashboard");

  if (loading) return <div className="p-6"><PageSkeleton rows={4} /></div>;
  if (!isAdmin) return null;

  const TabContent = tabComponents[activeTab];

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
      <PageTruthBanner truthState="demo" freshness="live" />
      <CloudAdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
        <TabContent />
      </CloudAdminLayout>
    </div>
  );
}
