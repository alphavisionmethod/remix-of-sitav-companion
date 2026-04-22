import { motion } from "framer-motion";
import { AlertTriangle, Link2, Image, Clock, MousePointer, Shield, Smartphone, ShoppingCart, FileText, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DEMO_ERRORS, DEMO_OPPORTUNITIES } from "@/data/seed/digital-presence";
import DPOSubNav from "./DPOSubNav";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";

export default function ErrorRadar() {
  const { isDemoMode } = useDataMode();
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <DPOSubNav />
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Error & Opportunity Radar</h1>
        <p className="text-sm text-muted-foreground">Broken links, stale content, weak CTAs, trust gaps & growth opportunities</p>
      </motion.div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Critical Issues", value: "1", color: "text-red-400" },
          { label: "High Severity", value: "5", color: "text-amber-400" },
          { label: "Medium", value: "2", color: "text-yellow-400" },
          { label: "Opportunities", value: "5", color: "text-green-400" },
        ].map(s => (
          <Card key={s.label} className="bg-card/50 border-border/50">
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Errors */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-400" /> Detected Issues</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {DEMO_ERRORS.map((e, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3 flex-1">
                <e.icon className="w-4 h-4 text-muted-foreground shrink-0" />
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-medium text-foreground">{e.type}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">{e.page}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{e.detail}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={e.severity === "critical" ? "destructive" : e.severity === "high" ? "destructive" : "secondary"} className="text-[10px]">{e.severity}</Badge>
                {e.autoFixable && <Button size="sm" variant="outline" className="h-6 text-[10px]">Auto-fix</Button>}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Opportunities */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Sparkles className="w-4 h-4 text-green-400" /> Growth Opportunities</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {DEMO_OPPORTUNITIES.map(o => (
            <div key={o.title} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <p className="text-xs font-medium text-foreground">{o.title}</p>
                <Badge variant="secondary" className="text-[10px] mt-1">{o.category}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">Impact: {o.impact}</span>
                <span className="text-[10px] text-muted-foreground">Effort: {o.effort}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
