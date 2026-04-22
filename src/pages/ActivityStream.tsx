// ═══════════════════════════════════════════════════════════════
// SITA OS — Timeline / What-Changed Feed
// The living memory stream of the operating environment
// ═══════════════════════════════════════════════════════════════

import { SitaPageHeader, SitaCard, SitaSectionHeader } from "@/components/sita/SitaCard";
import { KPITile, EmptyState, SitaTabs } from "@/components/sita/SitaComponents";
import { DomainHeader } from "@/components/sita/primitives/DomainHeader";
import { StateBadge } from "@/components/sita/StateBadge";
import { SectionSkeleton } from "@/components/sita/SectionSkeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { dbAny as db } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Activity, Brain, Eye, CheckCircle, AlertTriangle, Clock, Sparkles, Shield,
  DollarSign, Briefcase, Users, Zap, ArrowRight, RotateCcw, XCircle, Bell,
  Filter, Home, FileCheck, Receipt, Calendar, MessageSquare, Link2,
  ChevronRight, Pin, Search, Layers, TrendingUp
} from "lucide-react";

import { DEMO_ACTIVITY_TIMELINE } from "@/data/fixtures/demo-data";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";





// ── Category System ──────────────────────────────────────────
type FeedCategory = "all" | "actions" | "approvals" | "proof" | "workflows" | "finance" | "communications" | "household" | "system";

const categoryConfig: Record<FeedCategory, { label: string; icon: typeof Activity; color: string }> = {
  all: { label: "All", icon: Layers, color: "text-foreground" },
  actions: { label: "Actions", icon: Zap, color: "text-primary" },
  approvals: { label: "Approvals", icon: Shield, color: "text-accent" },
  proof: { label: "Proof", icon: Receipt, color: "text-trust-verified" },
  workflows: { label: "Workflows", icon: Activity, color: "text-sita-purple-light" },
  finance: { label: "Finance", icon: DollarSign, color: "text-domain-finance" },
  communications: { label: "Comms", icon: MessageSquare, color: "text-domain-comms" },
  household: { label: "Household", icon: Home, color: "text-domain-household" },
  system: { label: "System", icon: Brain, color: "text-muted-foreground" },
};

const iconMap: Record<string, typeof Activity> = {
  "workflow.created": Zap, "workflow.executed": CheckCircle, "workflow.failed": XCircle,
  "workflow.approval_requested": Shield, "receipt.created": Receipt,
  "opportunity.detected": Sparkles, "connector.failed": AlertTriangle,
  "boardroom.generated": Brain, "approval.granted": Shield, "approval.denied": XCircle,
  "finance.bill_due": DollarSign, "finance.payment": DollarSign,
  "household.task_completed": Home, "communication.sent": MessageSquare,
  default: Activity,
};

const colorMap: Record<string, string> = {
  "workflow.created": "text-accent", "workflow.executed": "text-trust-verified",
  "workflow.failed": "text-urgency-critical", "workflow.approval_requested": "text-primary",
  "receipt.created": "text-trust-verified", "opportunity.detected": "text-accent",
  "connector.failed": "text-urgency-high", "boardroom.generated": "text-primary",
  "approval.granted": "text-trust-verified", "approval.denied": "text-destructive",
  "finance.bill_due": "text-accent", "finance.payment": "text-trust-verified",
  default: "text-muted-foreground",
};

const domainFromType = (type: string): FeedCategory => {
  if (type.startsWith("approval")) return "approvals";
  if (type.startsWith("receipt") || type.startsWith("proof")) return "proof";
  if (type.startsWith("workflow")) return "workflows";
  if (type.startsWith("finance")) return "finance";
  if (type.startsWith("communication")) return "communications";
  if (type.startsWith("household")) return "household";
  if (type.startsWith("connector") || type.startsWith("system")) return "system";
  return "actions";
};

const timeSince = (date: string) => {
  const ms = Date.now() - new Date(date).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const getDateGroup = (date: string) => {
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return "This Week";
  return "Earlier";
};

// ── Feed Event Card ──────────────────────────────────────────
const FeedEventCard = ({ event, index, expanded, onToggle }: {
  event: any; index: number; expanded: boolean; onToggle: () => void;
}) => {
  const Icon = iconMap[event.type] || iconMap.default;
  const color = colorMap[event.type] || colorMap.default;
  const domain = domainFromType(event.type);
  const catCfg = categoryConfig[domain];

  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.3) }}
    >
