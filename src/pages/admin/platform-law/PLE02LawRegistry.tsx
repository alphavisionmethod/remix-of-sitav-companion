import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Scale, Search, Shield, AlertTriangle, CheckCircle, ExternalLink, Cpu, Waypoints } from "lucide-react";
import {
  PLATFORM_LAWS, LAW_PACKS, type PlatformLaw, type LawCategory, type LawSeverity, type EnforcementMode,
  getBlockingLaws, getViolatedLaws, getMachineCheckableLaws, getLawsByPack
} from "@/lib/platform-law/platform-law-registry";

const CATEGORIES: LawCategory[] = ["domain-purity", "execution-chain", "proof-requirement", "route-ownership", "contract-ownership", "manifest-requirement", "interaction-requirement", "shell-requirement", "import-boundary", "test-id-convention", "naming-convention", "prompt-traceability", "memory-governance", "service-budget", "connector-governance", "approval-governance", "capability-contract", "truth-requirement", "policy-governance", "cost-governance"];
const SEVERITIES: LawSeverity[] = ["critical", "high", "medium", "low"];
const MODES: EnforcementMode[] = ["block", "warn", "log", "disabled"];

const PLE02LawRegistry = () => {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<LawCategory | "all">("all");
  const [sevFilter, setSevFilter] = useState<LawSeverity | "all">("all");
  const [modeFilter, setModeFilter] = useState<EnforcementMode | "all">("all");
  const [packFilter, setPackFilter] = useState<string>("all");
  const [selected, setSelected] = useState<PlatformLaw | null>(null);

  const filtered = useMemo(() => {
    return PLATFORM_LAWS.filter(l => {
      if (search && !l.name.toLowerCase().includes(search.toLowerCase()) && !l.id.toLowerCase().includes(search.toLowerCase()) && !l.description.toLowerCase().includes(search.toLowerCase())) return false;
      if (catFilter !== "all" && l.category !== catFilter) return false;
      if (sevFilter !== "all" && l.severity !== sevFilter) return false;
      if (modeFilter !== "all" && l.enforcementMode !== modeFilter) return false;
      if (packFilter !== "all" && l.lawPackId !== packFilter) return false;
      return true;
    });
  }, [search, catFilter, sevFilter, modeFilter, packFilter]);

  const sevColor: Record<string, string> = { critical: "destructive", high: "default", medium: "secondary", low: "outline" };
  const modeColor: Record<string, string> = { block: "text-red-400 bg-red-500/10", warn: "text-amber-400 bg-amber-500/10", log: "text-blue-400 bg-blue-500/10", disabled: "text-muted-foreground bg-muted" };
  const machineCheckable = getMachineCheckableLaws();

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10"><Scale className="h-6 w-6 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold">Architecture Law Registry</h1>
          <p className="text-sm text-muted-foreground">{PLATFORM_LAWS.length} canonical laws · {getViolatedLaws().length} with violations · {getBlockingLaws().length} blocking · {machineCheckable.length} machine-checkable</p>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total Laws", value: PLATFORM_LAWS.length, color: "text-blue-400" },
          { label: "Blocking", value: getBlockingLaws().length, color: "text-red-400" },
          { label: "Violated", value: getViolatedLaws().length, color: getViolatedLaws().length > 0 ? "text-amber-400" : "text-emerald-400" },
          { label: "Machine-Checkable", value: machineCheckable.length, color: "text-purple-400" },
          { label: "Law Packs", value: LAW_PACKS.length, color: "text-blue-400" },
        ].map(k => (
          <Card key={k.label} className="bg-card/50"><CardContent className="p-3 text-center">
            <div className={`text-xl font-bold ${k.color}`}>{k.value}</div>
            <div className="text-[10px] text-muted-foreground">{k.label}</div>
          </CardContent></Card>
        ))}
      </div>

      {/* Law Pack Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><Waypoints className="h-4 w-4" /> Law Packs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {LAW_PACKS.map(pack => {
              const packLaws = getLawsByPack(pack.lawPackId);
              const violated = packLaws.filter(l => l.violationCount > 0).length;
              return (
                <button key={pack.lawPackId} onClick={() => setPackFilter(packFilter === pack.lawPackId ? "all" : pack.lawPackId)}
                  className={`text-left p-3 rounded-lg border transition-colors ${packFilter === pack.lawPackId ? "border-primary bg-primary/5" : "border-border/50 hover:border-border"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] text-muted-foreground">{pack.lawPackId}</span>
                    <Badge variant={pack.active ? "default" : "secondary"} className="text-[10px]">v{pack.version}</Badge>
                  </div>
                  <div className="font-medium text-sm">{pack.name}</div>
                  <div className="text-[10px] text-muted-foreground">{packLaws.length} rules · {violated > 0 ? <span className="text-red-400">{violated} violated</span> : <span className="text-emerald-400">clean</span>}</div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search laws..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <select className="h-9 rounded-md border bg-background px-3 text-sm" value={catFilter} onChange={e => setCatFilter(e.target.value as any)}>
          <option value="all">All Categories</option>
          {CATEGORIES.filter(c => PLATFORM_LAWS.some(l => l.category === c)).map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="h-9 rounded-md border bg-background px-3 text-sm" value={sevFilter} onChange={e => setSevFilter(e.target.value as any)}>
          <option value="all">All Severities</option>
          {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="h-9 rounded-md border bg-background px-3 text-sm" value={modeFilter} onChange={e => setModeFilter(e.target.value as any)}>
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
                  <TableHead className="w-24">Rule Type</TableHead>
                  <TableHead className="w-20">Scope</TableHead>
                  <TableHead className="w-20">Severity</TableHead>
                  <TableHead className="w-20">Mode</TableHead>
                  <TableHead className="w-10">MC</TableHead>
                  <TableHead className="w-24 text-right">Violations</TableHead>
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
                    <TableCell><Badge variant="outline" className="text-[10px]">{law.ruleType}</Badge></TableCell>
                    <TableCell className="text-[10px] text-muted-foreground">{law.scopeType}</TableCell>
                    <TableCell><Badge variant={sevColor[law.severity] as any} className="text-[10px]">{law.severity}</Badge></TableCell>
                    <TableCell><span className={`text-xs px-2 py-0.5 rounded ${modeColor[law.enforcementMode]}`}>{law.enforcementMode}</span></TableCell>
                    <TableCell>{law.machineCheckable ? <Cpu className="h-3.5 w-3.5 text-emerald-400" /> : <span className="text-muted-foreground text-xs">—</span>}</TableCell>
                    <TableCell className="text-right">
                      {law.violationCount > 0 ? <span className="text-red-400 font-mono">{law.violationCount}</span> : <CheckCircle className="h-3.5 w-3.5 text-emerald-400 ml-auto" />}
                    </TableCell>
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div><span className="text-muted-foreground text-xs">Rule Type</span><div><Badge variant="outline">{selected.ruleType}</Badge></div></div>
              <div><span className="text-muted-foreground text-xs">Scope Type</span><div>{selected.scopeType}</div></div>
              <div><span className="text-muted-foreground text-xs">Machine Checkable</span><div className="flex items-center gap-1">{selected.machineCheckable ? <><Cpu className="h-3 w-3 text-emerald-400" /> Yes</> : "No"}</div></div>
              <div><span className="text-muted-foreground text-xs">Law Pack</span><div className="font-mono text-xs">{selected.lawPackId}</div></div>
            </div>
            <div><span className="text-muted-foreground text-xs">Enforcement Detail</span><p className="text-xs mt-1">{selected.enforcementDetail}</p></div>
            <div><span className="text-muted-foreground text-xs">Remediation Guidance</span><p className="text-xs mt-1 p-2 rounded bg-emerald-500/10 text-emerald-400">{selected.remediationGuidance}</p></div>
            <div><span className="text-muted-foreground text-xs">Scope</span><div className="font-mono text-xs">{selected.scope}</div></div>
            <div className="text-[10px] text-muted-foreground">Created: {selected.createdAt} · Active: {selected.active ? "Yes" : "No"}</div>
            {selected.linkedScript && <div><span className="text-muted-foreground text-xs">Linked Script</span><div className="font-mono text-xs flex items-center gap-1"><ExternalLink className="h-3 w-3" />{selected.linkedScript}</div></div>}
            {selected.linkedCIGate && <div><span className="text-muted-foreground text-xs">CI Gate</span><div className="font-mono text-xs">{selected.linkedCIGate}</div></div>}

            {/* Version Timeline */}
            <div>
              <span className="text-muted-foreground text-xs">Version History</span>
              <div className="mt-2 relative pl-4 border-l-2 border-border/50 space-y-3">
                {[
                  { version: "v1.0", date: "2025-01-15", note: "Initial rule definition — advisory mode" },
                  { version: "v1.1", date: "2025-03-01", note: "Elevated to warning mode after repeated violations" },
                  { version: "v2.0 (current)", date: selected.createdAt || "2025-06-01", note: `Current — ${selected.enforcementMode} mode · ${selected.severity} severity` },
                ].map((v, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 border-primary bg-background" />
                    <div className="text-xs font-medium">{v.version} <span className="text-muted-foreground font-normal">— {v.date}</span></div>
                    <div className="text-[10px] text-muted-foreground">{v.note}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PLE02LawRegistry;