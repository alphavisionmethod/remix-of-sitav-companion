// ═══════════════════════════════════════════════════════════════
// SITA OS — Session Restore Hook
// On mount: check for saved session, offer toast to restore
// ═══════════════════════════════════════════════════════════════

import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { restoreSession, clearSession, type SessionState } from "@/lib/services/session-persistence";

interface UseSessionRestoreOptions {
  onRestoreWindows?: (windows: SessionState["windows"]) => void;
}

export function useSessionRestore({ onRestoreWindows }: UseSessionRestoreOptions = {}) {
  const navigate = useNavigate();
  const checked = useRef(false);

  useEffect(() => {
    if (checked.current) return;
    checked.current = true;

    const session = restoreSession();
    if (!session || (session.windows.length === 0 && session.route === "/")) return;

    toast("Restore your last session?", {
      description: `${session.windows.length} window${session.windows.length !== 1 ? "s" : ""} • ${session.route}`,
      duration: 8000,
      action: {
        label: "Restore",
        onClick: () => {
          // Restore route
          if (session.route && session.route !== window.location.pathname) {
            navigate(session.route);
          }
          // Restore scroll positions
          if (session.scrollPositions) {
            const pos = session.scrollPositions[session.route];
            if (pos > 0) {
              requestAnimationFrame(() => {
                window.scrollTo({ top: pos, behavior: "instant" as ScrollBehavior });
              });
            }
          }
          // Restore windows
          if (session.windows.length > 0 && onRestoreWindows) {
            onRestoreWindows(session.windows);
          }
          clearSession();
        },
      },
      cancel: {
        label: "Dismiss",
        onClick: () => clearSession(),
      },
    });
  }, [navigate, onRestoreWindows]);
}
