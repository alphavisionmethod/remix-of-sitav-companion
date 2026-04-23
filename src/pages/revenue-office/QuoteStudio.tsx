import { Typography } from "@/components/sita/Typography";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import {
  FileText, DollarSign, Send, Clock, Eye, CheckCircle, AlertTriangle,
  TrendingUp, Package, Plus, ArrowRight, Brain, Users, Mail, Phone,
  Star, Shield, Target, RefreshCw, Zap, BarChart3, XCircle
} from "lucide-react";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
const quoteStats: any[] = [];
const quotes: any[] = [];
const upsellSuggestions: any[] = [];
const pricingInsights: any[] = [];
const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-blue-500/10 text-blue-400",
  viewed: "bg-amber-500/10 text-amber-400",
  accepted: "bg-emerald-500/10 text-emerald-400",
  expired: "bg-red-500/10 text-red-400",
};

export default function QuoteStudio() {
  const [tab, setTab] = useState("pipeline");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
<div className="flex items-center justify-between">
        <div>
          <Typography role="appTitle" className="flex items-center gap-2"><FileText className="h-6 w-6 text-blue-400" />Quote Studio</Typography>
          <p className="text-muted-foreground">Generate, send, track, and automate proposals with AI-powered pricing, upsell suggestions, and follow-up</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium">Import Template</button>
          <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2"><Plus className="h-4 w-4" />New Quote</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {([] as typeof quoteStats).map((s) => (
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
          <TabsTrigger value="pipeline">Pipeline ({([] as typeof quotes).length})</TabsTrigger>
          <TabsTrigger value="upsells">Upsell Suggestions ({([] as typeof upsellSuggestions).length})</TabsTrigger>
          <TabsTrigger value="insights">Pricing Insights ({([] as typeof pricingInsights).length})</TabsTrigger>
          <TabsTrigger value="features">Capabilities</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-3">
          {([] as typeof quotes).map((q) => (
            <Card key={q.client} className="bg-card/50 border-border/50 hover:border-primary/20 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{q.client}</p>
                    <p className="text-xs text-muted-foreground">{q.service}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-foreground">${q.amount.toLocaleString()}</span>
                    {q.discount && <Badge variant="outline" className="text-[10px] text-amber-400">{q.discount} off</Badge>}
                    <Badge className={`${statusColors[q.status]} text-[10px]`}>{q.status}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                  {q.sentAt && <span>Sent: {q.sentAt}</span>}
                  {q.viewedAt && <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{q.viewCount}x viewed</span>}
                  {q.expiresIn && <span>Expires: {q.expiresIn}</span>}
                  <span className="text-foreground">{q.followUp}</span>
                </div>
                {q.objections && <p className="text-[10px] text-amber-400 mb-1">Objection noted: {q.objections}</p>}
                <div className="p-2 rounded bg-primary/5 border border-primary/10 mb-2">
                  <p className="text-[10px] text-foreground flex items-start gap-1"><Brain className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />{q.aiInsight}</p>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-border/20">
                  <button className="px-3 py-1.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-medium flex items-center gap-1">
                    <Zap className="h-3 w-3" />Generate from CRM context
                  </button>
                  <button className="px-3 py-1.5 rounded bg-secondary text-secondary-foreground text-[10px] flex items-center gap-1">
                    <RefreshCw className="h-3 w-3" />Auto follow-up
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="upsells" className="space-y-3">
          {([] as typeof upsellSuggestions).map((u, i) => (
            <Card key={i} className="bg-card/50 border-border/50">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-foreground"><span className="font-medium">{u.client}:</span> {u.suggestion}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{u.reason}</p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <div className="text-right">
                    <Badge variant="secondary" className="text-[10px]">{u.confidence}% fit</Badge>
                    <p className="text-[10px] text-emerald-400 mt-0.5">{u.impact}</p>
                  </div>
                  <button className="px-3 py-1.5 rounded-md bg-primary/10 text-primary text-xs font-medium">Add to Quote</button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="insights" className="space-y-3">
          {([] as typeof pricingInsights).map((p, i) => (
            <Card key={i} className="bg-card/50 border-border/50">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-start gap-2 flex-1">
                  <Brain className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-foreground">{p.insight}</p>
                    <Badge variant="secondary" className="text-[10px] mt-1">{p.type}</Badge>
                  </div>
                </div>
                <button className="px-3 py-1.5 rounded bg-primary/10 text-primary text-xs font-medium ml-4">{p.action}</button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="features" className="grid md:grid-cols-3 gap-4">
          {[
            { title: "AI Quote Generation", desc: "Create quotes from CRM notes, call transcripts, intake forms, or booking context. AI selects services, pricing, and terms.", icon: Brain },
            { title: "PDF & Digital Delivery", desc: "Professional branded PDF output with one-click send, email tracking, and view notifications.", icon: Send },
            { title: "Follow-up Automation", desc: "Auto-reminders at day 3/5/7, expiry alerts, viewed-but-no-response recovery, and escalation to personal call.", icon: Clock },
            { title: "Pricing Rules Engine", desc: "Volume discounts, bundle pricing, seasonal adjustments, loyalty tiers, and custom pricing approval workflows.", icon: DollarSign },
            { title: "Upsell Intelligence", desc: "AI-powered add-on suggestions based on client profile, purchase history, and similar client patterns.", icon: TrendingUp },
            { title: "Approval Workflows", desc: "Discount thresholds, VIP pricing, custom terms — all routed through approval with Decision Theater integration.", icon: Shield },
            { title: "Quote Analytics", desc: "Acceptance rates by service, client segment, pricing tier, discount level, and follow-up cadence.", icon: BarChart3 },
            { title: "Template Library", desc: "Industry-specific proposal templates with pre-configured services, pricing, terms, and social proof blocks.", icon: Package },
            { title: "Competition Intelligence", desc: "Track win/loss reasons, competitor mentions in objections, and pricing position relative to market.", icon: Target },
          ].map((f) => (
            <Card key={f.title} className="bg-card/50 border-border/50 hover:border-primary/20 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <f.icon className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium text-foreground">{f.title}</p>
                </div>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
