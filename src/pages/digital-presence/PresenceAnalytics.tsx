import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Eye, ShoppingCart, Calendar, Globe, ArrowUpRight, ArrowDownRight, Users, Sparkles, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useSeoReports } from "@/hooks/use-digital-presence";
import { DEMO_AGENT_CONFIDENCE, DEMO_OVERVIEW_METRICS, DEMO_PAGE_IMPACT, DEMO_PROMO_PERFORMANCE, DEMO_SOURCE_PERFORMANCE } from "@/data/seed/digital-presence";
import DPOSubNav from "./DPOSubNav";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";

export default function PresenceAnalytics() {
  const { data: liveData, isLoading } = useSeoReports();
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <DPOSubNav />
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Presence Analytics & Insight Review</h1>
        <p className="text-sm text-muted-foreground">Traffic quality, conversion, source performance, page impact & agent confidence</p>
      </motion.div>

      {/* Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {([] as typeof DEMO_OVERVIEW_METRICS).map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <m.icon className="w-4 h-4 text-primary" />
                  {m.up ? <ArrowUpRight className="w-3 h-3 text-green-400" /> : <ArrowDownRight className="w-3 h-3 text-red-400" />}
                </div>
                <p className="text-xl font-bold text-foreground">{m.value}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-muted-foreground">{m.label}</span>
                  <span className="text-[10px] text-green-400">{m.change}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Source Performance */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Globe className="w-4 h-4 text-blue-400" /> Source-to-Conversion Performance</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {([] as typeof DEMO_SOURCE_PERFORMANCE).map(s => (
            <div key={s.source} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3 flex-1">
                <span className="text-sm font-medium text-foreground w-32">{s.source}</span>
                <span className="text-xs text-muted-foreground">{s.visitors.toLocaleString()} visitors</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground">CVR: {s.conversion}</span>
                <span className="text-xs text-muted-foreground">{s.revenue}</span>
                <div className="flex items-center gap-1 w-16">
                  <Progress value={s.quality} className="h-1.5" />
                  <span className={`text-[10px] font-bold ${s.quality >= 80 ? "text-green-400" : s.quality >= 60 ? "text-amber-400" : "text-red-400"}`}>{s.quality}</span>
                </div>
                <Badge variant={s.trend === "up" ? "default" : s.trend === "down" ? "destructive" : "secondary"} className="text-[10px] w-14 justify-center">{s.trend}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Page Impact */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="w-4 h-4 text-green-400" /> Page-by-Page Business Impact</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground border-b border-border/30">
                  <th className="text-left p-2">Page</th>
                  <th className="text-right p-2">Visits</th>
                  <th className="text-right p-2">CVR</th>
                  <th className="text-right p-2">Bounce</th>
                  <th className="text-right p-2">Avg Time</th>
                  <th className="text-right p-2">Revenue</th>
                  <th className="text-right p-2">Impact</th>
                </tr>
              </thead>
              <tbody>
                {([] as typeof DEMO_PAGE_IMPACT).map(p => (
                  <tr key={p.page} className="border-b border-border/10 hover:bg-muted/20">
                    <td className="p-2">
                      <span className="text-foreground font-medium">{p.name}</span>
                      <span className="text-[10px] text-muted-foreground ml-1 font-mono">{p.page}</span>
                    </td>
                    <td className="text-right p-2 text-muted-foreground">{p.visits.toLocaleString()}</td>
                    <td className="text-right p-2 text-foreground font-medium">{p.conversion}</td>
                    <td className="text-right p-2 text-muted-foreground">{p.bounceRate}</td>
                    <td className="text-right p-2 text-muted-foreground">{p.avgTime}</td>
                    <td className="text-right p-2 text-foreground">{p.revenue}</td>
                    <td className="text-right p-2"><Badge variant={p.impact === "high" ? "default" : "secondary"} className="text-[10px]">{p.impact}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Promo Performance */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4 text-orange-400" /> Promo Performance</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {([] as typeof DEMO_PROMO_PERFORMANCE).map(p => (
              <div key={p.name} className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-foreground">{p.name}</span>
                  <Badge variant="default" className="text-[10px]">{p.status}</Badge>
                </div>
                <div className="grid grid-cols-4 gap-2 text-[10px] text-muted-foreground mt-2">
                  <div><span className="text-foreground font-medium">{p.impressions.toLocaleString()}</span> impressions</div>
                  <div><span className="text-foreground font-medium">{p.clicks}</span> clicks ({p.ctr})</div>
                  <div><span className="text-foreground font-medium">{p.conversions}</span> conversions</div>
                  <div><span className="text-foreground font-medium">{p.revenue}</span> revenue</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Agent Confidence */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Sparkles className="w-4 h-4 text-violet-400" /> Agent Confidence Trends</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {([] as typeof DEMO_AGENT_CONFIDENCE).map(a => (
              <div key={a.agent} className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-foreground">{a.agent}</span>
                  <div className="flex items-center gap-2">
                    <Progress value={a.confidence} className="h-1.5 w-16" />
                    <span className={`text-[10px] font-bold ${a.confidence >= 80 ? "text-green-400" : a.confidence >= 60 ? "text-amber-400" : "text-red-400"}`}>{a.confidence}%</span>
                    <Badge variant={a.trend === "improving" ? "default" : a.trend === "declining" ? "destructive" : "secondary"} className="text-[10px]">{a.trend}</Badge>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Sparkles className="w-3 h-3 text-primary shrink-0" /> {a.topInsight}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
