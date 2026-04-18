import { DomainAdvisorCard } from "@/components/advisors/DomainAdvisorCard";
import { motion } from "framer-motion";
import { FileSignature, Clock, CheckCircle, AlertCircle, Plus, Eye, Send, DollarSign, TrendingUp, Zap, Users, BarChart3, FileText, PenTool, BookOpen, ChevronRight, Timer, MousePointer } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { ModuleAdvisorInsight } from "@/components/sita/domain-shared/ModuleAdvisorInsight";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { getIdentityLayer } from "@/domains/engines/business-identity-layers";

const proposals = [
  {
    id: "P-001", title: "Website Redesign — Bloom Studio", client: "Sarah Chen", amount: "$12,000", status: "sent", sentDate: "Mar 28", expiresIn: "3 days", views: 5,
    engagement: { opened: "Mar 29, 2:15 PM", timeSpent: "8 min", sectionsRead: ["Scope", "Timeline", "Pricing"], pricingViews: 3, lastViewed: "2h ago" },
    revenue: "$12,000"
  },
  {
    id: "P-002", title: "SEO Audit — RiverTech", client: "Marcus Rivera", amount: "$3,500", status: "draft", sentDate: "—", expiresIn: "—", views: 0,
    engagement: null,
    revenue: "$3,500"
  },
  {
    id: "P-003", title: "Brand Package — Park & Associates", client: "Emily Park", amount: "$24,000", status: "signed", sentDate: "Mar 15", expiresIn: "—", views: 12,
    engagement: { opened: "Mar 15, 10:00 AM", timeSpent: "22 min", sectionsRead: ["All Sections"], pricingViews: 5, lastViewed: "Mar 16" },
    revenue: "$24,000"
  },
  {
    id: "P-004", title: "Monthly Retainer — Morton Labs", client: "James Morton", amount: "$6,000/mo", status: "expired", sentDate: "Feb 20", expiresIn: "Expired", views: 2,
    engagement: { opened: "Feb 21, 9:30 AM", timeSpent: "2 min", sectionsRead: ["Scope"], pricingViews: 0, lastViewed: "Feb 21" },
    revenue: "$72,000/yr"
  },
  {
    id: "P-005", title: "App Development — TechForge", client: "Alex Kim", amount: "$48,000", status: "sent", sentDate: "Apr 2", expiresIn: "5 days", views: 8,
    engagement: { opened: "Apr 2, 4:00 PM", timeSpent: "15 min", sectionsRead: ["Scope", "Timeline", "Team", "Pricing"], pricingViews: 6, lastViewed: "1h ago" },
    revenue: "$48,000"
  },
];

