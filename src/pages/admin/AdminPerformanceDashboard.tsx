// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Performance Dashboard Page
// ═══════════════════════════════════════════════════════════════

import { AdminControlPlaneShell } from "@/platform/admin/components/admin/shells/AdminControlPlaneShell";
import { PerformanceDashboardPanel } from "@/platform/admin/components/admin/performance/PerformanceDashboardPanel";

export default function AdminPerformanceDashboard() {
  return (
    <AdminControlPlaneShell contextScope="Performance">
      <div className="p-4 md:p-6 max-w-[1200px] mx-auto space-y-4">
        <h1 className="text-lg font-semibold">Performance Baselines</h1>
        <p className="text-sm text-muted-foreground">
          Live p50/p95/p99 latency and cold-start metrics from this session's route navigations and AI chat requests.
        </p>
        <PerformanceDashboardPanel />
      </div>
    </AdminControlPlaneShell>
  );
}