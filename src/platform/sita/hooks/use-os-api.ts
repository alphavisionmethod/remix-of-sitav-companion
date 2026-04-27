// ═══════════════════════════════════════════════════════════════
// SITA OS — React Query Hooks for OS API
// Typed hooks consuming the os-api-client SDK
// ═══════════════════════════════════════════════════════════════

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { osApi, type CreateCommandParams, type OsPolicy, type ManagedApp, type PaginationParams } from "@/lib/api/os-api-client";
import { useToast } from "@/hooks/use-toast";

// ── Helpers ────────────────────────────────────────────────────

function useApiMutation<TParams, TResult>(
  mutationFn: (params: TParams) => Promise<{ data: TResult | null; error: string | null }>,
  invalidateKeys: string[],
  successMessage?: string,
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: TParams) => {
      const result = await mutationFn(params);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: () => {
      invalidateKeys.forEach(key => queryClient.invalidateQueries({ queryKey: [key] }));
      if (successMessage) toast({ title: successMessage });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// DOMAIN HOOKS
// ═══════════════════════════════════════════════════════════════

// ── Auth ──────────────────────────────────────────────────────

export function useAuthProfile() {
  return useQuery({
    queryKey: ["os-api", "auth", "me"],
    queryFn: async () => {
      const r = await osApi.auth.me();
      if (r.error) throw new Error(r.error);
      return r.data;
    },
    staleTime: 60_000,
  });
}

// ── Devices ──────────────────────────────────────────────────

export function useDevices() {
  return useQuery({
    queryKey: ["os-api", "devices"],
    queryFn: async () => {
      const r = await osApi.devices.list();
      if (r.error) throw new Error(r.error);
      return r.data?.devices || [];
    },
    staleTime: 30_000,
  });
}

export function useDevice(id: string) {
  return useQuery({
    queryKey: ["os-api", "devices", id],
    queryFn: async () => {
      const r = await osApi.devices.get(id);
      if (r.error) throw new Error(r.error);
      return r.data;
    },
    enabled: !!id,
  });
}

export function useDeviceLock() {
  return useApiMutation(
    (id: string) => osApi.devices.lock(id),
    ["os-api"],
    "Device lock command sent",
  );
}

export function useDeviceWipe() {
  return useApiMutation(
    (id: string) => osApi.devices.wipe(id),
    ["os-api"],
    "Device wipe command sent",
  );
}

export function useRegisterDevice() {
  return useApiMutation(
    (params: Record<string, unknown>) => osApi.devices.register(params),
    ["os-api", "devices"],
    "Device registered",
  );
}

// ── Commands ─────────────────────────────────────────────────

export function useCommands(params?: PaginationParams) {
  return useQuery({
    queryKey: ["os-api", "commands", params],
    queryFn: async () => {
      const r = await osApi.commands.list(params);
      if (r.error) throw new Error(r.error);
      return r.data?.commands || [];
    },
    staleTime: 10_000,
  });
}

export function useCommand(id: string) {
  return useQuery({
    queryKey: ["os-api", "commands", id],
    queryFn: async () => {
      const r = await osApi.commands.get(id);
      if (r.error) throw new Error(r.error);
      return r.data;
    },
    enabled: !!id,
    refetchInterval: 5_000, // Poll for status updates
  });
}

export function useCreateCommand() {
  return useApiMutation(
    (params: CreateCommandParams) => osApi.commands.create(params),
    ["os-api", "commands"],
    "Command submitted",
  );
}

export function useApproveCommand() {
  return useApiMutation(
    (id: string) => osApi.commands.approve(id),
    ["os-api", "commands"],
    "Command approved",
  );
}

export function useDenyCommand() {
  return useApiMutation(
    (id: string) => osApi.commands.deny(id),
    ["os-api", "commands"],
    "Command denied",
  );
}

export function useCancelCommand() {
  return useApiMutation(
    (id: string) => osApi.commands.cancel(id),
    ["os-api", "commands"],
    "Command canceled",
  );
}

export function useSimulateCommand() {
  return useApiMutation(
    (params: CreateCommandParams) => osApi.commands.simulate(params),
    ["os-api", "commands"],
    "Simulation started",
  );
}

// ── System Status ────────────────────────────────────────────

export function useSystemStatus() {
  return useQuery({
    queryKey: ["os-api", "system", "status"],
    queryFn: async () => {
      const r = await osApi.system.status();
      if (r.error) throw new Error(r.error);
      return r.data;
    },
    refetchInterval: 30_000,
  });
}

export function useSystemHealth() {
  return useQuery({
    queryKey: ["os-api", "system", "health"],
    queryFn: async () => {
      const r = await osApi.system.health();
      if (r.error) throw new Error(r.error);
      return r.data;
    },
    staleTime: 30_000,
  });
}

export function useSystemMetrics() {
  return useQuery({
    queryKey: ["os-api", "system", "metrics"],
    queryFn: async () => {
      const r = await osApi.system.metrics();
      if (r.error) throw new Error(r.error);
      return r.data?.metrics || [];
    },
  });
}

export function useSystemAnomalies() {
  return useQuery({
    queryKey: ["os-api", "system", "anomalies"],
    queryFn: async () => {
      const r = await osApi.system.anomalies();
      if (r.error) throw new Error(r.error);
      return r.data?.anomalies || [];
    },
    refetchInterval: 60_000,
  });
}

// ── Sync ─────────────────────────────────────────────────────

export function useSyncStatus() {
  return useQuery({
    queryKey: ["os-api", "sync", "status"],
    queryFn: async () => {
      const r = await osApi.sync.status();
      if (r.error) throw new Error(r.error);
      return r.data;
    },
    staleTime: 15_000,
  });
}

export function useSyncConflicts() {
  return useQuery({
    queryKey: ["os-api", "sync", "conflicts"],
    queryFn: async () => {
      const r = await osApi.sync.conflicts();
      if (r.error) throw new Error(r.error);
      return r.data?.conflicts || [];
    },
  });
}

export function useSyncControl() {
  const trigger = useApiMutation(
    (params?: Record<string, unknown>) => osApi.sync.trigger(params),
    ["os-api", "sync"],
    "Sync triggered",
  );
  const pause = useApiMutation(
    () => osApi.sync.pause(),
    ["os-api", "sync"],
    "Sync paused",
  );
  const resume = useApiMutation(
    () => osApi.sync.resume(),
    ["os-api", "sync"],
    "Sync resumed",
  );
  const resolveConflict = useApiMutation(
    (params: { conflictId: string; resolution?: string }) =>
      osApi.sync.resolveConflict(params.conflictId, params.resolution),
    ["os-api", "sync"],
    "Conflict resolved",
  );

  return { trigger, pause, resume, resolveConflict };
}

// ── Security ─────────────────────────────────────────────────

export function useSecurityPosture() {
  return useQuery({
    queryKey: ["os-api", "security", "status"],
    queryFn: async () => {
      const r = await osApi.security.status();
      if (r.error) throw new Error(r.error);
      return r.data;
    },
    staleTime: 30_000,
  });
}

export function useSecurityPendingApprovals() {
  return useQuery({
    queryKey: ["os-api", "security", "approvals"],
    queryFn: async () => {
      const r = await osApi.security.pendingApprovals();
      if (r.error) throw new Error(r.error);
      return r.data?.approvals || [];
    },
  });
}

export function useSecurityApprove() {
  return useApiMutation(
    (id: string) => osApi.security.approve(id),
    ["os-api", "security"],
    "Action approved",
  );
}

export function useSecurityDeny() {
  return useApiMutation(
    (id: string) => osApi.security.deny(id),
    ["os-api", "security"],
    "Action denied",
  );
}

export function useEmergencyLock() {
  return useApiMutation(
    () => osApi.security.emergencyLock(),
    ["os-api", "security", "devices"],
    "Emergency lock activated",
  );
}

// ── Notifications ────────────────────────────────────────────

export function useNotifications() {
  return useQuery({
    queryKey: ["os-api", "notifications"],
    queryFn: async () => {
      const r = await osApi.notifications.list();
      if (r.error) throw new Error(r.error);
      return r.data?.notifications || [];
    },
    staleTime: 15_000,
  });
}

export function useNotificationManager() {
  const markRead = useApiMutation(
    (ids: string[]) => osApi.notifications.markRead(ids),
    ["os-api", "notifications"],
  );
  const takeAction = useApiMutation(
    (params: { id: string; action: string }) =>
      osApi.notifications.action(params.id, params.action),
    ["os-api", "notifications"],
  );

  return { markRead, takeAction };
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: ["os-api", "notifications", "preferences"],
    queryFn: async () => {
      const r = await osApi.notifications.preferences();
      if (r.error) throw new Error(r.error);
      return r.data;
    },
  });
}

