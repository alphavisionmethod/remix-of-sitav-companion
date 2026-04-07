import { useMemo } from "react";
import FleetHealthWidget from "@/components/admin/FleetHealthWidget";
import { SitaPageHeader } from "@/components/sita/SitaCard";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { useEdgeDeviceRuntime, useFleetOTA } from "@/contexts/SitaKernelContext";
import { motion } from "framer-motion";
import { Server, Rocket, Activity } from "lucide-react";

export default function FleetHealthPage() {
  const { isDemoMode } = useDataMode();
  const { listRuntimes, getFleetSummary, getDemoRuntimes } = useEdgeDeviceRuntime();
  const { listReleases, getRolloutProgress, getDemoData: getOTADemoData } = useFleetOTA();

  const summary = useMemo(() => {
    if (isDemoMode) {
      const demoRuntimes = getDemoRuntimes();
      const demoOTA = getOTADemoData();
      return {
        totalRuntimes: demoRuntimes.length,
        activeReleases: demoOTA.releases?.length ?? 0,
        rolloutProgress: demoOTA.progress ?? 100,
      };
    }
    const fleet = getFleetSummary();
    const progress = getRolloutProgress();
    return {
      totalRuntimes: fleet.totalRuntimes ?? 0,
      activeReleases: fleet.activeReleases ?? 0,
      rolloutProgress: progress.percent ?? 100,
    };
  }, [isDemoMode, getFleetSummary, getRolloutProgress, getDemoRuntimes, getOTADemoData]);

  const kpis = [
    { icon: Server, label: "Total Runtimes", value: summary.totalRuntimes },
    { icon: Rocket, label: "Active Releases", value: summary.activeReleases },
    { icon: Activity, label: "Rollout Progress", value: `${summary.rolloutProgress}%` },
  ];

  return (
    <motion.div
      className="container mx-auto max-w-4xl py-8 px-4 space-y-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <DemoModeBadge />
      <SitaPageHeader
        title="Fleet Health"
        subtitle={`${summary.totalRuntimes} runtime${summary.totalRuntimes !== 1 ? "s" : ""} across your fleet`}
      />

      <div className="grid grid-cols-3 gap-4">
        {kpis.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="rounded-xl border border-border bg-card p-4 flex flex-col items-center gap-2"
          >
            <Icon className="h-5 w-5 text-primary" />
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <FleetHealthWidget />
    </motion.div>
  );
}
