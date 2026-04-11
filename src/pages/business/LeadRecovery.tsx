import { AppWelcomeHeader } from "@/components/sita/AppWelcomeHeader";
import { InAppAdvisorStrip } from "@/components/sita/InAppAdvisorStrip";
import { motion } from "framer-motion";
import { RotateCcw, Mail, Clock, TrendingUp, Play, Pause, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const campaigns = [
  { id: 1, name: "Cold Lead Winback", status: "active", leads: 23, recovered: 4, revenue: "$18,400", sequence: "5 emails over 14 days" },
  { id: 2, name: "Proposal Follow-up", status: "active", leads: 8, recovered: 2, revenue: "$9,200", sequence: "3 emails + call reminder" },
  { id: 3, name: "Past Client Re-engagement", status: "paused", leads: 45, recovered: 7, revenue: "$31,500", sequence: "Quarterly check-in" },
  { id: 4, name: "Free Consultation Offer", status: "draft", leads: 0, recovered: 0, revenue: "$0", sequence: "Lead magnet + 4 nurture emails" },
];

const coldLeads = [
  { name: "James Morton", company: "Morton Labs", lastTouch: "45 days ago", value: "$6,000", reason: "No response after proposal" },
  { name: "Taylor Kim", company: "Kim & Partners", lastTouch: "30 days ago", value: "$4,500", reason: "Went silent after demo" },
  { name: "Rachel Adams", company: "Adams Digital", lastTouch: "60 days ago", value: "$11,000", reason: "Budget concerns" },
];

const LeadRecovery = () => (
  <div className="mx-auto max-w-5xl space-y-6">
    <AppWelcomeHeader domain="business" />
    <InAppAdvisorStrip domain="business" />

    <div>
      <h1 className="text-xl font-bold">Lead Recovery</h1>
      <p className="text-sm text-muted-foreground">Automated winback sequences, cold lead re-engagement, drip campaigns</p>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[
        { icon: RotateCcw, label: "Leads Recovered", value: "13", color: "text-emerald-500" },
        { icon: TrendingUp, label: "Revenue Recovered", value: "$59.1K", color: "text-primary" },
        { icon: Mail, label: "Active Sequences", value: "2", color: "text-blue-500" },
        { icon: Clock, label: "Avg Recovery Time", value: "8 days", color: "text-amber-500" },
      ].map(s => (
        <div key={s.label} className="rounded-xl border border-border/40 bg-card/50 p-4">
          <s.icon className={cn("h-4 w-4 mb-2", s.color)} />
          <p className="text-lg font-bold">{s.value}</p>
          <p className="text-[11px] text-muted-foreground">{s.label}</p>
        </div>
      ))}
    </div>

    {/* Campaigns */}
    <div className="space-y-2">
      <h2 className="text-sm font-semibold">Recovery Campaigns</h2>
      {campaigns.map((c, i) => (
        <motion.div
          key={c.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center gap-4 rounded-xl border border-border/40 bg-card/50 p-4 hover:border-primary/30 transition-colors"
        >
          <Zap className="h-5 w-5 text-primary/60 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{c.name}</p>
            <p className="text-[11px] text-muted-foreground">{c.sequence}</p>
          </div>
          <span className={cn(
            "text-[10px] font-medium px-2 py-0.5 rounded-full capitalize shrink-0",
            c.status === "active" ? "bg-emerald-500/15 text-emerald-500" : c.status === "paused" ? "bg-amber-500/15 text-amber-500" : "bg-muted text-muted-foreground"
          )}>
            {c.status}
          </span>
          <div className="text-right shrink-0">
            <p className="text-xs font-medium">{c.recovered}/{c.leads} recovered</p>
            <p className="text-[10px] text-emerald-500">{c.revenue}</p>
          </div>
          <button className="p-1.5 rounded-lg hover:bg-muted">
            {c.status === "active" ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </button>
        </motion.div>
      ))}
    </div>

    {/* Cold leads */}
    <div className="space-y-2">
      <h2 className="text-sm font-semibold">Cold Leads Needing Attention</h2>
      {coldLeads.map((l, i) => (
        <div key={l.name} className="flex items-center gap-4 rounded-xl border border-border/40 bg-card/50 p-4">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
            {l.name.split(" ").map(w => w[0]).join("")}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{l.name}</p>
            <p className="text-[11px] text-muted-foreground">{l.company} · Last contact: {l.lastTouch}</p>
            <p className="text-[10px] text-amber-500">{l.reason}</p>
          </div>
          <span className="text-xs font-medium">{l.value}</span>
          <button className="text-[10px] bg-primary/10 text-primary px-2.5 py-1 rounded-lg hover:bg-primary/20 transition-colors font-medium">
            Re-engage
          </button>
        </div>
      ))}
    </div>
  </div>
);

export default LeadRecovery;
