import { useAction } from "@/hooks/use-action";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { motion } from "framer-motion";
import { Zap, AlertTriangle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { analyzeChangeImpact, type ChangeProposal } from "@/lib/delivery-methodology/change-impact-analyzer";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const ChangeImpactAnalyzer = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ title: "", changeType: "feature", domains: "", featureIds: "", description: "" });
  const [analysis, setAnalysis] = useState<ReturnType<typeof analyzeChangeImpact> | null>(null);

  const { data: records } = useQuery({
    queryKey: ["change-impact-records"],
    queryFn: async () => {
      const { data } = await fromTable("change_impact_records").select("*").order("created_at", { ascending: false }).limit(20);
      return data ?? [];
    },
  });

  const handleAnalyze = () => {
    const proposal: ChangeProposal = {
      title: form.title, changeType: form.changeType as never,
      affectedDomains: form.domains.split(",").map(s => s.trim()).filter(Boolean),
      affectedFeatureIds: form.featureIds.split(",").map(s => s.trim()).filter(Boolean),
      description: form.description,
    };
    setAnalysis(analyzeChangeImpact(proposal));
  };

  const saveMutation = useAction("admin", "settings.save", {
    successMessage: "Impact analysis saved",
    invalidateKeys: [["change-impact-records"]],
  });

  const severityColor = { low: "text-green-400", medium: "text-amber-400", high: "text-orange-400", critical: "text-red-400" };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <Zap className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Change Impact Analyzer</h1>
        </div>
        <p className="text-muted-foreground">Determine blast radius of proposed changes before execution</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Propose Change</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Change title" />
            <Select value={form.changeType} onValueChange={v => setForm({ ...form, changeType: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["feature","refactor","migration","schema","policy","deprecation"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
            </Select>
            <Input value={form.domains} onChange={e => setForm({ ...form, domains: e.target.value })} placeholder="Affected domains (comma-separated)" />
            <Input value={form.featureIds} onChange={e => setForm({ ...form, featureIds: e.target.value })} placeholder="Affected feature IDs (comma-separated)" />
            <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description..." />
            <Button onClick={handleAnalyze} disabled={!form.title} className="w-full">Analyze Impact</Button>
          </CardContent>
        </Card>

        {analysis && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className={`h-5 w-5 ${severityColor[analysis.severity]}`} />
                  Impact: <span className={severityColor[analysis.severity]}>{analysis.severity.toUpperCase()}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysis.affectedRoutes.length > 0 && <div><div className="text-xs font-semibold mb-1">Affected Routes</div><div className="flex flex-wrap gap-1">{analysis.affectedRoutes.map(r => <Badge key={r} variant="outline" className="text-xs">{r}</Badge>)}</div></div>}
                {analysis.migrationRisks.length > 0 && <div><div className="text-xs font-semibold mb-1">Migration Risks</div>{analysis.migrationRisks.map((r, i) => <div key={i} className="text-xs text-muted-foreground">⚠️ {r.risk}</div>)}</div>}
                {analysis.trustRisks.length > 0 && <div><div className="text-xs font-semibold mb-1">Trust Risks</div>{analysis.trustRisks.map((r, i) => <div key={i} className="text-xs text-red-400">🛡️ {r.risk}</div>)}</div>}
                {analysis.recommendations.length > 0 && <div><div className="text-xs font-semibold mb-1">Recommendations</div>{analysis.recommendations.map((r, i) => <div key={i} className="text-xs text-muted-foreground flex items-center gap-1"><ArrowRight className="h-3 w-3" /> {r}</div>)}</div>}
                <Button onClick={() => saveMutation.mutate({})} size="sm" variant="secondary" className="w-full">Save Analysis</Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {(records ?? []).length > 0 && (
        <Card>
          <CardHeader><CardTitle>Recent Impact Analyses</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(records ?? []).map((r: Record<string, any>) => (
                <div key={r.id} className="flex items-center justify-between p-2 rounded border">
                  <span className="text-sm">{r.change_title}</span>
                  <div className="flex gap-2">
                    <Badge variant="outline">{r.change_type}</Badge>
                    <Badge className={r.severity === "critical" ? "bg-red-500/20" : r.severity === "high" ? "bg-orange-500/20" : "bg-muted"}>{r.severity}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ChangeImpactAnalyzer;
