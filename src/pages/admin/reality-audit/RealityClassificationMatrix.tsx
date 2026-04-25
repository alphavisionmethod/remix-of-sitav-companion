import RCPSubNav from "@/platform/admin/components/admin/RCPSubNav";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Eye, Search, CheckCircle, XCircle, AlertTriangle, Shield, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  FEATURE_REALITY_MATRIX, getRealityDistribution, getDomainRealityRollups,
  type FeatureRealityRecord, type RealityState, type ScopeLevel
} from "@/runtimes/reality/reality-audit-registry";

const stateColors: Record<RealityState, string> = {
  presentational: "bg-red-500/15 text-red-400 border-red-500/30",
  simulated: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  persisted: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  proven: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

const stateLabels: Record<RealityState, string> = {
  presentational: "A — Presentational",
  simulated: "B — Simulated",
  persisted: "C — Persisted",
  proven: "D — Proven",
};

const stateDots: Record<RealityState, string> = {
  presentational: "bg-red-500",
  simulated: "bg-amber-500",
  persisted: "bg-blue-500",
  proven: "bg-emerald-500",
};

const RealityClassificationMatrix = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState<RealityState | "all">("all");
  const [scopeFilter, setScopeFilter] = useState<ScopeLevel | "all">("all");
  const [selected, setSelected] = useState<FeatureRealityRecord | null>(null);

  const dist = getRealityDistribution();
  const domainRollups = useMemo(() => getDomainRealityRollups(), []);
  const scopes = useMemo(() => Array.from(new Set(FEATURE_REALITY_MATRIX.map(f => f.scopeLevel))), []);

  const filtered = useMemo(() =>
    FEATURE_REALITY_MATRIX.filter(f => {
      if (search && !f.name.toLowerCase().includes(search.toLowerCase()) && !f.domain.toLowerCase().includes(search.toLowerCase())) return false;
      if (stateFilter !== "all" && f.realityState !== stateFilter) return false;
      if (scopeFilter !== "all" && f.scopeLevel !== scopeFilter) return false;
      return true;
    }),
  [search, stateFilter, scopeFilter]);

  const Indicator = ({ ok }: { ok: boolean }) => ok
    ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
    : <XCircle className="h-3.5 w-3.5 text-red-400" />;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <RCPSubNav />
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10"><Eye className="h-6 w-6 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold">Reality Classification Matrix</h1>
          <p className="text-sm text-muted-foreground">Every feature classified: Presentational → Simulated → Persisted → Proven</p>
        </div>
      </div>

      {/* State distribution */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(["presentational", "simulated", "persisted", "proven"] as RealityState[]).map(s => (
          <button key={s} onClick={() => setStateFilter(stateFilter === s ? "all" : s)}
            className={`p-4 rounded-lg border text-center transition-colors ${stateFilter === s ? stateColors[s] : "border-border/50 hover:border-border"}`}>
            <div className="text-3xl font-bold">{dist[s]}</div>
            <div className="text-xs font-medium mt-1">{stateLabels[s]}</div>
          </button>
        ))}
      </div>

      {/* Domain Heatmap */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Domain Reality Heatmap</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {domainRollups.map(d => (
              <div key={d.domain} className={`p-3 rounded-lg border ${d.healthPct < 30 ? "border-red-500/20" : d.healthPct < 60 ? "border-amber-500/20" : "border-emerald-500/20"}`}>
                <div className="capitalize font-medium text-sm">{d.domain}</div>
                <div className={`text-lg font-bold ${d.healthPct < 30 ? "text-red-400" : d.healthPct < 60 ? "text-amber-400" : "text-emerald-400"}`}>{d.healthPct}%</div>
                <div className="flex h-2 rounded-full overflow-hidden mt-1">
                  {(["presentational", "simulated", "persisted", "proven"] as RealityState[]).map(s => {
                    const pct = d.total > 0 ? (d[s] / d.total) * 100 : 0;
                    return pct > 0 ? <div key={s} className={stateDots[s]} style={{ width: `${pct}%` }} /> : null;
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scope + Search Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search features..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <div className="flex gap-1">
          <button onClick={() => setScopeFilter("all")} className={`px-2 py-1 text-xs rounded ${scopeFilter === "all" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}>All</button>
          {scopes.map(s => (
            <button key={s} onClick={() => setScopeFilter(scopeFilter === s ? "all" : s)}
              className={`px-2 py-1 text-xs rounded capitalize ${scopeFilter === s ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}>{s}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead>Feature</TableHead>
                  <TableHead className="w-20">Domain</TableHead>
                  <TableHead className="w-20">Scope</TableHead>
                  <TableHead className="w-28">State</TableHead>
                  <TableHead className="w-14">Conf</TableHead>
                  <TableHead className="w-14">P</TableHead>
                  <TableHead className="w-14">Data</TableHead>
                  <TableHead className="w-14">Mutate</TableHead>
                  <TableHead className="w-14">Evidence</TableHead>
                  <TableHead className="w-14">Mock?</TableHead>
                  <TableHead className="w-14">Detail</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(f => (
                  <TableRow key={f.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setSelected(f)}>
                    <TableCell className="font-mono text-xs">{f.id}</TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">{f.name}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{f.route}</div>
                    </TableCell>
                    <TableCell className="text-xs capitalize">{f.domain}</TableCell>
                    <TableCell className="text-xs capitalize">{f.scopeLevel}</TableCell>
                    <TableCell>
                      <span className={`text-[10px] px-2 py-0.5 rounded border ${stateColors[f.realityState]}`}>
                        {stateLabels[f.realityState]}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs font-mono ${f.confidence >= 85 ? "text-emerald-400" : f.confidence >= 70 ? "text-amber-400" : "text-red-400"}`}>{f.confidence}%</span>
                    </TableCell>
                    <TableCell><Badge variant={f.launchCriticality === "P0" ? "destructive" : "secondary"} className="text-[10px]">{f.launchCriticality}</Badge></TableCell>
                    <TableCell><Indicator ok={f.hasRealData} /></TableCell>
                    <TableCell><Indicator ok={f.hasRealMutation} /></TableCell>
                    <TableCell><Indicator ok={f.runtimeEvidenceAvailable} /></TableCell>
                    <TableCell>{f.hasMockBacking ? <AlertTriangle className="h-3.5 w-3.5 text-amber-400" /> : <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />}</TableCell>
                    <TableCell>
                      <button onClick={(e) => { e.stopPropagation(); navigate(`/admin/reality-audit/feature/${f.id}`); }}
                        className="text-primary hover:underline text-[10px]">View →</button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail drawer / Transition Readiness */}
      {selected && (
        <Card className="border-primary/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4" /> {selected.name}</CardTitle>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div><span className="text-muted-foreground text-xs">Reality State</span><div><span className={`px-2 py-0.5 rounded border ${stateColors[selected.realityState]}`}>{stateLabels[selected.realityState]}</span></div></div>
              <div><span className="text-muted-foreground text-xs">Confidence</span><div className="font-bold">{selected.confidence}%</div></div>
              <div><span className="text-muted-foreground text-xs">Launch</span><div><Badge variant={selected.launchCriticality === "P0" ? "destructive" : "secondary"}>{selected.launchCriticality}</Badge></div></div>
              <div><span className="text-muted-foreground text-xs">Scope</span><div className="capitalize">{selected.scopeLevel}</div></div>
              <div><span className="text-muted-foreground text-xs">Owner</span><div>{selected.owner || "Unassigned"}</div></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { label: "Real Data", ok: selected.hasRealData },
                { label: "Real Mutation", ok: selected.hasRealMutation },
                { label: "Runtime Evidence", ok: selected.runtimeEvidenceAvailable },
                { label: "Contract Complete", ok: selected.contractComplete },
                { label: "Interactions", ok: selected.interactionComplete },
              ].map(c => (
                <div key={c.label} className={`flex items-center gap-1.5 text-xs p-2 rounded ${c.ok ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                  {c.ok ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />} {c.label}
                </div>
              ))}
            </div>
            {/* Transition readiness */}
            {selected.realityState !== "proven" && (
              <div className="p-3 rounded bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 text-xs font-medium mb-1">
                  <ArrowRight className="h-3 w-3 text-primary" /> Next Required Transition
                </div>
                <p className="text-xs text-muted-foreground">{selected.nextRequiredTransition}</p>
                {selected.transitionBlockers.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selected.transitionBlockers.map(b => <Badge key={b} variant="destructive" className="text-[9px]">{b}</Badge>)}
                  </div>
                )}
              </div>
            )}
            <div><span className="text-muted-foreground text-xs">Notes</span><p className="text-xs mt-1 p-2 rounded bg-muted/30">{selected.notes}</p></div>
            <button onClick={() => navigate(`/admin/reality-audit/feature/${selected.id}`)}
              className="text-xs text-primary hover:underline">View full detail →</button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RealityClassificationMatrix;
