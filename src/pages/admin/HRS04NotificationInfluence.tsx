import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, BellOff, Clock, AlertTriangle, Shield } from "lucide-react";
import { useInterruptionPosture } from "@/hooks/use-health-signal-data";
import { DEMO_SUPPRESSION_RULES, DEMO_TIMING_RULES, DEMO_OVERRIDE_MATRIX } from "@/data/seed/notification-calm";
import HRSSubNav from "@/components/admin/HRSSubNav";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";



const HRS04NotificationInfluence = () => {
  const { data: posture, isLoading } = useInterruptionPosture();
  const suppressionRules = (posture as never[])?.length ? posture : DEMO_SUPPRESSION_RULES;
  const timingRules = DEMO_TIMING_RULES;
  const overrideMatrix = DEMO_OVERRIDE_MATRIX;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
<HRSSubNav />
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10"><Bell className="h-8 w-8 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold">Notification Influence Studio</h1>
          <p className="text-muted-foreground">How readiness states influence notification routing decisions</p>
        </div>
      </div>

      <Tabs defaultValue="suppression" className="space-y-4">
        <TabsList>
          <TabsTrigger value="suppression">Suppression Rules</TabsTrigger>
          <TabsTrigger value="timing">Timing Rules</TabsTrigger>
          <TabsTrigger value="override">Override Matrix</TabsTrigger>
        </TabsList>

        <TabsContent value="suppression">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><BellOff className="h-4 w-4" />Readiness-Based Suppression</CardTitle></CardHeader>
            <CardContent>
              {isLoading ? <p className="text-xs text-muted-foreground">Loading…</p> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead><tr className="border-b"><th className="text-left p-2">Readiness</th><th className="text-left p-2">Action</th><th className="p-2">Min Urgency</th><th className="p-2">Critical Override</th><th className="text-left p-2">Description</th></tr></thead>
                    <tbody>
                      {(suppressionRules as never[]).map((r: Record<string, any>) => (
                        <tr key={r.readiness ?? r.id} className="border-b hover:bg-muted/30">
                          <td className="p-2"><Badge variant="outline" className="font-mono">{r.readiness ?? r.policy_name}</Badge></td>
                          <td className="p-2 font-medium">{r.action}</td>
                          <td className="p-2 text-center"><Badge variant={(r.urgencyThreshold ?? "high") === "critical" ? "destructive" : "default"}>{r.urgencyThreshold ?? "high"}+</Badge></td>
                          <td className="p-2 text-center">{r.override ? <Shield className="h-3 w-3 mx-auto text-amber-500" /> : "—"}</td>
                          <td className="p-2 text-muted-foreground">{r.desc ?? r.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timing">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4" />Timing-Based Rules</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="border-b"><th className="text-left p-2">Readiness Context</th><th className="text-left p-2">Action</th><th className="p-2">Timing</th><th className="p-2">Category</th><th className="text-left p-2">Description</th></tr></thead>
                  <tbody>
                    {timingRules.map((r) => (
                      <tr key={r.readiness} className="border-b hover:bg-muted/30">
                        <td className="p-2"><Badge variant="outline" className="font-mono">{r.readiness}</Badge></td>
                        <td className="p-2 font-medium">{r.action}</td>
                        <td className="p-2 text-center"><Badge variant="secondary">{r.timing}</Badge></td>
                        <td className="p-2 text-center font-mono">{r.category}</td>
                        <td className="p-2 text-muted-foreground">{r.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="override">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4" />Urgency Override Matrix</CardTitle></CardHeader>
            <CardContent>
              <table className="w-full text-xs">
                <thead><tr className="border-b"><th className="text-left p-2">Urgency</th><th className="p-2">Always Delivered</th><th className="p-2">Ignores Readiness</th><th className="p-2">Ignores DND</th></tr></thead>
                <tbody>
                  {overrideMatrix.map((r) => (
                    <tr key={r.urgency} className="border-b hover:bg-muted/30">
                      <td className="p-2 font-mono font-medium">{r.urgency}</td>
                      <td className="p-2 text-center">{r.alwaysDelivered ? "✓" : "—"}</td>
                      <td className="p-2 text-center">{r.ignoresReadiness ? "✓" : "—"}</td>
                      <td className="p-2 text-center">{r.ignoresDND ? "✓" : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-[10px] text-muted-foreground mt-3">Emergency urgency always overrides all readiness states and DND settings.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HRS04NotificationInfluence;
