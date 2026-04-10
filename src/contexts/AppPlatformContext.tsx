// ═══════════════════════════════════════════════════════════════
// SITA OS — App Platform Context
// Reactive state manager for app install lifecycle, permissions,
// dock pins, defaults, and receipts with Supabase persistence.
// ═══════════════════════════════════════════════════════════════

import {
  createContext, useContext, useCallback, useEffect, useMemo,
  useState, type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { APP_CATALOG, APP_BUNDLES } from "@/lib/app-platform/catalog";
import type {
  AppDefinition, AppInstallStatus, AppInstallScope,
  AppSandboxLevel, AppSourceOrigin, AppPackageType, AppUpdateMode,
  AppLifecycleReceipt, AppPermission,
} from "@/lib/app-platform/types";

// ── Persisted row shape ─────────────────────────────────────────

interface InstalledAppRow {
  id: string;
  user_id: string;
  app_id: string;
  install_status: string;
  install_scope: string;
  sandbox_level: string;
  source_origin: string;
  package_type: string;
  update_mode: string;
  permissions_granted: AppPermission[];
  dock_pinned: boolean;
  notification_enabled: boolean;
  startup_behavior: string;
  installed_at: string;
  updated_at: string;
}

interface DefaultAssocRow {
  id: string;
  user_id: string;
  role: string;
  app_id: string;
}

// ── Local state map ─────────────────────────────────────────────

interface AppUserState {
  installStatus: AppInstallStatus;
  installScope: AppInstallScope;
  sandboxLevel: AppSandboxLevel;
  sourceOrigin: AppSourceOrigin;
  packageType: AppPackageType;
  updateMode: AppUpdateMode;
  permissionsGranted: AppPermission[];
  dockPinned: boolean;
  notificationEnabled: boolean;
  startupBehavior: "none" | "background" | "visible";
  installedAt: string;
}

// ── Context shape ───────────────────────────────────────────────

interface AppPlatformContextValue {
  /** Get merged app definition with live user state */
  getApp: (id: string) => AppDefinition | undefined;
  /** All apps with live state applied */
  apps: AppDefinition[];
  /** Only installed */
  installedApps: AppDefinition[];
  /** Only update-available */
  updatableApps: AppDefinition[];

  /** Lifecycle actions */
  installApp: (appId: string, opts?: {
    scope?: AppInstallScope; sandbox?: AppSandboxLevel; sourceOrigin?: AppSourceOrigin;
  }) => Promise<void>;
  uninstallApp: (appId: string) => Promise<void>;
  updateApp: (appId: string) => Promise<void>;

  /** Permission management */
  togglePermission: (appId: string, permissionId: string) => void;

  /** Dock & launch */
  pinToDock: (appId: string) => void;
  unpinFromDock: (appId: string) => void;
  setStartupBehavior: (appId: string, behavior: "none" | "background" | "visible") => void;
  setNotificationEnabled: (appId: string, enabled: boolean) => void;

  /** Default apps */
  defaultApps: Record<string, string>; // role → appId
  setDefaultApp: (role: string, appId: string) => void;

  /** Receipts */
  receipts: AppLifecycleReceipt[];

  /** Loading */
  isLoading: boolean;
}

const AppPlatformContext = createContext<AppPlatformContextValue | null>(null);

export function useAppPlatform() {
  const ctx = useContext(AppPlatformContext);
  if (!ctx) throw new Error("useAppPlatform must be used within AppPlatformProvider");
  return ctx;
}

// ── Local storage fallback keys ─────────────────────────────────
const LS_APPS_KEY = "sita-installed-apps";
const LS_DEFAULTS_KEY = "sita-default-apps";
const LS_RECEIPTS_KEY = "sita-app-receipts";

function loadLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}
function saveLocal(key: string, data: unknown) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}

// ── Receipt generator ───────────────────────────────────────────

function makeReceipt(
  appId: string, actionType: AppLifecycleReceipt["actionType"],
  app: AppDefinition, extras: Partial<AppLifecycleReceipt> = {},
): AppLifecycleReceipt {
  return {
    receiptId: crypto.randomUUID(),
    appId,
    actionType,
    timestamp: new Date().toISOString(),
    actor: "user",
    version: app.version,
    sourceInfo: app.updateSource,
    permissionSummary: app.permissions.map(p => p.label),
    approvalStatus: "auto",
    result: "success",
    ...extras,
  };
}

