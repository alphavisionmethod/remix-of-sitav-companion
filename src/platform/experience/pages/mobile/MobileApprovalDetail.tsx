// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Trusted Device: Approval Detail
// ═══════════════════════════════════════════════════════════════

import { MobileShell } from "@/platform/experience/components/mobile/MobileShell";
import { useParams, useNavigate } from "react-router-dom";
import { ShieldCheck, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const MobileApprovalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">("pending");

  const handleApprove = () => {
    setStatus("approved");
    setTimeout(() => navigate("/mobile/approvals"), 1500);
  };

  const handleReject = () => {
    setStatus("rejected");
    setTimeout(() => navigate("/mobile/approvals"), 1500);
  };

  if (status !== "pending") {
    return (
      <MobileShell title="Approval">
      <div className="mb-2"><PageTruthBanner truthState="partial" /></div>
<div className="flex flex-col items-center justify-center py-16">
          {status === "approved" ? (
            <CheckCircle2 className="h-16 w-16 text-[hsl(var(--trust-safe))] mb-4" />
          ) : (
            <XCircle className="h-16 w-16 text-destructive mb-4" />
          )}
          <h2 className="text-lg font-semibold capitalize">{status}</h2>
          <p className="text-sm text-muted-foreground mt-1">Redirecting to approvals…</p>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell title="Review Approval">
      {/* Header */}
      <div className="rounded-xl border border-border/40 bg-card p-4 mb-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h2 className="text-sm font-semibold">Payment to vendor — Atlas Corp</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Wire transfer $12,500 for Q2 consulting retainer. Requested by revenue-autopilot engine.
            </p>
          </div>
        </div>
      </div>

      {/* Evidence */}
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Evidence</h3>
      <div className="space-y-2 mb-4">
        {[
          { label: "Amount", value: "$12,500.00" },
          { label: "Vendor", value: "Atlas Corp — verified supplier" },
          { label: "Contract", value: "Q2 Consulting Retainer (signed)" },
          { label: "Budget Impact", value: "Within Q2 discretionary budget" },
          { label: "Policy Check", value: "✓ Passed — under $25K threshold" },
          { label: "Advisor Confidence", value: "88%" },
        ].map((row) => (
          <div key={row.label} className="flex justify-between items-start px-4 py-2.5 rounded-lg bg-card border border-border/20">
            <span className="text-xs text-muted-foreground">{row.label}</span>
            <span className="text-xs font-medium">{row.value}</span>
          </div>
        ))}
      </div>

      {/* Risk assessment */}
      <div className="rounded-xl border border-[hsl(var(--trust-review))]/30 bg-[hsl(var(--trust-review))]/5 p-3 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle className="h-3.5 w-3.5 text-[hsl(var(--trust-review))]" />
          <span className="text-xs font-medium text-[hsl(var(--trust-review))]">Risk Note</span>
        </div>
        <p className="text-xs text-muted-foreground">
          This is a recurring payment. Previous 3 quarters approved without issue. No anomalies detected.
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleReject}
          variant="outline"
          className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10"
        >
          <XCircle className="h-4 w-4 mr-1" />
          Reject
        </Button>
        <Button
          onClick={handleApprove}
          className="flex-1"
        >
          <CheckCircle2 className="h-4 w-4 mr-1" />
          Approve
        </Button>
      </div>
    </MobileShell>
  );
};

export default MobileApprovalDetail;
