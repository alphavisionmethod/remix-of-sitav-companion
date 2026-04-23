// ═══════════════════════════════════════════════════════════════
// SITA OS — Sita Agent mount (Phase E)
// ═══════════════════════════════════════════════════════════════
// Activates the useSitaAgent listener inside the Shell so window
// events ("sita-agent-intent") are handled globally.
// ═══════════════════════════════════════════════════════════════

import { useSitaAgent } from "@/lib/sita-agent";

export function SitaAgentMount() {
  useSitaAgent();
  return null;
}