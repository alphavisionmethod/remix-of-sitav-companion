import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LayoutGrid } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const NRC04QueueInterruptMatrix = () => (
  <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <DemoModeBadge />
    <div className="flex items-center gap-3">
      <LayoutGrid className="h-8 w-8 text-primary" />
      <div>
        <h1 className="text-2xl font-bold">Queue vs Interrupt Matrix</h1>
        <p className="text-muted-foreground">What becomes a silent queue item, digest, nudge, push, or escalation</p>
      </div>
    </div>
    <Card>
      <CardHeader><CardTitle className="text-sm">Delivery Strategy</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b">
              <th className="text-left p-2">Delivery Type</th>
              <th className="text-left p-2">Categories</th>
              <th className="p-2">Urgency</th>
            </tr></thead>
            <tbody>
              {[
                { type: "Silent queue", cats: "Info updates, system logs, low-priority reports", urg: "silent/low" },
                { type: "Daily digest", cats: "Summary reports, weekly stats, market updates", urg: "low" },
                { type: "Watch nudge", cats: "Gentle reminders, follow-up checks", urg: "normal" },
                { type: "Phone push", cats: "Approvals, alerts, customer actions", urg: "high" },
                { type: "Desktop work item", cats: "Tasks, workflow steps, document reviews", urg: "normal/high" },
                { type: "Boardroom escalation", cats: "Risk events, financial alerts, critical incidents", urg: "critical" },
              ].map((r) => (
                <tr key={r.type} className="border-b">
                  <td className="p-2 font-medium">{r.type}</td>
                  <td className="p-2 text-muted-foreground">{r.cats}</td>
                  <td className="p-2"><Badge variant="outline">{r.urg}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader><CardTitle className="text-sm">Quick Actions</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {["Approve", "Snooze", "Route later", "Assign to assistant", "Dismiss", "Escalate", "Open context"].map((a) => (
            <div key={a} className="p-2 rounded border text-center">{a}</div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default NRC04QueueInterruptMatrix;
