import FIPSubNav from "@/platform/admin/components/admin/FIPSubNav";
import { motion } from "framer-motion";
import { GraduationCap, CheckCircle2, XCircle, ArrowRight, Shield, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useReadinessGates } from "@/hooks/use-fip-data";
import { READINESS_STAGES, RED_TEAM_QUESTIONS } from "@/lib/fip/types";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const stageIndex = (stage: string) => READINESS_STAGES.indexOf(stage as never);

const FIPReadinessGateReview = () => {
  const { data: gates = [], isLoading } = useReadinessGates();

  const stageDistribution = READINESS_STAGES.map(s => ({ stage: s, count: gates.filter((g: Record<string, any>) => g.current_stage === s).length }));

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <FIPSubNav />
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold flex items-center gap-2"><GraduationCap className="h-6 w-6 text-primary" /> FIP12 — Readiness Gate Review</h1>
        <p className="text-muted-foreground mt-1">Evaluate stage progression with required evidence</p>
      </motion.div>

      <Card>
        <CardHeader><CardTitle className="text-base">Stage Progression</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-1">
            {stageDistribution.map((s, i) => (
              <div key={s.stage} className="flex-1 text-center">
                <div className={`h-8 rounded-t flex items-center justify-center text-xs font-bold ${s.count > 0 ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>{s.count}</div>
                <div className="text-[9px] text-muted-foreground mt-1 truncate">{s.stage.replace('-', '\n')}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{gates.length}</p><p className="text-xs text-muted-foreground">Total Features</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold text-green-500">{gates.filter((g: Record<string, any>) => g.support_signoff).length}</p><p className="text-xs text-muted-foreground">Support Signed Off</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold text-destructive">{gates.filter((g: Record<string, any>) => g.missing_evidence?.length > 0).length}</p><p className="text-xs text-muted-foreground">Missing Evidence</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4" /> Red-Team Questions</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {RED_TEAM_QUESTIONS.map((q, i) => (
            <div key={i} className="flex items-center gap-2 py-1 border-b last:border-0">
              <AlertTriangle className="h-3 w-3 text-yellow-500 flex-shrink-0" />
              <span className="text-sm">{q}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="space-y-3">
        {isLoading ? <p className="text-center py-8 text-muted-foreground">Loading...</p> :
          gates.length === 0 ? <Card><CardContent className="py-12 text-center text-muted-foreground">No readiness gates configured. Gates are created when features enter protocol compliance.</CardContent></Card> :
          gates.map((g: Record<string, any>) => {
            const progress = ((stageIndex(g.current_stage) + 1) / READINESS_STAGES.length) * 100;
            return (
              <Card key={g.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{g.feature_id}</span>
                    <div className="flex gap-2">
                      <Badge variant="outline">{g.current_stage}</Badge>
                      <Badge variant={g.support_signoff ? 'default' : 'outline'} className="text-xs">{g.support_signoff ? 'Signed Off' : 'Pending'}</Badge>
                      <Badge variant="outline" className="text-xs">{g.launch_honesty_risk}</Badge>
                    </div>
                  </div>
                  <Progress value={progress} className="h-2" />
                  {g.missing_evidence?.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">{g.missing_evidence.map((e: string) => <Badge key={e} variant="outline" className="text-xs bg-destructive/10 text-destructive">{e}</Badge>)}</div>
                  )}
                </CardContent>
              </Card>
            );
          })}
      </div>
    </div>
  );
};

export default FIPReadinessGateReview;
