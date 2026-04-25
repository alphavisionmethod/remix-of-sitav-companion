import { useState } from "react";
import { motion } from "framer-motion";
import { GitBranch, Plus, Shield, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useRoutingPolicies, useCreateRoutingPolicy } from "@/hooks/use-sag-data";
import { TASK_CLASSES } from "@/lib/sovereign-ai-gateway/types";
import SAGSubNav from "@/platform/admin/components/admin/SAGSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const SAGRoutingPolicy = () => {
  const { data: policies = [], isLoading } = useRoutingPolicies();
  const createPolicy = useCreateRoutingPolicy();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ capability_id: '', task_class: 'general', default_provider: '', default_model: '', fallback_provider: '', fallback_model: '', budget_class: 'standard', verification_policy: 'none', async_eligible: false, structured_output_required: false, reuse_eligible: true, max_cost_cents: 100 });

  const handleCreate = () => {
    if (!form.capability_id) return;
    createPolicy.mutate(form);
    setShowForm(false);
    setForm({ capability_id: '', task_class: 'general', default_provider: '', default_model: '', fallback_provider: '', fallback_model: '', budget_class: 'standard', verification_policy: 'none', async_eligible: false, structured_output_required: false, reuse_eligible: true, max_cost_cents: 100 });
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
<SAGSubNav />
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><GitBranch className="h-6 w-6 text-primary" /> SAG03 — Capability Routing Policy Board</h1>
            <p className="text-muted-foreground mt-1">Inspect how capabilities map to models and routes</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2"><Plus className="h-4 w-4" /> Add Policy</Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{policies.length}</p><p className="text-xs text-muted-foreground">Routing Policies</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{policies.filter((p: Record<string, any>) => p.async_eligible).length}</p><p className="text-xs text-muted-foreground">Async Eligible</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{policies.filter((p: Record<string, any>) => p.reuse_eligible).length}</p><p className="text-xs text-muted-foreground">Reuse Eligible</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{policies.filter((p: Record<string, any>) => p.verification_policy !== 'none').length}</p><p className="text-xs text-muted-foreground">With Verification</p></CardContent></Card>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-lg">New Routing Policy</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div><label className="text-sm font-medium">Capability ID</label><Input value={form.capability_id} onChange={e => setForm(p => ({ ...p, capability_id: e.target.value }))} placeholder="e.g., advisor.summarize" /></div>
              <div><label className="text-sm font-medium">Task Class</label><Select value={form.task_class} onValueChange={v => setForm(p => ({ ...p, task_class: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TASK_CLASSES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
              <div><label className="text-sm font-medium">Budget Class</label><Select value={form.budget_class} onValueChange={v => setForm(p => ({ ...p, budget_class: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['free','utility','standard','premium','enterprise'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div><label className="text-sm font-medium">Default Provider</label><Input value={form.default_provider} onChange={e => setForm(p => ({ ...p, default_provider: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Default Model</label><Input value={form.default_model} onChange={e => setForm(p => ({ ...p, default_model: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Fallback Provider</label><Input value={form.fallback_provider} onChange={e => setForm(p => ({ ...p, fallback_provider: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Fallback Model</label><Input value={form.fallback_model} onChange={e => setForm(p => ({ ...p, fallback_model: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="text-sm font-medium">Verification</label><Select value={form.verification_policy} onValueChange={v => setForm(p => ({ ...p, verification_policy: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['none','schema_only','deterministic_check','cross_model','human_review'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
              <div><label className="text-sm font-medium">Max Cost (¢)</label><Input type="number" value={form.max_cost_cents} onChange={e => setForm(p => ({ ...p, max_cost_cents: parseInt(e.target.value) || 100 }))} /></div>
              <div className="flex gap-4 items-end pb-2">
                <div className="flex items-center gap-2"><Switch checked={form.async_eligible} onCheckedChange={v => setForm(p => ({ ...p, async_eligible: v }))} /><span className="text-sm">Async</span></div>
                <div className="flex items-center gap-2"><Switch checked={form.reuse_eligible} onCheckedChange={v => setForm(p => ({ ...p, reuse_eligible: v }))} /><span className="text-sm">Reuse</span></div>
              </div>
            </div>
            <div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button><Button onClick={handleCreate}>Create Policy</Button></div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {isLoading ? <p className="text-center py-8 text-muted-foreground">Loading...</p> :
          policies.length === 0 ? <Card><CardContent className="py-12 text-center text-muted-foreground">No routing policies yet. Define how capabilities map to models.</CardContent></Card> :
          policies.map((p: Record<string, any>) => (
            <Card key={p.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-primary" />
                    <span className="font-medium font-mono text-sm">{p.capability_id}</span>
                    <Badge variant="outline" className="text-xs">{p.task_class}</Badge>
                  </div>
                  <div className="flex gap-2">
                    {p.async_eligible && <Badge className="bg-blue-500/10 text-blue-500 text-xs">Async</Badge>}
                    {p.reuse_eligible && <Badge className="bg-green-500/10 text-green-500 text-xs">Reuse</Badge>}
                    <Badge variant="outline" className="text-xs">{p.verification_policy}</Badge>
                    <Badge variant="outline" className="text-xs">{p.budget_class}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2 text-xs text-muted-foreground">
                  <div>Default: {p.default_provider || '—'}/{p.default_model || '—'}</div>
                  <div>Fallback: {p.fallback_provider || '—'}/{p.fallback_model || '—'}</div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
};

export default SAGRoutingPolicy;
