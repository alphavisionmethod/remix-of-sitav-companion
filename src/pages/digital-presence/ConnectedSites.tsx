import { motion } from "framer-motion";
import { Globe, Link2, RefreshCw, Shield, AlertTriangle, CheckCircle, Plus, Settings, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSites } from "@/hooks/use-digital-presence";
import { DEMO_AI_RECOMMENDATIONS, DEMO_AUDIT_FINDINGS, DEMO_DPO_PLATFORMS as DEMO_PLATFORMS } from "@/data/seed/digital-presence";
import DPOSubNav from "./DPOSubNav";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";

export default function ConnectedSites() {
  const { isDemoMode } = useDataMode();
  const { data: liveData, isLoading } = useSites();
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <DPOSubNav />
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Connected Website Manager</h1>
        <p className="text-sm text-muted-foreground">Connect, audit, monitor and optimize your web platforms</p>
      </motion.div>

      {/* Connected Platforms */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DEMO_PLATFORMS.map(p => (
          <Card key={p.name} className={`bg-card/50 border-border/50 ${p.connected ? "hover:border-primary/30" : "opacity-60"} transition-all`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{p.icon}</span>
                  <h3 className="text-sm font-semibold text-foreground">{p.name}</h3>
                </div>
                {p.connected ? (
                  <Badge variant="default" className="text-[10px]"><CheckCircle className="w-3 h-3 mr-1" /> Connected</Badge>
                ) : (
                  <Button variant="outline" size="sm" className="h-7 text-xs"><Plus className="w-3 h-3 mr-1" /> Connect</Button>
                )}
              </div>
              {p.connected && (
                <>
                  <p className="text-[10px] font-mono text-muted-foreground mb-2">{p.url}</p>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>Health: <span className={p.health >= 85 ? "text-green-400" : "text-amber-400"}>{p.health}%</span></span>
                    <span>Synced {p.lastSync}</span>
                    {p.issues > 0 && <Badge variant="destructive" className="text-[10px]">{p.issues} issues</Badge>}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button variant="ghost" size="sm" className="h-6 text-[10px]"><RefreshCw className="w-3 h-3 mr-1" /> Sync</Button>
                    <Button variant="ghost" size="sm" className="h-6 text-[10px]"><Activity className="w-3 h-3 mr-1" /> Audit</Button>
                    <Button variant="ghost" size="sm" className="h-6 text-[10px]"><Settings className="w-3 h-3 mr-1" /> Manage</Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Audit Findings */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-400" /> Audit Findings</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {DEMO_AUDIT_FINDINGS.map((f, i) => (
              <div key={i} className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">{f.site}</Badge>
                    <Badge variant={f.severity === "high" ? "destructive" : "secondary"} className="text-[10px]">{f.severity}</Badge>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">{f.category}</Badge>
                </div>
                <p className="text-xs text-foreground">{f.finding}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Shield className="w-4 h-4 text-green-400" /> AI Recommendations</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {DEMO_AI_RECOMMENDATIONS.map((r, i) => (
              <div key={i} className="p-3 bg-muted/30 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-foreground">{r.action}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{r.impact}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">Risk: {r.risk}</Badge>
                  {r.autoFixable && <Button size="sm" variant="outline" className="h-6 text-[10px]">Auto-fix</Button>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
