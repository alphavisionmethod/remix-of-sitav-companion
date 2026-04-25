import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe, Clock, Users, Briefcase, DollarSign, MessageSquare, Target,
  ChevronRight, ChevronDown, Check, Heart, Brain, Zap, Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { SetupStageHeader, StageTransitionController } from "@/components/sita/setup";

export interface WorldModelData {
  routines: { morningType: number; weekday: string[]; weekend: string[] };
  household: { size: string; responsibilities: string[] };
  work: { industry: string[]; teamSize: string; tools: string[] };
  money: { savingSpending: number; goals: string[] };
  communication: { responseTime: number; channels: string[] };
  goals: { topGoals: string[]; stressPoints: string[] };
}

interface Props {
  data: WorldModelData;
  onUpdate: (data: WorldModelData) => void;
  onNext: () => void;
  onPrev: () => void;
  setupStyle?: "express" | "guided" | "advanced";
  relevantDomains?: string[];
  toneContext?: { isOverwhelmed: boolean; copyDensity: "light" | "standard" | "rich"; toneClass: "calm" | "neutral" | "energetic" };
}

const CHAPTERS = [
  { id: "routines", icon: Clock, title: "My Life & Routines", desc: "Daily rhythm and patterns", color: "text-primary" },
  { id: "household", icon: Users, title: "My Household", desc: "Who SITA coordinates around", color: "text-[hsl(var(--trust-safe))]" },
  { id: "work", icon: Briefcase, title: "My Work or Business", desc: "Professional context", color: "text-[hsl(var(--sita-gold))]" },
  { id: "money", icon: DollarSign, title: "My Money Priorities", desc: "Financial visibility", color: "text-[hsl(38,85%,58%)]" },
  { id: "communication", icon: MessageSquare, title: "My Communication Style", desc: "How you interact", color: "text-primary" },
  { id: "goals", icon: Target, title: "My Goals & Stress Points", desc: "What matters most", color: "text-[hsl(345,65%,55%)]" },
];

const WEEKDAY_CHIPS = ["Office / studio", "Remote work", "Hybrid", "Meetings-heavy", "Deep focus", "Client-facing", "Field work"];
const WEEKEND_CHIPS = ["Family time", "Errands & chores", "Rest & recovery", "Side projects", "Social plans", "Exercise", "Meal prep"];
const HOUSEHOLD_SIZES = ["Just me", "2 people", "3-4 people", "5+ people"];
const RESPONSIBILITIES = ["Cooking", "Groceries", "Cleaning", "Childcare", "Finances", "Maintenance", "School runs", "Pet care"];
const INDUSTRIES = ["Tech / SaaS", "Professional services", "Real estate", "Healthcare", "Finance", "Retail / E-commerce", "Creative", "Education", "Other"];
const TEAM_SIZES = ["Solo", "2-5", "6-20", "20+"];
const TOOLS = ["Email", "Slack", "Google Workspace", "Microsoft 365", "Notion", "Asana", "QuickBooks", "Xero", "Salesforce", "HubSpot"];
const FINANCIAL_GOALS = ["Debt free", "Emergency fund", "Investing", "Budgeting", "Tax planning", "Retirement", "Education fund"];
const CHANNELS = ["Email", "Text / SMS", "Phone calls", "Slack / Teams", "In-person", "Video calls"];
const TOP_GOALS = ["Grow revenue", "Save more", "Better work-life balance", "Automate admin", "Delegate more", "Health & wellness", "Family time", "Career growth"];
const STRESS_POINTS = ["Too many tasks", "Cash flow pressure", "Missed deadlines", "Information overload", "Decision fatigue", "Admin burden", "Context switching"];

// Advisor suggestions derived from world model
const ADVISOR_SUGGESTIONS: { condition: (d: WorldModelData) => boolean; name: string; icon: typeof Brain; reason: string }[] = [
  { condition: d => d.work.industry.length > 0, name: "Business Advisor", icon: Briefcase, reason: "Industry context detected" },
  { condition: d => d.money.goals.length > 0, name: "Money Advisor", icon: DollarSign, reason: "Financial goals set" },
  { condition: d => d.household.size !== "" && d.household.size !== "Just me", name: "Family Advisor", icon: Users, reason: "Household members found" },
  { condition: d => d.goals.topGoals.includes("Health & wellness"), name: "Wellness Advisor", icon: Heart, reason: "Wellness goal selected" },
  { condition: d => d.goals.stressPoints.length >= 2, name: "Productivity Advisor", icon: Zap, reason: "Multiple stressors identified" },
];

const spring = { type: "spring" as const, damping: 28, stiffness: 280 };

