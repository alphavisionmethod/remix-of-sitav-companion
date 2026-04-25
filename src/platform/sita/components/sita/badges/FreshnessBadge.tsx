import { BadgeBase } from "./BadgeBase";
import { Clock, RefreshCw, AlertTriangle } from "lucide-react";

type Freshness = "fresh" | "aging" | "stale" | "expired";

const STYLES: Record<Freshness, { bg: string; text: string; icon: typeof Clock }> = {
  fresh:   { bg: "hsl(152 55% 48% / 0.12)", text: "hsl(152 55% 48%)", icon: Clock },
  aging:   { bg: "hsl(210 60% 50% / 0.12)", text: "hsl(210 60% 50%)", icon: Clock },
  stale:   { bg: "hsl(38 85% 58% / 0.12)",  text: "hsl(38 85% 58%)",  icon: RefreshCw },
  expired: { bg: "hsl(0 70% 55% / 0.12)",   text: "hsl(0 70% 55%)",   icon: AlertTriangle },
};

export function FreshnessBadge({ freshness = "fresh", label, className }: { freshness?: Freshness; label?: string; className?: string }) {
  const s = STYLES[freshness];
  const Icon = s.icon;
  return (
    <BadgeBase bg={s.bg} text={s.text} className={className}>
      <Icon className="h-2.5 w-2.5" />
      {label || freshness}
    </BadgeBase>
  );
}
