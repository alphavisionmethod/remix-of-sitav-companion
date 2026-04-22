import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { AlertTriangle, DollarSign, Clock, Users, ArrowRight, TrendingDown, TrendingUp, CheckCircle, Wrench, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRevenueOfficeMode } from "@/contexts/RevenueOfficeModeContext";
import { RevenueOfficeModeToggle } from "@/components/revenue-office/RevenueOfficeModeToggle";
import { useRevenueLeakItems } from "@/hooks/use-revenue-office";
import { useRevenueLeaks } from "@/hooks/use-revenue-office";
import { Skeleton } from "@/components/ui/skeleton";
import { DEMO_REV_LEAKS_LEAK_DETECTOR as DEMO_LEAKS, DEMO_LEAK_REPAIR_TRACKING, DEMO_LEAK_TRENDS } from "@/data/seed/revenue-office";
import { useState } from "react";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";


export default function LeakDetector() {
  const { isDemoMode } = useDataMode();
  const { isDemo: isDemoMode } = useAuth();
  const { isBeginner } = useRevenueOfficeMode();
  const { data: liveLeaks, isLoading } = useRevenueLeaks();
  const [tab, setTab] = useState("active");

  const LEAKS = isDemoMode ? DEMO_LEAKS : (liveLeaks && liveLeaks.length > 0 ? liveLeaks.map((l: any) => ({
    category: l.leak_type || "Unknown",
    severity: l.severity || "medium",
    revenue: `$${Number(l.amount_at_risk || 0).toLocaleString()}`,
    items: 1,
    description: l.description || "",
    icon: AlertTriangle,
    action: "Investigate",
    details: [],
  })) : []);
  const totalLeakage = LEAKS.reduce((s, l) => s + parseInt(l.revenue.replace(/[^0-9]/g, "")), 0);
  const totalRecovered = (isDemoMode ? DEMO_LEAK_REPAIR_TRACKING : [] as typeof DEMO_LEAK_REPAIR_TRACKING).reduce((s, r) => s + parseInt(r.recoveredRevenue.replace(/[^0-9]/g, "")), 0);
  const recoveryRate = totalLeakage > 0 ? Math.round((totalRecovered / (totalLeakage + totalRecovered)) * 100) : 0;
  const latestTrend = DEMO_LEAK_TRENDS[(isDemoMode ? DEMO_LEAK_TRENDS : [] as typeof DEMO_LEAK_TRENDS).length - 1];
  const prevTrend = DEMO_LEAK_TRENDS[(isDemoMode ? DEMO_LEAK_TRENDS : [] as typeof DEMO_LEAK_TRENDS).length - 2];
  const trendDelta = prevTrend ? Math.round(((prevTrend.net - latestTrend.net) / prevTrend.net) * 100) : 0;

  if (!isDemoMode && isLoading) {
    return <div className="min-h-screen bg-background p-6 space-y-6">
<Skeleton className="h-8 w-48" /><Skeleton className="h-32 rounded-xl" /><Skeleton className="h-48 rounded-xl" /></div>;
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-yellow-400" /> {isBeginner ? "Money You're Losing" : "Revenue Leakage Map"}
          </h1>
          <p className="text-sm text-muted-foreground">{isBeginner ? "Places where your business is losing money — and how to fix them" : "Every lost dollar mapped — with repair tracking and recovery ROI"}</p>
        </div>
        <RevenueOfficeModeToggle />
      </motion.div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { l: "Active Leakage", v: `$${totalLeakage.toLocaleString()}`, c: "text-red-400" },
          { l: "Recovered", v: `$${totalRecovered.toLocaleString()}`, c: "text-[hsl(var(--trust-safe))]" },
          { l: "Recovery Rate", v: `${recoveryRate}%`, c: "text-primary" },
          { l: "Net Leak Trend", v: `↓${trendDelta}%`, c: "text-[hsl(var(--trust-safe))]" },
          { l: "Leak Categories", v: LEAKS.length, c: "text-foreground" },
        ].map(m => (
          <div key={m.l} className="rounded-xl border border-border/40 bg-card p-3 text-center">
            <p className="text-xs text-muted-foreground">{m.l}</p>
            <p className={`text-xl font-bold ${m.c}`}>{m.v}</p>
          </div>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="active"><AlertTriangle className="h-3.5 w-3.5 mr-1" />{isBeginner ? "Problems" : "Active Leaks"}</TabsTrigger>
          <TabsTrigger value="repairs"><Wrench className="h-3.5 w-3.5 mr-1" />{isBeginner ? "Fixes" : "Repair Tracking"}</TabsTrigger>
          {!isBeginner && <TabsTrigger value="trends"><BarChart3 className="h-3.5 w-3.5 mr-1" />Historical Trends</TabsTrigger>}
        </TabsList>

        {/* Active Leaks */}
        <TabsContent value="active" className="space-y-4 mt-4">
          <Card className="bg-red-500/5 border-red-500/20">
            <CardContent className="p-5 text-center">
              <p className="text-sm text-red-400 font-medium">Total Revenue Leakage Detected</p>
              <p className="text-4xl font-bold text-red-400 mt-2">${totalLeakage.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1">{LEAKS.reduce((s, l) => s + l.items, 0)} items across {LEAKS.length} categories</p>
            </CardContent>
          </Card>

          {LEAKS.map((leak, i) => (
            <motion.div key={leak.category} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${leak.severity === "high" ? "bg-red-500/10" : "bg-yellow-500/10"}`}>
                        <leak.icon className={`w-5 h-5 ${leak.severity === "high" ? "text-red-400" : "text-yellow-400"}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">{leak.category}</p>
                          <Badge variant={leak.severity === "high" ? "destructive" : "secondary"} className="text-xs">{leak.severity}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{leak.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-400">{leak.revenue}</p>
                      <p className="text-xs text-muted-foreground">{leak.items} items</p>
                    </div>
                  </div>
                  <div className="space-y-2 mb-3">
                    {leak.details.map(d => (
                      <div key={d.name} className="flex items-center justify-between p-2 rounded bg-muted/10">
                        <span className="text-sm text-foreground">{d.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{d.days}d</span>
                          <span className="text-sm font-medium text-foreground">{d.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="w-full text-primary">{leak.action} <ArrowRight className="w-3 h-3 ml-1" /></Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        {/* Repair Tracking */}
        <TabsContent value="repairs" className="space-y-3 mt-4">
          <div className="rounded-xl border border-[hsl(var(--trust-safe))]/30 bg-[hsl(var(--trust-safe))]/5 p-4 text-center">
            <p className="text-sm text-[hsl(var(--trust-safe))] font-medium">Total Revenue Recovered</p>
            <p className="text-3xl font-bold text-[hsl(var(--trust-safe))] mt-1">${totalRecovered.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">{(isDemoMode ? DEMO_LEAK_REPAIR_TRACKING : [] as typeof DEMO_LEAK_REPAIR_TRACKING).filter(r => r.status === "repaired").length} leaks fully repaired</p>
          </div>

          {(isDemoMode ? DEMO_LEAK_REPAIR_TRACKING : [] as typeof DEMO_LEAK_REPAIR_TRACKING).map((repair, i) => (
            <Card key={i} className="bg-card/50 border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {repair.status === "repaired" ? <CheckCircle className="w-4 h-4 text-[hsl(var(--trust-safe))]" /> : <Wrench className="w-4 h-4 text-orange-400" />}
                    <span className="text-sm font-medium text-foreground">{repair.leak}</span>
                    <Badge variant={repair.status === "repaired" ? "default" : "outline"} className="text-[10px]">{repair.status}</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{repair.repairDate}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">Method: {repair.method}</p>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="text-muted-foreground">Recovery</span>
                      <span className="text-[hsl(var(--trust-safe))] font-medium">{repair.recoveredPct}%</span>
                    </div>
                    <Progress value={repair.recoveredPct} className="h-1.5" />
                  </div>
                  <span className="text-sm font-bold text-[hsl(var(--trust-safe))]">{repair.recoveredRevenue}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Historical Trends */}
        <TabsContent value="trends" className="mt-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Monthly Leakage vs Recovery</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(isDemoMode ? DEMO_LEAK_TRENDS : [] as typeof DEMO_LEAK_TRENDS).map((t, i) => {
                  const maxVal = Math.max(...(isDemoMode ? DEMO_LEAK_TRENDS : [] as typeof DEMO_LEAK_TRENDS).map(tt => tt.totalLeakage));
                  return (
                    <div key={t.month} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground w-10">{t.month}</span>
                        <div className="flex gap-4">
                          <span className="text-red-400">Leaked: ${(t.totalLeakage / 1000).toFixed(1)}k</span>
                          <span className="text-[hsl(var(--trust-safe))]">Repaired: ${(t.repaired / 1000).toFixed(1)}k</span>
                          <span className="font-medium text-foreground">Net: ${(t.net / 1000).toFixed(1)}k</span>
                        </div>
                      </div>
                      <div className="relative h-4 bg-muted/20 rounded-full overflow-hidden">
                        <div className="absolute inset-y-0 left-0 bg-red-400/30 rounded-full" style={{ width: `${(t.totalLeakage / maxVal) * 100}%` }} />
                        <div className="absolute inset-y-0 left-0 bg-[hsl(var(--trust-safe))]/50 rounded-full" style={{ width: `${(t.repaired / maxVal) * 100}%` }} />
                      </div>
                      {i < (isDemoMode ? DEMO_LEAK_TRENDS : [] as typeof DEMO_LEAK_TRENDS).length - 1 && (() => {
                        const next = DEMO_LEAK_TRENDS[i + 1];
                        const delta = Math.round(((t.net - next.net) / t.net) * 100);
                        return delta > 0 ? (
                          <p className="text-[10px] text-[hsl(var(--trust-safe))] flex items-center gap-1"><TrendingDown className="w-3 h-3" /> Net leakage ↓{delta}% next month</p>
                        ) : null;
                      })()}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
