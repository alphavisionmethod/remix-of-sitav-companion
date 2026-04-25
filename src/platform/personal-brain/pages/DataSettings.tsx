// ═══════════════════════════════════════════════════════════════
// Personal Brain — Data Export Settings (Phase 5)
// ═══════════════════════════════════════════════════════════════

import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import { GlobalErrorBoundary } from "@/platform/sita/components/sita/GlobalErrorBoundary";
import { PageShell } from "@/platform/sita/components/sita/PageShell";
import { Button } from "@/components/ui/button";
import { DataExportCard } from "@/platform/personal-brain/components/personal-brain/settings/DataExportCard";
import { DataDeleteCard } from "@/platform/personal-brain/components/personal-brain/settings/DataDeleteCard";

export default function DataSettings() {
  const navigate = useNavigate();
  return (
    <GlobalErrorBoundary>
      <PageShell>
        <div className="mx-auto w-full max-w-2xl space-y-4 p-4 sm:p-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/personal-brain/settings")}>
              <ArrowLeft className="h-4 w-4" />
              Settings
            </Button>
            <div className="rounded-lg bg-primary/10 p-1.5">
              <Download className="h-4 w-4 text-primary" />
            </div>
            <h1 className="text-base font-semibold">Export Your Data</h1>
          </div>
          <DataExportCard />
          <DataDeleteCard />
        </div>
      </PageShell>
    </GlobalErrorBoundary>
  );
}