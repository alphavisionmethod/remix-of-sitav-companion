// ═══════════════════════════════════════════════════════════════
// SITA OS — <SitaContext> wrapper (Phase C)
// ═══════════════════════════════════════════════════════════════
// Drop this around any focused screen/window content to publish
// "what's visible" to the global Sita screen-context registry.
// On unmount it clears its own context so we never report stale.
//
// Apps opt in — nothing forces them to publish. Empty-state honesty
// is preserved: surfaces that have nothing meaningful simply skip it.
// ═══════════════════════════════════════════════════════════════

import { useEffect, type ReactNode } from "react";
import { publishScreenContext, readScreenContext } from "./sita-screen-context";

interface SitaContextProps {
  surfaceId: string;
  title: string;
  route?: string;
  summary?: string;
  suggestedIntents?: string[];
  payload?: Record<string, unknown>;
  /** When false, the wrapper does not publish (e.g. tab not focused). */
  active?: boolean;
  children: ReactNode;
}

export function SitaContext({
  surfaceId,
  title,
  route,
  summary,
  suggestedIntents,
  payload,
  active = true,
  children,
}: SitaContextProps) {
  useEffect(() => {
    if (!active) return;
    publishScreenContext({ surfaceId, title, route, summary, suggestedIntents, payload });
    return () => {
      // Only clear if we are still the published surface.
      const cur = readScreenContext();
      if (cur?.surfaceId === surfaceId) {
        publishScreenContext(null);
      }
    };
  }, [surfaceId, title, route, summary, active, JSON.stringify(payload), JSON.stringify(suggestedIntents)]);

  return <>{children}</>;
}