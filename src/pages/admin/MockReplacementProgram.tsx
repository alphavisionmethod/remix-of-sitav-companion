import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMockReplacements, useUpsertMockReplacement, useUpdateMockStatus, useDeleteMockReplacement, useMockReplacementStats } from "@/hooks/useMockReplacements";
import { Plus, Trash2, Search, ArrowRight, AlertTriangle, CheckCircle2, Clock, Ban, CircleDot } from "lucide-react";
import type { MockReplacement } from "@/lib/persistence/mock-replacement-persistence";

const STATUS_CONFIG: Record<MockReplacement["migration_status"], { label: string; color: string; icon: any }> = {
  identified: { label: "Identified", color: "bg-muted text-muted-foreground", icon: CircleDot },
  planned: { label: "Planned", color: "bg-blue-500/20 text-blue-400", icon: Clock },
  in_progress: { label: "In Progress", color: "bg-yellow-500/20 text-yellow-400", icon: ArrowRight },
  blocked: { label: "Blocked", color: "bg-red-500/20 text-red-400", icon: Ban },
  completed: { label: "Completed", color: "bg-emerald-500/20 text-emerald-400", icon: CheckCircle2 },
  validated: { label: "Validated", color: "bg-emerald-600/20 text-emerald-300", icon: CheckCircle2 },
};

const PRIORITY_COLORS: Record<string, string> = { critical: "text-red-400 border-red-400/30", high: "text-orange-400 border-orange-400/30", medium: "text-yellow-400 border-yellow-400/30", low: "text-muted-foreground" };

const MOCK_TYPES = ["hardcoded", "local_array", "localstorage", "in_memory_engine", "pure_function", "demo_flow"] as const;
const STATUSES = ["identified", "planned", "in_progress", "blocked", "completed", "validated"] as const;
const PRIORITIES = ["critical", "high", "medium", "low"] as const;

function AddMockDialog({ onSave }: { onSave: (d: any) => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ feature_name: "", page_path: "", mock_source: "", mock_type: "hardcoded" as const, real_backend_target: "", migration_priority: "medium" as const, expected_contract: "", blockers_text: "" });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" />Track Mock</Button></DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Track Mock for Replacement</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div><Label>Feature Name</Label><Input value={form.feature_name} onChange={e => setForm(f => ({ ...f, feature_name: e.target.value }))} placeholder="Customer List" /></div>
          <div><Label>Page Path</Label><Input value={form.page_path} onChange={e => setForm(f => ({ ...f, page_path: e.target.value }))} placeholder="/business/customers" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Mock Source</Label><Input value={form.mock_source} onChange={e => setForm(f => ({ ...f, mock_source: e.target.value }))} placeholder="MOCK_DEMO_CUSTOMERS" /></div>
            <div>
              <Label>Mock Type</Label>
              <Select value={form.mock_type} onValueChange={v => setForm(f => ({ ...f, mock_type: v as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{MOCK_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Real Backend Target</Label><Input value={form.real_backend_target} onChange={e => setForm(f => ({ ...f, real_backend_target: e.target.value }))} placeholder="supabase.customers table" /></div>
          <div><Label>Expected Contract</Label><Input value={form.expected_contract} onChange={e => setForm(f => ({ ...f, expected_contract: e.target.value }))} placeholder="CustomerRecord from contracts" /></div>
          <div>
            <Label>Priority</Label>
            <Select value={form.migration_priority} onValueChange={v => setForm(f => ({ ...f, migration_priority: v as any }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{PRIORITIES.map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Blockers (comma-separated)</Label><Textarea value={form.blockers_text} onChange={e => setForm(f => ({ ...f, blockers_text: e.target.value }))} placeholder="Needs schema migration, API not ready" /></div>
          <Button onClick={() => {
            const { blockers_text, ...rest } = form;
            onSave({ ...rest, blockers: blockers_text ? blockers_text.split(",").map(b => b.trim()) : [] });
            setOpen(false);
          }}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
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

  const filtered = (data ?? []).filter(d => {
    if (search && !d.feature_name.toLowerCase().includes(search.toLowerCase()) && !d.page_path.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus !== "all" && d.migration_status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mock Replacement Program</h1>
          <p className="text-sm text-muted-foreground">Track and eliminate mock/demo data from production routes</p>
        </div>
        <AddMockDialog onSave={(d) => upsert.mutate(d)} />
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
            <p className="text-xs text-muted-foreground mb-1">Completion</p>
            <p className="text-xl font-bold text-foreground">{stats.completionRate}%</p>
            <Progress value={stats.completionRate} className="h-1 mt-1" />
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search features..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUSES.map(s => <SelectItem key={s} value={s}>{STATUS_CONFIG[s].label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feature</TableHead>
                <TableHead>Page</TableHead>
                <TableHead>Mock Source</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Blockers</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">Loading…</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">No mocks tracked yet. Start by identifying mock data sources.</TableCell></TableRow>
              ) : filtered.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium text-foreground">{row.feature_name}</TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">{row.page_path}</TableCell>
                  <TableCell className="text-xs font-mono">{row.mock_source}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{row.mock_type.replace(/_/g, " ")}</Badge></TableCell>
                  <TableCell className="text-xs">{row.real_backend_target || "—"}</TableCell>
                  <TableCell><Badge variant="outline" className={`capitalize ${PRIORITY_COLORS[row.migration_priority]}`}>{row.migration_priority}</Badge></TableCell>
                  <TableCell>
                    <Select value={row.migration_status} onValueChange={v => updateStatus.mutate({ id: row.id, status: v as any })}>
                      <SelectTrigger className="h-7 text-xs w-[120px]"><SelectValue /></SelectTrigger>
                      <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{STATUS_CONFIG[s].label}</SelectItem>)}</SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {row.blockers.length > 0 ? (
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-yellow-400" />
                        <span className="text-xs text-muted-foreground">{row.blockers.length}</span>
                      </div>
                    ) : <span className="text-xs text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => remove.mutate(row.id)}><Trash2 className="h-3 w-3" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
