// ═══════════════════════════════════════════════════════════════
// SITA OS — DWE (Device & Wearable Experience) Row Types
// Extracted from Database['public']['Tables'] for typed queries
// ═══════════════════════════════════════════════════════════════

import type { Database } from "@/integrations/supabase/types";

type Tables = Database["public"]["Tables"];

export type ConnectedDeviceRow = Tables["connected_devices"]["Row"];
export type DeviceFamilyRow = Tables["device_families"]["Row"];
export type PresenceStateRow = Tables["presence_states"]["Row"];
export type HandoffSessionRow = Tables["handoff_sessions"]["Row"];
export type ContextContinuityRow = Tables["context_continuity_records"]["Row"];
export type WearableProviderRow = Tables["wearable_providers"]["Row"];
export type WearableSignalRow = Tables["wearable_signals"]["Row"];
export type HealthSignalConsentRow = Tables["health_signal_consents"]["Row"];
export type ReadinessStateRow = Tables["readiness_states"]["Row"];
export type AmbientNotificationRouteRow = Tables["ambient_notification_routes"]["Row"];
export type NotificationFatigueProfileRow = Tables["notification_fatigue_profiles"]["Row"];
export type InterruptionPolicyRow = Tables["interruption_policies"]["Row"];
export type DeviceTrustRecordRow = Tables["device_trust_records"]["Row"];
export type MicroApprovalPolicyRow = Tables["micro_approval_policies"]["Row"];
export type DeviceApprovalReceiptRow = Tables["device_approval_receipts"]["Row"];
export type AssistantRolePresenceRow = Tables["assistant_role_presences"]["Row"];
export type ProactiveInterventionRow = Tables["proactive_interventions"]["Row"];
export type AmbientLaunchReadinessRow = Tables["ambient_launch_readiness"]["Row"];
