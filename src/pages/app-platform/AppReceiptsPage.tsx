// ═══════════════════════════════════════════════════════════════
// SITA OS — APS20+23 Install History / App Receipts
// ═══════════════════════════════════════════════════════════════

import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Shield, Clock, Download, Check, AlertTriangle, FileText, RefreshCw, Trash2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_CATALOG, getAppById } from "@/lib/app-platform";
import { AppIcon } from "@/components/sita/app-platform/AppStoreComponents";
import type { AppLifecycleReceipt } from "@/lib/app-platform/types";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { DEMO_APP_RECEIPTS } from "@/lib/demo-data/app-receipts";

const MOCK_RECEIPTS = DEMO_APP_RECEIPTS;

const AppReceiptsPage = () => {
  const navigate = useNavigate();
  const { appId } = useParams<{ appId: string }>();

  const receipts = appId
    ? MOCK_RECEIPTS.filter(r => r.appId === appId)
    : MOCK_RECEIPTS;

  const app = appId ? getAppById(appId) : null;

  const actionIcon = (type: string) => {
    switch (type) {
      case "install": return <Download className="h-3.5 w-3.5 text-primary" />;
      case "update": return <RefreshCw className="h-3.5 w-3.5 text-accent" />;
      case "uninstall": return <Trash2 className="h-3.5 w-3.5 text-destructive" />;
      case "permission-change": return <Lock className="h-3.5 w-3.5 text-[hsl(var(--trust-warn))]" />;
      case "repair": return <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />;
      default: return <FileText className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <DemoModeBadge />
      <button onClick={() => navigate(appId ? `/app-store/manage/${appId}` : "/app-store")}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div>
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          {app ? `${app.name} Receipts` : "Install History"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {receipts.length} lifecycle events recorded · Every action produces visible proof
        </p>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {receipts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(receipt => (
          <div key={receipt.receiptId} className="rounded-2xl border border-border bg-card p-5 space-y-3 transition-all hover:border-primary/15">
            <div className="flex items-center gap-3">
              {actionIcon(receipt.actionType)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize",
                    receipt.actionType === "install" ? "bg-primary/10 text-primary" :
                    receipt.actionType === "update" ? "bg-accent/10 text-accent" :
                    receipt.actionType === "uninstall" ? "bg-destructive/10 text-destructive" :
                    receipt.actionType === "permission-change" ? "bg-[hsl(var(--trust-warn))]/10 text-[hsl(var(--trust-warn))]" :
                    "bg-secondary text-muted-foreground"
                  )}>{receipt.actionType.replace("-", " ")}</span>
                  <span className="text-sm font-semibold text-foreground">{receipt.appName}</span>
                  <span className="text-lg">{receipt.appIcon}</span>
                </div>
              </div>
              <span className={cn("text-[10px] font-medium",
                receipt.result === "success" ? "text-[hsl(var(--trust-safe))]" : "text-destructive")}>
                {receipt.result}
              </span>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {new Date(receipt.timestamp).toLocaleString()}</div>
              <div>Version: <span className="text-foreground">{receipt.version}</span></div>
              <div>Actor: <span className="text-foreground">{receipt.actor}</span></div>
              <div>Source: <span className="text-foreground">{receipt.sourceInfo}</span></div>
              <div>Approval: <span className="text-foreground capitalize">{receipt.approvalStatus}</span></div>
              <div>Receipt: <span className="text-foreground font-mono text-[10px]">{receipt.receiptId}</span></div>
            </div>

            {receipt.permissionSummary.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {receipt.permissionSummary.map(p => (
                  <span key={p} className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                    <Lock className="h-2.5 w-2.5" /> {p}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {receipts.length === 0 && (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <Shield className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-lg font-medium text-foreground">No receipts yet</p>
          <p className="text-sm text-muted-foreground mt-1">Install an app to see lifecycle receipts here</p>
        </div>
      )}
    </div>
  );
};

export default AppReceiptsPage;
