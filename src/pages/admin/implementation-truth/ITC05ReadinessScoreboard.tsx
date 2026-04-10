// ═══════════════════════════════════════════════════════════════
// ITC05 — Readiness Scorecards
// Per-feature 10-dimension scoring, status tiers, platform composite
// ═══════════════════════════════════════════════════════════════

import { Shield } from "lucide-react";
import { useSpecRegistry, useImplementationStats, STATUS_TIERS, type SpecRegistryEntry } from "@/hooks/use-implementation-truth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Trophy, Target, TrendingUp } from "lucide-react";

const DIMENSIONS = [
  { key: "spec_score", label: "Spec Completeness" },
  { key: "ui_score", label: "UI Completeness" },
  { key: "contract_score", label: "Contract Completeness" },
  { key: "wiring_score", label: "Wiring Completeness" },
  { key: "runtime_score", label: "Runtime Evidence" },
] as const;

function ScoreCard({ spec }: { spec: SpecRegistryEntry }) {
  const tier = STATUS_TIERS.find(t => t.value === spec.implementation_status);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{spec.canonical_name}</CardTitle>
          <Badge variant="outline" className={`text-[8px] ${tier?.color}`}>{tier?.label}</Badge>
        </div>
        <div className="text-[9px] text-muted-foreground">{spec.owning_module} · {spec.spec_id}</div>
      </CardHeader>
      <CardContent className="space-y-2">
        {DIMENSIONS.map(d => {
          const val = spec[d.key];
          return (
            <div key={d.key} className="flex items-center gap-2">
              <span className="text-[9px] text-muted-foreground w-28 shrink-0">{d.label}</span>
              <Progress value={val} className="flex-1 h-1.5" />
              <span className={`text-[9px] w-6 text-right ${val >= 80 ? "text-green-500" : val >= 50 ? "text-yellow-500" : "text-destructive"}`}>{val}</span>
            </div>
          );
        })}
        <div className="border-t pt-2 mt-2 flex items-center justify-between">
          <span className="text-[10px] font-medium">Overall Readiness</span>
          <div className="flex items-center gap-2">
            <Progress value={spec.overall_readiness} className="w-20 h-2" />
            <span className={`text-sm font-bold ${spec.overall_readiness >= 80 ? "text-green-500" : spec.overall_readiness >= 50 ? "text-yellow-500" : "text-destructive"}`}>
              {spec.overall_readiness}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ITC05ReadinessScoreboard() {
  const { data: specs, isLoading } = useSpecRegistry();
  const stats = useImplementationStats(specs);

  const sorted = [...(specs || [])].sort((a, b) => b.overall_readiness - a.overall_readiness);
  const launchReady = sorted.filter(s => s.overall_readiness >= 80);
  const needsWork = sorted.filter(s => s.overall_readiness < 50);

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h1 className="text-xl font-semibold text-foreground">TITLE_PLACEHOLDER</h1>
        <p className="text-sm text-muted-foreground">DESC_PLACEHOLDER</p>
      </div>

      {/* Platform Composite */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 text-center">
            <Target className="h-5 w-5 mx-auto text-primary mb-1" />
            <div className="text-3xl font-bold">{stats.avgReadiness}%</div>
            <div className="text-[10px] text-muted-foreground">Platform Readiness</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Trophy className="h-5 w-5 mx-auto text-green-500 mb-1" />
            <div className="text-3xl font-bold text-green-500">{launchReady.length}</div>
            <div className="text-[10px] text-muted-foreground">Launch Ready (≥80%)</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <TrendingUp className="h-5 w-5 mx-auto text-yellow-500 mb-1" />
            <div className="text-3xl font-bold text-yellow-500">{stats.total - launchReady.length - needsWork.length}</div>
            <div className="text-[10px] text-muted-foreground">In Progress (50-79%)</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <BarChart3 className="h-5 w-5 mx-auto text-destructive mb-1" />
            <div className="text-3xl font-bold text-destructive">{needsWork.length}</div>
            <div className="text-[10px] text-muted-foreground">Needs Work (&lt;50%)</div>
          </CardContent>
        </Card>
      </div>

      {/* Dimension Averages */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Platform Dimension Averages</CardTitle>
        </CardHeader>
        <CardContent>
          {specs && specs.length > 0 ? (
            <div className="space-y-2">
              {DIMENSIONS.map(d => {
                const avg = Math.round(specs.reduce((a, s) => a + s[d.key], 0) / specs.length);
                return (
                  <div key={d.key} className="flex items-center gap-3">
                    <span className="text-[10px] text-muted-foreground w-32">{d.label}</span>
                    <Progress value={avg} className="flex-1 h-2" />
                    <span className="text-[10px] font-medium w-8 text-right">{avg}%</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-[11px] text-muted-foreground text-center py-4">No specs to analyze</div>
          )}
        </CardContent>
      </Card>

      {/* Individual Scorecards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-3 text-center text-muted-foreground text-[11px] py-8">Loading…</div>
        ) : sorted.map(spec => (
          <ScoreCard key={spec.spec_id} spec={spec} />
        ))}
      </div>
    </div>
  );
}
