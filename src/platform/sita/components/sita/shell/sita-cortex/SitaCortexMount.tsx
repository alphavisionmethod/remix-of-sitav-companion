// ═══════════════════════════════════════════════════════════════
// SITA OS — Cortex Mount (Phase G)
// ═══════════════════════════════════════════════════════════════
// Hydrates the world model, loads the prewarm Markov, and renders
// the trust-receipt chip near the HUD orb.
// ═══════════════════════════════════════════════════════════════

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { hydrateWorldModel } from "@/lib/sita-cortex/world-model";
import { loadPrewarmModel } from "@/lib/sita-cortex/predictive-prewarm";
import { SitaTrustReceiptChip } from "./SitaTrustReceiptChip";

export function SitaCortexMount() {
  const { user } = useAuth();
  useEffect(() => {
    if (!user?.id) return;
    void hydrateWorldModel(user.id);
    void loadPrewarmModel(user.id);
  }, [user?.id]);
  return <SitaTrustReceiptChip />;
}