// ═══════════════════════════════════════════════════════════════
// SITA OS — License Manager: Frontend License State
// Communicates with Electron main process for license status
// Falls back gracefully in browser mode (auth-based access)
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";

// ── Types ───────────────────────────────────────────────────────

export interface LicenseInfo {
  license_key: string;
  product_tier: string;
  activated_at: string;
  last_validated: string;
}

export interface LicenseStatus {
  isElectron: boolean;
  isLicensed: boolean;
  loading: boolean;
  info: LicenseInfo | null;
  error: string | null;
}

// ── Electron Detection ──────────────────────────────────────────

function isElectronRuntime(): boolean {
  return typeof window !== "undefined" && !!(window as any).electron;
}

// ── Hook: useLicenseStatus ──────────────────────────────────────

export function useLicenseStatus(): LicenseStatus & {
  activate: (key: string) => Promise<boolean>;
  deactivate: () => Promise<void>;
  refresh: () => Promise<void>;
} {
  const [status, setStatus] = useState<LicenseStatus>({
    isElectron: false,
    isLicensed: false,
    loading: true,
    info: null,
    error: null,
  });

  const refresh = useCallback(async () => {
    if (!isElectronRuntime()) {
      // Browser mode — no license needed, auth handles access
      setStatus({
        isElectron: false,
        isLicensed: true,
        loading: false,
        info: null,
        error: null,
      });
      return;
    }

    try {
      const electron = (window as any).electron;
      const info = await electron.getLicenseInfo?.();
      setStatus({
        isElectron: true,
        isLicensed: !!info,
        loading: false,
        info: info || null,
        error: null,
      });
    } catch (err: any) {
      setStatus({
        isElectron: true,
        isLicensed: false,
        loading: false,
        info: null,
        error: err.message || "Failed to check license",
      });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const activate = useCallback(async (key: string): Promise<boolean> => {
    if (!isElectronRuntime()) return true;
    try {
      const electron = (window as any).electron;
      const result = await electron.activateLicense?.(key);
      if (result?.activated) {
        await refresh();
        return true;
      }
      setStatus((prev) => ({ ...prev, error: result?.error || "Activation failed" }));
      return false;
    } catch (err: any) {
      setStatus((prev) => ({ ...prev, error: err.message }));
      return false;
    }
  }, [refresh]);

  const deactivate = useCallback(async () => {
    if (!isElectronRuntime()) return;
    try {
      const electron = (window as any).electron;
      await electron.deactivateLicense?.();
      await refresh();
    } catch { /* best-effort */ }
  }, [refresh]);

  return { ...status, activate, deactivate, refresh };
}

// ── Utility: Feature Gating ─────────────────────────────────────

export function isFeatureAllowed(
  tier: string | null,
  requiredTier: "standard" | "professional" | "enterprise"
): boolean {
  if (!tier) return false;
  const tierOrder = ["standard", "professional", "enterprise"];
  return tierOrder.indexOf(tier) >= tierOrder.indexOf(requiredTier);
}
