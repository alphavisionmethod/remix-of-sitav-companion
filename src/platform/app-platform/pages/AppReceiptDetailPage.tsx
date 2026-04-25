// ═══════════════════════════════════════════════════════════════
// SITA OS — APS23 Receipt Detail View
// Full proof record for one lifecycle event
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft, Shield, Clock, Download, Check, AlertTriangle,
  FileText, RefreshCw, Trash2, Lock, Copy, ExternalLink, CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppPlatform } from "@/contexts/AppPlatformContext";
import { AppIcon, VerificationBadge, AppSourceLabel } from "@/platform/sita/components/sita/app-platform/AppStoreComponents";
import { exportToJSON } from "@/lib/export-engine";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const AppReceiptDetailPage = () => {
  const navigate = useNavigate();
  const { receiptId } = useParams<{ receiptId: string }>();
  const { receipts, getApp } = useAppPlatform();

  const receipt = useMemo(() => receipts.find(r => r.receiptId === receiptId), [receipts, receiptId]);
  const app = receipt ? getApp(receipt.appId) : null;

  const actionMeta = (type: string) => {
    switch (type) {
      case "install": return { icon: Download, color: "text-primary", bg: "bg-primary/10", label: "Application Installed" };
      case "update": return { icon: RefreshCw, color: "text-accent", bg: "bg-accent/10", label: "Application Updated" };
      case "uninstall": return { icon: Trash2, color: "text-destructive", bg: "bg-destructive/10", label: "Application Uninstalled" };
      case "permission-change": return { icon: Lock, color: "text-[hsl(var(--trust-warn))]", bg: "bg-[hsl(var(--trust-warn))]/10", label: "Permissions Changed" };
      case "repair": return { icon: RefreshCw, color: "text-muted-foreground", bg: "bg-secondary", label: "Application Repaired" };
      case "trust-reclassification": return { icon: Shield, color: "text-primary", bg: "bg-primary/10", label: "Trust Reclassified" };
      default: return { icon: FileText, color: "text-muted-foreground", bg: "bg-secondary", label: type };
    }
  };

  if (!receipt) {
    return (
      <div className="mx-auto max-w-3xl">
<button onClick={() => navigate("/app-store/receipts")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Receipts
        </button>
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <Shield className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-lg font-medium text-foreground">Receipt not found</p>
          <p className="text-sm text-muted-foreground mt-1">This lifecycle receipt may have been removed or the ID is invalid.</p>
        </div>
      </div>
    );
  }

  const meta = actionMeta(receipt.actionType);
  const ActionIcon = meta.icon;

  const handleExport = () => {
    exportToJSON(`sita_receipt_${receipt.receiptId.slice(0, 8)}`, receipt);
    toast.success("Receipt exported as JSON");
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(receipt.receiptId);
    toast.success("Receipt ID copied");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
<button onClick={() => navigate(app ? `/app-store/receipts/${app.id}` : "/app-store/receipts")}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Receipts
      </button>

      {/* ── Hero ── */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className={cn("px-6 py-5 flex items-center gap-4", meta.bg)}>
          <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl bg-background/80 shadow-sm")}>
            <ActionIcon className={cn("h-6 w-6", meta.color)} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-xl font-bold text-foreground">{meta.label}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {new Date(receipt.timestamp).toLocaleString("en-US", {
                weekday: "long", year: "numeric", month: "long", day: "numeric",
                hour: "2-digit", minute: "2-digit", second: "2-digit"
              })}
            </p>
          </div>
          <span className={cn("rounded-full px-3 py-1 text-xs font-semibold",
            receipt.result === "success" ? "bg-[hsl(var(--trust-safe))]/15 text-[hsl(var(--trust-safe))]" :
            receipt.result === "partial" ? "bg-[hsl(var(--trust-warn))]/15 text-[hsl(var(--trust-warn))]" :
            "bg-destructive/15 text-destructive"
          )}>
            {receipt.result === "success" ? "Success" : receipt.result === "partial" ? "Partial" : "Failed"}
          </span>
        </div>

        {/* App identity */}
        {app && (
          <div className="px-6 py-4 border-b border-border flex items-center gap-3">
            <AppIcon icon={app.icon} iconBg={app.iconBg} size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{app.name}</p>
              <p className="text-xs text-muted-foreground">{app.publisher}</p>
            </div>
            <VerificationBadge level={app.trustLevel} />
            <button onClick={() => navigate(`/app-store/app/${app.id}`)}
              className="flex items-center gap-1 text-xs text-primary hover:underline">
              View App <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Core metadata grid */}
        <div className="grid gap-px bg-border sm:grid-cols-2">
          {[
            { label: "Receipt ID", value: receipt.receiptId, mono: true },
            { label: "Version", value: receipt.version },
            { label: "Actor", value: receipt.actor },
            { label: "Source", value: receipt.sourceInfo },
            { label: "Approval Status", value: receipt.approvalStatus, capitalize: true },
            { label: "Action Type", value: receipt.actionType.replace("-", " "), capitalize: true },
          ].map(item => (
            <div key={item.label} className="bg-card px-6 py-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{item.label}</p>
              <p className={cn("text-sm text-foreground mt-0.5",
                item.mono && "font-mono text-xs break-all",
                item.capitalize && "capitalize"
              )}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Source Verification ── */}
      {app && (
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" /> Source Verification
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-secondary/30 p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Trust Level</p>
              <p className="text-sm text-foreground mt-1 capitalize">{app.trustLevel.replace(/-/g, " ")}</p>
            </div>
            <div className="rounded-xl bg-secondary/30 p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Source Origin</p>
              <p className="text-sm text-foreground mt-1 capitalize">{(app.sourceOrigin || "sita-store").replace(/-/g, " ")}</p>
            </div>
            <div className="rounded-xl bg-secondary/30 p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Package Type</p>
              <p className="text-sm text-foreground mt-1 capitalize">{(app.packageType || "native-application").replace(/-/g, " ")}</p>
            </div>
            <div className="rounded-xl bg-secondary/30 p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Sandbox Level</p>
              <p className="text-sm text-foreground mt-1 capitalize">{(app.sandboxLevel || "standard").replace(/-/g, " ")}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Permissions Summary ── */}
      {receipt.permissionSummary.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" /> Permissions at Time of Action
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {receipt.permissionSummary.map(p => (
              <span key={p} className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs text-foreground">
                <CheckCircle2 className="h-3 w-3 text-[hsl(var(--trust-safe))]" /> {p}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Permission Diff ── */}
      {receipt.permissionDelta && (receipt.permissionDelta.added.length > 0 || receipt.permissionDelta.removed.length > 0) && (
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-[hsl(var(--trust-warn))]" /> Permission Changes
          </h2>
          <div className="space-y-2">
            {receipt.permissionDelta.added.map(p => (
              <div key={`+${p}`} className="flex items-center gap-2 rounded-lg bg-[hsl(var(--trust-safe))]/5 px-3 py-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(var(--trust-safe))]/15 text-[10px] font-bold text-[hsl(var(--trust-safe))]">+</span>
                <span className="text-sm text-foreground">{p}</span>
                <span className="ml-auto text-[10px] text-[hsl(var(--trust-safe))]">Added</span>
              </div>
            ))}
            {receipt.permissionDelta.removed.map(p => (
              <div key={`-${p}`} className="flex items-center gap-2 rounded-lg bg-destructive/5 px-3 py-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive/15 text-[10px] font-bold text-destructive">−</span>
                <span className="text-sm text-foreground">{p}</span>
                <span className="ml-auto text-[10px] text-destructive">Removed</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Association Changes ── */}
      {receipt.associationDelta && (receipt.associationDelta.added.length > 0 || receipt.associationDelta.removed.length > 0) && (
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" /> Association Changes
          </h2>
          <div className="flex flex-wrap gap-2">
            {receipt.associationDelta.added.map(a => (
              <span key={`+${a}`} className="rounded-md bg-[hsl(var(--trust-safe))]/10 px-2.5 py-1 text-xs text-[hsl(var(--trust-safe))]">+ {a}</span>
            ))}
            {receipt.associationDelta.removed.map(a => (
              <span key={`-${a}`} className="rounded-md bg-destructive/10 px-2.5 py-1 text-xs text-destructive">− {a}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── Actions ── */}
      <div className="flex flex-wrap gap-2">
        <button onClick={handleExport}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
          <Download className="h-4 w-4" /> Export Receipt
        </button>
        <button onClick={handleCopyId}
          className="flex items-center gap-2 rounded-xl bg-secondary px-5 py-2.5 text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors">
          <Copy className="h-4 w-4" /> Copy Receipt ID
        </button>
        {app && (
          <button onClick={() => navigate(`/app-store/app/${app.id}`)}
            className="flex items-center gap-2 rounded-xl bg-secondary px-5 py-2.5 text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors">
            <ExternalLink className="h-4 w-4" /> View App
          </button>
        )}
      </div>
    </div>
  );
};

export default AppReceiptDetailPage;
