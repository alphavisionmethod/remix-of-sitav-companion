/**
 * SITA OS — Budget Ceiling Notice
 * Premium calm copy when a per-user AI ceiling is hit.
 * Designed to feel governed, not broken.
 *
 * Class: USER-FACING SAFETY COPY (Economic Governance closure).
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Clock } from "lucide-react";

export interface BudgetCeilingNoticeProps {
  /** "daily_cost" | "monthly_cost" | "daily_calls" | undefined */
  capKind?: "daily_cost" | "monthly_cost" | "daily_calls" | null;
  /** ISO timestamp when the cap resets. */
  resetsAt?: string | null;
  /** Current percentage of cap used (0-100+). */
  currentPct?: number | null;
  /** Optional secondary message from the gateway. */
  detail?: string;
}

function describeCap(kind: BudgetCeilingNoticeProps["capKind"]): string {
  switch (kind) {
    case "daily_cost": return "today's AI workspace allowance";
    case "monthly_cost": return "this month's AI workspace allowance";
    case "daily_calls": return "today's AI request count";
    default: return "your AI workspace allowance";
  }
}

function formatReset(iso?: string | null): string {
  if (!iso) return "shortly";
  try {
    const d = new Date(iso);
    const diffMs = d.getTime() - Date.now();
    if (diffMs < 0) return "shortly";
    const diffH = Math.round(diffMs / 3_600_000);
    if (diffH < 1) {
      const diffM = Math.max(1, Math.round(diffMs / 60_000));
      return `in ~${diffM} minute${diffM === 1 ? "" : "s"}`;
    }
    if (diffH < 24) return `in ~${diffH} hour${diffH === 1 ? "" : "s"}`;
    const diffD = Math.round(diffH / 24);
    return `in ~${diffD} day${diffD === 1 ? "" : "s"}`;
  } catch {
    return "shortly";
  }
}

export function BudgetCeilingNotice({ capKind, resetsAt, currentPct, detail }: BudgetCeilingNoticeProps) {
  return (
    <Card className="border-amber-500/30 bg-amber-500/5">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
          <ShieldCheck className="h-4 w-4 text-amber-500" aria-hidden="true" />
          AI workspace allowance reached
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className="text-muted-foreground">
          You've used {describeCap(capKind)}
          {typeof currentPct === "number" ? ` (${Math.min(999, Math.round(currentPct))}% of cap)` : ""}.
          New requests resume <span className="text-foreground font-medium">{formatReset(resetsAt)}</span>.
        </p>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" aria-hidden="true" />
          This is a governed limit — your data, history, and settings are unaffected.
        </p>
        {detail ? (
          <p className="text-xs text-muted-foreground/80 italic">{detail}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default BudgetCeilingNotice;
