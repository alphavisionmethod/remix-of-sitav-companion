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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useMockReplacements, useUpsertMockReplacement, useUpdateMockStatus, useDeleteMockReplacement, useMockReplacementStats } from "@/hooks/useMockReplacements";
import { Plus, Trash2, Search, ArrowRight, AlertTriangle, CheckCircle2, Clock, Ban, CircleDot, Pencil, BarChart3, Flame, GitBranch, ShieldCheck, Layers } from "lucide-react";
import type { MockReplacement } from "@/data/persistence/mock-replacement-persistence";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

const STATUSES: any[] = [];


// Production fallback — seed data removed
const CUSTOMERS: any[] = [];

const STATUS_CONFIG: Record<MockReplacement["migration_status"], { label: string; color: string; icon: any }> = {
  identified: { label: "Identified", color: "bg-muted text-muted-foreground", icon: CircleDot },
  planned: { label: "Planned", color: "bg-blue-500/20 text-blue-400", icon: Clock },
  in_progress: { label: "In Progress", color: "bg-yellow-500/20 text-yellow-400", icon: ArrowRight },
  blocked: { label: "Blocked", color: "bg-destructive/20 text-destructive", icon: Ban },
  completed: { label: "Completed", color: "bg-emerald-500/20 text-emerald-400", icon: CheckCircle2 },
  validated: { label: "Validated", color: "bg-emerald-600/20 text-emerald-300", icon: ShieldCheck },
};

const PRIORITY_COLORS: Record<string, string> = {
  critical: "text-destructive border-destructive/30",
  high: "text-orange-400 border-orange-400/30",
  medium: "text-yellow-400 border-yellow-400/30",
  low: "text-muted-foreground",
};

interface MockFormData {
  feature_name: string;
  page_path: string;
  mock_source: string;
  mock_type: MockReplacement["mock_type"];
  real_backend_target: string;
  expected_contract: string;
  migration_priority: MockReplacement["migration_priority"];
  migration_owner: string;
  blockers_text: string;
  sequence_order: number;
  dependencies_text: string;
}

const EMPTY_FORM: MockFormData = {
  feature_name: "", page_path: "", mock_source: "", mock_type: "hardcoded",
  real_backend_target: "", expected_contract: "", migration_priority: "medium",
  migration_owner: "", blockers_text: "", sequence_order: 0, dependencies_text: "",
};

