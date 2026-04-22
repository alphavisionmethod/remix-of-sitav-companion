import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import {
  HeadphonesIcon, Search, User, Clock, AlertTriangle, CheckCircle,
  ChevronRight, MessageSquare, Wrench, Eye, ArrowUp,
  FileText, Activity, Zap
} from "lucide-react";

type CaseStatus = "open" | "investigating" | "waiting" | "resolved" | "escalated";
type CasePriority = "low" | "medium" | "high" | "critical";

interface SupportCase {
  id: string; subject: string; userEmail: string; status: CaseStatus; priority: CasePriority;
  category: string; createdAt: string; lastActivity: string; description: string;
  diagnosticSummary: string; suggestedActions: string[]; syncHealth: string; trustScore: number;
}

const STATUS_CFG: Record<CaseStatus, { color: string; bg: string; icon: React.ElementType }> = {
  open: { color: "text-blue-400", bg: "bg-blue-500/10", icon: MessageSquare },
  investigating: { color: "text-amber-400", bg: "bg-amber-500/10", icon: Eye },
  waiting: { color: "text-muted-foreground", bg: "bg-white/[0.04]", icon: Clock },
  resolved: { color: "text-emerald-400", bg: "bg-emerald-500/10", icon: CheckCircle },
  escalated: { color: "text-red-400", bg: "bg-red-500/10", icon: ArrowUp },
};

const PRIORITY_CFG: Record<CasePriority, { color: string; border: string }> = {
  low: { color: "text-muted-foreground", border: "border-white/[0.06]" },
  medium: { color: "text-blue-400", border: "border-blue-500/20" },
  high: { color: "text-amber-400", border: "border-amber-500/20" },
  critical: { color: "text-red-400", border: "border-red-500/20" },
};

const DEMO_CASES: SupportCase[] = [
  { id: "SUP-1042", subject: "Workspace not restoring on new device", userEmail: "j***@example.com", status: "investigating", priority: "high", category: "Continuity", createdAt: "2 hours ago", lastActivity: "15 min ago", description: "User reports workspace state not restoring after logging in on a new tablet.", diagnosticSummary: "Device registered. Sync checkpoint exists but state schema version mismatch (v3 vs v4). Migration path available.", suggestedActions: ["Run state schema migration for user", "Verify workspace restore on test device", "Check for similar reports"], syncHealth: "degraded", trustScore: 87 },
  { id: "SUP-1041", subject: "Unable to complete file upload", userEmail: "m***@corp.io", status: "open", priority: "medium", category: "Storage", createdAt: "4 hours ago", lastActivity: "3 hours ago", description: "Large file uploads (>50MB) failing with timeout.", diagnosticSummary: "Upload finalization timing out. Storage service healthy but user on metered connection with high packet loss.", suggestedActions: ["Enable chunked upload fallback", "Check storage finalization queue depth"], syncHealth: "healthy", trustScore: 94 },
  { id: "SUP-1040", subject: "Trust prompt appearing too frequently", userEmail: "a***@startup.co", status: "escalated", priority: "critical", category: "Trust", createdAt: "1 day ago", lastActivity: "30 min ago", description: "User reports being asked to re-verify every session.", diagnosticSummary: "Trust score dropping due to VPN IP rotation. Device fingerprint stable. False positive confirmed.", suggestedActions: ["Add VPN IP range to trusted list", "Review trust threshold for VPN users globally", "Send apology"], syncHealth: "healthy", trustScore: 42 },
  { id: "SUP-1039", subject: "Billing shows wrong plan tier", userEmail: "r***@agency.net", status: "waiting", priority: "low", category: "Billing", createdAt: "2 days ago", lastActivity: "1 day ago", description: "Dashboard shows free tier but user has active pro subscription.", diagnosticSummary: "Stripe webhook delayed. Plan status updated but cached UI state is stale.", suggestedActions: ["Force cache refresh for user profile", "Verify Stripe subscription status"], syncHealth: "healthy", trustScore: 96 },
  { id: "SUP-1038", subject: "Sync conflict on shared document", userEmail: "t***@team.org", status: "resolved", priority: "medium", category: "Sync", createdAt: "3 days ago", lastActivity: "2 days ago", description: "Two users editing same document resulted in conflict.", diagnosticSummary: "CRDT merge resolved correctly but UI didn't reflect merged state until refresh. Fixed in v3.4.1.", suggestedActions: ["Confirm user is on latest version"], syncHealth: "healthy", trustScore: 91 },
];

