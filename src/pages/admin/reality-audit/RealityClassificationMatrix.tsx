import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Eye, Search, CheckCircle, XCircle, AlertTriangle, Shield } from "lucide-react";
import {
  FEATURE_REALITY_MATRIX, getRealityDistribution,
  type FeatureRealityRecord, type RealityState
} from "@/lib/reality-audit/reality-audit-registry";

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

const RealityClassificationMatrix = () => {
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState<RealityState | "all">("all");
  const [selected, setSelected] = useState<FeatureRealityRecord | null>(null);

  const dist = getRealityDistribution();
  const filtered = useMemo(() =>
    FEATURE_REALITY_MATRIX.filter(f => {
      if (search && !f.name.toLowerCase().includes(search.toLowerCase()) && !f.domain.toLowerCase().includes(search.toLowerCase())) return false;
      if (stateFilter !== "all" && f.realityState !== stateFilter) return false;
      return true;
    }),
  [search, stateFilter]);

  const Indicator = ({ ok }: { ok: boolean }) => ok
    ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
    : <XCircle className="h-3.5 w-3.5 text-red-400" />;

  return (
    <div className="space-y-6 p-4 sm:p-6">
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

      {/* Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search features..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
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
                  <TableHead className="w-24">Domain</TableHead>
                  <TableHead className="w-28">Reality State</TableHead>
                  <TableHead className="w-16">P</TableHead>
                  <TableHead className="w-16">Data</TableHead>
                  <TableHead className="w-16">Mutate</TableHead>
                  <TableHead className="w-16">Evidence</TableHead>
                  <TableHead className="w-16">Interact</TableHead>
                  <TableHead className="w-16">Mock?</TableHead>
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
                    <TableCell>
                      <span className={`text-[10px] px-2 py-0.5 rounded border ${stateColors[f.realityState]}`}>
                        {stateLabels[f.realityState]}
                      </span>
                    </TableCell>
                    <TableCell><Badge variant={f.launchCriticality === "P0" ? "destructive" : "secondary"} className="text-[10px]">{f.launchCriticality}</Badge></TableCell>
                    <TableCell><Indicator ok={f.hasRealData} /></TableCell>
                    <TableCell><Indicator ok={f.hasRealMutation} /></TableCell>
                    <TableCell><Indicator ok={f.runtimeEvidenceAvailable} /></TableCell>
                    <TableCell><Indicator ok={f.interactionComplete} /></TableCell>
                    <TableCell>{f.hasMockBacking ? <AlertTriangle className="h-3.5 w-3.5 text-amber-400" /> : <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail drawer */}
      {selected && (
        <Card className="border-primary/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4" /> {selected.name}</CardTitle>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div><span className="text-muted-foreground text-xs">Reality State</span><div><span className={`px-2 py-0.5 rounded border ${stateColors[selected.realityState]}`}>{stateLabels[selected.realityState]}</span></div></div>
              <div><span className="text-muted-foreground text-xs">Launch Criticality</span><div><Badge variant={selected.launchCriticality === "P0" ? "destructive" : "secondary"}>{selected.launchCriticality}</Badge></div></div>
              <div><span className="text-muted-foreground text-xs">Promise Severity</span><div className="capitalize">{selected.promiseSeverity}</div></div>
              <div><span className="text-muted-foreground text-xs">Domain</span><div className="capitalize">{selected.domain}</div></div>
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
            <div><span className="text-muted-foreground text-xs">Notes</span><p className="text-xs mt-1 p-2 rounded bg-muted/30">{selected.notes}</p></div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RealityClassificationMatrix;
