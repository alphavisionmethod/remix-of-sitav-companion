import { PageShell } from "@/platform/sita/components/sita/PageShell";
import { motion } from "framer-motion";
import { Clock, FileText, Tag, MapPin, Phone, AlertTriangle, CheckCircle, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import DPOSubNav from "./DPOSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
export default function ContentFreshness() {
  return (
    <PageShell width="wide">
      <DPOSubNav />
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Content Freshness Center</h1>
        <p className="text-sm text-muted-foreground">Outdated pages, expired offers, stale info & messaging inconsistencies</p>
      </motion.div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Stale Pages", value: ([] as any[]).length, color: "text-amber-400" },
          { label: "Expired Offers Live", value: ([] as any[]).filter(o => o.stillLive).length, color: "text-red-400" },
          { label: "Stale Info", value: ([] as any[]).length, color: "text-orange-400" },
          { label: "Inconsistencies", value: ([] as any[]).length, color: "text-purple-400" },
        ].map(s => (
          <Card key={s.label} className="bg-card/50 border-border/50">
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Stale Pages */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Clock className="w-4 h-4 text-amber-400" /> Stale Pages</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {([] as any[]).map(p => (
              <div key={p.page} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <span className="text-xs font-mono text-muted-foreground">{p.page}</span>
                  <p className="text-[10px] text-muted-foreground">Last updated {p.lastUpdated} · {p.views} views</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">{p.category}</Badge>
                  <div className="w-12"><Progress value={p.staleness} className="h-1.5" /></div>
                  <span className="text-[10px] text-red-400">{p.staleness}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Expired Offers */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Tag className="w-4 h-4 text-red-400" /> Expired Offers</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {([] as any[]).map(o => (
              <div key={o.offer} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <span className="text-xs font-medium text-foreground">{o.offer}</span>
                  <p className="text-[10px] text-muted-foreground">{o.page} · expired {o.expiredDays} days ago</p>
                </div>
                {o.stillLive ? (
                  <Badge variant="destructive" className="text-[10px]"><AlertTriangle className="w-3 h-3 mr-1" /> Still Live</Badge>
                ) : (
                  <Badge variant="default" className="text-[10px]"><CheckCircle className="w-3 h-3 mr-1" /> Removed</Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Stale Info */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-orange-400" /> Outdated Information</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {([] as any[]).map(s => (
              <div key={s.type} className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <s.icon className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground">{s.type}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">{s.page}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">{s.issue}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Inconsistencies */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Sparkles className="w-4 h-4 text-purple-400" /> Messaging Inconsistencies</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {([] as any[]).map((c, i) => (
              <div key={i} className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-1 mb-1">
                  {c.pages.map(p => <Badge key={p} variant="secondary" className="text-[10px]">{p}</Badge>)}
                </div>
                <p className="text-[10px] text-foreground">{c.issue}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
