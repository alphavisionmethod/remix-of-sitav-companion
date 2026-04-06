import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Route, Smartphone, Watch, Monitor } from "lucide-react";

const NRC01RoutingStudio = () => (
  <div className="p-6 max-w-[1400px] mx-auto space-y-6">
    <div className="flex items-center gap-3">
      <Route className="h-8 w-8 text-primary" />
      <div>
        <h1 className="text-2xl font-bold">Notification Routing Studio</h1>
        <p className="text-muted-foreground">Attention routing engine — decides when, where, and how to interrupt</p>
      </div>
    </div>
    <Card>
      <CardHeader><CardTitle className="text-sm">Routing Decision Matrix</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b">
              <th className="text-left p-2">Urgency</th>
              <th className="p-2">Normal Focus</th>
              <th className="p-2">Deep Work</th>
              <th className="p-2">Sleeping</th>
              <th className="p-2">Exercising</th>
            </tr></thead>
            <tbody>
              {[
                { urg: "silent", normal: "queue", deep: "queue", sleep: "queue", exercise: "queue" },
                { urg: "low", normal: "queue", deep: "queue", sleep: "queue", exercise: "queue" },
                { urg: "normal", normal: "desktop banner", deep: "defer", sleep: "defer", exercise: "defer" },
                { urg: "high", normal: "phone push", deep: "phone push", sleep: "defer", exercise: "defer" },
                { urg: "critical", normal: "urgent escalation", deep: "phone push", sleep: "phone push", exercise: "watch alert" },
                { urg: "emergency", normal: "urgent escalation", deep: "urgent escalation", sleep: "urgent escalation", exercise: "urgent escalation" },
              ].map((r) => (
                <tr key={r.urg} className="border-b">
                  <td className="p-2 font-mono font-medium">{r.urg}</td>
                  <td className="p-2">{r.normal}</td>
                  <td className="p-2">{r.deep}</td>
                  <td className="p-2">{r.sleep}</td>
                  <td className="p-2">{r.exercise}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Monitor className="h-4 w-4" /> Desktop</CardTitle></CardHeader>
        <CardContent className="text-xs">Banner notification, work queue item, inline alert</CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Smartphone className="h-4 w-4" /> Phone</CardTitle></CardHeader>
        <CardContent className="text-xs">Push notification, lock screen action, app inbox</CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Watch className="h-4 w-4" /> Watch</CardTitle></CardHeader>
        <CardContent className="text-xs">Haptic alert, glance card, micro-action</CardContent>
      </Card>
    </div>
  </div>
);

export default NRC01RoutingStudio;
