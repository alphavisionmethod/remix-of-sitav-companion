import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { TrendingUp, Brain, AlertTriangle, CheckCircle2, RotateCcw, Sparkles, Target, Users } from "lucide-react";
import { useAIEngDomain } from "@/hooks/use-ai-engineering-data";
import { DEMO_CALIBRATION } from "@/data/seed/admin-platform";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

// Production fallback — seed data removed
const DEMO_OUTCOMES: any[] = [];

const AILearningCenter = () => {
  const { data: patterns, isDemo } = useAIEngDomain("learningPatterns", DEMO_PATTERNS);
  const [tab, setTab] = useState("patterns");

  return (
    <div className="space-y-6 p-6">
<AdminPageHeader icon={TrendingUp} title="Learning & Improvement Center" subtitle="What the AI team learned — patterns, outcomes, calibration, and permanent improvements" accent="primary" />

      <div className="grid grid-cols-4 gap-3">
        {[
          { l: "Patterns Discovered", v: patterns.length },
          { l: "Improvements Implemented", v: patterns.filter((p: any) => p.status === "implemented").length },
          { l: "Recommendations Tracked", v: ([] as typeof DEMO_OUTCOMES).length },
          { l: "Avg Agent Accuracy", v: `${Math.round(([] as typeof DEMO_CALIBRATION).reduce((a,c) => a + c.accuracy, 0) / ([] as typeof DEMO_CALIBRATION).length)}%` },
        ].map(c => (
          <div key={c.l} className="rounded-xl border border-border/40 bg-card p-4 text-center">
            <p className="text-xl font-bold">{c.v}</p>
            <p className="text-[11px] text-muted-foreground">{c.l}</p>
          </div>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="patterns"><Brain className="h-3.5 w-3.5 mr-1" />Patterns</TabsTrigger>
          <TabsTrigger value="outcomes"><Target className="h-3.5 w-3.5 mr-1" />Outcomes</TabsTrigger>
          <TabsTrigger value="calibration"><Users className="h-3.5 w-3.5 mr-1" />Agent Calibration</TabsTrigger>
        </TabsList>

        <TabsContent value="patterns" className="space-y-2 mt-4">
          {patterns.map((p: any, i: number) => (
            <div key={i} className="rounded-xl border border-border/40 bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">{p.pattern || p.pattern_description}</span>
                <Badge variant={p.status === "implemented" ? "default" : "outline"}>{p.status}</Badge>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground mb-2">
                <span>{p.domain}</span><span>Frequency: {p.frequency}</span><span>Confidence: {p.confidence}%</span>
              </div>
              <div className="rounded-lg bg-primary/5 p-2">
                <p className="text-xs text-primary">→ {p.improvement || p.action_taken || "—"}</p>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="outcomes" className="space-y-2 mt-4">
          {([] as typeof DEMO_OUTCOMES).map((o, i) => (
            <div key={i} className="rounded-xl border border-border/40 bg-card p-4 flex items-center gap-3">
              {o.outcome === "success" ? <CheckCircle2 className="h-4 w-4 text-[hsl(var(--trust-safe))] shrink-0" /> :
               o.outcome === "rejected" ? <RotateCcw className="h-4 w-4 text-muted-foreground shrink-0" /> :
               <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />}
              <div className="flex-1">
                <p className="text-sm font-medium">{o.recommendation}</p>
                <p className="text-xs text-muted-foreground">{o.impact}</p>
              </div>
              <div className="text-right shrink-0">
                <Badge variant={o.accepted ? "default" : "secondary"}>{o.accepted ? "Accepted" : "Rejected"}</Badge>
                <p className={`text-xs mt-1 ${o.confidence_delta.startsWith("+") ? "text-[hsl(var(--trust-safe))]" : "text-destructive"}`}>{o.confidence_delta}</p>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="calibration" className="space-y-2 mt-4">
          {([] as typeof DEMO_CALIBRATION).map((c, i) => (
            <div key={i} className="rounded-xl border border-border/40 bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">{c.agent}</span>
                <div className="flex items-center gap-2">
                  <Badge variant={c.trend === "improving" ? "default" : c.trend === "declining" ? "destructive" : "outline"}>{c.trend}</Badge>
                  <span className="text-sm font-bold">{c.accuracy}%</span>
                </div>
              </div>
              <Progress value={c.accuracy} className="h-1.5 mb-2" />
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>False Positives: {c.falsePositives}</span>
                <span>Missed Issues: {c.missedIssues}</span>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AILearningCenter;
