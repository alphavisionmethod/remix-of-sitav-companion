import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, ArrowRight, Activity, AlertTriangle, CheckCircle2 } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const PIPELINE_STAGES = [
  { stage: 1, name: "Raw Signals", desc: "heart_rate, sleep, steps, hrv, workout, focus_mode", color: "bg-blue-500/10", examples: ["72 bpm", "7.2h sleep", "8,500 steps"] },
  { stage: 2, name: "Normalized States", desc: "activity, sleep_quality, strain, recovery, focus", color: "bg-green-500/10", examples: ["activity: moderate", "sleep: good", "strain: high"] },
  { stage: 3, name: "Readiness Level", desc: "high, medium, low, overload_risk, deep_focus", color: "bg-amber-500/10", examples: ["readiness: medium", "context: post-workout"] },
  { stage: 4, name: "Interruption Posture", desc: "open, selective, restricted, silent", color: "bg-purple-500/10", examples: ["posture: selective", "override: emergency-only"] },
];

const READINESS_LEVELS = [
  { level: "high", desc: "User is alert, rested, and available", routing: "All notifications, strategic prompts", color: "text-green-500" },
  { level: "medium", desc: "Normal state, no special considerations", routing: "Standard routing, prefer summary", color: "text-primary" },
  { level: "low", desc: "User is tired or depleted", routing: "Only high+ urgency", color: "text-amber-500" },
  { level: "overload_risk", desc: "Multiple stress signals detected", routing: "Suppress all non-critical", color: "text-destructive" },
  { level: "recovery_priority", desc: "Post-exercise or post-illness", routing: "Suppress unless high+", color: "text-amber-500" },
  { level: "deep_focus", desc: "Extended focus session detected", routing: "Defer low + normal", color: "text-blue-500" },
  { level: "dnd_recommended", desc: "Device DND or sleep mode active", routing: "Queue for next window", color: "text-muted-foreground" },
  { level: "low_interruption", desc: "User preferences indicate minimal interruption", routing: "Queue, digest only", color: "text-muted-foreground" },
  { level: "ideal_strategic_window", desc: "High readiness + available time block", routing: "Strategic brief, planning prompts", color: "text-green-500" },
];

const COMBINE_STRATEGIES = [
  { name: "worst_case", desc: "If any signal indicates low readiness, overall is low", use: "Default for health-sensitive decisions" },
  { name: "highest_priority", desc: "Highest-priority rule wins regardless of others", use: "Override scenarios (emergency, DND)" },
  { name: "weighted_average", desc: "Confidence-weighted combination of all signals", use: "Normal ambient assessment" },
  { name: "user_override", desc: "User manually sets readiness state", use: "Always takes precedence" },
];

const HRS03ReadinessExplanation = () => (
  <div className="p-6 max-w-[1400px] mx-auto space-y-6">
    <DemoModeBadge />
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-primary/10"><Brain className="h-8 w-8 text-primary" /></div>
      <div>
        <h1 className="text-2xl font-bold">Readiness Explanation View</h1>
        <p className="text-muted-foreground">How raw signals become readiness states and interruption postures</p>
      </div>
    </div>

    <Tabs defaultValue="pipeline" className="space-y-4">
      <TabsList>
        <TabsTrigger value="pipeline">Derivation Pipeline</TabsTrigger>
        <TabsTrigger value="levels">Readiness Levels</TabsTrigger>
        <TabsTrigger value="combine">Combine Strategy</TabsTrigger>
      </TabsList>

      <TabsContent value="pipeline">
        <Card>
          <CardHeader><CardTitle className="text-sm">Signal → Readiness Pipeline</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-stretch gap-3 flex-wrap">
              {PIPELINE_STAGES.map((s, i) => (
                <div key={s.stage} className="flex items-center gap-3 flex-1 min-w-[200px]">
                  {i > 0 && <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />}
                  <div className={`p-4 rounded-lg border ${s.color} flex-1`}>
                    <div className="font-medium text-sm">{s.stage}. {s.name}</div>
                    <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
                    <div className="mt-2 space-y-1">
                      {s.examples.map((e) => <div key={e} className="text-[10px] font-mono bg-background/50 px-2 py-0.5 rounded">{e}</div>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="levels">
        <Card>
          <CardHeader><CardTitle className="text-sm">Readiness Level Registry</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b"><th className="text-left p-2">Level</th><th className="text-left p-2">Description</th><th className="text-left p-2">Routing Effect</th></tr></thead>
                <tbody>
                  {READINESS_LEVELS.map((l) => (
                    <tr key={l.level} className="border-b hover:bg-muted/30">
                      <td className="p-2"><span className={`font-mono font-medium ${l.color}`}>{l.level}</span></td>
                      <td className="p-2 text-muted-foreground">{l.desc}</td>
                      <td className="p-2">{l.routing}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="combine">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {COMBINE_STRATEGIES.map((s) => (
            <Card key={s.name}>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-mono">{s.name}</CardTitle></CardHeader>
              <CardContent className="text-xs space-y-2">
                <p>{s.desc}</p>
                <Badge variant="outline">Use case: {s.use}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="mt-4">
          <CardContent className="pt-4 text-xs flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" /><span>User can always override derived readiness manually. Manual override takes precedence over all automated signals.</span></CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
);

export default HRS03ReadinessExplanation;