const statusConfig: Record<string, { icon: typeof CheckCircle; color: string; bg: string }> = {
  draft: { icon: Clock, color: "text-muted-foreground", bg: "bg-muted" },
  sent: { icon: Send, color: "text-blue-500", bg: "bg-blue-500/15" },
  signed: { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/15" },
  expired: { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/15" },
};

const templateLibrary = [
  { icon: "💼", name: "Consulting Engagement", industry: "Consulting", winRate: "72%", avgDeal: "$15K" },
  { icon: "🎨", name: "Creative Agency", industry: "Agency", winRate: "68%", avgDeal: "$22K" },
  { icon: "💻", name: "SaaS Implementation", industry: "SaaS", winRate: "61%", avgDeal: "$35K" },
  { icon: "📝", name: "Freelance Services", industry: "Freelance", winRate: "78%", avgDeal: "$5K" },
  { icon: "🏗️", name: "Project-Based", industry: "General", winRate: "65%", avgDeal: "$18K" },
  { icon: "🔄", name: "Monthly Retainer", industry: "Recurring", winRate: "82%", avgDeal: "$8K/mo" },
];

const clauseLibrary = [
  { name: "Net-30 Payment Terms", category: "Payment", usage: 89 },
  { name: "Scope Change Process", category: "Scope", usage: 76 },
  { name: "SLA — 99.9% Uptime", category: "SLA", usage: 45 },
  { name: "IP Assignment", category: "IP", usage: 67 },
  { name: "Termination — 30 Days", category: "Termination", usage: 54 },
  { name: "Confidentiality (Mutual)", category: "NDA", usage: 92 },
];

const winLossData = [
  { reason: "Competitive pricing", count: 12, type: "win" },
  { reason: "Strong case studies", count: 9, type: "win" },
  { reason: "Fast turnaround", count: 7, type: "win" },
  { reason: "Price too high", count: 5, type: "loss" },
  { reason: "Went with competitor", count: 3, type: "loss" },
  { reason: "Budget frozen", count: 4, type: "loss" },
];

type Tab = "proposals" | "templates" | "clauses" | "analytics";

const ProposalsContracts = () => {
  const { primaryMode } = useBusinessProfile();
  const identity = getIdentityLayer(primaryMode);
  const pageLabel = primaryMode === "agency" ? "Pitches & Contracts" : primaryMode === "service" ? "Proposals & Agreements" : primaryMode === "professional-practice" ? "Service Agreements" : "Proposals & Contracts";
  const [activeTab, setActiveTab] = useState<Tab>("proposals");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const tabs: { key: Tab; label: string; icon: typeof FileSignature }[] = [
    { key: "proposals", label: "Proposals", icon: FileSignature },
    { key: "templates", label: "Templates", icon: BookOpen },
    { key: "clauses", label: "Clause Library", icon: FileText },
    { key: "analytics", label: "Win/Loss Analysis", icon: BarChart3 },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageTruthBanner />
      <DomainAdvisorCard domain="business" insights={[
        { id: "prop-1", text: "Alex Kim viewed pricing 6 times — high intent signal. Consider offering 5% early-bird discount", confidence: 88, action: "Offer Discount" },
        { id: "prop-2", text: "Proposals with case studies have 23% higher win rate", confidence: 82 },
      ]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Proposals & Contracts</h1>
          <p className="text-sm text-muted-foreground">Close deals faster with engagement tracking, e-signatures, and AI follow-ups</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> New Proposal
        </button>
      </div>

      {/* ── Revenue Pipeline KPIs ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { icon: FileSignature, label: "Active Proposals", value: "5", sub: "3 awaiting signature", color: "text-primary" },
          { icon: TrendingUp, label: "Win Rate", value: "68%", sub: "↑ 5% this quarter", color: "text-emerald-500" },
          { icon: Timer, label: "Avg Time to Sign", value: "3.2 days", sub: "Improving steadily", color: "text-blue-500" },
          { icon: DollarSign, label: "Pipeline Value", value: "$87.5K", sub: "5 active proposals", color: "text-amber-500" },
          { icon: BarChart3, label: "Revenue Signed (QTD)", value: "$24K", sub: "1 signed this quarter", color: "text-purple-500" },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-border/40 bg-card/50 p-4">
            <s.icon className={cn("h-4 w-4 mb-2", s.color)} />
            <p className="text-lg font-bold">{s.value}</p>
            <p className="text-[11px] text-muted-foreground">{s.label}</p>
            <p className="text-[10px] text-primary/60 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Smart Follow-Up Advisor ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Smart Follow-Up Advisor</p>
            <p className="text-xs text-muted-foreground mt-1">
              <strong>Alex Kim</strong> viewed the pricing section <strong>6 times</strong> in the last hour but hasn't signed. Historically, offering a 5% early-bird discount at this stage converts 73% of similar leads.
            </p>
            <div className="flex gap-2 mt-3">
              <button className="text-[10px] bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-medium hover:bg-primary/90 transition-colors">Offer 5% Discount ($45,600)</button>
              <button className="text-[10px] bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-medium hover:bg-primary/20 transition-colors">Send Reminder</button>
              <button className="text-[10px] bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-medium hover:bg-primary/20 transition-colors">Schedule Call</button>
              <button className="text-[10px] text-muted-foreground px-3 py-1.5 rounded-lg hover:bg-muted transition-colors">Dismiss</button>
            </div>
          </div>
          <span className="text-[10px] bg-amber-500/15 text-amber-500 px-2 py-0.5 rounded-full font-medium shrink-0">High Intent</span>
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

      {/* ── Proposals Tab ── */}
      {activeTab === "proposals" && (
        <div className="space-y-2">
          {proposals.map((p, i) => {
            const sc = statusConfig[p.status];
            const Icon = sc.icon;
            const isExpanded = expandedId === p.id;
            return (
              <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-xl border border-border/40 bg-card/50 hover:border-primary/30 transition-colors cursor-pointer overflow-hidden">
                <div className="flex items-center gap-4 p-4" onClick={() => setExpandedId(isExpanded ? null : p.id)}>
                  <FileSignature className="h-5 w-5 text-primary/60 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{p.title}</p>
                    <p className="text-[11px] text-muted-foreground">{p.client} · {p.amount}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={cn("inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full capitalize", sc.bg, sc.color)}>
                      <Icon className="h-3 w-3" /> {p.status}
                    </span>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{p.views} views</p>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-500 shrink-0">{p.revenue}</span>
                  <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform shrink-0", isExpanded && "rotate-90")} />
                </div>
                {/* ── Engagement Timeline (expanded) ── */}
                {isExpanded && p.engagement && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="border-t border-border/20 p-4 bg-muted/20">
                    <p className="text-[11px] font-semibold mb-2 flex items-center gap-1.5"><MousePointer className="h-3 w-3" /> Engagement Timeline</p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <div><p className="text-xs font-semibold">{p.engagement.opened}</p><p className="text-[10px] text-muted-foreground">First Opened</p></div>
                      <div><p className="text-xs font-semibold">{p.engagement.timeSpent}</p><p className="text-[10px] text-muted-foreground">Time Spent</p></div>
                      <div><p className="text-xs font-semibold">{p.engagement.sectionsRead.join(", ")}</p><p className="text-[10px] text-muted-foreground">Sections Read</p></div>
                      <div><p className="text-xs font-semibold text-amber-500">{p.engagement.pricingViews}×</p><p className="text-[10px] text-muted-foreground">Pricing Views</p></div>
                      <div><p className="text-xs font-semibold">{p.engagement.lastViewed}</p><p className="text-[10px] text-muted-foreground">Last Viewed</p></div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      {p.status === "sent" && <button className="text-[10px] bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-medium">Send Follow-Up</button>}
                      {p.status === "expired" && <button className="text-[10px] bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-medium">Re-send Proposal</button>}
                      <button className="text-[10px] bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-medium">View Full Analytics</button>
                      {p.status !== "signed" && <button className="text-[10px] bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-medium flex items-center gap-1"><PenTool className="h-3 w-3" /> Request E-Sign</button>}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Templates Tab ── */}
      {activeTab === "templates" && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {templateLibrary.map(t => (
            <button key={t.name} className="rounded-xl border border-border/40 bg-card/50 p-4 text-left hover:border-primary/30 transition-colors group">
              <span className="text-2xl">{t.icon}</span>
              <p className="text-sm font-medium mt-2">{t.name}</p>
              <p className="text-[11px] text-muted-foreground">{t.industry}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-emerald-500 font-medium">{t.winRate} win rate</span>
                <span className="text-[10px] text-muted-foreground">Avg {t.avgDeal}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ── Clause Library Tab ── */}
      {activeTab === "clauses" && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground mb-2">Drag clauses into any proposal. Most-used clauses appear first.</p>
          {clauseLibrary.map(c => (
            <div key={c.name} className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/50 p-3 hover:border-primary/30 transition-colors cursor-grab">
              <FileText className="h-4 w-4 text-primary/60 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">{c.name}</p>
                <p className="text-[10px] text-muted-foreground">{c.category}</p>
              </div>
              <span className="text-[10px] text-muted-foreground">Used {c.usage}×</span>
              <button className="text-[10px] bg-primary/10 text-primary px-2.5 py-1 rounded-lg font-medium">+ Add</button>
            </div>
          ))}
        </div>
      )}

      {/* ── Win/Loss Analytics Tab ── */}
      {activeTab === "analytics" && (
        <div className="space-y-3">
          <p className="text-sm font-semibold">Why You Win & Lose Deals</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <p className="text-xs font-semibold text-emerald-500 mb-3">Top Win Reasons</p>
              {winLossData.filter(w => w.type === "win").map(w => (
                <div key={w.reason} className="flex items-center justify-between py-1.5">
                  <span className="text-xs">{w.reason}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-emerald-500/20"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${(w.count / 12) * 100}%` }} /></div>
                    <span className="text-[10px] text-muted-foreground w-4">{w.count}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
              <p className="text-xs font-semibold text-destructive mb-3">Top Loss Reasons</p>
              {winLossData.filter(w => w.type === "loss").map(w => (
                <div key={w.reason} className="flex items-center justify-between py-1.5">
                  <span className="text-xs">{w.reason}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-destructive/20"><div className="h-full rounded-full bg-destructive" style={{ width: `${(w.count / 5) * 100}%` }} /></div>
                    <span className="text-[10px] text-muted-foreground w-4">{w.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-start gap-3">
              <Zap className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium">AI Insight</p>
                <p className="text-[11px] text-muted-foreground mt-1">Proposals with case studies attached have a <strong>23% higher win rate</strong>. Your "Brand Package" template wins 82% of the time vs 61% for "SaaS Implementation" — consider restructuring SaaS proposals to match the Brand Package format.</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      <ModuleAdvisorInsight
        advisorName="Proposal Advisor"
        domain="business"
        insight="Alex Kim viewed pricing 6 times — high intent signal. Proposals with case studies have 23% higher win rate."
        confidence={88}
      />
    </div>
  );
};

export default ProposalsContracts;
