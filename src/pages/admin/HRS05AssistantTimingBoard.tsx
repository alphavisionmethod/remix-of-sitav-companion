import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Timer, BrainCircuit } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const HRS05AssistantTimingBoard = () => (
  <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <DemoModeBadge />
    <div className="flex items-center gap-3">
      <Timer className="h-8 w-8 text-primary" />
      <div>
        <h1 className="text-2xl font-bold">Assistant Timing Logic Board</h1>
        <p className="text-muted-foreground">When the assistant should act, hold, or escalate based on readiness</p>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><BrainCircuit className="h-4 w-4" /> Timing Rules</CardTitle></CardHeader>
        <CardContent className="text-xs space-y-2">
          {[
            { rule: "Don't bother during workout", context: "workout_state active" },
            { rule: "Hold low-value alerts when drained", context: "readiness = low/overload" },
            { rule: "Show strategic summary when available", context: "readiness = high" },
            { rule: "Escalate approval if urgent", context: "despite low readiness" },
            { rule: "Schedule planning prompts for best state", context: "ideal_strategic_window" },
          ].map((r, i) => (
            <div key={i} className="flex justify-between p-2 rounded border">
              <span className="font-medium">{r.rule}</span>
              <Badge variant="outline">{r.context}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-sm">Ideal Briefing Windows</CardTitle></CardHeader>
        <CardContent className="text-xs space-y-2">
          <p>The assistant identifies optimal windows for:</p>
          <div className="space-y-1 mt-2">
            <div className="p-2 rounded border">📋 Strategic brief → high readiness + morning</div>
            <div className="p-2 rounded border">💰 Financial summary → high readiness + end of day</div>
            <div className="p-2 rounded border">📊 Weekly review → ideal_strategic_window</div>
            <div className="p-2 rounded border">⚡ Quick decisions → medium+ readiness</div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default HRS05AssistantTimingBoard;
