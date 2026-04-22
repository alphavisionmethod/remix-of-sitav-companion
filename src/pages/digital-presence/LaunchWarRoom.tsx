import { motion } from "framer-motion";
import { Rocket, CheckCircle, AlertTriangle, Clock, Layout, FileText, Eye, ShoppingCart, BarChart3, Undo2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DEMO_LAUNCH_TIMELINE } from "@/data/seed/digital-presence";
import DPOSubNav from "./DPOSubNav";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
export default function LaunchWarRoom() {
  const overallScore = Math.round(([] as typeof DEMO_READINESS_CHECKS).reduce((sum, c) => sum + c.score, 0) / Math.max(([] as typeof DEMO_READINESS_CHECKS).length, 1));
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <DPOSubNav />
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Launch War Room</h1>
        <p className="text-sm text-muted-foreground">Launch readiness, checklist, timeline & rollback planning</p>
      </motion.div>

      {/* Overall readiness */}
      <Card className="bg-card/50 border-border/50 border-primary/20">
        <CardContent className="p-6 text-center">
          <p className="text-4xl font-bold text-foreground">{overallScore}%</p>
          <p className="text-sm text-muted-foreground mt-1">Overall Launch Readiness</p>
          <Progress value={overallScore} className="h-3 mt-3 max-w-md mx-auto" />
          <Badge variant={overallScore >= 85 ? "default" : "destructive"} className="mt-3">
            {overallScore >= 85 ? "Ready to Launch" : "Needs Attention"}
          </Badge>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Readiness Checks */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Rocket className="w-4 h-4 text-pink-400" /> Readiness Checks</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {([] as typeof DEMO_READINESS_CHECKS).map(c => (
              <div key={c.area} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  {c.status === "ready" ? <CheckCircle className="w-4 h-4 text-green-400" /> : <AlertTriangle className="w-4 h-4 text-amber-400" />}
                  <div>
                    <span className="text-xs font-medium text-foreground">{c.area}</span>
                    <p className="text-[10px] text-muted-foreground">{c.details}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12"><Progress value={c.score} className="h-1.5" /></div>
                  <span className={`text-[10px] font-bold ${c.score >= 80 ? "text-green-400" : "text-amber-400"}`}>{c.score}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Launch Timeline */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Clock className="w-4 h-4 text-blue-400" /> Launch Timeline</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {([] as typeof DEMO_LAUNCH_TIMELINE).map(t => (
              <div key={t.time} className="flex items-center gap-3 p-2">
                <span className="text-xs font-mono text-muted-foreground w-12">{t.time}</span>
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-xs text-foreground">{t.task}</span>
                  <Badge variant={t.status === "done" ? "default" : "secondary"} className="text-[10px]">
                    {t.status === "done" ? <CheckCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                    {t.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Rollback */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Undo2 className="w-5 h-5 text-muted-foreground" />
            <div>
              <h3 className="text-sm font-semibold text-foreground">Rollback Plan</h3>
              <p className="text-[10px] text-muted-foreground">Previous version saved. Instant rollback available if issues detected post-launch.</p>
            </div>
          </div>
          <Badge variant="default" className="text-[10px]"><CheckCircle className="w-3 h-3 mr-1" /> Ready</Badge>
        </CardContent>
      </Card>
    </div>
  );
}
