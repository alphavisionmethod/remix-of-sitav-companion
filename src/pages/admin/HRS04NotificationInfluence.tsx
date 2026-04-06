import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, BellOff, Clock, AlertTriangle, ArrowRight, Shield } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const SUPPRESSION_RULES = [
  { readiness: "overload_risk", action: "Suppress all non-critical", urgencyThreshold: "critical", override: true, desc: "User is at risk of overload — only emergencies get through" },
  { readiness: "deep_focus", action: "Defer low + normal urgency", urgencyThreshold: "high", override: true, desc: "Extended focus detected — protect deep work time" },
  { readiness: "recovery_priority", action: "Suppress unless high+", urgencyThreshold: "high", override: false, desc: "Post-exercise/illness — minimize load" },
  { readiness: "low_interruption", action: "Queue for next window", urgencyThreshold: "high", override: false, desc: "User set minimal interruption preference" },
  { readiness: "dnd_recommended", action: "Silent queue only", urgencyThreshold: "critical", override: true, desc: "Device DND or sleep mode detected" },
];

const TIMING_RULES = [
  { readiness: "ideal_strategic_window", action: "Show strategic brief", timing: "Proactive", category: "briefing", desc: "Best time for important planning and review" },
  { readiness: "high", action: "Normal routing, all channels", timing: "Standard", category: "all", desc: "User is alert and available" },
  { readiness: "medium", action: "Prefer summary over push", timing: "Batched", category: "digest", desc: "Normal state — compress where possible" },
  { readiness: "high + morning", action: "Morning strategic brief", timing: "Scheduled", category: "briefing", desc: "Optimal window for strategic content" },
  { readiness: "high + end_of_day", action: "Financial summary", timing: "Scheduled", category: "finance", desc: "Optimal window for financial review" },
];

const OVERRIDE_MATRIX = [
  { urgency: "emergency", alwaysDelivered: true, ignoresReadiness: true, ignoresDND: true },
  { urgency: "critical", alwaysDelivered: true, ignoresReadiness: true, ignoresDND: false },
  { urgency: "high", alwaysDelivered: false, ignoresReadiness: false, ignoresDND: false },
  { urgency: "normal", alwaysDelivered: false, ignoresReadiness: false, ignoresDND: false },
  { urgency: "low", alwaysDelivered: false, ignoresReadiness: false, ignoresDND: false },
  { urgency: "silent", alwaysDelivered: false, ignoresReadiness: false, ignoresDND: false },
];

const HRS04NotificationInfluence = () => (
  <div className="p-6 max-w-[1400px] mx-auto space-y-6">
    <DemoModeBadge />
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
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b"><th className="text-left p-2">Readiness</th><th className="text-left p-2">Action</th><th className="p-2">Min Urgency</th><th className="p-2">Critical Override</th><th className="text-left p-2">Description</th></tr></thead>
                <tbody>
                  {SUPPRESSION_RULES.map((r) => (
                    <tr key={r.readiness} className="border-b hover:bg-muted/30">
                      <td className="p-2"><Badge variant="outline" className="font-mono">{r.readiness}</Badge></td>
                      <td className="p-2 font-medium">{r.action}</td>
                      <td className="p-2 text-center"><Badge variant={r.urgencyThreshold === "critical" ? "destructive" : "default"}>{r.urgencyThreshold}+</Badge></td>
                      <td className="p-2 text-center">{r.override ? <Shield className="h-3 w-3 mx-auto text-amber-500" /> : "—"}</td>
                      <td className="p-2 text-muted-foreground">{r.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
                  {TIMING_RULES.map((r) => (
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
                {OVERRIDE_MATRIX.map((r) => (
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

export default HRS04NotificationInfluence;
