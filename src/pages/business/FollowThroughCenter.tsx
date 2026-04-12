import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/sita/PremiumPageComponents";
import { SitaPageHeader, SitaButton } from "@/components/sita/SitaCard";
import { SitaTabs } from "@/components/sita/SitaComponents";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import {
  Phone, Mail, Clock, AlertCircle, ArrowRight, SkipForward, AlarmClock,
  FileText, DollarSign, Users, Zap, Eye, Send, CheckCircle
} from "lucide-react";

type QueueTab = "callbacks" | "no-touch" | "waiting" | "drafts" | "overdue" | "recovery";

interface QueueItem {
  id: string;
  name: string;
  company: string;
  reason: string;
  daysStale: number;
  value?: number;
  channel: "phone" | "email" | "meeting";
  urgency: "high" | "medium" | "low";
}

const DEMO_CALLBACKS: QueueItem[] = [
  { id: "cb1", name: "Sarah Chen", company: "Meridian Ventures", reason: "Quote follow-up — $2,500 website redesign", daysStale: 0, value: 2500, channel: "phone", urgency: "high" },
  { id: "cb2", name: "James Rodriguez", company: "Nordic Digital", reason: "Onboarding check-in — started last week", daysStale: 0, value: 4200, channel: "phone", urgency: "medium" },
  { id: "cb3", name: "Emily Watson", company: "Atlas Corp", reason: "No contact in 3 days — stale risk", daysStale: 3, value: 1800, channel: "phone", urgency: "high" },
];

const DEMO_NOTOUCH: QueueItem[] = [
  { id: "nt1", name: "David Kim", company: "Pinnacle LLC", reason: "Lead from website form — never contacted", daysStale: 7, value: 3200, channel: "email", urgency: "high" },
  { id: "nt2", name: "Lisa Park", company: "Summit Labs", reason: "Referred by Sarah Chen — no outreach yet", daysStale: 5, value: 1500, channel: "email", urgency: "medium" },
];

const DEMO_WAITING: QueueItem[] = [
  { id: "w1", name: "Marcus Webb", company: "Atlas Corp", reason: "Proposal sent 4 days ago — no response", daysStale: 4, value: 8500, channel: "email", urgency: "medium" },
  { id: "w2", name: "Elena Rossi", company: "Vanguard Advisory", reason: "Contract sent for review — awaiting signature", daysStale: 2, value: 4500, channel: "email", urgency: "low" },
];

const DEMO_DRAFTS: QueueItem[] = [
  { id: "d1", name: "Michael Park", company: "Apex Solutions", reason: "Follow-up draft — web design inquiry", daysStale: 1, value: 2000, channel: "email", urgency: "medium" },
];

const DEMO_OVERDUE: QueueItem[] = [
  { id: "o1", name: "Karen Lee", company: "Bright Media", reason: "Scheduled call missed — reschedule needed", daysStale: 2, value: 3400, channel: "phone", urgency: "high" },
  { id: "o2", name: "Tom Jenkins", company: "CoreTech", reason: "Follow-up overdue by 5 days", daysStale: 5, value: 6200, channel: "email", urgency: "high" },
];

const DEMO_RECOVERY: QueueItem[] = [
  { id: "r1", name: "Apex Corp", company: "Apex Corp", reason: "Quote expired 3 days ago — $3,200 recoverable", daysStale: 3, value: 3200, channel: "email", urgency: "medium" },
  { id: "r2", name: "Blue Ridge Co", company: "Blue Ridge Co", reason: "Lost deal 14 days ago — re-engage opportunity", daysStale: 14, value: 5800, channel: "phone", urgency: "low" },
];

const TAB_DATA: Record<QueueTab, { items: QueueItem[]; label: string; icon: typeof Phone }> = {
  callbacks: { items: DEMO_CALLBACKS, label: "Callbacks", icon: Phone },
  "no-touch": { items: DEMO_NOTOUCH, label: "No-Touch Leads", icon: Users },
  waiting: { items: DEMO_WAITING, label: "Waiting on Reply", icon: Clock },
  drafts: { items: DEMO_DRAFTS, label: "Unsent Drafts", icon: FileText },
  overdue: { items: DEMO_OVERDUE, label: "Overdue Outreach", icon: AlertCircle },
  recovery: { items: DEMO_RECOVERY, label: "Recovery", icon: DollarSign },
};