<div
        onClick={onToggle}
        className={cn(
          "group relative rounded-xl border border-border bg-card/80 backdrop-blur-sm transition-all duration-200 cursor-pointer",
          "hover:border-primary/15 hover:shadow-card-hover",
          expanded && "border-primary/20 shadow-glow-purple/5"
        )}
      >
        {/* Left accent line */}
        <div className={cn("absolute left-0 top-3 bottom-3 w-[2px] rounded-full", {
          "bg-primary/60": domain === "actions",
          "bg-accent/60": domain === "approvals" || domain === "finance",
          "bg-trust-verified/60": domain === "proof",
          "bg-sita-purple-light/60": domain === "workflows",
          "bg-domain-comms/60": domain === "communications",
          "bg-domain-household/60": domain === "household",
          "bg-muted-foreground/40": domain === "system",
        })} />

        <div className="p-4 pl-5">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="rounded-lg bg-secondary/80 p-2 shrink-0 group-hover:bg-secondary">
              <Icon className={cn("h-4 w-4", color)} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-foreground leading-snug">
                    {event.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {event.subtitle}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-muted-foreground/70">{event.time}</span>
                  {event.proofLinked && (
                    <div className="flex items-center gap-0.5 text-[10px] text-trust-verified">
                      <FileCheck className="h-3 w-3" />
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="flex items-center gap-1.5 mt-2">
                <span className={cn("inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium bg-secondary", catCfg.color)}>
                  <catCfg.icon className="h-2.5 w-2.5" /> {catCfg.label}
                </span>
                {event.actor && event.actor !== "system" && (
                  <span className="text-[10px] text-muted-foreground bg-secondary rounded-md px-1.5 py-0.5">
                    {event.actor}
                  </span>
                )}
                {event.approvalRequired && (
                  <span className="text-[10px] text-accent bg-accent/10 rounded-md px-1.5 py-0.5 font-medium">
                    Approval
                  </span>
                )}
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                      {event.details && (
                        <p className="text-xs text-muted-foreground">{event.details}</p>
                      )}
                      {event.linkedEntity && (
                        <div className="flex items-center gap-2 text-xs text-primary">
                          <Link2 className="h-3 w-3" />
                          <span>{event.linkedEntity}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <button className="text-[11px] text-primary hover:underline">Open</button>
                        {event.proofLinked && (
                          <button className="text-[11px] text-trust-verified hover:underline">View Proof</button>
                        )}
                        <button className="text-[11px] text-muted-foreground hover:text-foreground">Pin</button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ── "While You Were Away" Summary ────────────────────────────
const CatchUpSummary = ({ events }: { events: any[] }) => {
  const counts = {
    actions: events.filter(e => domainFromType(e.type) === "actions").length,
    approvals: events.filter(e => domainFromType(e.type) === "approvals").length,
    finance: events.filter(e => domainFromType(e.type) === "finance").length,
    workflows: events.filter(e => domainFromType(e.type) === "workflows").length,
  };

  return (
    <SitaCard hover={false} glow className="p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="rounded-xl bg-primary/10 p-2">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-display font-semibold text-foreground">While You Were Away</p>
          <p className="text-xs text-muted-foreground">{events.length} events since your last visit</p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {counts.actions > 0 && (
          <div className="rounded-lg bg-secondary/50 px-3 py-2 text-center">
            <p className="text-lg font-display font-bold text-primary">{counts.actions}</p>
            <p className="text-[10px] text-muted-foreground">Actions</p>
          </div>
        )}
        {counts.approvals > 0 && (
          <div className="rounded-lg bg-secondary/50 px-3 py-2 text-center">
            <p className="text-lg font-display font-bold text-accent">{counts.approvals}</p>
            <p className="text-[10px] text-muted-foreground">Approvals</p>
          </div>
        )}
        {counts.finance > 0 && (
          <div className="rounded-lg bg-secondary/50 px-3 py-2 text-center">
            <p className="text-lg font-display font-bold text-domain-finance">{counts.finance}</p>
            <p className="text-[10px] text-muted-foreground">Finance</p>
          </div>
        )}
        {counts.workflows > 0 && (
          <div className="rounded-lg bg-secondary/50 px-3 py-2 text-center">
            <p className="text-lg font-display font-bold text-sita-purple-light">{counts.workflows}</p>
            <p className="text-[10px] text-muted-foreground">Workflows</p>
          </div>
        )}
      </div>
    </SitaCard>
  );
};

// ── Main Component ───────────────────────────────────────────
const ActivityStream = () => {
  const { user, isDemo } = useAuth();
  const isDemoMode = isDemo;
  const [category, setCategory] = useState<FeedCategory>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch events
  const { data: liveEvents = [], isLoading } = useQuery({
    queryKey: ["timeline_feed", user?.id],
    enabled: !!user && !isDemoMode,
    queryFn: async () => {
      const { data, error } = await db.from("events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  // Fetch approvals for timeline
  const { data: approvalEvents = [] } = useQuery({
    queryKey: ["timeline_approvals", user?.id],
    enabled: !!user && !isDemoMode,
    queryFn: async () => {
      const { data } = await db.from("ai_workforce_approval_queue")
        .select("id, status, title, summary, priority, created_at, decision_at")
        .order("created_at", { ascending: false })
        .limit(20);
      return (data || []).map((a: Record<string, any>) => ({
        type: `approval.${a.status}`,
        created_at: a.created_at,
        payload: { summary: a.title, action_type: a.priority },
        source: "approval_engine",
        processed: a.status !== "pending",
      }));
    },
  });

  // Fetch proof records for timeline
  const { data: proofEvents = [] } = useQuery({
    queryKey: ["timeline_proof", user?.id],
    enabled: !!user && !isDemoMode,
    queryFn: async () => {
      const { data } = await db.from("proof_records")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      return (data || []).map((p: Record<string, any>) => ({
        type: "receipt.created",
        created_at: p.created_at,
        payload: { summary: p.action_summary, domain: p.domain },
        source: "proof_engine",
        processed: true,
        proofLinked: true,
      }));
    },
  });

  // Build unified timeline
  const timeline = useMemo(() => {
    if (isDemoMode) {
      return (isDemoMode ? DEMO_ACTIVITY_TIMELINE : [] as typeof DEMO_ACTIVITY_TIMELINE).map((ev: any, i: number) => ({
        ...ev,
        id: i,
        type: ev.type || "system.event",
        time: ev.time || "recently",
        domain: domainFromType(ev.type || "system.event"),
      }));
    }

    const allEvents = [...liveEvents, ...approvalEvents, ...proofEvents]
      .sort((a: any,  b: Record<string, any>) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return allEvents.map((ev: any, i: number) => {
      const type = ev.type || "system.event";
      const payload = typeof ev.payload === "object" ? ev.payload : {};
      return {
        id: i,
        type,
        title: payload.summary || type.replace(/\./g, " → ").replace(/^\w/, (c: string) => c.toUpperCase()),
        subtitle: payload.domain || ev.source || "System",
        time: timeSince(ev.created_at),
        dateGroup: getDateGroup(ev.created_at),
        domain: domainFromType(type),
        actor: ev.source || "system",
        proofLinked: ev.proofLinked || type.includes("receipt"),
        approvalRequired: type.includes("approval"),
        details: JSON.stringify(payload).slice(0, 200),
        linkedEntity: payload.workflow_id || payload.invoice_id || null,
      };
    });
  }, [isDemoMode, liveEvents, approvalEvents, proofEvents]);

  // Filter
  const filtered = useMemo(() => {
    let items = category === "all" ? timeline : timeline.filter(e => e.domain === category);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(e => e.title?.toLowerCase().includes(q) || e.subtitle?.toLowerCase().includes(q));
    }
    return items;
  }, [timeline, category, searchQuery]);

  // Group by date
  const grouped = useMemo(() => {
    const groups: Record<string, typeof filtered> = {};
    filtered.forEach(e => {
      const group = e.dateGroup || "Earlier";
      if (!groups[group]) groups[group] = [];
      groups[group].push(e);
    });
    return groups;
  }, [filtered]);

  const todayCount = timeline.filter(e => e.dateGroup === "Today").length;
  const pendingCount = timeline.filter(e => e.approvalRequired).length;
  const proofCount = timeline.filter(e => e.proofLinked).length;

  return (
    <motion.div className="mx-auto max-w-5xl space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <DomainHeader
        title="Timeline"
        subtitle="Your operating environment's living memory — every meaningful change, action, and outcome"
        icon={Activity}
        domain="system"
        actions={
          <div className={cn(
            "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold",
            isDemoMode ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
          )}>
            <div className={cn("h-2 w-2 rounded-full", isDemoMode ? "bg-amber-500 animate-pulse" : "bg-emerald-500")} />
            {isDemoMode ? "Demo" : "Live"}
          </div>
        }
      />

      {/* KPI Strip */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Today" value={todayCount} icon={Calendar} sub="events recorded" />
        <KPITile label="Total Events" value={timeline.length} icon={Activity} />
        <KPITile label="Pending Actions" value={pendingCount} icon={Clock} sub={pendingCount > 0 ? "needs attention" : "all clear"} />
        <KPITile label="Proof Linked" value={proofCount} icon={Receipt} sub="trust-verified" />
      </div>

      {/* Catch-up summary if many events */}
      {timeline.length > 10 && <CatchUpSummary events={timeline} />}

      {/* Search + Category Filter */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search timeline events..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/30"
          />
        </div>

        {/* Category pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {(Object.keys(categoryConfig) as FeedCategory[]).map(cat => {
            const cfg = categoryConfig[cat];
            const count = cat === "all" ? timeline.length : timeline.filter(e => e.domain === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium whitespace-nowrap transition-all",
                  category === cat
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <cfg.icon className="h-3 w-3" />
                {cfg.label}
                <span className="text-[10px] opacity-60">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Timeline Feed */}
      {isLoading && !isDemoMode ? (
        <SectionSkeleton cards={6} columns={1} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No events found"
          description={searchQuery ? "Try a different search term" : "Events will appear as the system processes actions, workflows, and integrations."}
        />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([dateGroup, events]) => (
            <div key={dateGroup}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{dateGroup}</span>
                <div className="flex-1 h-px bg-border/50" />
                <span className="text-[10px] text-muted-foreground">{events.length} events</span>
              </div>
              <div className="space-y-2">
                {events.map((event, i) => (
                  <FeedEventCard
                    key={event.id}
                    event={event}
                    index={i}
                    expanded={expandedId === event.id}
                    onToggle={() => setExpandedId(expandedId === event.id ? null : event.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default ActivityStream;
