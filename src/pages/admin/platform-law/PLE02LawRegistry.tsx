import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Scale, Search, Filter, Shield, AlertTriangle, CheckCircle, ExternalLink } from "lucide-react";
import {
  PLATFORM_LAWS, type PlatformLaw, type LawCategory, type LawSeverity, type EnforcementMode,
  getLawsByCategory, getLawsBySeverity, getBlockingLaws, getViolatedLaws
} from "@/lib/platform-law/platform-law-registry";

const CATEGORIES: LawCategory[] = ["domain-purity", "execution-chain", "proof-requirement", "route-ownership", "contract-ownership", "manifest-requirement", "interaction-requirement", "shell-requirement", "import-boundary", "test-id-convention", "naming-convention", "prompt-traceability", "memory-governance", "service-budget", "connector-governance", "approval-governance", "capability-contract", "truth-requirement", "policy-governance", "cost-governance"];
const SEVERITIES: LawSeverity[] = ["critical", "high", "medium", "low"];
const MODES: EnforcementMode[] = ["block", "warn", "log", "disabled"];

const PLE02LawRegistry = () => {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<LawCategory | "all">("all");
  const [sevFilter, setSevFilter] = useState<LawSeverity | "all">("all");
  const [modeFilter, setModeFilter] = useState<EnforcementMode | "all">("all");
  const [selected, setSelected] = useState<PlatformLaw | null>(null);

  const filtered = useMemo(() => {
    return PLATFORM_LAWS.filter(l => {
      if (search && !l.name.toLowerCase().includes(search.toLowerCase()) && !l.id.toLowerCase().includes(search.toLowerCase()) && !l.description.toLowerCase().includes(search.toLowerCase())) return false;
      if (catFilter !== "all" && l.category !== catFilter) return false;
      if (sevFilter !== "all" && l.severity !== sevFilter) return false;
      if (modeFilter !== "all" && l.enforcementMode !== modeFilter) return false;
      return true;
    });
  }, [search, catFilter, sevFilter, modeFilter]);

  const sevColor: Record<string, string> = { critical: "destructive", high: "default", medium: "secondary", low: "outline" };
  const modeColor: Record<string, string> = { block: "text-red-400 bg-red-500/10", warn: "text-amber-400 bg-amber-500/10", log: "text-blue-400 bg-blue-500/10", disabled: "text-muted-foreground bg-muted" };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10"><Scale className="h-6 w-6 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold">Architecture Law Registry</h1>
          <p className="text-sm text-muted-foreground">{PLATFORM_LAWS.length} canonical laws · {getViolatedLaws().length} with violations · {getBlockingLaws().length} blocking</p>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Laws", value: PLATFORM_LAWS.length, color: "text-blue-400" },
          { label: "Blocking", value: getBlockingLaws().length, color: "text-red-400" },
          { label: "Violated", value: getViolatedLaws().length, color: getViolatedLaws().length > 0 ? "text-amber-400" : "text-emerald-400" },
          { label: "Categories", value: new Set(PLATFORM_LAWS.map(l => l.category)).size, color: "text-purple-400" },
        ].map(k => (
          <Card key={k.label} className="bg-card/50"><CardContent className="p-3 text-center">
            <div className={`text-xl font-bold ${k.color}`}>{k.value}</div>
            <div className="text-[10px] text-muted-foreground">{k.label}</div>
          </CardContent></Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search laws..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <select className="h-9 rounded-md border bg-background px-3 text-sm" value={catFilter} onChange={e => setCatFilter(e.target.value as LawCategory | "all")}>
          <option value="all">All Categories</option>
          {CATEGORIES.filter(c => PLATFORM_LAWS.some(l => l.category === c)).map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="h-9 rounded-md border bg-background px-3 text-sm" value={sevFilter} onChange={e => setSevFilter(e.target.value as LawSeverity | "all")}>
          <option value="all">All Severities</option>
          {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="h-9 rounded-md border bg-background px-3 text-sm" value={modeFilter} onChange={e => setModeFilter(e.target.value as EnforcementMode | "all")}>
          <option value="all">All Modes</option>
          {MODES.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">ID</TableHead>
                  <TableHead>Law</TableHead>
                  <TableHead className="w-28">Category</TableHead>
                  <TableHead className="w-20">Severity</TableHead>
                  <TableHead className="w-20">Mode</TableHead>
                  <TableHead className="w-24 text-right">Violations</TableHead>
                  <TableHead className="w-24">Last Triggered</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(law => (
                  <TableRow key={law.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setSelected(law)}>
                    <TableCell className="font-mono text-xs">{law.id}</TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">{law.name}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[300px]">{law.description}</div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{law.category}</Badge></TableCell>
                    <TableCell><Badge variant={sevColor[law.severity] as any} className="text-[10px]">{law.severity}</Badge></TableCell>
                    <TableCell><span className={`text-xs px-2 py-0.5 rounded ${modeColor[law.enforcementMode]}`}>{law.enforcementMode}</span></TableCell>
                    <TableCell className="text-right">
                      {law.violationCount > 0 ? <span className="text-red-400 font-mono">{law.violationCount}</span> : <CheckCircle className="h-3.5 w-3.5 text-emerald-400 ml-auto" />}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{law.lastTriggered || "—"}</TableCell>
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
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4" /> {selected.id} — {selected.name}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>✕</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>{selected.description}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div><span className="text-muted-foreground text-xs">Rule #</span><div className="font-mono">{selected.ruleNumber}</div></div>
              <div><span className="text-muted-foreground text-xs">Category</span><div>{selected.category}</div></div>
              <div><span className="text-muted-foreground text-xs">Severity</span><div><Badge variant={sevColor[selected.severity] as any}>{selected.severity}</Badge></div></div>
              <div><span className="text-muted-foreground text-xs">Mode</span><div><span className={`px-2 py-0.5 rounded ${modeColor[selected.enforcementMode]}`}>{selected.enforcementMode}</span></div></div>
            </div>
            <div><span className="text-muted-foreground text-xs">Enforcement Detail</span><p className="text-xs mt-1">{selected.enforcementDetail}</p></div>
            <div><span className="text-muted-foreground text-xs">Scope</span><div className="font-mono text-xs">{selected.scope}</div></div>
            {selected.linkedScript && <div><span className="text-muted-foreground text-xs">Linked Script</span><div className="font-mono text-xs flex items-center gap-1"><ExternalLink className="h-3 w-3" />{selected.linkedScript}</div></div>}
            {selected.linkedCIGate && <div><span className="text-muted-foreground text-xs">CI Gate</span><div className="font-mono text-xs">{selected.linkedCIGate}</div></div>}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PLE02LawRegistry;
