// ═══════════════════════════════════════════════════════════════
// SITA OS — useSecurityFabric Hook
// React hook exposing the SecurityFabric singleton to UI
// ═══════════════════════════════════════════════════════════════

import { useMemo, useState, useEffect, useCallback } from "react";
import { getSecurityFabric, type FabricPosture, type ActionEvaluation, type SecurityFabric } from "@/lib/core-services/security/security-fabric";
import type { ThreatSignal } from "@/lib/core-services/security/intrusion-detection-engine";

export interface SecurityFabricHook {
  fabric: SecurityFabric;
  posture: FabricPosture;
  recentThreats: ThreatSignal[];
  refreshPosture: () => void;
  evaluateAction: (params: Parameters<SecurityFabric["evaluateAction"]>[0]) => Promise<ActionEvaluation>;
}

export function useSecurityFabric(): SecurityFabricHook {
  const fabric = useMemo(() => getSecurityFabric(), []);
  const [posture, setPosture] = useState<FabricPosture>(() => fabric.getPosture());
  const [recentThreats, setRecentThreats] = useState<ThreatSignal[]>([]);

  const refreshPosture = useCallback(() => {
    setPosture(fabric.getPosture());
    setRecentThreats(fabric.ids.getSignals(20));
  }, [fabric]);

  useEffect(() => {
    // Subscribe to IDS threats for live updates
    const unsubThreats = fabric.ids.onThreat(() => {
      refreshPosture();
    });

    // Periodic refresh
    const interval = setInterval(refreshPosture, 30_000);

    return () => {
      unsubThreats();
      clearInterval(interval);
    };
  }, [fabric, refreshPosture]);

  const evaluateAction = useCallback(
    (params: Parameters<SecurityFabric["evaluateAction"]>[0]) => fabric.evaluateAction(params),
    [fabric],
  );

  return { fabric, posture, recentThreats, refreshPosture, evaluateAction };
}
