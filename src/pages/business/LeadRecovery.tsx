// ═══════════════════════════════════════════════════════════════
// Lead Recovery — Premium Revenue Rescue Workspace
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Target, BarChart3, Megaphone, ChevronUp, ChevronDown, Search, ArrowUpDown, DollarSign, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";
import { SplitWorkspace } from "@/components/sita/surfaces/SplitWorkspace";
import { AppSurface } from "@/components/sita/surfaces/AppSurface";
import { QueueCard, StatusCard } from "@/components/sita/cards";
import { LeadRecoveryPane } from "@/components/business/LeadRecoveryPane";
import { RecoveryOverview } from "@/components/business/lead-recovery/RecoveryOverview";
import { RecoveryQueuePanel } from "@/components/business/lead-recovery/RecoveryQueuePanel";
import { RecoveryCard } from "@/components/business/lead-recovery/RecoveryCard";
import { RecoveryHighPressureBanner } from "@/components/business/lead-recovery/RecoveryStates";
import { MOCK_RECOVERY_CANDIDATES, filterByQueue, type RecoveryCandidate } from "@/domains/engines/lead-recovery-engine";
import { useDataMode } from "@/contexts/DataModeContext";

type MainTab = "overview" | "queues" | "campaigns" | "analytics";
type SortMode = "score" | "value" | "urgency" | "recency";

const campaigns = [
  { id: 1, name: "Cold Lead Winback", status: "active", leads: 23, recovered: 4, revenue: "$18,400", costPerRecovery: "$12.50", roi: "32x", sequence: "5 emails over 14 days", channels: ["email", "sms"] },
  { id: 2, name: "Proposal Follow-up", status: "active", leads: 8, recovered: 2, revenue: "$9,200", costPerRecovery: "$8.00", roi: "28x", sequence: "3 emails + call reminder", channels: ["email", "phone"] },
  { id: 3, name: "Past Client Re-engagement", status: "paused", leads: 45, recovered: 7, revenue: "$31,500", costPerRecovery: "$15.00", roi: "20x", sequence: "Quarterly check-in", channels: ["email", "linkedin"] },
  { id: 4, name: "Free Consultation Offer", status: "draft", leads: 0, recovered: 0, revenue: "$0", costPerRecovery: "—", roi: "—", sequence: "Lead magnet + 4 nurture emails", channels: ["email"] },
];

