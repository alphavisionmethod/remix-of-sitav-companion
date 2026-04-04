import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe, Clock, Users, Briefcase, DollarSign, MessageSquare, Target,
  ChevronRight, ChevronDown, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
}

const CHAPTERS = [
  { id: "routines", icon: Clock, title: "My Life & Routines", desc: "Daily rhythm and patterns" },
  { id: "household", icon: Users, title: "My Household", desc: "Who SITA coordinates around" },
  { id: "work", icon: Briefcase, title: "My Work or Business", desc: "Professional context" },
  { id: "money", icon: DollarSign, title: "My Money Priorities", desc: "Financial visibility" },
  { id: "communication", icon: MessageSquare, title: "My Communication Style", desc: "How you interact" },
  { id: "goals", icon: Target, title: "My Goals & Stress Points", desc: "What matters most" },
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

const spring = { type: "spring" as const, damping: 28, stiffness: 280 };

export function DeepWorldModelingStep({ data, onUpdate, onNext, onPrev }: Props) {
  const [openChapter, setOpenChapter] = useState<string>("routines");

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

  const completedCount = CHAPTERS.filter(c => chapterComplete(c.id)).length;
  const canAdvance = completedCount >= 1;

  const toggleChip = (path: string, value: string) => {
    const [section, field] = path.split(".");
    const current = (data as any)[section][field] as string[];
    const updated = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
    onUpdate({ ...data, [section]: { ...(data as any)[section], [field]: updated } });
  };

  const setField = (path: string, value: any) => {
    const [section, field] = path.split(".");
    onUpdate({ ...data, [section]: { ...(data as any)[section], [field]: value } });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      transition={spring} className="w-full max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">

      <div className="flex-1 min-w-0">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20">
            <Globe className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">Help SITA understand your world</h2>
            <p className="text-sm text-muted-foreground">We'll use this to shape your environment, advisors, and first workflows</p>
          </div>
        </motion.div>

        <div className="space-y-2">
          {CHAPTERS.map((ch, i) => {
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

        <div className="flex items-center justify-between pt-6">
          <button onClick={onPrev} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Back</button>
          <button onClick={onNext} disabled={!canAdvance}
            className={cn("rounded-xl px-6 py-2.5 text-sm font-semibold transition-all flex items-center gap-2",
              canAdvance ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed")}>
            Continue <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Right — World Model Viz */}
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, ...spring }}
        className="lg:w-72 shrink-0 hidden lg:block">
        <div className="rounded-2xl border border-border/30 bg-card/60 p-6 sticky top-8" style={{ backdropFilter: "blur(12px)" }}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">World Model</p>
          <div className="space-y-3">
            {CHAPTERS.map(ch => {
              const done = chapterComplete(ch.id);
              return (
                <div key={ch.id} className="flex items-center gap-3">
                  <motion.div animate={{ scale: done ? 1.05 : 1 }}
                    className={cn("flex h-8 w-8 items-center justify-center rounded-lg",
                      done ? "bg-[hsl(var(--trust-safe))]/15" : "bg-secondary/30")}>
                    {done ? <Check className="h-3.5 w-3.5 text-[hsl(var(--trust-safe))]" /> : <ch.icon className="h-3.5 w-3.5 text-muted-foreground/40" />}
                  </motion.div>
                  <span className={cn("text-xs", done ? "text-foreground font-medium" : "text-muted-foreground/50")}>
                    {ch.title.replace("My ", "")}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-6 pt-4 border-t border-border/20">
            <p className="text-xs text-muted-foreground">
              <span className="text-foreground font-semibold">{completedCount}/6</span> chapters mapped
            </p>
          </div>
        </div>
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
