import { motion } from "framer-motion";
import { Monitor, ArrowRight, AlertTriangle, TrendingUp, Smartphone, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const PAGE_TREE = [
  { path: "/", label: "Homepage", health: 92, views: 4201, mobile: 88, children: [
    { path: "/services", label: "Services", health: 85, views: 2103, mobile: 72 },
    { path: "/pricing", label: "Pricing", health: 78, views: 1204, mobile: 80 },
    { path: "/about", label: "About", health: 95, views: 892, mobile: 91 },
    { path: "/contact", label: "Contact", health: 70, views: 445, mobile: 65 },
  ]},
  { path: "/book", label: "Booking", health: 90, views: 1847, mobile: 85, children: [] },
  { path: "/shop", label: "Shop", health: 82, views: 3102, mobile: 76, children: [
    { path: "/shop/cart", label: "Cart", health: 75, views: 1200, mobile: 70 },
    { path: "/shop/checkout", label: "Checkout", health: 68, views: 890, mobile: 62 },
  ]},
  { path: "/blog", label: "Blog", health: 60, views: 2800, mobile: 82, children: [] },
];

const CONVERSION_PATHS = [
  { name: "Homepage → Services → Book", rate: "12.4%", volume: 342, trend: "up" },
  { name: "Homepage → Shop → Cart → Checkout", rate: "3.8%", volume: 198, trend: "down" },
  { name: "Blog → Services → Contact", rate: "2.1%", volume: 87, trend: "stable" },
  { name: "Landing Page → Book", rate: "18.2%", volume: 156, trend: "up" },
];

const WEAK_NODES = [
  { page: "/shop/checkout", issue: "68% drop-off at payment step", severity: "critical" },
  { page: "/contact", issue: "Mobile form barely usable — 65% mobile score", severity: "high" },
  { page: "/blog", issue: "14 posts older than 6 months, no updates", severity: "medium" },
];

function PageNode({ page, depth = 0 }: { page: typeof PAGE_TREE[0]; depth?: number }) {
  const healthColor = page.health >= 85 ? "text-green-400" : page.health >= 70 ? "text-amber-400" : "text-red-400";
  return (
    <div style={{ marginLeft: depth * 24 }}>
      <div className="flex items-center justify-between p-2 hover:bg-muted/30 rounded-md transition-colors">
        <div className="flex items-center gap-2">
          {depth > 0 && <ArrowRight className="w-3 h-3 text-muted-foreground" />}
          <span className="text-sm font-medium text-foreground">{page.label}</span>
          <span className="text-[10px] font-mono text-muted-foreground">{page.path}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1"><Eye className="w-3 h-3 text-muted-foreground" /><span className="text-[10px] text-muted-foreground">{page.views.toLocaleString()}</span></div>
          <div className="flex items-center gap-1"><Smartphone className="w-3 h-3 text-muted-foreground" /><span className="text-[10px] text-muted-foreground">{page.mobile}%</span></div>
          <div className="w-16"><Progress value={page.health} className="h-1.5" /></div>
          <span className={`text-[10px] font-bold ${healthColor}`}>{page.health}</span>
        </div>
      </div>
      {page.children?.map(c => <PageNode key={c.path} page={{ ...c, children: [] }} depth={depth + 1} />)}
    </div>
  );
}

export default function WebsiteTwin() {
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Website Twin</h1>
        <p className="text-sm text-muted-foreground">Live model of your site hierarchy, performance & customer paths</p>
      </motion.div>

      {/* Page Tree */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Monitor className="w-4 h-4 text-cyan-400" /> Page Hierarchy</CardTitle></CardHeader>
        <CardContent>
          {PAGE_TREE.map(p => <PageNode key={p.path} page={p} />)}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Conversion Paths */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4 text-green-400" /> Conversion Paths</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {CONVERSION_PATHS.map(cp => (
              <div key={cp.name} className="p-3 bg-muted/30 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-foreground">{cp.name}</p>
                  <p className="text-[10px] text-muted-foreground">{cp.volume} completions</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-foreground">{cp.rate}</span>
                  <Badge variant={cp.trend === "up" ? "default" : cp.trend === "down" ? "destructive" : "secondary"} className="ml-2 text-[10px]">{cp.trend}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Weak Nodes */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-400" /> Weak Nodes</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {WEAK_NODES.map(w => (
              <div key={w.page} className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono text-muted-foreground">{w.page}</span>
                  <Badge variant={w.severity === "critical" ? "destructive" : "secondary"} className="text-[10px]">{w.severity}</Badge>
                </div>
                <p className="text-xs text-foreground">{w.issue}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
