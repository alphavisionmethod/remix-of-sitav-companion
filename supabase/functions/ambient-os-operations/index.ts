import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { handleCors, corsHeaders, corsResponse, corsError } from "../_shared/cors.ts";
import { EdgeLogger } from "../_shared/logger.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";
import { z } from "https://esm.sh/zod@3.23.8";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // Parse body once — Deno Request.json() can only be called once
  let parsedBody: Record<string, unknown> = {};
  if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
    try {
      parsedBody = await req.json();
      const BodySchema = z.object({ operation: z.string().min(1), params: z.record(z.unknown()).optional() });
      const parsed = BodySchema.safeParse(parsedBody);
      if (!parsed.success) {
        return new Response(JSON.stringify({ error: "Validation failed", details: parsed.error.flatten().fieldErrors }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    } catch (_) { /* non-JSON or GET */ }
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "No auth" }), { status: 401, headers: corsHeaders });

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const body = parsedBody;
    const { action } = body;

    switch (action) {
      case "seed_device_families": return await seedDeviceFamilies(supabase, user.id);
      case "seed_wearable_providers": return await seedWearableProviders(supabase, user.id);
      case "seed_assistant_roles": return await seedAssistantRoles(supabase, user.id);
      case "seed_launch_readiness": return await seedLaunchReadiness(supabase, user.id);
      case "update_presence": return await updatePresence(supabase, user.id);
      case "check_readiness": return await checkReadiness(supabase, user.id);
      case "device_graph_report": return await deviceGraphReport(supabase, user.id);
      case "register_device": return await registerDevice(supabase, user.id, body);
      case "initiate_handoff": return await initiateHandoff(supabase, user.id, body);
      case "route_notification": return await routeNotification(supabase, user.id, body);
      case "surface_strategy": return jsonRes({ success: true, strategy: getSurfaceStrategy() });
      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), { status: 400, headers: corsHeaders });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});

