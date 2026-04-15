// ═══════════════════════════════════════════════════════════════
// SITA OS — Release Governance Admin
// Compatibility matrix, staged rollouts, canary deploys
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  Rocket, GitBranch, CheckCircle2, AlertTriangle, Clock,
  ArrowRight, Shield, Layers
} from "lucide-react";

interface ReleaseEntry {
  id: string;
  component_key: string;
  component_type: string;
  current_version: string;
  min_compatible_version: string | null;
  target_version: string | null;
  rollout_stage: string;
  rollout_percentage: number;
  canary_enabled: boolean;
  migration_order: number;
  rollback_version: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

const STAGE_COLORS: Record<string, string> = {
  development: "bg-muted text-muted-foreground",
  canary: "bg-amber-500/20 text-amber-400",
  staged: "bg-blue-500/20 text-blue-400",
  "general-availability": "bg-emerald-500/20 text-emerald-400",
  deprecated: "bg-destructive/20 text-destructive",
};

const TYPE_ICONS: Record<string, typeof Rocket> = {
  "os-client": Layers,
  "mobile-app": Layers,
  "backend-service": GitBranch,
  "admin-platform": Shield,
  "edge-function": GitBranch,
  schema: GitBranch,
};

export function ReleaseGovernanceAdmin() {
  const [releases, setReleases] = useState<ReleaseEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("release_compatibility" as never)
      .select("*" as never)
      .order("migration_order" as never)
      .then(({ data }) => {
        setReleases((data ?? []) as unknown as ReleaseEntry[]);
        setLoading(false);
      });
  }, []);

  const byType = releases.reduce<Record<string, ReleaseEntry[]>>((acc, r) => {
    (acc[r.component_type] ??= []).push(r);
    return acc;
  }, {});

  const canaryCount = releases.filter((r) => r.canary_enabled).length;
  const gaCount = releases.filter((r) => r.rollout_stage === "general-availability").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary/20 flex items-center justify-center">
          <Rocket className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Release Governance</h2>
          <p className="text-sm text-muted-foreground">Compatibility matrix, staged rollouts, and canary deploys</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Badge variant="outline">{canaryCount} canary</Badge>
          <Badge variant="secondary">{gaCount} GA</Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Components", value: releases.length, icon: Layers },
          { label: "In Canary", value: canaryCount, icon: AlertTriangle },
          { label: "GA", value: gaCount, icon: CheckCircle2 },
          { label: "Pending", value: releases.filter((r) => r.rollout_stage === "staged").length, icon: Clock },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className="bg-card/50 border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{value}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading ? (
        <div className="text-muted-foreground text-sm">Loading…</div>
      ) : releases.length === 0 ? (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="py-12 text-center text-muted-foreground">
            <Rocket className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No release compatibility data yet</p>
            <p className="text-xs mt-1">Release entries will appear here when configured</p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(byType).map(([type, entries]) => {
          const TypeIcon = TYPE_ICONS[type] ?? GitBranch;
          return (
            <Card key={type} className="bg-card/50 border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 capitalize">
                  <TypeIcon className="h-4 w-4 text-primary" />
                  {type.replace(/-/g, " ")}
                  <Badge variant="outline" className="ml-auto text-[10px]">{entries.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {entries.map((r) => (
                  <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/30">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{r.component_key}</span>
                        {r.canary_enabled && (
                          <Badge className="text-[9px] bg-amber-500/20 text-amber-400 border-amber-500/30">canary</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                        <span className="font-mono">v{r.current_version}</span>
                        {r.target_version && (
                          <>
                            <ArrowRight className="h-2.5 w-2.5" />
                            <span className="font-mono">v{r.target_version}</span>
                          </>
                        )}
                        {r.min_compatible_version && (
                          <span className="text-muted-foreground/60">min: v{r.min_compatible_version}</span>
                        )}
                      </div>
                      {r.notes && <p className="text-[10px] text-muted-foreground/80 mt-0.5">{r.notes}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {r.rollout_percentage < 100 && (
                        <span className="text-[10px] font-mono text-muted-foreground">{r.rollout_percentage}%</span>
                      )}
                      <Badge className={`text-[10px] ${STAGE_COLORS[r.rollout_stage] ?? ""}`}>
                        {r.rollout_stage}
                      </Badge>
                      {r.rollback_version && (
                        <span className="text-[9px] text-muted-foreground/60 font-mono">↩ v{r.rollback_version}</span>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
