// ═══════════════════════════════════════════════════════════════
// SITA OS — Setup Step: Build the Operating Model
// Conversational, card-based world learning with live visualization
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock, Users, Briefcase, DollarSign, Sliders, ChevronRight, ChevronLeft, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  operatingMode: string;
  onNext: (model: OperatingModelData) => void;
  onBack: () => void;
  step: number;
  total: number;
}

export interface OperatingModelData {
  routines: string[];
  household: string[];
  work: string[];
  finances: string[];
  preferences: string[];
}

const SECTIONS = [
  {
    id: "routines",
    icon: Clock,
    title: "My Routines",
    desc: "Help SITA understand your daily rhythm",
    chips: ["Morning routine", "School runs", "Exercise schedule", "Commute", "Evening wind-down", "Recurring meetings", "Weekend patterns"],
  },
  {
    id: "household",
    icon: Users,
    title: "My Household",
    desc: "Who and what SITA should coordinate around",
    chips: ["Partner / Spouse", "Children", "Extended family", "Shared calendar", "Grocery management", "Household maintenance", "Pets / care routines"],
  },
  {
    id: "work",
    icon: Briefcase,
    title: "My Work",
    desc: "How you operate professionally",
    chips: ["Founder / CEO", "Service business", "Team of 1-5", "Team of 6-20", "Team of 20+", "Client follow-up pain", "Lead tracking", "Revenue tracking"],
  },
  {
    id: "finances",
    icon: DollarSign,
    title: "My Finances",
    desc: "What financial visibility matters most",
    chips: ["Budget management", "Bill reminders", "Savings goals", "Subscription tracking", "Invoice management", "Tax planning", "Investment oversight"],
  },
  {
    id: "preferences",
    icon: Sliders,
    title: "How I Like to Work",
    desc: "Communication and interaction preferences",
    chips: ["Short summaries", "Detailed guidance", "Suggestions first", "Strong reminders", "Calm notifications", "Morning briefings", "End-of-day reviews"],
  },
];

const fadeIn = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };

export function SetupOperatingModel({ operatingMode, onNext, onBack, step, total }: Props) {
  const [sectionIdx, setSectionIdx] = useState(0);
  const [selections, setSelections] = useState<Record<string, string[]>>({
    routines: [], household: [], work: [], finances: [], preferences: [],
  });

  const section = SECTIONS[sectionIdx];
  const isLast = sectionIdx === SECTIONS.length - 1;

  const toggleChip = (chip: string) => {
    setSelections(prev => {
      const key = section.id;
      const current = prev[key];
      return { ...prev, [key]: current.includes(chip) ? current.filter(c => c !== chip) : [...current, chip] };
    });
  };

  const totalSelected = Object.values(selections).flat().length;

  const handleContinue = () => {
    if (isLast) {
      onNext(selections as unknown as OperatingModelData);
    } else {
      setSectionIdx(i => i + 1);
    }
  };

  const handleSectionBack = () => {
    if (sectionIdx > 0) setSectionIdx(i => i - 1);
    else onBack();
  };

  return (
    <motion.div {...fadeIn} transition={{ duration: 0.5 }} className="w-full max-w-4xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12">
      {/* Left — Interactive cards */}
      <div className="flex-1 min-w-0">
        <StepBar step={step} total={total} />

        <motion.h2 {...fadeIn} transition={{ delay: 0.1 }}
          className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mb-2">
          Help SITA understand your world
        </motion.h2>
        <motion.p {...fadeIn} transition={{ delay: 0.15 }}
          className="text-sm text-muted-foreground mb-8">
          A few quick choices will help SITA organize around what matters most to you.
        </motion.p>

        {/* Section tabs */}
        <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1">
          {SECTIONS.map((s, i) => (
            <button key={s.id} onClick={() => setSectionIdx(i)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                i === sectionIdx ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground",
                selections[s.id].length > 0 && i !== sectionIdx && "text-foreground"
              )}>
              <s.icon className="h-3 w-3" />
              {s.title.replace("My ", "")}
              {selections[s.id].length > 0 && (
                <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary/20 text-[10px] text-primary">
                  {selections[s.id].length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Active section */}
        <AnimatePresence mode="wait">
          <motion.div key={section.id}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl border border-border/30 bg-card/40 p-6"
            style={{ backdropFilter: "blur(8px)" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <section.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{section.title}</p>
                <p className="text-xs text-muted-foreground">{section.desc}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {section.chips.map(chip => {
                const isSelected = selections[section.id].includes(chip);
                return (
                  <button key={chip} onClick={() => toggleChip(chip)}
                    className={cn(
                      "rounded-xl border px-4 py-2 text-sm transition-all duration-200",
                      isSelected
                        ? "border-primary/40 bg-primary/10 text-foreground font-medium"
                        : "border-border/30 bg-secondary/20 text-muted-foreground hover:border-border hover:text-foreground"
                    )}>
                    {isSelected && <Check className="inline h-3 w-3 mr-1.5 text-primary" />}
                    {chip}
                  </button>
                );
              })}
            </div>

            <p className="text-[11px] text-muted-foreground/60 mt-4">Select all that apply, or skip to continue.</p>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between pt-6">
          <button onClick={handleSectionBack}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            <ChevronLeft className="h-3.5 w-3.5" /> Back
          </button>
          <button onClick={handleContinue}
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all flex items-center gap-2">
            {isLast ? "Continue" : "Next section"} <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Right — Live environment map */}
      <motion.div {...fadeIn} transition={{ delay: 0.3 }} className="lg:w-72 shrink-0 hidden lg:block">
        <div className="rounded-2xl border border-border/30 bg-card/60 p-6 sticky top-8" style={{ backdropFilter: "blur(12px)" }}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Your Operating Map</p>

          <div className="space-y-4">
            {SECTIONS.map(s => {
              const count = selections[s.id].length;
              return (
                <div key={s.id} className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                    count > 0 ? "bg-primary/15" : "bg-secondary/30"
                  )}>
                    <s.icon className={cn("h-3.5 w-3.5", count > 0 ? "text-primary" : "text-muted-foreground/40")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-xs font-medium", count > 0 ? "text-foreground" : "text-muted-foreground/50")}>
                      {s.title.replace("My ", "")}
                    </p>
                    <div className="h-1 w-full rounded-full bg-secondary/40 mt-1">
                      <motion.div
                        className="h-full rounded-full bg-primary/60"
                        animate={{ width: `${Math.min(100, (count / s.chips.length) * 100)}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-border/20">
            <p className="text-xs text-muted-foreground">
              <span className="text-foreground font-semibold">{totalSelected}</span> signals configured
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StepBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className={cn("h-1 flex-1 rounded-full transition-all duration-500",
          i < step ? "bg-primary" : i === step ? "bg-primary/60" : "bg-muted")} />
      ))}
    </div>
  );
}
