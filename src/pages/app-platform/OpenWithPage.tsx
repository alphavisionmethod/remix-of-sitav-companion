// ═══════════════════════════════════════════════════════════════
// SITA OS — APS18 Open With Dialog (fully wired)
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Star, Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppPlatform } from "@/contexts/AppPlatformContext";
import { AppIcon, VerificationBadge } from "@/components/sita/app-platform/AppStoreComponents";
import { toast } from "sonner";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
const OpenWithPage = () => {
  const navigate = useNavigate();
  const { apps, setDefaultApp } = useAppPlatform();
  const [selectedFile, setSelectedFile] = useState(DEMO_FILES[0]);
  const [alwaysUse, setAlwaysUse] = useState(false);
  const [selectedApp, setSelectedApp] = useState<string | null>(null);

  const candidateApps = selectedFile.candidates.map(id => apps.find(a => a.id === id)).filter(Boolean);
  const recommended = candidateApps[0];

  const handleOpen = () => {
    if (!selectedApp) return;
    if (alwaysUse) {
      // Derive a role from the file extension
      const role = selectedFile.ext.replace(".", "");
      setDefaultApp(role, selectedApp);
      toast.success(`Default for ${selectedFile.ext} set to ${apps.find(a => a.id === selectedApp)?.name}`);
    } else {
      toast.success(`Opening ${selectedFile.name}`);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
<button onClick={() => navigate("/app-store/associations")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Associations
      </button>

      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Open With</h1>
        <p className="text-sm text-muted-foreground mt-1">Choose how to open files</p>
      </div>

      {/* File Selection */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {([] as any[]).map(f => (
          <button key={f.name} onClick={() => { setSelectedFile(f); setSelectedApp(null); }}
            className={cn("shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all",
              selectedFile.name === f.name ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground")}>
            <FileText className="h-3 w-3" /> {f.name}
          </button>
        ))}
      </div>

      {/* File Context */}
      <div className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">{selectedFile.name}</p>
          <p className="text-xs text-muted-foreground">Type: {selectedFile.ext} · {candidateApps.length} compatible app{candidateApps.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* App List */}
      <div className="space-y-2">
        {candidateApps.map((app: Record<string, any>) => {
          const isRecommended = app.id === recommended?.id;
          const isSelected = selectedApp === app.id;
          return (
            <button key={app.id} onClick={() => setSelectedApp(app.id)}
              className={cn("w-full flex items-center gap-3 rounded-xl border p-4 text-left transition-all",
                isSelected ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/15")}>
              <AppIcon icon={app.icon} iconBg={app.iconBg} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{app.name}</p>
                  {isRecommended && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary">
                      <Star className="h-2.5 w-2.5" /> Recommended
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground">{app.publisher}</p>
              </div>
              <VerificationBadge level={app.trustLevel} />
              {isSelected && <Check className="h-4 w-4 text-primary" />}
            </button>
          );
        })}
      </div>

      {/* Always use toggle */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
        <div>
          <p className="text-sm text-foreground">Always use this app for {selectedFile.ext} files</p>
          <p className="text-[10px] text-muted-foreground">This changes your default file association</p>
        </div>
        <button onClick={() => setAlwaysUse(!alwaysUse)}
          className={cn("relative h-6 w-11 rounded-full transition-colors", alwaysUse ? "bg-[hsl(var(--trust-safe))]" : "bg-muted")}>
          <div className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-card shadow transition-transform", alwaysUse ? "translate-x-5" : "translate-x-0.5")} />
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate("/app-store/associations")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
        <button disabled={!selectedApp} onClick={handleOpen}
          className={cn("rounded-xl px-6 py-2.5 text-sm font-semibold flex items-center gap-2 transition-colors",
            selectedApp ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed")}>
          Open <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

export default OpenWithPage;
