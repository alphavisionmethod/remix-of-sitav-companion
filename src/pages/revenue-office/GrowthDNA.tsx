import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { Dna, TrendingUp, Target, Sparkles, ArrowUpRight, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";

const GROWTH_TRAITS = [
  { trait: "Revenue Concentration", score: 72, status: "warning", insight: "Top 3 clients represent 58% of revenue", recommendation: "Target 3 new mid-market clients this quarter" },
  { trait: "Repeat Purchase Rate", score: 85, status: "strong", insight: "85% of clients return within 90 days", recommendation: "Launch referral program to capitalize on loyalty" },
  { trait: "Lead-to-Close Velocity", score: 61, status: "warning", insight: "Average 34 days from lead to close — 40% slower than benchmark", recommendation: "Streamline proposal stage — add quote templates" },
  { trait: "Revenue per Client", score: 78, status: "strong", insight: "$4,200 avg revenue per client — above industry median", recommendation: "Introduce premium tier to increase ARPC to $5,500" },
  { trait: "Churn Resilience", score: 45, status: "critical", insight: "No win-back system active — lost clients rarely return", recommendation: "Activate automated win-back sequences" },
  { trait: "Seasonal Stability", score: 68, status: "moderate", insight: "Q1 revenue dips 22% — seasonal pattern detected", recommendation: "Pre-sell Q1 packages in Q4 to smooth revenue curve" },
  { trait: "Referral Engine", score: 38, status: "critical", insight: "Only 8% of new clients come from referrals", recommendation: "Launch NPS-triggered referral campaign" },
  { trait: "Upsell Penetration", score: 52, status: "moderate", insight: "32% of clients on base tier — upsell opportunity exists", recommendation: "Create mid-tier package with 2x margin" },
];

const ARCHETYPES = [
  { name: "Relationship Builder", match: 82, description: "Revenue grows through deep trust, repeat business, and referrals", strengths: ["Client retention", "Service quality"], risks: ["Over-reliance on existing clients"] },
  { name: "Sales Machine", match: 45, description: "Revenue grows through systematic pipeline and volume", strengths: ["Lead generation", "Process efficiency"], risks: ["Client depth", "Relationship quality"] },
  { name: "Platform Monetizer", match: 28, description: "Revenue grows through products, memberships, and recurring access", strengths: ["Scalability"], risks: ["Requires significant product investment"] },
];

const PLAYS = [
  { play: "Revenue Diversification Sprint", impact: "high", timeline: "60 days", expected: "+$15,000/mo", description: "Target 5 new mid-market prospects to reduce top-client concentration" },
  { play: "Win-Back Automation", impact: "high", timeline: "14 days", expected: "+$8,400/mo", description: "Activate 3-touch win-back sequence for 23 churned clients" },
  { play: "Referral Engine Launch", impact: "medium", timeline: "7 days", expected: "+$5,200/mo", description: "NPS-triggered referral asks with incentive for top 15 promoters" },
  { play: "Premium Tier Introduction", impact: "high", timeline: "30 days", expected: "+$12,000/mo", description: "Create premium service tier at 2x price for top 20% of clients" },
];

const statusColor = (s: string) => s === "strong" ? "text-[hsl(var(--trust-safe))]" : s === "moderate" ? "text-yellow-400" : s === "warning" ? "text-orange-400" : "text-destructive";

const GrowthDNA = () => {
  const [tab, setTab] = useState("traits");
  const avg = Math.round(GROWTH_TRAITS.reduce((a, t) => a + t.score, 0) / GROWTH_TRAITS.length);

  return (
    <div className="space-y-6 p-6">
      <SitaPageHeader icon={<Dna className="h-5 w-5" />} title="Growth DNA" subtitle="Deep business growth pattern analysis and strategic positioning" />
      <div className="rounded-2xl border border-border/40 bg-card p-6 flex items-center justify-between">
        <div><p className="text-sm text-muted-foreground">Overall Growth Health</p><p className="text-4xl font-bold">{avg}<span className="text-lg text-muted-foreground">/100</span></p></div>
        <div className="flex gap-1">{["strong","moderate","warning","critical"].map(s=><Badge key={s} variant="outline" className={statusColor(s)}>{GROWTH_TRAITS.filter(t=>t.status===s).length} {s}</Badge>)}</div>
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList><TabsTrigger value="traits"><BarChart3 className="h-3.5 w-3.5 mr-1"/>Traits</TabsTrigger><TabsTrigger value="archetype"><Target className="h-3.5 w-3.5 mr-1"/>Archetype</TabsTrigger><TabsTrigger value="plays"><Sparkles className="h-3.5 w-3.5 mr-1"/>Plays</TabsTrigger></TabsList>
        <TabsContent value="traits" className="space-y-2 mt-4">
          {GROWTH_TRAITS.map(t=><div key={t.trait} className="rounded-xl border border-border/40 bg-card p-4">
            <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><span className="text-sm font-semibold">{t.trait}</span><Badge variant="outline" className={statusColor(t.status)}>{t.status}</Badge></div><span className="text-lg font-bold">{t.score}</span></div>
            <Progress value={t.score} className="h-1.5 mb-2"/><p className="text-xs text-muted-foreground mb-1">{t.insight}</p><div className="flex items-center gap-1 text-xs text-primary"><ArrowUpRight className="h-3 w-3"/><span>{t.recommendation}</span></div>
          </div>)}
        </TabsContent>
        <TabsContent value="archetype" className="space-y-3 mt-4">
          {ARCHETYPES.map(a=><div key={a.name} className={`rounded-xl border p-4 ${a.match>70?"border-primary/50 bg-primary/5":"border-border/40 bg-card"}`}>
            <div className="flex items-center justify-between mb-2"><span className="text-sm font-semibold">{a.name}</span><Badge variant={a.match>70?"default":"outline"}>{a.match}% match</Badge></div>
            <p className="text-xs text-muted-foreground mb-2">{a.description}</p>
            <div className="flex gap-1 flex-wrap">{a.strengths.map(s=><Badge key={s} variant="outline" className="text-[10px] text-[hsl(var(--trust-safe))]">{s}</Badge>)}{a.risks.map(r=><Badge key={r} variant="outline" className="text-[10px] text-orange-400">{r}</Badge>)}</div>
          </div>)}
        </TabsContent>
        <TabsContent value="plays" className="space-y-3 mt-4">
          {PLAYS.map(p=><div key={p.play} className="rounded-xl border border-border/40 bg-card p-4">
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
