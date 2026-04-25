import { AdminControlPlaneShell as AdminShell } from "@/platform/admin/components/admin/shells/AdminControlPlaneShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, Target, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { BoardAPI } from "@/lib/services/board-api-client";

export default function AdvisorProfitabilityDashboard() {
  const signalsQuery = useQuery({ queryKey: ["admin-profit-signals"], queryFn: () => BoardAPI.listProfitSignals(100) });
  const healthQuery = useQuery({ queryKey: ["admin-health"], queryFn: () => BoardAPI.getHealth(20) });

  const signals = signalsQuery.data?.signals ?? [];
  const healthScores = healthQuery.data?.scores ?? [];

  const leaks = signals.filter(s => s.category === "leak");
  const recoveries = signals.filter(s => s.category === "recovery");
  const efficiencies = signals.filter(s => s.category === "efficiency");
  const detected = signals.filter(s => s.status === "detected");
  const resolved = signals.filter(s => s.status === "resolved");

  const totalImpact = signals.reduce((s, sig) => s + (sig.estimated_impact_cents ?? 0), 0);
  const resolvedImpact = resolved.reduce((s, sig) => s + (sig.actual_impact_cents ?? 0), 0);

  return (
    <AdminShell contextScope="Profitability Dashboard">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-primary" />
            Profitability Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Profit signal quality, leak patterns, recovery tracking, and health scores</p>
        </div>

        <div className="grid grid-cols-5 gap-3">
          <Card className="p-3 text-center">
            <AlertTriangle className="h-4 w-4 mx-auto text-destructive" />
            <p className="text-lg font-bold mt-1">{detected.length}</p>
            <p className="text-[10px] text-muted-foreground">Active Signals</p>
          </Card>
          <Card className="p-3 text-center">
            <TrendingDown className="h-4 w-4 mx-auto text-destructive" />
            <p className="text-lg font-bold mt-1">{leaks.length}</p>
            <p className="text-[10px] text-muted-foreground">Leaks</p>
          </Card>
          <Card className="p-3 text-center">
            <TrendingUp className="h-4 w-4 mx-auto text-[hsl(var(--chart-2))]" />
            <p className="text-lg font-bold mt-1">{recoveries.length}</p>
            <p className="text-[10px] text-muted-foreground">Recoveries</p>
          </Card>
          <Card className="p-3 text-center">
            <Target className="h-4 w-4 mx-auto text-primary" />
            <p className="text-lg font-bold mt-1">${(totalImpact / 100).toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">Est. Impact</p>
          </Card>
          <Card className="p-3 text-center">
            <Activity className="h-4 w-4 mx-auto text-[hsl(var(--chart-2))]" />
            <p className="text-lg font-bold mt-1">${(resolvedImpact / 100).toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">Realized</p>
          </Card>
        </div>

        {/* Health Scores */}
        {healthScores.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Business Health Dimensions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {healthScores.map(h => (
                  <div key={h.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                    <span className="text-xs capitalize">{h.dimension}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${h.score * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono">{Math.round(h.score * 100)}%</span>
                      <Badge variant={h.trend === "improving" ? "default" : h.trend === "declining" ? "destructive" : "secondary"} className="text-[8px]">
                        {h.trend}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All ({signals.length})</TabsTrigger>
            <TabsTrigger value="leaks">Leaks ({leaks.length})</TabsTrigger>
            <TabsTrigger value="recoveries">Recoveries ({recoveries.length})</TabsTrigger>
            <TabsTrigger value="efficiency">Efficiency ({efficiencies.length})</TabsTrigger>
          </TabsList>
          {[
            { key: "all", data: signals },
            { key: "leaks", data: leaks },
            { key: "recoveries", data: recoveries },
            { key: "efficiency", data: efficiencies },
          ].map(tab => (
            <TabsContent key={tab.key} value={tab.key} className="space-y-2 mt-3">
              {tab.data.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No signals in this category</p>}
              {tab.data.map(s => (
                <Card key={s.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium">{s.title}</p>
                      <p className="text-[10px] text-muted-foreground">{s.signal_type} · {s.urgency}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {s.estimated_impact_cents && (
                        <Badge variant="outline" className="text-[9px]">${(s.estimated_impact_cents / 100).toLocaleString()}</Badge>
                      )}
                      <Badge variant={s.status === "resolved" ? "default" : "secondary"} className="text-[9px]">{s.status}</Badge>
                    </div>
                  </div>
                  {s.description && <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{s.description}</p>}
                </Card>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AdminShell>
  );
}
