import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Users, Clock, FileText, CheckCircle, AlertTriangle, Calendar, TrendingUp, ArrowRight, MessageSquare } from "lucide-react";

const callStats = [
  { label: "Calls Today", value: "8", icon: Phone, color: "text-blue-400" },
  { label: "Conversion Rate", value: "42%", icon: TrendingUp, color: "text-emerald-400" },
  { label: "Avg Call Duration", value: "18 min", icon: Clock, color: "text-amber-400" },
  { label: "Follow-ups Pending", value: "5", icon: MessageSquare, color: "text-purple-400" },
];

const callQueue = [
  { name: "Sarah Chen", company: "Apex Coaching Co.", priority: "high", reason: "Quote follow-up — viewed 3x, no response", value: "$12,500", lastContact: "5 days ago", prepNotes: "Interested in Growth Strategy Package. Asked about ROI and timeline." },
  { name: "Marcus Johnson", company: "Peak Performance", priority: "high", reason: "Discovery call — booked via funnel", value: "$18,000", lastContact: "New lead", prepNotes: "Coaching program inquiry. 6-month commitment. Budget confirmed." },
  { name: "Emily Rodriguez", company: "Studio Bloom", priority: "medium", reason: "Proposal review — sent marketing retainer", value: "$4,800", lastContact: "3 days ago", prepNotes: "Comparing with competitor. Price-sensitive. Emphasize results." },
  { name: "David Kim", company: "Zenith Consulting", priority: "medium", reason: "Re-engagement — dormant 60 days", value: "$6,200", lastContact: "60 days ago", prepNotes: "Previous client. Advisory retainer expired. Good relationship." },
  { name: "Lisa Wang", company: "NextLevel Fitness", priority: "low", reason: "Check-in — onboarding week 2", value: "$8,900", lastContact: "4 days ago", prepNotes: "Website + funnel project. On track. Ask about add-on services." },
];

const recentCalls = [
  { name: "Tom Harris", outcome: "Qualified — sending proposal", duration: "22 min", time: "2 hrs ago", nextStep: "Generate quote ($7,500)" },
  { name: "Anna Park", outcome: "Booked follow-up for Thursday", duration: "15 min", time: "3 hrs ago", nextStep: "Send case studies" },
  { name: "James Lee", outcome: "Not interested — closed lost", duration: "8 min", time: "Yesterday", nextStep: "Add to reactivation (6 months)" },
];

const priorityColors: Record<string, string> = { high: "bg-red-500/10 text-red-400", medium: "bg-amber-500/10 text-amber-400", low: "bg-blue-500/10 text-blue-400" };

export default function CallDesk() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Call Desk</h1>
        <p className="text-muted-foreground">Prioritized call queue, prep briefs, outcome logging, and auto-generated follow-ups</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {callStats.map((s) => (
          <Card key={s.label} className="bg-card/50 border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`h-5 w-5 ${s.color}`} />
              <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-lg font-bold text-foreground">{s.value}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Call Queue */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Phone className="h-5 w-5 text-blue-400" />Call Queue (Prioritized)</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {callQueue.map((c) => (
            <div key={c.name} className="p-4 rounded-lg bg-background/50 border border-border/30 hover:border-primary/30 transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{c.name[0]}</div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.company}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-foreground">{c.value}</span>
                  <Badge className={`${priorityColors[c.priority]} text-[10px]`}>{c.priority}</Badge>
                </div>
              </div>
              <p className="text-xs text-foreground mb-1">{c.reason}</p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Prep: {c.prepNotes}</p>
                <button className="px-3 py-1.5 rounded-md bg-primary/10 text-primary text-xs font-medium flex items-center gap-1"><Phone className="h-3 w-3" />Call</button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Calls */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><CheckCircle className="h-5 w-5 text-emerald-400" />Recent Calls</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {recentCalls.map((c, i) => (
            <div key={i} className="p-3 rounded-lg bg-background/50 border border-border/30 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.outcome} · {c.duration} · {c.time}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-foreground">Next: {c.nextStep}</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