const channelIcon = { phone: Phone, email: Mail, meeting: Users };
const urgencyDot = { high: "bg-destructive", medium: "bg-amber-500", low: "bg-chart-2" };

const QueueCard = ({ item }: { item: QueueItem }) => {
  const ChannelIcon = channelIcon[item.channel];
  return (
    <motion.div
      className="flex items-center gap-3 rounded-xl border border-border/20 bg-secondary/15 px-4 py-3 hover:bg-secondary/30 transition-colors"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${urgencyDot[item.urgency]}`} />
      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
        {item.name.split(" ").map(n => n[0]).join("")}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[12px] font-semibold text-foreground truncate">{item.name}</p>
          <span className="text-[9px] text-muted-foreground">· {item.company}</span>
        </div>
        <p className="text-[10px] text-muted-foreground truncate">{item.reason}</p>
        <div className="flex items-center gap-3 mt-1">
          {item.daysStale > 0 && (
            <span className={`text-[9px] font-medium ${item.daysStale >= 3 ? "text-destructive" : "text-amber-500"}`}>
              {item.daysStale}d stale
            </span>
          )}
          {item.value && (
            <span className="text-[9px] text-chart-2 font-medium">${item.value.toLocaleString()}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button className="rounded-lg p-2 hover:bg-primary/10 transition-colors" title="Call / Send">
          <ChannelIcon className="h-3.5 w-3.5 text-primary" />
        </button>
        <button className="rounded-lg p-2 hover:bg-secondary/50 transition-colors" title="Draft">
          <FileText className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
        <button className="rounded-lg p-2 hover:bg-secondary/50 transition-colors" title="Skip">
          <SkipForward className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
        <button className="rounded-lg p-2 hover:bg-secondary/50 transition-colors" title="Snooze">
          <AlarmClock className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>
    </motion.div>
  );
};

const FollowThroughCenter = () => {
  const [activeTab, setActiveTab] = useState<QueueTab>("callbacks");
  const tabData = TAB_DATA[activeTab];

  const totalItems = useMemo(() => Object.values(TAB_DATA).reduce((sum, t) => sum + t.items.length, 0), []);
  const totalValue = useMemo(() => Object.values(TAB_DATA).flatMap(t => t.items).reduce((sum, i) => sum + (i.value || 0), 0), []);

  return (
    <motion.div className="space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <DemoModeBadge />
      <SitaPageHeader
        title="Follow-Through Center"
        subtitle="Every open thread in one queue — never drop a ball"
      />

      {/* Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Queue", value: totalItems, color: "text-primary" },
          { label: "At Risk Value", value: `$${totalValue.toLocaleString()}`, color: "text-accent" },
          { label: "Overdue", value: TAB_DATA.overdue.items.length + TAB_DATA["no-touch"].items.length, color: "text-destructive" },
          { label: "Ready to Send", value: TAB_DATA.drafts.items.length, color: "text-chart-2" },
        ].map(s => (
          <GlassCard key={s.label} glow="none" className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
            <p className={`font-display text-xl font-bold ${s.color}`}>{s.value}</p>
          </GlassCard>
        ))}
      </div>

      {/* Tab Selector */}
      <SitaTabs
        tabs={Object.entries(TAB_DATA).map(([key, data]) => ({
          key,
          label: data.label,
          count: data.items.length,
        }))}
        active={activeTab}
        onChange={(k) => setActiveTab(k as QueueTab)}
      />

      {/* Queue */}
      <div className="space-y-2">
        {tabData.items.length === 0 ? (
          <GlassCard glow="none" className="p-8 text-center">
            <CheckCircle className="h-8 w-8 text-chart-2 mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">All clear</p>
            <p className="text-xs text-muted-foreground">No items in this queue</p>
          </GlassCard>
        ) : (
          tabData.items.map(item => <QueueCard key={item.id} item={item} />)
        )}
      </div>
    </motion.div>
  );
};

export default FollowThroughCenter;
