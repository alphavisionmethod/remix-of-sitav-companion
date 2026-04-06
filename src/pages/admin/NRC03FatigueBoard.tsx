import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, TrendingDown, Clock, Activity, Shield, Bell, BellOff } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const FATIGUE_SIGNALS = [
  { signal: "Recent interruption count", threshold: "10+ in 30 min", weight: 0.3, source: "notification_queue" },
  { signal: "Ignored alert rate", threshold: ">60% ignored", weight: 0.25, source: "interaction_log" },
  { signal: "Repeated category frequency", threshold: "3+ same cat in 15 min", weight: 0.15, source: "category_tracker" },
  { signal: "Response time degradation", threshold: "3x baseline", weight: 0.2, source: "response_timer" },
  { signal: "Overload risk (health signal)", threshold: "readiness < low", weight: 0.1, source: "health_signals" },
];

const SUPPRESSION_ACTIONS = [
  { trigger: "Fatigue score > 0.6", action: "Auto-batch repeated categories", duration: "15 min", recovery: "Score drops below 0.4" },
  { trigger: "Fatigue score > 0.7", action: "Extend quiet windows by 50%", duration: "30 min", recovery: "Score drops below 0.5" },
  { trigger: "Fatigue score > 0.8", action: "Convert push → queue for non-critical", duration: "30 min", recovery: "Score drops below 0.6" },
  { trigger: "Fatigue score > 0.9", action: "Summarize instead of individual alerts", duration: "60 min", recovery: "Score drops below 0.7" },
  { trigger: "Overload triggered", action: "Suppress all non-critical for 30 min", duration: "30 min", recovery: "Manual resume or timeout" },
];

const OVERLOAD_TRIGGERS = [
  { trigger: "10+ interruptions in 30 minutes", severity: "high", auto: true, cooldown: "30 min" },
  { trigger: "5+ ignored alerts in sequence", severity: "high", auto: true, cooldown: "15 min" },
  { trigger: "3+ of same category in 15 minutes", severity: "medium", auto: true, cooldown: "15 min" },
  { trigger: "Fatigue score > 0.8", severity: "high", auto: true, cooldown: "30 min" },
  { trigger: "User manually activates quiet mode", severity: "n/a", auto: false, cooldown: "User-defined" },
  { trigger: "Health signal: overload_risk", severity: "high", auto: true, cooldown: "Until readiness improves" },
];

const NRC03FatigueBoard = () => (
  <div className="p-6 max-w-[1400px] mx-auto space-y-6">
    <DemoModeBadge />
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
            <table className="w-full text-xs">
              <thead><tr className="border-b"><th className="text-left p-2">Signal</th><th className="p-2">Threshold</th><th className="p-2">Weight</th><th className="text-left p-2">Source</th></tr></thead>
              <tbody>
                {FATIGUE_SIGNALS.map((s) => (
                  <tr key={s.signal} className="border-b hover:bg-muted/30">
                    <td className="p-2 font-medium">{s.signal}</td>
                    <td className="p-2 text-center"><Badge variant="outline">{s.threshold}</Badge></td>
                    <td className="p-2 text-center font-mono">{s.weight}</td>
                    <td className="p-2 text-muted-foreground font-mono">{s.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[10px] text-muted-foreground mt-3">Composite fatigue score = weighted sum of all signals (0.0 = fresh, 1.0 = overloaded)</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="suppression">
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><BellOff className="h-4 w-4" />Adaptive Suppression Actions</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-xs">
              <thead><tr className="border-b"><th className="text-left p-2">Trigger</th><th className="text-left p-2">Action</th><th className="p-2">Duration</th><th className="text-left p-2">Recovery</th></tr></thead>
              <tbody>
                {SUPPRESSION_ACTIONS.map((a) => (
                  <tr key={a.trigger} className="border-b hover:bg-muted/30">
                    <td className="p-2"><Badge variant="outline" className="font-mono">{a.trigger}</Badge></td>
                    <td className="p-2 font-medium">{a.action}</td>
                    <td className="p-2 text-center">{a.duration}</td>
                    <td className="p-2 text-muted-foreground">{a.recovery}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="overload">
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4" />Overload Triggers</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-xs">
              <thead><tr className="border-b"><th className="text-left p-2">Trigger</th><th className="p-2">Severity</th><th className="p-2">Auto</th><th className="p-2">Cooldown</th></tr></thead>
              <tbody>
                {OVERLOAD_TRIGGERS.map((t) => (
                  <tr key={t.trigger} className="border-b hover:bg-muted/30">
                    <td className="p-2">{t.trigger}</td>
                    <td className="p-2 text-center"><Badge variant={t.severity === "high" ? "destructive" : t.severity === "medium" ? "default" : "secondary"}>{t.severity}</Badge></td>
                    <td className="p-2 text-center">{t.auto ? "✓" : "Manual"}</td>
                    <td className="p-2 text-center">{t.cooldown}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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

export default NRC03FatigueBoard;
