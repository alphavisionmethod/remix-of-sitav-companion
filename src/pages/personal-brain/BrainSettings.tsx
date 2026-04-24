// ═══════════════════════════════════════════════════════════════
// Personal Brain — Settings layout shell with sidebar + outlet
// ═══════════════════════════════════════════════════════════════

import { Outlet, useNavigate } from "react-router-dom";
import { ArrowLeft, Settings, ShieldAlert } from "lucide-react";
import { GlobalErrorBoundary } from "@/components/sita/GlobalErrorBoundary";
import { PageShell } from "@/components/sita/PageShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SettingsSidebarNav } from "@/components/personal-brain/settings/SettingsSidebarNav";
import { usePbSecurityPrefs } from "@/components/personal-brain/hooks/usePbSecurityPrefs";

export default function BrainSettings() {
  const navigate = useNavigate();
  const { prefs } = usePbSecurityPrefs();

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
              <Outlet />
            </main>
          </div>
        </div>
      </PageShell>
    </GlobalErrorBoundary>
  );
}
