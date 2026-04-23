import { motion } from "framer-motion";
import { Layers, ArrowRight, Zap, DollarSign, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRoutingPolicies } from "@/hooks/use-sag-data";
import SAGSubNav from "@/components/admin/SAGSubNav";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
const SAGMultiStageExplorer = () => {
  const { data: policies = [] } = useRoutingPolicies();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
<SAGSubNav />
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Layers className="h-6 w-6 text-primary" /> SAG08 — Multi-Stage Route Explorer</h1>
        <p className="text-muted-foreground mt-1">Inspect staged inference paths — premium only where justified</p>
      </motion.div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{([] as any[]).length}</p><p className="text-xs text-muted-foreground">Stage Patterns</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{policies.filter((p: Record<string, any>) => p.fallback_chain?.length > 0).length}</p><p className="text-xs text-muted-foreground">Policies with Fallback Chains</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{policies.filter((p: Record<string, any>) => p.reuse_eligible).length}</p><p className="text-xs text-muted-foreground">Reuse-Eligible Policies</p></CardContent></Card>
      </div>

      <div className="space-y-4">
        {([] as any[]).map((pattern, pi) => (
          <Card key={pi}>
            <CardHeader className="pb-2"><CardTitle className="text-base">{pattern.pattern}</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {pattern.stages.map((stage, si) => (
                  <div key={si} className="flex items-center gap-2">
                    <div className={`p-3 rounded-lg border flex-1 min-w-[160px] ${si === pattern.stages.length - 1 ? 'border-primary/30 bg-primary/5' : 'border-border'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">{stage.label}</span>
                        <Badge variant="outline" className="text-[10px]">{stage.cost}</Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-mono">{stage.model}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{stage.purpose}</p>
                    </div>
                    {si < pattern.stages.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />}
                  </div>
                ))}
              </div>
              <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                <span><DollarSign className="h-3 w-3 inline" /> Total if stage 1 resolves: {pattern.stages[0].cost}</span>
                <span><DollarSign className="h-3 w-3 inline" /> Total if escalated: {pattern.stages.reduce((s, st) => s + parseFloat(st.cost), 0).toFixed(1)}¢</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SAGMultiStageExplorer;
