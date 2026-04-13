import { BadgeBase } from "./BadgeBase";
import { Shield } from "lucide-react";

type TrustLevel = "verified" | "pending" | "unverified";

const STYLES: Record<TrustLevel, { bg: string; text: string; border: string; label: string }> = {
  verified:   { bg: "hsl(152 55% 48% / 0.12)", text: "hsl(152 55% 48%)", border: "hsl(152 55% 48% / 0.20)", label: "Verified" },
  pending:    { bg: "hsl(38 85% 58% / 0.12)",  text: "hsl(38 85% 58%)",  border: "hsl(38 85% 58% / 0.20)",  label: "Pending" },
  unverified: { bg: "hsl(0 70% 55% / 0.12)",   text: "hsl(0 70% 55%)",   border: "hsl(0 70% 55% / 0.20)",   label: "Unverified" },
};

export function TrustBadge({ level = "verified", className }: { level?: TrustLevel; className?: string }) {
  const s = STYLES[level];
  return (
    <BadgeBase bg={s.bg} text={s.text} border={s.border} className={className}>
      <Shield className="h-2.5 w-2.5" />
      {s.label}
    </BadgeBase>
  );
}
