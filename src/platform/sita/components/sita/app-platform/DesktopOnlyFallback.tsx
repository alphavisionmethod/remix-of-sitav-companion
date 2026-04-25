// ═══════════════════════════════════════════════════════════════
// SITA OS — Desktop-Only App Fallback Dialog
// Shown when an external_desktop app is launched in a browser-only
// runtime (no Electron host). Honest degradation per spec §16.
// ═══════════════════════════════════════════════════════════════

import { Download, ExternalLink, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DesktopOnlyFallbackProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appName: string;
  iconUrl?: string;
  fallbackUrl?: string;
  webAlternativeUrl?: string;
  webAlternativeName?: string;
}

export function DesktopOnlyFallback({
  open,
  onOpenChange,
  appName,
  iconUrl,
  fallbackUrl,
  webAlternativeUrl,
  webAlternativeName,
}: DesktopOnlyFallbackProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-3 flex items-center gap-3">
            {iconUrl ? (
              <img src={iconUrl} alt="" className="h-10 w-10 rounded-lg" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
                <Monitor className="h-5 w-5 text-primary" />
              </div>
            )}
            <div>
              <DialogTitle>{appName} requires the desktop host</DialogTitle>
            </div>
          </div>
          <DialogDescription>
            This is a native desktop application. SITA OS can launch it directly when
            running inside the SITA Desktop app, but in a browser tab we cannot open
            installed native software.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 rounded-lg border border-border/50 bg-muted/30 p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Your options</p>
          <ul className="list-inside list-disc space-y-1">
            <li>Install the SITA Desktop app to launch native programs</li>
            {webAlternativeUrl && <li>Use the web version of {webAlternativeName ?? appName}</li>}
            {fallbackUrl && <li>Download {appName} from the publisher</li>}
          </ul>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          {webAlternativeUrl && (
            <Button
              variant="default"
              onClick={() => {
                window.open(webAlternativeUrl, "_blank", "noopener,noreferrer");
                onOpenChange(false);
              }}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Open web version
            </Button>
          )}
          {fallbackUrl && (
            <Button
              variant="outline"
              onClick={() => {
                window.open(fallbackUrl, "_blank", "noopener,noreferrer");
                onOpenChange(false);
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Get {appName}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DesktopOnlyFallback;
