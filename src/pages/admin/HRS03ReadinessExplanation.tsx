import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, ArrowDown } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const HRS03ReadinessExplanation = () => (
  <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <DemoModeBadge />
    <div className="flex items-center gap-3">
      <Brain className="h-8 w-8 text-primary" />
      <div>
        <h1 className="text-2xl font-bold">Readiness Explanation View</h1>
        <p className="text-muted-foreground">How raw signals become readiness states and interruption postures</p>
      </div>
    </div>
    <Card>
      <CardHeader><CardTitle className="text-sm">Derivation Pipeline</CardTitle></CardHeader>
      <CardContent className="text-xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded border bg-muted/30 flex-1">
            <div className="font-medium">1. Raw Signals</div>
            <p className="text-muted-foreground">heart_rate, sleep, steps, hrv...</p>
          </div>
          <ArrowDown className="h-4 w-4 rotate-[-90deg]" />
          <div className="p-3 rounded border bg-muted/30 flex-1">
            <div className="font-medium">2. Normalized States</div>
            <p className="text-muted-foreground">activity, sleep, strain, recovery, focus</p>
          </div>
          <ArrowDown className="h-4 w-4 rotate-[-90deg]" />
          <div className="p-3 rounded border bg-muted/30 flex-1">
            <div className="font-medium">3. Readiness Level</div>
            <p className="text-muted-foreground">high, medium, low, overload_risk...</p>
          </div>
          <ArrowDown className="h-4 w-4 rotate-[-90deg]" />
          <div className="p-3 rounded border bg-muted/30 flex-1">
            <div className="font-medium">4. Interruption Posture</div>
            <p className="text-muted-foreground">open, selective, restricted, silent</p>
          </div>
        </div>
      </CardContent>
    </Card>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader><CardTitle className="text-sm">Readiness Levels</CardTitle></CardHeader>
        <CardContent className="text-xs space-y-1">
          {["high", "medium", "low", "overload_risk", "recovery_priority", "deep_focus", "dnd_recommended", "low_interruption", "ideal_strategic_window"].map((l) => (
            <div key={l} className="p-1.5 rounded border font-mono">{l}</div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-sm">Combine Strategy</CardTitle></CardHeader>
        <CardContent className="text-xs space-y-2">
          <p>• <strong>worst_case:</strong> If any signal indicates low readiness, overall is low</p>
          <p>• <strong>highest_priority:</strong> Highest-priority rule wins</p>
          <p>• <strong>weighted_average:</strong> Confidence-weighted combination</p>
          <p className="text-muted-foreground mt-2">User can always override derived readiness manually</p>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default HRS03ReadinessExplanation;
