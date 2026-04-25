import { BadgeBase } from "./BadgeBase";

type ExecutionState = "drafted" | "approved" | "executing" | "complete" | "failed";

const STYLES: Record<ExecutionState, { bg: string; text: string; label: string }> = {
  drafted:   { bg: "hsl(0 0% 50% / 0.12)", text: "hsl(0 0% 60%)", label: "Drafted" },
  approved:  { bg: "hsl(210 60% 50% / 0.12)", text: "hsl(210 60% 50%)", label: "Approved" },
  executing: { bg: "hsl(265 55% 58% / 0.12)", text: "hsl(265 55% 58%)", label: "Executing" },
  complete:  { bg: "hsl(152 55% 48% / 0.12)", text: "hsl(152 55% 48%)", label: "Complete" },
  failed:    { bg: "hsl(0 70% 55% / 0.12)", text: "hsl(0 70% 55%)", label: "Failed" },
};

export function ExecutionBadge({ state = "drafted", className }: { state?: ExecutionState; className?: string }) {
  const s = STYLES[state];
  return <BadgeBase bg={s.bg} text={s.text} className={className}>{s.label}</BadgeBase>;
}
