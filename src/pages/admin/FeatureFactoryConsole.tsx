import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { motion } from "framer-motion";
import { Factory, FileCode, Network, ListChecks } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { generateFeatureArtifacts, type FeatureBlueprint } from "@/lib/delivery-methodology/feature-factory";
import { mapDependencies } from "@/lib/delivery-methodology/dependency-mapper";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const FeatureFactoryConsole = () => {
  const { data: blueprints } = useQuery({
    queryKey: ["factory-blueprints"],
    queryFn: async () => {
      const { data } = await fromTable("feature_blueprints").select("*").eq("status", "draft").order("created_at", { ascending: false }).limit(20);
      return data ?? [];
    },
  });

  const handleGenerate = (bp: Record<string, any>) => {
    const blueprint: FeatureBlueprint = {
      featureId: bp.feature_id, title: bp.title, domain: bp.domain,
      archetypeKey: bp.archetype_key ?? "dashboard", userIntent: bp.user_intent ?? "",
      persistenceClass: bp.persistence_class ?? "operational",
      contractClass: bp.contract_class ?? "standard",
      interactionCriticality: bp.interaction_criticality ?? "medium",
      journeyCriticality: bp.journey_criticality ?? "medium",
      trustNeeds: bp.trust_needs ?? "standard",
      aiComputeClass: bp.ai_compute_class ?? "none",
      launchCriticality: bp.launch_criticality ?? "standard",
      realityTarget: bp.reality_target ?? "persisted",
    };
    const artifacts = generateFeatureArtifacts(blueprint);
    const deps = mapDependencies(blueprint);
    toast.success(`Generated ${artifacts.readinessChecklist.length} checklist items, ${deps.totalCount} dependencies`);
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <Factory className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Feature Factory Console</h1>
        </div>
        <p className="text-muted-foreground">Generate canonical artifacts from approved blueprints</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(blueprints ?? []).map((bp: Record<string, any>) => (
          <motion.div key={bp.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-base">{bp.title}</span>
                  <Badge variant="outline">{bp.archetype_key}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline">{bp.domain}</Badge>
                  <Badge variant="outline">{bp.persistence_class}</Badge>
                  <Badge variant="outline">{bp.trust_needs} trust</Badge>
                  <Badge variant="outline">{bp.launch_criticality}</Badge>
                </div>
                {bp.description && <p className="text-sm text-muted-foreground line-clamp-2">{bp.description}</p>}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center gap-1"><FileCode className="h-3 w-3" /> Contracts</div>
                  <div className="flex items-center gap-1"><Network className="h-3 w-3" /> Services</div>
                  <div className="flex items-center gap-1"><ListChecks className="h-3 w-3" /> Checklist</div>
                </div>
                <Button onClick={() => handleGenerate(bp)} className="w-full" size="sm">
                  <Factory className="h-4 w-4 mr-2" /> Generate Artifacts
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {(!blueprints || blueprints.length === 0) && (
          <Card className="col-span-full"><CardContent className="pt-6 text-center text-muted-foreground">No draft blueprints — create one at Feature Intake Desk</CardContent></Card>
        )}
      </div>
    </div>
  );
};

export default FeatureFactoryConsole;
