import { motion } from "framer-motion";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { getModuleAdaptation } from "@/lib/engines/business-module-adaptations";
import { RotateCcw, Mail, Clock, TrendingUp, Play, Pause, Zap, DollarSign, Phone, MessageSquare, Linkedin, Target, BarChart3, ChevronRight, Bot, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { LeadRecoveryPane } from "@/components/business/LeadRecoveryPane";

// New design system
import { HeroCard, QueueCard, StatusCard, ActionCard, AdvisorCard } from "@/components/sita/cards";
import { UrgencyBadge, FreshnessBadge } from "@/components/sita/badges";
import { SplitWorkspace } from "@/components/sita/surfaces/SplitWorkspace";
import { AppSurface } from "@/components/sita/surfaces/AppSurface";
import { ListReveal, ListRevealItem } from "@/components/sita/motion/AppTransitions";

const campaigns = [
  { id: 1, name: "Cold Lead Winback", status: "active", leads: 23, recovered: 4, revenue: "$18,400", costPerRecovery: "$12.50", roi: "32x", sequence: "5 emails over 14 days", channels: ["email", "sms"], automationMode: "auto-pilot" },
  { id: 2, name: "Proposal Follow-up", status: "active", leads: 8, recovered: 2, revenue: "$9,200", costPerRecovery: "$8.00", roi: "28x", sequence: "3 emails + call reminder", channels: ["email", "phone"], automationMode: "suggest" },
  { id: 3, name: "Past Client Re-engagement", status: "paused", leads: 45, recovered: 7, revenue: "$31,500", costPerRecovery: "$15.00", roi: "20x", sequence: "Quarterly check-in", channels: ["email", "linkedin"], automationMode: "watch" },
  { id: 4, name: "Free Consultation Offer", status: "draft", leads: 0, recovered: 0, revenue: "$0", costPerRecovery: "—", roi: "—", sequence: "Lead magnet + 4 nurture emails", channels: ["email"], automationMode: "suggest" },
];

const coldLeads = [
  { name: "James Morton", company: "Morton Labs", lastTouch: "45 days ago", value: "$6,000", reason: "No response after proposal", recoveryScore: 82, suggestedChannel: "Phone call", aiMessage: "Hi James, I noticed the proposal I sent has been on hold..." },
  { name: "Taylor Kim", company: "Kim & Partners", lastTouch: "30 days ago", value: "$4,500", reason: "Went silent after demo", recoveryScore: 71, suggestedChannel: "Email", aiMessage: "Hey Taylor, following up on our demo last month..." },
  { name: "Rachel Adams", company: "Adams Digital", lastTouch: "60 days ago", value: "$11,000", reason: "Budget concerns", recoveryScore: 58, suggestedChannel: "LinkedIn", aiMessage: "Rachel, we recently introduced a phased payment option..." },
  { name: "David Chen", company: "Chen Consulting", lastTouch: "21 days ago", value: "$8,500", reason: "Evaluating competitors", recoveryScore: 89, suggestedChannel: "Phone call", aiMessage: "David, I saw you were comparing options..." },
  { name: "Lisa Park", company: "Park Media", lastTouch: "38 days ago", value: "$3,200", reason: "Timing not right", recoveryScore: 64, suggestedChannel: "Email", aiMessage: "Lisa, checking in to see if the timing might work better now..." },
];

const LeadRecovery = () => {
  const { primaryMode } = useBusinessProfile();
  const moduleConfig = getModuleAdaptation("lead-recovery", primaryMode);
  const [activeTab, setActiveTab] = useState<"cold-leads" | "campaigns" | "roi">("cold-leads");
  const [selectedLead, setSelectedLead] = useState<string | null>(null);
  const totalRecovered = campaigns.reduce((s, c) => s + c.recovered, 0);
  const selected = coldLeads.find(l => l.name === selectedLead) || null;

  const listPane = (
    <div className="p-3 space-y-3">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-2">
        <StatusCard label="Recovered" status="healthy" lastChecked={`${totalRecovered} leads`} icon={<RotateCcw className="h-4 w-4" />} />
        <StatusCard label="Revenue" status="healthy" lastChecked="$59.1K" icon={<DollarSign className="h-4 w-4" />} />
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 border-b border-[hsl(0_0%_100%/0.06)] overflow-x-auto">
        {([
          { key: "cold-leads" as const, label: "Cold Leads", icon: Target },
          { key: "campaigns" as const, label: "Campaigns", icon: RotateCcw },
          { key: "roi" as const, label: "ROI", icon: BarChart3 },
        ]).map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={cn("flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium border-b-2 transition-colors whitespace-nowrap",
              activeTab === t.key ? "border-[hsl(265_55%_58%)] text-[hsl(265_55%_70%)]" : "border-transparent text-[hsl(0_0%_50%)] hover:text-[hsl(0_0%_70%)]"
            )}>
            <t.icon className="h-3 w-3" /> {t.label}
          </button>
        ))}
      </div>

      {activeTab === "cold-leads" && (
        <ListReveal>
          {coldLeads.map((l) => (
            <ListRevealItem key={l.name}>
              <button
                onClick={() => setSelectedLead(l.name)}
                className={cn(
                  "w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors",
                  selectedLead === l.name
                    ? "bg-[hsl(265_55%_58%/0.12)] border border-[hsl(265_55%_58%/0.25)]"
                    : "bg-[hsl(0_0%_100%/0.03)] border border-transparent hover:bg-[hsl(0_0%_100%/0.06)]"
                )}
              >
                <div className="w-8 h-8 rounded-full bg-[hsl(265_55%_58%/0.15)] flex items-center justify-center text-[10px] font-bold text-[hsl(265_55%_70%)] shrink-0">
                  {l.name.split(" ").map(w => w[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-[hsl(0_0%_85%)]">{l.name}</p>
                  <p className="text-[10px] text-[hsl(0_0%_50%)]">{l.company} · {l.lastTouch}</p>
                  <p className="text-[9px] text-[hsl(38_85%_58%)] mt-0.5">{l.reason}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-9 h-9 rounded-full border-2 flex items-center justify-center"
                    style={{ borderColor: l.recoveryScore >= 80 ? "hsl(152 55% 48%)" : l.recoveryScore >= 60 ? "hsl(38 85% 58%)" : "hsl(0 70% 55%)" }}>
                    <span className="text-[10px] font-bold text-[hsl(0_0%_85%)] tabular-nums">{l.recoveryScore}%</span>
                  </div>
                  <span className="text-[11px] font-semibold text-[hsl(0_0%_85%)] tabular-nums">{l.value}</span>
                </div>
              </button>
            </ListRevealItem>
          ))}
        </ListReveal>
      )}

      {activeTab === "campaigns" && (
        <QueueCard
          title="RECOVERY CAMPAIGNS"
          items={campaigns.map(c => ({
            id: String(c.id),
            label: c.name,
            meta: `${c.recovered}/${c.leads} · ${c.revenue}`,
            urgency: (c.status === "active" ? "normal" : c.status === "paused" ? "low" : "low") as "normal" | "low",
          }))}
          maxVisible={10}
        />
      )}

      {activeTab === "roi" && (
        <div className="space-y-2">
          {campaigns.filter(c => c.status !== "draft").map(c => (
            <AppSurface key={c.id} level={1} className="p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[12px] font-medium text-[hsl(0_0%_85%)]">{c.name}</p>
                <span className="text-[11px] font-bold text-[hsl(152_55%_48%)]">{c.roi} ROI</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div><p className="text-[11px] font-semibold text-[hsl(0_0%_85%)] tabular-nums">{c.revenue}</p><p className="text-[9px] text-[hsl(0_0%_45%)]">Revenue</p></div>
                <div><p className="text-[11px] font-semibold text-[hsl(0_0%_85%)] tabular-nums">{c.costPerRecovery}</p><p className="text-[9px] text-[hsl(0_0%_45%)]">Cost/Recovery</p></div>
                <div><p className="text-[11px] font-semibold text-[hsl(0_0%_85%)] tabular-nums">{c.recovered}/{c.leads}</p><p className="text-[9px] text-[hsl(0_0%_45%)]">Rate</p></div>
              </div>
            </AppSurface>
          ))}
        </div>
      )}

      <AdvisorCard
        advisorName="Recovery Advisor"
        insight="David Chen (score: 89%) is actively comparing competitors — call within 24h for 81% conversion rate."
        confidence={89}
        domain="business"
      />
    </div>
  );

  return (
    <div className="h-[calc(100vh-200px)] -m-4">
      <SplitWorkspace
        list={listPane}
        detail={<LeadRecoveryPane lead={selected} />}
        hasSelection={!!selected}
        defaultSplit={45}
      />
    </div>
  );
};

export default LeadRecovery;
