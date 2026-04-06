import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MonitorSmartphone, Smartphone, Watch, Monitor, CheckCircle2, ArrowRight, Shield } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const SURFACES = [
  { surface: "Desktop/Web", icon: Monitor, channels: ["In-app banner", "Browser notification", "Work queue", "Boardroom card", "Inline alert"], presence: "active_tab", fallback: "phone", dndSignal: "browser_focus" },
  { surface: "Phone (iOS/Android)", icon: Smartphone, channels: ["Push notification", "Lock screen action", "App inbox", "Bubble/conversation", "Widget update"], presence: "app_foreground", fallback: "watch", dndSignal: "os_dnd_mode" },
  { surface: "Watch (Apple/Wear OS)", icon: Watch, channels: ["Haptic alert", "Glance card", "Micro-action", "Complication update"], presence: "wrist_detected", fallback: "phone", dndSignal: "theater_mode" },
];

const DELIVERY_RULES = [
  { rule: "No duplicate delivery", desc: "Never show the same notification on all surfaces simultaneously", enforcement: "hard", priority: "P0" },
  { rule: "Presence-based routing", desc: "Route to the most appropriate device based on user presence signals", enforcement: "hard", priority: "P0" },
  { rule: "DND/Focus respect", desc: "Honor platform-level DND and focus modes on each device", enforcement: "hard", priority: "P0" },
  { rule: "Urgency-based escalation", desc: "Escalate across surfaces only when justified by urgency + elapsed time", enforcement: "soft", priority: "P1" },
  { rule: "Delivery receipt tracking", desc: "Track delivery, seen, and acted states per surface per notification", enforcement: "hard", priority: "P1" },
  { rule: "Cross-surface dedup", desc: "If user acts on one surface, dismiss on all others", enforcement: "hard", priority: "P0" },
  { rule: "Fallback chain", desc: "If primary surface is unavailable, try fallback chain", enforcement: "soft", priority: "P1" },
];

const HANDOFF_FLOWS = [
  { from: "Watch", to: "Phone", context: "Approval context, alert detail, full thread", trigger: "User taps 'Open on Phone'", method: "Deep link via push" },
  { from: "Phone", to: "Desktop", context: "Full document, workflow, boardroom", trigger: "User taps 'Continue on Desktop'", method: "URL scheme / Continuity" },
  { from: "Desktop", to: "Phone", context: "Quick approval, mobile task", trigger: "User away from desktop > 5 min", method: "Push notification" },
  { from: "Any", to: "Email", context: "Digest, summary, expired actions", trigger: "No interaction after 24h", method: "Email digest" },
];

const NRC05CrossDeviceDelivery = () => (
  <div className="p-6 max-w-[1400px] mx-auto space-y-6">
    <DemoModeBadge />
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SURFACES.map((s) => (
            <Card key={s.surface} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><s.icon className="h-4 w-4 text-primary" />{s.surface}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">{s.channels.map((c) => <div key={c} className="p-2 rounded border text-xs flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-500" />{c}</div>)}</div>
                <div className="space-y-1 pt-2 border-t text-xs">
                  <div className="flex justify-between"><span className="text-muted-foreground">Presence signal:</span><Badge variant="outline" className="font-mono">{s.presence}</Badge></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Fallback:</span><Badge variant="outline">{s.fallback}</Badge></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">DND signal:</span><Badge variant="outline" className="font-mono">{s.dndSignal}</Badge></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="rules">
        <Card>
          <CardHeader><CardTitle className="text-sm">Delivery Rules Engine</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-xs">
              <thead><tr className="border-b"><th className="text-left p-2">Rule</th><th className="text-left p-2">Description</th><th className="p-2">Enforcement</th><th className="p-2">Priority</th></tr></thead>
              <tbody>
                {DELIVERY_RULES.map((r) => (
                  <tr key={r.rule} className="border-b hover:bg-muted/30">
                    <td className="p-2 font-medium">{r.rule}</td>
                    <td className="p-2 text-muted-foreground">{r.desc}</td>
                    <td className="p-2 text-center"><Badge variant={r.enforcement === "hard" ? "default" : "outline"}>{r.enforcement}</Badge></td>
                    <td className="p-2 text-center"><Badge variant={r.priority === "P0" ? "destructive" : "secondary"}>{r.priority}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="handoff">
        <Card>
          <CardHeader><CardTitle className="text-sm">Cross-Surface Handoff Flows</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-xs">
              <thead><tr className="border-b"><th className="text-left p-2">From</th><th className="p-2"><ArrowRight className="h-3 w-3 mx-auto" /></th><th className="text-left p-2">To</th><th className="text-left p-2">Context Transferred</th><th className="text-left p-2">Trigger</th><th className="text-left p-2">Method</th></tr></thead>
              <tbody>
                {HANDOFF_FLOWS.map((h, i) => (
                  <tr key={i} className="border-b hover:bg-muted/30">
                    <td className="p-2 font-medium">{h.from}</td>
                    <td className="p-2 text-center"><ArrowRight className="h-3 w-3 mx-auto text-primary" /></td>
                    <td className="p-2 font-medium">{h.to}</td>
                    <td className="p-2 text-muted-foreground">{h.context}</td>
                    <td className="p-2">{h.trigger}</td>
                    <td className="p-2"><Badge variant="outline">{h.method}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
);

export default NRC05CrossDeviceDelivery;
