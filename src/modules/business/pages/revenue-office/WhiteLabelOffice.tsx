import { SitaPageHeader } from "@/platform/sita/components/sita/SitaPageHeader";
import { Building2, Users, DollarSign, Shield, ArrowUpRight, Settings, Package, TrendingUp, TrendingDown, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
const CLIENT_HEALTH_BY_PARTNER = [
  { partner: "Apex Growth", clients: [{ name: "TechFlow", health: 92, trend: "up", revenue: "$4,200/mo" }, { name: "HealthFirst", health: 78, trend: "stable", revenue: "$3,100/mo" }] },
  { partner: "Beacon Digital", clients: [{ name: "Nova Digital", health: 85, trend: "up", revenue: "$2,800/mo" }, { name: "Carter Legal", health: 58, trend: "down", revenue: "$4,100/mo" }] },
  { partner: "Summit Consulting", clients: [{ name: "Bloom Studio", health: 74, trend: "stable", revenue: "$1,900/mo" }] },
];

const REPUTATION_CROSS_CLIENT = [
  { partner: "Apex Growth", avgRating: 4.7, totalReviews: 48, trend: "+3 this month", responseRate: 94 },
  { partner: "Beacon Digital", avgRating: 4.5, totalReviews: 32, trend: "+1 this month", responseRate: 88 },
  { partner: "Summit Consulting", avgRating: 4.2, totalReviews: 15, trend: "0 this month", responseRate: 72 },
];

const WhiteLabelOffice = () => {
  const [tab, setTab] = useState("partners");
  const total = ([] as any[]).reduce((a, p) => a + p.revenue, 0);
  const avgHealth = Math.round(([] as any[]).reduce((a, p) => a + p.health, 0) / ([] as any[]).length);

  return (
    <div className="space-y-6 p-6">
<SitaPageHeader icon={<Building2 className="h-5 w-5" />} title="White Label Office" subtitle="Multi-client intelligence — partner health, reputation trends, and delegated operations" />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { l: "Active Partners", v: ([] as any[]).filter(p => p.status === "active").length, c: "text-primary" },
          { l: "Total Clients", v: ([] as any[]).reduce((a, p) => a + p.clients, 0), c: "text-foreground" },
          { l: "Partner Revenue", v: `$${(total / 1000).toFixed(1)}k`, c: "text-[hsl(var(--trust-safe))]" },
          { l: "Avg Health", v: `${avgHealth}/100`, c: avgHealth >= 70 ? "text-[hsl(var(--trust-safe))]" : "text-orange-400" },
          { l: "Brand Kits", v: ([] as any[]).length, c: "text-purple-400" },
        ].map(m => (
          <div key={m.l} className="rounded-xl border border-border/40 bg-card p-3 text-center">
            <p className="text-xs text-muted-foreground">{m.l}</p>
            <p className={`text-xl font-bold ${m.c}`}>{m.v}</p>
          </div>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="partners">Partners</TabsTrigger>
          <TabsTrigger value="client-health">Client Health</TabsTrigger>
          <TabsTrigger value="reputation">Reputation Trends</TabsTrigger>
          <TabsTrigger value="branding">Brand Kits</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="controls">Controls</TabsTrigger>
        </TabsList>

        <TabsContent value="partners" className="space-y-2 mt-4">
          {([] as any[]).map(p => (
            <div key={p.name} className="rounded-xl border border-border/40 bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2"><span className="text-sm font-semibold">{p.name}</span><Badge variant="outline">{p.type}</Badge><Badge variant={p.status === "active" ? "default" : "secondary"}>{p.status}</Badge></div>
                <span className="text-sm font-bold">${p.revenue.toLocaleString()}/mo</span>
              </div>
              <div className="flex gap-3 text-[10px] text-muted-foreground"><span>Clients: {p.clients}</span><span>Margin: {p.margin}%</span><span>Health: {p.health}/100</span></div>
              <Progress value={p.health} className="h-1 mt-2" />
            </div>
          ))}
        </TabsContent>

        {/* Client Health by Partner */}
        <TabsContent value="client-health" className="space-y-3 mt-4">
          {CLIENT_HEALTH_BY_PARTNER.map(p => (
            <Card key={p.partner} className="bg-card/50 border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm">{p.partner}</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {p.clients.map(c => (
                  <div key={c.name} className={`p-3 rounded-lg border ${c.health < 60 ? "border-orange-400/30 bg-orange-400/5" : "border-border/30 bg-muted/10"}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{c.name}</span>
                        {c.trend === "up" ? <TrendingUp className="h-3 w-3 text-[hsl(var(--trust-safe))]" /> : c.trend === "down" ? <TrendingDown className="h-3 w-3 text-destructive" /> : null}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{c.revenue}</span>
                        <Badge variant={c.health >= 80 ? "default" : c.health >= 60 ? "outline" : "destructive"} className="text-[10px]">{c.health}</Badge>
                      </div>
                    </div>
                    <Progress value={c.health} className="h-1" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Reputation Cross-Client */}
        <TabsContent value="reputation" className="mt-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Star className="h-4 w-4 text-amber-400" /> Reputation Trends by Partner</CardTitle></CardHeader>
            <CardContent>
              <div className="rounded-xl border border-border/40 overflow-hidden">
                <table className="w-full text-xs">
                  <thead><tr className="border-b border-border/40 bg-muted/30"><th className="text-left p-3">Partner</th><th className="text-center p-3">Avg Rating</th><th className="text-center p-3">Reviews</th><th className="text-center p-3">Trend</th><th className="text-center p-3">Response Rate</th></tr></thead>
                  <tbody>
                    {REPUTATION_CROSS_CLIENT.map(r => (
                      <tr key={r.partner} className="border-b border-border/20">
                        <td className="p-3 font-medium">{r.partner}</td>
                        <td className="p-3 text-center"><span className="font-bold">{r.avgRating}★</span></td>
                        <td className="p-3 text-center">{r.totalReviews}</td>
                        <td className="p-3 text-center text-[hsl(var(--trust-safe))]">{r.trend}</td>
                        <td className="p-3 text-center">{r.responseRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-3 mt-4">
          {([] as any[]).map(b => (
            <div key={b.name} className="rounded-xl border border-border/40 bg-card p-4">
              <div className="flex items-center justify-between mb-2"><span className="text-sm font-semibold">{b.name}</span><Badge variant={b.status === "live" ? "default" : "outline"}>{b.status}</Badge></div>
              <p className="text-xs text-muted-foreground mb-2">Partner: {b.partner} · Domain: {b.domain}</p>
              <div className="flex items-center gap-2"><span className="text-[10px] text-muted-foreground">Colors:</span>{b.colors.map(c => <div key={c} className="h-5 w-5 rounded border border-border/40" style={{ backgroundColor: c }} />)}</div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="revenue" className="mt-4">
          <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-border/40 bg-muted/30"><th className="text-left p-3">Partner</th><th className="text-right p-3">Gross</th><th className="text-right p-3">Theirs</th><th className="text-right p-3">Yours</th><th className="text-center p-3">Split</th><th className="text-right p-3">Pending</th></tr></thead>
              <tbody>{([] as any[]).map(r => <tr key={r.partner} className="border-b border-border/20"><td className="p-3 font-medium">{r.partner}</td><td className="p-3 text-right">${r.gross.toLocaleString()}</td><td className="p-3 text-right">${r.theirs.toLocaleString()}</td><td className="p-3 text-right font-semibold text-[hsl(var(--trust-safe))]">${r.yours.toLocaleString()}</td><td className="p-3 text-center"><Badge variant="outline">{r.split}</Badge></td><td className="p-3 text-right">{r.pending > 0 ? `$${r.pending.toLocaleString()}` : "—"}</td></tr>)}</tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="controls" className="space-y-3 mt-4">
          {[{ t: "Partner Access Levels", d: "Control what each partner can see and manage", i: Shield }, { t: "Revenue Split Rules", d: "Configure commission structures and payout schedules", i: DollarSign }, { t: "Brand Kit Policies", d: "Set guardrails for partner customization", i: Settings }, { t: "Client Visibility", d: "Control which client data partners can access", i: Users }].map(c => (
            <div key={c.t} className="rounded-xl border border-border/40 bg-card p-4 flex items-center gap-3 cursor-pointer hover:bg-muted/30 transition-colors">
              <c.i className="h-4 w-4 text-primary shrink-0" />
              <div className="flex-1"><p className="text-sm font-medium">{c.t}</p><p className="text-xs text-muted-foreground">{c.d}</p></div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};
export default WhiteLabelOffice;
