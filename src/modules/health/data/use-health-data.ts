// ════════════════════════════════════════════════════════════════
// Health OS — React Query hooks (Phase 3)
// Mutations emit Trust receipts via the registered registry.
// ════════════════════════════════════════════════════════════════

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { emitRegisteredTrustAction } from "@/modules/_trust/registry/emit-registered";
import {
  cancelAppointment,
  createAppointment,
  createReminder,
  createWearableConnection,
  deleteMetric,
  deleteReminder,
  fetchAppointments,
  fetchHealthProfile,
  fetchMetricLogs,
  fetchReminders,
  fetchSyncEvents,
  fetchWearableConnections,
  logMetric,
  recordSyncAttempt,
  revokeWearableConnection,
  toggleReminderPause,
  upsertHealthProfile,
  type HealthAppointment,
  type HealthProfile,
  type HealthReminder,
  type WearableConnection,
  type WearableProvider,
} from "./health-data-service";

// Profile
export function useHealthProfile() {
  return useQuery({ queryKey: ["health", "profile"], queryFn: fetchHealthProfile });
}

export function useUpsertHealthProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<HealthProfile>) => {
      const result = await emitRegisteredTrustAction("health.profile.update", {
        impactSummary: "Update sensitive health profile fields",
        payload: { fields: Object.keys(patch) },
      });
      if (result.blocked) throw new Error(result.blockedReason ?? "Action blocked");
      return upsertHealthProfile(patch);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["health", "profile"] });
      toast.success("Health profile updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// Metrics
export function useMetricLogs(opts?: { kind?: string; limit?: number }) {
  return useQuery({
    queryKey: ["health", "metrics", opts?.kind ?? "all", opts?.limit ?? 100],
    queryFn: () => fetchMetricLogs(opts),
  });
}

export function useLogMetric() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Parameters<typeof logMetric>[0]) => {
      const result = await emitRegisteredTrustAction("health.metric.log", {
        impactSummary: `Log ${input.metric_kind}`,
        payload: { metric_kind: input.metric_kind },
      });
      if (result.blocked) throw new Error(result.blockedReason ?? "Action blocked");
      return logMetric(input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["health", "metrics"] });
      toast.success("Metric logged");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteMetric() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteMetric,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["health", "metrics"] }),
  });
}

// Wearables
export function useWearableConnections() {
  return useQuery({ queryKey: ["health", "wearables"], queryFn: fetchWearableConnections });
}

export function useCreateWearableConnection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { provider: WearableProvider; account_label?: string; scopes?: string[] }) => {
      const result = await emitRegisteredTrustAction("health.wearable.connect", {
        impactSummary: `Connect ${input.provider}`,
        payload: { provider: input.provider },
      });
      if (result.blocked) throw new Error(result.blockedReason ?? "Action blocked");
      return createWearableConnection(input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["health", "wearables"] });
      toast.success("Wearable connection created");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useRevokeWearable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await emitRegisteredTrustAction("health.wearable.revoke", {
        impactSummary: "Disconnect wearable provider",
        payload: { connection_id: id },
      });
      if (result.blocked) throw new Error(result.blockedReason ?? "Action blocked");
      return revokeWearableConnection(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["health", "wearables"] });
      toast.success("Wearable disconnected");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useSyncWearable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await emitRegisteredTrustAction("health.wearable.sync", {
        impactSummary: "Sync wearable data",
        payload: { connection_id: id },
      });
      if (result.blocked) throw new Error(result.blockedReason ?? "Action blocked");
      // Phase 3 placeholder: real provider sync happens server-side. Locally we
      // just record a sync attempt with 0 signals so the audit trail is honest.
      return recordSyncAttempt({ connection_id: id, status: "success", signal_count: 0 });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["health", "wearables"] });
      qc.invalidateQueries({ queryKey: ["health", "syncs"] });
      toast.success("Sync recorded");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useSyncEvents(connectionId?: string) {
  return useQuery({
    queryKey: ["health", "syncs", connectionId ?? "all"],
    queryFn: () => fetchSyncEvents(connectionId),
  });
}

// Reminders
export function useReminders() {
  return useQuery({ queryKey: ["health", "reminders"], queryFn: fetchReminders });
}

export function useCreateReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<HealthReminder> & { title: string }) => {
      const result = await emitRegisteredTrustAction("health.reminder.create", {
        impactSummary: `Create reminder: ${input.title}`,
      });
      if (result.blocked) throw new Error(result.blockedReason ?? "Action blocked");
      return createReminder(input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["health", "reminders"] });
      toast.success("Reminder created");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useToggleReminderPause() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, paused }: { id: string; paused: boolean }) => toggleReminderPause(id, paused),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["health", "reminders"] }),
  });
}

export function useDeleteReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteReminder,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["health", "reminders"] }),
  });
}

// Appointments
export function useAppointments() {
  return useQuery({ queryKey: ["health", "appointments"], queryFn: fetchAppointments });
}

export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<HealthAppointment> & { provider_name: string; appointment_at: string }) => {
      const result = await emitRegisteredTrustAction("health.appointment.book", {
        impactSummary: `Book appointment with ${input.provider_name}`,
      });
      if (result.blocked) throw new Error(result.blockedReason ?? "Action blocked");
      return createAppointment(input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["health", "appointments"] });
      toast.success("Appointment created");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useCancelAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await emitRegisteredTrustAction("health.appointment.cancel", {
        impactSummary: "Cancel appointment",
        payload: { appointment_id: id },
      });
      if (result.blocked) throw new Error(result.blockedReason ?? "Action blocked");
      return cancelAppointment(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["health", "appointments"] });
      toast.success("Appointment cancelled");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}