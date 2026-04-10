
-- Seed AI Provider Registry
INSERT INTO public.ai_provider_registry (user_id, provider_key, display_name, api_style, secret_env_name, base_url, supports_tools, supports_structured_output, supports_streaming, supports_demo_mode, launch_stage, is_active, mode, metadata)
VALUES
  ('62ae1b1f-dfb8-4a9c-8a3d-40442e77bcc0', 'lovable', 'Lovable AI Gateway', 'chat_completions', 'LOVABLE_API_KEY', 'https://ai.gateway.lovable.dev/v1', true, true, true, true, 'active', true, 'real', '{"notes": "Sovereign gateway — routes to Google Gemini models"}'),
  ('62ae1b1f-dfb8-4a9c-8a3d-40442e77bcc0', 'openai', 'OpenAI', 'chat_completions', 'OPENAI_API_KEY', 'https://api.openai.com/v1', true, true, true, false, 'active', true, 'real', '{"notes": "Direct OpenAI — used for fallback or premium tasks"}'),
  ('62ae1b1f-dfb8-4a9c-8a3d-40442e77bcc0', 'anthropic', 'Anthropic', 'messages', 'ANTHROPIC_API_KEY', 'https://api.anthropic.com/v1', true, true, true, false, 'active', true, 'real', '{"notes": "Direct Anthropic — Claude family"}')
ON CONFLICT DO NOTHING;

-- Seed AI Model Registry (Lovable/Gemini models)
INSERT INTO public.ai_model_registry (user_id, model_id, provider, provider_model_name, model_class, display_name, reasoning_strength, structured_output_support, tool_calling_support, context_length, latency_tier, cost_tier, cost_per_1k_input, cost_per_1k_output, reliability_score, launch_stage, fallback_suitability, preferred_task_classes, quality_tier, supports_streaming, supports_json_mode, max_output_tokens_default, is_active, mode, provider_registry_id)
VALUES
  ('62ae1b1f-dfb8-4a9c-8a3d-40442e77bcc0', 'google/gemini-2.5-pro', 'lovable', 'gemini-2.5-pro', 'premium', 'Gemini 2.5 Pro', 'strong', true, true, 1048576, 'slow', 'premium', 0.0100, 0.0300, 0.94, 'active', 'poor', '{"premium_synthesis","internal_only"}', 'premium', true, true, 65536, true, 'real',
    (SELECT id FROM ai_provider_registry WHERE provider_key = 'lovable' LIMIT 1)),
  ('62ae1b1f-dfb8-4a9c-8a3d-40442e77bcc0', 'google/gemini-3-flash-preview', 'lovable', 'gemini-3-flash-preview', 'standard', 'Gemini 3 Flash', 'moderate', true, true, 1048576, 'fast', 'economy', 0.0020, 0.0060, 0.96, 'active', 'good', '{"balanced_assistant"}', 'balanced', true, true, 32768, true, 'real',
    (SELECT id FROM ai_provider_registry WHERE provider_key = 'lovable' LIMIT 1)),
  ('62ae1b1f-dfb8-4a9c-8a3d-40442e77bcc0', 'google/gemini-2.5-flash-lite', 'lovable', 'gemini-2.5-flash-lite', 'economy', 'Gemini 2.5 Flash Lite', 'basic', true, false, 131072, 'fast', 'economy', 0.0005, 0.0015, 0.97, 'active', 'excellent', '{"economy_utility","cheap_utility","fallback"}', 'economy', true, true, 8192, true, 'real',
    (SELECT id FROM ai_provider_registry WHERE provider_key = 'lovable' LIMIT 1))
ON CONFLICT DO NOTHING;

