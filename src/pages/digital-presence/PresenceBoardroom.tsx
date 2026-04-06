import { motion } from "framer-motion";
import { BarChart3, Globe, TrendingUp, AlertTriangle, Eye, ShoppingCart, ArrowUpRight, ArrowDownRight, Sparkles, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const METRICS = [
  { label: "Total Traffic", value: "12,847", change: "+14.2%", up: true, icon: Eye },
  { label: "Conversion Rate", value: "3.2%", change: "+0.4%", up: true, icon: TrendingUp },
  { label: "Cart Abandonment", value: "68%", change: "-2.1%", up: true, icon: ShoppingCart },
  { label: "Site Health", value: "87/100", change: "+3", up: true, icon: Globe },
];

const TOP_PAGES = [
  { page: "/", name: "Homepage", views: 4201, conversion: "4.1%", health: 92 },
  { page: "/services", name: "Services", views: 2103, conversion: "2.8%", health: 85 },
  { page: "/book", name: "Booking", views: 1847, conversion: "12.4%", health: 90 },
  { page: "/pricing", name: "Pricing", views: 1204, conversion: "5.2%", health: 78 },
  { page: "/about", name: "About", views: 892, conversion: "0.8%", health: 95 },
];

const WEAK_PAGES = [
  { page: "/blog/old-post", issue: "Stale content — last updated 9 months ago", severity: "high" },
  { page: "/products/item-12", issue: "Low conversion, weak CTA", severity: "medium" },
  { page: "/contact", issue: "Form has 7 fields — consider reducing", severity: "low" },
];

const LIVE_PROMOTIONS = [
  { name: "Summer Sale Banner", status: "active", expires: "3 days", placement: "Homepage hero" },
  { name: "Free Shipping", status: "active", expires: "7 days", placement: "Cart page" },
  { name: "Holiday Bundle", status: "scheduled", expires: "—", placement: "Collection page" },
];

const ADVISOR_SIGNALS = [
  { advisor: "CRO Advisor", signal: "Pricing page has high bounce — add social proof below fold", type: "opportunity" },
  { advisor: "Content Strategist", signal: "12 blog posts haven't been updated in 6+ months", type: "warning" },
  { advisor: "SEO Advisor", signal: "3 pages missing meta descriptions", type: "fix" },
  { advisor: "Design Director", signal: "Mobile CTA on services page barely visible", type: "alert" },
];

export default function PresenceBoardroom() {
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <DemoModeBadge />
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Presence Boardroom</h1>
        <p className="text-sm text-muted-foreground">Website health, traffic, conversions & advisor intelligence</p>
      </motion.div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {METRICS.map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <m.icon className="w-4 h-4 text-primary" />
                  {m.up ? <ArrowUpRight className="w-3 h-3 text-green-400" /> : <ArrowDownRight className="w-3 h-3 text-red-400" />}
                </div>
                <p className="text-2xl font-bold text-foreground">{m.value}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">{m.label}</span>
                  <span className={`text-xs font-medium ${m.up ? "text-green-400" : "text-red-400"}`}>{m.change}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm">Top Pages</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {TOP_PAGES.map(p => (
              <div key={p.page} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium text-foreground">{p.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">{p.page}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{p.views.toLocaleString()} views</span>
                  <Badge variant="secondary" className="text-[10px]">{p.conversion}</Badge>
                  <div className="w-12"><Progress value={p.health} className="h-1.5" /></div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Weak Pages */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-400" /> Weak Pages</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {WEAK_PAGES.map(p => (
              <div key={p.page} className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono text-muted-foreground">{p.page}</span>
                  <Badge variant={p.severity === "high" ? "destructive" : "secondary"} className="text-[10px]">{p.severity}</Badge>
                </div>
                <p className="text-xs text-foreground">{p.issue}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Live Promotions */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Clock className="w-4 h-4 text-orange-400" /> Live Promotions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {LIVE_PROMOTIONS.map(p => (
              <div key={p.name} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium text-foreground">{p.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">on {p.placement}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={p.status === "active" ? "default" : "secondary"} className="text-[10px]">{p.status}</Badge>
                  {p.expires !== "—" && <span className="text-[10px] text-muted-foreground">expires {p.expires}</span>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Advisor Signals */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Sparkles className="w-4 h-4 text-violet-400" /> Advisor Signals</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {ADVISOR_SIGNALS.map((s, i) => (
              <div key={i} className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={s.type === "alert" ? "destructive" : s.type === "warning" ? "secondary" : "default"} className="text-[10px]">{s.advisor}</Badge>
                </div>
                <p className="text-xs text-foreground">{s.signal}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
