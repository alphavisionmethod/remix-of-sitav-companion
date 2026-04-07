// ═══════════════════════════════════════════════════════════════
// SITA OS — Default Apps & Associations Manager
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Globe, FileText, Link2, Mail, Image, FileCode, Calendar, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_CATALOG } from "@/lib/app-platform";
import { AppIcon } from "@/components/sita/app-platform/AppStoreComponents";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

const DEFAULT_APP_SLOTS = [
  { id: "browser", label: "Default Browser", icon: Globe, currentApp: "chrome", candidates: ["chrome", "firefox"] },
  { id: "email", label: "Default Email", icon: Mail, currentApp: "gmail", candidates: ["gmail"] },
  { id: "calendar", label: "Default Calendar", icon: Calendar, currentApp: null, candidates: [] },
  { id: "pdf", label: "PDF Viewer", icon: FileText, currentApp: null, candidates: [] },
  { id: "images", label: "Image Viewer", icon: Image, currentApp: null, candidates: [] },
  { id: "code", label: "Code Editor", icon: FileCode, currentApp: "vscode", candidates: ["vscode", "obsidian"] },
];

const FILE_TYPES = [
  { ext: ".html", label: "HTML files", apps: ["chrome", "firefox", "vscode"] },
  { ext: ".js", label: "JavaScript", apps: ["vscode"] },
  { ext: ".ts", label: "TypeScript", apps: ["vscode"] },
  { ext: ".md", label: "Markdown", apps: ["vscode", "obsidian"] },
  { ext: ".json", label: "JSON", apps: ["vscode"] },
  { ext: ".py", label: "Python", apps: ["vscode"] },
  { ext: ".fig", label: "Figma files", apps: ["figma"] },
  { ext: ".sh", label: "Shell scripts", apps: ["terminal"] },
  { ext: ".eml", label: "Email files", apps: ["gmail"] },
  { ext: ".svg", label: "SVG files", apps: ["chrome", "figma"] },
];

const AppAssociationsPage = () => {
  const { isDemoMode } = useDataMode();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"defaults" | "files" | "protocols">("defaults");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <DemoModeBadge />
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
          {DEFAULT_APP_SLOTS.map(slot => {
            const Icon = slot.icon;
            const currentApp = slot.currentApp ? APP_CATALOG.find(a => a.id === slot.currentApp) : null;
            return (
              <div key={slot.id} className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
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
                <button className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary/80 transition-colors">
                  Change
                </button>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "files" && (
        <div className="space-y-2">
          {FILE_TYPES.map(ft => {
            const apps = ft.apps.map(id => APP_CATALOG.find(a => a.id === id)).filter(Boolean);
            return (
              <div key={ft.ext} className="rounded-xl border border-border bg-card p-3 flex items-center gap-3">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{ft.label}</p>
                  <p className="text-[10px] text-muted-foreground">{ft.ext}</p>
                </div>
                <div className="flex items-center gap-1">
                  {apps.map((a: any) => (
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
          {APP_CATALOG.filter(a => a.protocolAssociations.length > 0).map(app => (
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
