import { useState } from "react";
import { motion } from "framer-motion";
import { Server, Plus, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useModelRegistry, useCreateModel } from "@/modules/business/hooks/use-sag-data";
import { MODEL_CLASSES, PROVIDERS } from "@/lib/sovereign-ai-gateway/types";
import SAGSubNav from "@/platform/admin/components/admin/SAGSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const SAGModelRegistry = () => {
  const { data: models = [], isLoading } = useModelRegistry();
  const createModel = useCreateModel();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ model_id: '', provider: 'lovable', provider_model_name: '', model_class: 'standard', structured_output_support: false, tool_calling_support: false, context_length: 8192, cost_tier: 'standard', latency_tier: 'standard' });

  const handleCreate = () => {
    if (!form.model_id || !form.provider_model_name) return;
    createModel.mutate(form);
    setShowForm(false);
  };

  const classCounts = MODEL_CLASSES.reduce((a, c) => ({ ...a, [c]: models.filter((m: Record<string, any>) => m.model_class === c).length }), {} as Record<string, number>);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
<SAGSubNav />
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Server className="h-6 w-6 text-primary" /> SAG02 — Model Registry Console</h1>
            <p className="text-muted-foreground mt-1">Canonical catalog of approved AI providers and models</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2"><Plus className="h-4 w-4" /> Register Model</Button>
        </div>
      </motion.div>

      <div className="flex gap-2 flex-wrap">
        {MODEL_CLASSES.map(c => <Badge key={c} variant={classCounts[c] > 0 ? 'default' : 'outline'} className="text-xs">{c}: {classCounts[c] || 0}</Badge>)}
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Register New Model</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div><label className="text-sm font-medium">Model ID</label><Input value={form.model_id} onChange={e => setForm(p => ({ ...p, model_id: e.target.value }))} placeholder="e.g., gemini-3-flash" /></div>
              <div><label className="text-sm font-medium">Provider</label>
                <Select value={form.provider} onValueChange={v => setForm(p => ({ ...p, provider: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{PROVIDERS.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div>
              <div><label className="text-sm font-medium">Provider Model Name</label><Input value={form.provider_model_name} onChange={e => setForm(p => ({ ...p, provider_model_name: e.target.value }))} placeholder="google/gemini-3-flash-preview" /></div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div><label className="text-sm font-medium">Class</label><Select value={form.model_class} onValueChange={v => setForm(p => ({ ...p, model_class: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{MODEL_CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              <div><label className="text-sm font-medium">Cost Tier</label><Select value={form.cost_tier} onValueChange={v => setForm(p => ({ ...p, cost_tier: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['free','utility','standard','premium','enterprise'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
              <div><label className="text-sm font-medium">Latency Tier</label><Select value={form.latency_tier} onValueChange={v => setForm(p => ({ ...p, latency_tier: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['realtime','fast','standard','async','batch'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
              <div><label className="text-sm font-medium">Context Length</label><Input type="number" value={form.context_length} onChange={e => setForm(p => ({ ...p, context_length: parseInt(e.target.value) || 8192 }))} /></div>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2"><Switch checked={form.structured_output_support} onCheckedChange={v => setForm(p => ({ ...p, structured_output_support: v }))} /><span className="text-sm">Structured Output</span></div>
              <div className="flex items-center gap-2"><Switch checked={form.tool_calling_support} onCheckedChange={v => setForm(p => ({ ...p, tool_calling_support: v }))} /><span className="text-sm">Tool Calling</span></div>
            </div>
            <div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button><Button onClick={handleCreate}>Register</Button></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Model ID</TableHead><TableHead>Provider</TableHead><TableHead>Class</TableHead><TableHead>Cost</TableHead><TableHead>Latency</TableHead><TableHead>Context</TableHead><TableHead>Structured</TableHead><TableHead>Tools</TableHead><TableHead>Health</TableHead><TableHead>Stage</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {isLoading ? <TableRow><TableCell colSpan={10} className="text-center py-8">Loading...</TableCell></TableRow> :
                models.length === 0 ? <TableRow><TableCell colSpan={10} className="text-center py-8 text-muted-foreground">No models registered. Register your first model above.</TableCell></TableRow> :
                models.map((m: Record<string, any>) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-mono text-xs">{m.model_id}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{m.provider}</Badge></TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{m.model_class}</Badge></TableCell>
                    <TableCell className="text-xs">{m.cost_tier}</TableCell>
                    <TableCell className="text-xs">{m.latency_tier}</TableCell>
                    <TableCell className="text-xs">{(m.context_length / 1000).toFixed(0)}k</TableCell>
                    <TableCell>{m.structured_output_support ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}</TableCell>
                    <TableCell>{m.tool_calling_support ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}</TableCell>
                    <TableCell><span className={`text-xs font-bold ${(m.health_score || 0) >= 0.9 ? 'text-green-500' : 'text-yellow-500'}`}>{((m.health_score || 0) * 100).toFixed(0)}%</span></TableCell>
                    <TableCell><Badge variant={m.deprecated ? 'destructive' : 'outline'} className="text-xs">{m.deprecated ? 'deprecated' : m.launch_stage}</Badge></TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SAGModelRegistry;
