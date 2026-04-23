import { Typography } from "@/components/sita/Typography";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import {
  Phone, Users, Clock, FileText, CheckCircle, AlertTriangle, Calendar,
  TrendingUp, ArrowRight, MessageSquare, Brain, Target, DollarSign,
  Star, Mail, Zap, Eye, Shield, BarChart3, RefreshCw
} from "lucide-react";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
const priorityColors: Record<string, string> = { critical: "bg-red-500/10 text-red-400", high: "bg-amber-500/10 text-amber-400", medium: "bg-blue-500/10 text-blue-400", low: "bg-muted text-muted-foreground" };

export default function CallDesk() {
  const [tab, setTab] = useState("queue");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
<div>
        <Typography role="appTitle" className="flex items-center gap-2"><Phone className="h-6 w-6 text-blue-400" />Call Desk</Typography>
        <p className="text-muted-foreground">Prioritized call queue, AI prep briefs, relationship context, outcome logging, and auto-generated follow-ups</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {([] as typeof DEMO_callStats).map((s) => (
          <Card key={s.label} className="bg-card/50 border-border/50">
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 mb-1"><s.icon className={`h-3.5 w-3.5 ${s.color}`} /><p className="text-[10px] text-muted-foreground">{s.label}</p></div>
              <p className="text-lg font-bold text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.delta}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-card/50">
          <TabsTrigger value="queue">Call Queue ({([] as typeof DEMO_callQueue).length})</TabsTrigger>
          <TabsTrigger value="recent">Recent Calls ({([] as typeof DEMO_recentCalls).length})</TabsTrigger>
          <TabsTrigger value="analytics">Call Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-3">
          {([] as typeof DEMO_callQueue).map((c) => (
            <Card key={c.name} className="bg-card/50 border-border/50 hover:border-primary/20 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">{c.name[0]}{c.name.split(' ')[1]?.[0]}</div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-foreground">{c.value}</span>
                    <Badge className={`${priorityColors[c.priority]} text-[10px]`}>{c.priority}</Badge>
                    <button className="px-4 py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium flex items-center gap-1 hover:bg-primary/20"><Phone className="h-3 w-3" />Call</button>
                  </div>
                </div>

                <p className="text-xs text-foreground mb-2">{c.reason}</p>

                <div className="grid md:grid-cols-2 gap-3">
                  {/* Prep Brief */}
                  <div className="p-3 rounded-lg bg-background/50 border border-border/30">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">AI Prep Brief</p>
                    <p className="text-xs text-foreground mb-2">{c.prepNotes}</p>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span>Last contact: {c.lastContact}</span>
                      <span>Warmth: <span className={c.warmth >= 70 ? "text-emerald-400" : c.warmth >= 50 ? "text-amber-400" : "text-red-400"}>{c.warmth}%</span></span>
                    </div>
                  </div>

                  {/* Talking Points */}
                  <div className="p-3 rounded-lg bg-background/50 border border-border/30">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Suggested Talking Points</p>
                    <ul className="space-y-1">
                      {c.suggestedTalkingPoints.map((tp, i) => (
                        <li key={i} className="text-xs text-foreground flex items-start gap-1"><span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />{tp}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {c.objections.length > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] text-amber-400 font-medium">Objections:</span>
                    {c.objections.map((obj) => <Badge key={obj} variant="outline" className="text-[10px] text-amber-400">{obj}</Badge>)}
                  </div>
                )}

                <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="font-medium">Post-call:</span>
                  {c.postCallActions.map((action, i) => <span key={i} className="text-foreground">{action}{i < c.postCallActions.length - 1 ? " → " : ""}</span>)}
                </div>

                <div className="mt-2 pt-2 border-t border-border/20 flex items-center gap-2">
                  <button className="px-3 py-1.5 rounded bg-primary/10 text-primary text-[10px] font-medium flex items-center gap-1">
                    <Zap className="h-3 w-3" />Create post-call automation
                  </button>
                  <button className="px-3 py-1.5 rounded bg-secondary text-secondary-foreground text-[10px] flex items-center gap-1">
                    <ArrowRight className="h-3 w-3" />Wire outcome → quote
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="recent" className="space-y-2">
          {([] as typeof DEMO_recentCalls).map((c, i) => (
            <Card key={i} className="bg-card/50 border-border/50">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-foreground">{c.name}</p>
                    <span className="text-xs text-muted-foreground">({c.company})</span>
                    <Badge className={`text-[10px] ${c.sentiment === "very positive" || c.sentiment === "positive" ? "bg-emerald-500/10 text-emerald-400" : c.sentiment === "warm" ? "bg-blue-500/10 text-blue-400" : "bg-muted text-muted-foreground"}`}>{c.sentiment}</Badge>
                  </div>
                  <p className="text-xs text-foreground">{c.outcome}</p>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                    <span>{c.duration}</span>
                    <span>{c.time}</span>
                    {c.quoteTriggered && <Badge className="bg-blue-500/10 text-blue-400 text-[10px]">Quote triggered</Badge>}
                    {c.followUpSent && <Badge className="bg-emerald-500/10 text-emerald-400 text-[10px]">Follow-up sent</Badge>}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-xs text-foreground">{c.nextStep}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="analytics" className="grid md:grid-cols-2 gap-3">
          {([] as typeof DEMO_callAnalytics).map((a) => (
            <Card key={a.metric} className="bg-card/50 border-border/50">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{a.metric}</p>
                <p className="text-lg font-bold text-foreground">{a.value}</p>
                <div className="flex items-center gap-2 mt-1 text-[10px]">
                  <span className={a.trend === "improving" ? "text-emerald-400" : "text-blue-400"}>{a.trend}</span>
                  <span className="text-muted-foreground">{a.benchmark}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
