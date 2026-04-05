import { useState } from "react";
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
import { useRealityClassifications, useUpsertClassification, useDeleteClassification, useClassificationStats } from "@/hooks/useRealityClassifications";
import { Shield, Eye, Cpu, CheckCircle2, Plus, Trash2, Search, BarChart3 } from "lucide-react";
import type { RealityClassification } from "@/lib/persistence/reality-classification-persistence";

const CLASSIFICATION_CONFIG = {
  presentational: { label: "Presentational", color: "bg-muted text-muted-foreground", icon: Eye },
  simulated: { label: "Simulated", color: "bg-yellow-500/20 text-yellow-400", icon: Cpu },
  persisted: { label: "Persisted", color: "bg-blue-500/20 text-blue-400", icon: Shield },
  proven: { label: "Proven", color: "bg-emerald-500/20 text-emerald-400", icon: CheckCircle2 },
} as const;

function ClassificationBadge({ classification }: { classification: RealityClassification["classification"] }) {
  const cfg = CLASSIFICATION_CONFIG[classification];
  const Icon = cfg.icon;
  return (
    <Badge variant="outline" className={`${cfg.color} gap-1`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </Badge>
  );
}

function AddClassificationDialog({ onSave }: { onSave: (data: any) => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ route_path: "", feature_name: "", domain: "general", classification: "presentational" as const, notes: "", readiness_score: 0 });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Classification</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add Feature Classification</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div><Label>Route Path</Label><Input value={form.route_path} onChange={e => setForm(f => ({ ...f, route_path: e.target.value }))} placeholder="/business/customers" /></div>
          <div><Label>Feature Name</Label><Input value={form.feature_name} onChange={e => setForm(f => ({ ...f, feature_name: e.target.value }))} placeholder="Customer Management" /></div>
          <div className="grid grid-cols-2 gap-3">
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
          </div>
          <div><Label>Readiness Score (0-100)</Label><Input type="number" min={0} max={100} value={form.readiness_score} onChange={e => setForm(f => ({ ...f, readiness_score: Number(e.target.value) }))} /></div>
          <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
          <Button onClick={() => { onSave(form); setOpen(false); }}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function RealityClassificationMatrix() {
  const { data, isLoading } = useRealityClassifications();
  const upsert = useUpsertClassification();
  const remove = useDeleteClassification();
  const stats = useClassificationStats(data);
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState<string>("all");

  const filtered = (data ?? []).filter(d => {
    if (search && !d.feature_name.toLowerCase().includes(search.toLowerCase()) && !d.route_path.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterClass !== "all" && d.classification !== filterClass) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reality Classification Matrix</h1>
          <p className="text-sm text-muted-foreground">Truthful implementation state for every feature</p>
        </div>
        <AddClassificationDialog onSave={(d) => upsert.mutate(d)} />
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

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search features or routes..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterClass} onValueChange={setFilterClass}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            {Object.entries(CLASSIFICATION_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
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
                <TableHead>Route</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Contract</TableHead>
                <TableHead>Readiness</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Loading…</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No classifications yet. Add features to begin tracking reality state.</TableCell></TableRow>
              ) : filtered.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium text-foreground">{row.feature_name}</TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">{row.route_path}</TableCell>
                  <TableCell><Badge variant="outline">{row.domain}</Badge></TableCell>
                  <TableCell><ClassificationBadge classification={row.classification} /></TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{row.contract_status}</Badge></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={row.readiness_score} className="h-1.5 w-16" />
                      <span className="text-xs text-muted-foreground">{row.readiness_score}%</span>
                    </div>
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
