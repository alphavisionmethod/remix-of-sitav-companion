import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Rocket, FolderPlus, Shield, Database, Radio, Smartphone, CheckCircle, Clock } from "lucide-react";
import { fromTable } from "@/lib/supabase-helpers";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BootstrapMarker {
  id: string;
  user_id: string;
  marker_type: string;
  status: string;
  device_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

const MARKER_META: Record<string, { label: string; icon: typeof Rocket; color: string }> = {
  "root-folder-init": { label: "Root Folder Initialized", icon: FolderPlus, color: "text-blue-400" },
  "default-quota": { label: "Default Quota Assigned", icon: Database, color: "text-emerald-400" },
  "first-device-trust": { label: "First Device Trusted", icon: Shield, color: "text-amber-400" },
  "namespace-setup": { label: "Default Namespaces Created", icon: Radio, color: "text-purple-400" },
  "initial-sync-seed": { label: "Initial Sync Seed", icon: Smartphone, color: "text-cyan-400" },
  "first-backup": { label: "First Backup Snapshot", icon: CheckCircle, color: "text-emerald-400" },
};

function getDemoMarkers(): BootstrapMarker[] {
  return [
    { id: "bm1", user_id: "demo-user-1", marker_type: "root-folder-init", status: "completed", device_id: null, details: null, created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: "bm2", user_id: "demo-user-1", marker_type: "default-quota", status: "completed", device_id: null, details: { plan: "pro", bytes: 107374182400 }, created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: "bm3", user_id: "demo-user-1", marker_type: "first-device-trust", status: "completed", device_id: "dev-1", details: { platform: "macos" }, created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: "bm4", user_id: "demo-user-2", marker_type: "root-folder-init", status: "completed", device_id: null, details: null, created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: "bm5", user_id: "demo-user-2", marker_type: "default-quota", status: "pending", device_id: null, details: null, created_at: new Date(Date.now() - 3600000).toISOString() },
  ];
}

export function CloudBootstrapAdmin() {
  const [markers, setMarkers] = useState<BootstrapMarker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fromTable("cloud_bootstrap_markers")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }: any) => {
        setMarkers(data?.length ? data : getDemoMarkers());
        setLoading(false);
      })
      .catch(() => { setMarkers(getDemoMarkers()); setLoading(false); });
  }, []);

  const completedCount = markers.filter(m => m.status === "completed").length;
  const pendingCount = markers.filter(m => m.status === "pending").length;
  const uniqueUsers = new Set(markers.map(m => m.user_id)).size;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Markers", value: markers.length, icon: Rocket, color: "text-primary" },
          { label: "Completed", value: completedCount, icon: CheckCircle, color: "text-emerald-400" },
          { label: "Pending", value: pendingCount, icon: Clock, color: "text-amber-400" },
          { label: "Users Bootstrapped", value: uniqueUsers, icon: Smartphone, color: "text-blue-400" },
        ].map(m => (
          <Card key={m.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <m.icon className={cn("h-5 w-5", m.color)} />
              <div>
                <p className="text-2xl font-bold">{m.value}</p>
                <p className="text-xs text-muted-foreground">{m.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bootstrap Steps Reference */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Rocket className="h-4 w-4 text-primary" /> First-Device Bootstrap Sequence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(MARKER_META).map(([key, meta], i) => {
              const Icon = meta.icon;
              return (
                <div key={key} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/30">
                  <div className="flex items-center justify-center h-7 w-7 rounded-full bg-muted/40 text-xs font-bold text-muted-foreground">{i + 1}</div>
                  <Icon className={cn("h-4 w-4", meta.color)} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{meta.label}</p>
                    <p className="text-xs text-muted-foreground font-mono">{key}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Bootstrap Events */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> Recent Bootstrap Events
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {markers.map(m => {
            const meta = MARKER_META[m.marker_type] || { label: m.marker_type, icon: Rocket, color: "text-muted-foreground" };
            const Icon = meta.icon;
            return (
              <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30">
                <div className="flex items-center gap-3">
                  <Icon className={cn("h-4 w-4", meta.color)} />
                  <div>
                    <p className="text-sm font-medium">{meta.label}</p>
                    <p className="text-xs text-muted-foreground">
                      User: {m.user_id.slice(0, 8)}… · {new Date(m.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Badge variant={m.status === "completed" ? "default" : "secondary"} className="text-xs capitalize">{m.status}</Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
