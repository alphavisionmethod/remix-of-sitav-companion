import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Watch, Vibrate, CheckCircle, ArrowRight } from "lucide-react";

const APL03AppleWatchExperience = () => (
  <div className="p-6 max-w-[1400px] mx-auto space-y-6">
    <div className="flex items-center gap-3">
      <Watch className="h-8 w-8 text-primary" />
      <div>
        <h1 className="text-2xl font-bold">Apple Watch Experience Board</h1>
        <p className="text-muted-foreground">Glance cards, micro-approvals, haptic routing, escalation flows</p>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Glance Cards</CardTitle></CardHeader>
        <CardContent className="text-xs space-y-1">
          <p>• What-matters-now summary</p>
          <p>• Urgent filtered alerts</p>
          <p>• Daily pulse compact view</p>
          <p>• Max visible: 3 cards</p>
          <p>• Refresh: every 60s</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Vibrate className="h-4 w-4" /> Haptic Patterns</CardTitle></CardHeader>
        <CardContent className="text-xs space-y-1">
          {[
            { pattern: "Urgent Alert", type: "notification" },
            { pattern: "Approval Request", type: "success" },
            { pattern: "Gentle Nudge", type: "click" },
            { pattern: "Escalation", type: "directionUp" },
          ].map((h) => (
            <div key={h.pattern} className="flex justify-between p-1">
              <span>{h.pattern}</span>
              <Badge variant="outline">{h.type}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Escalation Flow</CardTitle></CardHeader>
        <CardContent className="text-xs space-y-2">
          <p>• Snooze → defer to queue</p>
          <p>• Escalate → push to iPhone</p>
          <p>• Open on Phone → deep link handoff</p>
          <p>• Auto-escalate after 120s if no response</p>
          <p className="text-muted-foreground mt-2">Max risk tier for watch: medium</p>
        </CardContent>
      </Card>
    </div>
    <Card>
      <CardHeader><CardTitle className="text-sm">Micro-Approval Constraints</CardTitle></CardHeader>
      <CardContent className="text-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-2 rounded border"><span className="font-medium">Max pending:</span> 5</div>
          <div className="p-2 rounded border"><span className="font-medium">Risk ceiling:</span> medium</div>
          <div className="p-2 rounded border"><span className="font-medium">Biometric:</span> wrist detection</div>
          <div className="p-2 rounded border"><span className="font-medium">Batch:</span> not supported</div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default APL03AppleWatchExperience;
