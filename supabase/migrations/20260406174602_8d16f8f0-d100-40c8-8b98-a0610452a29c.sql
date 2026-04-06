
-- ═══════════════════════════════════════════════════════════════
-- Seed route_surface_registry (25 routes)
-- ═══════════════════════════════════════════════════════════════
INSERT INTO route_surface_registry (route_key, route_path, surface_class_id, shell_key, domain_family, capability_family, launch_stage, is_active) VALUES
('admin.runtime_truth', '/admin/runtime', 'af96b5a4-cc99-4db0-a8af-925f2b0f9f93', 'admin_shell', 'system', 'observability', 'live', true),
('admin.ai_governance', '/admin/ai-governance', 'af96b5a4-cc99-4db0-a8af-925f2b0f9f93', 'admin_shell', 'ai', 'ai_governance', 'live', true),
('admin.ai_team', '/admin/ai-team', 'af96b5a4-cc99-4db0-a8af-925f2b0f9f93', 'admin_shell', 'ai', 'ai_workforce', 'live', true),
('admin.connectors', '/admin/connectors', 'af96b5a4-cc99-4db0-a8af-925f2b0f9f93', 'admin_shell', 'connectors', 'connector_management', 'live', true),
('admin.providers', '/admin/providers', 'af96b5a4-cc99-4db0-a8af-925f2b0f9f93', 'admin_shell', 'system', 'provider_management', 'live', true),
('admin.launch_truth', '/admin/launch-truth', 'af96b5a4-cc99-4db0-a8af-925f2b0f9f93', 'admin_shell', 'system', 'launch_governance', 'live', true),
('admin.demo_governance', '/admin/demo-governance', 'af96b5a4-cc99-4db0-a8af-925f2b0f9f93', 'admin_shell', 'system', 'demo_governance', 'live', true),
('admin.budgets', '/admin/budgets', 'af96b5a4-cc99-4db0-a8af-925f2b0f9f93', 'admin_shell', 'ai', 'budget_management', 'live', true),
('admin.system', '/admin/system', 'af96b5a4-cc99-4db0-a8af-925f2b0f9f93', 'admin_shell', 'system', 'system_config', 'live', true),
('admin.remediation', '/admin/remediation', 'af96b5a4-cc99-4db0-a8af-925f2b0f9f93', 'admin_shell', 'system', 'remediation', 'live', true),
('app.dashboard', '/app/dashboard', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'user_app_shell', 'owner', 'daily_pulse', 'live', true),
('app.assistant', '/app/assistant', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'user_app_shell', 'advisor', 'ai_assistant', 'live', true),
('app.files', '/app/files', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'user_app_shell', 'files', 'file_management', 'live', true),
('app.boardroom', '/app/boardroom', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'user_app_shell', 'boardroom', 'boardroom_view', 'live', true),
('app.approvals', '/app/approvals', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'user_app_shell', 'approvals', 'approval_workflow', 'live', true),
('app.business', '/app/business', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'user_app_shell', 'business', 'business_ops', 'live', true),
('app.money', '/app/money', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'user_app_shell', 'money', 'finance_overview', 'live', true),
('app.workspace', '/app/workspace', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'user_app_shell', 'workspace', 'workspace_management', 'live', true),
('app.connected_services', '/app/connected-services', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'user_app_shell', 'connectors', 'service_connections', 'live', true),
('app.settings', '/app/settings', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'user_app_shell', 'owner', 'user_settings', 'live', true),
('app.pulse', '/app/pulse', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'user_app_shell', 'pulse', 'daily_pulse', 'live', true),
('app.investment', '/app/investment', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'user_app_shell', 'investment', 'portfolio_view', 'live', true),
('mobile.home', '/mobile', '57a362a2-f1c9-42c3-b1d3-4af2a0715302', 'mobile_shell', 'owner', 'mobile_home', 'live', true),
('mobile.approvals', '/mobile/approvals', '57a362a2-f1c9-42c3-b1d3-4af2a0715302', 'mobile_shell', 'approvals', 'approval_workflow', 'live', true),
('mobile.alerts', '/mobile/alerts', '57a362a2-f1c9-42c3-b1d3-4af2a0715302', 'mobile_shell', 'alerts', 'alert_system', 'live', true);

