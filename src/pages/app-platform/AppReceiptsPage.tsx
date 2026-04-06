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

// Mock receipts for demo
const MOCK_RECEIPTS: (AppLifecycleReceipt & { appName: string; appIcon: string })[] = [
  { receiptId: "rcpt-001", appId: "terminal", appName: "SITA Terminal", appIcon: "⬛", actionType: "install", timestamp: "2026-01-01T10:00:00Z", actor: "System (first boot)", version: "1.0.0", sourceInfo: "SITA App Store (verified)", permissionSummary: ["File system access", "System access"], approvalStatus: "auto", result: "success" },
  { receiptId: "rcpt-002", appId: "files-app", appName: "SITA Files", appIcon: "📁", actionType: "install", timestamp: "2026-01-01T10:00:05Z", actor: "System (first boot)", version: "1.0.0", sourceInfo: "SITA App Store (verified)", permissionSummary: ["File system access"], approvalStatus: "auto", result: "success" },
  { receiptId: "rcpt-003", appId: "calculator", appName: "SITA Calculator", appIcon: "🔢", actionType: "install", timestamp: "2026-01-01T10:00:10Z", actor: "System (first boot)", version: "1.0.0", sourceInfo: "SITA App Store (verified)", permissionSummary: [], approvalStatus: "auto", result: "success" },
  { receiptId: "rcpt-004", appId: "settings-app", appName: "SITA Settings", appIcon: "⚙️", actionType: "install", timestamp: "2026-01-01T10:00:15Z", actor: "System (first boot)", version: "1.0.0", sourceInfo: "SITA App Store (verified)", permissionSummary: [], approvalStatus: "auto", result: "success" },
  { receiptId: "rcpt-005", appId: "chrome", appName: "Google Chrome", appIcon: "🌐", actionType: "install", timestamp: "2026-03-15T14:23:00Z", actor: "User", version: "124.0.6367", sourceInfo: "SITA App Store (SITA Verified)", permissionSummary: ["Downloads", "Notifications", "Clipboard", "Camera"], approvalStatus: "auto", result: "success" },
  { receiptId: "rcpt-006", appId: "chrome", appName: "Google Chrome", appIcon: "🌐", actionType: "update", timestamp: "2026-03-28T09:00:00Z", actor: "Auto-update", version: "124.0.6400", sourceInfo: "SITA App Store (store-managed)", permissionSummary: [], approvalStatus: "auto", result: "success" },
  { receiptId: "rcpt-007", appId: "vscode", appName: "Visual Studio Code", appIcon: "💻", actionType: "install", timestamp: "2026-03-16T11:00:00Z", actor: "User", version: "1.92.0", sourceInfo: "SITA App Store (SITA Verified)", permissionSummary: ["Files", "Clipboard", "Notifications", "Network"], approvalStatus: "auto", result: "success" },
  { receiptId: "rcpt-008", appId: "vscode", appName: "Visual Studio Code", appIcon: "💻", actionType: "permission-change", timestamp: "2026-03-20T15:30:00Z", actor: "User", version: "1.92.0", sourceInfo: "Permission center", permissionSummary: ["Added: Terminal integration"], approvalStatus: "approved", result: "success" },
];

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
