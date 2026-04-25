import FIPSubNav from "@/platform/admin/components/admin/FIPSubNav";
import { useState } from "react";
import { motion } from "framer-motion";
import { Package, Plus, ArrowRight, Target, Shield, Layers, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useFeatureIntakes, useCreateIntake } from "@/hooks/use-fip-data";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  submitted: 'bg-blue-500/10 text-blue-500',
  reviewing: 'bg-yellow-500/10 text-yellow-500',
  approved: 'bg-green-500/10 text-green-500',
  rejected: 'bg-destructive/10 text-destructive',
};

const FIPIntakeDesk = () => {
  const { data: intakes = [], isLoading } = useFeatureIntakes();
  const createIntake = useCreateIntake();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    feature_id: '', feature_name: '', feature_type: 'greenfield', wedge_priority: 'medium',
    outcome_statement: '', primary_owner: '', owner_rationale: '', why_not_elsewhere: '',
    risk_tier: 'standard', autonomy_tier: 'observe', trust_bearing: false,
    support_owner: '', product_owner: '', engineering_owner: '',
    launch_intent: 'internal', affected_domains: [] as string[],
  });

  const handleSubmit = () => {
    if (!form.feature_id || !form.feature_name) { toast.error('Feature ID and name are required'); return; }
    createIntake.mutate({ ...form, intake_status: 'submitted', completeness_score: calculateScore() });
    setShowForm(false);
    setForm({ feature_id: '', feature_name: '', feature_type: 'greenfield', wedge_priority: 'medium', outcome_statement: '', primary_owner: '', owner_rationale: '', why_not_elsewhere: '', risk_tier: 'standard', autonomy_tier: 'observe', trust_bearing: false, support_owner: '', product_owner: '', engineering_owner: '', launch_intent: 'internal', affected_domains: [] });
  };

  const calculateScore = () => {
    let score = 0;
    if (form.feature_id) score += 10;
    if (form.feature_name) score += 10;
    if (form.outcome_statement) score += 15;
    if (form.primary_owner) score += 15;
    if (form.owner_rationale) score += 10;
    if (form.why_not_elsewhere) score += 10;
    if (form.support_owner) score += 10;
    if (form.product_owner) score += 10;
    if (form.engineering_owner) score += 10;
    return score;
  };

  const stats = {
    total: intakes.length,
    draft: intakes.filter((i: Record<string, any>) => i.intake_status === 'draft').length,
    submitted: intakes.filter((i: Record<string, any>) => i.intake_status === 'submitted').length,
    approved: intakes.filter((i: Record<string, any>) => i.intake_status === 'approved').length,
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <FIPSubNav />
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Package className="h-6 w-6 text-primary" /> FIP01 — Feature Intake Desk</h1>
            <p className="text-muted-foreground mt-1">Normalize all feature requests into canonical intake protocol</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2"><Plus className="h-4 w-4" /> New Intake</Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-4 gap-4">
        {[{ label: 'Total Intakes', value: stats.total, icon: Package }, { label: 'Draft', value: stats.draft, icon: Clock }, { label: 'Submitted', value: stats.submitted, icon: ArrowRight }, { label: 'Approved', value: stats.approved, icon: CheckCircle2 }].map((s, i) => (
          <Card key={i}><CardContent className="pt-4 flex items-center gap-3"><s.icon className="h-5 w-5 text-muted-foreground" /><div><p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div></CardContent></Card>
        ))}
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <Card>
            <CardHeader><CardTitle className="text-lg">Feature Intake Form — Protocol Questions</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium">Feature ID *</label><Input value={form.feature_id} onChange={e => setForm(p => ({ ...p, feature_id: e.target.value }))} placeholder="e.g., invoice-auto-collections" /></div>
                <div><label className="text-sm font-medium">Feature Name *</label><Input value={form.feature_name} onChange={e => setForm(p => ({ ...p, feature_name: e.target.value }))} placeholder="e.g., Invoice Auto-Collections" /></div>
              </div>
              <div><label className="text-sm font-medium">Outcome Statement — What user/operator outcome improves?</label><Textarea value={form.outcome_statement} onChange={e => setForm(p => ({ ...p, outcome_statement: e.target.value }))} placeholder="Describe the measurable outcome..." /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="text-sm font-medium">Feature Type</label>
                  <Select value={form.feature_type} onValueChange={v => setForm(p => ({ ...p, feature_type: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['greenfield','extension','refactor','pack','simulation','connector','workflow','advisor','admin-tool'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
                <div><label className="text-sm font-medium">Wedge Priority</label>
                  <Select value={form.wedge_priority} onValueChange={v => setForm(p => ({ ...p, wedge_priority: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['critical','high','medium','low','deferred'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
                <div><label className="text-sm font-medium">Risk Tier</label>
                  <Select value={form.risk_tier} onValueChange={v => setForm(p => ({ ...p, risk_tier: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['standard','elevated','critical'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium">Primary Owner Boundary</label><Input value={form.primary_owner} onChange={e => setForm(p => ({ ...p, primary_owner: e.target.value }))} placeholder="e.g., business-os/revenue" /></div>
                <div><label className="text-sm font-medium">Owner Rationale</label><Input value={form.owner_rationale} onChange={e => setForm(p => ({ ...p, owner_rationale: e.target.value }))} placeholder="Why this owner is correct" /></div>
              </div>
              <div><label className="text-sm font-medium">Why does this NOT belong elsewhere?</label><Textarea value={form.why_not_elsewhere} onChange={e => setForm(p => ({ ...p, why_not_elsewhere: e.target.value }))} /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="text-sm font-medium">Product Owner</label><Input value={form.product_owner} onChange={e => setForm(p => ({ ...p, product_owner: e.target.value }))} /></div>
                <div><label className="text-sm font-medium">Engineering Owner</label><Input value={form.engineering_owner} onChange={e => setForm(p => ({ ...p, engineering_owner: e.target.value }))} /></div>
                <div><label className="text-sm font-medium">Support Owner</label><Input value={form.support_owner} onChange={e => setForm(p => ({ ...p, support_owner: e.target.value }))} /></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2"><Switch checked={form.trust_bearing} onCheckedChange={v => setForm(p => ({ ...p, trust_bearing: v }))} /><span className="text-sm">Trust-bearing feature</span></div>
                <Select value={form.launch_intent} onValueChange={v => setForm(p => ({ ...p, launch_intent: v }))}><SelectTrigger className="w-48"><SelectValue /></SelectTrigger><SelectContent>{['internal','beta','production','deferred'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="text-sm text-muted-foreground">Completeness: <span className="font-bold text-primary">{calculateScore()}%</span></div>
                <div className="flex gap-2"><Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button><Button onClick={handleSubmit} disabled={createIntake.isPending}>Submit Intake</Button></div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Tabs defaultValue="all">
        <TabsList><TabsTrigger value="all">All</TabsTrigger><TabsTrigger value="draft">Draft</TabsTrigger><TabsTrigger value="submitted">Submitted</TabsTrigger><TabsTrigger value="approved">Approved</TabsTrigger></TabsList>
        <TabsContent value="all" className="space-y-3 mt-4">
          {isLoading ? <div className="text-center py-8 text-muted-foreground">Loading intakes...</div> :
            intakes.length === 0 ? <Card><CardContent className="py-12 text-center text-muted-foreground">No feature intakes yet. Click "New Intake" to begin.</CardContent></Card> :
            intakes.map((intake: Record<string, any>) => (
              <Card key={intake.id} className="hover:border-primary/30 transition-colors">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{intake.feature_name}</p>
                        <p className="text-xs text-muted-foreground">{intake.feature_id} · {intake.feature_type} · {intake.primary_owner || 'No owner'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{intake.risk_tier}</Badge>
                      {intake.trust_bearing && <Badge variant="destructive" className="text-xs"><Shield className="h-3 w-3 mr-1" />Trust</Badge>}
                      <Badge className={statusColors[intake.intake_status] || ''}>{intake.intake_status}</Badge>
                      <span className="text-xs text-muted-foreground ml-2">{Math.round(intake.completeness_score || 0)}%</span>
                    </div>
                  </div>
                  {intake.outcome_statement && <p className="text-sm text-muted-foreground mt-2 line-clamp-1">{intake.outcome_statement}</p>}
                </CardContent>
              </Card>
            ))}
        </TabsContent>
        {['draft', 'submitted', 'approved'].map(status => (
          <TabsContent key={status} value={status} className="space-y-3 mt-4">
            {intakes.filter((i: Record<string, any>) => i.intake_status === status).map((intake: Record<string, any>) => (
              <Card key={intake.id}><CardContent className="py-4"><div className="flex items-center gap-3"><Target className="h-4 w-4 text-primary" /><span className="font-medium">{intake.feature_name}</span><Badge variant="outline">{intake.risk_tier}</Badge></div></CardContent></Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default FIPIntakeDesk;
