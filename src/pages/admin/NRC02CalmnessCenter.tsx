import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Users } from "lucide-react";

const NRC02CalmnessCenter = () => (
  <div className="p-6 max-w-[1400px] mx-auto space-y-6">
    <div className="flex items-center gap-3">
      <Heart className="h-8 w-8 text-primary" />
      <div>
        <h1 className="text-2xl font-bold">Assistant Calmness / Intervention Center</h1>
        <p className="text-muted-foreground">Calm AI assistant roles, proactive interventions, premium tone</p>
      </div>
    </div>
    <Card>
      <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4" /> Assistant Roles</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {[
            { role: "Chief of Staff", key: "chief_of_staff", tone: "executive", mode: "proactive", esc: "escalate" },
            { role: "Operator", key: "operator", tone: "concise", mode: "proactive", esc: "auto_handle" },
            { role: "Strategist", key: "strategist", tone: "analytical", mode: "proactive", esc: "recommend" },
            { role: "Money Sentinel", key: "money_sentinel", tone: "precise", mode: "proactive", esc: "alert" },
            { role: "Boardroom Curator", key: "boardroom_curator", tone: "executive", mode: "reactive", esc: "recommend" },
            { role: "Follow-Up Guardian", key: "followup_guardian", tone: "professional", mode: "proactive", esc: "remind" },
            { role: "Risk Watcher", key: "risk_watcher", tone: "direct", mode: "proactive", esc: "escalate" },
            { role: "Calm Filter", key: "calm_filter", tone: "calm", mode: "proactive", esc: "suppress" },
          ].map((r) => (
            <div key={r.key} className="p-3 rounded border">
              <div className="font-medium">{r.role}</div>
              <div className="flex gap-2 mt-1">
                <Badge variant="outline">{r.tone}</Badge>
                <Badge variant="outline">{r.mode}</Badge>
                <Badge variant="outline">{r.esc}</Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader><CardTitle className="text-sm">Calm Principles</CardTitle></CardHeader>
      <CardContent className="text-xs space-y-1">
        <p>• Surface what matters — don't overwhelm</p>
        <p>• Prepare what's needed — don't wait to be asked</p>
        <p>• Remind without nagging — one nudge, not ten</p>
        <p>• Escalate only when justified — not for every low-priority item</p>
        <p>• Summarize instead of spamming — batch and compress</p>
        <p>• Feel composed and elite — premium tone always</p>
      </CardContent>
    </Card>
  </div>
);

export default NRC02CalmnessCenter;
