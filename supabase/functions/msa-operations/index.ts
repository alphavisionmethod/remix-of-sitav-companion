import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { handleCors, corsHeaders, corsResponse, corsError } from "../_shared/cors.ts";

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
      case "seed_experience_grammars": return await seedExperienceGrammars(supabase, user.id);
      case "portability_report": return await portabilityReport(supabase, user.id);
      case "surface_launch_profile_check": return await surfaceLaunchProfileCheck(supabase, user.id);
      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), { status: 400, headers: corsHeaders });
    }
  } catch (err) {
    console.error("msa-operations error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});

function jsonRes(body: unknown) {
  return new Response(JSON.stringify(body), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
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
    for (const [key, capId] of Object.entries(capIds)) {
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
    { check_type: "contract", scope: "Money domain entities", surfaces_checked: ["web"], consistent: true },
    { check_type: "truth", scope: "Boardroom packet truth model", surfaces_checked: ["web"], consistent: true },
    { check_type: "workflow", scope: "Approval workflow semantics", surfaces_checked: ["web"], consistent: true },
    { check_type: "receipt", scope: "Action receipt format", surfaces_checked: ["web"], consistent: true },
    { check_type: "capability", scope: "files.upload capability contract", surfaces_checked: ["web","mobile_ios"], consistent: false, drift_description: "Mobile surface binding not implemented — planned only", severity: "medium" },
    { check_type: "notification", scope: "Notification urgency mapping", surfaces_checked: ["web","mobile_ios"], consistent: false, drift_description: "Web uses toast levels, mobile uses APNS levels — mapping needed", severity: "low" },
    { check_type: "trust_presentation", scope: "Trust score rendering", surfaces_checked: ["web"], consistent: true },
    { check_type: "experience_grammar", scope: "Command grammar canonical values", surfaces_checked: ["web","voice"], consistent: false, drift_description: "Voice surface lacks command grammar rendering rules", severity: "medium" },
  ];

  for (const c of checks) {
    await supabase.from("cross_surface_consistency_records").insert({ ...c, user_id: userId });
  }

  const inconsistent = checks.filter(c => !c.consistent).length;
  return jsonRes({ success: true, total: checks.length, consistent: checks.length - inconsistent, inconsistent });
}

async function seedExperienceGrammars(supabase: any, userId: string) {
  const grammars = [
    { grammar_type: "trust_state", grammar_key: "proven", display_name: "Proven", description: "Entity is verified with evidence", canonical_values: [{ key: "proven", label: "Proven", severity: "success" },{ key: "verified", label: "Verified", severity: "success" },{ key: "trusted", label: "Trusted", severity: "info" },{ key: "unverified", label: "Unverified", severity: "warning" },{ key: "untrusted", label: "Untrusted", severity: "error" },{ key: "revoked", label: "Revoked", severity: "error" }], surface_rendering_rules: { web: { component: "Badge", variant: "trust" }, mobile: { component: "TrustChip" }, spatial: { component: "TrustHalo" } } },
    { grammar_type: "workflow_state", grammar_key: "lifecycle", display_name: "Workflow Lifecycle", description: "Standard workflow state transitions", canonical_values: [{ key: "pending", label: "Pending" },{ key: "running", label: "Running" },{ key: "waiting_approval", label: "Waiting Approval" },{ key: "completed", label: "Completed" },{ key: "failed", label: "Failed" },{ key: "stuck", label: "Stuck" },{ key: "rolled_back", label: "Rolled Back" }], surface_rendering_rules: { web: { component: "WorkflowStatusBadge" }, mobile: { component: "StatusPill" } } },
    { grammar_type: "action_state", grammar_key: "execution", display_name: "Action Execution State", canonical_values: [{ key: "idle", label: "Idle" },{ key: "executing", label: "Executing" },{ key: "succeeded", label: "Succeeded" },{ key: "failed", label: "Failed" },{ key: "cancelled", label: "Cancelled" },{ key: "requires_approval", label: "Requires Approval" }], surface_rendering_rules: { web: { component: "ActionStateIndicator" } } },
    { grammar_type: "receipt_proof", grammar_key: "types", display_name: "Receipt Types", canonical_values: [{ key: "action_receipt", label: "Action Receipt" },{ key: "approval_receipt", label: "Approval Receipt" },{ key: "verification_receipt", label: "Verification Receipt" },{ key: "rollback_receipt", label: "Rollback Receipt" },{ key: "payment_receipt", label: "Payment Receipt" },{ key: "decision_receipt", label: "Decision Receipt" }], surface_rendering_rules: { web: { component: "ProofReceipt" }, mobile: { component: "ReceiptCard" } } },
    { grammar_type: "command", grammar_key: "actions", display_name: "Command Actions", canonical_values: [{ key: "navigate", label: "Navigate" },{ key: "execute", label: "Execute" },{ key: "query", label: "Query" },{ key: "approve", label: "Approve" },{ key: "reject", label: "Reject" },{ key: "configure", label: "Configure" },{ key: "create", label: "Create" },{ key: "delete", label: "Delete" }], surface_rendering_rules: { web: { component: "CommandPalette" }, voice: { component: "VoiceCommandRouter" } } },
    { grammar_type: "boardroom", grammar_key: "elements", display_name: "Boardroom Elements", canonical_values: [{ key: "packet", label: "Packet" },{ key: "slide", label: "Slide" },{ key: "insight", label: "Insight" },{ key: "recommendation", label: "Recommendation" },{ key: "alert", label: "Alert" },{ key: "trend", label: "Trend" }], surface_rendering_rules: { web: { component: "BoardroomSlide" }, spatial: { component: "BoardroomRoom" } } },
    { grammar_type: "notification_urgency", grammar_key: "levels", display_name: "Notification Urgency", canonical_values: [{ key: "critical", label: "Critical", severity: "error" },{ key: "high", label: "High", severity: "warning" },{ key: "normal", label: "Normal", severity: "info" },{ key: "low", label: "Low", severity: "info" },{ key: "silent", label: "Silent", severity: "info" }], surface_rendering_rules: { web: { component: "Toast" }, mobile: { component: "PushNotification" }, voice: { component: "SpokenAlert" } } },
    { grammar_type: "opportunity_scoring", grammar_key: "tiers", display_name: "Opportunity Tiers", canonical_values: [{ key: "urgent", label: "Urgent", severity: "error" },{ key: "high_value", label: "High Value", severity: "warning" },{ key: "moderate", label: "Moderate", severity: "info" },{ key: "informational", label: "Informational", severity: "info" }], surface_rendering_rules: { web: { component: "OpportunityCard" } } },
    { grammar_type: "degraded_state", grammar_key: "health", display_name: "Degraded State", canonical_values: [{ key: "healthy", label: "Healthy", severity: "success" },{ key: "degraded", label: "Degraded", severity: "warning" },{ key: "partial_outage", label: "Partial Outage", severity: "error" },{ key: "full_outage", label: "Full Outage", severity: "error" },{ key: "maintenance", label: "Maintenance", severity: "info" }], surface_rendering_rules: { web: { component: "HealthBanner" } } },
    { grammar_type: "refusal", grammar_key: "reasons", display_name: "Refusal Reasons", canonical_values: [{ key: "unauthorized", label: "Unauthorized", severity: "error" },{ key: "insufficient_privilege", label: "Insufficient Privilege", severity: "warning" },{ key: "policy_blocked", label: "Policy Blocked", severity: "warning" },{ key: "budget_exceeded", label: "Budget Exceeded", severity: "error" },{ key: "rate_limited", label: "Rate Limited", severity: "warning" },{ key: "feature_disabled", label: "Feature Disabled", severity: "info" }], surface_rendering_rules: { web: { component: "RefusalDialog" } } },
  ];

  let count = 0;
  for (const g of grammars) {
    const { error } = await supabase.from("experience_grammar_records").upsert({ ...g, user_id: userId }, { onConflict: "user_id,grammar_type,grammar_key" });
    if (!error) count++;
  }

  return jsonRes({ success: true, grammars_seeded: count });
}

async function portabilityReport(supabase: any, userId: string) {
  const { data: caps } = await supabase.from("capability_definitions").select("id, capability_key, display_name, domain, portability_class").eq("user_id", userId);
  const { data: surfaces } = await supabase.from("surface_types").select("id, surface_key, display_name").eq("user_id", userId);
  const { data: bindings } = await supabase.from("capability_surface_bindings").select("capability_id, surface_id, binding_status").eq("user_id", userId);

  if (!caps || !surfaces) return jsonRes({ success: false, error: "No data" });

  const matrix: any[] = [];
  for (const cap of caps) {
    const row: any = { capability_key: cap.capability_key, display_name: cap.display_name, domain: cap.domain, portability_class: cap.portability_class };
    for (const surf of surfaces) {
      const binding = (bindings || []).find((b: any) => b.capability_id === cap.id && b.surface_id === surf.id);
      row[surf.surface_key] = binding ? binding.binding_status : "no_binding";
    }
    matrix.push(row);
  }

  const totalBindings = (bindings || []).length;
  const totalPossible = (caps || []).length * (surfaces || []).length;
  const coveragePct = totalPossible > 0 ? Math.round((totalBindings / totalPossible) * 100) : 0;

  // Upsert portability records
  for (const cap of caps) {
    for (const surf of surfaces) {
      const binding = (bindings || []).find((b: any) => b.capability_id === cap.id && b.surface_id === surf.id);
      const score = binding?.binding_status === "production" ? 100 : binding?.binding_status === "beta" ? 75 : binding?.binding_status === "planned" ? 25 : 0;
      const blockers = !binding ? ["No surface binding"] : binding.binding_status === "planned" ? ["Not yet implemented"] : [];
      const status = score === 100 ? "portable" : score > 0 ? "partial" : "not_assessed";

      await supabase.from("capability_portability_records").upsert({
        user_id: userId, capability_id: cap.id, surface_id: surf.id,
        portability_score: score, blockers, status,
        evidence: { binding_status: binding?.binding_status || "none" },
      }, { onConflict: "user_id,capability_id,surface_id" });
    }
  }

  return jsonRes({ success: true, matrix, coverage_pct: coveragePct, total_bindings: totalBindings, total_possible: totalPossible });
}

async function surfaceLaunchProfileCheck(supabase: any, userId: string) {
  const { data: surfaces } = await supabase.from("surface_types").select("id, surface_key, display_name, readiness_stage").eq("user_id", userId);
  const { data: readiness } = await supabase.from("surface_readiness_records").select("*").eq("user_id", userId);
  const { data: shells } = await supabase.from("shell_implementations").select("*").eq("user_id", userId);

  if (!surfaces) return jsonRes({ success: false, error: "No surfaces" });

  const profiles: any[] = [];
  for (const surf of surfaces) {
    const ready = (readiness || []).find((r: any) => r.surface_id === surf.id);
    const shell = (shells || []).find((s: any) => s.surface_id === surf.id);

    const blockers: string[] = [];
    if (!shell) blockers.push("No shell implementation");
    if (shell?.capability_coverage_pct < 50) blockers.push("Capability coverage below 50%");
    if (shell?.boundary_violations > 0) blockers.push(`${shell.boundary_violations} boundary violations`);
    if (!ready?.trust_portability) blockers.push("Trust not portable");
    if (!ready?.workflow_portability) blockers.push("Workflow not portable");

    const score = ready?.portability_score || 0;
    const launchStatus = surf.readiness_stage === "production" ? "launched" : surf.readiness_stage === "beta" ? "testing" : "planning";

    await supabase.from("surface_launch_profiles").upsert({
      user_id: userId, surface_id: surf.id,
      readiness_score: score, blockers, launch_status: launchStatus,
      gate_results: {
        shell_exists: !!shell,
        capability_coverage: shell?.capability_coverage_pct || 0,
        boundary_clean: (shell?.boundary_violations || 0) === 0,
        trust_portable: ready?.trust_portability || false,
        workflow_portable: ready?.workflow_portability || false,
      },
    }, { onConflict: "user_id,surface_id" });

    profiles.push({ surface: surf.display_name, readiness_score: score, launch_status: launchStatus, blockers });
  }

  return jsonRes({ success: true, profiles });
}
