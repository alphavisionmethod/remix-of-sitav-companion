import React, { useState } from "react";
import { CalendarHeart, CheckSquare, MapPin, LayoutDashboard, Brain, ArrowUpRight, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { DomainAdvisorBoard } from "@/components/sita/domain-shared/DomainAdvisorBoard";
import { useBoardroomBridge } from "@/hooks/useBoardroomBridge";

const MODULES = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "calendar", label: "Calendar", icon: CalendarHeart },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "errands", label: "Errands", icon: MapPin },
  { id: "advisors", label: "Advisors", icon: Brain },
  { id: "boardroom", label: "Boardroom", icon: ArrowUpRight },
];

const severityColors: Record<string, string> = {
  high: "text-[hsl(var(--destructive))]",
  medium: "text-[hsl(var(--sita-gold))]",
  low: "text-[hsl(var(--trust-safe))]",
  critical: "text-[hsl(var(--destructive))]",
};

function BoardroomStatusStrip({ pendingCount, decisionCount }: { pendingCount: number; decisionCount: number }) {
  if (pendingCount === 0 && decisionCount === 0) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-2 mt-2 rounded-lg border border-[hsl(280_50%_50%/0.15)] bg-[hsl(280_40%_50%/0.04)] px-3 py-2 flex items-center gap-3"
    >
      <Brain size={12} className="text-[hsl(280_50%_65%)] shrink-0" />
      <div className="flex items-center gap-3 text-[10px]">
        {pendingCount > 0 && (
          <span className="text-[hsl(var(--sita-gold))]">
            {pendingCount} item{pendingCount > 1 ? "s" : ""} in Boardroom
          </span>
        )}
        {decisionCount > 0 && (
          <span className="text-[hsl(var(--trust-safe))]">
            {decisionCount} decision{decisionCount > 1 ? "s" : ""} awaiting action
          </span>
        )}
      </div>
    </motion.div>
  );
}

function DomainBoardroomView({ domain }: { domain: "business" | "finance" | "concierge" }) {
  const { escalations, decisions, escalate, isDemoMode } = useBoardroomBridge(domain);

  return (
    <div className="space-y-4 p-4">
      <button
        onClick={() => escalate({
          title: `New ${domain} issue — requires strategic review`,
          description: `Escalated from ${domain} app for Boardroom assessment.`,
          domain,
          severity: "medium",
          advisorSummaries: { system: "Escalated by user" },
          escalationReason: "Manual escalation from domain app",
        })}
        className="w-full rounded-xl border border-[hsl(280_50%_50%/0.2)] bg-[hsl(280_40%_50%/0.06)] p-3 flex items-center justify-center gap-2 text-[12px] font-semibold text-[hsl(280_50%_70%)] hover:bg-[hsl(280_40%_50%/0.12)] transition-colors"
      >
        <ArrowUpRight size={14} /> Escalate New Issue to Boardroom
      </button>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(0_0%_100%/0.35)] mb-2">
          Items in Boardroom {isDemoMode && <span className="text-[8px] text-[hsl(0_0%_100%/0.2)]">(demo)</span>}
        </p>
        <div className="space-y-1.5">
          {escalations.map((item: any) => (
            <div key={item.id} className="rounded-lg border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle size={11} className={severityColors[item.severity] || "text-[hsl(0_0%_100%/0.4)]"} />
                <span className="text-[9px] font-bold uppercase text-[hsl(0_0%_100%/0.35)]">{item.severity}</span>
                <span className="text-[9px] text-[hsl(0_0%_100%/0.25)] ml-auto flex items-center gap-1">
                  <Clock size={8} /> {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-[12px] font-medium text-[hsl(0_0%_100%/0.8)]">{item.title}</p>
            </div>
          ))}
          {escalations.length === 0 && <p className="text-[11px] text-[hsl(0_0%_100%/0.25)] text-center py-4">No items in Boardroom</p>}
        </div>
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(0_0%_100%/0.35)] mb-2">Decisions from Boardroom</p>
        <div className="space-y-1.5">
          {decisions.map((dec: any) => (
            <div key={dec.id} className="rounded-lg border border-[hsl(var(--trust-safe))]/15 bg-[hsl(var(--trust-safe))]/5 p-3">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle size={11} className="text-[hsl(var(--trust-safe))]" />
                <span className="text-[9px] font-bold text-[hsl(var(--trust-safe))]">APPROVED</span>
              </div>
              <p className="text-[12px] font-medium text-[hsl(0_0%_100%/0.8)]">{dec.summary}</p>
            </div>
          ))}
          {decisions.length === 0 && <p className="text-[11px] text-[hsl(0_0%_100%/0.25)] text-center py-4">No pending decisions</p>}
        </div>
      </div>
    </div>
  );
}

export function ConciergeAppShell() {
  const [activeModule, setActiveModule] = useState("overview");
  const { pendingCount, decisionCount } = useBoardroomBridge("concierge");

  return (
    <div className="flex h-full w-full bg-[hsl(220_15%_6%)]">
      <div className="w-[200px] shrink-0 border-r border-[hsl(0_0%_100%/0.06)] bg-[hsl(220_15%_5%)] flex flex-col py-4 px-2 gap-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(0_0%_100%/0.35)] px-3 mb-3">
          Concierge
        </p>
        {MODULES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveModule(item.id)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 outline-none text-left relative",
              activeModule === item.id
                ? "bg-[hsl(270_60%_50%/0.1)] text-[hsl(270_60%_70%)] border border-[hsl(270_60%_50%/0.2)] shadow-[inset_3px_0_0_hsl(270_60%_55%)]"
                : "text-[hsl(0_0%_100%/0.5)] hover:bg-[hsl(0_0%_100%/0.05)] hover:text-[hsl(0_0%_100%/0.8)] border border-transparent"
            )}
          >
            <item.icon size={16} />
            {item.label}
            {item.id === "boardroom" && pendingCount > 0 && (
              <span className="ml-auto w-5 h-5 rounded-full bg-[hsl(280_50%_55%)] text-white text-[9px] font-bold flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-11 shrink-0 border-b border-[hsl(0_0%_100%/0.06)] flex items-center px-5 bg-[hsl(220_15%_6%/0.8)]">
          <span className="text-sm font-semibold text-[hsl(0_0%_100%/0.7)]">
            {MODULES.find((m) => m.id === activeModule)?.label}
          </span>
        </div>

        <BoardroomStatusStrip pendingCount={pendingCount} decisionCount={decisionCount} />

        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeModule === "advisors" ? (
              <motion.div key="advisors" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4">
                <DomainAdvisorBoard domain="concierge" />
              </motion.div>
            ) : activeModule === "boardroom" ? (
              <motion.div key="boardroom" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <DomainBoardroomView domain="concierge" />
              </motion.div>
            ) : (
              <motion.div key={activeModule} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex items-center justify-center p-6 min-h-[300px]">
                <div className="text-[hsl(0_0%_100%/0.2)] uppercase tracking-[0.2em] text-lg font-medium select-none">
                  {activeModule.toUpperCase()} DATA CANVAS
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
