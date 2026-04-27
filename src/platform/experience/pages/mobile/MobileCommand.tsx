import { MobileShell } from "@/platform/experience/components/mobile/MobileShell";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal, Send, Clock, RotateCcw, Play, ShieldCheck, Zap,
  ChevronRight, AlertTriangle, CheckCircle2, XCircle, Sparkles,
  Bookmark, Search, Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

type CommandStatus = "success" | "pending" | "failed" | "simulated";

interface CommandEntry {
  id: string;
  text: string;
  status: CommandStatus;
  timestamp: string;
  riskLevel: "low" | "medium" | "high";
  result?: string;
  undoable?: boolean;
  domain: string;
}

interface CommandTemplate {
  id: string;
  label: string;
  command: string;
  icon: any;
  color: string;
}

const templates: CommandTemplate[] = [
  { id: "1", label: "Force Sync", command: "force sync all devices", icon: RotateCcw, color: "text-blue-400" },
  { id: "2", label: "Lock Device", command: "lock device primary-laptop", icon: ShieldCheck, color: "text-amber-400" },
  { id: "3", label: "Deploy Update", command: "deploy update v2.4.1 canary", icon: Zap, color: "text-emerald-400" },
  { id: "4", label: "Run Diagnostics", command: "run full diagnostics", icon: Play, color: "text-purple-400" },
];

const commandHistory: CommandEntry[] = [
  { id: "c1", text: "force sync all devices", status: "success", timestamp: "2 min ago", riskLevel: "low", result: "3 devices synced successfully", undoable: false, domain: "sync" },
  { id: "c2", text: "revoke trust for device tablet-02", status: "pending", timestamp: "5 min ago", riskLevel: "high", result: "Awaiting approval", undoable: true, domain: "security" },
  { id: "c3", text: "deploy update v2.4.0 to canary group", status: "success", timestamp: "1 hr ago", riskLevel: "medium", result: "Deployed to 12 devices, 0 rollbacks", undoable: true, domain: "updates" },
  { id: "c4", text: "pause background sync for 30 minutes", status: "success", timestamp: "3 hr ago", riskLevel: "low", result: "Sync paused until 14:30", undoable: true, domain: "sync" },
  { id: "c5", text: "wipe device lost-phone-01", status: "failed", timestamp: "1 day ago", riskLevel: "high", result: "Device offline — queued for execution", undoable: false, domain: "security" },
  { id: "c6", text: "optimize storage on all endpoints", status: "simulated", timestamp: "1 day ago", riskLevel: "medium", result: "Simulation: would free 14.2 GB across 4 devices", undoable: false, domain: "storage" },
];

const statusConfig: Record<CommandStatus, { icon: any; color: string; label: string }> = {
  success: { icon: CheckCircle2, color: "text-emerald-400", label: "Completed" },
  pending: { icon: Clock, color: "text-amber-400", label: "Pending" },
  failed: { icon: XCircle, color: "text-red-400", label: "Failed" },
  simulated: { icon: Sparkles, color: "text-purple-400", label: "Simulated" },
};

const riskColors: Record<string, string> = {
  low: "bg-emerald-500/15 text-emerald-400",
  medium: "bg-amber-500/15 text-amber-400",
  high: "bg-red-500/15 text-red-400",
};

