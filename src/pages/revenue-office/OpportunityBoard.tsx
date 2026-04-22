import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, TrendingUp, UserPlus, Star, RefreshCw, DollarSign, ArrowRight, Layers, AlertTriangle, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { DEMO_opportunities, DEMO_OPPORTUNITY_THEMES } from "@/data/seed/revenue-office";
import { useState, useMemo } from "react";
import { useDeals } from "@/hooks/use-revenue-office";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";


const categoryColors: Record<string, string> = {
  Conversion: "bg-blue-500/10 text-blue-400",
  Upsell: "bg-emerald-500/10 text-emerald-400",
  Reputation: "bg-amber-500/10 text-amber-400",
  Reactivation: "bg-purple-500/10 text-purple-400",
  Packaging: "bg-pink-500/10 text-pink-400",
  Referral: "bg-cyan-500/10 text-cyan-400",
};

const effortScore = (e: string) => e === "Low" ? 1 : e === "Medium" ? 2 : 3;

export default function OpportunityBoard() {
  const { isDemo: isDemoMode } = useAuth();
  const { data: liveDeals } = useDeals();
  const opportunities = isDemoMode ? DEMO_opportunities : (liveDeals && liveDeals.length > 0 ? liveDeals.map((d: any) => ({
    title: d.name || "Untitled Deal",
    category: d.source || "Conversion",
    confidence: d.probability || 50,
    impact: `$${Number(d.value || 0).toLocaleString()}`,
    effort: "Medium",
    advisor: "Revenue Advisor",
    why: d.next_action || "Opportunity identified from pipeline data",
    icon: TrendingUp,
  })) : []);
  const [tab, setTab] = useState("ranked");
  const [watchlist, setWatchlist] = useState<Set<number>>(new Set());

  const toggleWatch = (i: number) => {
    setWatchlist(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  // Priority scoring: (confidence / 100) * impact_multiplier / effort_score
  const scored = opportunities.map((opp, i) => {
    const impactNum = parseInt(opp.impact.replace(/[^0-9]/g, "")) || 5000;
    const priority = Math.round((opp.confidence / 100) * (impactNum / 1000) / effortScore(opp.effort) * 10);
    return { ...opp, originalIndex: i, priority };
  }).sort((a, b) => b.priority - a.priority);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
<div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Lightbulb className="h-6 w-6 text-amber-400" /> Opportunity Board</h1>
        <p className="text-muted-foreground">Ranked growth opportunities with priority scoring and theme clustering</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border/40 bg-card p-3 text-center"><p className="text-xs text-muted-foreground">Active Opportunities</p><p className="text-2xl font-bold text-foreground">{opportunities.length}</p></div>
        <div className="rounded-xl border border-border/40 bg-card p-3 text-center"><p className="text-xs text-muted-foreground">Total Potential Impact</p><p className="text-2xl font-bold text-emerald-400">$67,900+</p></div>
        <div className="rounded-xl border border-border/40 bg-card p-3 text-center"><p className="text-xs text-muted-foreground">Avg Confidence</p><p className="text-2xl font-bold text-blue-400">{Math.round(opportunities.reduce((a, o) => a + o.confidence, 0) / opportunities.length)}%</p></div>
        <div className="rounded-xl border border-border/40 bg-card p-3 text-center"><p className="text-xs text-muted-foreground">Watching</p><p className="text-2xl font-bold text-primary">{watchlist.size}</p></div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="ranked"><TrendingUp className="h-3.5 w-3.5 mr-1" />Priority Ranked</TabsTrigger>
          <TabsTrigger value="themes"><Layers className="h-3.5 w-3.5 mr-1" />Theme Clusters</TabsTrigger>
          {watchlist.size > 0 && <TabsTrigger value="watchlist"><Star className="h-3.5 w-3.5 mr-1" />Watchlist ({watchlist.size})</TabsTrigger>}
        </TabsList>

        <TabsContent value="ranked" className="space-y-3 mt-4">
          {scored.map((opp, rank) => (
            <Card key={rank} className={`bg-card/50 border-border/50 hover:border-primary/30 transition-colors ${watchlist.has(opp.originalIndex) ? "ring-1 ring-primary/30" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-lg font-bold text-primary">#{rank + 1}</span>
                      <span className="text-[9px] text-muted-foreground">Score: {opp.priority}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-primary/10"><opp.icon className="h-4 w-4 text-primary" /></div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{opp.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{opp.why}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${categoryColors[opp.category]} text-[10px]`}>{opp.category}</Badge>
                    <button onClick={() => toggleWatch(opp.originalIndex)} className={`p-1 rounded ${watchlist.has(opp.originalIndex) ? "text-amber-400" : "text-muted-foreground hover:text-amber-400"}`}>
                      <Star className={`h-4 w-4 ${watchlist.has(opp.originalIndex) ? "fill-current" : ""}`} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs">
                  <span className="text-muted-foreground">Impact: <span className="text-emerald-400 font-medium">{opp.impact}</span></span>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Confidence:</span>
                    <Progress value={opp.confidence} className="h-1 w-16" />
                    <span className="text-foreground font-medium">{opp.confidence}%</span>
                  </div>
                  <span className="text-muted-foreground">Effort: <span className={effortScore(opp.effort) === 1 ? "text-[hsl(var(--trust-safe))]" : effortScore(opp.effort) === 2 ? "text-yellow-400" : "text-orange-400"}>{opp.effort}</span></span>
                  <span className="text-muted-foreground">Advisor: <span className="text-blue-400">{opp.advisor}</span></span>
                  {rank === 0 && <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-400/30 ml-auto">🔥 Urgent</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="themes" className="space-y-3 mt-4">
          {DEMO_OPPORTUNITY_THEMES.map(theme => {
            const themeOpps = scored.filter(o => {
              if (theme.theme === "Conversion Optimization") return ["Conversion"].includes(o.category);
              if (theme.theme === "Revenue Expansion") return ["Upsell", "Packaging"].includes(o.category);
              return ["Reputation", "Referral"].includes(o.category);
            });
            return (
              <Card key={theme.theme} className="bg-card/50 border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">{theme.theme}</h3>
                      <p className="text-xs text-muted-foreground">{theme.opportunities} opportunities · Avg confidence: {theme.avgConfidence}%</p>
                    </div>
                    <span className="text-sm font-bold text-emerald-400">{theme.totalImpact}</span>
                  </div>
                  {themeOpps.length > 0 && (
                    <div className="space-y-2">
                      {themeOpps.map(o => (
                        <div key={o.title} className="flex items-center justify-between p-2 rounded-lg bg-muted/10 border border-border/30">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-primary">#{scored.indexOf(o) + 1}</span>
                            <span className="text-xs text-foreground">{o.title}</span>
                          </div>
                          <span className="text-xs text-emerald-400">{o.impact}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {watchlist.size > 0 && (
          <TabsContent value="watchlist" className="space-y-3 mt-4">
            {scored.filter(o => watchlist.has(o.originalIndex)).map((opp, i) => (
              <Card key={i} className="bg-card/50 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <opp.icon className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{opp.title}</p>
                        <p className="text-xs text-muted-foreground">{opp.why}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-emerald-400">{opp.impact}</span>
                      <Badge className={`${categoryColors[opp.category]} text-[10px]`}>{opp.category}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        )}
      </Tabs>
    </motion.div>
  );
}
