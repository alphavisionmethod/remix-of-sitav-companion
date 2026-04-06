import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, Bell, Clock, CheckCircle2 } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const DELIVERY_TYPES = [
  { type: "Silent queue", cats: "Info updates, system logs, low-priority reports", urgency: "silent/low", volume: "high", userAction: "Pull (check inbox)", retention: "7 days" },
  { type: "Daily digest", cats: "Summary reports, weekly stats, market updates", urgency: "low", volume: "1/day", userAction: "Read summary", retention: "30 days" },
  { type: "Watch nudge", cats: "Gentle reminders, follow-up checks", urgency: "normal", volume: "limited", userAction: "Tap to expand or dismiss", retention: "24 hours" },
  { type: "Phone push", cats: "Approvals, alerts, customer actions", urgency: "high", volume: "moderate", userAction: "Tap to act or snooze", retention: "Until acted" },
  { type: "Desktop work item", cats: "Tasks, workflow steps, document reviews", urgency: "normal/high", volume: "moderate", userAction: "Click to open workspace", retention: "Until completed" },
  { type: "Boardroom escalation", cats: "Risk events, financial alerts, critical incidents", urgency: "critical", volume: "rare", userAction: "Full context + immediate action", retention: "Permanent" },
];

const QUICK_ACTIONS = [
  { action: "Approve", context: "Pending approval items", risk: "medium", surfaces: ["phone", "watch", "desktop"] },
  { action: "Snooze", context: "Any interruptible notification", risk: "none", surfaces: ["phone", "watch", "desktop"] },
  { action: "Route later", context: "Queue for a better time", risk: "none", surfaces: ["phone", "desktop"] },
  { action: "Assign to assistant", context: "Delegate handling to AI role", risk: "low", surfaces: ["phone", "desktop"] },
  { action: "Dismiss", context: "Remove notification", risk: "none", surfaces: ["phone", "watch", "desktop"] },
  { action: "Escalate", context: "Route to higher urgency", risk: "low", surfaces: ["phone", "desktop"] },
  { action: "Open context", context: "View full detail in app", risk: "none", surfaces: ["phone", "desktop"] },
];

const CATEGORY_ROUTING = [
  { category: "approval", defaultDelivery: "phone push", escalation: "boardroom after 2h", priority: "high" },
  { category: "financial_alert", defaultDelivery: "phone push", escalation: "boardroom after 15min", priority: "critical" },
  { category: "follow_up", defaultDelivery: "daily digest", escalation: "phone push after 48h", priority: "normal" },
  { category: "system_update", defaultDelivery: "silent queue", escalation: "none", priority: "low" },
  { category: "customer_action", defaultDelivery: "phone push", escalation: "boardroom after 1h", priority: "high" },
  { category: "risk_event", defaultDelivery: "boardroom escalation", escalation: "all surfaces immediate", priority: "critical" },
  { category: "routine_report", defaultDelivery: "daily digest", escalation: "none", priority: "low" },
];

const NRC04QueueInterruptMatrix = () => (
  <div className="p-6 max-w-[1400px] mx-auto space-y-6">
    <DemoModeBadge />
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
            <table className="w-full text-xs">
              <thead><tr className="border-b"><th className="text-left p-2">Type</th><th className="text-left p-2">Categories</th><th className="p-2">Urgency</th><th className="p-2">Volume</th><th className="text-left p-2">User Action</th><th className="p-2">Retention</th></tr></thead>
              <tbody>
                {DELIVERY_TYPES.map((d) => (
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
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="actions">
        <Card>
          <CardHeader><CardTitle className="text-sm">Quick Action Registry</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-xs">
              <thead><tr className="border-b"><th className="text-left p-2">Action</th><th className="text-left p-2">Context</th><th className="p-2">Risk</th><th className="text-left p-2">Surfaces</th></tr></thead>
              <tbody>
                {QUICK_ACTIONS.map((a) => (
                  <tr key={a.action} className="border-b hover:bg-muted/30">
                    <td className="p-2 font-medium">{a.action}</td>
                    <td className="p-2 text-muted-foreground">{a.context}</td>
                    <td className="p-2 text-center"><Badge variant={a.risk === "medium" ? "default" : a.risk === "low" ? "secondary" : "outline"}>{a.risk}</Badge></td>
                    <td className="p-2"><div className="flex gap-1">{a.surfaces.map((s) => <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>)}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="categories">
        <Card>
          <CardHeader><CardTitle className="text-sm">Category → Delivery Routing</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-xs">
              <thead><tr className="border-b"><th className="text-left p-2">Category</th><th className="text-left p-2">Default Delivery</th><th className="text-left p-2">Escalation</th><th className="p-2">Priority</th></tr></thead>
              <tbody>
                {CATEGORY_ROUTING.map((c) => (
                  <tr key={c.category} className="border-b hover:bg-muted/30">
                    <td className="p-2 font-mono">{c.category}</td>
                    <td className="p-2">{c.defaultDelivery}</td>
                    <td className="p-2 text-muted-foreground">{c.escalation}</td>
                    <td className="p-2 text-center"><Badge variant={c.priority === "critical" ? "destructive" : c.priority === "high" ? "default" : "secondary"}>{c.priority}</Badge></td>
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

export default NRC04QueueInterruptMatrix;
