import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Settings, Shield, Rocket, MessageSquare, DollarSign,
  BarChart3, RotateCcw, Eye, Save
} from "lucide-react";

interface Preferences {
  riskPreference: "conservative" | "balanced" | "aggressive";
  rolloutStyle: "canary-first" | "staged" | "immediate";
  explanationVerbosity: "summary" | "detailed" | "technical";
  aiSpendMode: "minimal" | "balanced" | "performance";
  dashboardEmphasis: "health" | "costs" | "releases" | "balanced";
}

const DEFAULT_PREFS: Preferences = {
  riskPreference: "conservative",
  rolloutStyle: "canary-first",
  explanationVerbosity: "summary",
  aiSpendMode: "balanced",
  dashboardEmphasis: "balanced",
};

function loadPrefs(): Preferences {
  try {
    const stored = sessionStorage.getItem("admin-learning-you");
    return stored ? { ...DEFAULT_PREFS, ...JSON.parse(stored) } : DEFAULT_PREFS;
  } catch { return DEFAULT_PREFS; }
}

function savePrefs(prefs: Preferences) {
  try { sessionStorage.setItem("admin-learning-you", JSON.stringify(prefs)); } catch {}
}

interface OptionGroupProps {
  label: string;
  icon: React.ElementType;
  description: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}

function OptionGroup({ label, icon: Icon, description, options, value, onChange }: OptionGroupProps) {
  return (
    <div className="p-3 rounded-lg border bg-white/[0.02] border-white/[0.06] space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-primary" />
        <div>
          <p className="text-xs font-medium text-foreground">{label}</p>
          <p className="text-[9px] text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              "px-2.5 py-1 rounded text-[10px] font-medium transition-colors border",
              value === opt.value
                ? "bg-primary/15 text-primary border-primary/30"
                : "bg-white/[0.02] text-muted-foreground border-white/[0.06] hover:bg-white/[0.06]"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function LearningYouPanel({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [prefs, setPrefs] = useState<Preferences>(loadPrefs);

  const updatePref = useCallback(<K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    setPrefs(prev => {
      const next = { ...prev, [key]: value };
      savePrefs(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setPrefs(DEFAULT_PREFS);
    savePrefs(DEFAULT_PREFS);
  }, []);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:max-w-[400px] bg-card/95 backdrop-blur-2xl border-border/30 overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2 text-foreground">
            <Settings className="h-5 w-5 text-primary" />
            Your Preferences
          </SheetTitle>
          <SheetDescription className="text-xs">
            The platform learns from your choices and adapts. All preferences are transparent, editable, and resettable.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4">
          <OptionGroup
            label="Risk Preference"
            icon={Shield}
            description="How cautious should the platform be with your actions?"
            options={[
              { value: "conservative", label: "Conservative" },
              { value: "balanced", label: "Balanced" },
              { value: "aggressive", label: "Aggressive" },
            ]}
            value={prefs.riskPreference}
            onChange={v => updatePref("riskPreference", v as Preferences["riskPreference"])}
          />

          <OptionGroup
            label="Rollout Style"
            icon={Rocket}
            description="How should new changes reach users?"
            options={[
              { value: "canary-first", label: "Canary First" },
              { value: "staged", label: "Staged" },
              { value: "immediate", label: "Immediate" },
            ]}
            value={prefs.rolloutStyle}
            onChange={v => updatePref("rolloutStyle", v as Preferences["rolloutStyle"])}
          />

          <OptionGroup
            label="Explanation Detail"
            icon={MessageSquare}
            description="How much detail do you want in explanations?"
            options={[
              { value: "summary", label: "Summary" },
              { value: "detailed", label: "Detailed" },
              { value: "technical", label: "Technical" },
            ]}
            value={prefs.explanationVerbosity}
            onChange={v => updatePref("explanationVerbosity", v as Preferences["explanationVerbosity"])}
          />

          <OptionGroup
            label="AI Spend Mode"
            icon={DollarSign}
            description="Balance between cost and AI quality"
            options={[
              { value: "minimal", label: "Minimal" },
              { value: "balanced", label: "Balanced" },
              { value: "performance", label: "Performance" },
            ]}
            value={prefs.aiSpendMode}
            onChange={v => updatePref("aiSpendMode", v as Preferences["aiSpendMode"])}
          />

          <OptionGroup
            label="Dashboard Emphasis"
            icon={BarChart3}
            description="Which area should the dashboard highlight most?"
            options={[
              { value: "health", label: "Health" },
              { value: "costs", label: "Costs" },
              { value: "releases", label: "Releases" },
              { value: "balanced", label: "Balanced" },
            ]}
            value={prefs.dashboardEmphasis}
            onChange={v => updatePref("dashboardEmphasis", v as Preferences["dashboardEmphasis"])}
          />

          <div className="pt-2 flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 text-xs flex-1" onClick={reset}>
              <RotateCcw className="h-3 w-3" /> Reset All
            </Button>
          </div>

          <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
            <div className="flex items-start gap-2">
              <Eye className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
              <p className="text-[10px] text-foreground/80 leading-relaxed">
                These preferences influence how the platform ranks suggestions, chooses default rollout modes,
                and adjusts explanation detail. They never silently narrow critical safety information.
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
