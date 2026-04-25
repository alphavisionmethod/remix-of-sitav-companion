import { BadgeBase } from "./BadgeBase";

type Mode = "demo" | "live" | "sandbox";

const STYLES: Record<Mode, { bg: string; text: string }> = {
  demo:    { bg: "hsl(38 85% 58% / 0.12)", text: "hsl(38 85% 58%)" },
  live:    { bg: "hsl(152 55% 48% / 0.12)", text: "hsl(152 55% 48%)" },
  sandbox: { bg: "hsl(0 0% 50% / 0.12)", text: "hsl(0 0% 60%)" },
};

export function ModeBadge({ mode = "demo", className }: { mode?: Mode; className?: string }) {
  const s = STYLES[mode];
  return <BadgeBase bg={s.bg} text={s.text} className={className}>{mode.toUpperCase()}</BadgeBase>;
}
