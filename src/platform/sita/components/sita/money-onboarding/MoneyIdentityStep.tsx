import { SetupStageHeader } from "@/platform/sita/components/sita/setup/SetupStageHeader";
import { Switch } from "@/components/ui/switch";
import { UserCircle } from "lucide-react";
import type { MoneyMode } from "./types";
import { cn } from "@/lib/utils";

const MODES: { key: MoneyMode; label: string }[] = [
  { key: "personal", label: "Personal" },
  { key: "founder", label: "Founder / Business-linked" },
  { key: "household", label: "Household / Shared" },
  { key: "hybrid", label: "Mixed / All of the above" },
];

interface Props {
  moneyMode: MoneyMode;
  includesBusiness: boolean;
  includesHousehold: boolean;
  onChange: (patch: Partial<{ moneyMode: MoneyMode; includesBusiness: boolean; includesHousehold: boolean }>) => void;
  onContinue: () => void;
}

export function MoneyIdentityStep({ moneyMode, includesBusiness, includesHousehold, onChange, onContinue }: Props) {
  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      <SetupStageHeader title="Money Identity" subtitle="How does your money life work?" icon={UserCircle} />

      <div className="space-y-2">
        {MODES.map((m) => (
          <button
            key={m.key}
            onClick={() => onChange({ moneyMode: m.key })}
            className={cn(
              "w-full rounded-xl border p-3.5 text-left text-sm transition-all",
              moneyMode === m.key
                ? "border-primary/50 bg-primary/8 font-semibold text-foreground"
                : "border-border bg-secondary/20 text-muted-foreground hover:border-primary/20"
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="space-y-3 rounded-xl border border-border bg-secondary/10 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground">Include business finances?</span>
          <Switch checked={includesBusiness} onCheckedChange={(v) => onChange({ includesBusiness: v })} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground">Manage money with a partner or household?</span>
          <Switch checked={includesHousehold} onCheckedChange={(v) => onChange({ includesHousehold: v })} />
        </div>
      </div>

      <button onClick={onContinue} className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
        Continue
      </button>
    </div>
  );
}
