import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { AlertTriangle, PauseCircle, BookOpen, Upload, RefreshCw, Image, Zap, Shield, Clock } from "lucide-react";
import { fromTable } from "@/lib/supabase-helpers";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MaintenanceMode {
  id: string;
  mode_key: string;
  display_name: string;
  description: string | null;
  active: boolean;
  severity: string;
  activated_at: string | null;
  activated_by: string | null;
  deactivated_at: string | null;
}

const MODE_ICONS: Record<string, typeof PauseCircle> = {
  "pause-uploads": Upload,
  "read-only": BookOpen,
  "rebuild-indexes": RefreshCw,
  "throttle-previews": Image,
  "pause-sync-fanout": Zap,
  "disable-enrollment": Shield,
};

const SEVERITY_COLORS: Record<string, string> = {
  low: "text-blue-400 bg-blue-500/10",
  medium: "text-amber-400 bg-amber-500/10",
  high: "text-orange-400 bg-orange-500/10",
  critical: "text-red-400 bg-red-500/10",
};

function getDemoModes(): MaintenanceMode[] {
  return [
    { id: "mm1", mode_key: "pause-uploads", display_name: "Pause New Uploads", description: "Temporarily stop accepting new file uploads across all tenants", active: false, severity: "high", activated_at: null, activated_by: null, deactivated_at: null },
    { id: "mm2", mode_key: "read-only", display_name: "Read-Only Mode", description: "Allow reads but block all write operations — safe maintenance window", active: false, severity: "critical", activated_at: null, activated_by: null, deactivated_at: null },
    { id: "mm3", mode_key: "rebuild-indexes", display_name: "Rebuild Search Indexes", description: "Trigger a full rebuild of search and metadata indexes", active: false, severity: "medium", activated_at: null, activated_by: null, deactivated_at: null },
    { id: "mm4", mode_key: "throttle-previews", display_name: "Throttle Preview Generation", description: "Reduce preview worker concurrency to lower system load", active: false, severity: "low", activated_at: null, activated_by: null, deactivated_at: null },
    { id: "mm5", mode_key: "pause-sync-fanout", display_name: "Pause Sync Fanout", description: "Stop pushing sync updates to devices — useful during incidents", active: false, severity: "high", activated_at: null, activated_by: null, deactivated_at: null },
    { id: "mm6", mode_key: "disable-enrollment", display_name: "Disable Device Enrollment", description: "Prevent new devices from joining — lock during security incident", active: false, severity: "critical", activated_at: null, activated_by: null, deactivated_at: null },
  ];
}

export function CloudMaintenanceModeAdmin() {
  const [modes, setModes] = useState<MaintenanceMode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fromTable("cloud_maintenance_modes")
      .select("*")
      .order("created_at")
      .then(({ data }: any) => {
        setModes(data?.length ? data : getDemoModes());
        setLoading(false);
      })
      .catch(() => { setModes(getDemoModes()); setLoading(false); });
  }, []);

  const activeCount = modes.filter(m => m.active).length;

  const toggleMode = (id: string) => {
    setModes(prev => prev.map(m => {
      if (m.id !== id) return m;
      const next = !m.active;
      return { ...m, active: next, activated_at: next ? new Date().toISOString() : m.activated_at, deactivated_at: next ? null : new Date().toISOString() };
    }));
    const mode = modes.find(m => m.id === id);
    toast[mode?.active ? "success" : "warning"](
      `${mode?.display_name} ${mode?.active ? "deactivated" : "ACTIVATED"}`
    );
  };

  return (
    <div className="space-y-4">
      {/* Alert Banner */}
      {activeCount > 0 && (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-400 animate-pulse" />
            <div>
              <p className="text-sm font-medium text-amber-300">{activeCount} maintenance mode{activeCount > 1 ? "s" : ""} active</p>
              <p className="text-xs text-muted-foreground">Platform operations may be affected</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Controls", value: modes.length, color: "text-blue-400" },
          { label: "Active", value: activeCount, color: activeCount > 0 ? "text-amber-400" : "text-emerald-400" },
          { label: "Inactive", value: modes.length - activeCount, color: "text-muted-foreground" },
        ].map(m => (
          <Card key={m.label}>
            <CardContent className="p-4 text-center">
              <p className={cn("text-2xl font-bold", m.color)}>{m.value}</p>
              <p className="text-xs text-muted-foreground">{m.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mode Cards */}
      <div className="space-y-2">
        {modes.map(mode => {
          const Icon = MODE_ICONS[mode.mode_key] || PauseCircle;
          const sevStyle = SEVERITY_COLORS[mode.severity] || SEVERITY_COLORS.low;
          return (
            <Card key={mode.id} className={cn(mode.active && "border-amber-500/30 bg-amber-500/5")}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", mode.active ? "bg-amber-500/20" : "bg-muted/30")}>
                      <Icon className={cn("h-5 w-5", mode.active ? "text-amber-400" : "text-muted-foreground")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium">{mode.display_name}</p>
                        <Badge variant="outline" className={cn("text-xs", sevStyle)}>{mode.severity}</Badge>
                        {mode.active && (
                          <Badge className="text-xs bg-amber-500/20 text-amber-300 border-amber-500/30">
                            <Clock className="h-3 w-3 mr-1" /> Active
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{mode.description}</p>
                      {mode.active && mode.activated_at && (
                        <p className="text-xs text-amber-400/70 mt-1">
                          Since {new Date(mode.activated_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <Switch checked={mode.active} onCheckedChange={() => toggleMode(mode.id)} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
