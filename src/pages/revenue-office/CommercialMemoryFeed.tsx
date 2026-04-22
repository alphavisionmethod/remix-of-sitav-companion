import { Typography } from "@/components/sita/Typography";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Activity, TrendingUp, TrendingDown, Users, Star, Zap, Calendar, Package, AlertTriangle, CheckCircle, Pin, ListChecks, Filter } from "lucide-react";
import { DEMO_MEMORY_PINNED } from "@/data/seed/revenue-office";
import { useCommercialMemoryEvents } from "@/hooks/use-revenue-office";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
const typeLabels: Record<string, string> = { campaign: "Campaign", reputation: "Reputation", crm: "CRM", booking: "Booking", advisor: "Advisor", funnel: "Funnel", membership: "Membership", offer: "Offer" };
const allDomains = Object.keys(typeLabels);

export default function CommercialMemoryFeed() {
  const { data: liveMemoryEvents } = useCommercialMemoryEvents();
  const memoryEvents = (liveMemoryEvents && liveMemoryEvents.length > 0 ? liveMemoryEvents : []);
  const pinnedItems = DEMO_MEMORY_PINNED;
  const [activeDomain, setActiveDomain] = useState<string>("all");
  const [acknowledged, setAcknowledged] = useState<Set<number>>(new Set());

  const filteredEvents = activeDomain === "all" ? memoryEvents : memoryEvents.filter(e => e.type === activeDomain);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
<div>
        <Typography role="appTitle" className="flex items-center gap-2"><Activity className="w-6 h-6 text-primary" /> Commercial Memory Feed</Typography>
        <p className="text-muted-foreground">A living stream with acknowledgment, pinning, task conversion, and domain filtering</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-foreground">{memoryEvents.length}</p><p className="text-xs text-muted-foreground">Events (7 days)</p></CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-red-400">{memoryEvents.filter(e => e.severity === "high").length}</p><p className="text-xs text-muted-foreground">High Severity</p></CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-emerald-400">{memoryEvents.filter(e => e.severity === "low").length}</p><p className="text-xs text-muted-foreground">Positive Signals</p></CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-primary">{pinnedItems.length}</p><p className="text-xs text-muted-foreground">Pinned</p></CardContent></Card>
      </div>

      {/* Pinned Items */}
      {pinnedItems.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Pin className="w-4 h-4 text-primary" /> Pinned Memories</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {pinnedItems.map(p => (
              <div key={p.id} className="flex items-center justify-between p-2 rounded bg-background/50 border border-border/30">
                <div className="flex items-center gap-2">
                  <Pin className="w-3 h-3 text-primary" />
                  <span className="text-sm text-foreground">{p.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[9px]">{p.domain}</Badge>
                  <span className="text-[10px] text-muted-foreground">{p.date}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Domain Filter Tabs */}
      <div className="flex gap-1.5 flex-wrap">
        <Badge variant={activeDomain === "all" ? "default" : "outline"} className="cursor-pointer text-xs" onClick={() => setActiveDomain("all")}>All</Badge>
        {allDomains.map(d => (
          <Badge key={d} variant={activeDomain === d ? "default" : "outline"} className="cursor-pointer text-xs capitalize" onClick={() => setActiveDomain(d)}>
            {typeLabels[d]}
          </Badge>
        ))}
      </div>

      {/* Memory Stream */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-primary" />Memory Stream ({filteredEvents.length})</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {filteredEvents.map((e, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
              className={`flex items-start gap-3 p-3 rounded-lg border border-border/30 transition-colors ${acknowledged.has(i) ? "bg-muted/5 opacity-60" : "bg-background/50"}`}>
              <e.icon className={`h-4 w-4 mt-0.5 ${e.color}`} />
              <div className="flex-1">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <p className="text-sm text-foreground">{e.title}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">{typeLabels[e.type]}</Badge>
                    {e.severity === "high" && <Badge variant="destructive" className="text-[10px]">High</Badge>}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{e.time}</p>
                {/* Action buttons */}
                <div className="flex gap-1.5 mt-2">
                  {!acknowledged.has(i) && (
                    <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1" onClick={(ev) => { ev.stopPropagation(); setAcknowledged(prev => new Set(prev).add(i)); }}>
                      <CheckCircle className="w-3 h-3" /> Acknowledge
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1"><ListChecks className="w-3 h-3" /> Create Task</Button>
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1"><Pin className="w-3 h-3" /> Pin</Button>
                </div>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
