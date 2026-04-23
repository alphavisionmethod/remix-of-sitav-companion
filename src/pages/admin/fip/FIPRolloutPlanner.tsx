import FIPSubNav from "@/components/admin/FIPSubNav";
import { motion } from "framer-motion";
import { Rocket, Flag, Power, RotateCcw, ArrowUpRight, Shield, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRolloutRecords } from "@/hooks/use-fip-data";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
const ringColors: Record<string, string> = {
  dev: 'bg-muted text-muted-foreground', staging: 'bg-blue-500/10 text-blue-500',
  'internal-shadow': 'bg-purple-500/10 text-purple-500', 'internal-real': 'bg-indigo-500/10 text-indigo-500',
  'limited-tenant': 'bg-yellow-500/10 text-yellow-500', premium: 'bg-orange-500/10 text-orange-500',
  ga: 'bg-green-500/10 text-green-500',
};

const FIPRolloutPlanner = () => {
  const { data: rollouts = [], isLoading } = useRolloutRecords();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <FIPSubNav />
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Rocket className="h-6 w-6 text-primary" /> FIP10 — Rollout & Kill-Switch Planner</h1>
        <p className="text-muted-foreground mt-1">Plan rollout progressions and recovery strategies</p>
      </motion.div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{rollouts.length}</p><p className="text-xs text-muted-foreground">Rollout Plans</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{rollouts.filter((r: Record<string, any>) => r.current_ring === 'ga').length}</p><p className="text-xs text-muted-foreground">At GA</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{rollouts.filter((r: Record<string, any>) => r.current_ring === 'dev').length}</p><p className="text-xs text-muted-foreground">In Dev</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{rollouts.filter((r: Record<string, any>) => r.kill_switch_class === 'full-workflow-disabled').length}</p><p className="text-xs text-muted-foreground">Full Kill-Switch</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Rollout Ring Distribution</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {([] as any[]).map(ring => {
              const count = rollouts.filter((r: Record<string, any>) => r.current_ring === ring).length;
              return (
                <div key={ring} className={`flex-1 text-center p-3 rounded-lg border ${count > 0 ? 'border-primary/30' : ''}`}>
                  <p className="text-lg font-bold">{count}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">{ring}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {isLoading ? <p className="text-center py-8 text-muted-foreground">Loading...</p> :
          rollouts.length === 0 ? <Card><CardContent className="py-12 text-center text-muted-foreground">No rollout plans yet. Plans are created during feature rollout design.</CardContent></Card> :
          rollouts.map((r: Record<string, any>) => (
            <Card key={r.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flag className="h-4 w-4 text-primary" />
                    <span className="font-medium">{r.feature_id}</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={ringColors[r.current_ring] || 'bg-muted'}>{r.current_ring}</Badge>
                    <Badge variant="outline" className="text-xs"><Power className="h-3 w-3 mr-1" />{r.kill_switch_class}</Badge>
                    <Badge variant="outline">{r.status}</Badge>
                  </div>
                </div>
                {r.rollback_steps?.length > 0 && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><RotateCcw className="h-3 w-3" /> {r.rollback_steps.length} rollback steps</div>
                )}
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
};

export default FIPRolloutPlanner;
