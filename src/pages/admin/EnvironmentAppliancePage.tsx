// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin: Environment & Appliance Workspace
// VM status, resource usage, backup, update channel, lifecycle
// ═══════════════════════════════════════════════════════════════

import { SitaPageHeader } from "@/platform/sita/components/sita/SitaPageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Server, Cpu, HardDrive, MemoryStick, Activity, RefreshCw, Download, Shield, Clock, CheckCircle, AlertTriangle, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const RESOURCE_METRICS = [
  { label: "CPU Usage", value: 34, max: 100, unit: "%", icon: Cpu, status: "healthy" as const },
  { label: "Memory", value: 6.2, max: 16, unit: "GB", icon: MemoryStick, status: "healthy" as const },
  { label: "Storage", value: 124, max: 500, unit: "GB", icon: HardDrive, status: "healthy" as const },
  { label: "Network I/O", value: 12, max: 100, unit: "Mbps", icon: Activity, status: "healthy" as const },
];

const CONTAINERS = [
  { name: "web", service: "Frontend SPA", port: 8080, status: "running", uptime: "14d 6h" },
  { name: "api-gateway", service: "API Routing", port: 3000, status: "running", uptime: "14d 6h" },
  { name: "brain-core", service: "Orchestration", port: 3001, status: "running", uptime: "14d 5h" },
  { name: "supabase-db", service: "PostgreSQL", port: 5432, status: "running", uptime: "14d 6h" },
  { name: "supabase-auth", service: "GoTrue Auth", port: 9999, status: "running", uptime: "14d 6h" },
];

const BACKUP_HISTORY = [
  { id: "bk-1", type: "Full", timestamp: "2026-04-09T02:00:00Z", size: "2.4 GB", status: "success" },
  { id: "bk-2", type: "Incremental", timestamp: "2026-04-08T14:00:00Z", size: "340 MB", status: "success" },
  { id: "bk-3", type: "Full", timestamp: "2026-04-08T02:00:00Z", size: "2.3 GB", status: "success" },
  { id: "bk-4", type: "Incremental", timestamp: "2026-04-07T14:00:00Z", size: "290 MB", status: "warning" },
];

const LIFECYCLE_EVENTS = [
  { id: "lc-1", event: "OTA Update Applied", version: "v2.8.1", timestamp: "2026-04-07T03:15:00Z", status: "success" },
  { id: "lc-2", event: "Health Check Passed", version: "v2.8.1", timestamp: "2026-04-09T08:00:00Z", status: "success" },
  { id: "lc-3", event: "Backup Retention Cleanup", version: "—", timestamp: "2026-04-06T02:00:00Z", status: "success" },
  { id: "lc-4", event: "Certificate Rotation", version: "—", timestamp: "2026-04-05T04:00:00Z", status: "success" },
];

export default function EnvironmentAppliancePage() {

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
      <SitaPageHeader
        icon={<Server className="h-6 w-6" />}
        title="Environment & Appliance"
        subtitle="VM status, resource usage, backup state, and appliance lifecycle"
      />
      

      {/* Resource Usage */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {RESOURCE_METRICS.map(metric => {
          const Icon = metric.icon;
          const pct = (metric.value / metric.max) * 100;
          return (
            <Card key={metric.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{metric.label}</span>
                  </div>
                  <span className={cn("text-xs font-semibold", pct > 80 ? "text-destructive" : pct > 60 ? "text-[hsl(var(--sita-gold))]" : "text-[hsl(var(--trust-safe))]")}>
                    {metric.value} {metric.unit}
                  </span>
                </div>
                <Progress value={pct} className="h-2" />
                <p className="text-[10px] text-muted-foreground mt-1">of {metric.max} {metric.unit}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Container Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-4 w-4" /> Container Status
          </CardTitle>
          <CardDescription>Docker containers running in appliance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {CONTAINERS.map(c => (
              <div key={c.name} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className={cn("h-2 w-2 rounded-full", c.status === "running" ? "bg-[hsl(var(--trust-safe))]" : "bg-destructive")} />
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-[10px] text-muted-foreground">{c.service}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">:{c.port}</p>
                  <p className="text-[10px] text-muted-foreground">Up {c.uptime}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Backup Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" /> Backup History
            </CardTitle>
            <CardDescription>30-day rolling retention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {BACKUP_HISTORY.map(b => (
                <div key={b.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    {b.status === "success" ? (
                      <CheckCircle className="h-3.5 w-3.5 text-[hsl(var(--trust-safe))]" />
                    ) : (
                      <AlertTriangle className="h-3.5 w-3.5 text-[hsl(var(--sita-gold))]" />
                    )}
                    <div>
                      <p className="text-sm">{b.type} Backup</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(b.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{b.size}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lifecycle Events */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" /> Lifecycle Events
            </CardTitle>
            <CardDescription>Appliance lifecycle history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {LIFECYCLE_EVENTS.map(e => (
                <div key={e.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-[hsl(var(--trust-safe))]" />
                    <div>
                      <p className="text-sm">{e.event}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(e.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                  {e.version !== "—" && <span className="text-xs text-muted-foreground font-mono">{e.version}</span>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Update Channel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Download className="h-4 w-4" /> Update Channel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
            <div>
              <p className="text-sm font-medium">Stable Channel</p>
              <p className="text-[11px] text-muted-foreground">Current: v2.8.1 • Last checked: 2h ago</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-1 rounded-full bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))] font-medium">Up to date</span>
              <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
