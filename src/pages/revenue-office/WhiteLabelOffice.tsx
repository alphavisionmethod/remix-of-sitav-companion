import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, TrendingUp, Shield, BarChart3, Settings } from "lucide-react";

const clients = [
  { name: "Apex Coaching Co.", status: "active", revenue: 12400, leads: 89, health: 92, campaigns: 3 },
  { name: "Studio Bloom", status: "active", revenue: 8200, leads: 45, health: 87, campaigns: 2 },
  { name: "NextLevel Fitness", status: "active", revenue: 6800, leads: 67, health: 74, campaigns: 4 },
  { name: "Zenith Consulting", status: "onboarding", revenue: 0, leads: 12, health: 0, campaigns: 0 },
];

export default function WhiteLabelOffice() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">White-Label / Multi-Client Office</h1>
        <p className="text-muted-foreground">Manage multiple client businesses with per-client boardrooms, campaigns, and growth health</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Clients", value: "3", icon: Building2, color: "text-blue-400" },
          { label: "Total Revenue", value: "$27,400", icon: TrendingUp, color: "text-emerald-400" },
          { label: "Total Leads", value: "213", icon: Users, color: "text-amber-400" },
          { label: "Active Campaigns", value: "9", icon: BarChart3, color: "text-purple-400" },
        ].map((s) => (
          <Card key={s.label} className="bg-card/50 border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`h-5 w-5 ${s.color}`} />
              <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-lg font-bold text-foreground">{s.value}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-blue-400" />Client Portfolio</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {clients.map((c) => (
            <div key={c.name} className="p-4 rounded-lg bg-background/50 border border-border/30 hover:border-primary/30 transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{c.name[0]}</div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{c.name}</p>
                    <Badge variant={c.status === "active" ? "default" : "secondary"} className="text-[10px]">{c.status}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {c.status === "active" && (
                    <>
                      <span>Revenue: <span className="text-emerald-400">${c.revenue.toLocaleString()}</span></span>
                      <span>Leads: {c.leads}</span>
                      <span>Health: <span className={c.health >= 80 ? "text-emerald-400" : "text-amber-400"}>{c.health}%</span></span>
                      <span>Campaigns: {c.campaigns}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <Shield className="h-5 w-5 text-emerald-400" />
            <div><p className="text-sm font-medium text-foreground">Brand Isolation</p><p className="text-xs text-muted-foreground">Client contexts, brands, permissions, and data are fully separated</p></div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <Settings className="h-5 w-5 text-blue-400" />
            <div><p className="text-sm font-medium text-foreground">Shared Templates</p><p className="text-xs text-muted-foreground">Reuse funnel, campaign, and offer templates across clients</p></div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
