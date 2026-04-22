import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { Dna, TrendingUp, Target, Sparkles, ArrowUpRight, BarChart3, AlertTriangle, Shield, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { DEMO_GROWTH_TRAITS, DEMO_PLAYS, DEMO_REV_ARCHETYPES as DEMO_ARCHETYPES, DEMO_GROWTH_FIREWALL_ALERTS } from "@/data/seed/revenue-office";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";

const statusColor = (s: string) => s === "strong" ? "text-[hsl(var(--trust-safe))]" : s === "moderate" ? "text-yellow-400" : s === "warning" ? "text-orange-400" : "text-destructive";
const severityColor = (s: string) => s === "critical" ? "border-destructive/30 bg-destructive/5" : "border-orange-400/30 bg-orange-400/5";

const GrowthDNA = () => {
  const { isDemoMode } = useDataMode();
  const [tab, setTab] = useState("traits");
  const avg = Math.round((isDemoMode ? DEMO_GROWTH_TRAITS : [] as typeof DEMO_GROWTH_TRAITS).reduce((a, t) => a + t.score, 0) / (isDemoMode ? DEMO_GROWTH_TRAITS : [] as typeof DEMO_GROWTH_TRAITS).length);
  const criticalAlerts = DEMO_GROWTH_FIREWALL_ALERTS.filter(a => a.severity === "critical").length;

  return (
    <div className="space-y-6 p-6">
<SitaPageHeader icon={<Dna className="h-5 w-5" />} title="Growth DNA" subtitle="Deep business growth pattern analysis, strategic positioning, and behavioral firewall" />

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { l: "Growth Health", v: `${avg}/100`, c: avg >= 70 ? "text-[hsl(var(--trust-safe))]" : "text-orange-400" },
          { l: "Strong Traits", v: (isDemoMode ? DEMO_GROWTH_TRAITS : [] as typeof DEMO_GROWTH_TRAITS).filter(t => t.status === "strong").length, c: "text-[hsl(var(--trust-safe))]" },
          { l: "Warning Traits", v: (isDemoMode ? DEMO_GROWTH_TRAITS : [] as typeof DEMO_GROWTH_TRAITS).filter(t => t.status === "warning").length, c: "text-orange-400" },
          { l: "Firewall Alerts", v: (isDemoMode ? DEMO_GROWTH_FIREWALL_ALERTS : [] as typeof DEMO_GROWTH_FIREWALL_ALERTS).length, c: criticalAlerts > 0 ? "text-destructive" : "text-orange-400" },
          { l: "Active Plays", v: (isDemoMode ? DEMO_PLAYS : [] as typeof DEMO_PLAYS).filter(p => p.impact === "high").length, c: "text-primary" },
        ].map(m => (
          <div key={m.l} className="rounded-xl border border-border/40 bg-card p-3 text-center">
            <p className="text-xs text-muted-foreground">{m.l}</p>
            <p className={`text-xl font-bold ${m.c}`}>{m.v}</p>
          </div>
        ))}
      </div>

      {/* Growth Firewall Alerts */}
      {(isDemoMode ? DEMO_GROWTH_FIREWALL_ALERTS : [] as typeof DEMO_GROWTH_FIREWALL_ALERTS).length > 0 && (
        <Card className="border-orange-400/30 bg-orange-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-orange-400" /> Growth Firewall Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(isDemoMode ? DEMO_GROWTH_FIREWALL_ALERTS : [] as typeof DEMO_GROWTH_FIREWALL_ALERTS).map(alert => (
              <div key={alert.ruleId} className={`p-3 rounded-lg border ${severityColor(alert.severity)}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`h-4 w-4 ${alert.severity === "critical" ? "text-destructive" : "text-orange-400"}`} />
                    <span className="text-sm font-medium text-foreground">{alert.ruleName}</span>
                  </div>
                  <Badge variant={alert.severity === "critical" ? "destructive" : "outline"} className="text-[10px]">{alert.severity}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-1">{alert.description}</p>
                <p className="text-xs text-primary flex items-center gap-1"><Zap className="h-3 w-3" />{alert.recommendation}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="traits"><BarChart3 className="h-3.5 w-3.5 mr-1" />Traits</TabsTrigger>
          <TabsTrigger value="archetype"><Target className="h-3.5 w-3.5 mr-1" />Archetype</TabsTrigger>
          <TabsTrigger value="plays"><Sparkles className="h-3.5 w-3.5 mr-1" />Plays</TabsTrigger>
        </TabsList>

        <TabsContent value="traits" className="space-y-2 mt-4">
          {(isDemoMode ? DEMO_GROWTH_TRAITS : [] as typeof DEMO_GROWTH_TRAITS).map(t => (
            <div key={t.trait} className="rounded-xl border border-border/40 bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{t.trait}</span>
                  <Badge variant="outline" className={statusColor(t.status)}>{t.status}</Badge>
                </div>
                <span className="text-lg font-bold">{t.score}</span>
              </div>
              <Progress value={t.score} className="h-1.5 mb-2" />
              <p className="text-xs text-muted-foreground mb-1">{t.insight}</p>
              <div className="flex items-center gap-1 text-xs text-primary"><ArrowUpRight className="h-3 w-3" /><span>{t.recommendation}</span></div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="archetype" className="space-y-3 mt-4">
          {(isDemoMode ? DEMO_ARCHETYPES : [] as typeof DEMO_ARCHETYPES).map(a => {
            const isTop = a.match > 70;
            // Check if any firewall alert relates to this archetype
            const conflictsWithFirewall = a.risks.some(r =>
              (isDemoMode ? DEMO_GROWTH_FIREWALL_ALERTS : [] as typeof DEMO_GROWTH_FIREWALL_ALERTS).some(alert => alert.description.toLowerCase().includes(r.toLowerCase().split(" ")[0]))
            );
            return (
              <div key={a.name} className={`rounded-xl border p-4 ${isTop ? "border-primary/50 bg-primary/5" : "border-border/40 bg-card"}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{a.name}</span>
                    {conflictsWithFirewall && <Badge variant="outline" className="text-[10px] text-orange-400 border-orange-400/30">⚠ Firewall conflict</Badge>}
                  </div>
                  <Badge variant={isTop ? "default" : "outline"}>{a.match}% match</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{a.description}</p>
                <div className="flex gap-1 flex-wrap">
                  {a.strengths.map(s => <Badge key={s} variant="outline" className="text-[10px] text-[hsl(var(--trust-safe))]">{s}</Badge>)}
                  {a.risks.map(r => <Badge key={r} variant="outline" className="text-[10px] text-orange-400">{r}</Badge>)}
                </div>
                {isTop && (
                  <div className="mt-2 p-2 rounded bg-primary/10 text-xs text-primary flex items-center gap-1">
                    <Target className="h-3 w-3" /> Strategy alignment: strong — current operations match this archetype
                  </div>
                )}
              </div>
            );
          })}
        </TabsContent>

        <TabsContent value="plays" className="space-y-3 mt-4">
          {(isDemoMode ? DEMO_PLAYS : [] as typeof DEMO_PLAYS).map(p => (
            <div key={p.play} className="rounded-xl border border-border/40 bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">{p.play}</span>
                <Badge variant={p.impact === "high" ? "default" : "outline"}>{p.expected}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{p.description}</p>
              <div className="flex gap-3 text-[10px] text-muted-foreground">
                <span>Impact: <span className={p.impact === "high" ? "text-[hsl(var(--trust-safe))]" : "text-yellow-400"}>{p.impact}</span></span>
                <span>Timeline: {p.timeline}</span>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};
export default GrowthDNA;
