import FleetHealthWidget from "@/components/admin/FleetHealthWidget";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { useEdgeDeviceRuntime, useFleetOTA } from "@/contexts/SitaKernelContext";

export default function FleetHealthPage() {
  const { isDemoMode } = useDataMode();
  const { listRuntimes, getFleetSummary, getDemoRuntimes } = useEdgeDeviceRuntime();
  const { listReleases, getRolloutProgress, getDemoData: getOTADemoData } = useFleetOTA();

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <DemoModeBadge />
      <FleetHealthWidget />
    </div>
  );
}
