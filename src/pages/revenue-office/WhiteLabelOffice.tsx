import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { Building2, Users, DollarSign, Shield, ArrowUpRight, Settings, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { DEMO_BRANDS, DEMO_PARTNERS, DEMO_SPLITS } from "@/lib/demo-data/revenue-office";

const WhiteLabelOffice = () => {
  const [tab, setTab] = useState("partners");
  const total = DEMO_PARTNERS.reduce((a,p) => a + p.revenue, 0);
  return (
    <div className="space-y-6 p-6">
      <DemoModeBadge />
      <SitaPageHeader icon={<Building2 className="h-5 w-5" />} title="White Label Office" subtitle="Partner programs, reseller management, and branded service delivery" />
      <div className="grid grid-cols-4 gap-3">
        {[{ l:"Active Partners", v:DEMO_PARTNERS.filter(p=>p.status==="active").length, i:Users },{ l:"Partner Clients", v:DEMO_PARTNERS.reduce((a,p)=>a+p.clients,0), i:Users },{ l:"Partner Revenue", v:`$${(total/1000).toFixed(1)}k`, i:DollarSign },{ l:"Brand Kits", v:DEMO_BRANDS.length, i:Package }].map(m=>
          <div key={m.l} className="rounded-xl border border-border/40 bg-card p-4 text-center"><m.i className="h-4 w-4 mx-auto mb-1 text-primary"/><p className="text-xs text-muted-foreground">{m.l}</p><p className="text-xl font-bold">{m.v}</p></div>
        )}
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList><TabsTrigger value="partners">Partners</TabsTrigger><TabsTrigger value="branding">Brand Kits</TabsTrigger><TabsTrigger value="revenue">Revenue</TabsTrigger><TabsTrigger value="controls">Controls</TabsTrigger></TabsList>
        <TabsContent value="partners" className="space-y-2 mt-4">
          {DEMO_PARTNERS.map(p=><div key={p.name} className="rounded-xl border border-border/40 bg-card p-4">
            <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><span className="text-sm font-semibold">{p.name}</span><Badge variant="outline">{p.type}</Badge><Badge variant={p.status==="active"?"default":"secondary"}>{p.status}</Badge></div><span className="text-sm font-bold">${p.revenue.toLocaleString()}/mo</span></div>
            <div className="flex gap-3 text-[10px] text-muted-foreground"><span>Clients: {p.clients}</span><span>Margin: {p.margin}%</span><span>Health: {p.health}/100</span></div><Progress value={p.health} className="h-1 mt-2"/>
          </div>)}
        </TabsContent>
        <TabsContent value="branding" className="space-y-3 mt-4">
          {DEMO_BRANDS.map(b=><div key={b.name} className="rounded-xl border border-border/40 bg-card p-4">
            <div className="flex items-center justify-between mb-2"><span className="text-sm font-semibold">{b.name}</span><Badge variant={b.status==="live"?"default":"outline"}>{b.status}</Badge></div>
            <p className="text-xs text-muted-foreground mb-2">Partner: {b.partner} · Domain: {b.domain}</p>
            <div className="flex items-center gap-2"><span className="text-[10px] text-muted-foreground">Colors:</span>{b.colors.map(c=><div key={c} className="h-5 w-5 rounded border border-border/40" style={{backgroundColor:c}}/>)}</div>
          </div>)}
        </TabsContent>
        <TabsContent value="revenue" className="mt-4"><div className="rounded-xl border border-border/40 bg-card overflow-hidden"><table className="w-full text-xs"><thead><tr className="border-b border-border/40 bg-muted/30"><th className="text-left p-3">Partner</th><th className="text-right p-3">Gross</th><th className="text-right p-3">Theirs</th><th className="text-right p-3">Yours</th><th className="text-center p-3">Split</th><th className="text-right p-3">Pending</th></tr></thead><tbody>{DEMO_SPLITS.map(r=><tr key={r.partner} className="border-b border-border/20"><td className="p-3 font-medium">{r.partner}</td><td className="p-3 text-right">${r.gross.toLocaleString()}</td><td className="p-3 text-right">${r.theirs.toLocaleString()}</td><td className="p-3 text-right font-semibold text-[hsl(var(--trust-safe))]">${r.yours.toLocaleString()}</td><td className="p-3 text-center"><Badge variant="outline">{r.split}</Badge></td><td className="p-3 text-right">{r.pending>0?`$${r.pending.toLocaleString()}`:"—"}</td></tr>)}</tbody></table></div></TabsContent>
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
