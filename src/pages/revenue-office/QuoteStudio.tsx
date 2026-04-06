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
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const quoteStats = [
  { label: "Active Quotes", value: "18", delta: "+4 this week", icon: FileText, color: "text-blue-400" },
  { label: "Pipeline Value", value: "$124,800", delta: "across 18 quotes", icon: DollarSign, color: "text-emerald-400" },
  { label: "Acceptance Rate", value: "68%", delta: "+5% vs last month", icon: CheckCircle, color: "text-emerald-400" },
  { label: "Avg Time to Accept", value: "4.2 days", delta: "-0.8 days improvement", icon: Clock, color: "text-amber-400" },
  { label: "Revenue from Quotes", value: "$84,200", delta: "this month closed", icon: TrendingUp, color: "text-emerald-400" },
  { label: "At-Risk Quotes", value: "4", delta: "$32,400 at risk", icon: AlertTriangle, color: "text-red-400" },
];

const quotes = [
  { client: "Apex Coaching Co.", service: "Growth Strategy Package", amount: 12500, status: "viewed", sentAt: "2 days ago", viewedAt: "1 day ago", viewCount: 3, expiresIn: "5 days", followUp: "Auto reminder at day 5", discount: null, priority: "high", objections: "Comparing with competitor", aiInsight: "Client viewed pricing section 3x — likely price-sensitive. Consider adding ROI projections." },
  { client: "Studio Bloom", service: "Marketing Retainer (6mo)", amount: 4800, status: "sent", sentAt: "1 day ago", viewedAt: null, viewCount: 0, expiresIn: "13 days", followUp: "Reminder at day 3", discount: null, priority: "medium", objections: null, aiInsight: "Similar clients in creative industry convert 40% higher with case study inclusion." },
  { client: "NextLevel Fitness", service: "Website + Funnel Bundle", amount: 8900, status: "accepted", sentAt: "5 days ago", viewedAt: "4 days ago", viewCount: 2, expiresIn: null, followUp: "Invoice generated → onboarding triggered", discount: "5%", priority: "closed", objections: null, aiInsight: "Accepted after case study send. Pattern: fitness clients respond to visual portfolio." },
  { client: "Zenith Consulting", service: "Advisory Retainer + SEO", amount: 6200, status: "expired", sentAt: "16 days ago", viewedAt: "10 days ago", viewCount: 1, expiresIn: null, followUp: "Reactivation needed", discount: null, priority: "low", objections: "Budget timing", aiInsight: "Client engaged with email but didn't return to quote. Personal call recommended." },
  { client: "Peak Performance", service: "Coaching Program (6mo)", amount: 18000, status: "draft", sentAt: null, viewedAt: null, viewCount: 0, expiresIn: null, followUp: "Awaiting review", discount: null, priority: "high", objections: null, aiInsight: "High-value opportunity. Include testimonial from similar coaching client." },
  { client: "Harmony Health", service: "Content Marketing Package", amount: 3200, status: "viewed", sentAt: "3 days ago", viewedAt: "2 days ago", viewCount: 5, expiresIn: "11 days", followUp: "Day 3 reminder (today)", discount: null, priority: "medium", objections: "Wants to see more examples", aiInsight: "5 views in 2 days = very interested but hesitant. Call may close this." },
  { client: "Urban Eats Co.", service: "Social Media Management", amount: 2400, status: "sent", sentAt: "4 hrs ago", viewedAt: null, viewCount: 0, expiresIn: "14 days", followUp: "Reminder at day 3", discount: "10%", priority: "medium", objections: null, aiInsight: "Discount applied per manager approval. Track if discount drives faster conversion." },
];

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-blue-500/10 text-blue-400",
  viewed: "bg-amber-500/10 text-amber-400",
  accepted: "bg-emerald-500/10 text-emerald-400",
  expired: "bg-red-500/10 text-red-400",
};

const upsellSuggestions = [
  { client: "Apex Coaching Co.", suggestion: "Add Monthly Analytics Report (+$800/mo)", confidence: 78, reason: "They asked about reporting in discovery call", impact: "$9,600/yr" },
  { client: "Studio Bloom", suggestion: "Bundle Social Media Management (+$1,200/mo)", confidence: 65, reason: "Competitor analysis shows content gap", impact: "$14,400/yr" },
  { client: "Harmony Health", suggestion: "Add Email Newsletter Setup (+$500 one-time)", confidence: 82, reason: "They mentioned email list growth in intake form", impact: "$500" },
  { client: "Urban Eats Co.", suggestion: "Photography Package (+$600/mo)", confidence: 71, reason: "Food businesses see 3x engagement with pro photos", impact: "$7,200/yr" },
];

const pricingInsights = [
  { insight: "Your average quote value ($7,143) is 12% below market for your service category", type: "pricing", action: "Review pricing strategy" },
  { insight: "Quotes with case studies have 45% higher acceptance rate than those without", type: "content", action: "Add case studies" },
  { insight: "Quotes viewed 3+ times without response have 80% close rate with a personal call", type: "behavior", action: "Generate call list" },
  { insight: "5% discount converts 2.3x better than 10% — minimize margin erosion", type: "discounting", action: "Update discount rules" },
];

export default function QuoteStudio() {
  const [tab, setTab] = useState("pipeline");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
      <DemoModeBadge />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><FileText className="h-6 w-6 text-blue-400" />Quote Studio</h1>
          <p className="text-muted-foreground">Generate, send, track, and automate proposals with AI-powered pricing, upsell suggestions, and follow-up</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium">Import Template</button>
          <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2"><Plus className="h-4 w-4" />New Quote</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {quoteStats.map((s) => (
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
          <TabsTrigger value="pipeline">Pipeline ({quotes.length})</TabsTrigger>
          <TabsTrigger value="upsells">Upsell Suggestions ({upsellSuggestions.length})</TabsTrigger>
          <TabsTrigger value="insights">Pricing Insights ({pricingInsights.length})</TabsTrigger>
          <TabsTrigger value="features">Capabilities</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-3">
          {quotes.map((q) => (
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
                <div className="p-2 rounded bg-primary/5 border border-primary/10">
                  <p className="text-[10px] text-foreground flex items-start gap-1"><Brain className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />{q.aiInsight}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="upsells" className="space-y-3">
          {upsellSuggestions.map((u, i) => (
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
          {pricingInsights.map((p, i) => (
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
