import RCPSubNav from "@/platform/admin/components/admin/RCPSubNav";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Megaphone, ShieldAlert, ShieldCheck, AlertTriangle } from "lucide-react";
import {
  computeLaunchHonestyBoard, getLaunchHonestySummary, getRealityDistribution, getDomainRealityRollups,
  type RealityState
} from "@/runtimes/reality/reality-audit-registry";

const stateColors: Record<RealityState, string> = {
  presentational: "text-red-400 bg-red-500/10",
  simulated: "text-amber-400 bg-amber-500/10",
  persisted: "text-blue-400 bg-blue-500/10",
  proven: "text-emerald-400 bg-emerald-500/10",
};

const claimColors: Record<string, string> = {
  safe: "text-emerald-400 bg-emerald-500/10",
  caution: "text-amber-400 bg-amber-500/10",
  danger: "text-red-400 bg-red-500/10",
};

const riskColors: Record<string, string> = {
  none: "text-emerald-400",
  low: "text-blue-400",
  medium: "text-amber-400",
  high: "text-red-400",
};

const LaunchHonestyBoard = () => {
  const records = useMemo(() => computeLaunchHonestyBoard(), []);
  const summary = getLaunchHonestySummary();
  const dist = getRealityDistribution();
  const domainRollups = useMemo(() => getDomainRealityRollups(), []);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <RCPSubNav />
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10"><Megaphone className="h-6 w-6 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold">Launch Honesty Board</h1>
          <p className="text-sm text-muted-foreground">What is real, what is partial, what is simulated, what is proven — preventing self-deception</p>
        </div>
      </div>

      {/* LaunchHonestyScorecards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {([
          { label: "Total Features", value: summary.total, color: "text-blue-400" },
          { label: "Launch Claimable", value: summary.claimable, color: summary.claimable > 0 ? "text-emerald-400" : "text-red-400" },
          { label: "Blocked from Claims", value: summary.blocked, color: summary.blocked > 0 ? "text-red-400" : "text-emerald-400" },
          { label: "Fully Proven", value: summary.proven, color: summary.proven > 0 ? "text-emerald-400" : "text-muted-foreground" },
        ]).map(k => (
          <Card key={k.label} className="bg-card/50"><CardContent className="p-3 text-center">
            <div className={`text-xl font-bold ${k.color}`}>{k.value}</div>
            <div className="text-[10px] text-muted-foreground">{k.label}</div>
          </CardContent></Card>
        ))}
      </div>

      {/* Reality distribution visual */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Reality Distribution</CardTitle></CardHeader>
        <CardContent>
          <div className="flex h-8 rounded-lg overflow-hidden">
            {(["presentational", "simulated", "persisted", "proven"] as RealityState[]).map(s => {
              const pct = (dist[s] / summary.total) * 100;
              const bg = { presentational: "bg-red-500", simulated: "bg-amber-500", persisted: "bg-blue-500", proven: "bg-emerald-500" }[s];
              return pct > 0 ? (
                <div key={s} className={`${bg} flex items-center justify-center text-[10px] font-bold text-foreground`} style={{ width: `${pct}%` }}>
                  {dist[s]}
                </div>
              ) : null;
            })}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
            <span>← Not launch-ready</span>
            <span>Launch-ready →</span>
          </div>
        </CardContent>
      </Card>

      {/* DomainTruthBreakdown */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Domain Truth Breakdown</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {domainRollups.map(d => (
              <div key={d.domain} className={`p-3 rounded-lg border ${d.healthPct < 30 ? "border-red-500/20 bg-red-500/5" : d.healthPct < 60 ? "border-amber-500/20 bg-amber-500/5" : "border-emerald-500/20 bg-emerald-500/5"}`}>
                <div className="capitalize font-medium text-sm">{d.domain}</div>
                <div className={`text-xl font-bold ${d.healthPct < 30 ? "text-red-400" : d.healthPct < 60 ? "text-amber-400" : "text-emerald-400"}`}>{d.healthPct}%</div>
                <div className="text-[10px] text-muted-foreground">{d.persisted + d.proven}/{d.total} real</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Honesty table with claim severity and promotion risk */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Feature</TableHead>
                  <TableHead className="w-20">Domain</TableHead>
                  <TableHead className="w-24">State</TableHead>
                  <TableHead className="w-20">Claim</TableHead>
                  <TableHead className="w-20">Risk</TableHead>
                  <TableHead className="w-16">Qualifier</TableHead>
                  <TableHead className="w-16">Claimable</TableHead>
                  <TableHead>Assessment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map(r => (
                  <TableRow key={r.id} className={r.allowedInLaunchClaims ? "bg-emerald-500/5" : "bg-red-500/5"}>
                    <TableCell className="font-medium text-sm">{r.name}</TableCell>
                    <TableCell className="text-xs capitalize">{r.domain}</TableCell>
                    <TableCell><span className={`text-[10px] px-2 py-0.5 rounded ${stateColors[r.realityState]}`}>{r.realityState}</span></TableCell>
                    <TableCell><span className={`text-[10px] px-2 py-0.5 rounded capitalize ${claimColors[r.claimSeverity]}`}>{r.claimSeverity}</span></TableCell>
                    <TableCell><span className={`text-xs capitalize ${riskColors[r.promotionRisk]}`}>{r.promotionRisk}</span></TableCell>
                    <TableCell>{r.qualifierRequired ? <AlertTriangle className="h-3.5 w-3.5 text-amber-400" /> : <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />}</TableCell>
                    <TableCell>
                      {r.allowedInLaunchClaims
                        ? <ShieldCheck className="h-4 w-4 text-emerald-400" />
                        : <ShieldAlert className="h-4 w-4 text-red-400" />}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.honestyNotes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* PromotionRiskMatrix */}
      <Card className="border-amber-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-400" /> Promotion Risk Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(["high", "medium", "low", "none"] as const).map(risk => {
              const features = records.filter(r => r.promotionRisk === risk);
              return (
                <div key={risk} className={`p-3 rounded-lg border ${risk === "high" ? "border-red-500/20" : risk === "medium" ? "border-amber-500/20" : "border-border/50"}`}>
                  <div className={`text-lg font-bold capitalize ${riskColors[risk]}`}>{features.length}</div>
                  <div className="text-[10px] text-muted-foreground capitalize">{risk} Risk</div>
                  <div className="mt-1 space-y-0.5">
                    {features.slice(0, 3).map(f => <div key={f.id} className="text-[10px] truncate">{f.name}</div>)}
                    {features.length > 3 && <div className="text-[10px] text-muted-foreground">+{features.length - 3} more</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Blocked features */}
      {summary.blocked > 0 && (
        <Card className="border-red-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-red-400" /> Cannot Appear in Launch Claims ({summary.blocked})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {records.filter(r => !r.allowedInLaunchClaims).map(r => (
                <div key={r.id} className="flex items-center justify-between p-2 rounded bg-red-500/10 border border-red-500/20 text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded ${stateColors[r.realityState]}`}>{r.realityState}</span>
                    <span className="font-medium">{r.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded capitalize ${claimColors[r.claimSeverity]}`}>{r.claimSeverity}</span>
                    <span className="text-xs text-muted-foreground capitalize">{r.domain}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* The harsh truth */}
      <Card className="border-primary/30">
        <CardHeader className="pb-3"><CardTitle className="text-sm">The Honest Assessment</CardTitle></CardHeader>
        <CardContent className="text-sm space-y-2">
          <p className="text-muted-foreground">
            <span className="text-emerald-400 font-bold">{summary.claimable}</span> of {summary.total} features can be honestly claimed.
            <span className="text-red-400 font-bold ml-1">{summary.blocked}</span> must not appear as "working product."
          </p>
          <p className="text-[10px] text-muted-foreground p-2 rounded bg-muted/30">
            This platform has exceptionally advanced architecture and premium UI depth with broad system scaffolding.
            It is partially runtime-real and ready for a reality conversion sprint.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LaunchHonestyBoard;
