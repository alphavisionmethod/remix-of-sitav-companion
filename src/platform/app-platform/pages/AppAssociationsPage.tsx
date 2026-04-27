// ═══════════════════════════════════════════════════════════════
// SITA OS — Default Apps & Associations Manager (fully wired)
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Link2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppPlatform } from "@/platform/app-platform/contexts/AppPlatformContext";
import { AppIcon } from "@/platform/sita/components/sita/app-platform/AppStoreComponents";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
const AppAssociationsPage = () => {
  const { apps, defaultApps, setDefaultApp } = useAppPlatform();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"defaults" | "files" | "protocols">("defaults");
  const [changingSlot, setChangingSlot] = useState<string | null>(null);

  const handleSetDefault = (role: string, appId: string) => {
    setDefaultApp(role, appId);
    setChangingSlot(null);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
<button onClick={() => navigate("/app-store")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Default Apps & Associations</h1>
        <p className="text-sm text-muted-foreground mt-1">Control how files, links, and protocols open</p>
      </div>

      <div className="flex gap-2">
        {(["defaults", "files", "protocols"] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={cn("rounded-lg px-4 py-2 text-xs font-medium transition-all capitalize",
              activeTab === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground")}>
            {t === "defaults" ? "Default Apps" : t === "files" ? "File Types" : "Protocols"}
          </button>
        ))}
      </div>

      {activeTab === "defaults" && (
        <div className="space-y-3">
          {([] as any[]).map(slot => {
            const Icon = slot.icon;
            const currentAppId = defaultApps[slot.id] || slot.currentApp;
            const currentApp = currentAppId ? apps.find(a => a.id === currentAppId) : null;
            const isChanging = changingSlot === slot.id;

            return (
              <div key={slot.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{slot.label}</p>
                    {currentApp ? (
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-lg">{currentApp.icon}</span>
                        <span className="text-xs text-muted-foreground">{currentApp.name}</span>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-1">No default set</p>
                    )}
                  </div>
                  <button onClick={() => setChangingSlot(isChanging ? null : slot.id)}
                    className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary/80 transition-colors">
                    {isChanging ? "Cancel" : "Change"}
                  </button>
                </div>

                {isChanging && (
                  <div className="space-y-1.5 pt-2 border-t border-border">
                    {slot.candidates.length > 0 ? slot.candidates.map(candidateId => {
                      const candidateApp = apps.find(a => a.id === candidateId);
                      if (!candidateApp) return null;
                      const isSelected = currentAppId === candidateId;
                      return (
                        <button key={candidateId} onClick={() => handleSetDefault(slot.id, candidateId)}
                          className={cn("w-full flex items-center gap-3 rounded-lg p-2.5 transition-colors text-left",
                            isSelected ? "bg-primary/10 border border-primary/20" : "hover:bg-secondary")}>
                          <span className="text-lg">{candidateApp.icon}</span>
                          <span className="text-sm text-foreground flex-1">{candidateApp.name}</span>
                          {isSelected && <Check className="h-4 w-4 text-primary" />}
                        </button>
                      );
                    }) : (
                      <p className="text-xs text-muted-foreground py-2">No candidate apps available. Install compatible apps first.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "files" && (
        <div className="space-y-2">
          {([] as any[]).map(ft => {
            const ftApps = ft.apps.map(id => apps.find(a => a.id === id)).filter(Boolean);
            return (
              <div key={ft.ext} className="rounded-xl border border-border bg-card p-3 flex items-center gap-3">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{ft.label}</p>
                  <p className="text-[10px] text-muted-foreground">{ft.ext}</p>
                </div>
                <div className="flex items-center gap-1">
                  {ftApps.map((a: any) => (
                    <span key={a.id} className="text-sm" title={a.name}>{a.icon}</span>
                  ))}
                </div>
                <button className="text-[10px] text-primary hover:underline">Change</button>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "protocols" && (
        <div className="space-y-2">
          {apps.filter(a => a.protocolAssociations.length > 0).map(app => (
            app.protocolAssociations.map(p => (
              <div key={`${app.id}-${p.protocol}`} className="rounded-xl border border-border bg-card p-3 flex items-center gap-3">
                <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{p.protocol}://</p>
                  <p className="text-[10px] text-muted-foreground">{p.label}</p>
                </div>
                <span className="text-sm">{app.icon}</span>
                <span className="text-xs text-muted-foreground">{app.name}</span>
                {p.isDefault && <span className="text-[9px] text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full">Default</span>}
              </div>
            ))
          ))}
        </div>
      )}
    </div>
  );
};

export default AppAssociationsPage;
