import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import {
  FileText, Search, Shield, User, Bot, Clock, Eye,
  ChevronDown, Download, AlertTriangle, CheckCircle, XCircle,
  Settings, Link2, HelpCircle
} from "lucide-react";

type LogActor = "admin" | "ai_agent" | "system";
type LogSeverity = "info" | "warning" | "error" | "critical";

interface AuditEntry {
  id: string; timestamp: string; actor: LogActor; actorName: string; action: string; resource: string;
  severity: LogSeverity; correlationId?: string; details?: string; whyExplanation?: string;
}

const ACTOR_CONFIG: Record<LogActor, { icon: React.ElementType; color: string }> = {
  admin: { icon: User, color: "text-blue-400" }, ai_agent: { icon: Bot, color: "text-purple-400" }, system: { icon: Settings, color: "text-muted-foreground" },
};
const SEVERITY_CONFIG: Record<LogSeverity, { color: string; bg: string }> = {
  info: { color: "text-blue-400", bg: "bg-blue-500/10" }, warning: { color: "text-amber-400", bg: "bg-amber-500/10" },
  error: { color: "text-red-400", bg: "bg-red-500/10" }, critical: { color: "text-red-400", bg: "bg-red-500/15" },
};

const DEMO_LOGS: AuditEntry[] = [
  { id: "1", timestamp: "14:23:01", actor: "admin", actorName: "Founder", action: "Approved canary rollout", resource: "release-v3.4.1", severity: "info", correlationId: "rel-3841", whyExplanation: "Founder approved the staged rollout after simulation passed with 91% confidence." },
  { id: "2", timestamp: "14:22:45", actor: "ai_agent", actorName: "Release Advisor", action: "Recommended canary expansion", resource: "canary-cohort-beta", severity: "info", correlationId: "rel-3841", whyExplanation: "Health metrics stable for 30 minutes. Error rate within threshold." },
  { id: "3", timestamp: "14:18:30", actor: "system", actorName: "Health Monitor", action: "Health check passed", resource: "sync-service", severity: "info", correlationId: "hc-9921" },
  { id: "4", timestamp: "14:15:02", actor: "ai_agent", actorName: "Security Scanner", action: "Flagged suspicious auth pattern", resource: "auth-service", severity: "warning", correlationId: "sec-1102", details: "Unusual login burst from IP range 203.x.x.x — 47 attempts in 2 minutes", whyExplanation: "Pattern matches credential stuffing signature." },
  { id: "5", timestamp: "14:10:11", actor: "admin", actorName: "Founder", action: "Paused rollout for investigation", resource: "release-v3.4.0", severity: "warning", correlationId: "rel-3840", whyExplanation: "Battery regression reported by 3 beta users." },
  { id: "6", timestamp: "14:05:33", actor: "system", actorName: "Quota Monitor", action: "Storage quota warning", resource: "storage-tier-pro", severity: "warning", details: "Pro tier approaching 85% storage utilization" },
  { id: "7", timestamp: "13:58:20", actor: "ai_agent", actorName: "Cost Optimizer", action: "Switched model tier", resource: "ai-router", severity: "info", details: "Moved summarization to GPT-5-mini. Est. savings: $8.40/day", whyExplanation: "Quality score remained above threshold (87%) with budget model." },
  { id: "8", timestamp: "13:45:00", actor: "system", actorName: "Backup Service", action: "Snapshot completed", resource: "db-backup-daily", severity: "info", details: "Full snapshot completed. Size: 2.3GB. Restore tested: OK." },
  { id: "9", timestamp: "13:30:15", actor: "admin", actorName: "Founder", action: "Updated trust threshold", resource: "trust-engine", severity: "info", correlationId: "trust-441" },
  { id: "10", timestamp: "13:22:07", actor: "ai_agent", actorName: "Sync Advisor", action: "Detected retry storm risk", resource: "sync-service", severity: "error", correlationId: "sync-8823", details: "Retry queue depth exceeded 10K. Circuit breaker activated.", whyExplanation: "Upstream timeout caused exponential retry growth. Auto-throttled." },
];

