import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { motion } from "framer-motion";
import { Layers, Calendar, Target, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const statusColors: Record<string, string> = {
  planning: "bg-blue-500/20 text-blue-400",
  active: "bg-green-500/20 text-green-400",
  completed: "bg-emerald-500/20 text-emerald-400",
  paused: "bg-amber-500/20 text-amber-400",
};

const DeliveryWavePlanner = () => {
  const { data: waves } = useQuery({
    queryKey: ["delivery-waves"],
    queryFn: async () => {
      const { data } = await fromTable("delivery_waves").select("*").order("wave_number", { ascending: true }).limit(20);
      return data ?? [];
    },
  });

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <Layers className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Delivery Wave Planner</h1>
        </div>
        <p className="text-muted-foreground">Batch feature work into coordinated delivery waves by domain, dependency, and launch impact</p>
      </motion.div>

      <div className="space-y-4">
        {(waves ?? []).map((wave: Record<string, any>) => {
          const featureCount = Array.isArray(wave.feature_ids) ? wave.feature_ids.length : 0;
          const domainFocus = Array.isArray(wave.domain_focus) ? wave.domain_focus : [];
          return (
            <motion.div key={wave.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-lg font-bold">W{wave.wave_number}</Badge>
                      <span>{wave.wave_name}</span>
                    </div>
                    <Badge className={statusColors[wave.status] ?? "bg-muted"}>{wave.status}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1"><Target className="h-4 w-4" /> {featureCount} features</div>
                    <div className="flex items-center gap-1"><Layers className="h-4 w-4" /> {wave.launch_impact} impact</div>
                    {wave.target_start && <div className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(wave.target_start).toLocaleDateString()}</div>}
                  </div>
                  {domainFocus.length > 0 && (
                    <div className="flex gap-1 flex-wrap">{domainFocus.map((d: string) => <Badge key={d} variant="outline" className="text-xs">{d}</Badge>)}</div>
                  )}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs"><span>Completion</span><span>{Number(wave.completion_pct).toFixed(0)}%</span></div>
                    <Progress value={Number(wave.completion_pct)} className="h-2" />
                  </div>
                  {wave.notes && <p className="text-xs text-muted-foreground">{wave.notes}</p>}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
        {(!waves || waves.length === 0) && (
          <Card><CardContent className="pt-6 text-center text-muted-foreground">No delivery waves planned yet</CardContent></Card>
        )}
      </div>
    </div>
  );
};

export default DeliveryWavePlanner;
