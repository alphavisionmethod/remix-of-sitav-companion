import DWESubNav from "@/components/admin/DWESubNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rocket, CheckCircle, XCircle, Beaker } from "lucide-react";
import { fromTable } from "@/lib/supabase-helpers";
import { DEVICE_ROADMAP } from "@/packages/contracts/msa/device-family-contract";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import type { AmbientLaunchReadinessRow } from "@/lib/types/dwe-types";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { DemoOnlyBanner } from "@/components/claim-safety/DemoOnlyBanner";
import { FutureVisionBadge } from "@/components/claim-safety/FutureVisionBadge";
import { getDemoOnlySurfacesByContainment, DEMO_ONLY_SURFACE_COUNT } from "@/lib/claim-safety/demo-only-surface-registry";
import { useDataMode } from "@/contexts/DataModeContext";

export default function DWE07DeviceLaunchHonestyBoard() {
  const { user } = useAuth();

  const { data: readiness = [] } = useQuery<AmbientLaunchReadinessRow[]>({
    queryKey: ["dwe07-readiness", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await fromTable("ambient_launch_readiness").select("*").order("target_type", { ascending: true });
      return (data ?? []) as AmbientLaunchReadinessRow[];
    },
  });

  const statusIcon = (ready: boolean, pilot: boolean) => {
    if (ready) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (pilot) return <Beaker className="h-4 w-4 text-yellow-500" />;
    return <XCircle className="h-4 w-4 text-muted-foreground" />;
  };

  const byType = readiness.reduce<Record<string, AmbientLaunchReadinessRow[]>>((acc, r) => {
    const k = r.target_type || "other";
    if (!acc[k]) acc[k] = [];
    acc[k].push(r);
    return acc;
  }, {});

  return (
    <div className="space-y-6 p-6">
      <DWESubNav />
      <DemoOnlyBanner surfaceId="DWE07" />

      {/* Live Demo-Only Surface Registry truth board */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Beaker className="h-4 w-4" />
            Demo-Only Surface Registry ({DEMO_ONLY_SURFACE_COUNT})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(Object.entries(getDemoOnlySurfacesByContainment()) as [keyof ReturnType<typeof getDemoOnlySurfacesByContainment>, ReturnType<typeof getDemoOnlySurfacesByContainment>[keyof ReturnType<typeof getDemoOnlySurfacesByContainment>]][]).map(([level, surfaces]) => (
              <div key={level} className="space-y-2">
                <div className="flex items-center gap-2">
                  <FutureVisionBadge containment={level} />
                  <span className="text-xs text-muted-foreground">{surfaces.length}</span>
                </div>
                <ul className="space-y-1">
                  {surfaces.map((s) => (
                    <li key={s.surfaceId} className="text-xs">
                      <span className="font-mono text-muted-foreground">{s.surfaceId}</span>{" "}
                      <span className="text-foreground">{s.surfaceName}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
<div>
        <h1 className="text-2xl font-bold text-foreground">DWE07 — Device & Wearable Launch Honesty Board</h1>
        <p className="text-muted-foreground">Truthful device readiness: real, demo, pilot, internal, unsupported.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Entries</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{readiness.length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Launch Ready</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-green-500">{readiness.filter((r) => r.launch_ready).length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pilot Ready</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-yellow-500">{readiness.filter((r) => r.pilot_ready && !r.launch_ready).length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Not Ready</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-muted-foreground">{readiness.filter((r) => !r.launch_ready && !r.pilot_ready).length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Rocket className="h-5 w-5" /> Device Roadmap Phases</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {DEVICE_ROADMAP.map((phase) => (
              <div key={phase.phaseKey} className="p-3 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={phase.status === "active" ? "default" : "outline"} className="text-xs">{phase.status}</Badge>
                  <p className="font-medium text-sm">{phase.name}</p>
                </div>
                <p className="text-xs text-muted-foreground mb-1">{phase.description}</p>
                <div className="flex flex-wrap gap-1">
                  {phase.primaryDevices.map((d) => <Badge key={d} variant="secondary" className="text-xs">{d}</Badge>)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {Object.entries(byType).map(([type, items]) => (
        <Card key={type}>
          <CardHeader><CardTitle className="capitalize">{type.replace(/_/g, " ")} Readiness</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {items.map((r) => (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  {statusIcon(r.launch_ready ?? false, r.pilot_ready ?? false)}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{r.target_name}</p>
                    <p className="text-xs text-muted-foreground">{r.launch_label || r.target_key}</p>
                  </div>
                  {r.demo_available && <Badge variant="outline" className="text-xs">Demo</Badge>}
                  {r.internal_only && <Badge variant="secondary" className="text-xs">Internal</Badge>}
                  <Badge variant={r.launch_ready ? "default" : "outline"} className="text-xs">
                    {r.launch_ready ? "Launch Ready" : r.pilot_ready ? "Pilot" : "Not Ready"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
