import { motion } from "framer-motion";
import { Megaphone, Clock, Tag, Calendar, Globe, Mail, MessageSquare, Sparkles, Plus, Eye, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSites } from "@/hooks/use-digital-presence";
import { DEMO_ACTIVE_PROMOTIONS, DEMO_EMAIL_SMS_SYNC, DEMO_PROMO_CALENDAR } from "@/data/seed/digital-presence";
import DPOSubNav from "./DPOSubNav";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
export default function PromotionsOffice() {
  const { data: liveData, isLoading } = useSites();
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <DPOSubNav />
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Promotions Office</h1>
            <p className="text-sm text-muted-foreground">Campaign pages, banners, promo timing & launch coordination</p>
          </div>
          <Button size="sm"><Plus className="w-3.5 h-3.5 mr-1.5" /> New Promotion</Button>
        </div>
      </motion.div>

      {/* Active Promotions */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Megaphone className="w-4 h-4 text-orange-400" /> Active & Scheduled Promotions</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {([] as typeof DEMO_ACTIVE_PROMOTIONS).map(p => (
            <div key={p.name} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-foreground">{p.name}</span>
                  <Badge variant={p.status === "active" ? "default" : p.status === "scheduled" ? "secondary" : "secondary"} className="text-[10px]">{p.status}</Badge>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span>{p.type}</span>
                  <span>on {p.placement}</span>
                  {p.expires !== "—" && <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> expires {p.expires}</span>}
                </div>
              </div>
              {p.status === "active" && (
                <div className="text-right text-[10px] text-muted-foreground">
                  <p>{p.impressions.toLocaleString()} impressions</p>
                  <p>{p.clicks} clicks · {p.ctr} CTR</p>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Promo Calendar */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-400" /> Promotion Calendar</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {([] as typeof DEMO_PROMO_CALENDAR).map(e => (
              <div key={e.date + e.event} className="flex items-center gap-3 p-2">
                <span className="text-xs font-mono text-muted-foreground w-14">{e.date}</span>
                <div className="flex-1">
                  <span className="text-xs text-foreground">{e.event}</span>
                </div>
                <Badge variant={e.type === "launch" ? "default" : e.type === "cleanup" ? "destructive" : "secondary"} className="text-[10px]">{e.type}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Email/SMS Sync */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Mail className="w-4 h-4 text-green-400" /> Email / SMS Sync</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {([] as typeof DEMO_EMAIL_SMS_SYNC).map(e => (
              <div key={e.campaign} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <span className="text-xs font-medium text-foreground">{e.campaign}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="secondary" className="text-[10px]">{e.channel}</Badge>
                    <Badge variant={e.status === "sent" ? "default" : "secondary"} className="text-[10px]">{e.status}</Badge>
                  </div>
                </div>
                {e.status === "sent" && (
                  <div className="text-right text-[10px] text-muted-foreground">
                    <p>Opens: {e.opens}</p>
                    <p>Clicks: {e.clicks}</p>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
