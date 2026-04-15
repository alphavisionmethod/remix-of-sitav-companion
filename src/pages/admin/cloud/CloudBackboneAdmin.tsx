import { useState } from "react";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import { PageSkeleton } from "@/components/sita/PageSkeleton";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { CloudAdminLayout, type CloudTab } from "./CloudAdminLayout";
import { CloudDashboard } from "./CloudDashboard";
import { CloudUsersAdmin } from "./CloudUsersAdmin";
import { CloudDevicesAdmin } from "./CloudDevicesAdmin";
import { CloudStorageAdmin } from "./CloudStorageAdmin";
import { CloudSyncAdmin } from "./CloudSyncAdmin";
import { CloudAuditAdmin } from "./CloudAuditAdmin";
import { CloudJobsAdmin } from "./CloudJobsAdmin";
import { CloudPolicyAdmin } from "./CloudPolicyAdmin";

const tabComponents: Record<CloudTab, React.ComponentType> = {
  dashboard: CloudDashboard,
  users: CloudUsersAdmin,
  devices: CloudDevicesAdmin,
  storage: CloudStorageAdmin,
  sync: CloudSyncAdmin,
  audit: CloudAuditAdmin,
  jobs: CloudJobsAdmin,
  policy: CloudPolicyAdmin,
};

export default function CloudBackboneAdmin() {
  const { isAdmin, loading } = useRequireAdmin();
  const [activeTab, setActiveTab] = useState<CloudTab>("dashboard");

  if (loading) return <div className="p-6"><PageSkeleton rows={4} /></div>;
  if (!isAdmin) return null;

  const TabContent = tabComponents[activeTab];

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
      <PageTruthBanner mode="demo" context="Cloud Backbone — Demo data shown" />
      <CloudAdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
        <TabContent />
      </CloudAdminLayout>
    </div>
  );
}
