import FIPSubNav from "@/components/admin/FIPSubNav";
import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Plus, Layers, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFeatureSpecs, useCreateSpec } from "@/hooks/use-fip-data";
import { COMPLIANCE_SECTIONS } from "@/lib/fip/types";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
const FIPSpecStudio = () => {
  const { data: specs = [], isLoading } = useFeatureSpecs();
  const createSpec = useCreateSpec();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ feature_id: '', feature_name: '', outcome_statement: '' });

  const handleCreate = () => {
    if (!form.feature_id) return;
    const missing = ([] as any[]).filter(s => s !== 'outcome_statement' || !form.outcome_statement);
    createSpec.mutate({ ...form, missing_sections: missing, completeness_score: form.outcome_statement ? 8 : 0 });
    setShowForm(false);
    setForm({ feature_id: '', feature_name: '', outcome_statement: '' });
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <FIPSubNav />
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="h-6 w-6 text-primary" /> FIP02 — Feature Spec Studio</h1>
            <p className="text-muted-foreground mt-1">Create and edit protocol-compliant feature specifications</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2"><Plus className="h-4 w-4" /> New Spec</Button>
        </div>
      </motion.div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-lg">New Feature Specification</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium">Feature ID</label><Input value={form.feature_id} onChange={e => setForm(p => ({ ...p, feature_id: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Feature Name</label><Input value={form.feature_name} onChange={e => setForm(p => ({ ...p, feature_name: e.target.value }))} /></div>
            </div>
            <div><label className="text-sm font-medium">Outcome Statement</label><Textarea value={form.outcome_statement} onChange={e => setForm(p => ({ ...p, outcome_statement: e.target.value }))} /></div>
            <div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button><Button onClick={handleCreate}>Create Spec</Button></div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{specs.length}</p><p className="text-xs text-muted-foreground">Total Specs</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{specs.filter((s: Record<string, any>) => (s.completeness_score || 0) >= 80).length}</p><p className="text-xs text-muted-foreground">Complete (≥80%)</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{specs.filter((s: Record<string, any>) => (s.completeness_score || 0) < 40).length}</p><p className="text-xs text-muted-foreground">Needs Work (&lt;40%)</p></CardContent></Card>
      </div>

      <div className="space-y-3">
        {isLoading ? <p className="text-center py-8 text-muted-foreground">Loading specs...</p> :
          specs.length === 0 ? <Card><CardContent className="py-12 text-center text-muted-foreground">No feature specs yet. Create one to begin protocol-compliant specification.</CardContent></Card> :
          specs.map((spec: Record<string, any>) => (
            <Card key={spec.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="py-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="font-medium">{spec.feature_name || spec.feature_id}</span>
                    <Badge variant="outline">{spec.status}</Badge>
                    <Badge variant="outline">v{spec.spec_version}</Badge>
                  </div>
                  <span className="text-sm font-bold">{Math.round(spec.completeness_score || 0)}%</span>
                </div>
                <Progress value={spec.completeness_score || 0} className="h-2" />
                {spec.missing_sections?.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {spec.missing_sections.slice(0, 5).map((s: string) => (
                      <Badge key={s} variant="outline" className="text-xs bg-destructive/10 text-destructive">{s.replace(/_/g, ' ')}</Badge>
                    ))}
                    {spec.missing_sections.length > 5 && <Badge variant="outline" className="text-xs">+{spec.missing_sections.length - 5}</Badge>}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
};

export default FIPSpecStudio;
