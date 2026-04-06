import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { ShieldCheck, Heart, Lock, Eye, AlertTriangle, CheckCircle2, Trash2, Clock, FileText } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const CONSENT_CATEGORIES = [
  { cat: "Ingestion", key: "ingestion", desc: "Allow SITA to read this signal from provider", icon: Eye, risk: "low" },
  { cat: "Routing Influence", key: "routing", desc: "Allow signal to influence notification routing", icon: ShieldCheck, risk: "medium" },
  { cat: "Boardroom Visibility", key: "boardroom", desc: "Allow signal summary in boardroom briefings", icon: FileText, risk: "medium" },
  { cat: "Assistant Use", key: "assistant", desc: "Allow assistant to reference signal-derived state", icon: Heart, risk: "high" },
];

const PRINCIPLES = [
  "Every signal type requires explicit opt-in",
  "Routing influence requires separate consent from ingestion",
  "Boardroom visibility requires explicit signal-level approval",
  "Assistant use requires separate consent from boardroom",
  "Revoke & erase available at any time — immediate effect",
  "Privacy explanation mandatory before consent grant",
  "No signal data shared with third parties",
  "Consent state version-controlled and auditable",
  "Granular per-signal, per-scope control",
  "Derived data inherits strictest consent of its inputs",
];

const REVOCATION_ACTIONS = [
  { action: "Revoke ingestion", effect: "Stops all data collection from this signal type", timeline: "Immediate", cascade: "Also revokes routing, boardroom, assistant" },
  { action: "Revoke routing influence", effect: "Signal no longer affects notification decisions", timeline: "Immediate", cascade: "None" },
  { action: "Revoke boardroom visibility", effect: "Signal removed from all briefing summaries", timeline: "Next briefing cycle", cascade: "None" },
  { action: "Revoke assistant use", effect: "Assistant cannot reference signal-derived state", timeline: "Immediate", cascade: "None" },
  { action: "Erase all data", effect: "Complete removal from all stores", timeline: "Within 24 hours", cascade: "All scopes revoked, audit trail preserved" },
];

const HRS01HealthConsentCenter = () => {
  const [enabledCats, setEnabledCats] = useState<Record<string, boolean>>(Object.fromEntries(CONSENT_CATEGORIES.map(c => [c.key, false])));

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <DemoModeBadge />
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10"><ShieldCheck className="h-8 w-8 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold">Health & Readiness Consent Center</h1>
          <p className="text-muted-foreground">Signal-level consent governance, privacy controls, revoke/erase</p>
        </div>
      </div>

      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList>
          <TabsTrigger value="categories">Consent Categories</TabsTrigger>
          <TabsTrigger value="principles">Principles</TabsTrigger>
          <TabsTrigger value="revocation">Revocation</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CONSENT_CATEGORIES.map((c) => (
              <Card key={c.key} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2"><c.icon className="h-4 w-4" />{c.cat}</CardTitle>
                    <Switch checked={enabledCats[c.key]} onCheckedChange={(v) => setEnabledCats(prev => ({ ...prev, [c.key]: v }))} />
                  </div>
                </CardHeader>
                <CardContent className="text-xs space-y-2">
                  <p className="text-muted-foreground">{c.desc}</p>
                  <div className="flex gap-2">
                    <Badge variant={enabledCats[c.key] ? "default" : "secondary"}>{enabledCats[c.key] ? "Enabled" : "Disabled"}</Badge>
                    <Badge variant={c.risk === "high" ? "destructive" : c.risk === "medium" ? "default" : "secondary"}>Risk: {c.risk}</Badge>
                  </div>
                  {c.key !== "ingestion" && !enabledCats["ingestion"] && enabledCats[c.key] && (
                    <div className="flex items-center gap-1 text-amber-500"><AlertTriangle className="h-3 w-3" /><span>Requires ingestion consent first</span></div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="principles">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Lock className="h-4 w-4" />Core Consent Principles</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {PRINCIPLES.map((p, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded border text-xs"><CheckCircle2 className="h-3 w-3 text-green-500 shrink-0 mt-0.5" />{p}</div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revocation">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Trash2 className="h-4 w-4" />Revocation Actions</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="border-b"><th className="text-left p-2">Action</th><th className="text-left p-2">Effect</th><th className="p-2">Timeline</th><th className="text-left p-2">Cascade</th></tr></thead>
                  <tbody>
                    {REVOCATION_ACTIONS.map((r) => (
                      <tr key={r.action} className="border-b hover:bg-muted/30">
                        <td className="p-2 font-medium">{r.action}</td>
                        <td className="p-2 text-muted-foreground">{r.effect}</td>
                        <td className="p-2 text-center"><Badge variant="outline">{r.timeline}</Badge></td>
                        <td className="p-2 text-muted-foreground">{r.cascade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader><CardTitle className="text-sm">Consent Audit Configuration</CardTitle></CardHeader>
            <CardContent className="text-xs space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { label: "Events logged", value: "All consent changes", icon: CheckCircle2 },
                  { label: "Audit retention", value: "7 years (GDPR/HIPAA)", icon: Clock },
                  { label: "Export formats", value: "JSON, PDF, CSV", icon: FileText },
                ].map((a) => (
                  <div key={a.label} className="p-3 rounded border flex items-center gap-2">
                    <a.icon className="h-4 w-4 text-primary" />
                    <div><div className="font-medium">{a.label}</div><div className="text-muted-foreground">{a.value}</div></div>
                  </div>
                ))}
              </div>
              <p className="text-muted-foreground">All consent events are cryptographically signed and stored in an append-only audit log. Events include: consent grant, revocation, data access, erasure request, and scope change.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HRS01HealthConsentCenter;
