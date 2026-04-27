// ═══════════════════════════════════════════════════════════════
// SITA OS — App Platform Context (DB-backed)
//
// Now sources the app catalog AND per-user install state from the
// real Supabase tables (`apps` + `installed_apps`) via React Query
// hooks, then maps every row through `db-app-adapter` so the rest
// of the OS keeps consuming the same `AppDefinition` shape.
//
// The local APP_CATALOG fallback is preserved for offline-only mode.
// ═══════════════════════════════════════════════════════════════

import {
  createContext, useContext, useCallback, useMemo,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { APP_CATALOG } from "@/lib/app-platform/catalog";
import { dbRowsToAppDefinitions } from "@/lib/app-platform/db-app-adapter";
import {
  useAppCatalog,
  useInstalledApps,
  useAppInstall,
  useAppUninstall,
  useAppPin,
  useAppFavorite,
  useSetAppPermissions,
} from "@/hooks/use-app-platform";
import type {
  AppDefinition, AppInstallStatus, AppInstallScope,
  AppSandboxLevel, AppSourceOrigin,
  AppLifecycleReceipt,
} from "@/domains/apps/types";

// ── Context shape (PUBLIC API — DO NOT BREAK) ───────────────────

interface AppPlatformContextValue {
  getApp: (id: string) => AppDefinition | undefined;
  apps: AppDefinition[];
  installedApps: AppDefinition[];
  updatableApps: AppDefinition[];

  installApp: (appId: string, opts?: {
    scope?: AppInstallScope; sandbox?: AppSandboxLevel; sourceOrigin?: AppSourceOrigin;
  }) => Promise<void>;
  uninstallApp: (appId: string) => Promise<void>;
  updateApp: (appId: string) => Promise<void>;

  togglePermission: (appId: string, permissionId: string) => void;

  pinToDock: (appId: string) => void;
  unpinFromDock: (appId: string) => void;
  setStartupBehavior: (appId: string, behavior: "none" | "background" | "visible") => void;
  setNotificationEnabled: (appId: string, enabled: boolean) => void;

  defaultApps: Record<string, string>;
  setDefaultApp: (role: string, appId: string) => void;

  receipts: AppLifecycleReceipt[];

  isLoading: boolean;
}

const AppPlatformContext = createContext<AppPlatformContextValue | null>(null);

export function useAppPlatform() {
  const ctx = useContext(AppPlatformContext);
  if (!ctx) throw new Error("useAppPlatform must be used within AppPlatformProvider");
  return ctx;
}

// ── Local-only persistence for default-app associations & receipts
const LS_DEFAULTS_KEY = "sita-default-apps";
const LS_RECEIPTS_KEY = "sita-app-receipts";

function loadLocal<T>(key: string, fallback: T): T {
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(key) : null;
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}
function saveLocal(key: string, data: unknown) {
  try { if (typeof localStorage !== "undefined") localStorage.setItem(key, JSON.stringify(data)); } catch { /* noop */ }
}

function makeReceipt(
  appId: string,
  actionType: AppLifecycleReceipt["actionType"],
  app: AppDefinition,
): AppLifecycleReceipt {
  return {
    receiptId: typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `r_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    appId,
    actionType,
    timestamp: new Date().toISOString(),
    actor: "user",
    version: app.version,
    sourceInfo: app.updateSource,
    permissionSummary: app.permissions.map((p) => p.label),
    approvalStatus: "auto",
    result: "success",
  };
}

// ── Provider ────────────────────────────────────────────────────

export function AppPlatformProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const qc = useQueryClient();

  // ── DB-backed sources of truth ────────────────────────────
  const catalogQ = useAppCatalog({ limit: 500 });
  const installedQ = useInstalledApps();

  const installMut = useAppInstall();
  const uninstallMut = useAppUninstall();
  const pinMut = useAppPin();
  const favMut = useAppFavorite();
  const permsMut = useSetAppPermissions();

  // ── Apps merged with per-user install state ────────────────
  const apps = useMemo<AppDefinition[]>(() => {
    const catalog = catalogQ.data ?? [];
    const installed = installedQ.data ?? [];

    if (catalog.length > 0) {
      return dbRowsToAppDefinitions(catalog, installed);
    }
    // Offline / first-load fallback so nothing renders empty.
    return APP_CATALOG.map((a) => ({ ...a, installStatus: "not-installed" as AppInstallStatus }));
  }, [catalogQ.data, installedQ.data]);

  const installedApps = useMemo(
    () => apps.filter((a) => a.installStatus === "installed" || a.installStatus === "update-available"),
    [apps],
  );
  const updatableApps = useMemo(
    () => apps.filter((a) => a.installStatus === "update-available"),
    [apps],
  );

  const getApp = useCallback((id: string) => apps.find((a) => a.id === id), [apps]);

  // ── Default-apps (client-only for now) ─────────────────────
  const defaultApps = useMemo<Record<string, string>>(
    () => loadLocal(LS_DEFAULTS_KEY, { browser: "chrome-desktop", email: "gmail", code: "vscode-desktop" }),
    [],
  );
  const setDefaultApp = useCallback((role: string, appId: string) => {
    const next = { ...defaultApps, [role]: appId };
    saveLocal(LS_DEFAULTS_KEY, next);
  }, [defaultApps]);

  // ── Receipts (client-cached audit log) ─────────────────────
  const receipts = useMemo<AppLifecycleReceipt[]>(
    () => loadLocal(LS_RECEIPTS_KEY, []),
    [],
  );
  const pushReceipt = useCallback((r: AppLifecycleReceipt) => {
    const next = [r, ...receipts].slice(0, 200);
    saveLocal(LS_RECEIPTS_KEY, next);
  }, [receipts]);

  // ── Lifecycle actions ──────────────────────────────────────
  const installApp = useCallback(async (appId: string) => {
    if (!user) {
      toast.error("Sign in to install apps");
      return;
    }
    try {
      await installMut.mutateAsync(appId);
      const app = apps.find((a) => a.id === appId);
      if (app) pushReceipt(makeReceipt(appId, "install", app));
    } catch (e) {
      console.warn("[AppPlatform] install failed", e);
      toast.error("Install failed");
    }
  }, [user, apps, installMut, pushReceipt]);

  const uninstallApp = useCallback(async (appId: string) => {
    if (!user) return;
    try {
      await uninstallMut.mutateAsync(appId);
      const app = apps.find((a) => a.id === appId);
      if (app) pushReceipt(makeReceipt(appId, "uninstall", app));
    } catch (e) {
      console.warn("[AppPlatform] uninstall failed", e);
      toast.error("Uninstall failed");
    }
  }, [user, apps, uninstallMut, pushReceipt]);

  const updateApp = useCallback(async (appId: string) => {
    if (!user) return;
    // Re-running install acts as an update via the edge function.
    try {
      await installMut.mutateAsync(appId);
      const app = apps.find((a) => a.id === appId);
      if (app) pushReceipt(makeReceipt(appId, "update", app));
      qc.invalidateQueries({ queryKey: ["app-updates"] });
    } catch (e) {
      console.warn("[AppPlatform] update failed", e);
      toast.error("Update failed");
    }
  }, [user, apps, installMut, qc, pushReceipt]);

  const togglePermission = useCallback((appId: string, permissionId: string) => {
    const app = apps.find((a) => a.id === appId);
    if (!app) return;
    const current = app.permissions.find((p) => p.id === permissionId);
    if (!current) return;
    const nextGranted = !current.granted;
    permsMut.mutate({
      appId,
      grants: [{ key: permissionId, granted: nextGranted }],
    });
    pushReceipt({
      ...makeReceipt(appId, "permission-change", app),
      permissionDelta: nextGranted
        ? { added: [current.label], removed: [] }
        : { added: [], removed: [current.label] },
    });
  }, [apps, permsMut, pushReceipt]);

  const pinToDock = useCallback((appId: string) => {
    if (!user) return;
    pinMut.mutate({ appId, pinned: true });
  }, [user, pinMut]);

  const unpinFromDock = useCallback((appId: string) => {
    if (!user) return;
    pinMut.mutate({ appId, pinned: false });
  }, [user, pinMut]);

  // Startup / notification toggles persist into installed_apps.config_json
  const setStartupBehavior = useCallback((appId: string, behavior: "none" | "background" | "visible") => {
    if (!user) return;
    favMut.mutate({ appId, favorite: false }); // placeholder no-op to keep RQ in sync
    // Best-effort patch via direct table update
    void updateConfigJson(appId, user.id, { startupBehavior: behavior }, qc);
  }, [user, favMut, qc]);

  const setNotificationEnabled = useCallback((appId: string, enabled: boolean) => {
    if (!user) return;
    void updateConfigJson(appId, user.id, { notificationEnabled: enabled }, qc);
  }, [user, qc]);

  const isLoading = catalogQ.isLoading || installedQ.isLoading;

  const value = useMemo<AppPlatformContextValue>(() => ({
    getApp, apps, installedApps, updatableApps,
    installApp, uninstallApp, updateApp,
    togglePermission,
    pinToDock, unpinFromDock,
    setStartupBehavior, setNotificationEnabled,
    defaultApps, setDefaultApp,
    receipts,
    isLoading,
  }), [
    getApp, apps, installedApps, updatableApps,
    installApp, uninstallApp, updateApp,
    togglePermission,
    pinToDock, unpinFromDock,
    setStartupBehavior, setNotificationEnabled,
    defaultApps, setDefaultApp,
    receipts, isLoading,
  ]);

  return (
    <AppPlatformContext.Provider value={value}>
      {children}
    </AppPlatformContext.Provider>
  );
}

// ── Lazy helper to merge config_json without a dedicated edge fn ─
async function updateConfigJson(
  appId: string,
  userId: string,
  patch: Record<string, unknown>,
  qc: ReturnType<typeof useQueryClient>,
) {
  try {
    const { supabase } = await import("@/integrations/supabase/client");
    const sb = supabase as unknown as { from: (t: string) => any };
    const { data: row } = await sb
      .from("installed_apps")
      .select("config_json")
      .eq("user_id", userId)
      .eq("app_id", appId)
      .maybeSingle();
    const merged = { ...(row?.config_json ?? {}), ...patch };
    await sb
      .from("installed_apps")
      .update({ config_json: merged })
      .eq("user_id", userId)
      .eq("app_id", appId);
    qc.invalidateQueries({ queryKey: ["installed-apps", userId] });
  } catch (e) {
    console.warn("[AppPlatform] updateConfigJson failed", e);
  }
}
