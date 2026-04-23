import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid } from "lucide-react";
import { useInterruptionPolicies } from "@/hooks/use-notification-calm-data";
import NRCSubNav from "@/components/admin/NRCSubNav";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
const NRC04QueueInterruptMatrix = () => {
  const { data: categoryRouting, isLoading } = useInterruptionPolicies();
  const deliveryTypes = DELIVERY_TYPES;
  const quickActions = QUICK_ACTIONS;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
<NRCSubNav />
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10"><LayoutGrid className="h-8 w-8 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold">Queue vs Interrupt Matrix</h1>
          <p className="text-muted-foreground">What becomes a silent queue item, digest, nudge, push, or escalation</p>
        </div>
      </div>

      <Tabs defaultValue="delivery" className="space-y-4">
        <TabsList>
          <TabsTrigger value="delivery">Delivery Types</TabsTrigger>
          <TabsTrigger value="actions">Quick Actions</TabsTrigger>
          <TabsTrigger value="categories">Category Routing</TabsTrigger>
        </TabsList>

        <TabsContent value="delivery">
          <Card>
            <CardHeader><CardTitle className="text-sm">Delivery Strategy Matrix</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b"><th className="text-left p-2">Type</th><th className="text-left p-2">Categories</th><th className="p-2">Urgency</th><th className="p-2">Volume</th><th className="text-left p-2">User Action</th><th className="p-2">Retention</th></tr></thead>
                <tbody>
                  {deliveryTypes.map((d) => (
                    <tr key={d.type} className="border-b hover:bg-muted/30">
                      <td className="p-2 font-medium">{d.type}</td>
                      <td className="p-2 text-muted-foreground max-w-[200px]">{d.cats}</td>
                      <td className="p-2 text-center"><Badge variant="outline">{d.urgency}</Badge></td>
                      <td className="p-2 text-center">{d.volume}</td>
                      <td className="p-2 text-muted-foreground">{d.userAction}</td>
                      <td className="p-2 text-center font-mono">{d.retention}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions">
          <Card>
            <CardHeader><CardTitle className="text-sm">Quick Action Registry</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b"><th className="text-left p-2">Action</th><th className="text-left p-2">Context</th><th className="p-2">Risk</th><th className="text-left p-2">Surfaces</th></tr></thead>
                <tbody>
                  {quickActions.map((a) => (
                    <tr key={a.action} className="border-b hover:bg-muted/30">
                      <td className="p-2 font-medium">{a.action}</td>
                      <td className="p-2 text-muted-foreground">{a.context}</td>
                      <td className="p-2 text-center"><Badge variant={a.risk === "medium" ? "default" : a.risk === "low" ? "secondary" : "outline"}>{a.risk}</Badge></td>
                      <td className="p-2"><div className="flex gap-1">{a.surfaces.map((s) => <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>)}</div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader><CardTitle className="text-sm">Category → Delivery Routing</CardTitle></CardHeader>
            <CardContent>
              {isLoading ? <p className="text-xs text-muted-foreground">Loading…</p> : (
                <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="border-b"><th className="text-left p-2">Category</th><th className="text-left p-2">Default Delivery</th><th className="text-left p-2">Escalation</th><th className="p-2">Priority</th></tr></thead>
                  <tbody>
                    {(categoryRouting ?? []).map((c: Record<string, any>) => (
                      <tr key={c.category ?? c.id} className="border-b hover:bg-muted/30">
                        <td className="p-2 font-mono">{c.category ?? c.policy_name}</td>
                        <td className="p-2">{c.defaultDelivery ?? c.default_delivery}</td>
                        <td className="p-2 text-muted-foreground">{c.escalation ?? c.escalation_rule}</td>
                        <td className="p-2 text-center"><Badge variant={(c.priority ?? "normal") === "critical" ? "destructive" : (c.priority ?? "normal") === "high" ? "default" : "secondary"}>{c.priority ?? "normal"}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NRC04QueueInterruptMatrix;
