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
import { useRealityClassifications, useUpsertClassification, useDeleteClassification, useClassificationStats } from "@/hooks/useRealityClassifications";
import { Shield, Eye, Cpu, CheckCircle2, Plus, Trash2, Search, BarChart3, Pencil, Rocket, AlertTriangle, Info } from "lucide-react";
import type { RealityClassification } from "@/lib/persistence/reality-classification-persistence";

const CLASSIFICATION_CONFIG = {
  presentational: { label: "Presentational", color: "bg-muted text-muted-foreground", icon: Eye, description: "UI exists but no backing logic or data truth" },
  simulated: { label: "Simulated", color: "bg-yellow-500/20 text-yellow-400", icon: Cpu, description: "Wired to mock/demo/in-memory logic, not persisted" },
  persisted: { label: "Persisted", color: "bg-blue-500/20 text-blue-400", icon: Shield, description: "Real backend + storage, state survives refresh" },
  proven: { label: "Proven", color: "bg-emerald-500/20 text-emerald-400", icon: CheckCircle2, description: "Persisted + verified + contract-aligned + launch-honest" },
} as const;

const CONTRACT_STATUSES = ["none", "partial", "aligned", "verified"] as const;

function ClassificationBadge({ classification }: { classification: RealityClassification["classification"] }) {
  const cfg = CLASSIFICATION_CONFIG[classification];
  const Icon = cfg.icon;
  return (
    <Tooltip>
      <TooltipTrigger>
        <Badge variant="outline" className={`${cfg.color} gap-1`}>
          <Icon className="h-3 w-3" />
          {cfg.label}
        </Badge>
      </TooltipTrigger>
      <TooltipContent><p className="text-xs">{cfg.description}</p></TooltipContent>
    </Tooltip>
  );
}

interface ClassificationFormData {
  route_path: string;
  feature_name: string;
  domain: string;
  classification: RealityClassification["classification"];
  contract_status: RealityClassification["contract_status"];
  mock_sources: string;
  backend_target: string;
  readiness_score: number;
  notes: string;
}

const EMPTY_FORM: ClassificationFormData = {
  route_path: "", feature_name: "", domain: "general", classification: "presentational",
  contract_status: "none", mock_sources: "", backend_target: "", readiness_score: 0, notes: "",
};

