import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";
import { z } from "https://esm.sh/zod@3.23.8";
import { requireAuth } from "../_shared/auth.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";

const ActionSchema = z.object({
  action: z.enum([
    "seed_ecosystem", "register_device", "update_trust",
    "grant_health_consent", "revoke_health_consent",
    "configure_push_route", "configure_wearable",
    "update_launch_readiness", "ecosystem_audit",
  ]),
  ecosystem: z.enum(["apple", "android"]).optional(),
  payload: z.record(z.unknown()).optional(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authResult = await requireAuth(req);
    if (authResult instanceof Response) return authResult;
    const { user } = authResult;

    const rateCheck = checkRateLimit(`eco-ops:${user.id}`, 30, 60_000);
    if (!rateCheck.allowed) return rateLimitResponse(rateCheck, corsHeaders);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const parsed = ActionSchema.safeParse(body);
    if (!parsed.success) {
      return json({ error: "Validation failed", details: parsed.error.flatten().fieldErrors }, 400);
    }

    const { action, ecosystem, payload } = parsed.data;

    switch (action) {
      case "seed_ecosystem": return await seedEcosystem(supabase, user.id, ecosystem!);
      case "register_device": return await registerDevice(supabase, user.id, payload!);
      case "update_trust": return await updateTrust(supabase, user.id, payload!);
      case "grant_health_consent": return await grantHealthConsent(supabase, user.id, payload!);
      case "revoke_health_consent": return await revokeHealthConsent(supabase, user.id, payload!);
      case "configure_push_route": return await configurePushRoute(supabase, user.id, payload!);
      case "configure_wearable": return await configureWearable(supabase, user.id, payload!);
      case "update_launch_readiness": return await updateLaunchReadiness(supabase, user.id, payload!);
      case "ecosystem_audit": return await ecosystemAudit(supabase, user.id, ecosystem);
      default: return json({ error: `Unknown action: ${action}` }, 400);
    }
  } catch (err) {
    console.error("ecosystem-operations error:", err);
    return json({ error: err instanceof Error ? err.message : "Unknown error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

// ── Seed full ecosystem demo data ──
async function seedEcosystem(supabase: any, userId: string, ecosystem: string) {
  if (ecosystem === "apple") return await seedApple(supabase, userId);
  if (ecosystem === "android") return await seedAndroid(supabase, userId);
  return json({ error: "Invalid ecosystem" }, 400);
}

async function seedApple(supabase: any, userId: string) {
  const devices = [
    { ecosystem: "apple", surface: "iphone", device_model: "iPhone 15 Pro", os_version: "iOS 18.2", push_channel: "apns", trust_class: "trusted_iphone", biometric_capable: true, biometric_types: ["face_id"], continuity_eligible: true },
    { ecosystem: "apple", surface: "ipad", device_model: "iPad Pro M4", os_version: "iPadOS 18.2", push_channel: "apns", trust_class: "trusted_ipad", biometric_capable: true, biometric_types: ["face_id"], continuity_eligible: true },
    { ecosystem: "apple", surface: "apple_watch", device_model: "Apple Watch Ultra 2", os_version: "watchOS 11", push_channel: "apns_complication", trust_class: "trusted_watch", biometric_capable: false, biometric_types: [], continuity_eligible: false },
    { ecosystem: "apple", surface: "mac_desktop", device_model: "MacBook Pro 16\"", os_version: "macOS 15.2", push_channel: "apns", trust_class: "trusted_mac", biometric_capable: true, biometric_types: ["touch_id"], continuity_eligible: true },
  ];

  const deviceIds: Record<string, string> = {};
  for (const d of devices) {
    const { data } = await supabase.from("ecosystem_devices").upsert({ ...d, user_id: userId }, { onConflict: "user_id,ecosystem,surface", ignoreDuplicates: false }).select().single();
    if (data) deviceIds[d.surface] = data.id;
  }

  // Trust records
  const trustRecords = [
    { device_id: deviceIds.iphone, ecosystem: "apple", trust_class: "trusted_iphone", biometric_verified: true, biometric_type: "face_id", keystore_secured: true, attestation_verified: true, risk_tier_ceiling: "high", device_bound_receipts: true, session_duration: "24h", approval_eligible_classes: ["standard", "elevated", "critical"] },
    { device_id: deviceIds.ipad, ecosystem: "apple", trust_class: "trusted_ipad", biometric_verified: true, biometric_type: "face_id", keystore_secured: true, attestation_verified: true, risk_tier_ceiling: "high", device_bound_receipts: true, session_duration: "24h", approval_eligible_classes: ["standard", "elevated", "critical"] },
    { device_id: deviceIds.apple_watch, ecosystem: "apple", trust_class: "trusted_watch", biometric_verified: false, keystore_secured: false, attestation_verified: false, risk_tier_ceiling: "medium", device_bound_receipts: false, session_duration: "while_worn", approval_eligible_classes: ["standard"], escalation_target: deviceIds.iphone },
    { device_id: deviceIds.mac_desktop, ecosystem: "apple", trust_class: "trusted_mac", biometric_verified: true, biometric_type: "touch_id", keystore_secured: true, attestation_verified: true, risk_tier_ceiling: "high", device_bound_receipts: true, session_duration: "8h", approval_eligible_classes: ["standard", "elevated", "critical"] },
  ];
  for (const t of trustRecords) {
    if (t.device_id) await supabase.from("ecosystem_trust_records").upsert({ ...t, user_id: userId }, { onConflict: "device_id" }).select();
  }

  // Health consents
  const healthSignals = ["heart_rate", "hrv", "steps", "sleep", "vo2max", "workout", "stand_hours", "respiratory_rate"];
  for (const signal of healthSignals) {
    await supabase.from("ecosystem_health_consents").upsert({
      user_id: userId, ecosystem: "apple", signal_type: signal,
      read_permission: true, routing_influence_consent: ["heart_rate", "hrv", "sleep"].includes(signal),
      assistant_use_consent: true, boardroom_visibility_consent: true, privacy_explanation_shown: true,
    }, { onConflict: "user_id,ecosystem,signal_type" }).select();
  }

  // Wearable config
  if (deviceIds.apple_watch) {
    await supabase.from("ecosystem_wearable_configs").upsert({
      user_id: userId, device_id: deviceIds.apple_watch, ecosystem: "apple",
      watch_model: "Apple Watch Ultra 2", watch_os_version: "watchOS 11",
      complications_supported: ["circular_small", "modular_large", "graphic_corner"],
      micro_actions_enabled: true, glanceable_states_enabled: true, haptic_routing_enabled: true,
      filtered_alerts_only: true, escalate_to_phone_enabled: true,
      max_risk_tier: "medium", auto_escalate_sec: 120,
      urgency_patterns: ["approval_pending", "financial_alert", "health_anomaly"],
    }, { onConflict: "device_id" }).select();
  }

  // Push routes
  for (const [surface, deviceId] of Object.entries(deviceIds)) {
    if (!deviceId) continue;
    const channel = surface === "apple_watch" ? "apns_complication" : "apns";
    const urgency = surface === "apple_watch" ? "critical_only" : "all";
    await supabase.from("ecosystem_push_routes").upsert({
      user_id: userId, device_id: deviceId, ecosystem: "apple", channel,
      urgency_filter: urgency, focus_mode_aware: true, calm_router_integrated: true,
      routing_priority: surface === "iphone" ? 10 : surface === "ipad" ? 8 : 5,
    }, { onConflict: "device_id" }).select();
  }

  // Launch readiness
  const targets = [
    { target: "iphone_shell", target_name: "iPhone Shell", launch_stage: "internal", blockers: ["Core navigation shell"], demo_available: true },
    { target: "ipad_shell", target_name: "iPad Shell", launch_stage: "planned", blockers: ["Awaiting iPhone shell", "Tablet layout design"] },
    { target: "apple_watch", target_name: "Apple Watch", launch_stage: "planned", blockers: ["WatchKit integration", "Complication design"] },
    { target: "sign_in_with_apple", target_name: "Sign in with Apple", launch_stage: "planned", blockers: ["Apple Developer setup"] },
    { target: "apple_health", target_name: "Apple Health", launch_stage: "planned", blockers: ["HealthKit permissions flow", "Privacy review"] },
    { target: "apple_device_trust", target_name: "Apple Device Trust", launch_stage: "internal", blockers: [], demo_available: true },
    { target: "apple_continuity", target_name: "Apple Continuity", launch_stage: "planned", blockers: ["Requires native app on both surfaces"] },
  ];
  for (const t of targets) {
    await supabase.from("ecosystem_launch_readiness").upsert({
      ...t, user_id: userId, ecosystem: "apple",
      demo_available: t.demo_available || false,
      pilot_ready: false, launch_ready: false,
    }, { onConflict: "user_id,ecosystem,target" }).select();
  }

  return json({ success: true, ecosystem: "apple", devices: Object.keys(deviceIds).length, healthConsents: healthSignals.length, launchTargets: targets.length });
}

async function seedAndroid(supabase: any, userId: string) {
  const devices = [
    { ecosystem: "android", surface: "android_phone", device_model: "Pixel 9 Pro", os_version: "Android 15", manufacturer: "Google", push_channel: "fcm", trust_class: "trusted_phone", biometric_capable: true, biometric_types: ["fingerprint", "face"], play_services_available: true },
    { ecosystem: "android", surface: "android_tablet", device_model: "Samsung Galaxy Tab S10", os_version: "Android 15", manufacturer: "Samsung", push_channel: "fcm", trust_class: "trusted_tablet", biometric_capable: true, biometric_types: ["fingerprint"], play_services_available: true },
    { ecosystem: "android", surface: "wear_os", device_model: "Pixel Watch 3", os_version: "Wear OS 5", manufacturer: "Google", push_channel: "fcm_data", trust_class: "trusted_watch", biometric_capable: false, biometric_types: [], play_services_available: true },
  ];

  const deviceIds: Record<string, string> = {};
  for (const d of devices) {
    const { data } = await supabase.from("ecosystem_devices").upsert({ ...d, user_id: userId }, { onConflict: "user_id,ecosystem,surface", ignoreDuplicates: false }).select().single();
    if (data) deviceIds[d.surface] = data.id;
  }

  // Trust records
  const trustRecords = [
    { device_id: deviceIds.android_phone, ecosystem: "android", trust_class: "trusted_phone", biometric_verified: true, biometric_type: "fingerprint", keystore_secured: true, attestation_verified: true, risk_tier_ceiling: "high", device_bound_receipts: true, session_duration: "24h", approval_eligible_classes: ["standard", "elevated", "critical"] },
    { device_id: deviceIds.android_tablet, ecosystem: "android", trust_class: "trusted_tablet", biometric_verified: true, biometric_type: "fingerprint", keystore_secured: true, attestation_verified: false, risk_tier_ceiling: "medium", device_bound_receipts: true, session_duration: "12h", approval_eligible_classes: ["standard", "elevated"] },
    { device_id: deviceIds.wear_os, ecosystem: "android", trust_class: "trusted_watch", biometric_verified: false, keystore_secured: false, attestation_verified: false, risk_tier_ceiling: "low", device_bound_receipts: false, session_duration: "while_worn", approval_eligible_classes: ["standard"], escalation_target: deviceIds.android_phone },
  ];
  for (const t of trustRecords) {
    if (t.device_id) await supabase.from("ecosystem_trust_records").upsert({ ...t, user_id: userId }, { onConflict: "device_id" }).select();
  }

  // Health consents (Health Connect)
  const healthSignals = ["heart_rate", "steps", "sleep", "exercise", "blood_glucose", "respiratory_rate", "nutrition"];
  for (const signal of healthSignals) {
    await supabase.from("ecosystem_health_consents").upsert({
      user_id: userId, ecosystem: "android", signal_type: signal,
      read_permission: true, routing_influence_consent: ["heart_rate", "sleep"].includes(signal),
      assistant_use_consent: true, privacy_explanation_shown: true,
    }, { onConflict: "user_id,ecosystem,signal_type" }).select();
  }

  // Wearable config
  if (deviceIds.wear_os) {
    await supabase.from("ecosystem_wearable_configs").upsert({
      user_id: userId, device_id: deviceIds.wear_os, ecosystem: "android",
      watch_model: "Pixel Watch 3", watch_os_version: "Wear OS 5",
      tiles_supported: ["daily_summary", "approval_queue", "health_glance"],
      complications_supported: ["short_text", "ranged_value", "small_image"],
      micro_actions_enabled: true, glanceable_states_enabled: true,
      filtered_alerts_only: true, escalate_to_phone_enabled: true,
      max_risk_tier: "low", auto_escalate_sec: 90,
      urgency_patterns: ["approval_pending", "health_alert"],
    }, { onConflict: "device_id" }).select();
  }

  // Push routes
  for (const [surface, deviceId] of Object.entries(deviceIds)) {
    if (!deviceId) continue;
    const channel = surface === "wear_os" ? "fcm_data" : "fcm";
    await supabase.from("ecosystem_push_routes").upsert({
      user_id: userId, device_id: deviceId, ecosystem: "android", channel,
      urgency_filter: surface === "wear_os" ? "critical_only" : "all",
      focus_mode_aware: true, dnd_aware: true, calm_router_integrated: true,
      routing_priority: surface === "android_phone" ? 10 : surface === "android_tablet" ? 7 : 4,
    }, { onConflict: "device_id" }).select();
  }

  // Launch readiness
  const targets = [
    { target: "android_shell", target_name: "Android Shell", launch_stage: "internal", blockers: ["Core navigation shell"], demo_available: true },
    { target: "wear_os_shell", target_name: "Wear OS Shell", launch_stage: "planned", blockers: ["Tile design", "Wear OS SDK integration"] },
    { target: "android_trust", target_name: "Android Trust", launch_stage: "internal", blockers: [], demo_available: true },
    { target: "android_health", target_name: "Health Connect", launch_stage: "planned", blockers: ["Health Connect permissions", "Privacy review"] },
    { target: "android_push", target_name: "Android Push (FCM)", launch_stage: "planned", blockers: ["FCM project setup"] },
  ];
  for (const t of targets) {
    await supabase.from("ecosystem_launch_readiness").upsert({
      ...t, user_id: userId, ecosystem: "android",
      demo_available: t.demo_available || false,
      pilot_ready: false, launch_ready: false,
    }, { onConflict: "user_id,ecosystem,target" }).select();
  }

  return json({ success: true, ecosystem: "android", devices: Object.keys(deviceIds).length, healthConsents: healthSignals.length, launchTargets: targets.length });
}

// ── CRUD operations ──
async function registerDevice(supabase: any, userId: string, payload: Record<string, unknown>) {
  const { data, error } = await supabase.from("ecosystem_devices").insert({ ...payload, user_id: userId }).select().single();
  if (error) return json({ error: error.message }, 400);
  return json({ success: true, device: data });
}

async function updateTrust(supabase: any, userId: string, payload: Record<string, unknown>) {
  const { device_id, ...rest } = payload;
  const { data, error } = await supabase.from("ecosystem_trust_records").upsert({ device_id, ...rest, user_id: userId, last_verified_at: new Date().toISOString() }, { onConflict: "device_id" }).select().single();
  if (error) return json({ error: error.message }, 400);
  return json({ success: true, trust: data });
}

async function grantHealthConsent(supabase: any, userId: string, payload: Record<string, unknown>) {
  const { data, error } = await supabase.from("ecosystem_health_consents").upsert({
    ...payload, user_id: userId, read_permission: true, consented_at: new Date().toISOString(), revoked_at: null,
  }, { onConflict: "user_id,ecosystem,signal_type" }).select().single();
  if (error) return json({ error: error.message }, 400);
  return json({ success: true, consent: data });
}

async function revokeHealthConsent(supabase: any, userId: string, payload: Record<string, unknown>) {
  const { ecosystem, signal_type } = payload;
  const { data, error } = await supabase.from("ecosystem_health_consents")
    .update({ read_permission: false, revoked_at: new Date().toISOString() })
    .eq("user_id", userId).eq("ecosystem", ecosystem).eq("signal_type", signal_type)
    .select().single();
  if (error) return json({ error: error.message }, 400);
  return json({ success: true, consent: data });
}

async function configurePushRoute(supabase: any, userId: string, payload: Record<string, unknown>) {
  const { data, error } = await supabase.from("ecosystem_push_routes").upsert({ ...payload, user_id: userId }, { onConflict: "device_id" }).select().single();
  if (error) return json({ error: error.message }, 400);
  return json({ success: true, route: data });
}

async function configureWearable(supabase: any, userId: string, payload: Record<string, unknown>) {
  const { data, error } = await supabase.from("ecosystem_wearable_configs").upsert({ ...payload, user_id: userId }, { onConflict: "device_id" }).select().single();
  if (error) return json({ error: error.message }, 400);
  return json({ success: true, config: data });
}

async function updateLaunchReadiness(supabase: any, userId: string, payload: Record<string, unknown>) {
  const { data, error } = await supabase.from("ecosystem_launch_readiness").upsert({
    ...payload, user_id: userId, last_assessed_at: new Date().toISOString(),
  }, { onConflict: "user_id,ecosystem,target" }).select().single();
  if (error) return json({ error: error.message }, 400);
  return json({ success: true, readiness: data });
}

// ── Ecosystem audit ──
async function ecosystemAudit(supabase: any, userId: string, ecosystem?: string) {
  const filter = ecosystem ? { ecosystem } : {};
  const [devices, trust, consents, pushRoutes, wearables, readiness] = await Promise.all([
    supabase.from("ecosystem_devices").select("*").eq("user_id", userId).match(filter),
    supabase.from("ecosystem_trust_records").select("*").eq("user_id", userId).match(filter),
    supabase.from("ecosystem_health_consents").select("*").eq("user_id", userId).match(filter),
    supabase.from("ecosystem_push_routes").select("*").eq("user_id", userId).match(filter),
    supabase.from("ecosystem_wearable_configs").select("*").eq("user_id", userId).match(filter),
    supabase.from("ecosystem_launch_readiness").select("*").eq("user_id", userId).match(filter),
  ]);

  const deviceCount = devices.data?.length || 0;
  const trustedCount = trust.data?.filter((t: any) => t.biometric_verified).length || 0;
  const consentCount = consents.data?.filter((c: any) => c.read_permission && !c.revoked_at).length || 0;
  const pushCount = pushRoutes.data?.length || 0;
  const wearableCount = wearables.data?.length || 0;
  const readinessRecords = readiness.data || [];
  const launchReadyCount = readinessRecords.filter((r: any) => r.launch_ready).length;

  const score = Math.round(
    (deviceCount > 0 ? 15 : 0) +
    (trustedCount > 0 ? 20 : 0) +
    (consentCount > 0 ? 15 : 0) +
    (pushCount > 0 ? 15 : 0) +
    (wearableCount > 0 ? 10 : 0) +
    (launchReadyCount / Math.max(readinessRecords.length, 1)) * 25
  );

  return json({
    success: true,
    ecosystem: ecosystem || "all",
    score,
    summary: {
      devices: deviceCount,
      trustedDevices: trustedCount,
      activeConsents: consentCount,
      pushRoutes: pushCount,
      wearables: wearableCount,
      launchTargets: readinessRecords.length,
      launchReady: launchReadyCount,
    },
    details: {
      devices: devices.data,
      trust: trust.data,
      consents: consents.data,
      pushRoutes: pushRoutes.data,
      wearables: wearables.data,
      readiness: readinessRecords,
    },
  });
}
