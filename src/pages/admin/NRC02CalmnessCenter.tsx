import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Users, MessageSquare, Shield, Zap, Eye } from "lucide-react";
import { useAssistantRolePresences } from "@/hooks/use-notification-calm-data";
import { DEMO_CALM_PRINCIPLES, DEMO_INTERVENTION_SCENARIOS } from "@/data/seed/notification-calm";
import NRCSubNav from "@/components/admin/NRCSubNav";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
const NRC02CalmnessCenter = () => {
  const { data: roles, isLoading } = useAssistantRolePresences();
  const calmPrinciples = DEMO_CALM_PRINCIPLES;
  const principleIcons = [Eye, Zap, MessageSquare, Shield, Heart, Users];
  const interventions = DEMO_INTERVENTION_SCENARIOS;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
<NRCSubNav />
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
          {isLoading ? <p className="text-xs text-muted-foreground p-4">Loading…</p> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(roles ?? []).map((r: Record<string, any>) => (
                <Card key={r.key ?? r.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{r.role ?? r.display_name}</CardTitle>
                      <Badge variant={(r.priority ?? "P1") === "P0" ? "destructive" : "default"}>{r.priority ?? "P1"}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="text-xs space-y-2">
                    <p className="text-muted-foreground">{r.desc ?? r.description}</p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline">Tone: {r.tone ?? r.tone_mode}</Badge>
                      <Badge variant="outline">Mode: {r.mode ?? (r.proactive ? "proactive" : "reactive")}</Badge>
                      <Badge variant="secondary">Escalation: {r.escalation ?? r.escalation_behavior}</Badge>
                      <Badge variant="secondary">Domain: {r.domain}</Badge>
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono">{r.key ?? r.role_key}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="principles">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {calmPrinciples.map((p, i) => {
              const Icon = principleIcons[i] || Heart;
              return (
                <Card key={p.principle} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2"><Icon className="h-4 w-4 text-primary" />{p.principle}</CardTitle>
                  </CardHeader>
                  <CardContent><p className="text-xs text-muted-foreground">{p.detail}</p></CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="intervention">
          <Card>
            <CardHeader><CardTitle className="text-sm">Intervention Decision Model</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b"><th className="text-left p-2">Scenario</th><th className="p-2">Role</th><th className="text-left p-2">Intervention</th><th className="p-2">Tone</th></tr></thead>
                <tbody>
                  {interventions.map((s) => (
                    <tr key={s.scenario} className="border-b hover:bg-muted/30">
                      <td className="p-2">{s.scenario}</td>
                      <td className="p-2 text-center"><Badge variant="outline">{s.role}</Badge></td>
                      <td className="p-2 text-muted-foreground">{s.intervention}</td>
                      <td className="p-2 text-center"><Badge variant="secondary">{s.tone}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NRC02CalmnessCenter;
