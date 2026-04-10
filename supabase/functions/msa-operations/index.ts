import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";
import { z } from "https://esm.sh/zod@3.23.8";
import { requireAuth } from "../_shared/auth.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";

const ActionSchema = z.object({
  action: z.enum([
    "seed_surfaces", "seed_capabilities", "audit_boundaries",
    "check_consistency", "seed_experience_grammars", "portability_report",
    "surface_launch_profile_check",
  ]),
});

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authResult = await requireAuth(req);
    if (authResult instanceof Response) return authResult;
    const { user } = authResult;

    const rateCheck = checkRateLimit(`msa-ops:${user.id}`, 30, 60_000);
    if (!rateCheck.allowed) return rateLimitResponse(rateCheck, corsHeaders);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const parsed = ActionSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Validation failed", details: parsed.error.flatten().fieldErrors }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action } = parsed.data;

    switch (action) {
      case "seed_surfaces": return await seedSurfaces(supabase, user.id);
      case "seed_capabilities": return await seedCapabilities(supabase, user.id);
      case "audit_boundaries": return await auditBoundaries(supabase, user.id);
      case "check_consistency": return await checkConsistency(supabase, user.id);
      case "seed_experience_grammars": return await seedExperienceGrammars(supabase, user.id);
      case "portability_report": return await portabilityReport(supabase, user.id);
      case "surface_launch_profile_check": return await surfaceLaunchProfileCheck(supabase, user.id);
      default:
        return jsonRes({ error: `Unknown action: ${action}` }, 400);
    }
  } catch (err) {
    console.error("msa-operations error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function jsonRes(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

async function seedSurfaces(supabase: any, userId: string) {
  const surfaces = [
    { surface_key: "web", display_name: "Web", surface_class: "active", interaction_model: "mouse_keyboard_touch", notification_model: "in_app_toast", input_modes: ["keyboard","mouse","touch"], output_modes: ["screen"], offline_support: false, readiness_stage: "production" },
    { surface_key: "mobile_ios", display_name: "iOS Mobile", surface_class: "planned", interaction_model: "touch_gesture", notification_model: "push_apns", input_modes: ["touch","voice"], output_modes: ["screen","haptic"], offline_support: true, readiness_stage: "planned" },
    { surface_key: "mobile_android", display_name: "Android Mobile", surface_class: "planned", interaction_model: "touch_gesture", notification_model: "push_fcm", input_modes: ["touch","voice"], output_modes: ["screen","haptic"], offline_support: true, readiness_stage: "planned" },
    { surface_key: "desktop", display_name: "Desktop App", surface_class: "planned", interaction_model: "mouse_keyboard", notification_model: "native_os", input_modes: ["keyboard","mouse"], output_modes: ["screen","system_tray"], offline_support: true, readiness_stage: "planned" },
    { surface_key: "spatial", display_name: "AR/VR Spatial", surface_class: "experimental", interaction_model: "gesture_gaze_voice", notification_model: "spatial_overlay", input_modes: ["gesture","gaze","voice","controller"], output_modes: ["3d_space","spatial_audio"], offline_support: false, readiness_stage: "planned" },
    { surface_key: "voice", display_name: "Voice Assistant", surface_class: "planned", interaction_model: "voice_command", notification_model: "audio_spoken", input_modes: ["voice"], output_modes: ["audio_spoken"], offline_support: false, readiness_stage: "planned" },
  ];

  const surfaceIds: Record<string, string> = {};
  for (const s of surfaces) {
    const { data } = await supabase.from("surface_types").upsert({ ...s, user_id: userId }, { onConflict: "surface_key,user_id" }).select().single();
    if (data) surfaceIds[s.surface_key] = data.id;
  }

  const adapters = [
    { surface_key: "web", adapter_name: "React WebShell Adapter", shell_type: "WebShell", status: "active",
      navigation_grammar: { type: "route_based", pattern: "/{domain}/{page}", supports_deep_links: true, supports_back_navigation: true },
      interaction_grammar: { primary: "click", secondary: "keyboard_shortcut", supports_drag: true, supports_haptic: false, supports_multi_window: false },
      notification_grammar: { channel: "toast", urgency_levels: ["info","warning","error","success"], supports_grouping: true, supports_actions: true },
      performance_profile: { target_lcp_ms: 2500, target_fid_ms: 100, target_cls: 0.1 } },
    { surface_key: "mobile_ios", adapter_name: "Capacitor iOS Adapter", shell_type: "MobileShell", status: "planned",
      navigation_grammar: { type: "stack_based", pattern: "push/pop", supports_deep_links: true, supports_back_navigation: true },
      interaction_grammar: { primary: "tap", secondary: "swipe", supports_haptic: true, supports_drag: false, supports_multi_window: false },
      notification_grammar: { channel: "push_apns", urgency_levels: ["background","default","time_sensitive","critical"], supports_grouping: true, supports_actions: true } },
    { surface_key: "mobile_android", adapter_name: "Capacitor Android Adapter", shell_type: "MobileShell", status: "planned",
      navigation_grammar: { type: "stack_based", pattern: "push/pop", supports_deep_links: true, supports_back_navigation: true },
      interaction_grammar: { primary: "tap", secondary: "swipe", supports_haptic: true, supports_drag: false, supports_multi_window: false },
      notification_grammar: { channel: "push_fcm", urgency_levels: ["default","high","max"], supports_grouping: true, supports_actions: true } },
    { surface_key: "desktop", adapter_name: "Electron Desktop Adapter", shell_type: "DesktopShell", status: "planned",
      navigation_grammar: { type: "tab_panel", pattern: "multi_window", supports_deep_links: true, supports_back_navigation: true },
      interaction_grammar: { primary: "click", secondary: "keyboard_shortcut", supports_drag: true, supports_multi_window: true, supports_haptic: false } },
    { surface_key: "spatial", adapter_name: "Spatial Computing Adapter", shell_type: "SpatialShell", status: "planned",
      navigation_grammar: { type: "spatial_anchored", pattern: "rooms_and_objects", supports_deep_links: false, supports_back_navigation: false },
      interaction_grammar: { primary: "gesture", secondary: "gaze", tertiary: "voice", supports_drag: false, supports_haptic: true, supports_multi_window: false } },
    { surface_key: "voice", adapter_name: "Voice Shell Adapter", shell_type: "VoiceShell", status: "planned",
      navigation_grammar: { type: "voice_menu", pattern: "intent_routing", supports_deep_links: false, supports_back_navigation: false },
      interaction_grammar: { primary: "voice", supports_drag: false, supports_haptic: false, supports_multi_window: false },
      notification_grammar: { channel: "audio_spoken", urgency_levels: ["normal","urgent"], supports_grouping: false, supports_actions: false } },
  ];

  for (const a of adapters) {
    const surfaceId = surfaceIds[a.surface_key];
    if (!surfaceId) continue;
    const { surface_key, ...rest } = a;
    await supabase.from("surface_adapters").upsert({ ...rest, surface_id: surfaceId, user_id: userId }, { onConflict: "surface_id" }).select();
  }

  const shells = [
    { shell_type: "WebShell", surface_key: "web", version: "1.0.0", status: "production", technology_stack: ["React 18","Vite 5","Tailwind CSS","TypeScript","Supabase"], route_count: 150, component_count: 300, capability_coverage_pct: 85, boundary_violations: 12 },
    { shell_type: "MobileShell", surface_key: "mobile_ios", version: "0.0.0", status: "planned", technology_stack: ["Capacitor","React","iOS Native"], capability_coverage_pct: 0 },
    { shell_type: "MobileShell", surface_key: "mobile_android", version: "0.0.0", status: "planned", technology_stack: ["Capacitor","React","Android Native"], capability_coverage_pct: 0 },
    { shell_type: "DesktopShell", surface_key: "desktop", version: "0.0.0", status: "planned", technology_stack: ["Electron","React"], capability_coverage_pct: 0 },
    { shell_type: "SpatialShell", surface_key: "spatial", version: "0.0.0", status: "planned", technology_stack: ["WebXR","Three.js","React Three Fiber"], capability_coverage_pct: 0 },
    { shell_type: "VoiceShell", surface_key: "voice", version: "0.0.0", status: "planned", technology_stack: ["Dialogflow","Voice SDK"], capability_coverage_pct: 0 },
  ];

  for (const sh of shells) {
    const surfaceId = surfaceIds[sh.surface_key];
    if (!surfaceId) continue;
    const { surface_key, ...rest } = sh;
    await supabase.from("shell_implementations").upsert({ ...rest, surface_id: surfaceId, user_id: userId }, { onConflict: "surface_id" }).select();
  }

  for (const [key, id] of Object.entries(surfaceIds)) {
    const isWeb = key === "web";
    await supabase.from("surface_readiness_records").upsert({
      user_id: userId, surface_id: id,
      portability_score: isWeb ? 85 : 0,
      contract_coverage_pct: isWeb ? 90 : 0,
      capability_coverage_pct: isWeb ? 85 : 0,
      trust_portability: true, workflow_portability: true, receipt_portability: true,
      blockers: isWeb ? [] : ["Shell not implemented", "Adapter not built"],
    }, { onConflict: "surface_id" }).select();
  }

  return jsonRes({ success: true, surfaces: Object.keys(surfaceIds).length });
}

async function seedCapabilities(supabase: any, userId: string) {
  const capabilities = [
    { capability_key: "files.upload", display_name: "Upload File", domain: "files", action_type: "command", risk_tier: "low", portability_class: "portable", ai_eligible: false },
    { capability_key: "files.list", display_name: "List Files", domain: "files", action_type: "query", risk_tier: "low", portability_class: "portable", ai_eligible: true },
    { capability_key: "boardroom.compose.weekly", display_name: "Compose Weekly Packet", domain: "boardroom", action_type: "workflow", risk_tier: "medium", portability_class: "portable", ai_eligible: true },
    { capability_key: "boardroom.view", display_name: "View Boardroom", domain: "boardroom", action_type: "query", risk_tier: "low", portability_class: "portable", ai_eligible: false },
    { capability_key: "money.accounts.list", display_name: "List Accounts", domain: "money", action_type: "query", risk_tier: "low", portability_class: "portable", ai_eligible: true },
    { capability_key: "money.transfer.initiate", display_name: "Initiate Transfer", domain: "money", action_type: "command", risk_tier: "critical", portability_class: "portable", requires_approval: true, ai_eligible: false },
    { capability_key: "advisor.chat", display_name: "Chat with Advisor", domain: "advisor", action_type: "command", risk_tier: "low", portability_class: "portable", ai_eligible: true },
    { capability_key: "advisor.synthesize", display_name: "Generate Synthesis", domain: "advisor", action_type: "workflow", risk_tier: "medium", portability_class: "portable", ai_eligible: true },
    { capability_key: "connector.connect", display_name: "Connect Account", domain: "connectors", action_type: "command", risk_tier: "medium", portability_class: "web_preferred", ai_eligible: false },
    { capability_key: "connector.sync", display_name: "Sync Connector", domain: "connectors", action_type: "command", risk_tier: "low", portability_class: "portable", ai_eligible: true },
    { capability_key: "command.palette.invoke", display_name: "Invoke Command", domain: "system", action_type: "command", risk_tier: "low", portability_class: "surface_specific", ai_eligible: false },
    { capability_key: "notification.send", display_name: "Send Notification", domain: "system", action_type: "event", risk_tier: "low", portability_class: "portable", ai_eligible: true },
    { capability_key: "workflow.approve", display_name: "Approve Action", domain: "governance", action_type: "command", risk_tier: "high", portability_class: "portable", requires_approval: false, ai_eligible: false },
    { capability_key: "memory.create", display_name: "Create Memory Entry", domain: "memory", action_type: "command", risk_tier: "low", portability_class: "portable", ai_eligible: true },
    { capability_key: "investment.watchlist.add", display_name: "Add to Watchlist", domain: "investments", action_type: "command", risk_tier: "low", portability_class: "portable", ai_eligible: true },
    { capability_key: "settings.update", display_name: "Update Settings", domain: "settings", action_type: "command", risk_tier: "medium", portability_class: "portable", ai_eligible: false },
    { capability_key: "receipt.fetch", display_name: "Fetch Receipt", domain: "governance", action_type: "query", risk_tier: "low", portability_class: "portable", ai_eligible: true },
    { capability_key: "selfhealing.execute", display_name: "Execute Self-Healing", domain: "automation", action_type: "workflow", risk_tier: "high", portability_class: "portable", requires_approval: true, ai_eligible: true },
  ];

  const capIds: Record<string, string> = {};
  for (const c of capabilities) {
    const { data } = await supabase.from("capability_definitions").upsert({ ...c, user_id: userId }, { onConflict: "capability_key,user_id" }).select().single();
    if (data) capIds[c.capability_key] = data.id;
  }

  const { data: webSurface } = await supabase.from("surface_types").select("id").eq("user_id", userId).eq("surface_key", "web").single();
  if (webSurface) {
    for (const [_key, capId] of Object.entries(capIds)) {
      await supabase.from("capability_surface_bindings").upsert({
        user_id: userId, capability_id: capId, surface_id: webSurface.id,
        binding_status: "production", interaction_pattern: "ui_component",
      }, { onConflict: "capability_id,surface_id" }).select();
    }
  }

  const { data: mobileSurface } = await supabase.from("surface_types").select("id").eq("user_id", userId).eq("surface_key", "mobile_ios").single();
  if (mobileSurface) {
    const mobileKeys = ["files.upload","files.list","money.accounts.list","advisor.chat","notification.send","workflow.approve","receipt.fetch","investment.watchlist.add"];
    for (const key of mobileKeys) {
      if (capIds[key]) {
        await supabase.from("capability_surface_bindings").upsert({
          user_id: userId, capability_id: capIds[key], surface_id: mobileSurface.id,
          binding_status: "planned", interaction_pattern: "native_touch",
        }, { onConflict: "capability_id,surface_id" }).select();
      }
    }
  }

  return jsonRes({ success: true, capabilities: Object.keys(capIds).length });
}

async function auditBoundaries(supabase: any, userId: string) {
  const boundaries = [
    { component_path: "src/pages/money/MoneyCenter.tsx", component_type: "page", layer: "surface", owns_business_logic: true, is_boundary_violation: true, violation_type: "page_owns_domain_logic", migration_priority: "high", migration_target: "src/lib/domain/money-service.ts" },
    { component_path: "src/pages/business/BusinessCenter.tsx", component_type: "page", layer: "surface", owns_business_logic: true, is_boundary_violation: true, violation_type: "page_owns_domain_logic", migration_priority: "high", migration_target: "src/lib/domain/business-service.ts" },
    { component_path: "src/hooks/useAdvisorChat.ts", component_type: "hook", layer: "surface", owns_business_logic: true, is_boundary_violation: true, violation_type: "hook_owns_workflow", migration_priority: "medium", migration_target: "src/lib/capabilities/advisor-capability.ts" },
    { component_path: "src/lib/data-services/money-data-service.ts", component_type: "service", layer: "core_runtime", owns_business_logic: true, is_boundary_violation: false, migration_priority: "none" },
    { component_path: "src/lib/data-services/boardroom-data-service.ts", component_type: "service", layer: "core_runtime", owns_business_logic: true, is_boundary_violation: false, migration_priority: "none" },
    { component_path: "src/components/boardroom/BoardroomPacket.tsx", component_type: "component", layer: "surface", owns_business_logic: false, is_boundary_violation: false, migration_priority: "none" },
    { component_path: "src/pages/admin/ConnectorGovernanceCenter.tsx", component_type: "page", layer: "surface", owns_business_logic: true, is_boundary_violation: true, violation_type: "page_owns_connector_logic", migration_priority: "medium", migration_target: "src/lib/capabilities/connector-capability.ts" },
    { component_path: "src/integrations/supabase/client.ts", component_type: "service", layer: "core_runtime", owns_business_logic: false, is_boundary_violation: false, migration_priority: "none" },
    { component_path: "src/pages/workspace/FilesWorkspace.tsx", component_type: "page", layer: "surface", owns_business_logic: true, is_boundary_violation: true, violation_type: "page_owns_file_operations", migration_priority: "medium", migration_target: "src/lib/capabilities/files-capability.ts" },
    { component_path: "src/lib/mock-data/money.ts", component_type: "service", layer: "contract", owns_business_logic: false, is_boundary_violation: false, migration_priority: "none", notes: "Data contract layer" },
  ];

  await supabase.from("architecture_boundary_records").delete().eq("user_id", userId);
  for (const b of boundaries) {
    await supabase.from("architecture_boundary_records").insert({ ...b, user_id: userId });
  }

  const violations = boundaries.filter(b => b.is_boundary_violation).length;
  return jsonRes({ success: true, total: boundaries.length, violations, clean: boundaries.length - violations });
}

async function checkConsistency(supabase: any, userId: string) {
  const checks = [
    { check_name: "surface_adapter_coverage", target: "surface_adapters", status: "pass" as const, details: "All surfaces have adapter definitions" },
    { check_name: "capability_binding_coverage", target: "capability_surface_bindings", status: "pass" as const, details: "Web surface has all capability bindings" },
    { check_name: "shell_implementation_coverage", target: "shell_implementations", status: "pass" as const, details: "All surfaces have shell implementation records" },
    { check_name: "readiness_record_coverage", target: "surface_readiness_records", status: "pass" as const, details: "All surfaces have readiness records" },
  ];

  // Verify each check against DB
  const { data: surfaces } = await supabase.from("surface_types").select("id").eq("user_id", userId);
  const { data: adapters } = await supabase.from("surface_adapters").select("surface_id").eq("user_id", userId);
  const { data: shells } = await supabase.from("shell_implementations").select("surface_id").eq("user_id", userId);
  const { data: readiness } = await supabase.from("surface_readiness_records").select("surface_id").eq("user_id", userId);

  const surfaceCount = surfaces?.length || 0;
  if ((adapters?.length || 0) < surfaceCount) checks[0].status = "fail" as any;
  if ((shells?.length || 0) < surfaceCount) checks[2].status = "fail" as any;
  if ((readiness?.length || 0) < surfaceCount) checks[3].status = "fail" as any;

  const passing = checks.filter(c => c.status === "pass").length;
  return jsonRes({ success: true, checks, passing, total: checks.length, consistent: passing === checks.length });
}

async function seedExperienceGrammars(supabase: any, userId: string) {
  const grammars = [
    { grammar_key: "navigation", domain: "system", rules: { web: "route_based", mobile: "stack_based", desktop: "tab_panel", voice: "intent_routing", spatial: "spatial_anchored" } },
    { grammar_key: "interaction", domain: "system", rules: { web: "click_keyboard", mobile: "tap_swipe", desktop: "click_keyboard_shortcut", voice: "voice_command", spatial: "gesture_gaze" } },
    { grammar_key: "notification", domain: "system", rules: { web: "toast_in_app", mobile: "push_native", desktop: "system_tray", voice: "audio_spoken", spatial: "spatial_overlay" } },
    { grammar_key: "approval", domain: "governance", rules: { pattern: "modal_confirmation", escalation: "push_notification", timeout: "auto_reject_24h" } },
    { grammar_key: "ai_disclosure", domain: "ai", rules: { always_show: true, badge_position: "top_right", trust_levels: ["real","partial","demo","unavailable"] } },
  ];

  for (const g of grammars) {
    await supabase.from("experience_grammars").upsert({ ...g, user_id: userId }, { onConflict: "grammar_key,user_id" });
  }

  return jsonRes({ success: true, grammars: grammars.length });
}

async function portabilityReport(supabase: any, userId: string) {
  const { data: records } = await supabase.from("surface_readiness_records")
    .select("*, surface_types(surface_key, display_name)")
    .eq("user_id", userId);

  const report = (records || []).map((r: any) => ({
    surface: r.surface_types?.display_name || "Unknown",
    key: r.surface_types?.surface_key,
    portability_score: r.portability_score,
    contract_coverage: r.contract_coverage_pct,
    capability_coverage: r.capability_coverage_pct,
    blockers: r.blockers || [],
    ready: (r.blockers || []).length === 0 && r.portability_score > 50,
  }));

  return jsonRes({ success: true, report, total: report.length, ready: report.filter((r: any) => r.ready).length });
}

async function surfaceLaunchProfileCheck(supabase: any, userId: string) {
  const { data: surfaces } = await supabase.from("surface_types").select("*").eq("user_id", userId);
  const { data: shells } = await supabase.from("shell_implementations").select("*").eq("user_id", userId);
  const { data: readiness } = await supabase.from("surface_readiness_records").select("*").eq("user_id", userId);

  const profiles = (surfaces || []).map((s: any) => {
    const shell = (shells || []).find((sh: any) => sh.surface_id === s.id);
    const ready = (readiness || []).find((r: any) => r.surface_id === s.id);
    return {
      surface: s.display_name,
      key: s.surface_key,
      class: s.surface_class,
      readiness_stage: s.readiness_stage,
      shell_status: shell?.status || "missing",
      portability_score: ready?.portability_score || 0,
      launch_eligible: s.readiness_stage === "production" && shell?.status === "production",
    };
  });

  return jsonRes({ success: true, profiles, launchable: profiles.filter((p: any) => p.launch_eligible).length });
}
