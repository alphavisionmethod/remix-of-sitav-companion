import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Watch, ArrowRight } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const AND02WearOSExperience = () => (
  <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <DemoModeBadge />
    <div className="flex items-center gap-3">
      <Watch className="h-8 w-8 text-primary" />
      <div>
        <h1 className="text-2xl font-bold">Wear OS Experience Board</h1>
        <p className="text-muted-foreground">Tiles, complications, glanceable states, micro-actions, escalation</p>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader><CardTitle className="text-sm">Tiles</CardTitle></CardHeader>
        <CardContent className="text-xs space-y-1">
          <p>• Max active tiles: 5</p>
          <p>• Refresh: every 60s</p>
          <p>• Layouts: compact, expanded, list</p>
          <p>• What-matters-now tile</p>
          <p>• Urgent alerts tile</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-sm">Micro-Actions</CardTitle></CardHeader>
        <CardContent className="text-xs space-y-1">
          <p>• Approve / Reject</p>
          <p>• Snooze</p>
          <p>• Escalate to phone</p>
          <p>• Dismiss</p>
          <p>• Risk ceiling: medium</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Escalation</CardTitle></CardHeader>
        <CardContent className="text-xs space-y-1">
          <p>• Auto-escalate after 90s</p>
          <p>• Watch → Phone handoff</p>
          <p>• Vibration: long pulse on escalation</p>
          <p>• Deep link to full context on phone</p>
        </CardContent>
      </Card>
    </div>
    <Card>
      <CardHeader><CardTitle className="text-sm">Complications</CardTitle></CardHeader>
      <CardContent className="text-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {["Pending approvals count", "Daily pulse score", "Next action timer", "Focus state indicator"].map((c) => (
            <div key={c} className="p-2 rounded border">{c}</div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default AND02WearOSExperience;
