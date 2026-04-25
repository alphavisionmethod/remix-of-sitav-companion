import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { motion } from "framer-motion";
import { GitBranch, ArrowRight, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LIFECYCLE_STAGES, getStageLabel, getStageIndex, computeReadiness } from "@/lib/delivery-methodology/feature-lifecycle";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const stageColors: Record<string, string> = {
  proposed: "bg-muted", specified: "bg-blue-500/20", generated: "bg-cyan-500/20",
  "contract-defined": "bg-violet-500/20", scaffolded: "bg-indigo-500/20",
  implemented: "bg-emerald-500/20", wired: "bg-green-500/20", tested: "bg-lime-500/20",
  "runtime-verified": "bg-yellow-500/20", "launch-ready": "bg-amber-500/20",
  monitored: "bg-orange-500/20", evolving: "bg-rose-500/20", deprecated: "bg-gray-500/20",
};

const FeatureLifecycleBoard = () => {
  const { data: blueprints } = useQuery({
    queryKey: ["feature-blueprints-lifecycle"],
    queryFn: async () => {
      const { data } = await fromTable("feature_blueprints").select("*").order("created_at", { ascending: false }).limit(100);
      return data ?? [];
    },
  });

  const { data: stages } = useQuery({
    queryKey: ["feature-lifecycle-stages"],
    queryFn: async () => {
      const { data } = await fromTable("feature_lifecycle_stages").select("*").order("entered_at", { ascending: false }).limit(500);
      return data ?? [];
    },
  });

  const getLatestStage = (featureId: string) => {
    const featureStages = (stages ?? []).filter((s: Record<string, any>) => s.feature_id === featureId);
    if (featureStages.length === 0) return "proposed";
    return featureStages.sort((a: any,  b: Record<string, any>) => b.stage_order - a.stage_order)[0]?.stage ?? "proposed";
  };

  const stageCounts = LIFECYCLE_STAGES.reduce((acc, stage) => {
    acc[stage] = (blueprints ?? []).filter((bp: Record<string, any>) => getLatestStage(bp.feature_id) === stage).length;
    return acc;
  }, {} as Record<string, number>);

  const totalFeatures = blueprints?.length ?? 0;

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <GitBranch className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Feature Lifecycle Board</h1>
        </div>
        <p className="text-muted-foreground">Track every feature through the 13-stage delivery pipeline</p>
      </motion.div>

      {/* Pipeline visualization */}
      <Card>
        <CardHeader><CardTitle>Lifecycle Pipeline — {totalFeatures} Features</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {LIFECYCLE_STAGES.map((stage, i) => (
              <div key={stage} className="flex items-center">
                <motion.div
                  className={`flex flex-col items-center px-3 py-2 rounded-lg min-w-[100px] ${stageColors[stage]} border`}
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="text-xs font-medium">{getStageLabel(stage)}</span>
                  <span className="text-2xl font-bold mt-1">{stageCounts[stage]}</span>
                </motion.div>
                {i < LIFECYCLE_STAGES.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground mx-1 flex-shrink-0" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feature cards by stage */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {(blueprints ?? []).map((bp: Record<string, any>) => {
          const currentStage = getLatestStage(bp.feature_id);
          const stageIdx = getStageIndex(currentStage as never);
          const progress = Math.round(((stageIdx + 1) / LIFECYCLE_STAGES.length) * 100);
          const readiness = computeReadiness(currentStage as never, []);

          return (
            <motion.div key={bp.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="h-full">
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">{bp.title}</h3>
                    <Badge className={`text-xs ${stageColors[currentStage]}`}>{getStageLabel(currentStage as never)}</Badge>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">{bp.domain}</Badge>
                    <Badge variant="outline" className="text-xs">{bp.archetype_key}</Badge>
                    <Badge variant="outline" className="text-xs">{bp.persistence_class}</Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Pipeline Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {readiness === 100 ? <CheckCircle2 className="h-3 w-3 text-green-500" /> :
                      readiness > 50 ? <Clock className="h-3 w-3 text-amber-500" /> :
                      <AlertCircle className="h-3 w-3 text-red-500" />}
                    <span>Next-stage readiness: {readiness}%</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default FeatureLifecycleBoard;
