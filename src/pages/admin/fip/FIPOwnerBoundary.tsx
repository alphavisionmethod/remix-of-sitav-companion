import FIPSubNav from "@/platform/admin/components/admin/FIPSubNav";
import { motion } from "framer-motion";
import { Users, AlertTriangle, CheckCircle2, Shield, GitBranch } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOwnerDecisions } from "@/hooks/use-fip-data";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const riskBadge = (risk: boolean, label: string) => risk ? <Badge variant="destructive" className="text-xs">{label}</Badge> : null;

const FIPOwnerBoundary = () => {
  const { data: decisions = [], isLoading } = useOwnerDecisions();

  const risks = {
    secondBrain: decisions.filter((d: Record<string, any>) => d.second_brain_risk).length,
    moduleDrift: decisions.filter((d: Record<string, any>) => d.module_drift_risk).length,
    unsupportedRoot: decisions.filter((d: Record<string, any>) => d.unsupported_root_risk).length,
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <FIPSubNav />
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="h-6 w-6 text-primary" /> FIP03 — Owner Boundary Console</h1>
        <p className="text-muted-foreground mt-1">Enforce owner correctness and smallest-correct-owner rule</p>
      </motion.div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{decisions.length}</p><p className="text-xs text-muted-foreground">Total Decisions</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold text-destructive">{risks.secondBrain}</p><p className="text-xs text-muted-foreground">Second Brain Risk</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold text-yellow-500">{risks.moduleDrift}</p><p className="text-xs text-muted-foreground">Module Drift Risk</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold text-orange-500">{risks.unsupportedRoot}</p><p className="text-xs text-muted-foreground">Unsupported Root</p></CardContent></Card>
      </div>

      <div className="space-y-3">
        {isLoading ? <p className="text-center py-8 text-muted-foreground">Loading owner decisions...</p> :
          decisions.length === 0 ? <Card><CardContent className="py-12 text-center text-muted-foreground">No owner boundary decisions recorded. Decisions are created during feature intake.</CardContent></Card> :
          decisions.map((d: Record<string, any>) => (
            <Card key={d.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GitBranch className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium">{d.feature_id}</p>
                      <p className="text-xs text-muted-foreground">Primary: {d.primary_owner} · Smallest: {d.smallest_correct_owner || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{d.recommendation?.replace(/_/g, ' ')}</Badge>
                    <Badge className={d.decision_status === 'approved' ? 'bg-green-500/10 text-green-500' : 'bg-muted'}>{d.decision_status}</Badge>
                    {riskBadge(d.second_brain_risk, '2nd Brain')}
                    {riskBadge(d.module_drift_risk, 'Drift')}
                    {riskBadge(d.unsupported_root_risk, 'Bad Root')}
                  </div>
                </div>
                {d.owner_rationale && <p className="text-sm text-muted-foreground mt-2">{d.owner_rationale}</p>}
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
};

export default FIPOwnerBoundary;