-- ═══════════════════════════════════════════════════════════════
-- Seed capability_reality_bindings (20 bindings) — allowed_modes as jsonb
-- ═══════════════════════════════════════════════════════════════
INSERT INTO capability_reality_bindings (capability_key, surface_class_id, preferred_mode_key, allowed_modes, requires_real_provider, allows_demo_provider, allows_internal_test_provider, side_effect_policy_key, launch_honesty_class) VALUES
('boardroom.weekly.summary', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'real', '["real","demo","internal_test"]'::jsonb, false, true, true, 'read_only', 'qualified'),
('boardroom.strategic.view', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'real', '["real","demo"]'::jsonb, false, true, false, 'read_only', 'qualified'),
('advisor.chat.primary', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'real', '["real","demo","internal_test"]'::jsonb, false, true, true, 'simulated_actions', 'demo_governed'),
('advisor.summary', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'real', '["real","demo"]'::jsonb, false, true, false, 'read_only', 'demo_governed'),
('business.pipeline', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'real', '["real","demo"]'::jsonb, false, true, false, 'read_only', 'qualified'),
('business.contacts', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'real', '["real","demo"]'::jsonb, false, true, false, 'simulated_actions', 'qualified'),
('investment.portfolio', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'real', '["real","demo"]'::jsonb, false, true, false, 'read_only', 'demo_governed'),
('money.accounts', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'real', '["real","demo"]'::jsonb, false, true, false, 'read_only', 'qualified'),
('money.transactions', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'real', '["real","demo"]'::jsonb, false, true, false, 'read_only', 'qualified'),
('workspace.projects', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'real', '["real","demo","internal_test"]'::jsonb, false, true, true, 'simulated_actions', 'qualified'),
('workspace.tasks', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'real', '["real","demo","internal_test"]'::jsonb, false, true, true, 'simulated_actions', 'qualified'),
('connector.registry', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'real', '["real","demo"]'::jsonb, false, true, false, 'read_only', 'qualified'),
('approvals.queue', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'real', '["real","demo"]'::jsonb, false, true, false, 'simulated_actions', 'qualified'),
('approvals.review', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'real', '["real","demo"]'::jsonb, false, true, false, 'real_writes_required', 'qualified'),
('pulse.morning', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'real', '["real","demo"]'::jsonb, false, true, false, 'read_only', 'demo_governed'),
('files.list', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'real', '["real","demo"]'::jsonb, false, true, false, 'read_only', 'truthful'),
('files.preview', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'real', '["real","demo"]'::jsonb, false, true, false, 'read_only', 'truthful'),
('admin.truth_dashboard', 'af96b5a4-cc99-4db0-a8af-925f2b0f9f93', 'real', '["real","internal_test"]'::jsonb, true, false, true, 'read_only', 'truthful'),
('admin.ai_governance', 'af96b5a4-cc99-4db0-a8af-925f2b0f9f93', 'real', '["real","internal_test"]'::jsonb, true, false, true, 'read_only', 'truthful'),
('admin.demo_governance', 'af96b5a4-cc99-4db0-a8af-925f2b0f9f93', 'real', '["real","internal_test"]'::jsonb, true, false, true, 'read_only', 'internal_only');

-- ═══════════════════════════════════════════════════════════════
-- Seed launch_honesty_surface_bindings (20 bindings)
-- ═══════════════════════════════════════════════════════════════
INSERT INTO launch_honesty_surface_bindings (binding_type, binding_key, launch_honesty_class, public_claim_allowed, qualifier_required, notes) VALUES
('route', 'app.dashboard', 'qualified', true, true, 'Dashboard real when connectors active; demo-backed otherwise'),
('route', 'app.files', 'truthful', true, false, 'File system fully real via Supabase storage'),
('route', 'app.boardroom', 'demo_governed', true, true, 'Boardroom uses demo data until real connectors'),
('route', 'app.assistant', 'demo_governed', true, true, 'AI advisor requires live API key for real mode'),
('route', 'app.approvals', 'qualified', true, true, 'Approval engine real; data sources may be demo'),
('route', 'app.business', 'qualified', true, true, 'Business CRM demo-backed until connector integration'),
('route', 'app.money', 'demo_governed', true, true, 'Financial data requires banking connector'),
('route', 'app.investment', 'demo_governed', true, true, 'Investment data requires brokerage connector'),
('route', 'app.workspace', 'qualified', true, false, 'Workspace management fully functional'),
('route', 'app.connected_services', 'qualified', true, true, 'Shows real connector status + demo stubs'),
('route', 'app.pulse', 'demo_governed', true, true, 'Pulse aggregates from multiple sources'),
('route', 'app.settings', 'truthful', true, false, 'Settings fully real'),
('route', 'admin.runtime_truth', 'truthful', false, false, 'Admin truth dashboard always real'),
('route', 'admin.ai_governance', 'truthful', false, false, 'AI governance always real'),
('route', 'admin.demo_governance', 'internal_only', false, false, 'Demo governance is internal-only'),
('route', 'mobile.home', 'qualified', true, true, 'Mobile home mirrors app.dashboard honesty'),
('route', 'mobile.approvals', 'qualified', true, true, 'Mobile approvals mirrors app.approvals'),
('capability', 'advisor.chat.primary', 'demo_governed', true, true, 'AI chat demo until provider key configured'),
('capability', 'boardroom.weekly.summary', 'demo_governed', true, true, 'Boardroom summary demo until data sources real'),
('capability', 'files.list', 'truthful', true, false, 'File listing fully real');

