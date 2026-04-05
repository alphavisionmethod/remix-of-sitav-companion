import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileText, DollarSign, Send, Clock, Eye, CheckCircle, AlertTriangle, TrendingUp, Package, Plus, ArrowRight } from "lucide-react";

const quoteStats = [
  { label: "Active Quotes", value: "18", icon: FileText, color: "text-blue-400" },
  { label: "Pending Value", value: "$124,800", icon: DollarSign, color: "text-emerald-400" },
  { label: "Acceptance Rate", value: "68%", icon: CheckCircle, color: "text-emerald-400" },
  { label: "Avg Time to Accept", value: "4.2 days", icon: Clock, color: "text-amber-400" },
];

const quotes = [
  { client: "Apex Coaching Co.", service: "Growth Strategy Package", amount: 12500, status: "viewed", sentAt: "2 days ago", viewedAt: "1 day ago", expiresIn: "5 days", followUp: "Auto reminder at day 5" },
  { client: "Studio Bloom", service: "Marketing Retainer", amount: 4800, status: "sent", sentAt: "1 day ago", viewedAt: null, expiresIn: "13 days", followUp: "Reminder at day 3" },
  { client: "NextLevel Fitness", service: "Website + Funnel Bundle", amount: 8900, status: "accepted", sentAt: "5 days ago", viewedAt: "4 days ago", expiresIn: null, followUp: "Invoice generated" },
  { client: "Zenith Consulting", service: "Advisory Retainer + SEO", amount: 6200, status: "expired", sentAt: "16 days ago", viewedAt: "10 days ago", expiresIn: null, followUp: "Reactivation needed" },
  { client: "Peak Performance", service: "Coaching Program (6mo)", amount: 18000, status: "draft", sentAt: null, viewedAt: null, expiresIn: null, followUp: "Awaiting review" },
];

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-blue-500/10 text-blue-400",
  viewed: "bg-amber-500/10 text-amber-400",
  accepted: "bg-emerald-500/10 text-emerald-400",
  expired: "bg-red-500/10 text-red-400",
};

const upsellSuggestions = [
  { client: "Apex Coaching Co.", suggestion: "Add Monthly Analytics Report (+$800/mo)", confidence: 78, reason: "They asked about reporting in discovery call" },
  { client: "Studio Bloom", suggestion: "Bundle Social Media Management (+$1,200/mo)", confidence: 65, reason: "Competitor analysis shows gap" },
];

export default function QuoteStudio() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quote Studio</h1>
          <p className="text-muted-foreground">Generate, send, track, and automate proposals and quotes</p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2"><Plus className="h-4 w-4" />New Quote</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quoteStats.map((s) => (
          <Card key={s.label} className="bg-card/50 border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`h-5 w-5 ${s.color}`} />
              <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-lg font-bold text-foreground">{s.value}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quote Pipeline */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><FileText className="h-5 w-5 text-blue-400" />Quote Pipeline</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {quotes.map((q) => (
            <div key={q.client} className="p-4 rounded-lg bg-background/50 border border-border/30 hover:border-primary/30 transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-foreground">{q.client}</p>
                  <p className="text-xs text-muted-foreground">{q.service}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-foreground">${q.amount.toLocaleString()}</span>
                  <Badge className={`${statusColors[q.status]} text-[10px]`}>{q.status}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {q.sentAt && <span>Sent: {q.sentAt}</span>}
                {q.viewedAt && <span className="flex items-center gap-1"><Eye className="h-3 w-3" />Viewed: {q.viewedAt}</span>}
                {q.expiresIn && <span>Expires in: {q.expiresIn}</span>}
                <span className="text-foreground">{q.followUp}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Upsell Suggestions */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="h-5 w-5 text-purple-400" />Advisor Upsell Suggestions</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {upsellSuggestions.map((u, i) => (
            <div key={i} className="p-3 rounded-lg bg-background/50 border border-border/30 flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground"><span className="font-medium">{u.client}:</span> {u.suggestion}</p>
                <p className="text-xs text-muted-foreground">{u.reason}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px]">{u.confidence}% fit</Badge>
                <button className="px-3 py-1.5 rounded-md bg-primary/10 text-primary text-xs font-medium">Add to Quote</button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quote Features */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { title: "Auto-Generation", desc: "Create quotes from CRM notes, call transcripts, or intake forms", icon: FileText },
          { title: "PDF & Send", desc: "Professional PDF generation with one-click send and tracking", icon: Send },
          { title: "Follow-up Automation", desc: "Auto-reminders, expiry alerts, and viewed-but-no-response recovery", icon: Clock },
        ].map((f) => (
          <Card key={f.title} className="bg-card/50 border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <f.icon className="h-5 w-5 text-primary" />
              <div><p className="text-sm font-medium text-foreground">{f.title}</p><p className="text-xs text-muted-foreground">{f.desc}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}
