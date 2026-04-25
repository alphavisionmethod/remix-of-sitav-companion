// ═══════════════════════════════════════════════════════════════
// Personal Brain — Settings layout shell with sidebar + outlet
// ═══════════════════════════════════════════════════════════════

import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Settings, ShieldAlert, ChevronRight } from "lucide-react";
import { GlobalErrorBoundary } from "@/platform/sita/components/sita/GlobalErrorBoundary";
import { PageShell } from "@/platform/sita/components/sita/PageShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SettingsSidebarNav } from "@/platform/personal-brain/components/personal-brain/settings/SettingsSidebarNav";
import { usePbSecurityPrefs } from "@/platform/personal-brain/components/personal-brain/hooks/usePbSecurityPrefs";
import { usePbProfile } from "@/platform/personal-brain/components/personal-brain/hooks/usePbProfile";
import { usePbWorkspaces } from "@/platform/personal-brain/components/personal-brain/hooks/usePbWorkspaces";
import { usePbMemories } from "@/platform/personal-brain/components/personal-brain/hooks/usePbMemories";

export default function BrainSettings() {
  const navigate = useNavigate();
  const location = useLocation();
  const { prefs } = usePbSecurityPrefs();
  const isIndex = location.pathname === "/personal-brain/settings";

  return (
    <GlobalErrorBoundary>
      <PageShell>
        <div className="mx-auto w-full max-w-6xl space-y-4 p-4 sm:p-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/personal-brain")}>
              <ArrowLeft className="h-4 w-4" />
              Brain
            </Button>
            <div className="rounded-lg bg-primary/10 p-1.5">
              <Settings className="h-4 w-4 text-primary" />
            </div>
            <h1 className="text-base font-semibold">Brain settings</h1>
            {prefs?.sensitive_mode && (
              <Badge variant="outline" className="ml-auto border-destructive/50 text-destructive">
                <ShieldAlert className="mr-1 h-3 w-3" />
                Sensitive mode on
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
            <aside className="lg:border-r lg:border-border/40 lg:pr-4">
              <SettingsSidebarNav />
            </aside>
            <main className="min-w-0">
              {isIndex ? <SettingsOverview /> : <Outlet />}
            </main>
          </div>
        </div>
      </PageShell>
    </GlobalErrorBoundary>
  );
}

function SettingsOverview() {
  const { profile } = usePbProfile();
  const { workspaces } = usePbWorkspaces();
  const { memories } = usePbMemories();
  const { prefs } = usePbSecurityPrefs();

  const tiles = [
    {
      label: "Personalization",
      value: profile?.personalization_depth ?? "—",
    },
    {
      label: "Memories",
      value: String(memories?.length ?? 0),
    },
    {
      label: "Workspaces",
      value: String(workspaces?.length ?? 0),
    },
    {
      label: "Privacy",
      value: prefs?.sensitive_mode ? "Sensitive" : "Standard",
    },
    {
      label: "Style",
      value: profile?.tone ?? "—",
    },
    {
      label: "Scope",
      value: profile?.work_mode ?? "—",
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold">Overview</h2>
        <p className="text-xs text-muted-foreground">
          A snapshot of how your Brain is configured. Pick a section on the left to refine.
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {tiles.map((t) => (
          <Card key={t.label}>
            <CardContent className="p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {t.label}
              </p>
              <p className="text-sm font-medium text-foreground capitalize truncate">
                {t.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Use the sidebar to manage profile, memory, modes, workspaces, files, voice,
            notifications, security, data, and labs.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