const MobileCommand = () => {
  const [input, setInput] = useState("");
  const [tab, setTab] = useState<"history" | "templates" | "saved">("history");
  const [filter, setFilter] = useState<CommandStatus | "all">("all");
  const [showSimPreview, setShowSimPreview] = useState(false);

  const filtered = filter === "all"
    ? commandHistory
    : commandHistory.filter((c) => c.status === filter);

  const handleSend = () => {
    if (!input.trim()) return;
    const isRisky = input.toLowerCase().includes("wipe") || input.toLowerCase().includes("revoke") || input.toLowerCase().includes("delete");
    if (isRisky) {
      setShowSimPreview(true);
    } else {
      setInput("");
    }
  };

  return (
    <MobileShell title="Command Center">
      <div className="mb-2"><PageTruthBanner truthState="partial" /></div>
      {/* Command Input */}
      <div className="relative mb-4">
        <div className="flex items-center gap-2 rounded-xl border border-border/40 bg-card p-2">
          <Terminal className="h-4 w-4 text-primary shrink-0 ml-1" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a command or ask anything..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            onClick={handleSend}
            className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors"
          >
            <Send className="h-3.5 w-3.5 text-primary" />
          </button>
        </div>
      </div>

      {/* Simulation Preview Modal */}
      <AnimatePresence>
        {showSimPreview && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-semibold text-amber-400">Simulation Preview</span>
            </div>
            <p className="text-xs text-muted-foreground mb-1">
              Command: <span className="text-foreground font-mono">{input}</span>
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              This is a <span className="text-red-400 font-semibold">high-risk</span> action. A simulation will run first to preview impact before execution.
            </p>
            <div className="rounded-lg border border-border/40 bg-card/50 p-3 mb-3">
              <p className="text-[11px] text-muted-foreground mb-1">Estimated Impact</p>
              <p className="text-xs text-foreground">• 1 device affected</p>
              <p className="text-xs text-foreground">• All local data will be erased</p>
              <p className="text-xs text-foreground">• Action requires founder approval</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setShowSimPreview(false); setInput(""); }}
                className="flex-1 py-2 rounded-lg border border-border/40 text-xs font-medium hover:bg-muted/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowSimPreview(false); setInput(""); }}
                className="flex-1 py-2 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-medium hover:bg-amber-500/30 transition-colors"
              >
                Run Simulation
              </button>
              <button
                onClick={() => { setShowSimPreview(false); setInput(""); }}
                className="flex-1 py-2 rounded-lg bg-primary/20 text-primary text-xs font-medium hover:bg-primary/30 transition-colors"
              >
                Execute
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-1 mb-4">
        {(["history", "templates", "saved"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors capitalize",
              tab === t ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* History Tab */}
      {tab === "history" && (
        <>
          {/* Status Filters */}
          <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
            {(["all", "success", "pending", "failed", "simulated"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition-colors capitalize",
                  filter === f ? "bg-card border border-primary/30 text-primary" : "text-muted-foreground border border-transparent"
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <AnimatePresence>
              {filtered.map((cmd, i) => {
                const sc = statusConfig[cmd.status];
                const StatusIcon = sc.icon;
                return (
                  <motion.div
                    key={cmd.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="rounded-xl border border-border/40 bg-card p-3"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={cn("mt-0.5", sc.color)}>
                        <StatusIcon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono text-foreground truncate">{cmd.text}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={cn("text-[9px] font-medium px-1.5 py-0.5 rounded-full", riskColors[cmd.riskLevel])}>
                            {cmd.riskLevel} risk
                          </span>
                          <span className="text-[10px] text-muted-foreground">{cmd.domain}</span>
                          <span className="text-[10px] text-muted-foreground">· {cmd.timestamp}</span>
                        </div>
                        {cmd.result && (
                          <p className="text-[11px] text-muted-foreground mt-1.5">{cmd.result}</p>
                        )}
                      </div>
                      {cmd.undoable && (
                        <button className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors" title="Undo">
                          <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </>
      )}

      {/* Templates Tab */}
      {tab === "templates" && (
        <div className="grid grid-cols-2 gap-2">
          {templates.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setInput(t.command)}
                className="flex flex-col items-center gap-2 rounded-xl border border-border/40 bg-card p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="h-10 w-10 rounded-xl bg-card/80 border border-border/40 flex items-center justify-center">
                  <Icon className={cn("h-5 w-5", t.color)} />
                </div>
                <span className="text-[11px] font-medium text-foreground">{t.label}</span>
                <span className="text-[9px] text-muted-foreground font-mono truncate w-full text-center">{t.command}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Saved Tab */}
      {tab === "saved" && (
        <div className="space-y-2">
          {[
            { label: "Morning Sync Routine", cmd: "force sync all && run diagnostics", saved: "3 days ago" },
            { label: "Lock All Mobile", cmd: "lock device type:mobile", saved: "1 week ago" },
            { label: "Pre-Deploy Check", cmd: "simulate deploy latest && verify health", saved: "2 weeks ago" },
          ].map((s, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setInput(s.cmd)}
              className="w-full flex items-center gap-3 rounded-xl border border-border/40 bg-card p-3 hover:bg-muted/50 transition-colors text-left"
            >
              <Bookmark className="h-4 w-4 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium">{s.label}</p>
                <p className="text-[10px] text-muted-foreground font-mono truncate">{s.cmd}</p>
              </div>
              <span className="text-[9px] text-muted-foreground whitespace-nowrap">{s.saved}</span>
            </motion.button>
          ))}
        </div>
      )}
    </MobileShell>
  );
};

export default MobileCommand;
