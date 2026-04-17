// ═══════════════════════════════════════════════════════════════
// SITA OS — Web App Launch Container
// Renders Type A (web) and Type B (PWA) apps inside a windowed iframe
// when the launch resolver chooses `embedded_webview`.
// Falls back to a clean "Open in browser" CTA when embedding is blocked.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useRef, useState } from "react";
import { ExternalLink, Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WebAppWindowProps {
  appId: string;
  name: string;
  url: string;
  iconUrl?: string;
  publisher?: string;
  onClose?: () => void;
}

export function WebAppWindow({ appId, name, url, iconUrl, publisher, onClose }: WebAppWindowProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "blocked">("loading");

  useEffect(() => {
    const t = window.setTimeout(() => {
      // If neither `load` nor `error` fired in 6s, assume X-Frame-Options blocked us.
      setLoadState((s) => (s === "loading" ? "blocked" : s));
    }, 6000);
    return () => window.clearTimeout(t);
  }, [url]);

  const openExternal = () => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex h-full w-full flex-col bg-background" data-app-id={appId}>
      {/* Top chrome */}
      <div className="flex items-center gap-3 border-b border-border/40 bg-card/50 px-4 py-2 backdrop-blur">
        {iconUrl ? (
          <img src={iconUrl} alt="" className="h-6 w-6 rounded" />
        ) : (
          <div className="h-6 w-6 rounded bg-primary/20" />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{name}</p>
          {publisher && (
            <p className="truncate text-[10px] text-muted-foreground">{publisher}</p>
          )}
        </div>
        <Button size="sm" variant="ghost" onClick={openExternal}>
          <ExternalLink className="h-3.5 w-3.5" />
          <span className="ml-1 text-xs">Open externally</span>
        </Button>
      </div>

      {/* Body */}
      <div className="relative flex-1">
        {loadState === "loading" && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/80">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Loading {name}…</p>
          </div>
        )}

        {loadState === "blocked" ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
            <ShieldAlert className="h-10 w-10 text-warning" />
            <div>
              <p className="text-sm font-semibold text-foreground">{name} can't be embedded</p>
              <p className="mt-1 max-w-md text-xs text-muted-foreground">
                {publisher ?? "This site"} blocks embedding inside other windows for security.
                Open it in a new browser tab to continue — your launch is still tracked in
                the App Platform receipts.
              </p>
            </div>
            <Button onClick={openExternal}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Open {name} in a new tab
            </Button>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={url}
            title={name}
            className="h-full w-full border-0"
            sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-downloads allow-modals allow-popups-to-escape-sandbox"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="clipboard-read; clipboard-write; fullscreen; microphone; camera; geolocation"
            onLoad={() => setLoadState("ready")}
            onError={() => setLoadState("blocked")}
          />
        )}
      </div>
    </div>
  );
}

export default WebAppWindow;