function ClassificationFormDialog({
  trigger,
  initial,
  onSave,
}: {
  trigger: React.ReactNode;
  initial?: ClassificationFormData;
  onSave: (data: any) => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ClassificationFormData>(initial ?? EMPTY_FORM);

  const handleOpen = (v: boolean) => {
    if (v && initial) setForm(initial);
    else if (v) setForm(EMPTY_FORM);
    setOpen(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{initial ? "Edit Classification" : "Add Feature Classification"}</DialogTitle></DialogHeader>
        <div className="grid gap-3 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Route Path</Label><Input value={form.route_path} onChange={e => setForm(f => ({ ...f, route_path: e.target.value }))} placeholder="/business/customers" /></div>
            <div><Label>Feature Name</Label><Input value={form.feature_name} onChange={e => setForm(f => ({ ...f, feature_name: e.target.value }))} placeholder="Customer Management" /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Domain</Label><Input value={form.domain} onChange={e => setForm(f => ({ ...f, domain: e.target.value }))} /></div>
            <div>
              <Label>Classification</Label>
              <Select value={form.classification} onValueChange={v => setForm(f => ({ ...f, classification: v as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CLASSIFICATION_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Contract Status</Label>
              <Select value={form.contract_status} onValueChange={v => setForm(f => ({ ...f, contract_status: v as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CONTRACT_STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Mock Sources (comma-separated)</Label><Input value={form.mock_sources} onChange={e => setForm(f => ({ ...f, mock_sources: e.target.value }))} placeholder="MOCK_CUSTOMERS, MOCK_INVOICES" /></div>
          <div><Label>Backend Target</Label><Input value={form.backend_target} onChange={e => setForm(f => ({ ...f, backend_target: e.target.value }))} placeholder="supabase.customers + RLS" /></div>
          <div><Label>Readiness Score (0–100)</Label><Input type="number" min={0} max={100} value={form.readiness_score} onChange={e => setForm(f => ({ ...f, readiness_score: Number(e.target.value) }))} /></div>
          <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          <Button onClick={() => {
            const { mock_sources, ...rest } = form;
            onSave({ ...rest, mock_sources: mock_sources ? mock_sources.split(",").map(s => s.trim()).filter(Boolean) : [] });
            setOpen(false);
          }}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
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

  if (domains.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-sm">Domain Breakdown</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {domains.map(([domain, counts]) => {
          const provenPct = counts.total ? Math.round(((counts.proven + counts.persisted) / counts.total) * 100) : 0;
          return (
            <div key={domain} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground capitalize">{domain}</span>
                <span className="text-xs text-muted-foreground">{provenPct}% real</span>
              </div>
              <div className="flex h-2 rounded-full overflow-hidden bg-muted">
                {counts.proven > 0 && <div className="bg-emerald-500" style={{ width: `${(counts.proven / counts.total) * 100}%` }} />}
                {counts.persisted > 0 && <div className="bg-blue-500" style={{ width: `${(counts.persisted / counts.total) * 100}%` }} />}
                {counts.simulated > 0 && <div className="bg-yellow-500" style={{ width: `${(counts.simulated / counts.total) * 100}%` }} />}
                {counts.presentational > 0 && <div className="bg-muted-foreground/30" style={{ width: `${(counts.presentational / counts.total) * 100}%` }} />}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function LaunchReadinessCard({ data }: { data: RealityClassification[] }) {
  const launchable = data.filter(d => d.classification === "proven" && d.readiness_score >= 80);
  const notLaunchable = data.filter(d => d.classification !== "proven" || d.readiness_score < 80);
  const blockedByMocks = data.filter(d => d.mock_sources && d.mock_sources.length > 0 && d.classification !== "proven");

  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Rocket className="h-4 w-4" />Launch Honesty</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Launchable routes</span>
          <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400">{launchable.length}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Not launch-ready</span>
          <Badge variant="outline" className="bg-muted text-muted-foreground">{notLaunchable.length}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Blocked by mocks</span>
          <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400">{blockedByMocks.length}</Badge>
        </div>
        {launchable.length > 0 && (
          <div className="pt-2 border-t border-border/50">
            <p className="text-[10px] text-muted-foreground mb-1">Ready to launch:</p>
            {launchable.slice(0, 5).map(r => (
              <p key={r.id} className="text-xs text-foreground font-mono">{r.route_path}</p>
            ))}
            {launchable.length > 5 && <p className="text-[10px] text-muted-foreground">+{launchable.length - 5} more</p>}
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

  const allDomains = useMemo(() => {
    const set = new Set((data ?? []).map(d => d.domain));
    return Array.from(set).sort();
  }, [data]);

  const filtered = (data ?? []).filter(d => {
    if (search && !d.feature_name.toLowerCase().includes(search.toLowerCase()) && !d.route_path.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterClass !== "all" && d.classification !== filterClass) return false;
    if (filterDomain !== "all" && d.domain !== filterDomain) return false;
    return true;
  });

  const toFormData = (r: RealityClassification): ClassificationFormData => ({
    route_path: r.route_path,
    feature_name: r.feature_name,
    domain: r.domain,
    classification: r.classification,
    contract_status: r.contract_status,
    mock_sources: (r.mock_sources ?? []).join(", "),
    backend_target: r.backend_target ?? "",
    readiness_score: r.readiness_score,
    notes: r.notes ?? "",
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reality Classification Matrix</h1>
          <p className="text-sm text-muted-foreground">Truthful implementation state for every feature — the canonical honesty index</p>
        </div>
        <ClassificationFormDialog
          trigger={<Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Classification</Button>}
          onSave={(d) => upsert.mutate(d)}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(CLASSIFICATION_CONFIG).map(([key, cfg]) => {
          const Icon = cfg.icon;
          const count = stats[key as keyof typeof CLASSIFICATION_CONFIG];
          return (
            <Card key={key} className="border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${cfg.color}`}><Icon className="h-5 w-5" /></div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{count}</p>
                  <p className="text-xs text-muted-foreground">{cfg.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Launch Readiness</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.readiness}%</p>
            <Progress value={stats.readiness} className="mt-1 h-1.5" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="table">
        <TabsList>
          <TabsTrigger value="table">Feature Table</TabsTrigger>
          <TabsTrigger value="domains">Domain Breakdown</TabsTrigger>
          <TabsTrigger value="launch">Launch Honesty</TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search features or routes..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={filterClass} onValueChange={setFilterClass}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
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
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Feature</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Contract</TableHead>
                    <TableHead>Mock Sources</TableHead>
                    <TableHead>Backend</TableHead>
                    <TableHead>Readiness</TableHead>
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">Loading…</TableCell></TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">No classifications yet. Add features to begin tracking reality state.</TableCell></TableRow>
                  ) : filtered.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium text-foreground">{row.feature_name}</TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">{row.route_path}</TableCell>
                      <TableCell><Badge variant="outline" className="capitalize">{row.domain}</Badge></TableCell>
                      <TableCell><ClassificationBadge classification={row.classification} /></TableCell>
                      <TableCell><Badge variant="outline" className="capitalize text-[10px]">{row.contract_status}</Badge></TableCell>
                      <TableCell>
                        {row.mock_sources && row.mock_sources.length > 0 ? (
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 text-[10px]">
                                <AlertTriangle className="h-2.5 w-2.5 mr-1" />{row.mock_sources.length} mock{row.mock_sources.length > 1 ? "s" : ""}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent><div className="text-xs space-y-0.5">{row.mock_sources.map((s, i) => <p key={i} className="font-mono">{s}</p>)}</div></TooltipContent>
                          </Tooltip>
                        ) : <span className="text-xs text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">{row.backend_target || "—"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={row.readiness_score} className="h-1.5 w-16" />
                          <span className="text-xs text-muted-foreground">{row.readiness_score}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <ClassificationFormDialog
                            trigger={<Button variant="ghost" size="icon"><Pencil className="h-3 w-3" /></Button>}
                            initial={toFormData(row)}
                            onSave={(d) => upsert.mutate(d)}
                          />
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

        <TabsContent value="domains">
          {data && data.length > 0 ? (
            <DomainBreakdownCard data={data} />
          ) : (
            <Card><CardContent className="p-8 text-center text-muted-foreground">Add classifications to see domain breakdown</CardContent></Card>
          )}
        </TabsContent>

        <TabsContent value="launch">
          {data && data.length > 0 ? (
            <LaunchReadinessCard data={data} />
          ) : (
            <Card><CardContent className="p-8 text-center text-muted-foreground">Add classifications to see launch readiness</CardContent></Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
