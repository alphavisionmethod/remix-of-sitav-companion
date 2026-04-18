// ═══════════════════════════════════════════════════════════════
// SITA OS — Sovereign AI Gateway Types
// ═══════════════════════════════════════════════════════════════

export type AIProvider = 'anthropic' | 'openai' | 'google' | 'lovable' | 'local' | 'specialist';
export type ModelClass = 'utility' | 'standard' | 'deep' | 'premium' | 'embedding' | 'reranker' | 'moderation' | 'local_specialist';
export type TaskClass = 'classification' | 'extraction' | 'summarization' | 'normalization' | 'recommendation' | 'drafting' | 'simulation' | 'strategic_synthesis' | 'diagnosis' | 'boardroom_composition' | 'verification' | 'structured_planning' | 'support_diagnostics' | 'general';
export type CostTier = 'free' | 'utility' | 'standard' | 'premium' | 'enterprise';
export type LatencyTier = 'realtime' | 'fast' | 'standard' | 'async' | 'batch';
export type VerificationPolicy = 'none' | 'schema_only' | 'deterministic_check' | 'cross_model' | 'human_review';
export type AllocationClass = 'utility' | 'standard_advisor' | 'premium_strategic' | 'experimentation' | 'safety_verification' | 'async_deep' | 'emergency_reserve';
export type ViolationType = 'direct_provider_call' | 'missing_capability_id' | 'missing_prompt_family' | 'missing_output_schema' | 'premium_misuse' | 'no_fallback_critical' | 'unverified_high_risk' | 'missing_receipt';
export type FallbackStrategy = 'same_provider_downgrade' | 'cross_provider' | 'degrade_summary' | 'async_defer' | 'structured_refusal';

export const PROVIDERS: { id: AIProvider; name: string; models: string[] }[] = [
  { id: 'lovable', name: 'Lovable AI', models: ['google/gemini-3-flash-preview', 'google/gemini-2.5-pro', 'google/gemini-2.5-flash', 'openai/gpt-5', 'openai/gpt-5-mini'] },
  { id: 'anthropic', name: 'Anthropic', models: ['claude-sonnet-4', 'claude-haiku'] },
  { id: 'openai', name: 'OpenAI', models: ['gpt-5', 'gpt-5-mini', 'gpt-5-nano'] },
  { id: 'google', name: 'Google', models: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-3-flash-preview'] },
  { id: 'local', name: 'Local/Self-hosted', models: [] },
  { id: 'specialist', name: 'Specialist', models: [] },
];

export const TASK_CLASSES: TaskClass[] = [
  'classification', 'extraction', 'summarization', 'normalization', 'recommendation',
  'drafting', 'simulation', 'strategic_synthesis', 'diagnosis', 'boardroom_composition',
  'verification', 'structured_planning', 'support_diagnostics', 'general',
];

export const MODEL_CLASSES: ModelClass[] = ['utility', 'standard', 'deep', 'premium', 'embedding', 'reranker', 'moderation', 'local_specialist'];

export const ALLOCATION_CLASSES: AllocationClass[] = [
  'utility', 'standard_advisor', 'premium_strategic', 'experimentation',
  'safety_verification', 'async_deep', 'emergency_reserve',
];

export const TASK_CLASS_TO_MODEL_CLASS: Record<TaskClass, ModelClass> = {
  classification: 'utility', extraction: 'utility', summarization: 'utility',
  normalization: 'utility', recommendation: 'standard', drafting: 'standard',
  simulation: 'deep', strategic_synthesis: 'premium', diagnosis: 'deep',
  boardroom_composition: 'deep', verification: 'standard',
  structured_planning: 'deep', support_diagnostics: 'standard', general: 'standard',
};

export const COST_PER_MODEL_CLASS: Record<ModelClass, number> = {
  utility: 1, standard: 5, deep: 25, premium: 100,
  embedding: 1, reranker: 2, moderation: 1, local_specialist: 0,
};
