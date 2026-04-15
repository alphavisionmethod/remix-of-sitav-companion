// ═══════════════════════════════════════════════════════════════
// SITA OS — Read Model Snapshots Admin
// Pre-computed aggregation views: user-360, device-health, sync-health
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Database, RefreshCw, CheckCircle2, Clock, AlertTriangle,
  Users, Smartphone, HardDrive, Activity
} from "lucide-react";

interface ReadModelSnapshot {
  id: string;
  model_key: string;
  subject_type: string;
  subject_id: string;
  snapshot_data: Record<string, unknown>;
  freshness_ms: number;
  computed_at: string;
  status: string;
  created_at: string;
}

const MODEL_ICONS: Record<string, typeof Users> = {
  "user-360": Users,
  "device-health": Smartphone,
  "sync-health": RefreshCw,
  "storage-summary": HardDrive,
  "admin-kpis": Activity,
};

const FRESHNESS_THRESHOLDS = {
  fresh: 60_000,     // < 1 min
  stale: 300_000,    // < 5 min
  expired: Infinity,
};

function getFreshnessLabel(ms: number) {
  if (ms < FRESHNESS_THRESHOLDS.fresh) return { label: "Fresh", color: "text-emerald-400", icon: CheckCircle2 };
  if (ms < FRESHNESS_THRESHOLDS.stale) return { label: "Stale", color: "text-amber-400", icon: Clock };
  return { label: "Expired", color: "text-destructive", icon: AlertTriangle };
}

export function ReadModelSnapshotsAdmin() {
  const [snapshots, setSnapshots] = useState<ReadModelSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = () => {
    setLoading(true);
    supabase
      .from("read_model_snapshots" as never)
      .select("*" as never)
      .order("computed_at" as never, { ascending: false })
      .limit(100)
      .then(({ data }) => {
        setSnapshots((data ?? []) as unknown as ReadModelSnapshot[]);
        setLoading(false);
      });
  };

  useEffect(() => { load(); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1500));
    load();
    setRefreshing(false);
    toast.success("Read models refreshed");
  };

  const byModel = snapshots.reduce<Record<string, ReadModelSnapshot[]>>((acc, s) => {
    (acc[s.model_key] ??= []).push(s);
    return acc;
  }, {});

  const modelKeys = Object.keys(byModel);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary/20 flex items-center justify-center">
          <Database className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Read Model Snapshots</h2>
          <p className="text-sm text-muted-foreground">Pre-computed aggregation views for BFF layers and dashboards</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="outline">{snapshots.length} snapshots</Badge>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {["user-360", "device-health", "sync-health", "storage-summary", "admin-kpis"].map((key) => {
          const Icon = MODEL_ICONS[key] ?? Database;
          const count = byModel[key]?.length ?? 0;
          return (
            <Card key={key} className="bg-card/50 border-border/50">
              <CardContent className="p-3 flex items-center gap-2">
                <Icon className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <p className="text-lg font-bold text-foreground">{count}</p>
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{key}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {loading ? (
        <div className="text-muted-foreground text-sm">Loading…</div>
      ) : snapshots.length === 0 ? (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="py-12 text-center text-muted-foreground">
            <Database className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No read model snapshots yet</p>
            <p className="text-xs mt-1">Snapshots are computed asynchronously from events and used by BFF aggregation layers</p>
          </CardContent>
        </Card>
      ) : (
        modelKeys.map((modelKey) => {
          const items = byModel[modelKey];
          const Icon = MODEL_ICONS[modelKey] ?? Database;
          return (
            <Card key={modelKey} className="bg-card/50 border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  {modelKey.replace(/-/g, " ")}
                  <Badge variant="outline" className="ml-auto text-[10px]">{items.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5 max-h-[300px] overflow-y-auto">
                {items.map((s) => {
                  const freshness = getFreshnessLabel(s.freshness_ms);
                  const FIcon = freshness.icon;
                  return (
                    <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/20 border border-border/30">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-muted-foreground">{s.subject_type}:</span>
                          <span className="text-xs font-mono truncate">{s.subject_id.slice(0, 12)}…</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          Computed {new Date(s.computed_at).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <FIcon className={`h-3 w-3 ${freshness.color}`} />
                        <span className={`text-[10px] ${freshness.color}`}>{freshness.label}</span>
                        <span className="text-[10px] font-mono text-muted-foreground">{s.freshness_ms}ms</span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