export function DeepWorldModelingStep({ data, onUpdate, onNext, onPrev, setupStyle = "guided", relevantDomains, toneContext }: Props) {
  // Domain filtering: express → most relevant only, guided → relevant, advanced → all
  const visibleChapters = useMemo(() => {
    if (setupStyle === "advanced" || !relevantDomains) return CHAPTERS;
    if (setupStyle === "express") {
      // Show routines + goals always, plus the single most relevant domain chapter
      const domainToChapter: Record<string, string> = {
        household: "household", family: "household", home: "household",
        business: "work", work: "work", clients: "work", team: "work",
        money: "money", bills: "money", spending: "money",
        communications: "communication", messages: "communication", email: "communication",
      };
      const relevantChapterIds = new Set(["routines", "goals"]);
      for (const d of relevantDomains) {
        const chId = domainToChapter[d];
        if (chId) { relevantChapterIds.add(chId); break; } // only first match for express
      }
      return CHAPTERS.filter(ch => relevantChapterIds.has(ch.id));
    }
    // guided — show routines, goals, + all relevant domain chapters
    const domainToChapter: Record<string, string> = {
      household: "household", family: "household", home: "household",
      business: "work", work: "work", clients: "work", team: "work",
      money: "money", bills: "money", spending: "money",
      communications: "communication", messages: "communication", email: "communication",
    };
    const relevantChapterIds = new Set(["routines", "goals"]);
    for (const d of relevantDomains) {
      const chId = domainToChapter[d];
      if (chId) relevantChapterIds.add(chId);
    }
    return CHAPTERS.filter(ch => relevantChapterIds.has(ch.id));
  }, [setupStyle, relevantDomains]);

  const [openChapter, setOpenChapter] = useState<string>(visibleChapters[0]?.id ?? "routines");

  const chapterComplete = (id: string): boolean => {
    switch (id) {
      case "routines": return data.routines.weekday.length > 0 || data.routines.weekend.length > 0;
      case "household": return data.household.size !== "" || data.household.responsibilities.length > 0;
      case "work": return data.work.industry.length > 0 || data.work.teamSize !== "";
      case "money": return data.money.goals.length > 0;
      case "communication": return data.communication.channels.length > 0;
      case "goals": return data.goals.topGoals.length > 0 || data.goals.stressPoints.length > 0;
      default: return false;
    }
  };

  const completedCount = visibleChapters.filter(c => chapterComplete(c.id)).length;
  const canAdvance = completedCount >= 1;

  const toggleChip = (path: string, value: string) => {
    const [section, field] = path.split(".");
    const sectionData = (data as unknown as Record<string, Record<string, string[]>>)[section];
    const current = sectionData[field] as string[];
    const updated = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
    onUpdate({ ...data, [section]: { ...sectionData, [field]: updated } });
  };

  const setField = (path: string, value: unknown) => {
    const [section, field] = path.split(".");
    const sectionData = (data as unknown as Record<string, Record<string, unknown>>)[section];
    onUpdate({ ...data, [section]: { ...sectionData, [field]: value } });
  };

  // Derived advisor matches
  const matchedAdvisors = ADVISOR_SUGGESTIONS.filter(a => a.condition(data));

  // World model completeness as a percentage per domain
  const domainScores = CHAPTERS.map(ch => ({
    id: ch.id,
    icon: ch.icon,
    title: ch.title.replace("My ", ""),
    color: ch.color,
    complete: chapterComplete(ch.id),
    depth: (() => {
      switch (ch.id) {
        case "routines": return Math.min(100, (data.routines.weekday.length + data.routines.weekend.length) * 12);
        case "household": return Math.min(100, (data.household.size ? 30 : 0) + data.household.responsibilities.length * 10);
        case "work": return Math.min(100, data.work.industry.length * 15 + (data.work.teamSize ? 20 : 0) + data.work.tools.length * 8);
        case "money": return Math.min(100, data.money.goals.length * 15 + 10);
        case "communication": return Math.min(100, data.communication.channels.length * 15 + 10);
        case "goals": return Math.min(100, data.goals.topGoals.length * 20 + data.goals.stressPoints.length * 10);
        default: return 0;
      }
    })(),
  }));

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      transition={spring} className="w-full max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">

      <div className="flex-1 min-w-0">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <SetupStageHeader
            icon={Globe}
            title={toneContext?.copyDensity === "light" ? "Tell SITA what matters" : "Help SITA understand your world"}
            subtitle={toneContext?.copyDensity === "light" ? "Just the essentials — skip anything that doesn't apply" : "We'll use this to shape your environment, advisors, and first workflows"}
            align="left"
          />
        </motion.div>

        <div className="space-y-2">
          {visibleChapters.map((ch, i) => {
            const isOpen = openChapter === ch.id;
            const isDone = chapterComplete(ch.id);
            return (
              <motion.div key={ch.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, ...spring }}
                className={cn("rounded-2xl border transition-all", isOpen ? "border-primary/30 bg-card" : "border-border/30 bg-card/40")}>
                <button onClick={() => setOpenChapter(isOpen ? "" : ch.id)}
                  className="w-full flex items-center gap-3 p-4 text-left">
                  <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl",
                    isDone ? "bg-[hsl(var(--trust-safe))]/15" : isOpen ? "bg-primary/15" : "bg-secondary/40")}>
                    {isDone ? <Check className="h-4 w-4 text-[hsl(var(--trust-safe))]" /> : <ch.icon className={cn("h-4 w-4", isOpen ? "text-primary" : "text-muted-foreground")} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{ch.title}</p>
                    <p className="text-xs text-muted-foreground">{ch.desc}</p>
                  </div>
                  {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                      <div className="px-4 pb-4 space-y-4">
                        {ch.id === "routines" && (
                          <>
                            <div>
                              <label className="text-xs font-semibold text-muted-foreground mb-2 block">Morning type</label>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-muted-foreground">🌅 Early</span>
                                <input type="range" min={0} max={100} value={data.routines.morningType}
                                  onChange={e => setField("routines.morningType", Number(e.target.value))}
                                  className="flex-1 accent-primary h-1" />
                                <span className="text-xs text-muted-foreground">🌙 Night</span>
                              </div>
                            </div>
                            <ChipGroup label="Weekday structure" chips={WEEKDAY_CHIPS} selected={data.routines.weekday}
                              onToggle={v => toggleChip("routines.weekday", v)} />
                            <ChipGroup label="Weekend priorities" chips={WEEKEND_CHIPS} selected={data.routines.weekend}
                              onToggle={v => toggleChip("routines.weekend", v)} />
                          </>
                        )}
                        {ch.id === "household" && (
                          <>
                            <div>
                              <label className="text-xs font-semibold text-muted-foreground mb-2 block">Household size</label>
                              <div className="flex flex-wrap gap-2">
                                {HOUSEHOLD_SIZES.map(s => (
                                  <button key={s} onClick={() => setField("household.size", s)}
                                    className={cn("rounded-xl border px-4 py-2 text-sm transition-all",
                                      data.household.size === s ? "border-primary/40 bg-primary/10 text-foreground font-medium" : "border-border/30 bg-secondary/20 text-muted-foreground hover:text-foreground")}>
                                    {s}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <ChipGroup label="Shared responsibilities" chips={RESPONSIBILITIES} selected={data.household.responsibilities}
                              onToggle={v => toggleChip("household.responsibilities", v)} />
                          </>
                        )}
                        {ch.id === "work" && (
                          <>
                            <ChipGroup label="Industry" chips={INDUSTRIES} selected={data.work.industry}
                              onToggle={v => toggleChip("work.industry", v)} />
                            <div>
                              <label className="text-xs font-semibold text-muted-foreground mb-2 block">Team size</label>
                              <div className="flex flex-wrap gap-2">
                                {TEAM_SIZES.map(s => (
                                  <button key={s} onClick={() => setField("work.teamSize", s)}
                                    className={cn("rounded-xl border px-4 py-2 text-sm transition-all",
                                      data.work.teamSize === s ? "border-primary/40 bg-primary/10 text-foreground font-medium" : "border-border/30 bg-secondary/20 text-muted-foreground hover:text-foreground")}>
                                    {s}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <ChipGroup label="Primary tools" chips={TOOLS} selected={data.work.tools}
                              onToggle={v => toggleChip("work.tools", v)} />
                          </>
                        )}
                        {ch.id === "money" && (
                          <>
                            <p className="text-[10px] text-muted-foreground/60 italic mb-2">This is private — skip if you prefer.</p>
                            <div>
                              <label className="text-xs font-semibold text-muted-foreground mb-2 block">Financial posture</label>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-muted-foreground">💰 Saving</span>
                                <input type="range" min={0} max={100} value={data.money.savingSpending}
                                  onChange={e => setField("money.savingSpending", Number(e.target.value))}
                                  className="flex-1 accent-primary h-1" />
                                <span className="text-xs text-muted-foreground">💳 Spending</span>
                              </div>
                            </div>
                            <ChipGroup label="Financial goals" chips={FINANCIAL_GOALS} selected={data.money.goals}
                              onToggle={v => toggleChip("money.goals", v)} />
                          </>
                        )}
                        {ch.id === "communication" && (
                          <>
                            <div>
                              <label className="text-xs font-semibold text-muted-foreground mb-2 block">Response time preference</label>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-muted-foreground">⚡ Instant</span>
                                <input type="range" min={0} max={100} value={data.communication.responseTime}
                                  onChange={e => setField("communication.responseTime", Number(e.target.value))}
                                  className="flex-1 accent-primary h-1" />
                                <span className="text-xs text-muted-foreground">🕐 Batched</span>
                              </div>
                            </div>
                            <ChipGroup label="Preferred channels" chips={CHANNELS} selected={data.communication.channels}
                              onToggle={v => toggleChip("communication.channels", v)} />
                          </>
                        )}
                        {ch.id === "goals" && (
                          <>
                            <ChipGroup label="Top goals (pick up to 3)" chips={TOP_GOALS} selected={data.goals.topGoals}
                              onToggle={v => {
                                if (data.goals.topGoals.includes(v)) toggleChip("goals.topGoals", v);
                                else if (data.goals.topGoals.length < 3) toggleChip("goals.topGoals", v);
                              }} />
                            <ChipGroup label="Stress indicators" chips={STRESS_POINTS} selected={data.goals.stressPoints}
                              onToggle={v => toggleChip("goals.stressPoints", v)} />
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        <StageTransitionController
          onPrev={onPrev}
          onNext={onNext}
          canAdvance={canAdvance}
        />
      </div>

      {/* Right — Animated World Model */}
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, ...spring }}
        className="lg:w-80 shrink-0 hidden lg:block space-y-4">
        
        {/* Domain Depth Visualization */}
        <div className="rounded-2xl border border-border/30 bg-card/60 p-6 sticky top-8" style={{ backdropFilter: "blur(12px)" }}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">World Model</p>
          <div className="space-y-3">
            {domainScores.map(ds => (
              <motion.div key={ds.id} layout layoutId={`domain-${ds.id}`}
                className="flex items-center gap-3">
                <motion.div animate={{ scale: ds.complete ? 1.05 : 1 }}
                  className={cn("flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                    ds.complete ? "bg-[hsl(var(--trust-safe))]/15" : "bg-secondary/30")}>
                  {ds.complete ? <Check className="h-3.5 w-3.5 text-[hsl(var(--trust-safe))]" /> : <ds.icon className="h-3.5 w-3.5 text-muted-foreground/40" />}
                </motion.div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-xs font-medium", ds.complete ? "text-foreground" : "text-muted-foreground/50")}>
                    {ds.title}
                  </p>
                  <div className="h-1.5 w-full rounded-full bg-secondary/40 mt-1 overflow-hidden">
                    <motion.div className="h-full rounded-full bg-primary/60"
                      animate={{ width: `${ds.depth}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-border/20">
            <p className="text-xs text-muted-foreground">
              <span className="text-foreground font-semibold">{completedCount}/6</span> chapters mapped
            </p>
          </div>
        </div>

        {/* Advisor Matches */}
        <AnimatePresence>
          {matchedAdvisors.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="rounded-2xl border border-border/30 bg-card/60 p-5" style={{ backdropFilter: "blur(12px)" }}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Suggested Advisors</p>
              <div className="space-y-2">
                {matchedAdvisors.map((adv, i) => (
                  <motion.div key={adv.name} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }} layout layoutId={`advisor-${adv.name}`}
                    className="flex items-center gap-2.5 rounded-xl bg-primary/[0.06] border border-primary/10 p-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15">
                      <adv.icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] font-semibold text-foreground">{adv.name}</p>
                      <p className="text-[10px] text-muted-foreground">{adv.reason}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Calendar Rhythm Preview */}
        <AnimatePresence>
          {(data.routines.weekday.length > 0 || data.routines.weekend.length > 0) && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="rounded-2xl border border-border/30 bg-card/60 p-5" style={{ backdropFilter: "blur(12px)" }}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Calendar Rhythm</p>
              <div className="flex gap-1">
                {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => {
                  const isWeekend = i >= 5;
                  const hasActivity = isWeekend ? data.routines.weekend.length > 0 : data.routines.weekday.length > 0;
                  const intensity = hasActivity ? (isWeekend ? data.routines.weekend.length : data.routines.weekday.length) : 0;
                  return (
                    <motion.div key={i} animate={{ opacity: hasActivity ? 1 : 0.3 }}
                      className="flex-1 text-center">
                      <p className="text-[9px] text-muted-foreground mb-1">{day}</p>
                      <motion.div animate={{ height: Math.max(8, intensity * 6) }}
                        className={cn("w-full rounded-sm", hasActivity ? "bg-primary/40" : "bg-secondary/30")} />
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

function ChipGroup({ label, chips, selected, onToggle }: {
  label: string; chips: string[]; selected: string[]; onToggle: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground mb-2 block">{label}</label>
      <div className="flex flex-wrap gap-2">
        {chips.map(chip => (
          <button key={chip} onClick={() => onToggle(chip)}
            className={cn("rounded-xl border px-3 py-1.5 text-xs transition-all",
              selected.includes(chip) ? "border-primary/40 bg-primary/10 text-foreground font-medium" : "border-border/30 bg-secondary/20 text-muted-foreground hover:text-foreground")}>
            {selected.includes(chip) && <Check className="inline h-2.5 w-2.5 mr-1 text-primary" />}
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}
