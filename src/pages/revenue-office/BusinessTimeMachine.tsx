import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { Clock, TrendingUp, TrendingDown, ArrowRight, Calendar, DollarSign, Users, Target, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const PERIODS = [
  { period: "This Month", revenue: 42800, clients: 28, deals: 7, conversion: 23, trend: "up" as const },
  { period: "Last Month", revenue: 38200, clients: 26, deals: 5, conversion: 19, trend: "up" as const },
  { period: "2 Months Ago", revenue: 35600, clients: 25, deals: 6, conversion: 21, trend: "stable" as const },
  { period: "3 Months Ago", revenue: 31400, clients: 24, deals: 4, conversion: 17, trend: "down" as const },
  { period: "6 Months Ago", revenue: 28100, clients: 22, deals: 3, conversion: 15, trend: "down" as const },
  { period: "1 Year Ago", revenue: 19800, clients: 16, deals: 2, conversion: 12, trend: "stable" as const },
];

const DECISIONS = [
  { date: "Mar 15", decision: "Launched premium service tier", impact: "positive" as const, metric: "+$8,200/mo", detail: "23% of existing clients upgraded within 30 days" },
  { date: "Feb 28", decision: "Activated automated follow-up sequences", impact: "positive" as const, metric: "+12% conv", detail: "Lead-to-close time reduced by 8 days" },
  { date: "Feb 10", decision: "Hired second account manager", impact: "neutral" as const, metric: "+$4,500 cost", detail: "Client satisfaction up 15% but ROI still developing" },
  { date: "Jan 20", decision: "Raised prices 15%", impact: "positive" as const, metric: "+$5,400/mo", detail: "Only 2 clients churned — net positive after 60 days" },
  { date: "Dec 5", decision: "Paused Google Ads", impact: "negative" as const, metric: "-18% leads", detail: "Organic couldn't compensate — resumed after 3 weeks" },
  { date: "Nov 1", decision: "Launched referral program", impact: "positive" as const, metric: "+4 clients", detail: "8% of new clients now come from referrals" },
];

const WHATIF = [
  { q: "What if you raise prices 10%?", proj: "Revenue: +$4,280/mo · Risk: ~5% churn", conf: 72, rec: "Based on Jan data, clients showed low elasticity. Recommended." },
  { q: "What if you stop all paid ads?", proj: "New leads: -35% in 60 days · Revenue: -$6,200/mo by Q3", conf: 65, rec: "Reduce spend 30% instead of eliminating." },
  { q: "What if you launch a retainer model?", proj: "MRR potential: +$12,000/mo if 40% adopt", conf: 55, rec: "High potential. Start with top 10 clients." },
  { q: "What if Bloom Studio churns?", proj: "Revenue: -$6,800/mo · 16% concentration risk realized", conf: 80, rec: "Activate retention protocol now." },
];

const ti = (t: string) => t === "up" ? <TrendingUp className="h-3.5 w-3.5 text-[hsl(var(--trust-safe))]" /> : t === "down" ? <TrendingDown className="h-3.5 w-3.5 text-destructive" /> : <span className="text-muted-foreground">—</span>;

const BusinessTimeMachine = () => {
  const [tab, setTab] = useState("timeline");
  const cur = PERIODS[0].revenue; const old = PERIODS[PERIODS.length-1].revenue;
  const yoy = Math.round(((cur-old)/old)*100);
  return (
    <div className="space-y-6 p-6">
      <DemoModeBadge />
      <SitaPageHeader icon={<Clock className="h-5 w-5" />} title="Business Time Machine" subtitle="Historical replay, decision timeline, and what-if scenarios" />
      <div className="grid grid-cols-4 gap-3">
        {[{ l:"Current Revenue", v:`$${(cur/1000).toFixed(1)}k/mo`, i:DollarSign },{ l:"YoY Growth", v:`+${yoy}%`, i:TrendingUp },{ l:"Key Decisions", v:DECISIONS.length, i:Target },{ l:"Active Clients", v:PERIODS[0].clients, i:Users }].map(m=>
          <div key={m.l} className="rounded-xl border border-border/40 bg-card p-4 text-center"><m.i className="h-4 w-4 mx-auto mb-1 text-primary"/><p className="text-xs text-muted-foreground">{m.l}</p><p className="text-xl font-bold">{m.v}</p></div>
        )}
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList><TabsTrigger value="timeline"><Calendar className="h-3.5 w-3.5 mr-1"/>Periods</TabsTrigger><TabsTrigger value="decisions"><Target className="h-3.5 w-3.5 mr-1"/>Decisions</TabsTrigger><TabsTrigger value="whatif"><BarChart3 className="h-3.5 w-3.5 mr-1"/>What-If</TabsTrigger></TabsList>
        <TabsContent value="timeline" className="mt-4"><div className="rounded-xl border border-border/40 bg-card overflow-hidden"><table className="w-full text-xs"><thead><tr className="border-b border-border/40 bg-muted/30"><th className="text-left p-3">Period</th><th className="text-right p-3">Revenue</th><th className="text-right p-3">Clients</th><th className="text-right p-3">Deals</th><th className="text-right p-3">Conv %</th><th className="text-center p-3">Trend</th></tr></thead><tbody>{PERIODS.map(p=><tr key={p.period} className="border-b border-border/20"><td className="p-3 font-medium">{p.period}</td><td className="p-3 text-right">${p.revenue.toLocaleString()}</td><td className="p-3 text-right">{p.clients}</td><td className="p-3 text-right">{p.deals}</td><td className="p-3 text-right">{p.conversion}%</td><td className="p-3 text-center">{ti(p.trend)}</td></tr>)}</tbody></table></div></TabsContent>
        <TabsContent value="decisions" className="space-y-0 mt-4">
          {DECISIONS.map((d,i)=><div key={i} className="flex gap-3"><div className="flex flex-col items-center"><div className={`h-3 w-3 rounded-full border-2 ${d.impact==="positive"?"border-[hsl(var(--trust-safe))] bg-[hsl(var(--trust-safe))]/20":d.impact==="negative"?"border-destructive bg-destructive/20":"border-muted-foreground bg-muted"}`}/>{i<DECISIONS.length-1&&<div className="w-px flex-1 bg-border/40"/>}</div>
            <div className="pb-4 flex-1"><div className="flex items-center gap-2 mb-1"><span className="text-[10px] text-muted-foreground">{d.date}</span><Badge variant={d.impact==="positive"?"default":d.impact==="negative"?"destructive":"outline"} className="text-[10px]">{d.metric}</Badge></div><p className="text-sm font-medium">{d.decision}</p><p className="text-xs text-muted-foreground">{d.detail}</p></div></div>)}
        </TabsContent>
        <TabsContent value="whatif" className="space-y-3 mt-4">
          {WHATIF.map((s,i)=><div key={i} className="rounded-xl border border-border/40 bg-card p-4">
            <div className="flex items-center justify-between mb-2"><span className="text-sm font-semibold">{s.q}</span><Badge variant="outline">{s.conf}% confidence</Badge></div>
            <div className="rounded-lg bg-muted/30 p-3 mb-2"><p className="text-xs font-mono">{s.proj}</p></div>
            <div className="flex items-start gap-1.5 text-xs text-primary"><ArrowRight className="h-3 w-3 mt-0.5 shrink-0"/><span>{s.rec}</span></div>
          </div>)}
        </TabsContent>
      </Tabs>
    </div>
  );
};
export default BusinessTimeMachine;
