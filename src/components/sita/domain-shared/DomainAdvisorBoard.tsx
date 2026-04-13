// ═══════════════════════════════════════════════════════════════
// SITA OS — Domain Advisor Board
// Reusable advisor board with Roundtable, Ask One, Synthesis modes
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { getAdvisorRoster, type AdvisorRole } from "@/lib/advisor-topology";
import { Users, MessageCircle, Sparkles } from "lucide-react";

type BoardMode = "roundtable" | "ask-one" | "synthesis";

interface DomainAdvisorBoardProps {
  domain: string;
  className?: string;
}

function AdvisorSeat({ advisor, selected, onClick }: { advisor: AdvisorRole; selected: boolean; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-200",
        selected
          ? "border-[hsl(265_55%_58%/0.4)] bg-[hsl(265_55%_58%/0.08)]"
          : "border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] hover:bg-[hsl(0_0%_100%/0.04)]"
      )}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
        style={{ background: `${advisor.accentColor}20` }}
      >
        {advisor.emoji}
      </div>
      <div className="text-center">
        <p className="text-[11px] font-medium text-foreground leading-tight">{advisor.name}</p>
        <p className="text-[9px] text-muted-foreground">{advisor.role}</p>
      </div>
    </motion.button>
  );
}

function RoundtableView({ advisors }: { advisors: AdvisorRole[] }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {advisors.map((advisor) => (
          <motion.div
            key={advisor.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)]"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{advisor.emoji}</span>
              <div>
                <p className="text-[11px] font-semibold text-foreground">{advisor.name}</p>
                <p className="text-[9px] text-muted-foreground">{advisor.role}</p>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground/80 italic">
              "{advisor.specialty}"
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function AskOneView({ advisors }: { advisors: AdvisorRole[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const selectedAdvisor = advisors.find(a => a.id === selected);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {advisors.map((advisor) => (
          <AdvisorSeat
            key={advisor.id}
            advisor={advisor}
            selected={selected === advisor.id}
            onClick={() => setSelected(selected === advisor.id ? null : advisor.id)}
          />
        ))}
      </div>
      <AnimatePresence mode="wait">
        {selectedAdvisor && (
          <motion.div
            key={selectedAdvisor.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="p-4 rounded-xl border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.03)]"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ background: `${selectedAdvisor.accentColor}15` }}
              >
                {selectedAdvisor.emoji}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{selectedAdvisor.name}</p>
                <p className="text-xs text-muted-foreground">{selectedAdvisor.role}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground/80">Specialty:</span> {selectedAdvisor.specialty}
            </p>
            <p className="text-[10px] text-muted-foreground/60 mt-2 italic">
              Connect real data sources to receive personalized insights from this advisor.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SynthesisView({ advisors, domain }: { advisors: AdvisorRole[]; domain: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-5 rounded-xl border border-[hsl(265_55%_58%/0.15)] bg-gradient-to-br from-[hsl(265_55%_58%/0.04)] to-[hsl(38_85%_58%/0.02)]"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(265_55%_58%)] to-[hsl(38_85%_58%)] flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-[hsl(0_0%_100%/0.95)]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Board Synthesis</p>
          <p className="text-[10px] text-muted-foreground">{advisors.length} advisors • Combined analysis</p>
        </div>
      </div>
      <div className="space-y-2">
        {advisors.map((advisor) => (
          <div key={advisor.id} className="flex items-center gap-2 text-[11px]">
            <span>{advisor.emoji}</span>
            <span className="text-muted-foreground">{advisor.name}:</span>
            <span className="text-foreground/70 italic truncate">{advisor.specialty.split(",")[0]}</span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground/60 mt-4 italic">
        Connect data sources for the board to generate a unified strategic recommendation.
      </p>
    </motion.div>
  );
}

export function DomainAdvisorBoard({ domain, className }: DomainAdvisorBoardProps) {
  const [mode, setMode] = useState<BoardMode>("roundtable");
  const roster = getAdvisorRoster(domain);

  const modes: { key: BoardMode; label: string; icon: typeof Users }[] = [
    { key: "roundtable", label: "Roundtable", icon: Users },
    { key: "ask-one", label: "Ask One", icon: MessageCircle },
    { key: "synthesis", label: "Synthesis", icon: Sparkles },
  ];

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{roster.label}</h3>
          <p className="text-[10px] text-muted-foreground">{roster.advisors.length} specialized advisors</p>
        </div>
        <div className="flex gap-1 p-0.5 rounded-lg bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.06)]">
          {modes.map(m => {
            const Icon = m.icon;
            return (
              <button
                key={m.key}
                onClick={() => setMode(m.key)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-medium transition-all duration-150",
                  mode === m.key
                    ? "bg-[hsl(265_55%_58%/0.15)] text-foreground"
                    : "text-muted-foreground hover:text-foreground/80"
                )}
              >
                <Icon className="h-3 w-3" />
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={mode} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}>
          {mode === "roundtable" && <RoundtableView advisors={roster.advisors} />}
          {mode === "ask-one" && <AskOneView advisors={roster.advisors} />}
          {mode === "synthesis" && <SynthesisView advisors={roster.advisors} domain={domain} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
