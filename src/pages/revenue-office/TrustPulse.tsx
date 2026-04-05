import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { ShieldCheck, Heart, AlertTriangle, TrendingUp, TrendingDown, Clock, Star, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

const CLIENTS = [
  { client: "Bloom Studio", score: 92, trend: "up" as const, lastContact: "2d ago", signals: { resp: 95, pay: 100, engage: 88, sat: 85 }, risks: [] as string[], opps: ["Referral candidate", "Case study"] },
  { client: "Carter Legal", score: 78, trend: "stable" as const, lastContact: "5d ago", signals: { resp: 80, pay: 90, engage: 65, sat: 75 }, risks: ["Engagement declining"], opps: ["Upsell premium"] },
  { client: "Nova Digital", score: 65, trend: "down" as const, lastContact: "12d ago", signals: { resp: 55, pay: 85, engage: 50, sat: 70 }, risks: ["Contact gap growing"], opps: ["Re-engagement"] },
  { client: "Skyline Props", score: 88, trend: "up" as const, lastContact: "1d ago", signals: { resp: 90, pay: 95, engage: 82, sat: 85 }, risks: [] as string[], opps: ["Cross-sell booking"] },
  { client: "Meridian Health", score: 42, trend: "down" as const, lastContact: "28d ago", signals: { resp: 30, pay: 60, engage: 25, sat: 50 }, risks: ["Churn risk", "Payment delays", "No contact"], opps: ["Win-back needed"] },
  { client: "Atlas Ventures", score: 71, trend: "stable" as const, lastContact: "8d ago", signals: { resp: 70, pay: 80, engage: 60, sat: 72 }, risks: ["Engagement plateaued"], opps: ["Strategy review"] },
];

const ALERTS = [
  { client: "Meridian Health", msg: "No contact in 28 days — churn probability 68%", severity: "critical" as const, action: "Schedule check-in call" },
  { client: "Nova Digital", msg: "Invoice #847 is 5 days overdue", severity: "warning" as const, action: "Send gentle reminder" },
  { client: "Carter Legal", msg: "Meeting frequency dropped 40% vs last quarter", severity: "warning" as const, action: "Propose quarterly review" },
  { client: "Bloom Studio", msg: "Left 5-star Google review — strong promoter", severity: "positive" as const, action: "Request referral" },
];

const ti = (t: string) => t === "up" ? <TrendingUp className="h-3.5 w-3.5 text-[hsl(var(--trust-safe))]" /> : t === "down" ? <TrendingDown className="h-3.5 w-3.5 text-destructive" /> : <span className="text-muted-foreground">—</span>;

const TrustPulse = () => {
  const [tab, setTab] = useState("clients");
  const avg = Math.round(CLIENTS.reduce((a, c) => a + c.score, 0) / CLIENTS.length);
  return (
    <div className="space-y-6 p-6">
      <SitaPageHeader icon={<ShieldCheck className="h-5 w-5" />} title="Trust Pulse" subtitle="Client trust health monitoring and relationship confidence" />
      <div className="grid grid-cols-4 gap-3">
        {[{ l: "Avg Trust", v: `${avg}/100`, i: Heart, c: avg >= 70 ? "text-[hsl(var(--trust-safe))]" : "text-orange-400" },
          { l: "Strong", v: CLIENTS.filter(c => c.score >= 80).length, i: Star, c: "text-[hsl(var(--trust-safe))]" },
          { l: "At Risk", v: CLIENTS.filter(c => c.score < 50).length, i: AlertTriangle, c: "text-destructive" },
          { l: "Alerts", v: ALERTS.length, i: MessageSquare, c: "text-primary" },
        ].map(m => <div key={m.l} className="rounded-xl border border-border/40 bg-card p-4 text-center"><m.i className={`h-4 w-4 mx-auto mb-1 ${m.c}`} /><p className="text-xs text-muted-foreground">{m.l}</p><p className={`text-xl font-bold ${m.c}`}>{m.v}</p></div>)}
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList><TabsTrigger value="clients">Trust Board</TabsTrigger><TabsTrigger value="alerts">Alerts</TabsTrigger><TabsTrigger value="signals">Signals</TabsTrigger></TabsList>
        <TabsContent value="clients" className="space-y-2 mt-4">
          {CLIENTS.sort((a,b) => a.score - b.score).map(c => <div key={c.client} className={`rounded-xl border p-4 ${c.score < 50 ? "border-destructive/30 bg-destructive/5" : "border-border/40 bg-card"}`}>
            <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><span className="text-sm font-semibold">{c.client}</span>{ti(c.trend)}</div><div className="flex items-center gap-2"><span className="text-xs text-muted-foreground"><Clock className="h-3 w-3 inline mr-0.5"/>{c.lastContact}</span><Badge variant={c.score>=80?"default":c.score>=50?"outline":"destructive"}>{c.score}</Badge></div></div>
            <Progress value={c.score} className="h-1.5 mb-2"/><div className="flex gap-4 text-[10px]"><span>Resp: {c.signals.resp}%</span><span>Pay: {c.signals.pay}%</span><span>Engage: {c.signals.engage}%</span><span>Sat: {c.signals.sat}%</span></div>
            {c.risks.length > 0 && <div className="flex gap-1 mt-2">{c.risks.map(r=><Badge key={r} variant="outline" className="text-[10px] text-destructive">{r}</Badge>)}</div>}
            {c.opps.length > 0 && <div className="flex gap-1 mt-1">{c.opps.map(o=><Badge key={o} variant="outline" className="text-[10px] text-[hsl(var(--trust-safe))]">{o}</Badge>)}</div>}
          </div>)}
        </TabsContent>
        <TabsContent value="alerts" className="space-y-2 mt-4">
          {ALERTS.map((a, i) => <div key={i} className={`rounded-xl border p-4 ${a.severity === "critical" ? "border-destructive/30 bg-destructive/5" : a.severity === "positive" ? "border-[hsl(var(--trust-safe))]/30 bg-[hsl(var(--trust-safe))]/5" : "border-border/40 bg-card"}`}>
            <div className="flex items-center justify-between mb-1"><span className="text-sm font-semibold">{a.client}</span><Badge variant={a.severity==="critical"?"destructive":a.severity==="positive"?"default":"outline"}>{a.severity}</Badge></div>
            <p className="text-xs text-muted-foreground mb-2">{a.msg}</p><p className="text-xs text-primary">→ {a.action}</p>
          </div>)}
        </TabsContent>
        <TabsContent value="signals" className="mt-4"><div className="rounded-xl border border-border/40 bg-card overflow-hidden"><table className="w-full text-xs"><thead><tr className="border-b border-border/40 bg-muted/30"><th className="text-left p-3">Client</th><th className="text-center p-3">Responsiveness</th><th className="text-center p-3">Payment</th><th className="text-center p-3">Engagement</th><th className="text-center p-3">Satisfaction</th><th className="text-center p-3">Overall</th></tr></thead><tbody>{CLIENTS.map(c=><tr key={c.client} className="border-b border-border/20"><td className="p-3 font-medium">{c.client}</td><td className="p-3 text-center">{c.signals.resp}%</td><td className="p-3 text-center">{c.signals.pay}%</td><td className="p-3 text-center">{c.signals.engage}%</td><td className="p-3 text-center">{c.signals.sat}%</td><td className="p-3 text-center font-bold">{c.score}</td></tr>)}</tbody></table></div></TabsContent>
      </Tabs>
    </div>
  );
};
export default TrustPulse;
