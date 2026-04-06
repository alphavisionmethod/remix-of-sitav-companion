import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Theater, AlertTriangle, CheckCircle, Users, TrendingUp, Shield, Zap, ArrowRight } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const pendingDecisions = [
  {
    title: "Launch 'Summer Accelerator' Campaign",
    type: "Campaign Launch",
    impact: "Est. 120 new leads, $18,000 revenue",
    risk: "Audience fatigue if timing overlaps with Spring campaign",
    affected: "3 funnels, 2 segments, 1,200 contacts",
    advisors: [
      { name: "Campaign Advisor", stance: "Approve — timing is good, but delay 5 days to avoid overlap", confidence: 78 },
      { name: "Funnel Advisor", stance: "Approve — landing pages are strong", confidence: 85 },
      { name: "Revenue Strategist", stance: "Approve with caution — watch fatigue signals", confidence: 72 },
    ],
    whatBreaks: ["Audience fatigue from recent Spring campaign", "Email deliverability if volume spikes", "Support capacity during launch week"],
  },
  {
    title: "Enable Auto-Booking for Free Consultations",
    type: "Booking Policy",
    impact: "Est. +40% booking rate, capacity utilization from 60% to 85%",
    risk: "No-show rate may increase without qualification step",
    affected: "All booking pages, 3 funnels, calendar",
    advisors: [
      { name: "Booking Advisor", stance: "Approve — add SMS reminder to offset no-shows", confidence: 82 },
      { name: "CRM Advisor", stance: "Approve — but add pre-call form for qualification", confidence: 76 },
    ],
    whatBreaks: ["No-show rate increase", "Calendar overwhelm without capacity limits", "Unqualified leads consuming time"],
  },
];

export default function DecisionTheater() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
      <DemoModeBadge />
      <div>
        <h1 className="text-2xl font-bold text-foreground">Business Decision Theater</h1>
        <p className="text-muted-foreground">Cinematic pre-launch review — impact, risk, advisor commentary, and authorization</p>
      </div>

      {pendingDecisions.map((d, i) => (
        <Card key={i} className="bg-card/50 border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Theater className="h-5 w-5 text-purple-400" />{d.title}</CardTitle>
              <Badge variant="secondary">{d.type}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-1"><TrendingUp className="h-4 w-4 text-emerald-400" /><span className="text-xs font-medium text-emerald-400">Expected Impact</span></div>
                <p className="text-sm text-foreground">{d.impact}</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <div className="flex items-center gap-2 mb-1"><AlertTriangle className="h-4 w-4 text-amber-400" /><span className="text-xs font-medium text-amber-400">Risk</span></div>
                <p className="text-sm text-foreground">{d.risk}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-1"><Users className="h-4 w-4 text-blue-400" /><span className="text-xs font-medium text-blue-400">Affected</span></div>
                <p className="text-sm text-foreground">{d.affected}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Advisor Commentary</p>
              {d.advisors.map((a, j) => (
                <div key={j} className="p-2 rounded bg-background/50 border border-border/30 flex items-center justify-between">
                  <div><span className="text-xs font-medium text-blue-400">{a.name}:</span> <span className="text-xs text-foreground">{a.stance}</span></div>
                  <Badge variant="secondary" className="text-[10px]">{a.confidence}% confidence</Badge>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1"><AlertTriangle className="h-3 w-3" />What Could Break This</p>
              {d.whatBreaks.map((w, j) => (
                <div key={j} className="flex items-center gap-2 text-xs text-foreground"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" />{w}</div>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2"><CheckCircle className="h-4 w-4" />Authorize Launch</button>
              <button className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium">Request More Analysis</button>
            </div>
          </CardContent>
        </Card>
      ))}
    </motion.div>
  );
}
