import { Users } from "lucide-react";
import { SetupStageHeader } from "@/components/sita/setup/SetupStageHeader";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { MoneyOnboardingState } from "./types";

const VISIBILITY_OPTIONS: { key: MoneyOnboardingState["householdSetup"]["partnerVisibility"]; label: string; desc: string }[] = [
  { key: "full", label: "Full Transparency", desc: "Both partners see everything" },
  { key: "summary", label: "Summary Only", desc: "Partners see totals, not details" },
  { key: "private", label: "Private", desc: "Keep finances separate" },
];

interface Props {
  householdSetup: MoneyOnboardingState["householdSetup"];
  onChange: (patch: Partial<MoneyOnboardingState["householdSetup"]>) => void;
  onContinue: () => void;
}

export function HouseholdSharingStep({ householdSetup, onChange, onContinue }: Props) {
  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      <SetupStageHeader title="Household Sharing" subtitle="Configure how you share financial visibility with your household" icon={Users} />

      <div className="space-y-3 rounded-xl border border-border bg-secondary/10 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground">Shared accounts</span>
          <Switch checked={householdSetup.sharedAccounts} onCheckedChange={(v) => onChange({ sharedAccounts: v })} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground">Shared goals</span>
          <Switch checked={householdSetup.sharedGoals} onCheckedChange={(v) => onChange({ sharedGoals: v })} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground">Shared categories</span>
          <Switch checked={householdSetup.sharedCategories} onCheckedChange={(v) => onChange({ sharedCategories: v })} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground">Permission boundaries</span>
          <Switch checked={householdSetup.permissionBoundaries} onCheckedChange={(v) => onChange({ permissionBoundaries: v })} />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Partner visibility level</p>
        {VISIBILITY_OPTIONS.map((v) => (
          <button
            key={v.key}
            onClick={() => onChange({ partnerVisibility: v.key })}
            className={cn(
              "w-full rounded-xl border p-3 text-left transition-all",
              householdSetup.partnerVisibility === v.key
                ? "border-primary/50 bg-primary/8"
                : "border-border bg-secondary/20 hover:border-primary/20"
            )}
          >
            <p className="text-sm font-semibold text-foreground">{v.label}</p>
            <p className="text-xs text-muted-foreground">{v.desc}</p>
          </button>
        ))}
      </div>

      <button onClick={onContinue} className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
        Continue
      </button>
    </div>
  );
}