export function useUpdateNotificationPreferences() {
  return useApiMutation(
    (prefs: Record<string, unknown>) => osApi.notifications.updatePreferences(prefs),
    ["os-api", "notifications", "preferences"],
    "Preferences updated",
  );
}

// ── Audit ────────────────────────────────────────────────────

export function useAuditTimeline() {
  return useQuery({
    queryKey: ["os-api", "audit", "events"],
    queryFn: async () => {
      const r = await osApi.audit.events();
      if (r.error) throw new Error(r.error);
      return r.data?.events || [];
    },
  });
}

export function useUnifiedTimeline() {
  return useQuery({
    queryKey: ["os-api", "timeline"],
    queryFn: async () => {
      const r = await osApi.timeline.get();
      if (r.error) throw new Error(r.error);
      return r.data?.timeline || [];
    },
    staleTime: 15_000,
  });
}

// ── Updates ──────────────────────────────────────────────────

export function useUpdateControl() {
  const install = useApiMutation(
    (params: { deviceId: string; version?: string }) =>
      osApi.updates.install(params.deviceId, params.version),
    ["os-api", "updates"],
    "Update install requested",
  );
  const schedule = useApiMutation(
    (params: { deviceId: string; scheduledAt: string }) =>
      osApi.updates.schedule(params.deviceId, params.scheduledAt),
    ["os-api", "updates"],
    "Update scheduled",
  );
  const rollback = useApiMutation(
    (deviceId: string) => osApi.updates.rollback(deviceId),
    ["os-api", "updates"],
    "Rollback requested",
  );

  return { install, schedule, rollback };
}

