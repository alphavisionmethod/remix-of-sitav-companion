// ═══════════════════════════════════════════════════════════════
// SITA OS — APS20+23 Install History / App Receipts (fully wired)
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Shield, Clock, Download, Check, AlertTriangle, FileText, RefreshCw, Trash2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppPlatform } from "@/contexts/AppPlatformContext";
import { AppIcon } from "@/components/sita/app-platform/AppStoreComponents";
import type { AppLifecycleReceipt } from "@/domains/apps/types";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

const AppReceiptsPage = () => {
  const navigate = useNavigate();
  const { appId } = useParams<{ appId: string }>();
  const { receipts, getApp } = useAppPlatform();

  const filteredReceipts = useMemo(() => {
    const list = appId ? receipts.filter(r => r.appId === appId) : receipts;
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [receipts, appId]);

  const app = appId ? getApp(appId) : null;

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
          {filteredReceipts.length} lifecycle events recorded · Every action produces visible proof
        </p>
      </div>

      <div className="space-y-3">
        {filteredReceipts.map(receipt => {
          const receiptApp = getApp(receipt.appId);
          return (
            <div key={receipt.receiptId} onClick={() => navigate(`/app-store/receipt/${receipt.receiptId}`)}
              className="rounded-2xl border border-border bg-card p-5 space-y-3 transition-all hover:border-primary/15 cursor-pointer hover:shadow-sm">
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
                    <span className="text-sm font-semibold text-foreground">
                      {receiptApp?.name || receipt.appId}
                    </span>
                    {receiptApp && <span className="text-lg">{receiptApp.icon}</span>}
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
                <div>Receipt: <span className="text-foreground font-mono text-[10px]">{receipt.receiptId.slice(0, 8)}…</span></div>
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

              {receipt.permissionDelta && (
                <div className="flex flex-wrap gap-2 text-[10px]">
                  {receipt.permissionDelta.added.map(p => (
                    <span key={`+${p}`} className="text-[hsl(var(--trust-safe))]">+ {p}</span>
                  ))}
                  {receipt.permissionDelta.removed.map(p => (
                    <span key={`-${p}`} className="text-destructive">− {p}</span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredReceipts.length === 0 && (
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
