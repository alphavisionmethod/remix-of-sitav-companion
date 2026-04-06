// ═══════════════════════════════════════════════════════════════
// SITA OS — Apple + Android Ecosystem Runtime Validators
// Zod schemas that enforce contract types at runtime
// ═══════════════════════════════════════════════════════════════

import { z } from "zod";

// ── Shared enums ──
export const EcosystemEnum = z.enum(["apple", "android"]);

export const AppleSurfaceSchema = z.enum(["iphone", "ipad", "apple_watch", "mac_desktop", "vision_pro"]);
export const AndroidSurfaceSchema = z.enum(["android_phone", "android_tablet", "wear_os", "chromebook", "android_tv"]);
export const SurfaceSchema = z.union([AppleSurfaceSchema, AndroidSurfaceSchema]);

export const ApplePushChannelSchema = z.enum(["apns", "apns_voip", "apns_complication"]);
export const AndroidPushChannelSchema = z.enum(["fcm", "fcm_data", "fcm_notification"]);

export const AppleTrustClassSchema = z.enum(["trusted_iphone", "trusted_ipad", "trusted_watch", "trusted_mac", "untrusted"]);
export const AndroidTrustClassSchema = z.enum(["trusted_phone", "trusted_tablet", "trusted_watch", "untrusted"]);

export const AppleHealthSignalSchema = z.enum([
  "heart_rate", "hrv", "steps", "sleep", "vo2max", "workout",
  "stand_hours", "mindfulness", "respiratory_rate", "blood_oxygen",
  "resting_heart_rate", "walking_steadiness",
]);
export const AndroidHealthSignalSchema = z.enum([
  "heart_rate", "steps", "sleep", "exercise", "blood_glucose",
  "blood_pressure", "body_temperature", "oxygen_saturation",
  "respiratory_rate", "nutrition",
]);

export const RiskTierCeilingSchema = z.enum(["low", "medium", "high"]);
export const WearableRiskTierSchema = z.enum(["low", "medium"]);
export const UrgencyFilterSchema = z.enum(["all", "high_and_critical", "critical_only"]);
export const LaunchStageSchema = z.enum(["planned", "internal", "demo", "pilot", "launch_ready", "production"]);
export const ContinuityStateSchema = z.enum(["available", "active", "completed", "failed"]);

// ── Device Record Validator ──
export const EcosystemDeviceSchema = z.object({
  ecosystem: EcosystemEnum,
  surface: z.string().min(1),
  device_model: z.string().min(1),
  os_version: z.string().default(""),
  manufacturer: z.string().default(""),
  push_token: z.string().optional(),
  push_channel: z.string().default("none"),
  trust_class: z.string().default("untrusted"),
  biometric_capable: z.boolean().default(false),
  biometric_types: z.array(z.string()).default([]),
  play_services_available: z.boolean().optional(),
  continuity_eligible: z.boolean().default(false),
  metadata: z.record(z.unknown()).default({}),
});

// ── Trust Record Validator ──
export const EcosystemTrustRecordSchema = z.object({
  device_id: z.string().uuid(),
  ecosystem: EcosystemEnum,
  trust_class: z.string().min(1),
  biometric_verified: z.boolean().default(false),
  biometric_type: z.string().optional(),
  keystore_secured: z.boolean().default(false),
  attestation_verified: z.boolean().default(false),
  approval_eligible_classes: z.array(z.string()).default([]),
  risk_tier_ceiling: RiskTierCeilingSchema.default("low"),
  escalation_target: z.string().optional(),
  device_bound_receipts: z.boolean().default(false),
  session_duration: z.string().default("24h"),
  reauth_method: z.string().default("biometric"),
});

// ── Health Consent Validator ──
export const EcosystemHealthConsentSchema = z.object({
  ecosystem: EcosystemEnum,
  signal_type: z.string().min(1),
  read_permission: z.boolean().default(false),
  routing_influence_consent: z.boolean().default(false),
  assistant_use_consent: z.boolean().default(false),
  boardroom_visibility_consent: z.boolean().default(false),
  privacy_explanation_shown: z.boolean().default(false),
});

// ── Push Route Validator ──
export const EcosystemPushRouteSchema = z.object({
  device_id: z.string().uuid(),
  ecosystem: EcosystemEnum,
  channel: z.string().min(1),
  urgency_filter: UrgencyFilterSchema.default("all"),
  focus_mode_aware: z.boolean().default(false),
  dnd_aware: z.boolean().default(false),
  calm_router_integrated: z.boolean().default(false),
  routing_priority: z.number().int().default(0),
  notification_channel_id: z.string().optional(),
});

