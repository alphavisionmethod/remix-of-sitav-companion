
-- Seed AI Capability Routing
INSERT INTO public.ai_capability_routing (user_id, capability_key, routing_class, budget_class, quality_requirement, max_latency_class, launch_honesty_class, is_active, structured_output_required, tool_use_required, can_fallback_to_demo, can_fallback_to_unavailable, metadata)
VALUES
  ('62ae1b1f-dfb8-4a9c-8a3d-40442e77bcc0', 'advisor.chat.primary', 'balanced_assistant', 'standard', 'high', 'fast', 'partial', true, false, false, true, false, '{}'),
  ('62ae1b1f-dfb8-4a9c-8a3d-40442e77bcc0', 'classification.extract', 'economy_utility', 'utility', 'standard', 'realtime', 'partial', true, true, false, true, false, '{}'),
  ('62ae1b1f-dfb8-4a9c-8a3d-40442e77bcc0', 'boardroom.weekly.summary', 'premium_synthesis', 'premium', 'premium', 'standard', 'partial', true, false, false, true, false, '{}'),
  ('62ae1b1f-dfb8-4a9c-8a3d-40442e77bcc0', 'admin.synthesis', 'internal_only', 'premium', 'premium', 'standard', 'internal_only', true, false, false, true, false, '{}'),
  ('62ae1b1f-dfb8-4a9c-8a3d-40442e77bcc0', 'admin.ai_workforce.run', 'balanced_assistant', 'standard', 'standard', 'standard', 'internal_only', true, false, true, true, false, '{}'),
  ('62ae1b1f-dfb8-4a9c-8a3d-40442e77bcc0', 'utility.extract', 'economy_utility', 'utility', 'standard', 'realtime', 'partial', true, true, false, true, false, '{}'),
  ('62ae1b1f-dfb8-4a9c-8a3d-40442e77bcc0', 'daily_pulse.generate', 'balanced_assistant', 'standard', 'high', 'standard', 'partial', true, false, false, true, false, '{}'),
  ('62ae1b1f-dfb8-4a9c-8a3d-40442e77bcc0', 'memory.summarize', 'balanced_assistant', 'standard', 'standard', 'fast', 'partial', true, false, false, true, true, '{}')
ON CONFLICT DO NOTHING;
