import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, CheckCircle, TrendingDown, ArrowUpRight, AlertTriangle, Clock, ArrowRight } from "lucide-react";
import { OWNERSHIP_REGISTRY, getOwnerComplianceAverage, getNoOwnerGaps, getOwnerMTTR, type OwnershipEntry } from "@/lib/platform-law/platform-law-registry";

const PLE06OwnershipBoard = () => {
  const [typeFilter, setTypeFilter] = useState<"all" | OwnershipEntry["type"]>("all");
  const [sortBy, setSortBy] = useState<"compliance" | "violations" | "drift">("compliance");
  const [selected, setSelected] = useState<OwnershipEntry | null>(null);

  const filtered = useMemo(() => {
    let items = typeFilter === "all" ? [...OWNERSHIP_REGISTRY] : OWNERSHIP_REGISTRY.filter(o => o.type === typeFilter);
    if (sortBy === "compliance") items.sort((a, b) => a.complianceScore - b.complianceScore);
    else if (sortBy === "violations") items.sort((a, b) => b.unresolvedViolations - a.unresolvedViolations);
    else items.sort((a, b) => b.driftCount - a.driftCount);
    return items;
  }, [typeFilter, sortBy]);

  const avgScore = getOwnerComplianceAverage();
  const totalViolations = OWNERSHIP_REGISTRY.reduce((s, o) => s + o.unresolvedViolations, 0);
  const totalDrift = OWNERSHIP_REGISTRY.reduce((s, o) => s + o.driftCount, 0);

  const ownerGroups = useMemo(() => {
    const map = new Map<string, { score: number; violations: number; areas: number; team: string }>();
    OWNERSHIP_REGISTRY.forEach(o => {
      const existing = map.get(o.owner) || { score: 0, violations: 0, areas: 0, team: o.team };
      existing.score += o.complianceScore;
      existing.violations += o.unresolvedViolations;
      existing.areas += 1;
      existing.team = o.team;
      map.set(o.owner, existing);
    });
    return Array.from(map.entries()).map(([owner, data]) => ({
      owner, avgScore: Math.round(data.score / data.areas), violations: data.violations, areas: data.areas, team: data.team
    })).sort((a, b) => a.avgScore - b.avgScore);
  }, []);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10"><Users className="h-6 w-6 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold">Ownership Accountability Board</h1>
          <p className="text-sm text-muted-foreground">{OWNERSHIP_REGISTRY.length} areas · {avgScore}% avg compliance · {totalViolations} violations · {totalDrift} drift</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Areas Tracked", value: OWNERSHIP_REGISTRY.length, color: "text-blue-400" },
          { label: "Avg Compliance", value: `${avgScore}%`, color: avgScore >= 85 ? "text-emerald-400" : "text-amber-400" },
          { label: "Unresolved Violations", value: totalViolations, color: totalViolations === 0 ? "text-emerald-400" : "text-red-400" },
          { label: "Active Drift", value: totalDrift, color: totalDrift === 0 ? "text-emerald-400" : "text-amber-400" },
        ].map(k => (
          <Card key={k.label} className="bg-card/50"><CardContent className="p-3 text-center">
            <div className={`text-xl font-bold ${k.color}`}>{k.value}</div>
            <div className="text-[10px] text-muted-foreground">{k.label}</div>
          </CardContent></Card>
        ))}
      </div>

      {/* Owner Leaderboard */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><TrendingDown className="h-4 w-4" /> Owner Compliance Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {ownerGroups.map((og, i) => (
              <div key={og.owner} className="flex items-center gap-3 p-2 rounded bg-muted/30">
                <span className={`text-lg font-bold w-8 ${i === 0 && og.avgScore < 85 ? "text-red-400" : "text-muted-foreground"}`}>#{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{og.owner}</span>
                    <Badge variant="outline" className="text-[10px]">{og.areas} areas</Badge>
                    <span className="text-[10px] text-muted-foreground">{og.team}</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                    <div className={`h-full rounded-full ${og.avgScore >= 90 ? "bg-emerald-500" : og.avgScore >= 80 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${og.avgScore}%` }} />
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-mono text-sm ${og.avgScore >= 90 ? "text-emerald-400" : og.avgScore >= 80 ? "text-amber-400" : "text-red-400"}`}>{og.avgScore}%</div>
                  {og.violations > 0 && <div className="text-[10px] text-red-400">{og.violations} violations</div>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Owner Scorecards */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4" /> Owner Scorecards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ownerGroups.map(og => {
              const mttrData = getOwnerMTTR().find(m => m.owner === og.owner);
              return (
                <div key={og.owner} className="p-3 rounded-lg border border-border/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{og.owner}</span>
                    <Badge variant="outline" className="text-[10px]">{og.team}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div><div className={`text-lg font-bold ${og.avgScore >= 90 ? "text-emerald-400" : og.avgScore >= 80 ? "text-amber-400" : "text-red-400"}`}>{og.avgScore}%</div><div className="text-[10px] text-muted-foreground">Score</div></div>
                    <div><div className={`text-lg font-bold ${og.violations > 0 ? "text-red-400" : "text-emerald-400"}`}>{og.violations}</div><div className="text-[10px] text-muted-foreground">Violations</div></div>
                    <div><div className="text-lg font-bold text-blue-400">{og.areas}</div><div className="text-[10px] text-muted-foreground">Areas</div></div>
                  </div>
                  {mttrData && (
                    <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> MTTR: {mttrData.avgDays}d ({mttrData.resolvedCount} resolved)
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* No Owner Warning Lane */}
      {(() => {
        const gaps = getNoOwnerGaps();
        return gaps.length > 0 ? (
          <Card className="border-red-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-400" /> No-Owner Gaps ({gaps.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {gaps.map(g => (
                  <div key={g} className="px-3 py-1.5 rounded bg-red-500/10 border border-red-500/20 text-sm text-red-400">{g}</div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null;
      })()}

      {/* Escalation Graph */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><ArrowUpRight className="h-4 w-4" /> Escalation Path</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {["Primary Owner", "Secondary Owner", "Domain Owner", "Launch Blocker"].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className={`px-3 py-2 rounded-lg text-sm font-medium ${i === 3 ? "bg-red-500/15 text-red-400 border border-red-500/30" : "bg-muted/50 border border-border/50"}`}>{step}</div>
                {i < 3 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-3">Violations escalate through ownership chain. Unresolved critical violations auto-elevate to launch blockers.</p>
        </CardContent>
      </Card>

      {/* MTTR Metric */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4" /> Mean Time to Resolution (MTTR)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {getOwnerMTTR().map(m => (
              <div key={m.owner} className="flex items-center justify-between p-2 rounded bg-muted/30 text-sm">
                <span className="font-medium">{m.owner}</span>
                <div className="flex items-center gap-3">
                  <span className={`font-mono text-xs ${m.avgDays <= 3 ? "text-emerald-400" : m.avgDays <= 7 ? "text-amber-400" : "text-red-400"}`}>{m.avgDays} days avg</span>
                  <span className="text-[10px] text-muted-foreground">{m.resolvedCount} resolved</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select className="h-9 rounded-md border bg-background px-3 text-sm" value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)}>
          <option value="all">All Types</option>
          {(["domain", "shell", "contract", "route", "probe", "manifest", "service"] as const).map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="h-9 rounded-md border bg-background px-3 text-sm" value={sortBy} onChange={e => setSortBy(e.target.value as any)}>
          <option value="compliance">Sort: Lowest Compliance</option>
          <option value="violations">Sort: Most Violations</option>
          <option value="drift">Sort: Most Drift</option>
        </select>
      </div>

      {/* Detail Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead className="w-24">Owner</TableHead>
                  <TableHead className="w-24">Team</TableHead>
                  <TableHead className="w-20">Type</TableHead>
                  <TableHead className="w-20 text-right">Score</TableHead>
                  <TableHead className="w-20 text-right">Violations</TableHead>
                  <TableHead className="w-16 text-right">Drift</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(o => (
                  <TableRow key={o.id} className={`cursor-pointer hover:bg-muted/30 ${o.complianceScore < 80 ? "bg-red-500/5" : ""}`} onClick={() => setSelected(o)}>
                    <TableCell className="font-mono text-xs">{o.id}</TableCell>
                    <TableCell className="font-medium text-sm">{o.area}</TableCell>
                    <TableCell className="text-xs">{o.owner}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{o.team}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{o.type}</Badge></TableCell>
                    <TableCell className="text-right">
                      <span className={`font-mono text-xs ${o.complianceScore >= 90 ? "text-emerald-400" : o.complianceScore >= 80 ? "text-amber-400" : "text-red-400"}`}>{o.complianceScore}%</span>
                    </TableCell>
                    <TableCell className="text-right">
                      {o.unresolvedViolations > 0 ? <span className="text-red-400 font-mono text-xs">{o.unresolvedViolations}</span> : <CheckCircle className="h-3.5 w-3.5 text-emerald-400 ml-auto" />}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">{o.driftCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Drawer */}
      {selected && (
        <Card className="border-primary/30">
          <CardHeader className="pb-3"><div className="flex items-center justify-between">
            <CardTitle className="text-sm">{selected.id} — {selected.area}</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>✕</Button>
          </div></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div><span className="text-muted-foreground text-xs">Primary Owner</span><div className="font-medium">{selected.owner}</div></div>
              <div><span className="text-muted-foreground text-xs">Secondary Owner</span><div>{selected.secondaryOwner || <span className="text-muted-foreground">None</span>}</div></div>
              <div><span className="text-muted-foreground text-xs">Team</span><div>{selected.team}</div></div>
              <div><span className="text-muted-foreground text-xs">Type</span><div><Badge variant="outline">{selected.type}</Badge></div></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div><span className="text-muted-foreground text-xs">Compliance</span><div className={`font-mono font-bold ${selected.complianceScore >= 90 ? "text-emerald-400" : selected.complianceScore >= 80 ? "text-amber-400" : "text-red-400"}`}>{selected.complianceScore}%</div></div>
              <div><span className="text-muted-foreground text-xs">Violations</span><div className={selected.unresolvedViolations > 0 ? "text-red-400 font-mono" : "text-emerald-400 font-mono"}>{selected.unresolvedViolations}</div></div>
              <div><span className="text-muted-foreground text-xs">Drift</span><div className="font-mono">{selected.driftCount}</div></div>
              <div><span className="text-muted-foreground text-xs">Missing Manifests</span><div className="font-mono">{selected.missingManifests}</div></div>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Escalation Path</span>
              <div className="flex items-center gap-1 mt-1 text-xs">
                <ArrowUpRight className="h-3 w-3 text-amber-400" />
                <span>{selected.escalationPath}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PLE06OwnershipBoard;