import FIPSubNav from "@/platform/admin/components/admin/FIPSubNav";
import { motion } from "framer-motion";
import { Zap, ArrowRight, Shield, RotateCcw, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useExecutionPaths } from "@/modules/business/hooks/use-fip-data";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const PathNode = ({ label, value, active }: { label: string; value?: string; active: boolean }) => (
  <div className={`flex flex-col items-center p-2 rounded-lg border ${active ? 'border-primary bg-primary/5' : 'border-border bg-muted/30'}`}>
    <span className="text-[10px] text-muted-foreground uppercase">{label}</span>
    <span className={`text-xs font-medium ${active ? 'text-primary' : 'text-muted-foreground'}`}>{value || '—'}</span>
  </div>
);

const FIPExecutionExplorer = () => {
  const { data: paths = [], isLoading } = useExecutionPaths();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <FIPSubNav />
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Zap className="h-6 w-6 text-primary" /> FIP06 — Execution Path Explorer</h1>
        <p className="text-muted-foreground mt-1">Inspect canonical execution paths for side-effecting features</p>
      </motion.div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{paths.length}</p><p className="text-xs text-muted-foreground">Execution Paths</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold text-green-500">{paths.filter((p: Record<string, any>) => p.replay_safe).length}</p><p className="text-xs text-muted-foreground">Replay Safe</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{paths.filter((p: Record<string, any>) => p.brain_core_involvement).length}</p><p className="text-xs text-muted-foreground">Brain-Core Involved</p></CardContent></Card>
      </div>

      <div className="space-y-4">
        {isLoading ? <p className="text-center py-8 text-muted-foreground">Loading execution paths...</p> :
          paths.length === 0 ? <Card><CardContent className="py-12 text-center text-muted-foreground">No execution paths defined yet. Paths are created when side-effecting features are designed.</CardContent></Card> :
          paths.map((path: Record<string, any>) => (
            <Card key={path.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2"><Zap className="h-4 w-4" />{path.feature_id}</CardTitle>
                  <div className="flex gap-2">
                    {path.replay_safe && <Badge className="bg-green-500/10 text-green-500 text-xs">Replay Safe</Badge>}
                    {path.brain_core_involvement && <Badge className="bg-blue-500/10 text-blue-500 text-xs">Brain-Core</Badge>}
                    <Badge variant="outline">{path.status}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  <PathNode label="Ingress" value={path.ingress_point} active={!!path.ingress_point} />
                  <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <PathNode label="Policy" value={path.policy_decision_point} active={!!path.policy_decision_point} />
                  <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <PathNode label="Capability" value={path.capability_routing_point} active={!!path.capability_routing_point} />
                  <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <PathNode label="Executor" value={path.executor_entry} active={!!path.executor_entry} />
                  <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <PathNode label="Receipt" value={path.receipt_emission_point} active={!!path.receipt_emission_point} />
                  <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <PathNode label="Verify" value={path.verification_point} active={!!path.verification_point} />
                </div>
                <div className="grid grid-cols-3 gap-4 mt-3 text-xs">
                  <div><span className="text-muted-foreground">Idempotency:</span> {path.idempotency_key_source || '—'}</div>
                  <div><span className="text-muted-foreground">Conflict:</span> {path.conflict_behavior || '—'}</div>
                  <div><span className="text-muted-foreground">Rollback:</span> {path.rollback_behavior || '—'}</div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
};

export default FIPExecutionExplorer;
