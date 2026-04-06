import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "No auth" }), { status: 401, headers: corsHeaders });

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const { action, ...params } = await req.json();

    switch (action) {
      case "seed_surfaces": return await seedSurfaces(supabase, user.id);
      case "seed_capabilities": return await seedCapabilities(supabase, user.id);
      case "audit_boundaries": return await auditBoundaries(supabase, user.id);
      case "check_consistency": return await checkConsistency(supabase, user.id);
      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), { status: 400, headers: corsHeaders });
    }
  } catch (err) {
    console.error("msa-operations error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});

async function seedSurfaces(supabase: any, userId: string) {
  const surfaces = [
    { surface_key: "web", display_name: "Web", surface_class: "active", interaction_model: "mouse_keyboard_touch", notification_model: "in_app_toast", input_modes: ["keyboard","mouse","touch"], output_modes: ["screen"], offline_support: false, readiness_stage: "production" },
    { surface_key: "mobile_ios", display_name: "iOS Mobile", surface_class: "planned", interaction_model: "touch_gesture", notification_model: "push_apns", input_modes: ["touch","voice"], output_modes: ["screen","haptic"], offline_support: true, readiness_stage: "planned" },
    { surface_key: "mobile_android", display_name: "Android Mobile", surface_class: "planned", interaction_model: "touch_gesture", notification_model: "push_fcm", input_modes: ["touch","voice"], output_modes: ["screen","haptic"], offline_support: true, readiness_stage: "planned" },
    { surface_key: "desktop", display_name: "Desktop App", surface_class: "planned", interaction_model: "mouse_keyboard", notification_model: "native_os", input_modes: ["keyboard","mouse"], output_modes: ["screen","system_tray"], offline_support: true, readiness_stage: "planned" },
    { surface_key: "spatial", display_name: "AR/VR Spatial", surface_class: "experimental", interaction_model: "gesture_gaze_voice", notification_model: "spatial_overlay", input_modes: ["gesture","gaze","voice","controller"], output_modes: ["3d_space","spatial_audio"], offline_support: false, readiness_stage: "planned" },
  ];

  const surfaceIds: Record<string, string> = {};
  for (const s of surfaces) {
    const { data } = await supabase.from("surface_types").upsert({ ...s, user_id: userId }, { onConflict: "surface_key,user_id" }).select().single();
    if (data) surfaceIds[s.surface_key] = data.id;
  }

  // Seed adapters
  const adapters = [
    { surface_key: "web", adapter_name: "React WebShell Adapter", shell_type: "WebShell", status: "active",
      navigation_grammar: { type: "route_based", pattern: "/{domain}/{page}", supports_deep_links: true },
      interaction_grammar: { primary: "click", secondary: "keyboard_shortcut", supports_drag: true },
      notification_grammar: { channel: "toast", urgency_levels: ["info","warning","error","success"] },
      performance_profile: { target_lcp_ms: 2500, target_fid_ms: 100, target_cls: 0.1 } },
    { surface_key: "mobile_ios", adapter_name: "Capacitor iOS Adapter", shell_type: "MobileShell", status: "planned",
      navigation_grammar: { type: "stack_based", pattern: "push/pop", supports_deep_links: true },
      interaction_grammar: { primary: "tap", secondary: "swipe", supports_haptic: true },
      notification_grammar: { channel: "push_apns", urgency_levels: ["background","default","time_sensitive","critical"] } },
    { surface_key: "mobile_android", adapter_name: "Capacitor Android Adapter", shell_type: "MobileShell", status: "planned",
      navigation_grammar: { type: "stack_based", pattern: "push/pop", supports_deep_links: true },
      interaction_grammar: { primary: "tap", secondary: "swipe", supports_haptic: true },
      notification_grammar: { channel: "push_fcm", urgency_levels: ["default","high","max"] } },
    { surface_key: "desktop", adapter_name: "Electron Desktop Adapter", shell_type: "DesktopShell", status: "planned",
      navigation_grammar: { type: "tab_panel", pattern: "multi_window", supports_deep_links: true },
      interaction_grammar: { primary: "click", secondary: "keyboard_shortcut", supports_drag: true, supports_multi_window: true } },
    { surface_key: "spatial", adapter_name: "Spatial Computing Adapter", shell_type: "SpatialShell", status: "planned",
      navigation_grammar: { type: "spatial_anchored", pattern: "rooms_and_objects" },
      interaction_grammar: { primary: "gesture", secondary: "gaze", tertiary: "voice" } },
  ];

  for (const a of adapters) {
    const surfaceId = surfaceIds[a.surface_key];
    if (!surfaceId) continue;
    const { surface_key, ...rest } = a;
    await supabase.from("surface_adapters").upsert({ ...rest, surface_id: surfaceId, user_id: userId }, { onConflict: "surface_id" }).select();
  }

  // Seed shell implementations
  const shells = [
    { shell_type: "WebShell", surface_key: "web", version: "1.0.0", status: "production", technology_stack: ["React 18","Vite 5","Tailwind CSS","TypeScript","Supabase"], route_count: 150, component_count: 300, capability_coverage_pct: 85, boundary_violations: 12 },
    { shell_type: "MobileShell", surface_key: "mobile_ios", version: "0.0.0", status: "planned", technology_stack: ["Capacitor","React","iOS Native"], capability_coverage_pct: 0 },
    { shell_type: "MobileShell", surface_key: "mobile_android", version: "0.0.0", status: "planned", technology_stack: ["Capacitor","React","Android Native"], capability_coverage_pct: 0 },
    { shell_type: "DesktopShell", surface_key: "desktop", version: "0.0.0", status: "planned", technology_stack: ["Electron","React"], capability_coverage_pct: 0 },
    { shell_type: "SpatialShell", surface_key: "spatial", version: "0.0.0", status: "planned", technology_stack: ["WebXR","Three.js","React Three Fiber"], capability_coverage_pct: 0 },
  ];

  for (const sh of shells) {
    const surfaceId = surfaceIds[sh.surface_key];
    if (!surfaceId) continue;
    const { surface_key, ...rest } = sh;
    await supabase.from("shell_implementations").insert({ ...rest, surface_id: surfaceId, user_id: userId }).select();
  }

  // Seed readiness
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

  return new Response(JSON.stringify({ success: true, surfaces: Object.keys(surfaceIds).length }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
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

  // Bind capabilities to web surface
  const { data: webSurface } = await supabase.from("surface_types").select("id").eq("user_id", userId).eq("surface_key", "web").single();
  if (webSurface) {
    for (const [key, capId] of Object.entries(capIds)) {
      await supabase.from("capability_surface_bindings").upsert({
        user_id: userId, capability_id: capId, surface_id: webSurface.id,
        binding_status: "production", interaction_pattern: "ui_component",
      }, { onConflict: "capability_id,surface_id" }).select();
    }
  }

  // Bind key capabilities to mobile (planned)
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

  return new Response(JSON.stringify({ success: true, capabilities: Object.keys(capIds).length }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

async function auditBoundaries(supabase: any, userId: string) {
  // Simulate a boundary audit of the current codebase
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

  // Clear old records and insert fresh audit
  await supabase.from("architecture_boundary_records").delete().eq("user_id", userId);
  for (const b of boundaries) {
    await supabase.from("architecture_boundary_records").insert({ ...b, user_id: userId });
  }

  const violations = boundaries.filter(b => b.is_boundary_violation).length;
  const total = boundaries.length;

  return new Response(JSON.stringify({ success: true, total, violations, clean: total - violations }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

async function checkConsistency(supabase: any, userId: string) {
  const checks = [
    { check_type: "contract", scope: "Money domain entities", surfaces_checked: ["web"], consistent: true },
    { check_type: "truth", scope: "Boardroom packet truth model", surfaces_checked: ["web"], consistent: true },
    { check_type: "workflow", scope: "Approval workflow semantics", surfaces_checked: ["web"], consistent: true },
    { check_type: "receipt", scope: "Action receipt format", surfaces_checked: ["web"], consistent: true },
    { check_type: "capability", scope: "files.upload capability contract", surfaces_checked: ["web","mobile_ios"], consistent: false, drift_description: "Mobile surface binding not implemented — planned only", severity: "medium" },
    { check_type: "notification", scope: "Notification urgency mapping", surfaces_checked: ["web","mobile_ios"], consistent: false, drift_description: "Web uses toast levels, mobile uses APNS levels — mapping needed", severity: "low" },
    { check_type: "trust_presentation", scope: "Trust score rendering", surfaces_checked: ["web"], consistent: true },
  ];

  for (const c of checks) {
    await supabase.from("cross_surface_consistency_records").insert({ ...c, user_id: userId });
  }

  const inconsistent = checks.filter(c => !c.consistent).length;
  return new Response(JSON.stringify({ success: true, total: checks.length, consistent: checks.length - inconsistent, inconsistent }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
