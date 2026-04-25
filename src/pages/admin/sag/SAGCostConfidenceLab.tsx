import { motion } from "framer-motion";
import { LineChart, TrendingUp, Target, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useTaskRequests } from "@/hooks/use-sag-data";
import SAGSubNav from "@/platform/admin/components/admin/SAGSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { NeedsDataExplainer } from "@/components/primitives/feedback/NeedsDataExplainer";



const SAGCostConfidenceLab = () => {
  const { data: tasks = [] } = useTaskRequests();

  const withConfidence = tasks.filter((t: Record<string, any>) => t.verification_confidence != null);
  const avgConfidence = withConfidence.length ? withConfidence.reduce((s: number,  t: Record<string, any>) => s + t.verification_confidence, 0) / withConfidence.length : 0;
  const avgCost = tasks.length ? tasks.reduce((s: number,  t: Record<string, any>) => s + (t.cost_actual_cents || 0), 0) / tasks.length : 0;

  const costBuckets = [
    { label: '0-1¢', tasks: tasks.filter((t: Record<string, any>) => (t.cost_actual_cents || 0) <= 1) },
    { label: '1-5¢', tasks: tasks.filter((t: Record<string, any>) => (t.cost_actual_cents || 0) > 1 && (t.cost_actual_cents || 0) <= 5) },
    { label: '5-25¢', tasks: tasks.filter((t: Record<string, any>) => (t.cost_actual_cents || 0) > 5 && (t.cost_actual_cents || 0) <= 25) },
    { label: '25-100¢', tasks: tasks.filter((t: Record<string, any>) => (t.cost_actual_cents || 0) > 25 && (t.cost_actual_cents || 0) <= 100) },
    { label: '100¢+', tasks: tasks.filter((t: Record<string, any>) => (t.cost_actual_cents || 0) > 100) },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
<SAGSubNav />
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold flex items-center gap-2"><LineChart className="h-6 w-6 text-primary" /> SAG07 — Cost-to-Confidence Lab</h1>
        <p className="text-muted-foreground mt-1">Inspect diminishing returns and quality curves</p>
      </motion.div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{avgCost.toFixed(1)}¢</p><p className="text-xs text-muted-foreground">Avg Cost/Task</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{(avgConfidence * 100).toFixed(0)}%</p><p className="text-xs text-muted-foreground">Avg Confidence</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{withConfidence.length}</p><p className="text-xs text-muted-foreground">Verified Tasks</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{costBuckets[4].tasks.length}</p><p className="text-xs text-muted-foreground">High-Cost Tasks</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Cost Distribution</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {costBuckets.map(b => (
              <div key={b.label} className="flex-1 text-center p-3 rounded-lg border">
                <p className="text-lg font-bold">{b.tasks.length}</p>
                <p className="text-[10px] text-muted-foreground">{b.label}</p>
                {b.tasks.length > 0 && (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Avg conf: {b.tasks.filter((t: Record<string, any>) => t.verification_confidence != null).length > 0 ?
                      (b.tasks.filter((t: Record<string, any>) => t.verification_confidence != null).reduce((s: number,  t: Record<string, any>) => s + t.verification_confidence, 0) /
                       b.tasks.filter((t: Record<string, any>) => t.verification_confidence != null).length * 100).toFixed(0) + '%' : '—'}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Quality Floor Thresholds</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Classification', floor: 0.95, current: avgConfidence || 0.95 },
              { label: 'Summarization', floor: 0.85, current: avgConfidence || 0.85 },
              { label: 'Recommendation', floor: 0.80, current: avgConfidence || 0.80 },
              { label: 'Strategic Synthesis', floor: 0.90, current: avgConfidence || 0.90 },
              { label: 'Drafting', floor: 0.75, current: avgConfidence || 0.75 },
            ].map(q => (
              <div key={q.label} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{q.label}</span>
                  <span className={q.current >= q.floor ? 'text-green-500' : 'text-destructive'}>{(q.current * 100).toFixed(0)}% / {(q.floor * 100).toFixed(0)}%</span>
                </div>
                <Progress value={q.current * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-yellow-500" /> Diminishing Returns Warnings</CardTitle></CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <NeedsDataExplainer
                title="No diminishing-returns warnings yet"
                description="Warnings appear when premium models are used for tasks where cheaper models achieve similar confidence. Run more graded tasks to populate this surface."
                icon={AlertTriangle}
                tip="Tip — once 20+ tasks have completed, the route payback ratio chart becomes meaningful."
              />
            ) :
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Continuously monitors cost-to-confidence curves</p>
                <p>• Flags premium overuse when utility models suffice</p>
                <p>• Identifies ideal stopping points for multi-stage routes</p>
                <p>• Tracks route payback ratios per capability</p>
              </div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SAGCostConfidenceLab;
