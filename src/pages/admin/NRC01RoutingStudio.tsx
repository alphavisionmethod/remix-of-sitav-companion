import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Route, Smartphone, Watch, Monitor } from "lucide-react";
import { useAttentionDecisions } from "@/hooks/use-notification-calm-data";
import NRCSubNav from "@/components/admin/NRCSubNav";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
const NRC01RoutingStudio = () => {
  const { data: routingMatrix, isLoading } = useAttentionDecisions();
  const channelSpecs = [] as any[];
  const deliveryPrinciples = [] as any[];
  const iconMap: Record<string, any> = { "Desktop/Web": Monitor, "Phone (iOS/Android)": Smartphone, "Watch (Apple/Wear OS)": Watch };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
<NRCSubNav />
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10"><Route className="h-8 w-8 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold">Notification Routing Studio</h1>
          <p className="text-muted-foreground">Attention routing engine — decides when, where, and how to interrupt</p>
        </div>
      </div>

      <Tabs defaultValue="matrix" className="space-y-4">
        <TabsList>
          <TabsTrigger value="matrix">Routing Matrix</TabsTrigger>
          <TabsTrigger value="channels">Channel Specs</TabsTrigger>
          <TabsTrigger value="principles">Principles</TabsTrigger>
        </TabsList>

        <TabsContent value="matrix">
          <Card>
            <CardHeader><CardTitle className="text-sm">Urgency × Context Routing Decision Matrix</CardTitle></CardHeader>
            <CardContent>
              {isLoading ? <p className="text-xs text-muted-foreground">Loading…</p> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead><tr className="border-b">
                      <th className="text-left p-2">Urgency</th>
                      <th className="p-2">Normal Focus</th>
                      <th className="p-2">Deep Work</th>
                      <th className="p-2">Sleeping</th>
                      <th className="p-2">Exercising</th>
                      <th className="p-2">Traveling</th>
                    </tr></thead>
                    <tbody>
                      {(routingMatrix ?? []).map((r: Record<string, any>) => (
                        <tr key={r.urg ?? r.id} className="border-b hover:bg-muted/30">
                          <td className="p-2 font-mono font-medium">{r.urg ?? r.urgency_class}</td>
                          <td className="p-2 text-center">{r.normal ?? r.normal_focus}</td>
                          <td className="p-2 text-center">{r.deep ?? r.deep_work}</td>
                          <td className="p-2 text-center">{r.sleep ?? r.sleeping}</td>
                          <td className="p-2 text-center">{r.exercise ?? r.exercising}</td>
                          <td className="p-2 text-center">{r.travel ?? r.traveling}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {channelSpecs.map((s) => {
              const Icon = iconMap[s.surface] || Monitor;
              return (
                <Card key={s.surface} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2"><Icon className="h-4 w-4 text-primary" />{s.surface}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1">{s.channels.map((c) => <div key={c} className="p-2 rounded border text-xs">{c}</div>)}</div>
                    <div className="flex gap-2 text-xs">
                      <Badge variant="outline">Max: {s.maxConcurrent} concurrent</Badge>
                      {s.dndAware && <Badge variant="secondary">DND-aware</Badge>}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="principles">
          <Card>
            <CardHeader><CardTitle className="text-sm">Routing Principles</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {deliveryPrinciples.map((p) => (
                  <div key={p.principle} className="flex items-start gap-3 p-3 rounded border text-xs">
                    <Badge variant={p.severity === "critical" ? "destructive" : p.severity === "high" ? "default" : "secondary"} className="shrink-0 mt-0.5">{p.severity}</Badge>
                    <div><div className="font-medium">{p.principle}</div><p className="text-muted-foreground mt-0.5">{p.desc}</p></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NRC01RoutingStudio;