function jsonRes(body: unknown) {
  return new Response(JSON.stringify(body), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

async function seedDeviceFamilies(supabase: any, userId: string) {
  const families = [
    { family_key: "phone", name: "Phone", description: "iPhone / Android smartphones", interaction_type: "active", screen_class: "compact", notification_type: "push", quick_action_support: true, trust_level: "high", sensor_support: ["gps","accelerometer","camera","biometric"], passive_usage_support: false, offline_behavior: "queue", continuity_support: true, handoff_support: true, launch_stage: "alpha" },
    { family_key: "tablet", name: "Tablet", description: "iPad / Android tablets", interaction_type: "active", screen_class: "standard", notification_type: "push", quick_action_support: true, trust_level: "high", sensor_support: ["gps","accelerometer","camera"], passive_usage_support: false, offline_behavior: "queue", continuity_support: true, handoff_support: true, launch_stage: "planned" },
    { family_key: "desktop", name: "Desktop", description: "Mac / Windows / Linux desktops", interaction_type: "active", screen_class: "large", notification_type: "desktop_notification", quick_action_support: true, trust_level: "high", sensor_support: ["camera"], passive_usage_support: false, offline_behavior: "limited", continuity_support: true, handoff_support: true, launch_stage: "alpha" },
    { family_key: "smartwatch", name: "Smartwatch", description: "Apple Watch / Wear OS watches", interaction_type: "glance", screen_class: "micro", notification_type: "haptic", quick_action_support: true, trust_level: "standard", sensor_support: ["heart_rate","accelerometer","gps"], passive_usage_support: true, offline_behavior: "queue", continuity_support: false, handoff_support: true, launch_stage: "planned" },
    { family_key: "sports_wearable", name: "Sports Wearable", description: "Fitness bands, sports trackers", interaction_type: "passive", screen_class: "minimal", notification_type: "haptic", quick_action_support: false, trust_level: "low", sensor_support: ["heart_rate","accelerometer","strain"], passive_usage_support: true, offline_behavior: "sync_later", continuity_support: false, handoff_support: false, launch_stage: "planned" },
    { family_key: "smart_ring", name: "Smart Ring", description: "Oura, smart ring devices", interaction_type: "passive", screen_class: "none", notification_type: "haptic", quick_action_support: false, trust_level: "low", sensor_support: ["heart_rate","temperature","sleep"], passive_usage_support: true, offline_behavior: "sync_later", continuity_support: false, handoff_support: false, launch_stage: "planned" },
    { family_key: "ar_vr_headset", name: "AR/VR Headset", description: "Apple Vision Pro, Meta Quest, spatial computing", interaction_type: "immersive", screen_class: "spatial", notification_type: "spatial_overlay", quick_action_support: true, trust_level: "standard", sensor_support: ["spatial","eye_tracking","hand_tracking","camera"], passive_usage_support: false, offline_behavior: "limited", continuity_support: true, handoff_support: true, launch_stage: "future" },
    { family_key: "ambient_display", name: "Ambient Display", description: "Smart displays, ambient screens", interaction_type: "ambient", screen_class: "standard", notification_type: "visual", quick_action_support: false, trust_level: "low", sensor_support: ["microphone"], passive_usage_support: true, offline_behavior: "queue", continuity_support: false, handoff_support: false, launch_stage: "future" },
    { family_key: "voice_endpoint", name: "Voice Endpoint", description: "Smart speakers, voice assistants", interaction_type: "voice", screen_class: "none", notification_type: "audio", quick_action_support: true, trust_level: "low", sensor_support: ["microphone"], passive_usage_support: true, offline_behavior: "unavailable", continuity_support: false, handoff_support: false, launch_stage: "future" },
  ];

  let count = 0;
  for (const f of families) {
    const { error } = await supabase.from("device_families").upsert({ ...f, user_id: userId }, { onConflict: "family_key,user_id" });
    if (!error) count++;
  }
  return jsonRes({ success: true, families_seeded: count });
}

async function seedWearableProviders(supabase: any, userId: string) {
  const providers = [
    { provider_key: "apple_watch", name: "Apple Watch", description: "Apple Watch via HealthKit", categories: ["smartwatch","health","fitness"], supported_signals: ["heart_rate","resting_heart_rate","hrv","steps","calories","workout","sleep","stand_hours","vo2max"], health_data_support: true, activity_data_support: true, sleep_data_support: true, readiness_data_support: false, notification_support: true, micro_action_support: true, requires_native_app: true, requires_partner_program: false, launch_stage: "planned" },
    { provider_key: "wear_os", name: "Wear OS", description: "Google Wear OS watches via Health Connect", categories: ["smartwatch","health","fitness"], supported_signals: ["heart_rate","steps","calories","workout","sleep"], health_data_support: true, activity_data_support: true, sleep_data_support: true, readiness_data_support: false, notification_support: true, micro_action_support: true, requires_native_app: true, requires_partner_program: false, launch_stage: "planned" },
    { provider_key: "fitbit", name: "Fitbit", description: "Fitbit Web API", categories: ["fitness","health"], supported_signals: ["heart_rate","steps","calories","sleep","stress_score","readiness_score"], health_data_support: true, activity_data_support: true, sleep_data_support: true, readiness_data_support: true, notification_support: false, micro_action_support: false, requires_native_app: false, requires_partner_program: false, launch_stage: "planned" },
    { provider_key: "garmin", name: "Garmin", description: "Garmin Health API / Connect IQ", categories: ["fitness","sports","health"], supported_signals: ["heart_rate","stress","body_battery","steps","sleep","vo2max","training_status","recovery_time"], health_data_support: true, activity_data_support: true, sleep_data_support: true, readiness_data_support: true, notification_support: false, micro_action_support: false, requires_native_app: false, requires_partner_program: true, launch_stage: "planned" },
    { provider_key: "polar", name: "Polar", description: "Polar AccessLink API", categories: ["fitness","sports","health"], supported_signals: ["heart_rate","training_load","recovery","sleep","activity"], health_data_support: true, activity_data_support: true, sleep_data_support: true, readiness_data_support: true, notification_support: false, micro_action_support: false, requires_native_app: false, requires_partner_program: true, launch_stage: "planned" },
    { provider_key: "whoop", name: "Whoop", description: "Whoop developer API", categories: ["recovery","strain","health"], supported_signals: ["strain","recovery_score","sleep_performance","hrv","resting_heart_rate","respiratory_rate"], health_data_support: true, activity_data_support: true, sleep_data_support: true, readiness_data_support: true, notification_support: false, micro_action_support: false, requires_native_app: false, requires_partner_program: true, launch_stage: "planned" },
    { provider_key: "oura", name: "Oura", description: "Oura Ring API", categories: ["ring","sleep","readiness","health"], supported_signals: ["readiness_score","sleep_score","activity_score","heart_rate","hrv","temperature","respiratory_rate","sleep_stages"], health_data_support: true, activity_data_support: true, sleep_data_support: true, readiness_data_support: true, notification_support: false, micro_action_support: false, requires_native_app: false, requires_partner_program: false, launch_stage: "planned" },
    { provider_key: "samsung_health", name: "Samsung Health", description: "Samsung Health SDK", categories: ["health","fitness"], supported_signals: ["heart_rate","steps","sleep","stress","blood_oxygen"], health_data_support: true, activity_data_support: true, sleep_data_support: true, readiness_data_support: false, notification_support: false, micro_action_support: false, requires_native_app: true, requires_partner_program: true, launch_stage: "future" },
  ];

  let count = 0;
  for (const p of providers) {
    const { error } = await supabase.from("wearable_providers").upsert({ ...p, user_id: userId }, { onConflict: "provider_key,user_id" });
    if (!error) count++;
  }
  return jsonRes({ success: true, providers_seeded: count });
}

async function seedAssistantRoles(supabase: any, userId: string) {
  const roles = [
    { role_key: "chief_of_staff", role_name: "Chief of Staff", description: "Coordinates priorities, manages your day, surfaces what matters", intensity: "high", proactive_mode: true, tone: "executive", escalation_behavior: "escalate" },
    { role_key: "executive_assistant", role_name: "Executive Assistant", description: "Handles scheduling, follow-ups, reminders, and daily logistics", intensity: "high", proactive_mode: true, tone: "professional", escalation_behavior: "suggest" },
    { role_key: "strategist", role_name: "Strategist", description: "Provides strategic analysis, opportunity detection, and decision support", intensity: "normal", proactive_mode: true, tone: "analytical", escalation_behavior: "recommend" },
    { role_key: "operator", role_name: "Operator", description: "Monitors workflows, automation, and system health", intensity: "normal", proactive_mode: true, tone: "concise", escalation_behavior: "auto_handle" },
    { role_key: "health_monitor", role_name: "Health & Readiness Monitor", description: "Tracks wellness signals, readiness, and suggests workload adjustments", intensity: "low", proactive_mode: true, tone: "caring", escalation_behavior: "suggest" },
    { role_key: "boardroom_curator", role_name: "Boardroom Curator", description: "Prepares boardroom briefings, synthesizes intelligence", intensity: "normal", proactive_mode: false, tone: "executive", escalation_behavior: "recommend" },
    { role_key: "risk_watcher", role_name: "Risk Watcher", description: "Monitors financial, operational, and compliance risks", intensity: "normal", proactive_mode: true, tone: "direct", escalation_behavior: "escalate" },
    { role_key: "followup_coordinator", role_name: "Follow-Up Coordinator", description: "Tracks commitments, deadlines, and ensures nothing falls through", intensity: "high", proactive_mode: true, tone: "professional", escalation_behavior: "remind" },
    { role_key: "money_sentinel", role_name: "Money & Priority Sentinel", description: "Watches financial flows, spending patterns, and investment signals", intensity: "normal", proactive_mode: true, tone: "precise", escalation_behavior: "alert" },
    { role_key: "calm_filter", role_name: "Calm Noise Filter", description: "Reduces notification noise, batches low-priority items, protects focus", intensity: "high", proactive_mode: true, tone: "calm", escalation_behavior: "suppress" },
  ];

  let count = 0;
  for (const r of roles) {
    const { error } = await supabase.from("assistant_role_presences").upsert({ ...r, user_id: userId, active: true }, { onConflict: "role_key,user_id" });
    if (!error) count++;
  }
  return jsonRes({ success: true, roles_seeded: count });
}

async function seedLaunchReadiness(supabase: any, userId: string) {
  // Seed from device families
  const { data: families } = await supabase.from("device_families").select("family_key, name, launch_stage").eq("user_id", userId);
  for (const f of (families || [])) {
    await supabase.from("ambient_launch_readiness").upsert({
      user_id: userId, target_type: "device_family", target_key: f.family_key, target_name: f.name,
      launch_label: f.launch_stage,
      supported: f.launch_stage === "alpha" || f.launch_stage === "beta",
      demo_available: f.launch_stage !== "future",
      launch_ready: f.launch_stage === "production",
      pilot_ready: f.launch_stage === "beta",
      blockers: f.launch_stage === "future" ? ["Hardware integration required", "Native app needed"] : f.launch_stage === "planned" ? ["Native app needed"] : [],
    }, { onConflict: "target_type,target_key,user_id" });
  }

  // Seed from wearable providers
  const { data: providers } = await supabase.from("wearable_providers").select("provider_key, name, launch_stage, requires_native_app, requires_partner_program").eq("user_id", userId);
  for (const p of (providers || [])) {
    const blockers: string[] = [];
    if (p.requires_native_app) blockers.push("Requires native app integration");
    if (p.requires_partner_program) blockers.push("Requires partner program approval");
    if (p.launch_stage === "planned") blockers.push("API integration not started");
    if (p.launch_stage === "future") blockers.push("Platform availability uncertain");

    await supabase.from("ambient_launch_readiness").upsert({
      user_id: userId, target_type: "wearable_provider", target_key: p.provider_key, target_name: p.name,
      launch_label: p.launch_stage,
      supported: false, demo_available: true, launch_ready: false, pilot_ready: false,
      blockers,
    }, { onConflict: "target_type,target_key,user_id" });
  }

  return jsonRes({ success: true, device_families: (families || []).length, wearable_providers: (providers || []).length });
}

async function updatePresence(supabase: any, userId: string) {
  const { data: existing } = await supabase.from("presence_states").select("id").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).single();

  const presenceData = {
    user_id: userId, active_surface: "web", focus_state: "normal",
    interruption_tolerance: "normal", motion_state: "stationary",
    handoff_eligible: true, last_interaction_at: new Date().toISOString(),
    recent_surfaces: ["web"],
  };

  if (existing) {
    await supabase.from("presence_states").update(presenceData).eq("id", existing.id);
  } else {
    await supabase.from("presence_states").insert(presenceData);
  }

  return jsonRes({ success: true, surface: "web" });
}

async function checkReadiness(supabase: any, userId: string) {
  const { data: signals } = await supabase.from("wearable_signals").select("*").eq("user_id", userId).order("recorded_at", { ascending: false }).limit(20);
  const { data: presence } = await supabase.from("presence_states").select("*").eq("user_id", userId).order("updated_at", { ascending: false }).limit(1).single();

  let readinessLevel = "available";
  let interruptionTolerance = "normal";
  const derivedFrom: string[] = [];

  if (presence?.focus_state === "deep_work") {
    readinessLevel = "focused";
    interruptionTolerance = "low";
    derivedFrom.push("focus_state");
  }

  if (signals && signals.length > 0) {
    const hrSignals = signals.filter((s: any) => s.signal_type === "heart_rate");
    if (hrSignals.length > 0) {
      const avgHr = hrSignals.reduce((a: number, s: any) => a + Number(s.signal_value), 0) / hrSignals.length;
      if (avgHr > 140) { readinessLevel = "exercising"; interruptionTolerance = "critical_only"; derivedFrom.push("heart_rate_elevated"); }
    }
    const sleepSignals = signals.filter((s: any) => s.signal_type === "sleep");
    if (sleepSignals.length > 0 && sleepSignals[0].signal_value === 1) {
      readinessLevel = "sleeping"; interruptionTolerance = "silent"; derivedFrom.push("sleep_detected");
    }
  }

  const { data: existing } = await supabase.from("readiness_states").select("id").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).single();
  const readinessData = {
    user_id: userId, readiness_level: readinessLevel, availability: readinessLevel === "available" ? "available" : "limited",
    interruption_tolerance: interruptionTolerance, derived_from: derivedFrom, confidence: derivedFrom.length > 0 ? 0.7 : 0.5,
  };

  if (existing) {
    await supabase.from("readiness_states").update(readinessData).eq("id", existing.id);
  } else {
    await supabase.from("readiness_states").insert(readinessData);
  }

  return jsonRes({ success: true, readiness: readinessLevel, interruption_tolerance: interruptionTolerance });
}

