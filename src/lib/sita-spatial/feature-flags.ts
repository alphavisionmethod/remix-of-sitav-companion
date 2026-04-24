// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase F: Spatial Feature Flags
// Per-user opt-in toggles for gesture / gaze / spatial / handoff.
// localStorage-backed; mirrored to personal_brain_preferences when
// available, but never blocks UI on the network.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";

export interface SitaSpatialFeatures {
  gesture: boolean;
  gaze: boolean;
  spatial: boolean;
  handoff: boolean;
  boardroom: boolean;
}

export const DEFAULT_FEATURES: SitaSpatialFeatures = {
  gesture: false,
  gaze: false,
  spatial: false,
  handoff: true, // safe — just a Realtime subscription
  boardroom: true,
};

const KEY = "sita_spatial_features_v1";
const EVT = "sita-spatial-features:changed";

export function readSpatialFeatures(): SitaSpatialFeatures {
  if (typeof localStorage === "undefined") return DEFAULT_FEATURES;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_FEATURES;
    return { ...DEFAULT_FEATURES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_FEATURES;
  }
}

export function writeSpatialFeatures(next: SitaSpatialFeatures): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(EVT, { detail: next }));
}

export function useSpatialFeatures(): [SitaSpatialFeatures, (patch: Partial<SitaSpatialFeatures>) => void] {
  const [features, setFeatures] = useState<SitaSpatialFeatures>(() => readSpatialFeatures());

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<SitaSpatialFeatures>).detail;
      if (detail) setFeatures(detail);
    };
    window.addEventListener(EVT, handler);
    return () => window.removeEventListener(EVT, handler);
  }, []);

  const update = (patch: Partial<SitaSpatialFeatures>) => {
    const next = { ...features, ...patch };
    writeSpatialFeatures(next);
    setFeatures(next);
  };

  return [features, update];
}
