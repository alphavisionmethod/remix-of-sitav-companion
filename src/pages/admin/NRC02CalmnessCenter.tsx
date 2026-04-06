import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Users, MessageSquare, Shield, Zap, Eye } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const ROLES = [
  { role: "Chief of Staff", key: "chief_of_staff", tone: "executive", mode: "proactive", escalation: "escalate", domain: "all", desc: "Surfaces what matters, prepares context, orchestrates other roles", priority: "P0" },
  { role: "Operator", key: "operator", tone: "concise", mode: "proactive", escalation: "auto_handle", domain: "operations", desc: "Handles routine tasks, follows up, executes workflows", priority: "P0" },
  { role: "Strategist", key: "strategist", tone: "analytical", mode: "proactive", escalation: "recommend", domain: "strategy", desc: "Analyzes patterns, spots opportunities, recommends actions", priority: "P1" },
  { role: "Money Sentinel", key: "money_sentinel", tone: "precise", mode: "proactive", escalation: "alert", domain: "finance", desc: "Monitors financial health, flags anomalies, tracks cash flow", priority: "P0" },
  { role: "Boardroom Curator", key: "boardroom_curator", tone: "executive", mode: "reactive", escalation: "recommend", domain: "boardroom", desc: "Curates boardroom briefings, enriches data, provides context", priority: "P1" },
  { role: "Follow-Up Guardian", key: "followup_guardian", tone: "professional", mode: "proactive", escalation: "remind", domain: "relationships", desc: "Tracks commitments, reminds on follow-ups, prevents drops", priority: "P1" },
  { role: "Risk Watcher", key: "risk_watcher", tone: "direct", mode: "proactive", escalation: "escalate", domain: "risk", desc: "Monitors risk signals, alerts on thresholds, proposes mitigations", priority: "P0" },
  { role: "Calm Filter", key: "calm_filter", tone: "calm", mode: "proactive", escalation: "suppress", domain: "attention", desc: "Reduces noise, batches updates, protects focus time", priority: "P0" },
];

const CALM_PRINCIPLES = [
  { principle: "Surface what matters", detail: "Don't overwhelm — show the 3 most important things, not 30", icon: Eye },
  { principle: "Prepare what's needed", detail: "Don't wait to be asked — anticipate and prepare context", icon: Zap },
  { principle: "Remind without nagging", detail: "One nudge, not ten — escalate only if truly urgent", icon: MessageSquare },
  { principle: "Escalate only when justified", detail: "Not every low-priority item deserves an interruption", icon: Shield },
  { principle: "Summarize instead of spamming", detail: "Batch and compress — 1 digest beats 15 notifications", icon: Heart },
  { principle: "Premium tone always", detail: "Feel composed, elite, and respectful of the user's time", icon: Users },
];

const NRC02CalmnessCenter = () => (
  <div className="p-6 max-w-[1400px] mx-auto space-y-6">
    <DemoModeBadge />
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-primary/10"><Heart className="h-8 w-8 text-primary" /></div>
      <div>
        <h1 className="text-2xl font-bold">Assistant Calmness / Intervention Center</h1>
        <p className="text-muted-foreground">Calm AI assistant roles, proactive interventions, premium tone</p>
      </div>
    </div>

    <Tabs defaultValue="roles" className="space-y-4">
      <TabsList>
        <TabsTrigger value="roles">Assistant Roles</TabsTrigger>
        <TabsTrigger value="principles">Calm Principles</TabsTrigger>
        <TabsTrigger value="intervention">Intervention Model</TabsTrigger>
      </TabsList>

      <TabsContent value="roles">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ROLES.map((r) => (
            <Card key={r.key} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{r.role}</CardTitle>
                  <Badge variant={r.priority === "P0" ? "destructive" : "default"}>{r.priority}</Badge>
                </div>
              </CardHeader>
              <CardContent className="text-xs space-y-2">
                <p className="text-muted-foreground">{r.desc}</p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline">Tone: {r.tone}</Badge>
                  <Badge variant="outline">Mode: {r.mode}</Badge>
                  <Badge variant="secondary">Escalation: {r.escalation}</Badge>
                  <Badge variant="secondary">Domain: {r.domain}</Badge>
                </div>
                <div className="text-[10px] text-muted-foreground font-mono">{r.key}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="principles">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CALM_PRINCIPLES.map((p) => (
            <Card key={p.principle} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><p.icon className="h-4 w-4 text-primary" />{p.principle}</CardTitle>
              </CardHeader>
              <CardContent><p className="text-xs text-muted-foreground">{p.detail}</p></CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="intervention">
        <Card>
          <CardHeader><CardTitle className="text-sm">Intervention Decision Model</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-xs">
              <thead><tr className="border-b"><th className="text-left p-2">Scenario</th><th className="p-2">Role</th><th className="text-left p-2">Intervention</th><th className="p-2">Tone</th></tr></thead>
              <tbody>
                {[
                  { scenario: "Cash below threshold", role: "Money Sentinel", intervention: "Alert with context + suggested actions", tone: "precise" },
                  { scenario: "Overdue follow-up", role: "Follow-Up Guardian", intervention: "Gentle reminder with last contact info", tone: "professional" },
                  { scenario: "10+ notifications in 30min", role: "Calm Filter", intervention: "Batch into digest, suppress low-priority", tone: "calm" },
                  { scenario: "Strategic opportunity detected", role: "Strategist", intervention: "Briefing at next ideal window", tone: "analytical" },
                  { scenario: "Urgent approval pending", role: "Chief of Staff", intervention: "Escalate with full context + recommendation", tone: "executive" },
                  { scenario: "Risk threshold breach", role: "Risk Watcher", intervention: "Immediate alert with mitigation options", tone: "direct" },
                ].map((s) => (
                  <tr key={s.scenario} className="border-b hover:bg-muted/30">
                    <td className="p-2">{s.scenario}</td>
                    <td className="p-2 text-center"><Badge variant="outline">{s.role}</Badge></td>
                    <td className="p-2 text-muted-foreground">{s.intervention}</td>
                    <td className="p-2 text-center"><Badge variant="secondary">{s.tone}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
);

export default NRC02CalmnessCenter;
