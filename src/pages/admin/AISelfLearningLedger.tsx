import { AdminPageHeader } from "@/platform/sita/components/sita/admin/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { BookOpen, TrendingUp, CheckCircle2, AlertTriangle, RotateCcw, Brain, Target, Users, ArrowRight } from "lucide-react";
import { useAIEngDomain } from "@/hooks/use-ai-engineering-data";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
const AISelfLearningLedger = () => {
const LEARNED_PATTERNS: any[] = [];
  const { data: patterns, isDemo } = useAIEngDomain("learningPatterns", LEARNED_PATTERNS);
  const [tab, setTab] = useState("patterns");

  return (
    <div className="space-y-6 p-6">
<AdminPageHeader icon={BookOpen} title="Self-Learning Ledger" subtitle="What the system learned, how behavior changed, and how routing adapted" accent="primary" />

      <div className="grid grid-cols-4 gap-3">
        {[
          { l: "Active Patterns", v: patterns.filter((p: any) => p.status === "active").length },
          { l: "Behavior Changes", v: ([] as any[]).length },
          { l: "Avg Pattern Confidence", v: `${Math.round(patterns.reduce((a: number, p: any) => a + (p.confidence || 0), 0) / Math.max(patterns.length, 1))}%` },
          { l: "Top Agent Weight", v: Math.max(...([] as any[]).map(w => w.weight)).toFixed(2) },
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
          <TabsTrigger value="behavior"><Target className="h-3.5 w-3.5 mr-1" />Behavior Changes</TabsTrigger>
          <TabsTrigger value="routing"><Users className="h-3.5 w-3.5 mr-1" />Routing Weights</TabsTrigger>
        </TabsList>

        <TabsContent value="patterns" className="space-y-2 mt-4">
          {patterns.map((p: any, i: number) => (
            <div key={i} className="rounded-xl border border-border/40 bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">{p.pattern || p.pattern_description}</span>
                <Badge variant={p.status === "active" ? "default" : "outline"}>{p.status}</Badge>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground mb-2">
                <span>{p.domain}</span><span>{p.frequency}</span><span>Confidence: {p.confidence}%</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-primary/5 p-2">
                  <p className="text-[10px] text-primary uppercase tracking-wider mb-0.5">Action Taken</p>
                  <p className="text-xs">{p.action || p.action_taken || "—"}</p>
                </div>
                <div className="rounded-lg bg-[hsl(var(--trust-safe))]/5 p-2">
                  <p className="text-[10px] text-[hsl(var(--trust-safe))] uppercase tracking-wider mb-0.5">Impact</p>
                  <p className="text-xs">{p.impact || p.impact_result || "—"}</p>
                </div>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="behavior" className="space-y-2 mt-4">
          {([] as any[]).map((b, i) => (
            <div key={i} className="rounded-xl border border-border/40 bg-card p-4">
              <p className="text-sm font-medium mb-1">{b.change}</p>
              <div className="rounded-lg bg-muted/30 p-2 mb-2">
                <p className="text-xs text-muted-foreground"><span className="font-medium">Learned from:</span> {b.learnedFrom}</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{b.date}</span>
                <span className="text-[hsl(var(--trust-safe))] font-medium">{b.improvement}</span>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="routing" className="space-y-2 mt-4">
          {([] as any[]).map((w, i) => (
            <div key={i} className="rounded-xl border border-border/40 bg-card p-4 flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold">{w.agent}</span>
                  <Badge variant={w.trend === "up" ? "default" : w.trend === "down" ? "destructive" : "outline"} className="text-[10px]">
                    {w.trend === "up" ? "↑" : w.trend === "down" ? "↓" : "→"} {w.trend}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{w.reason}</p>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-lg font-bold ${w.weight >= 1 ? "text-[hsl(var(--trust-safe))]" : "text-amber-500"}`}>{w.weight.toFixed(2)}x</p>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AISelfLearningLedger;
