import { PageShell } from "@/platform/sita/components/sita/PageShell";
import { motion } from "framer-motion";
import { BarChart3, Globe, TrendingUp, AlertTriangle, Eye, ShoppingCart, ArrowUpRight, ArrowDownRight, Sparkles, Clock, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import DPOSubNav from "./DPOSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const METRICS: any[] = [];

// Production fallback — seed data removed
const ADVISOR_SIGNALS: any[] = [];

export default function PresenceBoardroom() {
  const navigate = useNavigate();
  return (
    <PageShell width="wide">
      <DPOSubNav />
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Presence Boardroom</h1>
        <p className="text-sm text-muted-foreground">Website health, traffic, conversions & advisor intelligence</p>
      </motion.div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {([] as any[]).map((m, i) => (
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
            {([] as any[]).map(p => (
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
            {([] as any[]).map(p => (
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
            {([] as any[]).map(p => (
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
            {([] as any[]).map((s, i) => (
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

      {/* Revenue Office Sync */}
      <Card className="bg-card/50 border-border/50 border-primary/20">
        <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><ArrowRight className="w-4 h-4 text-primary" /> Revenue Office Sync</CardTitle></CardHeader>
        <CardContent>
          <p className="text-[10px] text-muted-foreground mb-3">Promotions, campaigns, and offers sync between Revenue Office and your digital presence.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { label: "Funnel Studio", path: "/revenue-office/funnels" },
              { label: "Campaign Office", path: "/revenue-office/campaigns" },
              { label: "Offers & Products", path: "/revenue-office/offers" },
              { label: "Revenue Gate", path: "/revenue-office" },
            ].map(link => (
              <Button key={link.label} variant="outline" size="sm" className="text-[10px] h-7" onClick={() => navigate(link.path)}>
                {link.label} <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
