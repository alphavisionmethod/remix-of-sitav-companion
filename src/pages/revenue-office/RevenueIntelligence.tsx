import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, AlertTriangle, DollarSign, Users, Target, ArrowUpRight, Layers, TrendingDown, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useRevenueOfficeMode } from "@/contexts/RevenueOfficeModeContext";
import { RevenueOfficeModeToggle } from "@/components/revenue-office/RevenueOfficeModeToggle";
import { DEMO_COHORT_DATA, DEMO_LEAKAGE, DEMO_REVENUE_STREAMS } from "@/data/seed/revenue-office";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
const UNIT_ECONOMICS = [
  { metric: "Customer Acquisition Cost (CAC)", value: "$142", trend: "-8%", status: "improving" },
  { metric: "Lifetime Value (LTV)", value: "$2,840", trend: "+12%", status: "strong" },
  { metric: "LTV:CAC Ratio", value: "20:1", trend: "+3.2x", status: "excellent" },
  { metric: "Payback Period", value: "18 days", trend: "-4 days", status: "improving" },
  { metric: "Monthly Recurring Revenue", value: "$34,200", trend: "+14%", status: "strong" },
  { metric: "Revenue Per Client", value: "$890", trend: "+6%", status: "stable" },
];

const FORECAST = [
  { month: "May", pessimistic: 31000, base: 36000, optimistic: 42000 },
  { month: "Jun", pessimistic: 33000, base: 39000, optimistic: 47000 },
  { month: "Jul", pessimistic: 30000, base: 37000, optimistic: 44000 },
  { month: "Aug", pessimistic: 35000, base: 42000, optimistic: 51000 },
];

