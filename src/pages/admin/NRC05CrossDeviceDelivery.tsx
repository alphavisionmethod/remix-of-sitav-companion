import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MonitorSmartphone, Smartphone, Watch, Monitor, CheckCircle2, ArrowRight } from "lucide-react";
import { useCrossDeviceSurfaces, useDeliveryRules, useHandoffFlows } from "@/hooks/use-notification-calm-data";
import NRCSubNav from "@/platform/admin/components/admin/NRCSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const NRC05CrossDeviceDelivery = () => {
  const { data: surfaces, isLoading: surfacesLoading } = useCrossDeviceSurfaces();
  const { data: deliveryRules } = useDeliveryRules();
  const { data: handoffFlows } = useHandoffFlows();
  const iconMap: Record<string, any> = { "Desktop/Web": Monitor, "Phone (iOS/Android)": Smartphone, "Watch (Apple/Wear OS)": Watch };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
<NRCSubNav />
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10"><MonitorSmartphone className="h-8 w-8 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold">Cross-Device Delivery Review</h1>
          <p className="text-muted-foreground">How notifications are routed across surfaces based on presence and context</p>
        </div>
      </div>

      <Tabs defaultValue="surfaces" className="space-y-4">
        <TabsList>
          <TabsTrigger value="surfaces">Surface Channels</TabsTrigger>
          <TabsTrigger value="rules">Delivery Rules</TabsTrigger>
          <TabsTrigger value="handoff">Handoff Flows</TabsTrigger>
        </TabsList>

        <TabsContent value="surfaces">
          {surfacesLoading ? <p className="text-xs text-muted-foreground p-4">Loading…</p> : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(surfaces ?? []).map((s: Record<string, any>) => {
                const Icon = iconMap[s.surface] || Monitor;
                return (
                  <Card key={s.surface ?? s.family_key} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2"><Icon className="h-4 w-4 text-primary" />{s.surface ?? s.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {s.channels && <div className="space-y-1">{s.channels.map((c: string) => <div key={c} className="p-2 rounded border text-xs flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-500" />{c}</div>)}</div>}
                      <div className="space-y-1 pt-2 border-t text-xs">
                        <div className="flex justify-between"><span className="text-muted-foreground">Presence signal:</span><Badge variant="outline" className="font-mono">{s.presence ?? s.interaction_type}</Badge></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Fallback:</span><Badge variant="outline">{s.fallback ?? "—"}</Badge></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">DND signal:</span><Badge variant="outline" className="font-mono">{s.dndSignal ?? "—"}</Badge></div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rules">
          <Card>
            <CardHeader><CardTitle className="text-sm">Delivery Rules Engine</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b"><th className="text-left p-2">Rule</th><th className="text-left p-2">Description</th><th className="p-2">Enforcement</th><th className="p-2">Priority</th></tr></thead>
                <tbody>
                  {(deliveryRules ?? []).map((r: Record<string, any>) => (
                    <tr key={r.rule} className="border-b hover:bg-muted/30">
                      <td className="p-2 font-medium">{r.rule}</td>
                      <td className="p-2 text-muted-foreground">{r.desc}</td>
                      <td className="p-2 text-center"><Badge variant={r.enforcement === "hard" ? "default" : "outline"}>{r.enforcement}</Badge></td>
                      <td className="p-2 text-center"><Badge variant={r.priority === "P0" ? "destructive" : "secondary"}>{r.priority}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="handoff">
          <Card>
            <CardHeader><CardTitle className="text-sm">Cross-Surface Handoff Flows</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b"><th className="text-left p-2">From</th><th className="p-2"><ArrowRight className="h-3 w-3 mx-auto" /></th><th className="text-left p-2">To</th><th className="text-left p-2">Context Transferred</th><th className="text-left p-2">Trigger</th><th className="text-left p-2">Method</th></tr></thead>
                <tbody>
                  {(handoffFlows ?? []).map((h: any, i: number) => (
                    <tr key={i} className="border-b hover:bg-muted/30">
                      <td className="p-2 font-medium">{h.from}</td>
                      <td className="p-2 text-center"><ArrowRight className="h-3 w-3 mx-auto text-primary" /></td>
                      <td className="p-2 font-medium">{h.to}</td>
                      <td className="p-2 text-muted-foreground">{typeof h.context === "string" ? h.context : ""}</td>
                      <td className="p-2">{h.trigger}</td>
                      <td className="p-2"><Badge variant="outline">{h.method}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NRC05CrossDeviceDelivery;