const LeadRecovery = () => {
  const { isDemoMode } = useDataMode();
  const [activeTab, setActiveTab] = useState<MainTab>("queues");
  const [activeQueue, setActiveQueue] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [overviewOpen, setOverviewOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("score");

  const candidates = MOCK_RECOVERY_CANDIDATES;
  const filtered = useMemo(() => {
    let list = filterByQueue(candidates, activeQueue);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q));
    }
    const sorters: Record<SortMode, (a: RecoveryCandidate, b: RecoveryCandidate) => number> = {
      score: (a, b) => b.recoveryScore - a.recoveryScore,
      value: (a, b) => b.valueAtRisk - a.valueAtRisk,
      urgency: (a, b) => {
        const o = { act_today: 0, this_week: 1, flexible: 2 };
        return o[a.urgency] - o[b.urgency];
      },
      recency: (a, b) => a.daysSinceLastAction - b.daysSinceLastAction,
    };
    return [...list].sort(sorters[sortMode]);
  }, [candidates, activeQueue, search, sortMode]);

  const selected = candidates.find(c => c.id === selectedId) || null;
  const actTodayCount = candidates.filter(c => c.urgency === "act_today").length;
  const totalValue = candidates.reduce((s, c) => s + c.valueAtRisk, 0);

  const tabs: { key: MainTab; label: string; icon: typeof Target }[] = [
    { key: "overview", label: "Overview", icon: BarChart3 },
    { key: "queues", label: "Queues", icon: Target },
    { key: "campaigns", label: "Campaigns", icon: Megaphone },
    { key: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  // ── List Pane ──────────────────────────────────────
  const listPane = (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex gap-0.5 border-b border-[hsl(0_0%_100%/0.06)] px-2 shrink-0">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={cn("flex items-center gap-1.5 px-3 py-2.5 text-[11px] font-medium border-b-2 transition-colors",
              activeTab === t.key ? "border-[hsl(265_55%_58%)] text-[hsl(265_55%_70%)]" : "border-transparent text-[hsl(0_0%_45%)] hover:text-[hsl(0_0%_65%)]"
            )}>
            <t.icon className="h-3 w-3" /> {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* ── Overview Tab ── */}
        {activeTab === "overview" && (
          <div className="p-3">
            <RecoveryOverview candidates={candidates} />
          </div>
        )}

        {/* ── Queues Tab ── */}
        {activeTab === "queues" && (
          <div className="flex h-full">
            {/* Queue sidebar */}
            <div className="w-[200px] border-r border-[hsl(0_0%_100%/0.06)] overflow-y-auto shrink-0">
              <RecoveryQueuePanel candidates={candidates} activeQueue={activeQueue} onSelectQueue={setActiveQueue} />
            </div>
            {/* Lead list */}
            <div className="flex-1 flex flex-col">
              {/* High pressure banner */}
              {actTodayCount >= 5 && (
                <div className="p-2">
                  <RecoveryHighPressureBanner count={actTodayCount} value={`$${(totalValue / 1000).toFixed(0)}K`} />
                </div>
              )}
              {/* Search + sort */}
              <div className="flex items-center gap-2 px-3 py-2 border-b border-[hsl(0_0%_100%/0.06)]">
                <div className="flex-1 flex items-center gap-1.5 bg-[hsl(0_0%_100%/0.04)] rounded-lg px-2.5 py-1.5">
                  <Search className="h-3 w-3 text-[hsl(0_0%_40%)]" />
                  <input
                    type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search recovery leads..."
                    className="bg-transparent text-[11px] text-[hsl(0_0%_80%)] placeholder:text-[hsl(0_0%_35%)] outline-none w-full"
                  />
                </div>
                <select
                  value={sortMode}
                  onChange={e => setSortMode(e.target.value as SortMode)}
                  className="bg-[hsl(0_0%_100%/0.04)] text-[10px] text-[hsl(0_0%_60%)] rounded-lg px-2 py-1.5 border border-[hsl(0_0%_100%/0.06)] outline-none"
                >
                  <option value="score">Score</option>
                  <option value="value">Value</option>
                  <option value="urgency">Urgency</option>
                  <option value="recency">Recency</option>
                </select>
              </div>
              {/* Cards */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                <AnimatePresence mode="popLayout">
                  {filtered.map((c, i) => (
                    <RecoveryCard key={c.id} candidate={c} isSelected={selectedId === c.id} onSelect={() => setSelectedId(c.id)} index={i} />
                  ))}
                </AnimatePresence>
                {filtered.length === 0 && (
                  <div className="py-8 text-center">
                    <p className="text-xs text-[hsl(0_0%_40%)]">No recovery candidates in this queue</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Campaigns Tab ── */}
        {activeTab === "campaigns" && (
          <div className="p-3 space-y-2">
            {campaigns.map(c => (
              <AppSurface key={c.id} level={1} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={cn("w-2 h-2 rounded-full", c.status === "active" ? "bg-[hsl(152_55%_48%)]" : c.status === "paused" ? "bg-[hsl(38_85%_58%)]" : "bg-[hsl(0_0%_40%)]")} />
                    <p className="text-[12px] font-semibold text-[hsl(0_0%_85%)]">{c.name}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {c.status === "active" ? <Play className="h-3 w-3 text-[hsl(152_55%_48%)]" /> : c.status === "paused" ? <Pause className="h-3 w-3 text-[hsl(38_85%_58%)]" /> : null}
                    <span className="text-[9px] capitalize text-[hsl(0_0%_50%)]">{c.status}</span>
                  </div>
                </div>
                <p className="text-[10px] text-[hsl(0_0%_45%)] mb-3">{c.sequence}</p>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <p className="text-[13px] font-bold text-[hsl(0_0%_85%)] tabular-nums">{c.leads}</p>
                    <p className="text-[9px] text-[hsl(0_0%_40%)]">Leads</p>
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-[hsl(152_55%_48%)] tabular-nums">{c.recovered}</p>
                    <p className="text-[9px] text-[hsl(0_0%_40%)]">Recovered</p>
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-[hsl(38_85%_58%)] tabular-nums">{c.revenue}</p>
                    <p className="text-[9px] text-[hsl(0_0%_40%)]">Revenue</p>
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-[hsl(265_55%_58%)] tabular-nums">{c.roi}</p>
                    <p className="text-[9px] text-[hsl(0_0%_40%)]">ROI</p>
                  </div>
                </div>
                <div className="flex gap-1 mt-2">
                  {c.channels.map(ch => (
                    <span key={ch} className="text-[8px] px-1.5 py-0.5 rounded bg-[hsl(0_0%_100%/0.06)] text-[hsl(0_0%_50%)] capitalize">{ch}</span>
                  ))}
                </div>
              </AppSurface>
            ))}
          </div>
        )}

        {/* ── Analytics Tab ── */}
        {activeTab === "analytics" && (
          <div className="p-3 space-y-3">
            {/* Recovery stats */}
            <div className="grid grid-cols-2 gap-3">
              <AppSurface level={1} className="p-4 text-center">
                <p className="text-2xl font-bold font-display text-[hsl(152_55%_48%)] tabular-nums">67%</p>
                <p className="text-[10px] text-[hsl(0_0%_50%)] mt-1">Recovery Win Rate</p>
                <p className="text-[9px] text-[hsl(0_0%_35%)]">Last 90 days</p>
              </AppSurface>
              <AppSurface level={1} className="p-4 text-center">
                <p className="text-2xl font-bold font-display text-[hsl(38_85%_58%)] tabular-nums">$89.2K</p>
                <p className="text-[10px] text-[hsl(0_0%_50%)] mt-1">Value Recovered</p>
                <p className="text-[9px] text-[hsl(0_0%_35%)]">This quarter</p>
              </AppSurface>
            </div>

            {/* Failure mode breakdown */}
            <AppSurface level={1} className="p-4">
              <p className="text-[10px] uppercase tracking-wider text-[hsl(0_0%_50%)] font-semibold mb-3">Top Failure Modes</p>
              {[
                { label: "No Response", pct: 28, color: "hsl(0 70% 55%)" },
                { label: "Quote Abandoned", pct: 22, color: "hsl(38 85% 58%)" },
                { label: "Missed Follow-up", pct: 18, color: "hsl(265 55% 58%)" },
                { label: "Owner Dropped", pct: 14, color: "hsl(0 55% 50%)" },
                { label: "Lost Momentum", pct: 10, color: "hsl(152 55% 48%)" },
                { label: "Other", pct: 8, color: "hsl(0 0% 40%)" },
              ].map(fm => (
                <div key={fm.label} className="mb-2">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] text-[hsl(0_0%_60%)]">{fm.label}</span>
                    <span className="text-[10px] font-bold text-[hsl(0_0%_70%)] tabular-nums">{fm.pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[hsl(0_0%_15%)] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${fm.pct}%` }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                      className="h-full rounded-full"
                      style={{ background: fm.color }}
                    />
                  </div>
                </div>
              ))}
            </AppSurface>

            {/* Recovery path effectiveness */}
            <AppSurface level={1} className="p-4">
              <p className="text-[10px] uppercase tracking-wider text-[hsl(0_0%_50%)] font-semibold mb-3">Path Effectiveness</p>
              {[
                { path: "Direct Rescue", rate: 81, count: 42 },
                { path: "Quote Rescue", rate: 68, count: 28 },
                { path: "Consult Reactivation", rate: 72, count: 18 },
                { path: "Soft Reactivation", rate: 54, count: 35 },
                { path: "Reassignment", rate: 61, count: 12 },
                { path: "Strategic Rescue", rate: 45, count: 8 },
              ].map(p => (
                <div key={p.path} className="flex items-center justify-between py-1.5 border-b border-[hsl(0_0%_100%/0.04)] last:border-0">
                  <span className="text-[10px] text-[hsl(0_0%_60%)]">{p.path}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-[hsl(0_0%_40%)]">{p.count} attempts</span>
                    <span className={cn("text-[10px] font-bold tabular-nums", p.rate >= 70 ? "text-[hsl(152_55%_48%)]" : p.rate >= 50 ? "text-[hsl(38_85%_58%)]" : "text-[hsl(0_70%_55%)]")}>
                      {p.rate}%
                    </span>
                  </div>
                </div>
              ))}
            </AppSurface>

            {/* Monthly trend */}
            <AppSurface level={1} className="p-4">
              <p className="text-[10px] uppercase tracking-wider text-[hsl(0_0%_50%)] font-semibold mb-3">Monthly Recovery Trend</p>
              <div className="flex items-end gap-2 h-24">
                {[
                  { month: "Nov", value: 12400, recovered: 8 },
                  { month: "Dec", value: 18600, recovered: 11 },
                  { month: "Jan", value: 22100, recovered: 14 },
                  { month: "Feb", value: 19800, recovered: 12 },
                  { month: "Mar", value: 28500, recovered: 18 },
                  { month: "Apr", value: 31200, recovered: 21 },
                ].map((m, i) => {
                  const maxVal = 31200;
                  const height = (m.value / maxVal) * 100;
                  return (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ duration: 0.5, delay: i * 0.08 }}
                        className="w-full rounded-t-md bg-gradient-to-t from-[hsl(265_55%_58%)] to-[hsl(265_55%_68%)]"
                      />
                      <span className="text-[8px] text-[hsl(0_0%_40%)]">{m.month}</span>
                    </div>
                  );
                })}
              </div>
            </AppSurface>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-200px)] -m-4">
      <SplitWorkspace
        list={listPane}
        detail={
          <div className="p-3 overflow-y-auto h-full">
            <LeadRecoveryPane lead={selected} />
          </div>
        }
        hasSelection={!!selected}
        defaultSplit={50}
      />
    </div>
  );
};

export default LeadRecovery;
