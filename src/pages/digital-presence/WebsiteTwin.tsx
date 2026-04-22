import { PageShell } from "@/components/sita/PageShell";
import { motion } from "framer-motion";
import { Monitor, ArrowRight, AlertTriangle, TrendingUp, Smartphone, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DEMO_CONVERSION_PATHS, DEMO_PAGE_TREE, DEMO_WEAK_NODES } from "@/data/seed/digital-presence";
import DPOSubNav from "./DPOSubNav";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
function PageNode({ page, depth = 0 }: { page: typeof DEMO_PAGE_TREE[0]; depth?: number }) {
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
    <PageShell width="wide">
      <DPOSubNav />
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Website Twin</h1>
        <p className="text-sm text-muted-foreground">Live model of your site hierarchy, performance & customer paths</p>
      </motion.div>

      {/* Page Tree */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Monitor className="w-4 h-4 text-cyan-400" /> Page Hierarchy</CardTitle></CardHeader>
        <CardContent>
          {([] as typeof DEMO_PAGE_TREE).map(p => <PageNode key={p.path} page={p} />)}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Conversion Paths */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4 text-green-400" /> Conversion Paths</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {([] as typeof DEMO_CONVERSION_PATHS).map(cp => (
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
            {([] as typeof DEMO_WEAK_NODES).map(w => (
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
    </PageShell>
  );
}
