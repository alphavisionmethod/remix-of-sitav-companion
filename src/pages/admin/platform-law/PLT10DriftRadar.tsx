import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Activity, AlertTriangle, CheckCircle, Clock, Shield, Target, BarChart3, XCircle
} from "lucide-react";
import {
  DRIFT_RECORDS, getUnresolvedDrift, getBlockingDrift, getDriftByCategory, getDriftTimeline,
  type DriftEnforcementRecord, type DriftType
} from "@/lib/platform-law/platform-law-registry";

const DRIFT_TYPES: DriftType[] = ["spec_code", "contract_code", "route_shell", "manifest_impl", "runtime_claim", "prompt_impl", "docs_runtime", "selector_drift", "journey_drift", "other"];

const PLT10DriftRadar = () => {
  const [typeFilter, setTypeFilter] = useState<DriftType | "all">("all");
  const [selected, setSelected] = useState<DriftEnforcementRecord | null>(null);

  const unresolved = getUnresolvedDrift();
  const blocking = getBlockingDrift();
  const byCategory = getDriftByCategory();
  const timeline = getDriftTimeline();
  const resolved = DRIFT_RECORDS.filter(d => d.resolvedAt);

  const filtered = useMemo(() => {
    return DRIFT_RECORDS.filter(d => {
      if (typeFilter !== "all" && d.driftType !== typeFilter) return false;
      return true;
    });
  }, [typeFilter]);

  const agingUnresolved = unresolved.filter(d => {
    const detected = new Date(d.detectedAt).getTime();
    const now = new Date("2026-04-10").getTime();
    return (now - detected) / (1000 * 60 * 60 * 24) > 7;
  });

  const categoryColors: Record<string, string> = {
    spec_code: "bg-blue-500/20 text-blue-400",
    contract_code: "bg-red-500/20 text-red-400",
    route_shell: "bg-purple-500/20 text-purple-400",
    manifest_impl: "bg-amber-500/20 text-amber-400",
    runtime_claim: "bg-cyan-500/20 text-cyan-400",
    prompt_impl: "bg-pink-500/20 text-pink-400",
    docs_runtime: "bg-emerald-500/20 text-emerald-400",
    selector_drift: "bg-orange-500/20 text-orange-400",
    journey_drift: "bg-indigo-500/20 text-indigo-400",
    other: "bg-muted text-muted-foreground",
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-amber-500/10"><Activity className="h-6 w-6 text-amber-400" /></div>
        <div>
          <h1 className="text-2xl font-bold">Drift Enforcement Radar</h1>
          <p className="text-sm text-muted-foreground">{DRIFT_RECORDS.length} total · {unresolved.length} unresolved · {blocking.length} blocking · {agingUnresolved.length} aging (&gt;7d)</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total Drift", value: DRIFT_RECORDS.length, color: "text-blue-400" },
          { label: "Unresolved", value: unresolved.length, color: unresolved.length > 0 ? "text-amber-400" : "text-emerald-400" },
          { label: "Blocking", value: blocking.length, color: blocking.length > 0 ? "text-red-400" : "text-emerald-400" },
          { label: "Aging (>7d)", value: agingUnresolved.length, color: agingUnresolved.length > 0 ? "text-red-400" : "text-emerald-400" },
          { label: "Resolved", value: resolved.length, color: "text-emerald-400" },
        ].map(k => (
          <Card key={k.label} className="bg-card/50"><CardContent className="p-3 text-center">
            <div className={`text-xl font-bold ${k.color}`}>{k.value}</div>
            <div className="text-[10px] text-muted-foreground">{k.label}</div>
          </CardContent></Card>
        ))}
      </div>

      {/* Drift Heatmap by Category */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Drift by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {DRIFT_TYPES.map(dt => {
              const records = byCategory.get(dt) || [];
              const unresolvedCount = records.filter(d => !d.resolvedAt).length;
              return (
                <button key={dt} onClick={() => setTypeFilter(typeFilter === dt ? "all" : dt)}
                  className={`p-3 rounded-lg text-center transition-all ${typeFilter === dt ? "ring-2 ring-primary" : ""} ${categoryColors[dt]}`}>
                  <div className="text-2xl font-bold">{records.length}</div>
                  <div className="text-xs font-medium">{dt.replace(/_/g, " ")}</div>
                  {unresolvedCount > 0 && <div className="text-[10px] mt-1">{unresolvedCount} open</div>}
                </button>
              );
            }).filter(el => {
              const dt = DRIFT_TYPES[DRIFT_TYPES.indexOf(el.key as DriftType)];
              return (byCategory.get(el.key as DriftType) || []).length > 0;
            })}
            {DRIFT_TYPES.filter(dt => (byCategory.get(dt) || []).length > 0).length === 0 && (
              <div className="col-span-full text-center text-emerald-400 text-sm flex items-center justify-center gap-2 p-4">
                <CheckCircle className="h-4 w-4" /> No drift detected
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Drift Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4" /> Drift Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {timeline.map(t => (
              <div key={t.date} className="flex items-center gap-3 p-2 rounded bg-muted/30">
                <span className="text-xs font-mono text-muted-foreground w-24">{t.date}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 text-amber-400" />
                      <span className="text-xs text-amber-400">{t.count} detected</span>
                    </div>
                    {t.resolved > 0 && (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-emerald-400" />
                        <span className="text-xs text-emerald-400">{t.resolved} resolved</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(t.count / Math.max(...timeline.map(x => x.count))) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Aging Unresolved */}
      {agingUnresolved.length > 0 && (
        <Card className="border-red-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-400" /> Aging Unresolved Drift (&gt;7 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {agingUnresolved.map(d => {
                const age = Math.round((new Date("2026-04-10").getTime() - new Date(d.detectedAt).getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={d.driftEnforcementId} className="p-3 rounded border border-red-500/20 bg-red-500/5">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs">{d.driftEnforcementId}</span>
                        {d.blocking && <Badge variant="destructive" className="text-[10px]">BLOCKING</Badge>}
                        <Badge variant="outline" className="text-[10px]">{d.driftType}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-red-400 font-mono text-xs">{age}d old</span>
                        <span className="text-xs text-muted-foreground">{d.owner}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{d.notes}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        <select className="h-9 rounded-md border bg-background px-3 text-sm" value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)}>
          <option value="all">All Drift Types</option>
          {DRIFT_TYPES.map(dt => <option key={dt} value={dt}>{dt.replace(/_/g, " ")}</option>)}
        </select>
      </div>

      {/* Full Drift Table */}
      <Card>
        <CardContent className="p-0"><div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead className="w-24">Type</TableHead>
              <TableHead>Scope</TableHead>
              <TableHead className="w-20">Severity</TableHead>
              <TableHead className="w-24">Owner</TableHead>
              <TableHead className="w-24">Detected</TableHead>
              <TableHead className="w-24">Resolved</TableHead>
              <TableHead className="w-16">Block</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {filtered.map(d => (
                <TableRow key={d.driftEnforcementId} className={`cursor-pointer hover:bg-muted/30 ${d.blocking && !d.resolvedAt ? "bg-red-500/5" : ""}`} onClick={() => setSelected(d)}>
                  <TableCell className="font-mono text-xs">{d.driftEnforcementId}</TableCell>
                  <TableCell><span className={`text-[10px] px-2 py-0.5 rounded ${categoryColors[d.driftType]}`}>{d.driftType.replace(/_/g, " ")}</span></TableCell>
                  <TableCell><div className="text-xs">{d.scopeId}</div><div className="text-[10px] text-muted-foreground">{d.scopeType}</div></TableCell>
                  <TableCell><Badge variant={d.severity === "critical" ? "destructive" : d.severity === "high" ? "default" : "secondary"} className="text-[10px]">{d.severity}</Badge></TableCell>
                  <TableCell className="text-xs">{d.owner}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{d.detectedAt}</TableCell>
                  <TableCell>{d.resolvedAt ? <span className="text-emerald-400 text-xs">{d.resolvedAt}</span> : <span className="text-amber-400 text-xs">Open</span>}</TableCell>
                  <TableCell>{d.blocking ? <XCircle className="h-3.5 w-3.5 text-red-400" /> : <span className="text-muted-foreground text-xs">—</span>}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div></CardContent>
      </Card>

      {/* Detail Drawer */}
      {selected && (
        <Card className="border-primary/30">
          <CardHeader className="pb-3"><div className="flex items-center justify-between">
            <CardTitle className="text-sm">{selected.driftEnforcementId} — {selected.driftType.replace(/_/g, " ")}</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>✕</Button>
          </div></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div><span className="text-muted-foreground text-xs">Drift Type</span><div><Badge variant="outline">{selected.driftType}</Badge></div></div>
              <div><span className="text-muted-foreground text-xs">Severity</span><div><Badge variant={selected.severity === "critical" ? "destructive" : "secondary"}>{selected.severity}</Badge></div></div>
              <div><span className="text-muted-foreground text-xs">Scope</span><div>{selected.scopeType} · {selected.scopeId}</div></div>
              <div><span className="text-muted-foreground text-xs">Blocking</span><div>{selected.blocking ? <span className="text-red-400 font-bold">YES</span> : "No"}</div></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-muted-foreground text-xs">Owner</span><div>{selected.owner}</div></div>
              <div><span className="text-muted-foreground text-xs">Detected</span><div>{selected.detectedAt}</div></div>
            </div>
            <div><span className="text-muted-foreground text-xs">Notes</span><p className="text-xs mt-1 p-2 rounded bg-muted/30">{selected.notes}</p></div>
            {selected.resolvedAt && <div className="text-emerald-400 text-xs flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Resolved: {selected.resolvedAt}</div>}

            {/* Resolution Flow */}
            <div>
              <span className="text-muted-foreground text-xs font-medium">Resolution Flow</span>
              <div className="flex items-center gap-2 mt-2 text-xs">
                <div className={`p-2 rounded ${!selected.resolvedAt ? "bg-amber-500/20 text-amber-400 ring-2 ring-amber-500/50" : "bg-muted/30 text-muted-foreground"}`}>Detected</div>
                <span className="text-muted-foreground">→</span>
                <div className={`p-2 rounded ${!selected.resolvedAt ? "bg-muted/30 text-muted-foreground" : "bg-blue-500/20 text-blue-400"}`}>Assigned</div>
                <span className="text-muted-foreground">→</span>
                <div className={`p-2 rounded ${selected.resolvedAt ? "bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500/50" : "bg-muted/30 text-muted-foreground"}`}>Resolved</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PLT10DriftRadar;
