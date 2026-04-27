// ═══════════════════════════════════════════════════════════════
// SITA OS — Dock Context Awareness
// Detects current mode from route + activity for smart suggestions
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import type { DockContext } from "./useAppSurfacing";

export function useDockContext(): DockContext {
  const location = useLocation();

  return useMemo(() => {
    const path = location.pathname;
    if (path.startsWith("/business") || path.startsWith("/crm") || path.startsWith("/operations")) return "business";
    if (path.startsWith("/money") || path.startsWith("/finance") || path.startsWith("/wealth")) return "finance";
    if (path.startsWith("/concierge") || path.startsWith("/life") || path.startsWith("/travel")) return "concierge";
    if (path.startsWith("/settings") || path.startsWith("/trust") || path.startsWith("/files")) return "system";
    return "general";
  }, [location.pathname]);
}
