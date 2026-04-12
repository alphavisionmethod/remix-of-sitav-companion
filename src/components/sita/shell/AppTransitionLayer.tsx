// ═══════════════════════════════════════════════════════════════
// SITA OS — Seamless App Transition Layer
// Crossfade + morph between route changes using View Transition API
// Wraps main content for continuous multitasking feel
// ═══════════════════════════════════════════════════════════════

import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * Hook that triggers View Transition API on route changes
 * for seamless crossfade between page content.
 */
export function useAppTransitions() {
  const location = useLocation();
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    if (prevPath.current === location.pathname) return;

    // Trigger View Transition API if available
    if ("startViewTransition" in document) {
      try {
        (document as any).startViewTransition(() => {
          return new Promise<void>(resolve => {
            // Resolve on next frame to let React render
            requestAnimationFrame(() => {
              requestAnimationFrame(() => resolve());
            });
          });
        });
      } catch {
        // Fallback: browser doesn't support or transition failed
      }
    }

    prevPath.current = location.pathname;
  }, [location.pathname]);
}