export function useUpdateHistory() {
  return useQuery({
    queryKey: ["os-api", "updates", "history"],
    queryFn: async () => {
      const r = await osApi.updates.history();
      if (r.error) throw new Error(r.error);
      return r.data?.history || [];
    },
  });
}

// ── Policies ─────────────────────────────────────────────────

export function usePolicies() {
  return useQuery({
    queryKey: ["os-api", "policies"],
    queryFn: async () => {
      const r = await osApi.policies.list();
      if (r.error) throw new Error(r.error);
      return r.data?.policies || [];
    },
  });
}

export function usePolicyManager() {
  const create = useApiMutation(
    (params: Partial<OsPolicy>) => osApi.policies.create(params),
    ["os-api", "policies"],
    "Policy created",
  );
  const update = useApiMutation(
    (params: { id: string; data: Partial<OsPolicy> }) =>
      osApi.policies.update(params.id, params.data),
    ["os-api", "policies"],
    "Policy updated",
  );
  const simulate = useApiMutation(
    (params: Record<string, unknown>) => osApi.policies.simulate(params),
    ["os-api", "policies"],
  );

  return { create, update, simulate };
}

// ── Apps ──────────────────────────────────────────────────────

export function useManagedApps() {
  return useQuery({
    queryKey: ["os-api", "apps"],
    queryFn: async () => {
      const r = await osApi.apps.list();
      if (r.error) throw new Error(r.error);
      return r.data?.apps || [];
    },
  });
}

export function useAppManager() {
  const install = useApiMutation(
    (params: Partial<ManagedApp>) => osApi.apps.install(params),
    ["os-api", "apps"],
    "App installed",
  );
  const remove = useApiMutation(
    (appId: string) => osApi.apps.remove(appId),
    ["os-api", "apps"],
    "App removed",
  );
  const update = useApiMutation(
    (params: { appId: string; version?: string }) =>
      osApi.apps.update(params.appId, params.version),
    ["os-api", "apps"],
    "App updated",
  );

  return { install, remove, update };
}

// ── Logs ──────────────────────────────────────────────────────

export function useActivityLogs() {
  return useQuery({
    queryKey: ["os-api", "logs"],
    queryFn: async () => {
      const r = await osApi.logs.list();
      if (r.error) throw new Error(r.error);
      return r.data?.logs || [];
    },
  });
}
