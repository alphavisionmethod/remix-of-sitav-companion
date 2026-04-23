// ═══════════════════════════════════════════════════════════════
// Personal Brain — Data Export card (Phase 5)
// ═══════════════════════════════════════════════════════════════

import { Download, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePbDataExport } from "../hooks/usePbDataExport";

export function DataExportCard() {
  const { exporting, exportAll } = usePbDataExport();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Download className="h-4 w-4 text-primary" />
          Export your data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Download a complete JSON archive of your Brain — profile, goals, workspaces, chats,
          messages, memories, files, voice prefs, security log.
        </p>
        <Button onClick={() => void exportAll()} disabled={exporting} className="w-full sm:w-auto">
          {exporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Preparing export…
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Download full export (.json)
            </>
          )}
        </Button>
        <p className="text-[11px] text-muted-foreground">
          Exports are recorded in your security log. Sensitive content (encrypted vault) is excluded.
        </p>
      </CardContent>
    </Card>
  );
}