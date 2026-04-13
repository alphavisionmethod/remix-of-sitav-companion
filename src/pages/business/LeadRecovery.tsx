import { motion } from "framer-motion";
import { RotateCcw, Mail, Clock, TrendingUp, Play, Pause, Zap, DollarSign, Phone, MessageSquare, Linkedin, Target, BarChart3, ChevronRight, Bot, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ModuleWorkspace } from "@/components/sita/domain-shared/ModuleWorkspace";
import { DomainAdvisorCard } from "@/components/advisors/DomainAdvisorCard";
import { LeadRecoveryPane } from "@/components/business/LeadRecoveryPane";
import { KPITile } from "@/components/sita/SitaComponents";

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

const channelIcon: Record<string, typeof Mail> = { email: Mail, sms: MessageSquare, phone: Phone, linkedin: Linkedin };

const LeadRecovery = () => {
  const [activeTab, setActiveTab] = useState<"campaigns" | "cold-leads" | "roi">("cold-leads");
  const [selectedLead, setSelectedLead] = useState<string | null>(null);

  const totalRecovered = campaigns.reduce((s, c) => s + c.recovered, 0);
  const selected = coldLeads.find(l => l.name === selectedLead) || null;

  const listContent = (
    <div className="space-y-2">
      {/* Tab Switcher */}
      <div className="flex gap-1 border-b border-border/40 overflow-x-auto mb-2">
        {([
          { key: "cold-leads", label: "Cold Leads", icon: Target },
          { key: "campaigns", label: "Campaigns", icon: RotateCcw },
          { key: "roi", label: "ROI", icon: BarChart3 },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} className={cn("flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap", activeTab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
            <t.icon className="h-3.5 w-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {activeTab === "cold-leads" && (
        <>
          <p className="text-xs text-muted-foreground mb-1">Ranked by AI recovery probability</p>
          {coldLeads.map((l, i) => (
            <motion.div key={l.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedLead(l.name)}
              className={cn("rounded-xl border bg-card/50 p-4 hover:border-primary/30 transition-colors cursor-pointer",
                selectedLead === l.name ? "border-primary/40 bg-primary/5" : "border-border/40"
              )}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0">{l.name.split(" ").map(w => w[0]).join("")}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{l.name}</p>
                  <p className="text-[11px] text-muted-foreground">{l.company} · {l.lastTouch}</p>
                  <p className="text-[10px] text-amber-500">{l.reason}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center" style={{ borderColor: l.recoveryScore >= 80 ? "hsl(var(--chart-2))" : l.recoveryScore >= 60 ? "hsl(45 85% 55%)" : "hsl(var(--destructive))" }}>
                    <span className="text-[10px] font-bold">{l.recoveryScore}%</span>
                  </div>
                </div>
                <span className="text-xs font-semibold shrink-0">{l.value}</span>
              </div>
            </motion.div>
          ))}
        </>
      )}

      {activeTab === "campaigns" && (
        <div className="space-y-2">
          {campaigns.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-xl border border-border/40 bg-card/50 p-4">
              <div className="flex items-center gap-4">
                <Zap className="h-5 w-5 text-primary/60 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-[11px] text-muted-foreground">{c.sequence}</p>
                </div>
                <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", c.status === "active" ? "bg-chart-2/15 text-chart-2" : c.status === "paused" ? "bg-amber-500/15 text-amber-500" : "bg-muted text-muted-foreground")}>{c.status}</span>
                <div className="text-right shrink-0">
                  <p className="text-xs font-medium">{c.recovered}/{c.leads}</p>
                  <p className="text-[10px] text-chart-2 font-semibold">{c.revenue}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === "roi" && (
        <div className="space-y-2">
          {campaigns.filter(c => c.status !== "draft").map(c => (
            <div key={c.id} className="rounded-xl border border-border/40 bg-card/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">{c.name}</p>
                <span className="text-xs font-bold text-chart-2">{c.roi} ROI</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><p className="text-xs font-semibold">{c.revenue}</p><p className="text-[10px] text-muted-foreground">Revenue</p></div>
                <div><p className="text-xs font-semibold">{c.costPerRecovery}</p><p className="text-[10px] text-muted-foreground">Cost/Recovery</p></div>
                <div><p className="text-xs font-semibold">{c.recovered}/{c.leads}</p><p className="text-[10px] text-muted-foreground">Rate</p></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <ModuleWorkspace
      domain="business"
      title="Lead Recovery"
      icon={RotateCcw}
      kpiStrip={
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KPITile icon={RotateCcw} label="Leads Recovered" value={String(totalRecovered)} sub="From 76 cold leads" />
          <KPITile icon={DollarSign} label="Revenue Recovered" value="$59.1K" sub="Avg $4.5K per lead" />
          <KPITile icon={Clock} label="Avg Recovery Time" value="8 days" sub="↓ 2 days vs last month" />
          <KPITile icon={TrendingUp} label="Campaign ROI" value="27x" sub="Cost: $585 total" />
        </div>
      }
      list={listContent}
      detail={<LeadRecoveryPane lead={selected} />}
      detailActive={!!selected}
      onCloseDetail={() => setSelectedLead(null)}
      advisor={
        <DomainAdvisorCard
          domain="business"
          insights={[
            { id: "lr-1", text: "David Chen (score: 89%) is actively comparing competitors — call within 24h for 81% conversion rate", confidence: 89, action: "Call Now", onAction: () => {} },
            { id: "lr-2", text: "Expanding Cold Lead Winback to 5 high-score leads could recover ~$33K", confidence: 75, action: "Expand", onAction: () => {} },
          ]}
        />
      }
    />
  );
};

export default LeadRecovery;