async function deviceGraphReport(supabase: any, userId: string) {
  const { data: devices } = await supabase.from("connected_devices").select("*, device_families(name, family_key)").eq("user_id", userId);
  const { data: trust } = await supabase.from("device_trust_records").select("*").eq("user_id", userId);
  const { data: edges } = await supabase.from("user_device_graph_edges").select("*").eq("user_id", userId);
  const { data: presence } = await supabase.from("presence_states").select("*").eq("user_id", userId).order("updated_at", { ascending: false }).limit(1);
  const { data: readiness } = await supabase.from("readiness_states").select("*").eq("user_id", userId).order("updated_at", { ascending: false }).limit(1);

  return jsonRes({
    success: true,
    devices: (devices || []).length,
    trust_records: (trust || []).length,
    graph_edges: (edges || []).length,
    current_presence: presence?.[0] || null,
    current_readiness: readiness?.[0] || null,
    graph: { devices: devices || [], trust: trust || [], edges: edges || [] },
  });
}

async function registerDevice(supabase: any, userId: string, body: any) {
  const { device_label, device_model, platform, device_family_key, trust_level } = body;
  if (!device_label || !platform) return jsonRes({ error: "device_label and platform required" });

  const { data: family } = await supabase.from("device_families").select("id").eq("family_key", device_family_key || "phone").eq("user_id", userId).limit(1).single();

  const { data, error } = await supabase.from("connected_devices").insert({
    user_id: userId,
    device_label,
    device_model: device_model || "Unknown",
    platform: platform || "other",
    device_family_id: family?.id || null,
    trust_level: trust_level || "basic",
    connection_state: "connected",
    battery_aware_routing_enabled: false,
    interruption_eligible: true,
    last_seen_at: new Date().toISOString(),
  }).select().single();

  if (error) return jsonRes({ error: error.message });

  // Create trust record
  await supabase.from("device_trust_records").insert({
    user_id: userId,
    connected_device_id: data.id,
    trust_class: trust_level || "basic",
    biometric_capable: platform === "ios" || platform === "android",
    device_bound_approval_enabled: false,
    approval_classes_allowed: [],
  });

  // Create graph edge
  await supabase.from("user_device_graph_edges").insert({
    user_id: userId,
    node_type: "device",
    node_ref: data.id,
    edge_type: "owns",
    related_node_ref: userId,
  });

  return jsonRes({ success: true, device: data });
}

