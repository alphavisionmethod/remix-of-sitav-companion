import { MobileShell } from "@/platform/experience/components/mobile/MobileShell";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal, ShieldCheck, RefreshCw, Zap, AlertTriangle, CheckCircle2,
  XCircle, Clock, Wrench, Lock, Smartphone, Search, Filter,
  ChevronRight, FileText, RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

type EventDomain = "command" | "approval" | "update" | "sync" | "security" | "trust" | "repair" | "system";

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  domain: EventDomain;
  timestamp: string;
  date: string;
  status: "success" | "pending" | "failed" | "info";
  receiptId?: string;
}

const domainConfig: Record<EventDomain, { icon: any; color: string; bg: string }> = {
  command: { icon: Terminal, color: "text-primary", bg: "bg-primary/15" },
  approval: { icon: ShieldCheck, color: "text-amber-400", bg: "bg-amber-500/15" },
  update: { icon: Zap, color: "text-emerald-400", bg: "bg-emerald-500/15" },
  sync: { icon: RefreshCw, color: "text-blue-400", bg: "bg-blue-500/15" },
  security: { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/15" },
  trust: { icon: Lock, color: "text-indigo-400", bg: "bg-indigo-500/15" },
  repair: { icon: Wrench, color: "text-orange-400", bg: "bg-orange-500/15" },
  system: { icon: Smartphone, color: "text-muted-foreground", bg: "bg-muted" },
};

const statusIcons: Record<string, { icon: any; color: string }> = {
  success: { icon: CheckCircle2, color: "text-emerald-400" },
  pending: { icon: Clock, color: "text-amber-400" },
  failed: { icon: XCircle, color: "text-red-400" },
  info: { icon: FileText, color: "text-muted-foreground" },
};

const events: TimelineEvent[] = [
  { id: "t1", title: "Force sync executed", description: "All 3 online devices synced successfully", domain: "command", timestamp: "10:14 AM", date: "Today", status: "success", receiptId: "RX-2847" },
  { id: "t2", title: "Trust revocation requested", description: "tablet-02 trust revocation pending approval", domain: "approval", timestamp: "10:09 AM", date: "Today", status: "pending" },
  { id: "t3", title: "Unknown login blocked", description: "Login attempt from 192.168.1.42 blocked by security policy", domain: "security", timestamp: "9:58 AM", date: "Today", status: "info" },
  { id: "t4", title: "Sync conflict detected", description: "Budget_2025.xlsx — edit conflict between MacBook & iPad", domain: "sync", timestamp: "9:32 AM", date: "Today", status: "pending" },
  { id: "t5", title: "Update v2.4.1 canary deployed", description: "12 devices updated, monitoring 24h before stable", domain: "update", timestamp: "8:45 AM", date: "Today", status: "success", receiptId: "RX-2846" },
  { id: "t6", title: "Home Server went offline", description: "Device unreachable, auto-retry queued", domain: "system", timestamp: "7:14 AM", date: "Today", status: "failed" },
  { id: "t7", title: "iPhone 15 trust upgraded", description: "Promoted to Primary trust after 30-day verification", domain: "trust", timestamp: "6:00 PM", date: "Yesterday", status: "success", receiptId: "RX-2840" },
  { id: "t8", title: "Ecosystem sync completed", description: "Full sync across all 4 devices — 0 conflicts", domain: "sync", timestamp: "3:22 PM", date: "Yesterday", status: "success" },
  { id: "t9", title: "Auto-repair: sync queue flush", description: "tablet-02 sync queue flushed after offline recovery", domain: "repair", timestamp: "2:15 PM", date: "Yesterday", status: "success", receiptId: "RX-2838" },
  { id: "t10", title: "Update v2.4.0 stable rollout", description: "All stable-channel devices updated successfully", domain: "update", timestamp: "11:00 AM", date: "Yesterday", status: "success", receiptId: "RX-2835" },
  { id: "t11", title: "Approval: delete archived files", description: "Founder approved bulk deletion of 142 archived items", domain: "approval", timestamp: "9:30 AM", date: "2 days ago", status: "success", receiptId: "RX-2830" },
  { id: "t12", title: "Security scan completed", description: "Quarterly scan — 0 vulnerabilities found across all endpoints", domain: "security", timestamp: "8:00 AM", date: "2 days ago", status: "success" },
];

const MobileTimeline = () => {
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState<EventDomain | "all">("all");

  const filtered = events.filter((e) => {
    if (domainFilter !== "all" && e.domain !== domainFilter) return false;
    if (search && !e.title.toLowerCase().includes(search.toLowerCase()) && !e.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const groups = [...new Set(filtered.map((e) => e.date))];

  return (
    <MobileShell title="Timeline">
      <div className="mb-2"><PageTruthBanner truthState="partial" /></div>
      {/* Search */}
      <div className="flex items-center gap-2 rounded-xl border border-border/40 bg-card px-3 py-2 mb-3">
        <Search className="h-3.5 w-3.5 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search events..."
          className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
        />
      </div>

      {/* Domain Filters */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        <button onClick={() => setDomainFilter("all")} className={cn(
          "px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors whitespace-nowrap",
          domainFilter === "all" ? "bg-primary/20 text-primary" : "text-muted-foreground"
        )}>All</button>
        {(Object.keys(domainConfig) as EventDomain[]).map((d) => {
          const dc = domainConfig[d];
          return (
            <button key={d} onClick={() => setDomainFilter(d)} className={cn(
              "px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors whitespace-nowrap capitalize",
              domainFilter === d ? `${dc.bg} ${dc.color}` : "text-muted-foreground"
            )}>
              {d}
            </button>
          );
        })}
      </div>

      {/* Timeline */}
      {groups.map((group) => (
        <div key={group} className="mb-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2">{group}</p>
          <div className="relative pl-4 border-l border-border/30 space-y-2">
            <AnimatePresence>
              {filtered.filter((e) => e.date === group).map((evt, i) => {
                const dc = domainConfig[evt.domain];
                const si = statusIcons[evt.status];
                const DomainIcon = dc.icon;
                const StatusIcon = si.icon;
                return (
                  <motion.div
                    key={evt.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="relative"
                  >
                    {/* Dot on timeline */}
                    <div className={cn("absolute -left-[21px] top-3 h-2.5 w-2.5 rounded-full border-2 border-background", dc.bg.replace("bg-", "bg-").replace("/15", ""))} 
                      style={{ backgroundColor: `var(--${evt.domain === "command" ? "primary" : ""})` }}>
                      <div className={cn("h-full w-full rounded-full", dc.bg)} />
                    </div>

                    <div className="rounded-xl border border-border/40 bg-card p-3 ml-2">
                      <div className="flex items-start gap-2.5">
                        <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center shrink-0", dc.bg)}>
                          <DomainIcon className={cn("h-3.5 w-3.5", dc.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-medium truncate">{evt.title}</p>
                            <StatusIcon className={cn("h-3 w-3 shrink-0", si.color)} />
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{evt.description}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <Clock className="h-2.5 w-2.5 text-muted-foreground" />
                            <span className="text-[9px] text-muted-foreground">{evt.timestamp}</span>
                            {evt.receiptId && (
                              <span className="text-[9px] font-mono text-primary">{evt.receiptId}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      ))}
    </MobileShell>
  );
};

export default MobileTimeline;
