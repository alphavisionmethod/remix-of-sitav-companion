import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { useRealityClassifications, useUpsertClassification, useDeleteClassification, useClassificationStats } from "@/hooks/useRealityClassifications";
import { Shield, Eye, Cpu, CheckCircle2, Plus, Trash2, Search, BarChart3, Pencil, Rocket, AlertTriangle, Info, ArrowRight, Layers, Target } from "lucide-react";
import type { RealityClassification } from "@/data/persistence/reality-classification-persistence";
import { SCOPE_LEVELS, EVIDENCE_SIGNALS, PROGRESSION_REQUIREMENTS, type ScopeLevel, type LaunchImpact } from "@/data/persistence/reality-classification-persistence";
import { DEMO_CONTRACT_STATUSES } from "@/data/seed/admin-platform";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";

const CLASSIFICATION_CONFIG = {
  presentational: { label: "Presentational", color: "bg-muted text-muted-foreground", icon: Eye, description: "UI shell — no backing logic or data truth" },
  simulated: { label: "Simulated", color: "bg-yellow-500/20 text-yellow-400", icon: Cpu, description: "Mock/demo/in-memory logic, state dies on refresh" },
  persisted: { label: "Persisted", color: "bg-blue-500/20 text-blue-400", icon: Shield, description: "Real backend + storage, state survives refresh" },
  proven: { label: "Proven", color: "bg-emerald-500/20 text-emerald-400", icon: CheckCircle2, description: "Persisted + verified + contract-aligned + launch-honest" },
} as const;

const LAUNCH_IMPACT_CONFIG = {
  blocking: { label: "Blocking", color: "text-destructive" },
  degraded: { label: "Degraded", color: "text-yellow-400" },
  none: { label: "None", color: "text-muted-foreground" },
};

function ClassificationBadge({ classification }: { classification: RealityClassification["classification"] }) {
  const cfg = CLASSIFICATION_CONFIG[classification];
  const Icon = cfg.icon;
  return (
    <Tooltip>
      <TooltipTrigger>
        <Badge variant="outline" className={`${cfg.color} gap-1`}>
          <Icon className="h-3 w-3" />{cfg.label}
        </Badge>
      </TooltipTrigger>
      <TooltipContent><p className="text-xs">{cfg.description}</p></TooltipContent>
    </Tooltip>
  );
}

interface FormData {
  route_path: string;
  feature_name: string;
  domain: string;
  scope_level: ScopeLevel;
  classification: RealityClassification["classification"];
  confidence: number;
  contract_status: RealityClassification["contract_status"];
  evidence_inputs: string[];
  missing_requirements: string;
  blockers: string;
  owner: string;
  launch_impact: LaunchImpact;
  mock_sources: string;
  backend_target: string;
  readiness_score: number;
  notes: string;
}

const EMPTY: FormData = {
  route_path: "", feature_name: "", domain: "general", scope_level: "feature",
  classification: "presentational", confidence: 50, contract_status: "none",
  evidence_inputs: [], missing_requirements: "", blockers: "", owner: "",
  launch_impact: "none", mock_sources: "", backend_target: "", readiness_score: 0, notes: "",
};

