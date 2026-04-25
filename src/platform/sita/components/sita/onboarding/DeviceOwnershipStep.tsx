import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Users, Building2, Shield, Lock, Eye, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { SetupStageHeader, StageTransitionController } from "@/platform/sita/components/sita/setup";

type OwnershipType = "personal" | "family" | "work";

const OPTIONS: { key: OwnershipType; icon: typeof User; title: string; desc: string; impacts: { privacy: string; sharing: string; trust: string; recs: string } }[] = [
  {
    key: "personal", icon: User, title: "Personal device",
    desc: "This device belongs to you — a single-owner environment with full privacy.",
    impacts: {
      privacy: "Private-by-default — everything is yours alone",
      sharing: "No shared access — single owner trust model",
      trust: "Strong personal personalization, maximum autonomy",
      recs: "Personalization, automation, proactive suggestions",
    },
  },
  {
    key: "family", icon: Users, title: "Family or shared device",
    desc: "Multiple people will use this device with their own spaces and boundaries.",
    impacts: {
      privacy: "Shared/private separation — each person has boundaries",
      sharing: "Multiple profile readiness — household surfaces",
      trust: "Balanced trust with per-user preferences",
      recs: "Household coordination, shared calendars, family budgets",
    },
  },
  {
    key: "work", icon: Building2, title: "Work or managed device",
    desc: "Used for professional work — may follow organization policies.",
    impacts: {
      privacy: "Organization-aware policies apply",
      sharing: "Managed enrollment path available",
      trust: "Professional workflow emphasis, compliance-first",
      recs: "CRM, invoicing, project management, team tools",
    },
  },
];

interface Props {
  selected: OwnershipType | "";
  onSelect: (type: OwnershipType) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function DeviceOwnershipStep({ selected, onSelect, onNext, onPrev }: Props) {
  const [showImpact, setShowImpact] = useState(false);
  const activeOption = OPTIONS.find(o => o.key === selected);

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-2xl mx-auto">
      <div className="rounded-2xl border border-border bg-card shadow-2xl shadow-primary/5 overflow-hidden">
        <div className="p-8 pb-0">
          <SetupStageHeader
            icon={Shield}
            title="How will this device be used?"
            subtitle="This helps SITA choose the right privacy, sharing, and support model from the start"
            align="left"
          />
        </div>

        <div className="p-8 pt-6">
          <div className="flex gap-6">
            {/* Left: Options */}
            <div className="flex-1 space-y-3">
              {OPTIONS.map((opt, i) => (
                <motion.button key={opt.key} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => onSelect(opt.key)}
                  className={cn("w-full relative rounded-xl border p-4 text-left transition-all duration-200 group",
                    selected === opt.key
                      ? "border-primary/50 bg-primary/8 shadow-sm shadow-primary/10"
                      : "border-border bg-secondary/20 hover:border-primary/20 hover:bg-secondary/40"
                  )}>
                  <div className="flex items-start gap-3">
                    <div className={cn("rounded-lg p-2.5 transition-colors",
                      selected === opt.key ? "bg-primary/15" : "bg-secondary")}>
                      <opt.icon className={cn("h-5 w-5", selected === opt.key ? "text-primary" : "text-muted-foreground")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{opt.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                    </div>
                    {selected === opt.key && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </motion.div>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Right: Impact preview */}
            <div className="w-52 shrink-0 hidden md:block">
              <AnimatePresence mode="wait">
                {activeOption && (
                  <motion.div key={activeOption.key} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }} className="space-y-4">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Selection impact</p>
                    {[
                      { icon: Lock, label: "Privacy model", value: activeOption.impacts.privacy },
                      { icon: Users, label: "Sharing model", value: activeOption.impacts.sharing },
                      { icon: Shield, label: "Trust model", value: activeOption.impacts.trust },
                      { icon: Eye, label: "Recommendations", value: activeOption.impacts.recs },
                    ].map((impact, i) => (
                      <motion.div key={impact.label} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }} className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <impact.icon className="h-3 w-3 text-primary" />
                          <span className="text-[10px] font-medium text-foreground">{impact.label}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed pl-[18px]">{impact.value}</p>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              {!activeOption && (
                <p className="text-xs text-muted-foreground italic">Select an option to see how it shapes your environment</p>
              )}
            </div>
            </div>

            {/* Mobile impact panel (toggled by "Learn what this changes") */}
            {showImpact && activeOption && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="md:hidden space-y-3 pt-3 border-t border-border mt-3">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Selection impact</p>
                {[
                  { icon: Lock, label: "Privacy model", value: activeOption.impacts.privacy },
                  { icon: Users, label: "Sharing model", value: activeOption.impacts.sharing },
                  { icon: Shield, label: "Trust model", value: activeOption.impacts.trust },
                  { icon: Eye, label: "Recommendations", value: activeOption.impacts.recs },
                ].map((impact, i) => (
                  <div key={impact.label} className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <impact.icon className="h-3 w-3 text-primary" />
                      <span className="text-[10px] font-medium text-foreground">{impact.label}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed pl-[18px]">{impact.value}</p>
                  </div>
                ))}
              </motion.div>
            )}
          {/* Navigation */}
          <StageTransitionController
            onPrev={onPrev}
            onNext={onNext}
            canAdvance={!!selected}
            extra={
              selected ? (
                <button onClick={() => setShowImpact(prev => !prev)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline md:hidden">
                  Learn what this changes
                </button>
              ) : undefined
            }
          />
        </div>
      </div>
    </motion.div>
  );
}
