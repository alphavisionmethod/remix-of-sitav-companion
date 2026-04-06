import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Timer, BrainCircuit, Clock, AlertTriangle, CheckCircle2, Calendar } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const TIMING_RULES = [
  { rule: "Don't bother during workout", context: "workout_state = active", priority: 0, override: "emergency only", category: "suppression" },
  { rule: "Hold low-value alerts when drained", context: "readiness = low/overload", priority: 1, override: "high+ urgency", category: "suppression" },
  { rule: "Show strategic summary when available", context: "readiness = high + available", priority: 2, override: "n/a", category: "proactive" },
  { rule: "Escalate approval if urgent", context: "despite low readiness", priority: 0, override: "always", category: "escalation" },
  { rule: "Schedule planning prompts", context: "ideal_strategic_window", priority: 3, override: "n/a", category: "proactive" },
  { rule: "Batch low-priority updates", context: "readiness = medium", priority: 4, override: "n/a", category: "optimization" },
  { rule: "Delay financial summaries for focus", context: "deep_focus active", priority: 2, override: "market emergency", category: "suppression" },
];

const BRIEFING_WINDOWS = [
  { name: "Morning Strategic Brief", readiness: "high + morning", category: "strategy", content: ["Top priorities", "Key metrics", "Upcoming decisions"], duration: "2-3 min" },
  { name: "Financial Summary", readiness: "high + end of day", category: "finance", content: ["Cash position", "Revenue update", "Outstanding invoices"], duration: "1-2 min" },
  { name: "Weekly Review", readiness: "ideal_strategic_window", category: "review", content: ["Week summary", "Goal progress", "Next week priorities"], duration: "5-7 min" },
  { name: "Quick Decisions", readiness: "medium+ any time", category: "approval", content: ["Pending approvals", "Quick actions", "Time-sensitive items"], duration: "30s-1 min" },
  { name: "Risk Alert", readiness: "any (override)", category: "risk", content: ["Emerging risks", "Threshold breaches", "Urgent items"], duration: "immediate" },
];

const HOLD_VS_ACT = [
  { scenario: "Low readiness + low urgency alert", decision: "HOLD", reason: "Queue for next available window", timing: "Next high readiness window" },
  { scenario: "Low readiness + critical approval", decision: "ACT", reason: "Urgency overrides readiness", timing: "Immediate with minimal context" },
  { scenario: "Deep focus + normal task reminder", decision: "HOLD", reason: "Protect focus time", timing: "Post-focus session" },
  { scenario: "High readiness + strategic opportunity", decision: "ACT", reason: "Ideal window, show strategic content", timing: "Proactive brief" },
  { scenario: "Recovery + financial summary", decision: "HOLD", reason: "Defer cognitive load", timing: "Next high window" },
  { scenario: "Any readiness + emergency", decision: "ACT", reason: "Emergency always overrides", timing: "Immediate full escalation" },
];

const HRS05AssistantTimingBoard = () => (
  <div className="p-6 max-w-[1400px] mx-auto space-y-6">
    <DemoModeBadge />
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-primary/10"><Timer className="h-8 w-8 text-primary" /></div>
      <div>
        <h1 className="text-2xl font-bold">Assistant Timing Logic Board</h1>
        <p className="text-muted-foreground">When the assistant should act, hold, or escalate based on readiness</p>
      </div>
    </div>

    <Tabs defaultValue="rules" className="space-y-4">
      <TabsList>
        <TabsTrigger value="rules">Timing Rules</TabsTrigger>
        <TabsTrigger value="windows">Briefing Windows</TabsTrigger>
        <TabsTrigger value="decisions">Hold vs Act</TabsTrigger>
      </TabsList>

      <TabsContent value="rules">
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><BrainCircuit className="h-4 w-4" />Timing Rule Engine</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-xs">
              <thead><tr className="border-b"><th className="text-left p-2">Rule</th><th className="text-left p-2">Context</th><th className="p-2">Priority</th><th className="p-2">Override</th><th className="p-2">Category</th></tr></thead>
              <tbody>
                {TIMING_RULES.map((r) => (
                  <tr key={r.rule} className="border-b hover:bg-muted/30">
                    <td className="p-2 font-medium">{r.rule}</td>
                    <td className="p-2"><Badge variant="outline" className="font-mono text-[10px]">{r.context}</Badge></td>
                    <td className="p-2 text-center"><Badge variant={r.priority === 0 ? "destructive" : "secondary"}>P{r.priority}</Badge></td>
                    <td className="p-2 text-center text-muted-foreground">{r.override}</td>
                    <td className="p-2 text-center"><Badge variant="outline">{r.category}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="windows">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {BRIEFING_WINDOWS.map((w) => (
            <Card key={w.name} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2"><Calendar className="h-4 w-4" />{w.name}</CardTitle>
                  <Badge variant="outline">{w.duration}</Badge>
                </div>
              </CardHeader>
              <CardContent className="text-xs space-y-2">
                <div className="flex gap-2">
                  <Badge variant="secondary" className="font-mono">{w.readiness}</Badge>
                  <Badge variant="outline">{w.category}</Badge>
                </div>
                <div className="space-y-1">{w.content.map((c) => <div key={c} className="p-1.5 rounded border">{c}</div>)}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="decisions">
        <Card>
          <CardHeader><CardTitle className="text-sm">Hold vs Act Decision Matrix</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-xs">
              <thead><tr className="border-b"><th className="text-left p-2">Scenario</th><th className="p-2">Decision</th><th className="text-left p-2">Reason</th><th className="text-left p-2">Timing</th></tr></thead>
              <tbody>
                {HOLD_VS_ACT.map((h) => (
                  <tr key={h.scenario} className="border-b hover:bg-muted/30">
                    <td className="p-2">{h.scenario}</td>
                    <td className="p-2 text-center"><Badge variant={h.decision === "ACT" ? "default" : "secondary"}>{h.decision}</Badge></td>
                    <td className="p-2 text-muted-foreground">{h.reason}</td>
                    <td className="p-2 text-muted-foreground">{h.timing}</td>
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

export default HRS05AssistantTimingBoard;