// ── Wearable Config Validator ──
export const EcosystemWearableConfigSchema = z.object({
  device_id: z.string().uuid(),
  ecosystem: EcosystemEnum,
  watch_model: z.string().default(""),
  watch_os_version: z.string().default(""),
  complications_supported: z.array(z.string()).default([]),
  tiles_supported: z.array(z.string()).default([]),
  micro_actions_enabled: z.boolean().default(false),
  glanceable_states_enabled: z.boolean().default(false),
  haptic_routing_enabled: z.boolean().default(false),
  filtered_alerts_only: z.boolean().default(true),
  escalate_to_phone_enabled: z.boolean().default(true),
  max_risk_tier: WearableRiskTierSchema.default("low"),
  auto_escalate_sec: z.number().int().min(10).max(600).default(120),
  urgency_patterns: z.array(z.string()).default([]),
});

// ── Launch Readiness Validator ──
export const EcosystemLaunchReadinessSchema = z.object({
  ecosystem: EcosystemEnum,
  target: z.string().min(1),
  target_name: z.string().default(""),
  launch_stage: LaunchStageSchema.default("planned"),
  blockers: z.array(z.string()).default([]),
  demo_available: z.boolean().default(false),
  pilot_ready: z.boolean().default(false),
  launch_ready: z.boolean().default(false),
  evidence: z.record(z.unknown()).default({}),
});

// ── Continuity Event Validator ──
export const EcosystemContinuityEventSchema = z.object({
  ecosystem: EcosystemEnum,
  source_device_id: z.string().uuid().optional(),
  target_device_id: z.string().uuid().optional(),
  source_surface: z.string().min(1),
  target_surface: z.string().min(1),
  handoff_type: z.string().min(1),
  context_ref: z.string().optional(),
  state: ContinuityStateSchema.default("available"),
});

// ── Cross-ecosystem validation helpers ──
export function validateAppleDevice(data: unknown) {
  const base = EcosystemDeviceSchema.safeParse(data);
  if (!base.success) return base;
  const d = base.data;
  if (d.ecosystem !== "apple") return { success: false as const, error: { message: "ecosystem must be 'apple'" } };
  const validSurfaces = ["iphone", "ipad", "apple_watch", "mac_desktop", "vision_pro"];
  if (!validSurfaces.includes(d.surface)) return { success: false as const, error: { message: `Invalid Apple surface: ${d.surface}` } };
  return { success: true as const, data: d };
}

export function validateAndroidDevice(data: unknown) {
  const base = EcosystemDeviceSchema.safeParse(data);
  if (!base.success) return base;
  const d = base.data;
  if (d.ecosystem !== "android") return { success: false as const, error: { message: "ecosystem must be 'android'" } };
  const validSurfaces = ["android_phone", "android_tablet", "wear_os", "chromebook", "android_tv"];
  if (!validSurfaces.includes(d.surface)) return { success: false as const, error: { message: `Invalid Android surface: ${d.surface}` } };
  return { success: true as const, data: d };
}

export function validateTrustEscalation(fromTrustClass: string, toSurface: string, riskTier: string): { allowed: boolean; reason: string } {
  const trustOrder: Record<string, number> = {
    untrusted: 0, trusted_watch: 1, trusted_tablet: 2, trusted_phone: 3,
    trusted_ipad: 3, trusted_iphone: 4, trusted_mac: 4,
  };
  const riskValues: Record<string, number> = { low: 1, medium: 2, high: 3, critical: 4 };
  const fromLevel = trustOrder[fromTrustClass] ?? 0;
  const riskLevel = riskValues[riskTier] ?? 1;

  if (riskLevel <= 1) return { allowed: true, reason: "Low risk — no escalation needed" };
  if (fromLevel >= 3 && riskLevel <= 3) return { allowed: true, reason: "Trusted device can handle this risk tier" };
  if (riskLevel >= 4 && fromLevel < 4) return { allowed: false, reason: `Risk tier ${riskTier} requires highest trust device` };
  return { allowed: fromLevel >= riskLevel, reason: fromLevel >= riskLevel ? "Trust level sufficient" : "Escalation required to higher-trust device" };
}
