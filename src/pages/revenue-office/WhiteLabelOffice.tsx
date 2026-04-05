import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { Building2, Users, DollarSign, Shield, ArrowUpRight, Settings, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";

const PARTNERS = [
  { name: "Peak Digital Agency", type: "Reseller", status: "active", clients: 12, revenue: 18400, margin: 35, health: 88 },
  { name: "Northstar Consulting", type: "White-Label", status: "active", clients: 8, revenue: 24600, margin: 42, health: 92 },
  { name: "Cascade Marketing", type: "Referral", status: "active", clients: 5, revenue: 7200, margin: 25, health: 75 },
  { name: "Summit Solutions", type: "White-Label", status: "onboarding", clients: 0, revenue: 0, margin: 40, health: 60 },
  { name: "Vertex Group", type: "Reseller", status: "paused", clients: 3, revenue: 4100, margin: 30, health: 45 },
];

const BRANDS = [
  { name: "Peak Digital Theme", partner: "Peak Digital Agency", colors: ["#2563EB","#1E293B","#F8FAFC"], domain: "portal.peakdigital.com", status: "live" },
  { name: "Northstar Custom", partner: "Northstar Consulting", colors: ["#059669","#0F172A","#ECFDF5"], domain: "app.northstarconsult.com", status: "live" },
  { name: "Summit Draft", partner: "Summit Solutions", colors: ["#D946EF","#1A1A2E","#FDF4FF"], domain: "pending", status: "draft" },
];

const SPLITS = [
  { partner: "Northstar Consulting", gross: 24600, theirs: 14760, yours: 9840, split: "60/40", pending: 2400 },
  { partner: "Peak Digital Agency", gross: 18400, theirs: 11960, yours: 6440, split: "65/35", pending: 1200 },
  { partner: "Cascade Marketing", gross: 7200, theirs: 5400, yours: 1800, split: "75/25", pending: 0 },
  { partner: "Vertex Group", gross: 4100, theirs: 2870, yours: 1230, split: "70/30", pending: 800 },
];

const WhiteLabelOffice = () => {
  const [tab, setTab] = useState("partners");
  const total = PARTNERS.reduce((a,p) => a + p.revenue, 0);
  return (
    <div className="space-y-6 p-6">
      <SitaPageHeader icon={<Building2 className="h-5 w-5" />} title="White Label Office" subtitle="Partner programs, reseller management, and branded service delivery" />
      <div className="grid grid-cols-4 gap-3">
        {[{ l:"Active Partners", v:PARTNERS.filter(p=>p.status==="active").length, i:Users },{ l:"Partner Clients", v:PARTNERS.reduce((a,p)=>a+p.clients,0), i:Users },{ l:"Partner Revenue", v:`$${(total/1000).toFixed(1)}k`, i:DollarSign },{ l:"Brand Kits", v:BRANDS.length, i:Package }].map(m=>
          <div key={m.l} className="rounded-xl border border-border/40 bg-card p-4 text-center"><m.i className="h-4 w-4 mx-auto mb-1 text-primary"/><p className="text-xs text-muted-foreground">{m.l}</p><p className="text-xl font-bold">{m.v}</p></div>
        )}
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList><TabsTrigger value="partners">Partners</TabsTrigger><TabsTrigger value="branding">Brand Kits</TabsTrigger><TabsTrigger value="revenue">Revenue</TabsTrigger><TabsTrigger value="controls">Controls</TabsTrigger></TabsList>
        <TabsContent value="partners" className="space-y-2 mt-4">
          {PARTNERS.map(p=><div key={p.name} className="rounded-xl border border-border/40 bg-card p-4">
            <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><span className="text-sm font-semibold">{p.name}</span><Badge variant="outline">{p.type}</Badge><Badge variant={p.status==="active"?"default":"secondary"}>{p.status}</Badge></div><span className="text-sm font-bold">${p.revenue.toLocaleString()}/mo</span></div>
            <div className="flex gap-3 text-[10px] text-muted-foreground"><span>Clients: {p.clients}</span><span>Margin: {p.margin}%</span><span>Health: {p.health}/100</span></div><Progress value={p.health} className="h-1 mt-2"/>
          </div>)}
        </TabsContent>
        <TabsContent value="branding" className="space-y-3 mt-4">
          {BRANDS.map(b=><div key={b.name} className="rounded-xl border border-border/40 bg-card p-4">
            <div className="flex items-center justify-between mb-2"><span className="text-sm font-semibold">{b.name}</span><Badge variant={b.status==="live"?"default":"outline"}>{b.status}</Badge></div>
            <p className="text-xs text-muted-foreground mb-2">Partner: {b.partner} · Domain: {b.domain}</p>
            <div className="flex items-center gap-2"><span className="text-[10px] text-muted-foreground">Colors:</span>{b.colors.map(c=><div key={c} className="h-5 w-5 rounded border border-border/40" style={{backgroundColor:c}}/>)}</div>
          </div>)}
        </TabsContent>
        <TabsContent value="revenue" className="mt-4"><div className="rounded-xl border border-border/40 bg-card overflow-hidden"><table className="w-full text-xs"><thead><tr className="border-b border-border/40 bg-muted/30"><th className="text-left p-3">Partner</th><th className="text-right p-3">Gross</th><th className="text-right p-3">Theirs</th><th className="text-right p-3">Yours</th><th className="text-center p-3">Split</th><th className="text-right p-3">Pending</th></tr></thead><tbody>{SPLITS.map(r=><tr key={r.partner} className="border-b border-border/20"><td className="p-3 font-medium">{r.partner}</td><td className="p-3 text-right">${r.gross.toLocaleString()}</td><td className="p-3 text-right">${r.theirs.toLocaleString()}</td><td className="p-3 text-right font-semibold text-[hsl(var(--trust-safe))]">${r.yours.toLocaleString()}</td><td className="p-3 text-center"><Badge variant="outline">{r.split}</Badge></td><td className="p-3 text-right">{r.pending>0?`$${r.pending.toLocaleString()}`:"—"}</td></tr>)}</tbody></table></div></TabsContent>
        <TabsContent value="controls" className="space-y-3 mt-4">
          {[{ t:"Partner Access Levels", d:"Control what each partner can see and manage", i:Shield },{ t:"Revenue Split Rules", d:"Configure commission structures and payout schedules", i:DollarSign },{ t:"Brand Kit Policies", d:"Set guardrails for partner customization", i:Settings },{ t:"Client Visibility", d:"Control which client data partners can access", i:Users }].map(c=>
            <div key={c.t} className="rounded-xl border border-border/40 bg-card p-4 flex items-center gap-3 cursor-pointer hover:bg-muted/30 transition-colors"><c.i className="h-4 w-4 text-primary shrink-0"/><div className="flex-1"><p className="text-sm font-medium">{c.t}</p><p className="text-xs text-muted-foreground">{c.d}</p></div><ArrowUpRight className="h-4 w-4 text-muted-foreground"/></div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
export default WhiteLabelOffice;
