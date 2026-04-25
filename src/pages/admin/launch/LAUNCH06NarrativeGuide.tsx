import { useState, useEffect } from "react";
import { SitaPageHeader } from "@/platform/sita/components/sita/SitaPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { computeLaunchReadiness, type LaunchNarrative } from "@/lib/core-services/launch-readiness/launch-readiness-engine";
export default function LAUNCH06NarrativeGuide() {
const [narrative, setNarrative] = useState<LaunchNarrative | null>(null);
  const [mode, setMode] = useState("");
  useEffect(() => { const r = computeLaunchReadiness(null); setNarrative(r.narrative); setMode(r.modeLabel); }, []);

  if (!narrative) return null;

  const sections = [
    { title: "Safe to Say", icon: CheckCircle, color: "text-emerald-400", items: narrative.safeToClaim, bg: "bg-emerald-500/5" },
    { title: "Qualify Carefully", icon: AlertTriangle, color: "text-amber-400", items: narrative.qualifyCarefully, bg: "bg-amber-500/5" },
    { title: "Do Not Claim", icon: XCircle, color: "text-destructive", items: narrative.doNotClaim, bg: "bg-destructive/5" },
  ];

  return (
    <div className="space-y-6 p-6" data-testid="launch06-narrative-guide">
      <SitaPageHeader icon={<MessageSquare className="h-6 w-6" />} title="Launch Narrative & Claim Guide" subtitle={`GTM-safe claim guidance — Current mode: ${mode}`} />

      <div className="space-y-4">
        {sections.map(s => (
          <Card key={s.title} className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <s.icon className={`h-4 w-4 ${s.color}`} /> {s.title} ({s.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {s.items.map((item, i) => (
                <div key={i} className={`p-2 rounded text-[11px] text-foreground ${s.bg}`}>
                  {item}
                </div>
              ))}
              {s.items.length === 0 && <p className="text-[10px] text-muted-foreground">No items in this category</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Launch Mode Narratives</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: "Pilot Narrative", text: narrative.pilotNarrative },
            { label: "Private Beta Narrative", text: narrative.privateBetaNarrative },
            { label: "Public Launch Narrative", text: narrative.publicLaunchNarrative },
          ].map(n => (
            <div key={n.label}>
              <Badge variant="outline" className="text-[9px] mb-1">{n.label}</Badge>
              <p className="text-[11px] text-muted-foreground">{n.text}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