-- ═══════════════════════════════════════════════════════════════
-- Seed demo_interaction_policies (20 policies)
-- ═══════════════════════════════════════════════════════════════
INSERT INTO demo_interaction_policies (demo_provider_id, interaction_key, interaction_behavior, user_visible_label, side_effect_policy_key) VALUES
('2af53311-88c4-4efc-beb9-bf2b8f59f69d', 'view_summary', 'simulate', 'View Summary', 'read_only'),
('2af53311-88c4-4efc-beb9-bf2b8f59f69d', 'generate_report', 'preview_only', 'Generate Report', 'simulated_actions'),
('9dcd24ab-7b35-4194-a38d-9869d249a72e', 'send_message', 'simulate', 'Ask Advisor', 'simulated_actions'),
('9dcd24ab-7b35-4194-a38d-9869d249a72e', 'view_history', 'simulate', 'View History', 'read_only'),
('e8b1a53d-e78a-45af-a24b-cf7aedc8166e', 'view_pipeline', 'simulate', 'View Pipeline', 'read_only'),
('e8b1a53d-e78a-45af-a24b-cf7aedc8166e', 'create_contact', 'preview_only', 'Add Contact', 'simulated_actions'),
('e8b1a53d-e78a-45af-a24b-cf7aedc8166e', 'send_proposal', 'blocked', 'Send Proposal', 'real_writes_required'),
('b4ad37e2-8654-4c60-b7ea-5a1e3ae89bff', 'view_portfolio', 'simulate', 'View Portfolio', 'read_only'),
('b4ad37e2-8654-4c60-b7ea-5a1e3ae89bff', 'execute_trade', 'blocked', 'Execute Trade', 'real_writes_required'),
('8d4c96a3-aec6-419e-8881-a64f7533c229', 'view_accounts', 'simulate', 'View Accounts', 'read_only'),
('8d4c96a3-aec6-419e-8881-a64f7533c229', 'initiate_transfer', 'blocked', 'Transfer', 'real_writes_required'),
('42ecea5e-92b4-49a0-bea1-b289e1eb3db9', 'view_projects', 'simulate', 'View Projects', 'read_only'),
('42ecea5e-92b4-49a0-bea1-b289e1eb3db9', 'create_task', 'safe_internal_write', 'Create Task', 'demo_store_allowed'),
('f910bd0c-8bec-414a-b60a-fde77ac9c2f7', 'view_connections', 'simulate', 'View Connections', 'read_only'),
('f910bd0c-8bec-414a-b60a-fde77ac9c2f7', 'connect_service', 'preview_only', 'Connect Service', 'simulated_actions'),
('0de3f2cd-6941-4b9b-bb3f-7886e04e5456', 'list_files', 'simulate', 'List Files', 'read_only'),
('0de3f2cd-6941-4b9b-bb3f-7886e04e5456', 'upload_file', 'preview_only', 'Upload File', 'simulated_actions'),
('bd56248d-e21e-48c5-a8c0-dd7d5ee2c83e', 'view_queue', 'simulate', 'View Queue', 'read_only'),
('bd56248d-e21e-48c5-a8c0-dd7d5ee2c83e', 'approve_action', 'preview_only', 'Approve', 'simulated_actions'),
('0d76d15e-32f5-4e56-9413-3742b6388988', 'view_pulse', 'simulate', 'View Pulse', 'read_only');