export default function MCSupport() {
  const { isDemo } = useAuth();
  const isDemoMode = isDemo;
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CaseStatus | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return (isDemoMode ? DEMO_CASES : [] as typeof DEMO_CASES).filter(c => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (search && !c.subject.toLowerCase().includes(search.toLowerCase()) && !c.id.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [statusFilter, search]);

  const selected = DEMO_CASES.find(c => c.id === selectedId);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-display font-bold text-foreground flex items-center gap-2"><HeadphonesIcon className="h-5 w-5 text-cyan-400" /> Support Center</h1>
        <p className="text-sm text-muted-foreground mt-1">Privacy-aware troubleshooting with diagnostic bundles and safe repair actions</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Open Cases", value: (isDemoMode ? DEMO_CASES : [] as typeof DEMO_CASES).filter(c => c.status === "open" || c.status === "investigating").length, icon: MessageSquare, color: "text-blue-400" },
          { label: "Escalated", value: (isDemoMode ? DEMO_CASES : [] as typeof DEMO_CASES).filter(c => c.status === "escalated").length, icon: ArrowUp, color: "text-red-400" },
          { label: "Waiting", value: (isDemoMode ? DEMO_CASES : [] as typeof DEMO_CASES).filter(c => c.status === "waiting").length, icon: Clock, color: "text-muted-foreground" },
          { label: "Resolved Today", value: (isDemoMode ? DEMO_CASES : [] as typeof DEMO_CASES).filter(c => c.status === "resolved").length, icon: CheckCircle, color: "text-emerald-400" },
          { label: "Avg Resolution", value: "4.2h", icon: Activity, color: "text-cyan-400" },
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
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search cases..." className="pl-9 bg-white/[0.03] border-white/[0.06]" />
        </div>
        <div className="flex gap-1.5">
          {(["all", "open", "investigating", "escalated", "waiting", "resolved"] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={cn("px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-all", statusFilter === s ? "bg-primary/15 text-primary border-primary/30" : "bg-white/[0.03] text-muted-foreground border-white/[0.06] hover:bg-white/[0.06]")}>{s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 space-y-2">
          {filtered.map((c, i) => {
            const sCfg = STATUS_CFG[c.status]; const pCfg = PRIORITY_CFG[c.priority]; const SIcon = sCfg.icon;
            return (
              <motion.div key={c.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} onClick={() => setSelectedId(c.id)}
                className={cn("rounded-xl border p-4 cursor-pointer transition-all", selectedId === c.id ? "bg-white/[0.05] border-primary/30" : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]")}>
                <div className="flex items-start gap-3">
                  <div className={cn("rounded-full p-1.5", sCfg.bg)}><SIcon className={cn("h-3.5 w-3.5", sCfg.color)} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono text-muted-foreground">{c.id}</span>
                      <Badge variant="outline" className={cn("text-[8px]", pCfg.color, pCfg.border)}>{c.priority}</Badge>
                      <Badge variant="outline" className={cn("text-[8px]", sCfg.color)}>{c.status}</Badge>
                    </div>
                    <h4 className="text-sm font-semibold text-foreground truncate">{c.subject}</h4>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground"><span>{c.category}</span><span>•</span><span>{c.createdAt}</span></div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/30 shrink-0" />
                </div>
              </motion.div>
            );
          })}
        </div>
        <div className="lg:col-span-2">
          {selected ? (
            <motion.div key={selected.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="rounded-xl border border-border/30 bg-white/[0.02] p-5 sticky top-6 space-y-4">
              <div><div className="flex items-center gap-2 mb-2"><span className="text-[10px] font-mono text-muted-foreground">{selected.id}</span><Badge variant="outline" className={cn("text-[8px]", STATUS_CFG[selected.status].color)}>{selected.status}</Badge></div><h3 className="text-base font-semibold text-foreground">{selected.subject}</h3><p className="text-xs text-muted-foreground mt-1">{selected.description}</p></div>
              <div className="rounded-lg border border-border/30 bg-white/[0.02] p-3 space-y-2">
                <h4 className="text-xs font-medium text-foreground flex items-center gap-1.5"><User className="h-3 w-3 text-muted-foreground" />User Health</h4>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div><span className="text-muted-foreground">Email:</span> <span className="text-foreground">{selected.userEmail}</span></div>
                  <div><span className="text-muted-foreground">Trust:</span> <span className={selected.trustScore > 70 ? "text-emerald-400" : "text-amber-400"}>{selected.trustScore}%</span></div>
                  <div><span className="text-muted-foreground">Sync:</span> <span className={selected.syncHealth === "healthy" ? "text-emerald-400" : "text-amber-400"}>{selected.syncHealth}</span></div>
                </div>
              </div>
              <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-3">
                <h4 className="text-xs font-medium text-purple-400 flex items-center gap-1.5 mb-1"><Zap className="h-3 w-3" />AI Diagnostic</h4>
                <p className="text-[10px] text-muted-foreground">{selected.diagnosticSummary}</p>
              </div>
              <div className="space-y-1.5"><h4 className="text-xs font-medium text-foreground">Suggested Actions</h4>{selected.suggestedActions.map((a, i) => (<div key={i} className="flex items-center gap-2 text-[10px]"><CheckCircle className="h-3 w-3 text-emerald-400 shrink-0" /><span className="text-muted-foreground">{a}</span></div>))}</div>
              <div className="flex gap-2 pt-2 flex-wrap"><Button size="sm" variant="outline" className="gap-1 text-xs"><Wrench className="h-3 w-3" />Safe Repair</Button><Button size="sm" variant="outline" className="gap-1 text-xs"><FileText className="h-3 w-3" />Diagnostic Bundle</Button><Button size="sm" variant="outline" className="gap-1 text-xs"><ArrowUp className="h-3 w-3" />Escalate</Button></div>
            </motion.div>
          ) : (
            <div className="rounded-xl border border-dashed border-border/30 bg-white/[0.01] p-8 text-center"><HeadphonesIcon className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" /><p className="text-sm text-muted-foreground">Select a case to view details</p></div>
          )}
        </div>
      </div>
    </div>
  );
}