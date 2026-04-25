import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { motion } from "framer-motion";
import { Award, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getMaturityGrade, getMaturityLabel } from "@/lib/delivery-methodology/maturity-model";
import { CANONICAL_DOMAIN_PACKS } from "@/lib/delivery-methodology/domain-packs";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const gradeColors: Record<string, string> = {
  S: "text-yellow-400 bg-yellow-400/10", A: "text-green-400 bg-green-400/10",
  B: "text-blue-400 bg-blue-400/10", C: "text-cyan-400 bg-cyan-400/10",
  D: "text-amber-400 bg-amber-400/10", F: "text-red-400 bg-red-400/10",
};

const PlatformMaturityDashboard = () => {
  const { data: scores } = useQuery({
    queryKey: ["platform-maturity-scores"],
    queryFn: async () => {
      const { data } = await fromTable("platform_maturity_scores").select("*").order("measured_at", { ascending: false }).limit(50);
      return data ?? [];
    },
  });

  // Build display from persisted scores or defaults
  const domains = CANONICAL_DOMAIN_PACKS.map(pack => {
    const score = (scores ?? []).find((s: Record<string, any>) => s.scope_id === pack.domainKey);
    const composite = score ? Number(score.composite_score) : 0;
    const grade = getMaturityGrade(composite);
    return {
      key: pack.domainKey,
      label: pack.displayName,
      target: pack.maturityTarget,
      composite,
      grade,
      gradeLabel: getMaturityLabel(grade),
      truth: score ? Number(score.truth_level) : 0,
      persistence: score ? Number(score.persistence_level) : 0,
      proof: score ? Number(score.proof_level) : 0,
      automation: score ? Number(score.automation_level) : 0,
      launch: score ? Number(score.launch_readiness) : 0,
      interaction: score ? Number(score.interaction_coverage) : 0,
      contract: score ? Number(score.contract_coverage) : 0,
    };
  });

  const overallComposite = domains.length > 0 ? Math.round(domains.reduce((s, d) => s + d.composite, 0) / domains.length) : 0;
  const overallGrade = getMaturityGrade(overallComposite);

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <Award className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Platform Maturity Dashboard</h1>
        </div>
        <p className="text-muted-foreground">Track maturity by domain — truth, persistence, proof, automation, readiness</p>
      </motion.div>

      <Card>
        <CardContent className="pt-6 flex items-center gap-6">
          <div className={`text-6xl font-black p-4 rounded-xl ${gradeColors[overallGrade]}`}>{overallGrade}</div>
          <div>
            <div className="text-2xl font-bold">{getMaturityLabel(overallGrade)}</div>
            <div className="text-muted-foreground">Platform Composite Score: {overallComposite}%</div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {domains.map(d => (
          <motion.div key={d.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{d.label}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-black px-2 py-1 rounded ${gradeColors[d.grade]}`}>{d.grade}</span>
                    <Badge variant="outline">{d.target}</Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { label: "Truth Level", value: d.truth },
                  { label: "Persistence", value: d.persistence },
                  { label: "Proof Level", value: d.proof },
                  { label: "Automation", value: d.automation },
                  { label: "Launch Readiness", value: d.launch },
                  { label: "Interaction Coverage", value: d.interaction },
                  { label: "Contract Coverage", value: d.contract },
                ].map(m => (
                  <div key={m.label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{m.label}</span>
                      <span>{m.value}%</span>
                    </div>
                    <Progress value={m.value} className="h-1.5" />
                  </div>
                ))}
                <div className="flex justify-between pt-2 border-t text-sm font-medium">
                  <span>Composite</span>
                  <span>{d.composite}%</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PlatformMaturityDashboard;