-- OpenAI models
INSERT INTO public.ai_model_registry (user_id, model_id, provider, provider_model_name, model_class, display_name, reasoning_strength, structured_output_support, tool_calling_support, context_length, latency_tier, cost_tier, cost_per_1k_input, cost_per_1k_output, reliability_score, launch_stage, fallback_suitability, preferred_task_classes, quality_tier, supports_streaming, supports_json_mode, max_output_tokens_default, is_active, mode, provider_registry_id)
VALUES
  ('62ae1b1f-dfb8-4a9c-8a3d-40442e77bcc0', 'openai/gpt-4o', 'openai', 'gpt-4o', 'premium', 'GPT-4o', 'strong', true, true, 128000, 'standard', 'premium', 0.0050, 0.0150, 0.95, 'active', 'moderate', '{"premium_synthesis","balanced_assistant"}', 'premium', true, true, 16384, true, 'real',
    (SELECT id FROM ai_provider_registry WHERE provider_key = 'openai' LIMIT 1)),
  ('62ae1b1f-dfb8-4a9c-8a3d-40442e77bcc0', 'openai/gpt-4o-mini', 'openai', 'gpt-4o-mini', 'standard', 'GPT-4o Mini', 'moderate', true, true, 128000, 'fast', 'economy', 0.0002, 0.0006, 0.97, 'active', 'good', '{"economy_utility","balanced_assistant"}', 'balanced', true, true, 16384, true, 'real',
    (SELECT id FROM ai_provider_registry WHERE provider_key = 'openai' LIMIT 1)),
  ('62ae1b1f-dfb8-4a9c-8a3d-40442e77bcc0', 'openai/o1', 'openai', 'o1', 'premium', 'o1 Reasoning', 'exceptional', true, false, 200000, 'slow', 'premium', 0.0150, 0.0600, 0.90, 'active', 'poor', '{"premium_synthesis","internal_only"}', 'premium', false, true, 100000, true, 'real',
    (SELECT id FROM ai_provider_registry WHERE provider_key = 'openai' LIMIT 1))
ON CONFLICT DO NOTHING;

-- Anthropic models
INSERT INTO public.ai_model_registry (user_id, model_id, provider, provider_model_name, model_class, display_name, reasoning_strength, structured_output_support, tool_calling_support, context_length, latency_tier, cost_tier, cost_per_1k_input, cost_per_1k_output, reliability_score, launch_stage, fallback_suitability, preferred_task_classes, quality_tier, supports_streaming, supports_json_mode, max_output_tokens_default, is_active, mode, provider_registry_id)
VALUES
  ('62ae1b1f-dfb8-4a9c-8a3d-40442e77bcc0', 'anthropic/claude-4-sonnet', 'anthropic', 'claude-sonnet-4-20250514', 'premium', 'Claude 4 Sonnet', 'strong', true, true, 200000, 'standard', 'premium', 0.0030, 0.0150, 0.95, 'active', 'moderate', '{"premium_synthesis","balanced_assistant"}', 'premium', true, true, 64000, true, 'real',
    (SELECT id FROM ai_provider_registry WHERE provider_key = 'anthropic' LIMIT 1)),
  ('62ae1b1f-dfb8-4a9c-8a3d-40442e77bcc0', 'anthropic/claude-3.5-haiku', 'anthropic', 'claude-3-5-haiku-20241022', 'economy', 'Claude 3.5 Haiku', 'moderate', true, true, 200000, 'fast', 'economy', 0.0008, 0.0040, 0.97, 'active', 'good', '{"economy_utility","balanced_assistant","fallback"}', 'balanced', true, true, 8192, true, 'real',
    (SELECT id FROM ai_provider_registry WHERE provider_key = 'anthropic' LIMIT 1))
ON CONFLICT DO NOTHING;

-- Demo/fallback models
INSERT INTO public.ai_model_registry (user_id, model_id, provider, provider_model_name, model_class, display_name, reasoning_strength, structured_output_support, tool_calling_support, context_length, latency_tier, cost_tier, cost_per_1k_input, cost_per_1k_output, reliability_score, launch_stage, fallback_suitability, preferred_task_classes, quality_tier, supports_streaming, supports_json_mode, max_output_tokens_default, is_active, mode)
VALUES
  ('62ae1b1f-dfb8-4a9c-8a3d-40442e77bcc0', 'demo/static-response', 'lovable', 'demo-static', 'fallback', 'Demo Static Response', 'none', false, false, 0, 'instant', 'free', 0, 0, 1.0, 'active', 'excellent', '{"fallback","fallback_degraded"}', 'demo', false, false, 0, true, 'demo'),
  ('62ae1b1f-dfb8-4a9c-8a3d-40442e77bcc0', 'fallback/unavailable', 'lovable', 'unavailable-stub', 'fallback', 'Unavailable Stub', 'none', false, false, 0, 'instant', 'free', 0, 0, 1.0, 'active', 'excellent', '{"fallback_degraded"}', 'demo', false, false, 0, false, 'unavailable')
ON CONFLICT DO NOTHING;
