// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Autonomy Panel
// Per-advisor trust controls: Watch / Suggest / Auto-pilot
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Eye, Sparkles, Zap, Shield, ChevronDown, ChevronUp, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdvisorAvatar } from "@/components/sita/primitives/AdvisorAvatar";
import { toast } from "sonner";

type AutonomyLevel = "watch" | "suggest" | "autopilot";

interface AdvisorConfig {
  id: string;
  name: string;
  domain: "business" | "finance" | "concierge";
  level: AutonomyLevel;
  threshold: number; // $ threshold for auto-execution
}

const STORAGE_KEY = "sita-advisor-autonomy";

const DEFAULT_ADVISORS: AdvisorConfig[] = [
  { id: "biz", name: "Business Advisor", domain: "business", level: "suggest", threshold: 500 },
  { id: "fin", name: "Money Advisor", domain: "finance", level: "suggest", threshold: 200 },
  { id: "life", name: "Life Advisor", domain: "concierge", level: "suggest", threshold: 100 },
];

const LEVELS: { id: AutonomyLevel; label: string; icon: React.ElementType; desc: string; color: string }[] = [
  { id: "watch", label: "Watch", icon: Eye, desc: "Observes only, never interrupts", color: "bg-muted text-muted-foreground" },
  { id: "suggest", label: "Suggest", icon: Sparkles, desc: "Proactively recommends actions", color: "bg-primary/10 text-primary" },
  { id: "autopilot", label: "Auto-pilot", icon: Zap, desc: "Executes within policy limits", color: "bg-[hsl(var(--sita-gold))]/10 text-[hsl(var(--sita-gold))]" },
];

function loadConfig(): AdvisorConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_ADVISORS;
  } catch { return DEFAULT_ADVISORS; }
}

export const AdvisorAutonomyPanel = ({ className }: { className?: string }) => {
  const [advisors, setAdvisors] = useState<AdvisorConfig[]>(loadConfig);
  const [expanded, setExpanded] = useState<string | null>(null);

  const updateLevel = useCallback((id: string, level: AutonomyLevel) => {
    setAdvisors(prev => {
      const next = prev.map(a => a.id === id ? { ...a, level } : a);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    toast.success(`Advisor autonomy updated to ${level}`);
  }, []);

  const updateThreshold = useCallback((id: string, threshold: number) => {
    setAdvisors(prev => {
      const next = prev.map(a => a.id === id ? { ...a, threshold } : a);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Advisor Autonomy</h3>
      </div>
      <p className="text-xs text-muted-foreground">Control how much each advisor can do independently</p>

      <div className="space-y-2">
        {advisors.map(advisor => {
          const isExpanded = expanded === advisor.id;
          const currentLevel = LEVELS.find(l => l.id === advisor.level)!;
          return (
            <motion.div
              key={advisor.id}
              layout
              className="rounded-xl border border-border bg-card p-3 space-y-2"
            >
              <button
                onClick={() => setExpanded(isExpanded ? null : advisor.id)}
                className="flex items-center gap-3 w-full"
              >
                <AdvisorAvatar domain={advisor.domain === "finance" ? "money" : advisor.domain} size="sm" />
                <div className="flex-1 text-left">
                  <p className="text-xs font-semibold text-foreground">{advisor.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-semibold", currentLevel.color)}>
                      {currentLevel.label}
                    </span>
                    {advisor.level === "autopilot" && (
                      <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                        <DollarSign className="h-2.5 w-2.5" />up to ${advisor.threshold}
                      </span>
                    )}
                  </div>
                </div>
                {isExpanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
              </button>

              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-2 pt-2 border-t border-border/50"
                >
                  {/* Level selector */}
                  <div className="grid grid-cols-3 gap-1.5">
                    {LEVELS.map(level => {
                      const Icon = level.icon;
                      const active = advisor.level === level.id;
                      return (
                        <button
                          key={level.id}
                          onClick={() => updateLevel(advisor.id, level.id)}
                          className={cn(
                            "rounded-lg p-2 text-center transition-all border",
                            active ? "border-primary/30 bg-primary/5" : "border-transparent hover:bg-secondary/50"
                          )}
                        >
                          <Icon className={cn("h-4 w-4 mx-auto", active ? "text-primary" : "text-muted-foreground")} />
                          <p className={cn("text-[10px] font-semibold mt-1", active ? "text-primary" : "text-muted-foreground")}>{level.label}</p>
                          <p className="text-[8px] text-muted-foreground mt-0.5">{level.desc}</p>
                        </button>
                      );
                    })}
                  </div>

                  {/* Threshold (autopilot only) */}
                  {advisor.level === "autopilot" && (
                    <div className="rounded-lg bg-secondary/30 p-2">
                      <label className="text-[10px] text-muted-foreground">Auto-execute threshold</label>
                      <div className="flex items-center gap-2 mt-1">
                        <DollarSign className="h-3 w-3 text-muted-foreground" />
                        <input
                          type="range"
                          min={50}
                          max={5000}
                          step={50}
                          value={advisor.threshold}
                          onChange={e => updateThreshold(advisor.id, Number(e.target.value))}
                          className="flex-1 accent-primary h-1"
                        />
                        <span className="text-xs font-semibold text-foreground w-14 text-right">${advisor.threshold}</span>
                      </div>
                      <p className="text-[9px] text-muted-foreground mt-1">Actions above this amount require your approval</p>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