function MockFormDialog({ trigger, initial, onSave }: { trigger: React.ReactNode; initial?: MockFormData; onSave: (d: any) => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<MockFormData>(initial ?? EMPTY_FORM);
  const handleOpen = (v: boolean) => { if (v) setForm(initial ?? EMPTY_FORM); setOpen(v); };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{initial ? "Edit Mock Entry" : "Track Mock for Replacement"}</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Feature Name</Label><Input value={form.feature_name} onChange={e => setForm(f => ({ ...f, feature_name: e.target.value }))} placeholder="Customer List" /></div>
            <div><Label>Page Path</Label><Input value={form.page_path} onChange={e => setForm(f => ({ ...f, page_path: e.target.value }))} placeholder="/business/customers" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Mock Source</Label><Input value={form.mock_source} onChange={e => setForm(f => ({ ...f, mock_source: e.target.value }))} placeholder="CUSTOMERS" /></div>
            <div>
              <Label>Mock Type</Label>
              <Select value={form.mock_type} onValueChange={v => setForm(f => ({ ...f, mock_type: v as never }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{MOCK_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Real Backend Target</Label><Input value={form.real_backend_target} onChange={e => setForm(f => ({ ...f, real_backend_target: e.target.value }))} placeholder="supabase.customers table + RLS" /></div>
          <div><Label>Expected Contract</Label><Input value={form.expected_contract} onChange={e => setForm(f => ({ ...f, expected_contract: e.target.value }))} placeholder="CustomerRecord from contracts" /></div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Priority</Label>
              <Select value={form.migration_priority} onValueChange={v => setForm(f => ({ ...f, migration_priority: v as never }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PRIORITIES.map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Owner</Label><Input value={form.migration_owner} onChange={e => setForm(f => ({ ...f, migration_owner: e.target.value }))} placeholder="team/person" /></div>
            <div><Label>Sequence Order</Label><Input type="number" value={form.sequence_order} onChange={e => setForm(f => ({ ...f, sequence_order: Number(e.target.value) }))} /></div>
          </div>
          <div><Label>Dependencies (comma-separated feature names)</Label><Input value={form.dependencies_text} onChange={e => setForm(f => ({ ...f, dependencies_text: e.target.value }))} placeholder="Auth System, Schema Migration" /></div>
          <div><Label>Blockers (comma-separated)</Label><Textarea value={form.blockers_text} onChange={e => setForm(f => ({ ...f, blockers_text: e.target.value }))} placeholder="Needs schema migration, API not ready" rows={2} /></div>
          <Button onClick={() => {
            const { blockers_text, dependencies_text, ...rest } = form;
            onSave({
              ...rest,
              blockers: blockers_text ? blockers_text.split(",").map(b => b.trim()).filter(Boolean) : [],
              dependencies: dependencies_text ? dependencies_text.split(",").map(b => b.trim()).filter(Boolean) : [],
            });
            setOpen(false);
          }}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function toFormData(r: MockReplacement): MockFormData {
  return {
    feature_name: r.feature_name, page_path: r.page_path, mock_source: r.mock_source,
    mock_type: r.mock_type, real_backend_target: r.real_backend_target ?? "",
    expected_contract: r.expected_contract ?? "", migration_priority: r.migration_priority,
    migration_owner: r.migration_owner ?? "", blockers_text: (r.blockers ?? []).join(", "),
    sequence_order: r.sequence_order ?? 0, dependencies_text: (r.dependencies ?? []).join(", "),
  };
}

function PriorityBreakdownCard({ data }: { data: MockReplacement[] }) {
  const byPriority = useMemo(() => {
    const map: Record<string, { total: number; done: number; blocked: number }> = {};
    PRIORITIES.forEach(p => { map[p] = { total: 0, done: 0, blocked: 0 }; });
    data.forEach(d => {
      map[d.migration_priority].total++;
      if (d.migration_status === "completed" || d.migration_status === "validated") map[d.migration_priority].done++;
      if (d.migration_status === "blocked") map[d.migration_priority].blocked++;
    });
    return map;
  }, [data]);

  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Flame className="h-4 w-4" />Priority Breakdown</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {PRIORITIES.map(p => {
          const { total, done, blocked } = byPriority[p];
          if (total === 0) return null;
          return (
            <div key={p} className="space-y-1">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={`capitalize ${PRIORITY_COLORS[p]}`}>{p}</Badge>
                <span className="text-xs text-muted-foreground">{done}/{total} done{blocked > 0 ? `, ${blocked} blocked` : ""}</span>
              </div>
              <Progress value={total ? Math.round((done / total) * 100) : 0} className="h-1.5" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function BlockerSummaryCard({ data }: { data: MockReplacement[] }) {
  const blocked = data.filter(d => d.migration_status === "blocked" || (d.blockers && d.blockers.length > 0));
  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4" />Blocker Summary</CardTitle></CardHeader>
      <CardContent>
        {blocked.length === 0 ? (
          <p className="text-xs text-muted-foreground">No blockers — clear path to completion</p>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {blocked.map(b => (
              <div key={b.id} className="p-2 rounded bg-destructive/5 border border-destructive/20 space-y-0.5">
                <p className="text-xs font-medium text-foreground">{b.feature_name}</p>
                {b.blockers.map((bl, i) => <p key={i} className="text-[10px] text-muted-foreground">• {bl}</p>)}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SequenceCard({ data }: { data: MockReplacement[] }) {
  const sequenced = useMemo(() => [...data].sort((a, b) => (a.sequence_order ?? 0) - (b.sequence_order ?? 0)), [data]);
  const phases = useMemo(() => {
    const p: Record<number, MockReplacement[]> = {};
    sequenced.forEach(d => {
      const phase = d.sequence_order ?? 0;
      if (!p[phase]) p[phase] = [];
      p[phase].push(d);
    });
    return Object.entries(p).sort(([a], [b]) => Number(a) - Number(b));
  }, [sequenced]);

  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><GitBranch className="h-4 w-4" />Migration Sequence</CardTitle></CardHeader>
      <CardContent>
        {phases.length === 0 ? (
          <p className="text-xs text-muted-foreground">No items sequenced yet</p>
        ) : (
          <div className="space-y-4">
            {phases.map(([phase, items]) => (
              <div key={phase}>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">Phase {phase}</Badge>
                  <span className="text-[10px] text-muted-foreground">{items.filter(i => i.migration_status === "completed" || i.migration_status === "validated").length}/{items.length} complete</span>
                </div>
                <div className="space-y-1 pl-4 border-l-2 border-border/50">
                  {items.map(item => {
                    const cfg = STATUS_CONFIG[item.migration_status];
                    const Icon = cfg.icon;
                    return (
                      <div key={item.id} className="flex items-center gap-2 py-1">
                        <Icon className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-foreground">{item.feature_name}</span>
                        <Badge variant="outline" className={`text-[9px] ${cfg.color}`}>{cfg.label}</Badge>
                        {item.runtime_validated && <ShieldCheck className="h-3 w-3 text-emerald-400" />}
                        {item.dependencies?.length > 0 && (
                          <Tooltip>
                            <TooltipTrigger><Badge variant="outline" className="text-[9px]">deps: {item.dependencies.length}</Badge></TooltipTrigger>
                            <TooltipContent><div className="text-xs">{item.dependencies.map((d, i) => <p key={i}>→ {d}</p>)}</div></TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RuntimeValidationCard({ data }: { data: MockReplacement[] }) {
  const completed = data.filter(d => d.migration_status === "completed" || d.migration_status === "validated");
  const validated = completed.filter(d => d.runtime_validated);
  const pending = completed.filter(d => !d.runtime_validated);

  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><ShieldCheck className="h-4 w-4" />Runtime Validation</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Validated post-migration</span>
          <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400">{validated.length}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Awaiting validation</span>
          <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400">{pending.length}</Badge>
        </div>
        {pending.length > 0 && (
          <div className="pt-2 border-t border-border/50 space-y-1">
            <p className="text-[10px] text-muted-foreground">Need runtime validation:</p>
            {pending.slice(0, 8).map(p => <p key={p.id} className="text-xs text-foreground font-mono">{p.feature_name}</p>)}
            {pending.length > 8 && <p className="text-[10px] text-muted-foreground">+{pending.length - 8} more</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function MockReplacementProgram() {
  const { data, isLoading } = useMockReplacements();
  const upsert = useUpsertMockReplacement();
  const updateStatus = useUpdateMockStatus();
  const remove = useDeleteMockReplacement();
  const stats = useMockReplacementStats(data);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");

  const filtered = (data ?? []).filter(d => {
    if (search && !d.feature_name.toLowerCase().includes(search.toLowerCase()) && !d.page_path.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus !== "all" && d.migration_status !== filterStatus) return false;
    if (filterPriority !== "all" && d.migration_priority !== filterPriority) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-6">
<div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mock Replacement Program</h1>
          <p className="text-sm text-muted-foreground">Sequenced mock elimination with runtime validation — demo-to-real conversion engine</p>
        </div>
        <MockFormDialog trigger={<Button size="sm"><Plus className="h-4 w-4 mr-1" />Track Mock</Button>} onSave={d => upsert.mutate(d)} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
          const Icon = cfg.icon;
          return (
            <Card key={key} className="border-border/50">
              <CardContent className="p-3 text-center">
                <Icon className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xl font-bold text-foreground">{stats[key as keyof typeof STATUS_CONFIG]}</p>
                <p className="text-[10px] text-muted-foreground">{cfg.label}</p>
              </CardContent>
            </Card>
          );
        })}
        <Card className="border-border/50">
          <CardContent className="p-3 text-center">
            <BarChart3 className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-xl font-bold text-foreground">{stats.completionRate}%</p>
            <Progress value={stats.completionRate} className="h-1 mt-1" />
            <p className="text-[10px] text-muted-foreground">Complete</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="table">
        <TabsList>
          <TabsTrigger value="table">Replacement Board</TabsTrigger>
          <TabsTrigger value="sequence">Sequence</TabsTrigger>
          <TabsTrigger value="priority">Priority</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="blockers">Blockers</TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {STATUSES.map(s => <SelectItem key={s} value={s}>{STATUS_CONFIG[s].label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {PRIORITIES.map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Seq</TableHead>
                    <TableHead>Feature</TableHead>
                    <TableHead>Page</TableHead>
                    <TableHead>Mock Source</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Deps</TableHead>
                    <TableHead>Valid</TableHead>
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={12} className="text-center text-muted-foreground py-8">Loading…</TableCell></TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={12} className="text-center text-muted-foreground py-8">No mocks tracked yet.</TableCell></TableRow>
                  ) : filtered.map(row => (
                    <TableRow key={row.id}>
                      <TableCell className="text-xs text-muted-foreground">{row.sequence_order}</TableCell>
                      <TableCell className="font-medium text-foreground">{row.feature_name}</TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">{row.page_path}</TableCell>
                      <TableCell className="text-xs font-mono">{row.mock_source}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{row.mock_type.replace(/_/g, " ")}</Badge></TableCell>
                      <TableCell className="text-xs max-w-[100px] truncate">{row.real_backend_target || "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{row.migration_owner || "—"}</TableCell>
                      <TableCell><Badge variant="outline" className={`capitalize ${PRIORITY_COLORS[row.migration_priority]}`}>{row.migration_priority}</Badge></TableCell>
                      <TableCell>
                        <Select value={row.migration_status} onValueChange={v => updateStatus.mutate({ id: row.id, status: v as never })}>
                          <SelectTrigger className="h-7 text-xs w-[120px]"><SelectValue /></SelectTrigger>
                          <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{STATUS_CONFIG[s].label}</SelectItem>)}</SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {row.dependencies?.length > 0 ? (
                          <Tooltip>
                            <TooltipTrigger><Badge variant="outline" className="text-[10px]">{row.dependencies.length}</Badge></TooltipTrigger>
                            <TooltipContent><div className="text-xs">{row.dependencies.map((d, i) => <p key={i}>→ {d}</p>)}</div></TooltipContent>
                          </Tooltip>
                        ) : <span className="text-xs text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>{row.runtime_validated ? <ShieldCheck className="h-4 w-4 text-emerald-400" /> : <span className="text-xs text-muted-foreground">—</span>}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <MockFormDialog trigger={<Button variant="ghost" size="icon"><Pencil className="h-3 w-3" /></Button>} initial={toFormData(row)} onSave={d => upsert.mutate(d)} />
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

        <TabsContent value="sequence">
          <SequenceCard data={data ?? []} />
        </TabsContent>

        <TabsContent value="priority">
          {data && data.length > 0 ? <PriorityBreakdownCard data={data} /> : <Card><CardContent className="p-8 text-center text-muted-foreground">Track mocks to see priority breakdown</CardContent></Card>}
        </TabsContent>

        <TabsContent value="validation">
          <RuntimeValidationCard data={data ?? []} />
        </TabsContent>

        <TabsContent value="blockers">
          {data && data.length > 0 ? <BlockerSummaryCard data={data} /> : <Card><CardContent className="p-8 text-center text-muted-foreground">Track mocks to see blockers</CardContent></Card>}
        </TabsContent>
      </Tabs>
    </div>
  );
}
