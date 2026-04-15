// ═══════════════════════════════════════════════════════════════
// SITA OS — useDegradedMode Hook
// Provides system health status, feature availability, and
// degradation notifications to UI components.
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback, useEffect } from "react";
import {
  degradedModeService,
  type SystemOperatingMode,
  type DegradedFeature,
  type DegradationNotification,
  type ServiceHealthNode,
} from "@/lib/services/degraded-mode";

export function useDegradedMode() {
  const [mode, setMode] = useState<SystemOperatingMode>("full");
  const [features, setFeatures] = useState<DegradedFeature[]>([]);
  const [notification, setNotification] = useState<DegradationNotification | null>(null);
  const [services, setServices] = useState<ServiceHealthNode[]>([]);

  const refresh = useCallback(() => {
    const summary = degradedModeService.getHealthSummary();
    setMode(summary.mode);
    setFeatures(summary.features);
    setServices(summary.services);
    setNotification(degradedModeService.generateNotification());
  }, []);

  const isFeatureAvailable = useCallback((featureId: string): boolean => {
    const feature = features.find(f => f.feature_id === featureId);
    return feature?.available ?? true;
  }, [features]);

  const isFeatureDegraded = useCallback((featureId: string): boolean => {
    const feature = features.find(f => f.feature_id === featureId);
    return feature?.degraded ?? false;
  }, [features]);

  // Poll every 30 seconds
  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  return {
    mode,
    features,
    services,
    notification,
    refresh,
    isFeatureAvailable,
    isFeatureDegraded,
    isHealthy: mode === "full",
    isDegraded: mode !== "full",
  };
}
