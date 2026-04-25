import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Timer, BrainCircuit, Calendar, AlertTriangle, Loader2 } from "lucide-react";
import { useReadinessStates } from "@/hooks/use-health-signal-data";
import HRSSubNav from "@/platform/admin/components/admin/HRSSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
const BRIEFING_WINDOWS = [] as any[];
const HOLD_VS_ACT = [] as any[];

const HRS05AssistantTimingBoard = () => {
  const { data: dbReadiness, isLoading } = useReadinessStates(5);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
<HRSSubNav />
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10"><Timer className="h-8 w-8 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold">Assistant Timing Logic Board</h1>
          <p className="text-muted-foreground">When the assistant should act, hold, or escalate based on readiness</p>
        </div>
      </div>

      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rules">Timing Rules</TabsTrigger>
          <TabsTrigger value="windows">Briefing Windows</TabsTrigger>
          <TabsTrigger value="decisions">Hold vs Act</TabsTrigger>
          <TabsTrigger value="live">Live Readiness</TabsTrigger>
        </TabsList>

        <TabsContent value="rules">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><BrainCircuit className="h-4 w-4" />Timing Rule Engine</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b"><th className="text-left p-2">Rule</th><th className="text-left p-2">Context</th><th className="p-2">Priority</th><th className="p-2">Override</th><th className="p-2">Category</th></tr></thead>
                <tbody>
                  {([] as any[]).map((r) => (
                    <tr key={r.rule} className="border-b hover:bg-muted/30">
                      <td className="p-2 font-medium">{r.rule}</td>
                      <td className="p-2"><Badge variant="outline" className="font-mono text-[10px]">{r.context}</Badge></td>
                      <td className="p-2 text-center"><Badge variant={r.priority === 0 ? "destructive" : "secondary"}>P{r.priority}</Badge></td>
                      <td className="p-2 text-center text-muted-foreground">{r.override}</td>
                      <td className="p-2 text-center"><Badge variant="outline">{r.category}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="windows">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {BRIEFING_WINDOWS.map((w) => (
              <Card key={w.name} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2"><Calendar className="h-4 w-4" />{w.name}</CardTitle>
                    <Badge variant="outline">{w.duration}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="text-xs space-y-2">
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="font-mono">{w.readiness}</Badge>
                    <Badge variant="outline">{w.category}</Badge>
                  </div>
                  <div className="space-y-1">{w.content.map((c) => <div key={c} className="p-1.5 rounded border">{c}</div>)}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="decisions">
          <Card>
            <CardHeader><CardTitle className="text-sm">Hold vs Act Decision Matrix</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b"><th className="text-left p-2">Scenario</th><th className="p-2">Decision</th><th className="text-left p-2">Reason</th><th className="text-left p-2">Timing</th></tr></thead>
                <tbody>
                  {HOLD_VS_ACT.map((h) => (
                    <tr key={h.scenario} className="border-b hover:bg-muted/30">
                      <td className="p-2">{h.scenario}</td>
                      <td className="p-2 text-center"><Badge variant={h.decision === "ACT" ? "default" : "secondary"}>{h.decision}</Badge></td>
                      <td className="p-2 text-muted-foreground">{h.reason}</td>
                      <td className="p-2 text-muted-foreground">{h.timing}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="live">
          {isLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : !dbReadiness?.length ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No readiness states in database. When signals are active, timing decisions based on real readiness will appear here.</CardContent></Card>
          ) : (
            <Card>
              <CardHeader><CardTitle className="text-sm">Current Readiness → Timing Decisions</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dbReadiness.map((r: Record<string, any>) => {
                    const level = r.readiness_level || "unknown";
                    const timingDecision = level === "high" ? "Open — all briefings eligible" : level === "low" ? "Restricted — high+ urgency only" : level === "overload_risk" ? "Suppressed — emergency only" : "Standard routing";
                    return (
                      <div key={r.id} className="p-3 rounded-lg border flex items-center justify-between">
                        <div>
                          <span className="text-sm font-mono font-medium">{level}</span>
                          <span className="text-xs text-muted-foreground ml-2">confidence: {r.confidence != null ? `${Math.round(r.confidence * 100)}%` : "—"}</span>
                        </div>
                        <div className="text-xs text-right">
                          <div className="font-medium">{timingDecision}</div>
                          <div className="text-muted-foreground">{new Date(r.assessed_at).toLocaleString()}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HRS05AssistantTimingBoard;
