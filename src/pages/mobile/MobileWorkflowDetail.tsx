// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Trusted Device: Workflow Detail
// ═══════════════════════════════════════════════════════════════

import { MobileShell } from "@/components/mobile/MobileShell";
import { useParams } from "react-router-dom";
import { CheckCircle2, Clock, ArrowRight, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const mockSteps = [
  { id: 1, label: "Intent parsed", status: "completed" as const, time: "2m ago", detail: "Domain: business, Type: action" },
  { id: 2, label: "Policy check passed", status: "completed" as const, time: "2m ago", detail: "truth-boundary: within scope" },
  { id: 3, label: "Advisor consulted", status: "completed" as const, time: "1m ago", detail: "business-advisor, confidence: 82%" },
  { id: 4, label: "Approval requested", status: "active" as const, time: "now", detail: "Single approval required from owner" },
  { id: 5, label: "Execution", status: "pending" as const, detail: "Awaiting approval" },
  { id: 6, label: "Receipt generated", status: "pending" as const, detail: "Will generate immutable receipt" },
];

const statusIcon = {
  completed: <CheckCircle2 className="h-4 w-4 text-[hsl(var(--trust-safe))]" />,
  active: <Clock className="h-4 w-4 text-primary animate-pulse" />,
  pending: <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />,
  failed: <AlertTriangle className="h-4 w-4 text-destructive" />,
};

const MobileWorkflowDetail = () => {
  const { id } = useParams();

  return (
    <MobileShell title={`Workflow ${id?.slice(0, 8) || ""}`}>
      <div className="rounded-xl border border-border/40 bg-card p-4 mb-4">
        <h2 className="text-sm font-semibold mb-1">Collections escalation — Invoice #892</h2>
        <p className="text-xs text-muted-foreground">Automated workflow triggered by overdue detection engine</p>
        <div className="flex gap-2 mt-2">
          <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">In Progress</span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-secondary text-secondary-foreground">business</span>
        </div>
      </div>

      {/* Step timeline */}
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Steps</h3>
      <div className="space-y-0">
        {mockSteps.map((step, i) => (
          <div key={step.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              {statusIcon[step.status]}
              {i < mockSteps.length - 1 && (
                <div className={cn(
                  "w-px flex-1 my-1",
                  step.status === "completed" ? "bg-[hsl(var(--trust-safe))]/40" : "bg-border"
                )} />
              )}
            </div>
            <div className="pb-4 min-w-0 flex-1">
              <p className={cn("text-sm", step.status === "active" ? "font-semibold text-primary" : "")}>{step.label}</p>
              <p className="text-[11px] text-muted-foreground">{step.detail}</p>
              {step.time && <p className="text-[10px] text-muted-foreground mt-0.5">{step.time}</p>}
            </div>
          </div>
        ))}
      </div>
    </MobileShell>
  );
};

export default MobileWorkflowDetail;
