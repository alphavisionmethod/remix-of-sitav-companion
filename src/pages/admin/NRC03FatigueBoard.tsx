import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, TrendingDown, Activity, BellOff } from "lucide-react";
import { useFatigueProfiles } from "@/hooks/use-notification-calm-data";
import NRCSubNav from "@/components/admin/NRCSubNav";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
const NRC03FatigueBoard = () => {
  const { data: fatigueSignals, isLoading } = useFatigueProfiles();
  const suppressionActions = [] as never[];
  const overloadTriggers = [] as never[];

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
<NRCSubNav />
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10"><TrendingDown className="h-8 w-8 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold">Fatigue & Interruption Board</h1>
          <p className="text-muted-foreground">Notification fatigue tracking, overload detection, adaptive suppression</p>
        </div>
      </div>

      <Tabs defaultValue="signals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="signals">Fatigue Signals</TabsTrigger>
          <TabsTrigger value="suppression">Adaptive Suppression</TabsTrigger>
          <TabsTrigger value="overload">Overload Triggers</TabsTrigger>
        </TabsList>

        <TabsContent value="signals">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Activity className="h-4 w-4" />Fatigue Signal Weights</CardTitle></CardHeader>
            <CardContent>
              {isLoading ? <p className="text-xs text-muted-foreground">Loading…</p> : (
                <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="border-b"><th className="text-left p-2">Signal</th><th className="p-2">Threshold</th><th className="p-2">Weight</th><th className="text-left p-2">Source</th></tr></thead>
                  <tbody>
                    {(fatigueSignals ?? []).map((s: Record<string, any>) => (
                      <tr key={s.signal ?? s.id} className="border-b hover:bg-muted/30">
                        <td className="p-2 font-medium">{s.signal ?? s.metric_name}</td>
                        <td className="p-2 text-center"><Badge variant="outline">{s.threshold ?? "—"}</Badge></td>
                        <td className="p-2 text-center font-mono">{s.weight ?? s.fatigue_score ?? "—"}</td>
                        <td className="p-2 text-muted-foreground font-mono">{s.source ?? "system"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              )}
              <p className="text-[10px] text-muted-foreground mt-3">Composite fatigue score = weighted sum of all signals (0.0 = fresh, 1.0 = overloaded)</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppression">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><BellOff className="h-4 w-4" />Adaptive Suppression Actions</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b"><th className="text-left p-2">Trigger</th><th className="text-left p-2">Action</th><th className="p-2">Duration</th><th className="text-left p-2">Recovery</th></tr></thead>
                <tbody>
                  {suppressionActions.map((a) => (
                    <tr key={a.trigger} className="border-b hover:bg-muted/30">
                      <td className="p-2"><Badge variant="outline" className="font-mono">{a.trigger}</Badge></td>
                      <td className="p-2 font-medium">{a.action}</td>
                      <td className="p-2 text-center">{a.duration}</td>
                      <td className="p-2 text-muted-foreground">{a.recovery}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overload">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4" />Overload Triggers</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b"><th className="text-left p-2">Trigger</th><th className="p-2">Severity</th><th className="p-2">Auto</th><th className="p-2">Cooldown</th></tr></thead>
                <tbody>
                  {overloadTriggers.map((t) => (
                    <tr key={t.trigger} className="border-b hover:bg-muted/30">
                      <td className="p-2">{t.trigger}</td>
                      <td className="p-2 text-center"><Badge variant={t.severity === "high" ? "destructive" : t.severity === "medium" ? "default" : "secondary"}>{t.severity}</Badge></td>
                      <td className="p-2 text-center">{t.auto ? "✓" : "Manual"}</td>
                      <td className="p-2 text-center">{t.cooldown}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
              <div className="mt-4 p-3 rounded-lg border bg-destructive/5 text-xs flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span>On overload: suppress all non-critical notifications for the cooldown period. Emergency/critical urgency always bypasses.</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NRC03FatigueBoard;
