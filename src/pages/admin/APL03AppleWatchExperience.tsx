import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Watch, Vibrate, CheckCircle, ArrowRight, Clock, Zap, Eye, AlertTriangle, Smartphone, Bell } from "lucide-react";
import { DEMO_GLANCE_CARDS, DEMO_HAPTIC_PATTERNS, DEMO_MICRO_CONSTRAINTS } from "@/data/seed/admin-platform";
import APLSubNav from "@/components/admin/APLSubNav";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";

const APL03AppleWatchExperience = () => {
  const { isDemoMode } = useDataMode();
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
<APLSubNav />
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10"><Watch className="h-8 w-8 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold">Apple Watch Experience Board</h1>
          <p className="text-muted-foreground">Glance cards, micro-approvals, haptic routing, escalation flows</p>
        </div>
      </div>

      <Tabs defaultValue="glances" className="space-y-4">
        <TabsList>
          <TabsTrigger value="glances">Glance Cards</TabsTrigger>
          <TabsTrigger value="haptics">Haptic Patterns</TabsTrigger>
          <TabsTrigger value="micro">Micro-Approval</TabsTrigger>
          <TabsTrigger value="escalation">Escalation Flow</TabsTrigger>
        </TabsList>

        <TabsContent value="glances">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DEMO_GLANCE_CARDS.map((card) => (
              <Card key={card.id} className={`cursor-pointer transition-all ${selectedCard === card.id ? "ring-2 ring-primary" : "hover:shadow-md"}`} onClick={() => setSelectedCard(selectedCard === card.id ? null : card.id)}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2"><Eye className="h-4 w-4" />{card.name}</CardTitle>
                    <Badge variant={card.priority === 0 ? "destructive" : "outline"}>P{card.priority}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="text-xs space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded border"><Clock className="h-3 w-3 inline mr-1" />Refresh: {card.refresh}</div>
                    <div className="p-2 rounded border"><Zap className="h-3 w-3 inline mr-1" />Max: {card.maxItems} items</div>
                  </div>
                  <div className="flex flex-wrap gap-1">{card.sources.map((s) => <Badge key={s} variant="secondary" className="text-[10px] font-mono">{s}</Badge>)}</div>
                  <p className="text-muted-foreground">{card.interaction}</p>
                  {selectedCard === card.id && (
                    <div className="p-3 rounded bg-muted/30 border-t space-y-1">
                      <p className="font-medium">Rendering constraints:</p>
                      <p>• 42mm: single column, truncated text</p>
                      <p>• 45mm+: optional secondary line</p>
                      <p>• Always-On: dimmed, no sensitive data</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="haptics">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Vibrate className="h-4 w-4" />Haptic Pattern Library</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="border-b">
                    <th className="text-left p-2">Pattern</th>
                    <th className="p-2">Type</th>
                    <th className="p-2">Intensity</th>
                    <th className="p-2">Repeat</th>
                    <th className="text-left p-2">Description</th>
                  </tr></thead>
                  <tbody>
                    {DEMO_HAPTIC_PATTERNS.map((h) => (
                      <tr key={h.pattern} className="border-b hover:bg-muted/30">
                        <td className="p-2 font-medium">{h.pattern}</td>
                        <td className="p-2 text-center"><Badge variant="outline">{h.type}</Badge></td>
                        <td className="p-2 text-center"><Badge variant={h.intensity === "strong" ? "destructive" : h.intensity === "medium" ? "default" : "secondary"}>{h.intensity}</Badge></td>
                        <td className="p-2 text-center font-mono">{h.repeat}×</td>
                        <td className="p-2 text-muted-foreground">{h.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="micro">
          <Card>
            <CardHeader><CardTitle className="text-sm">Micro-Approval Constraints</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {DEMO_MICRO_CONSTRAINTS.map((c) => (
                  <div key={c.label} className="p-3 rounded border space-y-1">
                    <div className="text-xs font-medium">{c.label}</div>
                    <div className="text-sm font-mono font-bold">{c.value}</div>
                    <div className="text-[10px] text-muted-foreground">{c.desc}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="mt-4">
            <CardHeader><CardTitle className="text-sm">Approval Action Flow</CardTitle></CardHeader>
            <CardContent className="text-xs space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                {["Notification arrives", "→", "Glance card renders", "→", "User taps Approve/Reject", "→", "Haptic confirmation", "→", "Synced to server"].map((step, i) => (
                  <div key={i} className={step === "→" ? "text-primary font-bold" : "p-2 rounded border bg-muted/30"}>{step}</div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="escalation">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><ArrowRight className="h-4 w-4" />Escalation Rules</CardTitle></CardHeader>
              <CardContent className="text-xs space-y-2">
                {[
                  { action: "Snooze", result: "Defer to queue — revisit in digest", icon: Clock },
                  { action: "Escalate", result: "Push to iPhone with full context", icon: Smartphone },
                  { action: "Open on Phone", result: "Deep link handoff via Continuity", icon: ArrowRight },
                  { action: "Auto-escalate", result: "No response after 120s → push to iPhone", icon: AlertTriangle },
                  { action: "Dismiss", result: "Remove from watch, keep in queue", icon: Bell },
                ].map((e) => (
                  <div key={e.action} className="flex items-center gap-3 p-2 rounded border">
                    <e.icon className="h-4 w-4 text-primary shrink-0" />
                    <div><span className="font-medium">{e.action}:</span> <span className="text-muted-foreground">{e.result}</span></div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Risk Tier Actions</CardTitle></CardHeader>
              <CardContent className="text-xs space-y-2">
                {[
                  { risk: "Low", watchAction: "Approve directly", escalate: false },
                  { risk: "Medium", watchAction: "Approve with wrist detection", escalate: false },
                  { risk: "High", watchAction: "View only — escalate to phone", escalate: true },
                  { risk: "Critical", watchAction: "Not shown on watch", escalate: true },
                ].map((r) => (
                  <div key={r.risk} className="flex items-center justify-between p-2 rounded border">
                    <Badge variant={r.risk === "Critical" ? "destructive" : r.risk === "High" ? "default" : "outline"}>{r.risk}</Badge>
                    <span>{r.watchAction}</span>
                    {r.escalate && <Badge variant="secondary">escalates</Badge>}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default APL03AppleWatchExperience;
