import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingDown } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const NRC03FatigueBoard = () => (
  <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <DemoModeBadge />
    <div className="flex items-center gap-3">
      <TrendingDown className="h-8 w-8 text-primary" />
      <div>
        <h1 className="text-2xl font-bold">Fatigue & Interruption Board</h1>
        <p className="text-muted-foreground">Notification fatigue tracking, overload detection, adaptive suppression</p>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader><CardTitle className="text-sm">Fatigue Signals</CardTitle></CardHeader>
        <CardContent className="text-xs space-y-1">
          <p>• Recent interruption count</p>
          <p>• Ignored alert rate</p>
          <p>• Repeated category frequency</p>
          <p>• Response time degradation</p>
          <p>• Overload risk score</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-sm">Adaptive Suppression</CardTitle></CardHeader>
        <CardContent className="text-xs space-y-1">
          <p>• Auto-batch repeated categories</p>
          <p>• Extend quiet windows on fatigue</p>
          <p>• Convert push → queue on overload</p>
          <p>• Summarize instead of individual alerts</p>
          <p>• Respect user-set quiet hours</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Overload Triggers</CardTitle></CardHeader>
        <CardContent className="text-xs space-y-1">
          <p>• 10+ interruptions in 30 minutes</p>
          <p>• 5+ ignored alerts in sequence</p>
          <p>• 3+ of same category in 15 minutes</p>
          <p>• Fatigue score &gt; 0.8</p>
          <p className="text-muted-foreground mt-2">On overload: suppress all non-critical for 30min</p>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default NRC03FatigueBoard;
