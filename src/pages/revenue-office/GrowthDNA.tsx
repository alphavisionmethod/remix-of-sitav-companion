import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { Dna, TrendingUp, Target, Sparkles, ArrowUpRight, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

const statusColor = (s: string) => s === "strong" ? "text-[hsl(var(--trust-safe))]" : s === "moderate" ? "text-yellow-400" : s === "warning" ? "text-orange-400" : "text-destructive";
import { DEMO_GROWTH_TRAITS, DEMO_PLAYS, DEMO_REV_ARCHETYPES as DEMO_ARCHETYPES } from "@/lib/demo-data/revenue-office";

const GrowthDNA = () => {
  const [tab, setTab] = useState("traits");
  const avg = Math.round(DEMO_GROWTH_TRAITS.reduce((a, t) => a + t.score, 0) / DEMO_GROWTH_TRAITS.length);

  return (
    <div className="space-y-6 p-6">
      <DemoModeBadge />
      <SitaPageHeader icon={<Dna className="h-5 w-5" />} title="Growth DNA" subtitle="Deep business growth pattern analysis and strategic positioning" />
      <div className="rounded-2xl border border-border/40 bg-card p-6 flex items-center justify-between">
        <div><p className="text-sm text-muted-foreground">Overall Growth Health</p><p className="text-4xl font-bold">{avg}<span className="text-lg text-muted-foreground">/100</span></p></div>
        <div className="flex gap-1">{["strong","moderate","warning","critical"].map(s=><Badge key={s} variant="outline" className={statusColor(s)}>{DEMO_GROWTH_TRAITS.filter(t=>t.status===s).length} {s}</Badge>)}</div>
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList><TabsTrigger value="traits"><BarChart3 className="h-3.5 w-3.5 mr-1"/>Traits</TabsTrigger><TabsTrigger value="archetype"><Target className="h-3.5 w-3.5 mr-1"/>Archetype</TabsTrigger><TabsTrigger value="plays"><Sparkles className="h-3.5 w-3.5 mr-1"/>Plays</TabsTrigger></TabsList>
        <TabsContent value="traits" className="space-y-2 mt-4">
          {DEMO_GROWTH_TRAITS.map(t=><div key={t.trait} className="rounded-xl border border-border/40 bg-card p-4">
            <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><span className="text-sm font-semibold">{t.trait}</span><Badge variant="outline" className={statusColor(t.status)}>{t.status}</Badge></div><span className="text-lg font-bold">{t.score}</span></div>
            <Progress value={t.score} className="h-1.5 mb-2"/><p className="text-xs text-muted-foreground mb-1">{t.insight}</p><div className="flex items-center gap-1 text-xs text-primary"><ArrowUpRight className="h-3 w-3"/><span>{t.recommendation}</span></div>
          </div>)}
        </TabsContent>
        <TabsContent value="archetype" className="space-y-3 mt-4">
          {DEMO_ARCHETYPES.map(a=><div key={a.name} className={`rounded-xl border p-4 ${a.match>70?"border-primary/50 bg-primary/5":"border-border/40 bg-card"}`}>
            <div className="flex items-center justify-between mb-2"><span className="text-sm font-semibold">{a.name}</span><Badge variant={a.match>70?"default":"outline"}>{a.match}% match</Badge></div>
            <p className="text-xs text-muted-foreground mb-2">{a.description}</p>
            <div className="flex gap-1 flex-wrap">{a.strengths.map(s=><Badge key={s} variant="outline" className="text-[10px] text-[hsl(var(--trust-safe))]">{s}</Badge>)}{a.risks.map(r=><Badge key={r} variant="outline" className="text-[10px] text-orange-400">{r}</Badge>)}</div>
          </div>)}
        </TabsContent>
        <TabsContent value="plays" className="space-y-3 mt-4">
          {DEMO_PLAYS.map(p=><div key={p.play} className="rounded-xl border border-border/40 bg-card p-4">
            <div className="flex items-center justify-between mb-2"><span className="text-sm font-semibold">{p.play}</span><Badge variant={p.impact==="high"?"default":"outline"}>{p.expected}</Badge></div>
            <p className="text-xs text-muted-foreground mb-2">{p.description}</p>
            <div className="flex gap-3 text-[10px] text-muted-foreground"><span>Impact: <span className={p.impact==="high"?"text-[hsl(var(--trust-safe))]":"text-yellow-400"}>{p.impact}</span></span><span>Timeline: {p.timeline}</span></div>
          </div>)}
        </TabsContent>
      </Tabs>
    </div>
  );
};
export default GrowthDNA;