export default function RevenueIntelligence() {
  const { isBeginner } = useRevenueOfficeMode();
  const [tab, setTab] = useState("streams");
  const totalLeakage = ([] as typeof DEMO_LEAKAGE).reduce((s, l) => s + parseInt(l.value.replace(/[^0-9]/g, "")), 0);

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{isBeginner ? "Revenue Overview" : "Revenue Intelligence"}</h1>
          <p className="text-sm text-muted-foreground">{isBeginner ? "How your business makes money and where you can improve" : "Forecasting, unit economics, cohort analysis, LTV, and leakage detection"}</p>
        </div>
        <RevenueOfficeModeToggle />
      </motion.div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: "$148,200", icon: DollarSign, color: "text-emerald-400", sub: "+14% MoM" },
          { label: "LTV:CAC", value: "20:1", icon: TrendingUp, color: "text-blue-400", sub: "Excellent" },
          { label: "Active Streams", value: String(([] as typeof DEMO_REVENUE_STREAMS).length), icon: Layers, color: "text-purple-400", sub: "Diversified" },
          { label: "Total Leakage", value: `$${totalLeakage.toLocaleString()}`, icon: AlertTriangle, color: "text-red-400", sub: "Needs attention" },
        ].map(s => (
          <Card key={s.label} className="bg-card/50 border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`w-5 h-5 ${s.color}`} />
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/30 border border-border/40 h-8 p-0.5 gap-0.5">
          <TabsTrigger value="streams" className="text-[10px] h-7 px-2.5 gap-1"><BarChart3 className="h-3 w-3" />{isBeginner ? "Income" : "Streams"}</TabsTrigger>
          <TabsTrigger value="unit" className="text-[10px] h-7 px-2.5 gap-1"><DollarSign className="h-3 w-3" />{isBeginner ? "Costs" : "Unit Economics"}</TabsTrigger>
          {!isBeginner && <TabsTrigger value="forecast" className="text-[10px] h-7 px-2.5 gap-1"><TrendingUp className="h-3 w-3" />Forecast</TabsTrigger>}
          {!isBeginner && <TabsTrigger value="cohort" className="text-[10px] h-7 px-2.5 gap-1"><Users className="h-3 w-3" />Cohorts</TabsTrigger>}
          <TabsTrigger value="leakage" className="text-[10px] h-7 px-2.5 gap-1"><AlertTriangle className="h-3 w-3" />{isBeginner ? "Lost Money" : "Leakage"}</TabsTrigger>
        </TabsList>

        <div className="mt-4">
          {/* Revenue Streams */}
          <TabsContent value="streams">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Revenue by Stream</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {([] as typeof DEMO_REVENUE_STREAMS).map(r => (
                  <div key={r.source} className="flex items-center gap-4">
                    <span className="text-sm text-foreground w-40">{r.source}</span>
                    <div className="flex-1 h-4 bg-muted/20 rounded-full overflow-hidden">
                      <motion.div className="h-full bg-primary/70 rounded-full" initial={{ width: 0 }} animate={{ width: `${r.pct}%` }} transition={{ duration: 0.6 }} />
                    </div>
                    <span className="text-sm font-bold text-foreground w-20 text-right">{r.revenue}</span>
                    <span className="text-xs text-green-400 w-12 text-right">{r.trend}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Unit Economics */}
          <TabsContent value="unit">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {UNIT_ECONOMICS.map(u => (
                <Card key={u.metric} className="bg-card/50 border-border/50">
                  <CardContent className="p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-1">{u.metric}</p>
                    <p className="text-2xl font-bold text-foreground">{u.value}</p>
                    <p className={`text-xs mt-1 ${u.status === "improving" || u.status === "strong" || u.status === "excellent" ? "text-emerald-400" : "text-foreground"}`}>
                      {u.trend}
                    </p>
                    <Badge variant="default" className="text-[9px] mt-2">{u.status}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Forecast */}
          <TabsContent value="forecast">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-3"><CardTitle className="text-sm font-medium flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> Revenue Forecast (3 Scenarios)</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-muted-foreground">
                        <th className="text-left p-2">Month</th>
                        <th className="p-2 text-center text-red-400">Pessimistic</th>
                        <th className="p-2 text-center text-blue-400">Base</th>
                        <th className="p-2 text-center text-emerald-400">Optimistic</th>
                      </tr>
                    </thead>
                    <tbody>
                      {FORECAST.map(f => (
                        <tr key={f.month} className="border-t border-border/20">
                          <td className="p-2 text-foreground font-medium">{f.month}</td>
                          <td className="p-2 text-center text-red-400">${(f.pessimistic/1000).toFixed(0)}k</td>
                          <td className="p-2 text-center text-blue-400 font-bold">${(f.base/1000).toFixed(0)}k</td>
                          <td className="p-2 text-center text-emerald-400">${(f.optimistic/1000).toFixed(0)}k</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Zap className="w-3 h-3 text-blue-400" />
                    Revenue Ops Advisor: Base forecast assumes current pipeline velocity continues. Optimistic requires closing 2 stalled enterprise deals. Pessimistic accounts for potential seasonal dip.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cohort Analysis */}
          <TabsContent value="cohort">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-3"><CardTitle className="text-sm font-medium flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> Cohort Retention</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead><tr className="text-muted-foreground">
                      <th className="text-left p-2">Cohort</th><th className="p-2">Acquired</th><th className="p-2">30d</th><th className="p-2">60d</th><th className="p-2">90d</th><th className="p-2">LTV</th>
                    </tr></thead>
                    <tbody>
                      {([] as typeof DEMO_COHORT_DATA).map(c => (
                        <tr key={c.cohort} className="border-t border-border/20">
                          <td className="p-2 text-foreground font-medium">{c.cohort}</td>
                          <td className="p-2 text-center text-foreground">{c.acquired}</td>
                          <td className="p-2 text-center text-foreground">{c.retained30}</td>
                          <td className="p-2 text-center text-foreground">{c.retained60}</td>
                          <td className="p-2 text-center text-foreground">{c.retained90 ?? "—"}</td>
                          <td className="p-2 text-center text-primary font-medium">{c.ltv}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leakage */}
          <TabsContent value="leakage">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-3"><CardTitle className="text-sm font-medium flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-yellow-400" /> Revenue Leakage</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {([] as typeof DEMO_LEAKAGE).map(l => (
                  <div key={l.type} className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-foreground">{l.type}</p>
                      <span className="text-sm font-bold text-red-400">{l.value}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{l.action}</p>
                  </div>
                ))}
                <div className="pt-2 border-t border-border/30 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Leakage</span>
                  <span className="text-lg font-bold text-red-400">${totalLeakage.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
