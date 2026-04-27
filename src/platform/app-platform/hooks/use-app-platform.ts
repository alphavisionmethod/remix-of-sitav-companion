// React Query hooks for the App Platform

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { catalogService, type CatalogApp, type CatalogFilters } from "@/lib/services/app-store/catalog.service";
import { installService, type InstalledAppRow } from "@/lib/services/app-store/install.service";
import { launchService } from "@/lib/services/app-store/launch.service";
import { updateService } from "@/lib/services/app-store/update.service";
import { permissionsService } from "@/lib/services/app-store/permissions.service";
import { recentsService } from "@/lib/services/app-store/recents.service";

// Re-export ingestion + verification hooks so app-platform consumers
// can pull everything from a single barrel.
export {
  useIngestWebApp,
  useIngestPwa,
  useCaptureScreenshot,
  useIngestionJob,
  useVerifyPackage,
} from "@/platform/app-platform/hooks/use-app-ingestion";

export function useAppCatalog(filters: CatalogFilters = {}) {
  return useQuery({
    queryKey: ["app-catalog", filters],
    queryFn: () => catalogService.list(filters),
    staleTime: 60_000,
  });
}

/** Global app search — used by command palette / launcher search. */
export function useAppSearch(query: string, limit = 20) {
  const trimmed = query.trim();
  return useQuery({
    queryKey: ["app-search", trimmed, limit],
    queryFn: () => catalogService.list({ search: trimmed, limit }),
    enabled: trimmed.length >= 2,
    staleTime: 30_000,
  });
}

export function useAppDetail(appId: string | null | undefined) {
  return useQuery({
    queryKey: ["app-detail", appId],
    queryFn: () => (appId ? catalogService.getByAppId(appId) : Promise.resolve(null)),
    enabled: !!appId,
    staleTime: 60_000,
  });
}

export function useFeaturedApps(limit = 8) {
  return useQuery({
    queryKey: ["app-catalog-featured", limit],
    queryFn: () => catalogService.featured(limit),
    staleTime: 60_000,
  });
}

export function useInstalledApps() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["installed-apps", user?.id],
    queryFn: () => (user ? installService.listForUser(user.id) : Promise.resolve([] as InstalledAppRow[])),
    enabled: !!user,
    staleTime: 30_000,
  });
}

export function useAppInstall() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (appId: string) => installService.install(appId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["installed-apps", user?.id] });
      qc.invalidateQueries({ queryKey: ["app-updates"] });
    },
  });
}

export function useAppUninstall() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (appId: string) => installService.uninstall(appId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["installed-apps", user?.id] });
    },
  });
}

export function useAppPin() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (args: { appId: string; pinned: boolean; order?: number }) => {
      if (!user) throw new Error("not_authenticated");
      return installService.setPinned(user.id, args.appId, args.pinned, args.order);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["installed-apps", user?.id] }),
  });
}

export function useAppFavorite() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (args: { appId: string; favorite: boolean }) => {
      if (!user) throw new Error("not_authenticated");
      return installService.setFavorite(user.id, args.appId, args.favorite);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["installed-apps", user?.id] }),
  });
}

export function useAppLaunch() {
  const qc = useQueryClient();
  const { user, session } = useAuth();
  return useMutation({
    mutationFn: async (app: CatalogApp) => {
      const installedRows = qc.getQueryData<InstalledAppRow[]>(["installed-apps", user?.id]);
      const installed = installedRows?.find((r) => r.app_id === app.app_id);
      const instruction = launchService.resolveClient(app, !!session, installed);
      const exec = await launchService.execute(instruction);
      try {
        await launchService.recordLaunch({
          appId: app.app_id,
          launchResult: exec.ok ? "success" : "degraded",
        });
      } catch {
        // telemetry failure is non-fatal
      }
      return { instruction, exec };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["installed-apps", user?.id] }),
  });
}

export function useAppUpdates() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["app-updates", user?.id],
    queryFn: () => updateService.check(),
    enabled: !!user,
    staleTime: 5 * 60_000,
  });
}

export function useAppPermissions(appId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["app-permissions", user?.id, appId],
    queryFn: () => (user ? permissionsService.listForUser(user.id, appId) : Promise.resolve([])),
    enabled: !!user,
  });
}

export function useSetAppPermissions() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (args: { appId: string; grants: Array<{ key: string; granted: boolean }> }) =>
      permissionsService.setGrants(args.appId, args.grants),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["app-permissions", user?.id, vars.appId] });
    },
  });
}

export function useAppRecents(limit = 12) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["app-recents", user?.id, limit],
    queryFn: () => (user ? recentsService.listForUser(user.id, limit) : Promise.resolve([])),
    enabled: !!user,
    staleTime: 30_000,
  });
}
