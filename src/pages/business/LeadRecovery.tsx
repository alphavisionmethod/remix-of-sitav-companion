import { AppWelcomeHeader } from "@/components/sita/AppWelcomeHeader";
import { InAppAdvisorStrip } from "@/components/sita/InAppAdvisorStrip";
import { motion } from "framer-motion";
import { RotateCcw, Mail, Clock, TrendingUp, Play, Pause, Zap, DollarSign, Phone, MessageSquare, Linkedin, Target, BarChart3, ChevronRight, Eye, Gauge, Bot, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const campaigns = [
  { id: 1, name: "Cold Lead Winback", status: "active", leads: 23, recovered: 4, revenue: "$18,400", costPerRecovery: "$12.50", roi: "32x", sequence: "5 emails over 14 days", channels: ["email", "sms"], automationMode: "auto-pilot" },
  { id: 2, name: "Proposal Follow-up", status: "active", leads: 8, recovered: 2, revenue: "$9,200", costPerRecovery: "$8.00", roi: "28x", sequence: "3 emails + call reminder", channels: ["email", "phone"], automationMode: "suggest" },
  { id: 3, name: "Past Client Re-engagement", status: "paused", leads: 45, recovered: 7, revenue: "$31,500", costPerRecovery: "$15.00", roi: "20x", sequence: "Quarterly check-in", channels: ["email", "linkedin"], automationMode: "watch" },
  { id: 4, name: "Free Consultation Offer", status: "draft", leads: 0, recovered: 0, revenue: "$0", costPerRecovery: "—", roi: "—", sequence: "Lead magnet + 4 nurture emails", channels: ["email"], automationMode: "suggest" },
];

const coldLeads = [
  { name: "James Morton", company: "Morton Labs", lastTouch: "45 days ago", value: "$6,000", reason: "No response after proposal", recoveryScore: 82, suggestedChannel: "Phone call", aiMessage: "Hi James, I noticed the proposal I sent has been on hold. I'd love to address any concerns — would a 15-min call this week work?" },
  { name: "Taylor Kim", company: "Kim & Partners", lastTouch: "30 days ago", value: "$4,500", reason: "Went silent after demo", recoveryScore: 71, suggestedChannel: "Email", aiMessage: "Hey Taylor, following up on our demo last month. I put together a case study from a similar firm that saw 3x ROI — thought you'd find it relevant." },
  { name: "Rachel Adams", company: "Adams Digital", lastTouch: "60 days ago", value: "$11,000", reason: "Budget concerns", recoveryScore: 58, suggestedChannel: "LinkedIn", aiMessage: "Rachel, we recently introduced a phased payment option that might address the budget timing. Happy to walk through it if helpful." },
  { name: "David Chen", company: "Chen Consulting", lastTouch: "21 days ago", value: "$8,500", reason: "Evaluating competitors", recoveryScore: 89, suggestedChannel: "Phone call", aiMessage: "David, I saw you were comparing options. I'd love to show you how our approach differs — have you seen our latest case study with a similar consultancy?" },
  { name: "Lisa Park", company: "Park Media", lastTouch: "38 days ago", value: "$3,200", reason: "Timing not right", recoveryScore: 64, suggestedChannel: "Email", aiMessage: "Lisa, checking in to see if the timing might work better now. We have availability opening up next month if you'd like to get started." },
];

const triggers = [
  { condition: "Lead opens email but doesn't reply within 48h", action: "Escalate to phone call", status: "active", fires: 12 },
  { condition: "Lead clicks pricing link 2+ times", action: "Send discount offer (5% off)", status: "active", fires: 8 },
  { condition: "Lead visits website after 30+ day silence", action: "Trigger re-engagement sequence", status: "active", fires: 3 },
  { condition: "3 emails with no open", action: "Switch to LinkedIn outreach", status: "draft", fires: 0 },
];

const channelIcon: Record<string, typeof Mail> = { email: Mail, sms: MessageSquare, phone: Phone, linkedin: Linkedin };

type Tab = "campaigns" | "cold-leads" | "triggers" | "roi";

const LeadRecovery = () => {
  const [activeTab, setActiveTab] = useState<Tab>("campaigns");
  const [expandedLead, setExpandedLead] = useState<string | null>(null);

  const tabs: { key: Tab; label: string; icon: typeof RotateCcw }[] = [
    { key: "campaigns", label: "Campaigns", icon: RotateCcw },
    { key: "cold-leads", label: "Cold Leads", icon: Target },
    { key: "triggers", label: "Automations", icon: Zap },
    { key: "roi", label: "ROI Dashboard", icon: BarChart3 },
  ];

  const totalRecovered = campaigns.reduce((s, c) => s + c.recovered, 0);
  const totalRevenue = "$59.1K";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <AppWelcomeHeader domain="business" />
      <InAppAdvisorStrip domain="business" />

      <div>
        <h1 className="text-xl font-bold">Lead Recovery</h1>
        <p className="text-sm text-muted-foreground">AI-powered winback sequences, re-engagement scoring, and revenue rescue</p>
      </div>

      {/* ── Revenue Recovered KPIs ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { icon: RotateCcw, label: "Leads Recovered", value: String(totalRecovered), sub: "From 76 cold leads", color: "text-emerald-500" },
          { icon: DollarSign, label: "Revenue Recovered", value: totalRevenue, sub: "Avg $4.5K per lead", color: "text-primary" },
          { icon: Mail, label: "Active Sequences", value: "2", sub: "31 leads in pipeline", color: "text-blue-500" },
          { icon: Clock, label: "Avg Recovery Time", value: "8 days", sub: "↓ 2 days vs last month", color: "text-amber-500" },
          { icon: TrendingUp, label: "Campaign ROI", value: "27x", sub: "Cost: $585 total", color: "text-purple-500" },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-border/40 bg-card/50 p-4">
            <s.icon className={cn("h-4 w-4 mb-2", s.color)} />
            <p className="text-lg font-bold">{s.value}</p>
            <p className="text-[11px] text-muted-foreground">{s.label}</p>
            <p className="text-[10px] text-emerald-500 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── AI Advisor ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0"><Zap className="h-4 w-4 text-primary" /></div>
          <div className="flex-1">
            <p className="text-sm font-medium">Recovery Advisor</p>
            <p className="text-xs text-muted-foreground mt-1">
              <strong>David Chen</strong> (recovery score: 89%) is actively comparing competitors. A phone call within 24h has an <strong>81% conversion rate</strong> for leads at this stage. His deal is worth <strong>$8,500</strong>.
            </p>
            <div className="flex gap-2 mt-3">
              <button className="text-[10px] bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-medium hover:bg-primary/90 transition-colors">Call David Now</button>
              <button className="text-[10px] bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-medium hover:bg-primary/20 transition-colors">Send AI Email</button>
              <button className="text-[10px] text-muted-foreground px-3 py-1.5 rounded-lg hover:bg-muted transition-colors">Dismiss</button>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-500/15 text-emerald-500 px-2 py-0.5 rounded-full font-medium shrink-0">$8.5K at risk</span>
        </div>
      </motion.div>

      {/* ── Tab Bar ── */}
      <div className="flex gap-1 border-b border-border/40 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} className={cn("flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap", activeTab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
            <t.icon className="h-3.5 w-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {/* ── Campaigns Tab ── */}
      {activeTab === "campaigns" && (
        <div className="space-y-2">
          {campaigns.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-xl border border-border/40 bg-card/50 p-4 hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-4">
                <Zap className="h-5 w-5 text-primary/60 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{c.name}</p>
                    <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full capitalize", c.automationMode === "auto-pilot" ? "bg-emerald-500/15 text-emerald-500" : c.automationMode === "suggest" ? "bg-blue-500/15 text-blue-500" : "bg-muted text-muted-foreground")}>
                      {c.automationMode === "auto-pilot" ? "🤖 Auto-Pilot" : c.automationMode === "suggest" ? "💡 Suggest" : "👁 Watch"}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{c.sequence}</p>
                  <div className="flex gap-1.5 mt-1">
                    {c.channels.map(ch => { const ChIcon = channelIcon[ch] || Mail; return <ChIcon key={ch} className="h-3 w-3 text-muted-foreground" />; })}
                  </div>
                </div>
                <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full capitalize shrink-0", c.status === "active" ? "bg-emerald-500/15 text-emerald-500" : c.status === "paused" ? "bg-amber-500/15 text-amber-500" : "bg-muted text-muted-foreground")}>{c.status}</span>
                <div className="text-right shrink-0">
                  <p className="text-xs font-medium">{c.recovered}/{c.leads} recovered</p>
                  <p className="text-[10px] text-emerald-500 font-semibold">{c.revenue}</p>
                  <p className="text-[10px] text-muted-foreground">ROI: {c.roi}</p>
                </div>
                <button className="p-1.5 rounded-lg hover:bg-muted">{c.status === "active" ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Cold Leads Tab ── */}
      {activeTab === "cold-leads" && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground mb-1">Ranked by AI recovery probability. Click to preview personalized message.</p>
          {coldLeads.map((l, i) => {
            const isExpanded = expandedLead === l.name;
            return (
              <motion.div key={l.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-xl border border-border/40 bg-card/50 overflow-hidden hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-4 p-4 cursor-pointer" onClick={() => setExpandedLead(isExpanded ? null : l.name)}>
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0">{l.name.split(" ").map(w => w[0]).join("")}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{l.name}</p>
                    <p className="text-[11px] text-muted-foreground">{l.company} · Last contact: {l.lastTouch}</p>
                    <p className="text-[10px] text-amber-500">{l.reason}</p>
                  </div>
                  {/* Recovery Score Gauge */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center" style={{ borderColor: l.recoveryScore >= 80 ? "var(--color-emerald-500, #10b981)" : l.recoveryScore >= 60 ? "var(--color-amber-500, #f59e0b)" : "var(--color-red-500, #ef4444)" }}>
                      <span className="text-[10px] font-bold">{l.recoveryScore}%</span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold shrink-0">{l.value}</span>
                  <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform shrink-0", isExpanded && "rotate-90")} />
                </div>
                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="border-t border-border/20 p-4 bg-muted/20">
                    <p className="text-[11px] font-semibold mb-2 flex items-center gap-1.5"><Bot className="h-3 w-3" /> AI-Generated Message ({l.suggestedChannel})</p>
                    <div className="rounded-lg bg-card p-3 border border-border/30 text-xs text-muted-foreground italic">"{l.aiMessage}"</div>
                    <div className="flex gap-2 mt-3">
                      <button className="text-[10px] bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-medium hover:bg-primary/90 transition-colors">Send This Message</button>
                      <button className="text-[10px] bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-medium hover:bg-primary/20 transition-colors">Edit & Send</button>
                      <button className="text-[10px] bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-medium hover:bg-primary/20 transition-colors">Add to Campaign</button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Automations Tab ── */}
      {activeTab === "triggers" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold">Trigger-Based Automations</p>
            <button className="text-[10px] bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-medium hover:bg-primary/20 transition-colors">+ New Trigger</button>
          </div>
          {triggers.map((t, i) => (
            <motion.div key={t.condition} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-xl border border-border/40 bg-card/50 p-4">
              <div className="flex items-start gap-3">
                <Zap className={cn("h-4 w-4 shrink-0 mt-0.5", t.status === "active" ? "text-emerald-500" : "text-muted-foreground")} />
                <div className="flex-1">
                  <p className="text-xs"><strong>IF</strong> {t.condition}</p>
                  <p className="text-xs text-primary mt-0.5"><strong>THEN</strong> {t.action}</p>
                </div>
                <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", t.status === "active" ? "bg-emerald-500/15 text-emerald-500" : "bg-muted text-muted-foreground")}>{t.status}</span>
                <span className="text-[10px] text-muted-foreground shrink-0">{t.fires}× fired</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── ROI Dashboard Tab ── */}
      {activeTab === "roi" && (
        <div className="space-y-3">
          <p className="text-sm font-semibold">Recovery ROI by Campaign</p>
          {campaigns.filter(c => c.status !== "draft").map(c => (
            <div key={c.id} className="rounded-xl border border-border/40 bg-card/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">{c.name}</p>
                <span className="text-xs font-bold text-emerald-500">{c.roi} ROI</span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div><p className="text-xs font-semibold">{c.revenue}</p><p className="text-[10px] text-muted-foreground">Revenue</p></div>
                <div><p className="text-xs font-semibold">{c.costPerRecovery}</p><p className="text-[10px] text-muted-foreground">Cost/Recovery</p></div>
                <div><p className="text-xs font-semibold">{c.recovered}/{c.leads}</p><p className="text-[10px] text-muted-foreground">Recovery Rate</p></div>
                <div>
                  <div className="w-full h-1.5 rounded-full bg-muted mt-1"><div className="h-full rounded-full bg-emerald-500" style={{ width: c.leads > 0 ? `${(c.recovered / c.leads) * 100}%` : "0%" }} /></div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{c.leads > 0 ? `${Math.round((c.recovered / c.leads) * 100)}%` : "—"}</p>
                </div>
              </div>
            </div>
          ))}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-start gap-3">
              <Zap className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium">ROI Insight</p>
                <p className="text-[11px] text-muted-foreground mt-1">Your "Cold Lead Winback" campaign has the highest ROI at 32x. <strong>Expanding it to include the 5 high-score cold leads above could recover an additional $33,200</strong> based on historical conversion rates.</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default LeadRecovery;
