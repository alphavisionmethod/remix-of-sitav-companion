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

const callStats = [
  { label: "Calls Today", value: "8", delta: "3 completed, 5 remaining", icon: Phone, color: "text-blue-400" },
  { label: "Conversion Rate", value: "42%", delta: "+8% vs last month", icon: TrendingUp, color: "text-emerald-400" },
  { label: "Avg Call Duration", value: "18 min", delta: "optimal range", icon: Clock, color: "text-amber-400" },
  { label: "Follow-ups Pending", value: "5", delta: "2 overdue", icon: MessageSquare, color: "text-purple-400" },
  { label: "Revenue from Calls", value: "$28,400", delta: "this month", icon: DollarSign, color: "text-emerald-400" },
  { label: "No-Show Rate", value: "14%", delta: "-4% vs last month", icon: AlertTriangle, color: "text-amber-400" },
];

const callQueue = [
  { name: "Sarah Chen", company: "Apex Coaching Co.", priority: "critical", reason: "Quote follow-up — viewed 3x, no response in 5 days", value: "$12,500", lastContact: "5 days ago", warmth: 72, prepNotes: "Interested in Growth Strategy Package. Asked about ROI and timeline. Viewed pricing section 3x — likely price-sensitive.", objections: ["Comparing with competitor", "Wants ROI data"], suggestedTalkingPoints: ["Share case study from similar coaching business", "Offer payment plan option", "Reference their specific growth goals from intake"], postCallActions: ["Generate updated quote if needed", "Send case study", "Create follow-up task for 48hrs"] },
  { name: "Marcus Johnson", company: "Peak Performance", priority: "high", reason: "Discovery call — booked via funnel, high-value lead", value: "$18,000", lastContact: "New lead", warmth: 85, prepNotes: "Coaching program inquiry. 6-month commitment. Budget confirmed in form. Fitness industry. Source: Google Ads.", objections: [], suggestedTalkingPoints: ["Discuss 6-month program structure", "Share fitness client success stories", "Clarify onboarding process"], postCallActions: ["Generate quote", "Send program overview PDF", "Schedule follow-up if not closed"] },
  { name: "Emily Rodriguez", company: "Studio Bloom", priority: "high", reason: "Proposal review — sent marketing retainer, needs decision push", value: "$4,800", lastContact: "3 days ago", warmth: 58, prepNotes: "Comparing with competitor. Price-sensitive but values quality. Creative industry. Mentioned tight timeline.", objections: ["Price comparison", "Timeline concerns"], suggestedTalkingPoints: ["Emphasize speed of results", "Offer 3-month trial instead of 6", "Show portfolio of creative clients"], postCallActions: ["Adjust quote if needed", "Send portfolio examples", "Set decision deadline"] },
  { name: "David Kim", company: "Zenith Consulting", priority: "medium", reason: "Re-engagement — dormant 60 days, was a strong client", value: "$6,200", lastContact: "60 days ago", warmth: 45, prepNotes: "Previous client. Advisory retainer expired. Good relationship. Left due to budget timing, not dissatisfaction.", objections: ["Budget timing"], suggestedTalkingPoints: ["Reference previous successful engagement", "Offer refreshed scope", "Discuss Q3 budget alignment"], postCallActions: ["Generate new proposal if interested", "Schedule Q3 start if budget timing", "Add to reactivation sequence if not ready"] },
  { name: "Lisa Wang", company: "NextLevel Fitness", priority: "low", reason: "Check-in — onboarding week 2, satisfaction pulse", value: "$8,900", lastContact: "4 days ago", warmth: 92, prepNotes: "Website + funnel project. On track. Week 2 of 6. Very engaged. Ask about add-on services.", objections: [], suggestedTalkingPoints: ["Review project progress", "Ask about satisfaction", "Introduce SEO add-on opportunity"], postCallActions: ["Log satisfaction score", "Generate upsell quote if interested", "Update project status"] },
  { name: "Rachel Green", company: "Harmony Health", priority: "medium", reason: "Quote viewed 5x — very interested but hesitant", value: "$3,200", lastContact: "2 days ago", warmth: 68, prepNotes: "Content marketing package. Health/wellness industry. Wants to see more examples. 5 views = strong interest.", objections: ["Wants examples"], suggestedTalkingPoints: ["Share health industry content examples", "Offer sample content piece", "Discuss measurement framework"], postCallActions: ["Send content samples", "Update quote with sample deliverable", "Set 48hr follow-up"] },
];

const recentCalls = [
  { name: "Tom Harris", company: "Harris Legal", outcome: "Qualified — sending proposal", duration: "22 min", time: "2 hrs ago", nextStep: "Generate quote ($7,500)", sentiment: "positive", quoteTriggered: true, followUpSent: true },
  { name: "Anna Park", company: "Park Designs", outcome: "Booked follow-up for Thursday", duration: "15 min", time: "3 hrs ago", nextStep: "Send case studies before Thursday", sentiment: "warm", quoteTriggered: false, followUpSent: true },
  { name: "James Lee", company: "Lee Ventures", outcome: "Not interested — closed lost", duration: "8 min", time: "Yesterday", nextStep: "Add to reactivation (6 months)", sentiment: "neutral", quoteTriggered: false, followUpSent: false },
  { name: "Sophie Turner", company: "Turner Marketing", outcome: "Closed — accepted $5,200 retainer", duration: "28 min", time: "Yesterday", nextStep: "Onboarding triggered automatically", sentiment: "very positive", quoteTriggered: false, followUpSent: true },
  { name: "Mike Chen", company: "Chen Properties", outcome: "Needs internal approval — follow up Monday", duration: "35 min", time: "2 days ago", nextStep: "Send executive summary for their board", sentiment: "positive", quoteTriggered: true, followUpSent: true },
];

const callAnalytics = [
  { metric: "Calls to Close", value: "3.2 avg", trend: "improving", benchmark: "4.5 industry avg" },
  { metric: "Best Day for Calls", value: "Tuesday", trend: "stable", benchmark: "Based on 90-day data" },
  { metric: "Best Time for Calls", value: "10am-12pm", trend: "stable", benchmark: "42% higher connect rate" },
  { metric: "Avg Deal Size from Calls", value: "$6,800", trend: "improving", benchmark: "+22% vs email-only" },
  { metric: "Post-Call Follow-up Rate", value: "88%", trend: "improving", benchmark: "Target: 100%" },
  { metric: "No-Show Recovery Rate", value: "33%", trend: "stable", benchmark: "Via SMS rescue within 15min" },
];

const priorityColors: Record<string, string> = { critical: "bg-red-500/10 text-red-400", high: "bg-amber-500/10 text-amber-400", medium: "bg-blue-500/10 text-blue-400", low: "bg-muted text-muted-foreground" };

export default function CallDesk() {
  const [tab, setTab] = useState("queue");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Phone className="h-6 w-6 text-blue-400" />Call Desk</h1>
        <p className="text-muted-foreground">Prioritized call queue, AI prep briefs, relationship context, outcome logging, and auto-generated follow-ups</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {callStats.map((s) => (
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
          <TabsTrigger value="queue">Call Queue ({callQueue.length})</TabsTrigger>
          <TabsTrigger value="recent">Recent Calls ({recentCalls.length})</TabsTrigger>
          <TabsTrigger value="analytics">Call Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-3">
          {callQueue.map((c) => (
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
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="recent" className="space-y-2">
          {recentCalls.map((c, i) => (
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
          {callAnalytics.map((a) => (
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
