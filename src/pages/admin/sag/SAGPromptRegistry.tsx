import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Plus, Eye, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { usePromptFamilies, useCreatePromptFamily } from "@/modules/business/hooks/use-sag-data";
import SAGSubNav from "@/platform/admin/components/admin/SAGSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const SAGPromptRegistry = () => {
  const { data: prompts = [], isLoading } = usePromptFamilies();
  const createPrompt = useCreatePromptFamily();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ prompt_family_id: '', name: '', owner: '', domain: '', system_prompt: '', redaction_strategy: 'none', hallucination_containment: 'standard', cost_profile: 'standard', max_context_tokens: 4096 });

  const handleCreate = () => {
    if (!form.prompt_family_id || !form.name || !form.owner) return;
    createPrompt.mutate(form);
    setShowForm(false);
    setForm({ prompt_family_id: '', name: '', owner: '', domain: '', system_prompt: '', redaction_strategy: 'none', hallucination_containment: 'standard', cost_profile: 'standard', max_context_tokens: 4096 });
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
<SAGSubNav />
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><MessageSquare className="h-6 w-6 text-primary" /> SAG05 — Prompt Registry Studio</h1>
            <p className="text-muted-foreground mt-1">Govern prompt families — no ungoverned prompts in random files</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2"><Plus className="h-4 w-4" /> New Prompt Family</Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{prompts.length}</p><p className="text-xs text-muted-foreground">Prompt Families</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{prompts.filter((p: Record<string, any>) => p.output_schema).length}</p><p className="text-xs text-muted-foreground">With Schema</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{prompts.filter((p: Record<string, any>) => p.redaction_strategy !== 'none').length}</p><p className="text-xs text-muted-foreground">With Redaction</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold text-destructive">{prompts.filter((p: Record<string, any>) => p.deprecated).length}</p><p className="text-xs text-muted-foreground">Deprecated</p></CardContent></Card>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-lg">New Prompt Family</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div><label className="text-sm font-medium">Prompt Family ID</label><Input value={form.prompt_family_id} onChange={e => setForm(p => ({ ...p, prompt_family_id: e.target.value }))} placeholder="e.g., advisor.financial-summary" /></div>
              <div><label className="text-sm font-medium">Name</label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Owner</label><Input value={form.owner} onChange={e => setForm(p => ({ ...p, owner: e.target.value }))} placeholder="e.g., finance-os/advisor" /></div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div><label className="text-sm font-medium">Domain</label><Input value={form.domain} onChange={e => setForm(p => ({ ...p, domain: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Redaction</label><Select value={form.redaction_strategy} onValueChange={v => setForm(p => ({ ...p, redaction_strategy: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['none','pii','financial','full'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
              <div><label className="text-sm font-medium">Hallucination</label><Select value={form.hallucination_containment} onValueChange={v => setForm(p => ({ ...p, hallucination_containment: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['none','standard','strict','deterministic_only'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
              <div><label className="text-sm font-medium">Cost Profile</label><Select value={form.cost_profile} onValueChange={v => setForm(p => ({ ...p, cost_profile: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['free','utility','standard','premium'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div><label className="text-sm font-medium">System Prompt</label><Textarea value={form.system_prompt} onChange={e => setForm(p => ({ ...p, system_prompt: e.target.value }))} rows={4} /></div>
            <div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button><Button onClick={handleCreate}>Create</Button></div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {isLoading ? <p className="text-center py-8 text-muted-foreground">Loading...</p> :
          prompts.length === 0 ? <Card><CardContent className="py-12 text-center text-muted-foreground">No prompt families registered. All AI tasks must reference canonical prompt families.</CardContent></Card> :
          prompts.map((p: Record<string, any>) => (
            <Card key={p.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <span className="font-medium">{p.name}</span>
                    <span className="text-xs text-muted-foreground font-mono">{p.prompt_family_id}</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">v{p.version}</Badge>
                    {p.redaction_strategy !== 'none' && <Badge className="bg-yellow-500/10 text-yellow-500 text-xs"><Lock className="h-3 w-3 mr-1" />{p.redaction_strategy}</Badge>}
                    <Badge variant="outline" className="text-xs">{p.cost_profile}</Badge>
                    {p.deprecated && <Badge variant="destructive" className="text-xs">Deprecated</Badge>}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">Owner: {p.owner} · Domain: {p.domain || '—'} · Context: {p.max_context_tokens} tokens</div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
};

export default SAGPromptRegistry;