// ── Provider ────────────────────────────────────────────────────

export function AppPlatformProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;

  // Core state: appId → user-specific overrides
  const [stateMap, setStateMap] = useState<Record<string, AppUserState>>(() => {
    // Initialize from catalog's pre-installed apps
    const init: Record<string, AppUserState> = {};
    APP_CATALOG.forEach(app => {
      if (app.installStatus === "installed") {
        init[app.id] = {
          installStatus: "installed",
          installScope: app.installScope ?? "user",
          sandboxLevel: app.sandboxLevel ?? "standard",
          sourceOrigin: app.sourceOrigin ?? "sita-store",
          packageType: app.packageType ?? "native-application",
          updateMode: app.updateMode ?? "store-managed",
          permissionsGranted: app.permissions.map(p => ({ ...p, granted: p.granted })),
          dockPinned: app.pinnedToDock,
          notificationEnabled: app.notificationPermission,
          startupBehavior: app.startupBehavior,
          installedAt: app.installedAt ?? new Date().toISOString(),
        };
      }
    });
    // Merge with localStorage if no user
    const saved = loadLocal<Record<string, AppUserState>>(LS_APPS_KEY, {});
    return { ...init, ...saved };
  });

  const [defaultApps, setDefaultApps] = useState<Record<string, string>>(() =>
    loadLocal<Record<string, string>>(LS_DEFAULTS_KEY, { browser: "chrome", email: "gmail", code: "vscode" })
  );

  const [receipts, setReceipts] = useState<AppLifecycleReceipt[]>(() =>
    loadLocal<AppLifecycleReceipt[]>(LS_RECEIPTS_KEY, [])
  );

  const [isLoading, setIsLoading] = useState(false);

  // ── Supabase hydration ──────────────────────────────────────
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    const hydrate = async () => {
      setIsLoading(true);
      try {
        // Load installed apps
        const { data: rows } = await supabase
          .from("installed_apps" as any)
          .select("*")
          .eq("user_id", userId);

        if (!cancelled && rows && (rows as any[]).length > 0) {
          const loaded: Record<string, AppUserState> = {};
          for (const r of rows as InstalledAppRow[]) {
            loaded[r.app_id] = {
              installStatus: r.install_status as AppInstallStatus,
              installScope: r.install_scope as AppInstallScope,
              sandboxLevel: r.sandbox_level as AppSandboxLevel,
              sourceOrigin: r.source_origin as AppSourceOrigin,
              packageType: r.package_type as AppPackageType,
              updateMode: r.update_mode as AppUpdateMode,
              permissionsGranted: (r.permissions_granted || []) as AppPermission[],
              dockPinned: r.dock_pinned,
              notificationEnabled: r.notification_enabled,
              startupBehavior: r.startup_behavior as "none" | "background" | "visible",
              installedAt: r.installed_at,
            };
          }
          setStateMap(prev => ({ ...prev, ...loaded }));
        }

        // Load default associations
        const { data: assocRows } = await supabase
          .from("app_default_associations" as any)
          .select("*")
          .eq("user_id", userId);

        if (!cancelled && assocRows && (assocRows as any[]).length > 0) {
          const loaded: Record<string, string> = {};
          for (const r of assocRows as DefaultAssocRow[]) {
            loaded[r.role] = r.app_id;
          }
          setDefaultApps(prev => ({ ...prev, ...loaded }));
        }
      } catch (err) {
        console.warn("[AppPlatform] hydration error:", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    hydrate();
    return () => { cancelled = true; };
  }, [userId]);

  // ── Persist to localStorage on state changes ────────────────
  useEffect(() => { saveLocal(LS_APPS_KEY, stateMap); }, [stateMap]);
  useEffect(() => { saveLocal(LS_DEFAULTS_KEY, defaultApps); }, [defaultApps]);
  useEffect(() => { saveLocal(LS_RECEIPTS_KEY, receipts); }, [receipts]);

  // ── Supabase persistence helpers ────────────────────────────
  const persistApp = useCallback(async (appId: string, state: AppUserState) => {
    if (!userId) return;
    try {
      await supabase.from("installed_apps" as any).upsert({
        user_id: userId,
        app_id: appId,
        install_status: state.installStatus,
        install_scope: state.installScope,
        sandbox_level: state.sandboxLevel,
        source_origin: state.sourceOrigin,
        package_type: state.packageType,
        update_mode: state.updateMode,
        permissions_granted: state.permissionsGranted,
        dock_pinned: state.dockPinned,
        notification_enabled: state.notificationEnabled,
        startup_behavior: state.startupBehavior,
        installed_at: state.installedAt,
      } as any, { onConflict: "user_id,app_id" } as any);
    } catch (err) {
      console.warn("[AppPlatform] persist error:", err);
    }
  }, [userId]);

  const removePersistedApp = useCallback(async (appId: string) => {
    if (!userId) return;
    try {
      await supabase.from("installed_apps" as any)
        .delete()
        .eq("user_id", userId)
        .eq("app_id", appId);
    } catch (err) {
      console.warn("[AppPlatform] delete error:", err);
    }
  }, [userId]);

  const persistDefault = useCallback(async (role: string, appId: string) => {
    if (!userId) return;
    try {
      await supabase.from("app_default_associations" as any).upsert({
        user_id: userId,
        role,
        app_id: appId,
      } as any, { onConflict: "user_id,role" } as any);
    } catch (err) {
      console.warn("[AppPlatform] persist default error:", err);
    }
  }, [userId]);

  // ── Actions ─────────────────────────────────────────────────

  const installApp = useCallback(async (appId: string, opts?: {
    scope?: AppInstallScope; sandbox?: AppSandboxLevel; sourceOrigin?: AppSourceOrigin;
  }) => {
    const catalogApp = APP_CATALOG.find(a => a.id === appId);
    if (!catalogApp) return;

    const newState: AppUserState = {
      installStatus: "installed",
      installScope: opts?.scope ?? "user",
      sandboxLevel: opts?.sandbox ?? "standard",
      sourceOrigin: opts?.sourceOrigin ?? catalogApp.sourceOrigin ?? "sita-store",
      packageType: catalogApp.packageType ?? "native-application",
      updateMode: catalogApp.updateMode ?? "store-managed",
      permissionsGranted: catalogApp.permissions.map(p => ({
        ...p,
        granted: p.required ? true : p.granted,
      })),
      dockPinned: false,
      notificationEnabled: catalogApp.notificationPermission,
      startupBehavior: catalogApp.startupBehavior,
      installedAt: new Date().toISOString(),
    };

    setStateMap(prev => ({ ...prev, [appId]: newState }));
    setReceipts(prev => [makeReceipt(appId, "install", catalogApp), ...prev]);
    await persistApp(appId, newState);
  }, [persistApp]);

  const uninstallApp = useCallback(async (appId: string) => {
    const catalogApp = APP_CATALOG.find(a => a.id === appId);
    if (!catalogApp) return;

    setStateMap(prev => {
      const next = { ...prev };
      delete next[appId];
      return next;
    });
    setReceipts(prev => [makeReceipt(appId, "uninstall", catalogApp), ...prev]);
    await removePersistedApp(appId);
  }, [removePersistedApp]);

  const updateApp = useCallback(async (appId: string) => {
    const catalogApp = APP_CATALOG.find(a => a.id === appId);
    if (!catalogApp) return;

    setStateMap(prev => {
      const existing = prev[appId];
      if (!existing) return prev;
      const updated = { ...existing, installStatus: "installed" as AppInstallStatus };
      persistApp(appId, updated);
      return { ...prev, [appId]: updated };
    });
    setReceipts(prev => [makeReceipt(appId, "update", catalogApp), ...prev]);
  }, [persistApp]);

  const togglePermission = useCallback((appId: string, permissionId: string) => {
    setStateMap(prev => {
      const existing = prev[appId];
      if (!existing) return prev;
      const perms = existing.permissionsGranted.map(p =>
        p.id === permissionId ? { ...p, granted: !p.granted } : p
      );
      const updated = { ...existing, permissionsGranted: perms };
      persistApp(appId, updated);

      const catalogApp = APP_CATALOG.find(a => a.id === appId);
      if (catalogApp) {
        setReceipts(r => [makeReceipt(appId, "permission-change", catalogApp, {
          permissionDelta: {
            added: perms.filter(p => p.id === permissionId && p.granted).map(p => p.label),
            removed: perms.filter(p => p.id === permissionId && !p.granted).map(p => p.label),
          },
        }), ...r]);
      }

      return { ...prev, [appId]: updated };
    });
  }, [persistApp]);

  const pinToDock = useCallback((appId: string) => {
    setStateMap(prev => {
      const existing = prev[appId];
      if (!existing) return prev;
      const updated = { ...existing, dockPinned: true };
      persistApp(appId, updated);
      return { ...prev, [appId]: updated };
    });
  }, [persistApp]);

  const unpinFromDock = useCallback((appId: string) => {
    setStateMap(prev => {
      const existing = prev[appId];
      if (!existing) return prev;
      const updated = { ...existing, dockPinned: false };
      persistApp(appId, updated);
      return { ...prev, [appId]: updated };
    });
  }, [persistApp]);

  const setStartupBehavior = useCallback((appId: string, behavior: "none" | "background" | "visible") => {
    setStateMap(prev => {
      const existing = prev[appId];
      if (!existing) return prev;
      const updated = { ...existing, startupBehavior: behavior };
      persistApp(appId, updated);
      return { ...prev, [appId]: updated };
    });
  }, [persistApp]);

  const setNotificationEnabled = useCallback((appId: string, enabled: boolean) => {
    setStateMap(prev => {
      const existing = prev[appId];
      if (!existing) return prev;
      const updated = { ...existing, notificationEnabled: enabled };
      persistApp(appId, updated);
      return { ...prev, [appId]: updated };
    });
  }, [persistApp]);

  const setDefaultApp = useCallback((role: string, appId: string) => {
    setDefaultApps(prev => ({ ...prev, [role]: appId }));
    persistDefault(role, appId);
  }, [persistDefault]);

  // ── Derived: merge catalog with live state ──────────────────

  const apps = useMemo(() => {
    return APP_CATALOG.map(app => {
      const userState = stateMap[app.id];
      if (!userState) return { ...app, installStatus: "not-installed" as AppInstallStatus };
      return {
        ...app,
        installStatus: userState.installStatus,
        installScope: userState.installScope,
        sandboxLevel: userState.sandboxLevel,
        sourceOrigin: userState.sourceOrigin,
        packageType: userState.packageType,
        updateMode: userState.updateMode,
        permissions: userState.permissionsGranted,
        pinnedToDock: userState.dockPinned,
        notificationPermission: userState.notificationEnabled,
        startupBehavior: userState.startupBehavior,
        installedAt: userState.installedAt,
      };
    });
  }, [stateMap]);

  const installedApps = useMemo(() =>
    apps.filter(a => a.installStatus === "installed"), [apps]
  );

  const updatableApps = useMemo(() =>
    apps.filter(a => a.installStatus === "update-available"), [apps]
  );

  const getApp = useCallback((id: string) =>
    apps.find(a => a.id === id), [apps]
  );

  const value = useMemo<AppPlatformContextValue>(() => ({
    getApp, apps, installedApps, updatableApps,
    installApp, uninstallApp, updateApp,
    togglePermission,
    pinToDock, unpinFromDock, setStartupBehavior, setNotificationEnabled,
    defaultApps, setDefaultApp,
    receipts,
    isLoading,
  }), [
    getApp, apps, installedApps, updatableApps,
    installApp, uninstallApp, updateApp,
    togglePermission,
    pinToDock, unpinFromDock, setStartupBehavior, setNotificationEnabled,
    defaultApps, setDefaultApp,
    receipts, isLoading,
  ]);

  return (
    <AppPlatformContext.Provider value={value}>
      {children}
    </AppPlatformContext.Provider>
  );
}
