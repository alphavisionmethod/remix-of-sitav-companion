ALTER TABLE public.ai_explainability_traces
  DROP CONSTRAINT IF EXISTS ai_explainability_traces_source_type_check;

ALTER TABLE public.ai_explainability_traces
  ADD CONSTRAINT ai_explainability_traces_source_type_check
  CHECK (source_type = ANY (ARRAY[
    'memory','file','advisor','policy','workspace','module',
    'tool','prompt','prior_receipt','live_data','user_input','system',
    'knowledge_chunk'
  ]));