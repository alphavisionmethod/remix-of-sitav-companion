// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Trusted Device: Receipt Detail
// ═══════════════════════════════════════════════════════════════

import { MobileShell } from "@/platform/experience/components/mobile/MobileShell";
import { useParams } from "react-router-dom";
import { CheckCircle2, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const MobileReceiptDetail = () => {
  const { id } = useParams();
  const [copied, setCopied] = useState(false);
  const hash = "a3f8c1d9e2b4567890abcdef1234567890abcdef1234567890abcdef12345678";

  const handleCopy = () => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <MobileShell title={`Receipt ${id?.slice(0, 8) || ""}`}>
{/* Verification badge */}
      <div className="flex flex-col items-center py-6">
        <div className="h-16 w-16 rounded-full bg-[hsl(var(--trust-safe))]/10 flex items-center justify-center mb-3">
          <CheckCircle2 className="h-8 w-8 text-[hsl(var(--trust-safe))]" />
        </div>
        <h2 className="text-base font-semibold">Verified Receipt</h2>
        <p className="text-xs text-muted-foreground mt-1">Immutable proof of execution</p>
      </div>

      {/* Details */}
      <div className="space-y-3">
        {[
          { label: "Action", value: "Invoice #1042 payment processed" },
          { label: "Domain", value: "Finance OS" },
          { label: "Executor", value: "finance-advisor" },
          { label: "Timestamp", value: new Date().toISOString() },
          { label: "Duration", value: "342ms" },
          { label: "Confidence", value: "99%" },
          { label: "Status", value: "Completed" },
        ].map((row) => (
          <div key={row.label} className="flex justify-between items-start px-4 py-2 rounded-lg bg-card border border-border/20">
            <span className="text-xs text-muted-foreground">{row.label}</span>
            <span className="text-xs font-medium text-right max-w-[60%] truncate">{row.value}</span>
          </div>
        ))}
      </div>

      {/* Hash */}
      <div className="mt-4 p-4 rounded-xl border border-border/40 bg-card">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Receipt Hash</p>
        <div className="flex items-center gap-2">
          <code className="text-[11px] font-mono text-foreground/80 break-all flex-1">
            {hash}
          </code>
          <button onClick={handleCopy} className="shrink-0 p-1.5 rounded hover:bg-muted transition-colors">
            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
        {copied && <p className="text-[10px] text-[hsl(var(--trust-safe))] mt-1">Copied!</p>}
      </div>

      {/* Linked entities */}
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-6 mb-2">Linked Entities</h3>
      <div className="space-y-1.5">
        {["Invoice #1042", "Account: Atlas Corp", "Workflow: wf-payment-001"].map((entity) => (
          <button key={entity} className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-border/20 bg-card/50 hover:bg-muted/50 transition-colors">
            <span className="text-xs">{entity}</span>
            <ExternalLink className="h-3 w-3 text-muted-foreground" />
          </button>
        ))}
      </div>
    </MobileShell>
  );
};

export default MobileReceiptDetail;