function FormDialog({ trigger, initial, onSave }: { trigger: React.ReactNode; initial?: FormData; onSave: (d: any) => void }) {
  const { isDemoMode } = useDataMode();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormData>(initial ?? EMPTY);
  const handleOpen = (v: boolean) => {
    if (v) setForm(initial ?? EMPTY); setOpen(v); };

  const toggleEvidence = (sig: string) => {
    setForm(f => ({
      ...f,
      evidence_inputs: f.evidence_inputs.includes(sig)
        ? f.evidence_inputs.filter(e => e !== sig)
        : [...f.evidence_inputs, sig],
    }));
  };

  // Compute next state progression
  const nextState = form.classification === "proven" ? null
    : form.classification === "persisted" ? "proven"
    : form.classification === "simulated" ? "persisted"
    : "simulated";
  const progressionKey = nextState ? `${form.classification}→${nextState}` : null;
  const requiredForNext = progressionKey ? PROGRESSION_REQUIREMENTS[progressionKey] ?? [] : [];
  const metCount = requiredForNext.filter(r => form.evidence_inputs.includes(r)).length;
  const progressionPct = requiredForNext.length ? Math.round((metCount / requiredForNext.length) * 100) : 100;

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{initial ? "Edit Classification" : "Add Feature Classification"}</DialogTitle></DialogHeader>
        <div className="grid gap-4">
          {/* Identity */}
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Route Path</Label><Input value={form.route_path} onChange={e => setForm(f => ({ ...f, route_path: e.target.value }))} placeholder="/money/portfolio" /></div>
            <div><Label>Feature Name</Label><Input value={form.feature_name} onChange={e => setForm(f => ({ ...f, feature_name: e.target.value }))} placeholder="Portfolio View" /></div>
            <div><Label>Domain</Label><Input value={form.domain} onChange={e => setForm(f => ({ ...f, domain: e.target.value }))} placeholder="money" /></div>
          </div>

          {/* Scope + Classification + Confidence */}
          <div className="grid grid-cols-4 gap-3">
            <div>
              <Label>Scope Level</Label>
              <Select value={form.scope_level} onValueChange={v => setForm(f => ({ ...f, scope_level: v as ScopeLevel }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SCOPE_LEVELS.map(s => <SelectItem key={s} value={s} className="capitalize">{s.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Classification</Label>
              <Select value={form.classification} onValueChange={v => setForm(f => ({ ...f, classification: v as never }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(CLASSIFICATION_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Confidence (0–100)</Label>
              <Input type="number" min={0} max={100} value={form.confidence} onChange={e => setForm(f => ({ ...f, confidence: Number(e.target.value) }))} />
            </div>
            <div>
              <Label>Launch Impact</Label>
              <Select value={form.launch_impact} onValueChange={v => setForm(f => ({ ...f, launch_impact: v as LaunchImpact }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(LAUNCH_IMPACT_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          {/* Evidence Inputs */}
          <div>
            <Label className="mb-2 block">Evidence Inputs</Label>
            <div className="grid grid-cols-4 gap-2">
              {EVIDENCE_SIGNALS.map(sig => (
                <label key={sig} className="flex items-center gap-2 text-xs cursor-pointer">
                  <Checkbox checked={form.evidence_inputs.includes(sig)} onCheckedChange={() => toggleEvidence(sig)} />
                  <span className="text-muted-foreground">{sig.replace(/_/g, " ")}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Progression to next state */}
          {nextState && requiredForNext.length > 0 && (
            <Card className="border-border/50">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-foreground flex items-center gap-1">
                    <ArrowRight className="h-3 w-3" /> Path to {CLASSIFICATION_CONFIG[nextState as keyof typeof CLASSIFICATION_CONFIG].label}
                  </span>
                  <span className="text-xs text-muted-foreground">{metCount}/{requiredForNext.length} met — {progressionPct}%</span>
                </div>
                <Progress value={progressionPct} className="h-1.5 mb-2" />
                <div className="flex flex-wrap gap-1">
                  {requiredForNext.map(r => (
                    <Badge key={r} variant="outline" className={`text-[10px] ${form.evidence_inputs.includes(r) ? "bg-emerald-500/20 text-emerald-400" : "text-muted-foreground"}`}>
                      {form.evidence_inputs.includes(r) ? "✓" : "○"} {r.replace(/_/g, " ")}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contract + Backend + Owner */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Contract Status</Label>
              <Select value={form.contract_status} onValueChange={v => setForm(f => ({ ...f, contract_status: v as never }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{(isDemoMode ? DEMO_CONTRACT_STATUSES : [] as typeof DEMO_CONTRACT_STATUSES).map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Backend Target</Label><Input value={form.backend_target} onChange={e => setForm(f => ({ ...f, backend_target: e.target.value }))} placeholder="supabase.customers + RLS" /></div>
            <div><Label>Owner</Label><Input value={form.owner} onChange={e => setForm(f => ({ ...f, owner: e.target.value }))} placeholder="team/person" /></div>
          </div>

          <div><Label>Mock Sources (comma-separated)</Label><Input value={form.mock_sources} onChange={e => setForm(f => ({ ...f, mock_sources: e.target.value }))} placeholder="MOCK_CUSTOMERS, MOCK_INVOICES" /></div>
          <div><Label>Missing Requirements (comma-separated)</Label><Textarea value={form.missing_requirements} onChange={e => setForm(f => ({ ...f, missing_requirements: e.target.value }))} rows={2} placeholder="RLS policies, edge function, E2E tests" /></div>
          <div><Label>Blockers (comma-separated)</Label><Textarea value={form.blockers} onChange={e => setForm(f => ({ ...f, blockers: e.target.value }))} rows={2} placeholder="Schema not migrated, API not ready" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Readiness Score (0–100)</Label><Input type="number" min={0} max={100} value={form.readiness_score} onChange={e => setForm(f => ({ ...f, readiness_score: Number(e.target.value) }))} /></div>
            <div><Label>Notes</Label><Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <Button onClick={() => {
            const { mock_sources, missing_requirements, blockers, ...rest } = form;
            onSave({
              ...rest,
              mock_sources: mock_sources ? mock_sources.split(",").map(s => s.trim()).filter(Boolean) : [],
              missing_requirements: missing_requirements ? missing_requirements.split(",").map(s => s.trim()).filter(Boolean) : [],
              blockers: blockers ? blockers.split(",").map(s => s.trim()).filter(Boolean) : [],
            });
            setOpen(false);
          }}>Save Classification</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function toFormData(r: RealityClassification): FormData {
  return {
    route_path: r.route_path, feature_name: r.feature_name, domain: r.domain,
    scope_level: r.scope_level, classification: r.classification, confidence: r.confidence,
    contract_status: r.contract_status, evidence_inputs: r.evidence_inputs ?? [],
    missing_requirements: (r.missing_requirements ?? []).join(", "),
    blockers: (r.blockers ?? []).join(", "), owner: r.owner ?? "",
    launch_impact: r.launch_impact, mock_sources: (r.mock_sources ?? []).join(", "),
    backend_target: r.backend_target ?? "", readiness_score: r.readiness_score, notes: r.notes ?? "",
  };
}

function DomainBreakdownCard({ data }: { data: RealityClassification[] }) {
  const domains = useMemo(() => {
    const map: Record<string, { presentational: number; simulated: number; persisted: number; proven: number; total: number }> = {};
    data.forEach(d => {
      if (!map[d.domain]) map[d.domain] = { presentational: 0, simulated: 0, persisted: 0, proven: 0, total: 0 };
      map[d.domain][d.classification]++;
      map[d.domain].total++;
    });
    return Object.entries(map).sort((a, b) => b[1].total - a[1].total);
  }, [data]);
  if (domains.length === 0) return <Card><CardContent className="p-8 text-center text-muted-foreground">Add classifications to see domain breakdown</CardContent></Card>;
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {domains.map(([domain, counts]) => {
        const provenPct = counts.total ? Math.round(((counts.proven + counts.persisted) / counts.total) * 100) : 0;
        return (
          <Card key={domain}>
            <CardHeader className="pb-2"><CardTitle className="text-sm capitalize flex items-center justify-between">{domain}<span className="text-xs text-muted-foreground">{provenPct}% real</span></CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="flex h-3 rounded-full overflow-hidden bg-muted">
                {counts.proven > 0 && <div className="bg-emerald-500" style={{ width: `${(counts.proven / counts.total) * 100}%` }} />}
                {counts.persisted > 0 && <div className="bg-blue-500" style={{ width: `${(counts.persisted / counts.total) * 100}%` }} />}
                {counts.simulated > 0 && <div className="bg-yellow-500" style={{ width: `${(counts.simulated / counts.total) * 100}%` }} />}
                {counts.presentational > 0 && <div className="bg-muted-foreground/30" style={{ width: `${(counts.presentational / counts.total) * 100}%` }} />}
              </div>
              <div className="flex gap-3 text-[10px] text-muted-foreground">
                <span>✓ {counts.proven} proven</span>
                <span>● {counts.persisted} persisted</span>
                <span>◐ {counts.simulated} simulated</span>
                <span>○ {counts.presentational} presentational</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function ScopeBreakdownCard({ data }: { data: RealityClassification[] }) {
  const byScope = useMemo(() => {
    const map: Record<string, number> = {};
    data.forEach(d => { map[d.scope_level] = (map[d.scope_level] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [data]);
  if (byScope.length === 0) return null;
  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Layers className="h-4 w-4" />By Scope Level</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {byScope.map(([scope, count]) => (
          <div key={scope} className="flex items-center justify-between">
            <span className="text-xs capitalize text-muted-foreground">{scope.replace(/_/g, " ")}</span>
            <Badge variant="outline" className="text-xs">{count}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function LaunchHonestyCard({ data }: { data: RealityClassification[] }) {
  const launchable = data.filter(d => d.classification === "proven" && d.readiness_score >= 80);
  const blocking = data.filter(d => d.launch_impact === "blocking" && d.classification !== "proven");
  const degraded = data.filter(d => d.launch_impact === "degraded" && d.classification !== "proven");
  const blockedByMocks = data.filter(d => d.mock_sources?.length > 0 && d.classification !== "proven");
  const avgConfidence = data.length ? Math.round(data.reduce((s, d) => s + d.confidence, 0) / data.length) : 0;

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Rocket className="h-4 w-4" />Launch Honesty Summary</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Launchable (proven ≥80%)</span><Badge variant="outline" className="bg-emerald-500/20 text-emerald-400">{launchable.length}</Badge></div>
          <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Launch-blocking items</span><Badge variant="outline" className="bg-destructive/20 text-destructive">{blocking.length}</Badge></div>
          <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Degraded at launch</span><Badge variant="outline" className="bg-yellow-500/20 text-yellow-400">{degraded.length}</Badge></div>
          <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Mock-blocked</span><Badge variant="outline" className="bg-yellow-500/20 text-yellow-400">{blockedByMocks.length}</Badge></div>
          <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Avg confidence</span><span className="text-xs font-medium text-foreground">{avgConfidence}%</span></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4" />Launch Blockers</CardTitle></CardHeader>
        <CardContent>
          {blocking.length === 0 ? (
            <p className="text-xs text-muted-foreground">No launch-blocking items</p>
          ) : (
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {blocking.map(b => (
                <div key={b.id} className="p-2 rounded bg-destructive/5 border border-destructive/20">
                  <p className="text-xs font-medium text-foreground">{b.feature_name} <span className="text-muted-foreground font-mono">({b.route_path})</span></p>
                  {b.blockers?.length > 0 && b.blockers.map((bl, i) => <p key={i} className="text-[10px] text-muted-foreground">• {bl}</p>)}
                  {b.missing_requirements?.length > 0 && <p className="text-[10px] text-yellow-400">Missing: {(b.missing_requirements as string[]).join(", ")}</p>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ProgressionCard({ data }: { data: RealityClassification[] }) {
  const progression = useMemo(() => {
    const items = data.filter(d => d.classification !== "proven").map(d => {
      const nextState = d.classification === "persisted" ? "proven" : d.classification === "simulated" ? "persisted" : "simulated";
      const key = `${d.classification}→${nextState}`;
      const required = PROGRESSION_REQUIREMENTS[key] ?? [];
      const met = required.filter(r => (d.evidence_inputs ?? []).includes(r)).length;
      return { ...d, nextState, required, met, pct: required.length ? Math.round((met / required.length) * 100) : 0 };
    });
    return items.sort((a, b) => b.pct - a.pct);
  }, [data]);

  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4" />Progression Tracker</CardTitle></CardHeader>
      <CardContent>
        {progression.length === 0 ? (
          <p className="text-xs text-muted-foreground">All items are proven or no items classified yet</p>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {progression.map(p => (
              <div key={p.id} className="p-2 rounded bg-muted/30 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">{p.feature_name}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {CLASSIFICATION_CONFIG[p.classification].label} → {CLASSIFICATION_CONFIG[p.nextState as keyof typeof CLASSIFICATION_CONFIG].label}
                  </span>
                </div>
                <Progress value={p.pct} className="h-1.5" />
                <div className="flex flex-wrap gap-1">
                  {p.required.map(r => (
                    <Badge key={r} variant="outline" className={`text-[9px] ${(p.evidence_inputs ?? []).includes(r) ? "bg-emerald-500/10 text-emerald-400" : "text-muted-foreground/60"}`}>
                      {(p.evidence_inputs ?? []).includes(r) ? "✓" : "○"} {r.replace(/_/g, " ")}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function RealityClassificationMatrix() {
  const { data, isLoading } = useRealityClassifications();
  const upsert = useUpsertClassification();
  const remove = useDeleteClassification();
  const stats = useClassificationStats(data);
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState<string>("all");
  const [filterDomain, setFilterDomain] = useState<string>("all");
  const [filterScope, setFilterScope] = useState<string>("all");

  const allDomains = useMemo(() => Array.from(new Set((data ?? []).map(d => d.domain))).sort(), [data]);

  const filtered = (data ?? []).filter(d => {
    if (search && !d.feature_name.toLowerCase().includes(search.toLowerCase()) && !d.route_path.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterClass !== "all" && d.classification !== filterClass) return false;
    if (filterDomain !== "all" && d.domain !== filterDomain) return false;
    if (filterScope !== "all" && d.scope_level !== filterScope) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-6">
<div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reality Classification Matrix</h1>
          <p className="text-sm text-muted-foreground">Multi-scope, evidence-based implementation state — the canonical honesty index</p>
        </div>
        <FormDialog trigger={<Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Classification</Button>} onSave={d => upsert.mutate(d)} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {Object.entries(CLASSIFICATION_CONFIG).map(([key, cfg]) => {
          const Icon = cfg.icon;
          return (
            <Card key={key} className="border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${cfg.color}`}><Icon className="h-5 w-5" /></div>
                <div><p className="text-2xl font-bold text-foreground">{stats[key as keyof typeof CLASSIFICATION_CONFIG]}</p><p className="text-xs text-muted-foreground">{cfg.label}</p></div>
              </CardContent>
            </Card>
          );
        })}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1"><BarChart3 className="h-4 w-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">Readiness</span></div>
            <p className="text-2xl font-bold text-foreground">{stats.readiness}%</p>
            <Progress value={stats.readiness} className="mt-1 h-1.5" />
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1"><Layers className="h-4 w-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">Total</span></div>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-[10px] text-muted-foreground mt-1">classified items</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="table">
        <TabsList>
          <TabsTrigger value="table">Feature Table</TabsTrigger>
          <TabsTrigger value="domains">Domain Rollup</TabsTrigger>
          <TabsTrigger value="progression">Progression</TabsTrigger>
          <TabsTrigger value="launch">Launch Honesty</TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="space-y-4">
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={filterClass} onValueChange={setFilterClass}>
              <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {Object.entries(CLASSIFICATION_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterDomain} onValueChange={setFilterDomain}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Domains</SelectItem>
                {allDomains.map(d => <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterScope} onValueChange={setFilterScope}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scopes</SelectItem>
                {SCOPE_LEVELS.map(s => <SelectItem key={s} value={s} className="capitalize">{s.replace(/_/g, " ")}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Feature</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Scope</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Evidence</TableHead>
                    <TableHead>Launch</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Readiness</TableHead>
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={11} className="text-center text-muted-foreground py-8">Loading…</TableCell></TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={11} className="text-center text-muted-foreground py-8">No classifications yet. Add features to begin tracking.</TableCell></TableRow>
                  ) : filtered.map(row => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium text-foreground">{row.feature_name}</TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">{row.route_path}</TableCell>
                      <TableCell><Badge variant="outline" className="capitalize text-[10px]">{row.scope_level.replace(/_/g, " ")}</Badge></TableCell>
                      <TableCell><Badge variant="outline" className="capitalize">{row.domain}</Badge></TableCell>
                      <TableCell><ClassificationBadge classification={row.classification} /></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-foreground">{row.confidence}%</span>
                          <div className="w-8 h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary" style={{ width: `${row.confidence}%` }} /></div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge variant="outline" className="text-[10px]">{(row.evidence_inputs ?? []).length} signals</Badge>
                          </TooltipTrigger>
                          <TooltipContent><div className="text-xs space-y-0.5 max-w-[200px]">{(row.evidence_inputs ?? []).map((e: string, i: number) => <p key={i}>✓ {e.replace(/_/g, " ")}</p>)}</div></TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell><span className={`text-xs ${LAUNCH_IMPACT_CONFIG[row.launch_impact]?.color ?? "text-muted-foreground"}`}>{row.launch_impact}</span></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{row.owner || "—"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="text-xs">{row.readiness_score}%</span>
                          <div className="w-8 h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${row.readiness_score}%` }} /></div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <FormDialog trigger={<Button variant="ghost" size="icon"><Pencil className="h-3 w-3" /></Button>} initial={toFormData(row)} onSave={d => upsert.mutate(d)} />
                          <Button variant="ghost" size="icon" onClick={() => remove.mutate(row.id)}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="domains" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2"><DomainBreakdownCard data={data ?? []} /></div>
            <ScopeBreakdownCard data={data ?? []} />
          </div>
        </TabsContent>

        <TabsContent value="progression">
          <ProgressionCard data={data ?? []} />
        </TabsContent>

        <TabsContent value="launch">
          <LaunchHonestyCard data={data ?? []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
