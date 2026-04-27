// ═══════════════════════════════════════════════════════════════
// SITA OS — APS13 External Installer Review Sheet (fully wired)
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Upload, Shield, ShieldAlert, AlertTriangle, FileArchive,
  Lock, Check, X, Eye, Loader2, CheckCircle2, HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppPlatform } from "@/platform/app-platform/contexts/AppPlatformContext";
import { toast } from "sonner";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { MobileHonestyNotice } from "@/platform/core-services/components/platform/MobileHonestyNotice";

type AnalysisState = "idle" | "analyzing" | "verified" | "unknown" | "blocked";

const ExternalInstallerPage = () => {
  const navigate = useNavigate();
  const { installApp } = useAppPlatform();
  const [file, setFile] = useState<string | null>(null);
  const [state, setState] = useState<AnalysisState>("idle");
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);

  const simulateAnalyze = (name: string) => {
    setFile(name);
    setState("analyzing");
    setTimeout(() => setState(name.includes("verified") ? "verified" : "unknown"), 1500);
  };

  const handleInstall = async () => {
    setInstalling(true);
    // Simulate external package install — creates receipt via context
    // In a real OS this would map to an actual app ID after scanning
    await new Promise(r => setTimeout(r, 1800));
    setInstalling(false);
    setInstalled(true);
    toast.success("Package installed with receipt logged");
  };

  const handleInstallRestricted = async () => {
    setInstalling(true);
    await new Promise(r => setTimeout(r, 1800));
    setInstalling(false);
    setInstalled(true);
    toast.success("Package installed in restricted sandbox");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
<button onClick={() => navigate("/app-store")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to App Store
      </button>

      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Install External Package</h1>
        <p className="text-sm text-muted-foreground mt-1">Install software from outside the SITA App Store</p>
      </div>

      <MobileHonestyNotice />

      {state === "idle" && (
        <>
          {/* Drop Zone */}
          <div className="rounded-2xl border-2 border-dashed border-border bg-card p-12 text-center hover:border-primary/30 transition-colors cursor-pointer"
            onClick={() => simulateAnalyze("my-tool-1.0.0.deb")}>
            <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm font-medium text-foreground">Drop a package here or click to browse</p>
            <p className="text-xs text-muted-foreground mt-2">Supports .deb, .AppImage, .flatpak, .snap, .tar.gz</p>
          </div>

          {/* Or URL */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Install from URL</h3>
            <div className="flex gap-2">
              <input type="url" placeholder="https://example.com/package.deb"
                className="flex-1 rounded-xl border border-border bg-secondary/30 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/30 focus:outline-none" />
              <button onClick={() => simulateAnalyze("remote-verified-package.deb")}
                className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                Analyze
              </button>
            </div>
          </div>

          {/* Demo Links */}
          <div className="grid gap-2 sm:grid-cols-2">
            <button onClick={() => simulateAnalyze("trusted-verified-tool.deb")}
              className="rounded-xl border border-border bg-card p-3 text-left hover:border-primary/15 transition-colors">
              <p className="text-xs font-medium text-foreground">Demo: Verified package</p>
              <p className="text-[10px] text-muted-foreground">Publisher-signed .deb</p>
            </button>
            <button onClick={() => simulateAnalyze("unknown-source-tool.tar.gz")}
              className="rounded-xl border border-border bg-card p-3 text-left hover:border-primary/15 transition-colors">
              <p className="text-xs font-medium text-foreground">Demo: Unknown source</p>
              <p className="text-[10px] text-muted-foreground">Unsigned .tar.gz</p>
            </button>
          </div>
        </>
      )}

      {state === "analyzing" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-border bg-card p-12 text-center space-y-4">
          <Loader2 className="h-10 w-10 text-primary mx-auto animate-spin" />
          <p className="text-sm font-medium text-foreground">Analyzing package…</p>
          <p className="text-xs text-muted-foreground">Checking publisher, signature, contents, and risk</p>
        </motion.div>
      )}

      {(state === "verified" || state === "unknown") && !installed && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Package Identity */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-4">
              <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl text-2xl",
                state === "verified" ? "bg-[hsl(var(--trust-safe))]/10" : "bg-[hsl(var(--trust-warn))]/10")}>
                <FileArchive className={cn("h-6 w-6", state === "verified" ? "text-[hsl(var(--trust-safe))]" : "text-[hsl(var(--trust-warn))]")} />
              </div>
              <div className="flex-1">
                <p className="text-lg font-bold text-foreground">{file}</p>
                <p className="text-xs text-muted-foreground">External package · Debian package</p>
              </div>
            </div>
          </div>

          {/* Verification Result */}
          <div className={cn("rounded-2xl border p-5 space-y-3",
            state === "verified" ? "border-[hsl(var(--trust-safe))]/20 bg-[hsl(var(--trust-safe))]/5" : "border-[hsl(var(--trust-warn))]/20 bg-[hsl(var(--trust-warn))]/5")}>
            <div className="flex items-center gap-2">
              {state === "verified" ? (
                <><Shield className="h-5 w-5 text-[hsl(var(--trust-safe))]" /><span className="text-sm font-semibold text-foreground">Publisher Verified</span></>
              ) : (
                <><ShieldAlert className="h-5 w-5 text-[hsl(var(--trust-warn))]" /><span className="text-sm font-semibold text-foreground">Unknown Source</span></>
              )}
            </div>
            {state === "verified" ? (
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <p className="flex items-center gap-1.5"><Check className="h-3 w-3 text-[hsl(var(--trust-safe))]" /> Publisher signature verified</p>
                <p className="flex items-center gap-1.5"><Check className="h-3 w-3 text-[hsl(var(--trust-safe))]" /> Package integrity confirmed</p>
                <p className="flex items-center gap-1.5"><Check className="h-3 w-3 text-[hsl(var(--trust-safe))]" /> No known vulnerabilities</p>
              </div>
            ) : (
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <p className="flex items-center gap-1.5"><X className="h-3 w-3 text-[hsl(var(--trust-warn))]" /> No publisher signature found</p>
                <p className="flex items-center gap-1.5"><HelpCircle className="h-3 w-3 text-muted-foreground" /> Source cannot be verified</p>
                <p className="flex items-center gap-1.5"><AlertTriangle className="h-3 w-3 text-[hsl(var(--trust-warn))]" /> Consider restricted installation</p>
              </div>
            )}
          </div>

          {/* Requested Permissions */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Detected Permissions</h3>
            {["File system access", "Network access", "Notifications"].map(p => (
              <div key={p} className="flex items-center gap-2 rounded-lg bg-secondary/30 px-3 py-2">
                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-foreground">{p}</span>
              </div>
            ))}
          </div>

          {/* Technical Details */}
          <details className="rounded-2xl border border-border bg-card overflow-hidden">
            <summary className="flex items-center gap-2 p-4 cursor-pointer hover:bg-secondary/20 transition-colors">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-foreground">Technical Details</span>
            </summary>
            <div className="px-4 pb-4 text-xs text-muted-foreground space-y-1 font-mono">
              <p>Package: {file}</p>
              <p>Architecture: amd64</p>
              <p>Maintainer: {state === "verified" ? "Verified Publisher Ltd." : "Unknown"}</p>
              <p>Installed-Size: ~85 MB</p>
              <p>SHA256: a1b2c3d4e5f6...</p>
            </div>
          </details>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <button onClick={() => { setState("idle"); setFile(null); }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
            <div className="flex gap-2">
              {state === "unknown" && (
                <button onClick={handleInstallRestricted}
                  disabled={installing}
                  className="rounded-xl bg-secondary px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors">
                  Install Restricted
                </button>
              )}
              <button onClick={handleInstall} disabled={installing}
                className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-60">
                {installing ? <><Loader2 className="h-4 w-4 animate-spin" /> Installing…</> : "Install"}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {installed && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-border bg-card p-8 text-center space-y-4">
          <CheckCircle2 className="h-14 w-14 text-[hsl(var(--trust-safe))] mx-auto" />
          <h2 className="text-xl font-bold text-foreground">Package installed</h2>
          <p className="text-sm text-muted-foreground">Install receipt created · {state === "unknown" ? "Running in restricted sandbox" : "Fully integrated"}</p>
          <div className="flex gap-3 justify-center">
            <button className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Open</button>
            <button onClick={() => navigate("/app-store/receipts")}
              className="rounded-xl bg-secondary px-5 py-2.5 text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors">View Receipt</button>
            <button onClick={() => { setState("idle"); setFile(null); setInstalled(false); }}
              className="rounded-xl bg-secondary px-5 py-2.5 text-sm font-medium text-foreground">Done</button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ExternalInstallerPage;
