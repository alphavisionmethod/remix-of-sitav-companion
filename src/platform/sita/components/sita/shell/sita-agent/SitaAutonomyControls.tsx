// ═══════════════════════════════════════════════════════════════
// SITA OS — Sita Autonomy Controls (Phase E)
// ═══════════════════════════════════════════════════════════════
// Three sliders (Business / Finance / Concierge) for L0–L4
// inside the Control Center.
// ═══════════════════════════════════════════════════════════════

import { useCallback } from "react";
import { Briefcase, Wallet, Sparkles } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/contexts/AuthContext";
import { useAutonomyTiers, type AutonomyTiers } from "@/lib/sita-agent";
import type { SitaAgentDomain } from "@/lib/sita-agent";

const TIER_LABELS: Record<number, string> = {
  0: "Manual",
  1: "Suggest",
  2: "Assist",
  3: "Execute",
  4: "Autopilot",
};

const ROWS: Array<{ key: keyof AutonomyTiers; icon: typeof Briefcase; label: string }> = [
  { key: "business", icon: Briefcase, label: "Business" },
  { key: "finance", icon: Wallet, label: "Finance" },
  { key: "concierge", icon: Sparkles, label: "Concierge" },
];

export function SitaAutonomyControls() {
  const { user } = useAuth();
  const { tiers, setTier } = useAutonomyTiers(user?.id);

  const onChange = useCallback((domain: SitaAgentDomain) => (vals: number[]) => {
    void setTier(domain, vals[0] ?? 1);
  }, [setTier]);

  return (
    <div className="rounded-xl border border-[hsl(0_0%_100%/0.05)] bg-[hsl(0_0%_100%/0.02)] p-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(0_0%_100%/0.5)]">
          Sita Autonomy
        </p>
        <span className="text-[10px] text-[hsl(0_0%_100%/0.35)]">L0 – L4</span>
      </div>
      {ROWS.map(({ key, icon: Icon, label }) => {
        const tier = tiers[key];
        return (
          <div key={key} className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-[hsl(0_0%_100%/0.75)]">
                <Icon className="h-3 w-3" /> {label}
              </span>
              <span className="font-mono text-[hsl(0_0%_100%/0.6)]">
                L{tier} · {TIER_LABELS[tier]}
              </span>
            </div>
            <Slider
              value={[tier]}
              min={0}
              max={4}
              step={1}
              onValueChange={onChange(key)}
              aria-label={`Sita autonomy tier for ${label}`}
            />
          </div>
        );
      })}
    </div>
  );
}