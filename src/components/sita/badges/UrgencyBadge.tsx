import { BadgeBase } from "./BadgeBase";

type Urgency = "critical" | "high" | "normal" | "low";

const STYLES: Record<Urgency, { bg: string; text: string; dot: string }> = {
  critical: { bg: "hsl(0 70% 55% / 0.12)", text: "hsl(0 70% 55%)", dot: "bg-[hsl(0_70%_55%)] animate-pulse" },
  high:     { bg: "hsl(38 85% 58% / 0.12)", text: "hsl(38 85% 58%)", dot: "bg-[hsl(38_85%_58%)]" },
  normal:   { bg: "hsl(210 60% 50% / 0.12)", text: "hsl(210 60% 50%)", dot: "bg-[hsl(210_60%_50%)]" },
  low:      { bg: "hsl(0 0% 50% / 0.12)", text: "hsl(0 0% 60%)", dot: "bg-[hsl(0_0%_50%)]" },
};

export function UrgencyBadge({ urgency = "normal", className }: { urgency?: Urgency; className?: string }) {
  const s = STYLES[urgency];
  return (
    <BadgeBase bg={s.bg} text={s.text} className={className}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
    </BadgeBase>
  );
}
