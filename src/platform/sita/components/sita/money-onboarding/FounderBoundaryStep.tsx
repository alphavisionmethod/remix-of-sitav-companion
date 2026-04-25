import { Building2 } from "lucide-react";
import { SetupStageHeader } from "@/components/sita/setup/SetupStageHeader";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { MoneyOnboardingState } from "./types";

const BLUR_POINTS = [
  "Mixing personal and business purchases on one card",
  "Using personal account for business expenses",
  "Unclear owner draw amounts",
  "Missing reimbursement tracking",
  "Tax payments from wrong account",
  "No clear payroll schedule",
];

interface Props {
  founderSetup: MoneyOnboardingState["founderSetup"];
  onChange: (patch: Partial<MoneyOnboardingState["founderSetup"]>) => void;
  onToggleBlur: (point: string) => void;
  onContinue: () => void;
}

export function FounderBoundaryStep({ founderSetup, onChange, onToggleBlur, onContinue }: Props) {
  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      <SetupStageHeader title="Founder Boundary Setup" subtitle="Let's protect the line between personal and business money" icon={Building2} />

      <div className="space-y-3 rounded-xl border border-border bg-secondary/10 p-4">
        {(["businessAccounts", "ownerDraw", "payroll", "taxReserve", "reimbursements"] as const).map((k) => (
          <div key={k} className="flex items-center justify-between">
            <span className="text-sm text-foreground capitalize">{k.replace(/([A-Z])/g, " $1").trim()}?</span>
            <Switch checked={founderSetup[k]} onCheckedChange={(v) => onChange({ [k]: v })} />
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Where does personal/business money get blurry?</p>
        {BLUR_POINTS.map((bp) => {
          const active = founderSetup.blurPoints.includes(bp);
          return (
            <button
              key={bp}
              onClick={() => onToggleBlur(bp)}
              className={cn(
                "w-full rounded-lg border px-3 py-2 text-xs text-left transition-all",
                active ? "border-sita-gold/50 bg-sita-gold/8 text-foreground" : "border-border bg-secondary/20 text-muted-foreground hover:border-sita-gold/30"
              )}
            >
              {bp}
            </button>
          );
        })}
      </div>

      <button onClick={onContinue} className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
        Continue
      </button>
    </div>
  );
}