export default function MCLogsAudit() {
  const { isDemo } = useAuth();
  const isDemoMode = isDemo;
  const [search, setSearch] = useState("");
  const [actorFilter, setActorFilter] = useState<LogActor | "all">("all");
  const [severityFilter, setSeverityFilter] = useState<LogSeverity | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCorrelation, setShowCorrelation] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return (isDemoMode ? DEMO_LOGS : [] as typeof DEMO_LOGS).filter(l => {
      if (actorFilter !== "all" && l.actor !== actorFilter) return false;
      if (severityFilter !== "all" && l.severity !== severityFilter) return false;
      if (showCorrelation && l.correlationId !== showCorrelation) return false;
      if (search && !l.action.toLowerCase().includes(search.toLowerCase()) && !l.resource.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [actorFilter, severityFilter, search, showCorrelation]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-foreground flex items-center gap-2"><FileText className="h-5 w-5 text-blue-400" /> Logs & Audit Trail</h1>
          <p className="text-sm text-muted-foreground mt-1">Transparent, explainable action history with correlation and linked reasoning</p>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5"><Download className="h-3.5 w-3.5" /> Export</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Events", value: (isDemoMode ? DEMO_LOGS : [] as typeof DEMO_LOGS).length, icon: FileText, color: "text-foreground" },
          { label: "Admin Actions", value: (isDemoMode ? DEMO_LOGS : [] as typeof DEMO_LOGS).filter(l => l.actor === "admin").length, icon: User, color: "text-blue-400" },
          { label: "AI Actions", value: (isDemoMode ? DEMO_LOGS : [] as typeof DEMO_LOGS).filter(l => l.actor === "ai_agent").length, icon: Bot, color: "text-purple-400" },
          { label: "Warnings", value: (isDemoMode ? DEMO_LOGS : [] as typeof DEMO_LOGS).filter(l => l.severity === "warning").length, icon: AlertTriangle, color: "text-amber-400" },
          { label: "Errors", value: (isDemoMode ? DEMO_LOGS : [] as typeof DEMO_LOGS).filter(l => l.severity === "error" || l.severity === "critical").length, icon: XCircle, color: "text-red-400" },
        ].map(kpi => (
          <div key={kpi.label} className="rounded-xl border border-border/30 bg-white/[0.02] p-3">
            <div className="flex items-center gap-2 mb-1"><kpi.icon className={cn("h-3.5 w-3.5", kpi.color)} /><span className="text-[10px] text-muted-foreground">{kpi.label}</span></div>
            <p className="text-lg font-display font-bold text-foreground">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search actions, resources..." className="pl-9 bg-white/[0.03] border-white/[0.06]" />
        </div>
        <div className="flex gap-1.5">
          {(["all", "admin", "ai_agent", "system"] as const).map(a => (
            <button key={a} onClick={() => setActorFilter(a)} className={cn("px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-all", actorFilter === a ? "bg-primary/15 text-primary border-primary/30" : "bg-white/[0.03] text-muted-foreground border-white/[0.06] hover:bg-white/[0.06]")}>{a === "all" ? "All" : a === "ai_agent" ? "AI" : a.charAt(0).toUpperCase() + a.slice(1)}</button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {(["all", "info", "warning", "error"] as const).map(s => (
            <button key={s} onClick={() => setSeverityFilter(s)} className={cn("px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-all", severityFilter === s ? "bg-primary/15 text-primary border-primary/30" : "bg-white/[0.03] text-muted-foreground border-white/[0.06] hover:bg-white/[0.06]")}>{s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}</button>
          ))}
        </div>
        {showCorrelation && <Button size="sm" variant="ghost" className="text-xs gap-1" onClick={() => setShowCorrelation(null)}><XCircle className="h-3 w-3" /> Clear: {showCorrelation}</Button>}
      </div>

      <div className="space-y-1.5">
        {filtered.map((entry, i) => {
          const actorCfg = ACTOR_CONFIG[entry.actor]; const sevCfg = SEVERITY_CONFIG[entry.severity]; const ActorIcon = actorCfg.icon;
          const isExpanded = expandedId === entry.id;
          return (
            <motion.div key={entry.id} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
              className={cn("rounded-lg border p-3 cursor-pointer transition-all", "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]", isExpanded && "ring-1 ring-primary/10")}
              onClick={() => setExpandedId(isExpanded ? null : entry.id)}>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-muted-foreground w-16 shrink-0">{entry.timestamp}</span>
                <div className={cn("rounded-full p-1", sevCfg.bg)}><ActorIcon className={cn("h-3 w-3", actorCfg.color)} /></div>
                <span className="text-xs text-muted-foreground w-28 shrink-0 truncate">{entry.actorName}</span>
                <span className="text-xs text-foreground flex-1 truncate">{entry.action}</span>
                <Badge variant="outline" className="text-[8px] px-1.5 shrink-0">{entry.resource}</Badge>
                <Badge variant="outline" className={cn("text-[8px] px-1.5 shrink-0", sevCfg.color)}>{entry.severity}</Badge>
                {entry.correlationId && <button onClick={e => { e.stopPropagation(); setShowCorrelation(entry.correlationId!); }} className="text-[9px] text-muted-foreground hover:text-primary flex items-center gap-0.5"><Link2 className="h-2.5 w-2.5" />{entry.correlationId}</button>}
                <ChevronDown className={cn("h-3 w-3 text-muted-foreground shrink-0 transition-transform", isExpanded && "rotate-180")} />
              </div>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="mt-3 ml-[76px] space-y-2">
                      {entry.details && <p className="text-[11px] text-muted-foreground">{entry.details}</p>}
                      {entry.whyExplanation && (
                        <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-2">
                          <div className="flex items-center gap-1.5 text-[10px] text-blue-400 font-medium mb-0.5"><HelpCircle className="h-3 w-3" /> Why did this happen?</div>
                          <p className="text-[10px] text-muted-foreground">{entry.whyExplanation}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}