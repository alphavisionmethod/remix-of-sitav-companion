import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Route, Smartphone, Watch, Monitor, ArrowRight, Shield, AlertTriangle } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const ROUTING_MATRIX = [
  { urg: "silent", normal: "queue", deep: "queue", sleep: "queue", exercise: "queue", travel: "queue" },
  { urg: "low", normal: "queue", deep: "queue", sleep: "queue", exercise: "queue", travel: "queue" },
  { urg: "normal", normal: "desktop banner", deep: "defer", sleep: "defer", exercise: "defer", travel: "phone push" },
  { urg: "high", normal: "phone push", deep: "phone push", sleep: "defer 30min", exercise: "watch nudge", travel: "phone push" },
  { urg: "critical", normal: "urgent escalation", deep: "phone push", sleep: "phone push", exercise: "watch alert", travel: "phone push" },
  { urg: "emergency", normal: "all surfaces", deep: "all surfaces", sleep: "all surfaces", exercise: "all surfaces", travel: "all surfaces" },
];

const CHANNEL_SPECS = [
  { surface: "Desktop/Web", icon: Monitor, channels: ["In-app banner", "Browser notification", "Work queue item", "Boardroom card", "Inline alert"], maxConcurrent: 3, dndAware: true },
  { surface: "Phone (iOS/Android)", icon: Smartphone, channels: ["Push notification", "Lock screen action", "App inbox", "Bubble/conversation", "Widget update"], maxConcurrent: 5, dndAware: true },
  { surface: "Watch (Apple/Wear OS)", icon: Watch, channels: ["Haptic alert", "Glance card", "Micro-action", "Complication update"], maxConcurrent: 2, dndAware: true },
];

const DELIVERY_PRINCIPLES = [
  { principle: "No duplicate delivery", desc: "Never show the same notification on all surfaces simultaneously", severity: "critical" },
  { principle: "Presence-based routing", desc: "Route to the device where user is most active", severity: "high" },
  { principle: "DND/Focus respect", desc: "Honor platform-level focus modes on each device", severity: "high" },
  { principle: "Urgency-based escalation", desc: "Only escalate across surfaces when justified by urgency + time", severity: "medium" },
  { principle: "Delivery receipt tracking", desc: "Track seen/acted per surface for coherent follow-up", severity: "medium" },
  { principle: "Fatigue-aware batching", desc: "Batch repeated categories to prevent overload", severity: "high" },
  { principle: "Summary compression", desc: "Compress multi-item notifications into digest format", severity: "medium" },
];

const NRC01RoutingStudio = () => (
  <div className="p-6 max-w-[1400px] mx-auto space-y-6">
    <DemoModeBadge />
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
                  {ROUTING_MATRIX.map((r) => (
                    <tr key={r.urg} className="border-b hover:bg-muted/30">
                      <td className="p-2 font-mono font-medium">{r.urg}</td>
                      <td className="p-2 text-center">{r.normal}</td>
                      <td className="p-2 text-center">{r.deep}</td>
                      <td className="p-2 text-center">{r.sleep}</td>
                      <td className="p-2 text-center">{r.exercise}</td>
                      <td className="p-2 text-center">{r.travel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="channels">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CHANNEL_SPECS.map((s) => (
            <Card key={s.surface} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><s.icon className="h-4 w-4 text-primary" />{s.surface}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">{s.channels.map((c) => <div key={c} className="p-2 rounded border text-xs">{c}</div>)}</div>
                <div className="flex gap-2 text-xs">
                  <Badge variant="outline">Max: {s.maxConcurrent} concurrent</Badge>
                  {s.dndAware && <Badge variant="secondary">DND-aware</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="principles">
        <Card>
          <CardHeader><CardTitle className="text-sm">Routing Principles</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {DELIVERY_PRINCIPLES.map((p) => (
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

export default NRC01RoutingStudio;