async function initiateHandoff(supabase: any, userId: string, body: any) {
  const { source_device_id, target_device_id, source_surface, target_surface, context_ref } = body;
  if (!source_surface || !target_surface) return jsonRes({ error: "source_surface and target_surface required" });

  const { data, error } = await supabase.from("handoff_sessions").insert({
    user_id: userId,
    source_device_id: source_device_id || null,
    target_device_id: target_device_id || null,
    source_surface,
    target_surface,
    context_payload_ref: context_ref || null,
    handoff_state: "initiated",
    started_at: new Date().toISOString(),
  }).select().single();

  if (error) return jsonRes({ error: error.message });
  return jsonRes({ success: true, handoff: data });
}

async function routeNotification(supabase: any, userId: string, body: any) {
  const { urgency, category } = body;

  // Get current presence
  const { data: presence } = await supabase.from("presence_states").select("*").eq("user_id", userId).order("updated_at", { ascending: false }).limit(1).single();

  // Get interruption policies
  const { data: policies } = await supabase.from("interruption_policies").select("*").eq("user_id", userId).eq("enabled", true);

  let selectedSurface = "web";
  let selectedChannel = "in_app";
  let deferred = false;
  let routeReason = "default_web_routing";

  const focusState = presence?.focus_state || "normal";
  const urgencyLevel = urgency || "normal";

  if (focusState === "deep_work" || focusState === "sleeping") {
    if (urgencyLevel === "critical") {
      selectedSurface = "phone";
      selectedChannel = "push";
      routeReason = "critical_override_focus";
    } else {
      deferred = true;
      routeReason = "deferred_due_to_focus_state";
    }
  } else if (urgencyLevel === "high") {
    selectedSurface = presence?.active_surface || "phone";
    selectedChannel = "push";
    routeReason = "high_urgency_active_surface";
  }

  const { data: route } = await supabase.from("ambient_notification_routes").insert({
    user_id: userId,
    route_name: `auto_${category || "general"}_${Date.now()}`,
    target_surface: selectedSurface,
    urgency_level: urgencyLevel,
    category: category || "general",
    enabled: true,
    fatigue_aware: true,
  }).select().single();

  return jsonRes({ success: true, surface: selectedSurface, channel: selectedChannel, deferred, reason: routeReason, route_id: route?.id });
}

function getSurfaceStrategy() {
  return {
    web_first: ["boardroom", "admin_tools", "ai_engineering", "workflow_builder", "finance_workspace"],
    mobile_primary: ["approvals", "alerts", "advisor_chat", "daily_pulse", "quick_capture"],
    wearable_primary: ["micro_approvals", "urgent_nudges", "glance_summary"],
    ring_signal: ["readiness_signal", "interruption_context"],
    cross_surface: ["identity", "memory", "notifications", "trust_state"],
  };
}
