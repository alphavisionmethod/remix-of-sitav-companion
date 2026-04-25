// ═══════════════════════════════════════════════════════════════
// Personal Brain — Security Console (Phase 5)
// ═══════════════════════════════════════════════════════════════

import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { GlobalErrorBoundary } from "@/components/sita/GlobalErrorBoundary";
import { PageShell } from "@/components/sita/PageShell";
import { Button } from "@/components/ui/button";
import { SensitiveModeCard } from "@/components/personal-brain/settings/SensitiveModeCard";
import { SecurityEventLog } from "@/components/personal-brain/settings/SecurityEventLog";

export default function SecuritySettings() {
  const navigate = useNavigate();
  return (
    <GlobalErrorBoundary>
      <PageShell>
        <div className="mx-auto w-full max-w-3xl space-y-4 p-4 sm:p-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/personal-brain/settings")}>
              <ArrowLeft className="h-4 w-4" />
              Settings
            </Button>
            <div className="rounded-lg bg-primary/10 p-1.5">
              <ShieldAlert className="h-4 w-4 text-primary" />
            </div>
            <h1 className="text-base font-semibold">Security & Privacy</h1>
          </div>
          <SensitiveModeCard />
          <SecurityEventLog />
        </div>
      </PageShell>
    </GlobalErrorBoundary>
  );
}