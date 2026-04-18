-- ═══════════════════════════════════════════════════════════════
-- Phase 3 — Reflection & Learning Boards
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.internal_agent_reflections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id text NOT NULL REFERENCES public.internal_agent_definitions(agent_id) ON DELETE CASCADE,
  intent_id uuid NOT NULL REFERENCES public.internal_agent_action_intents(id) ON DELETE CASCADE,
  action_class text NOT NULL,
  intent_status text NOT NULL,
  outcome_quality numeric NOT NULL DEFAULT 0,         -- 0.0 (bad) → 1.0 (good)
  gate_fitness_score numeric NOT NULL DEFAULT 0,      -- gates passed / total
  confidence_calibration numeric,                     -- abs(predicted - observed)
  lesson_learned text NOT NULL DEFAULT '',
  pattern_tags jsonb NOT NULL DEFAULT '[]'::jsonb,    -- ["rate_limit_pressure","stale_lock"]
  should_repeat boolean,                              -- TRUE = good, FALSE = avoid, NULL = neutral
  recommendation text,                                -- forward guidance for the agent
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,        -- snapshot used for reflection
  reflected_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_iar_agent ON public.internal_agent_reflections (agent_id, reflected_at DESC);
CREATE INDEX IF NOT EXISTS idx_iar_intent ON public.internal_agent_reflections (intent_id);
CREATE INDEX IF NOT EXISTS idx_iar_class ON public.internal_agent_reflections (action_class, reflected_at DESC);
CREATE INDEX IF NOT EXISTS idx_iar_repeat ON public.internal_agent_reflections (should_repeat) WHERE should_repeat IS NOT NULL;

ALTER TABLE public.internal_agent_reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read reflections"
  ON public.internal_agent_reflections FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Writes only via SECURITY DEFINER RPC (service role bypasses RLS).
-- Block direct INSERT/UPDATE/DELETE from any non-service caller.
CREATE POLICY "Block direct writes to reflections"
  ON public.internal_agent_reflections FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

CREATE TRIGGER trg_iar_updated_at
BEFORE UPDATE ON public.internal_agent_reflections
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── RPC 1: record reflection ──────────────────────────────────
CREATE OR REPLACE FUNCTION public.record_internal_agent_reflection(
  _intent_id uuid,
  _outcome_quality numeric,
  _gate_fitness_score numeric,
  _confidence_calibration numeric DEFAULT NULL,
  _lesson_learned text DEFAULT '',
  _pattern_tags jsonb DEFAULT '[]'::jsonb,
  _should_repeat boolean DEFAULT NULL,
  _recommendation text DEFAULT NULL,
  _evidence jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_intent record;
  v_id uuid;
BEGIN
  -- caller gate: admin or service role
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'admin role required to record reflections' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_intent FROM public.internal_agent_action_intents WHERE id = _intent_id;
  IF v_intent IS NULL THEN
    RAISE EXCEPTION 'intent % not found', _intent_id;
  END IF;

  -- One reflection per intent: upsert by intent_id
  INSERT INTO public.internal_agent_reflections (
    agent_id, intent_id, action_class, intent_status,
    outcome_quality, gate_fitness_score, confidence_calibration,
    lesson_learned, pattern_tags, should_repeat, recommendation, evidence
  ) VALUES (
    v_intent.agent_id, _intent_id, v_intent.action_class, v_intent.status,
    GREATEST(0, LEAST(1, COALESCE(_outcome_quality, 0))),
    GREATEST(0, LEAST(1, COALESCE(_gate_fitness_score, 0))),
    _confidence_calibration,
    COALESCE(_lesson_learned, ''),
    COALESCE(_pattern_tags, '[]'::jsonb),
    _should_repeat,
    _recommendation,
    COALESCE(_evidence, '{}'::jsonb)
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_id;

  IF v_id IS NULL THEN
    UPDATE public.internal_agent_reflections
    SET outcome_quality = GREATEST(0, LEAST(1, COALESCE(_outcome_quality, outcome_quality))),
        gate_fitness_score = GREATEST(0, LEAST(1, COALESCE(_gate_fitness_score, gate_fitness_score))),
        confidence_calibration = COALESCE(_confidence_calibration, confidence_calibration),
        lesson_learned = COALESCE(_lesson_learned, lesson_learned),
        pattern_tags = COALESCE(_pattern_tags, pattern_tags),
        should_repeat = COALESCE(_should_repeat, should_repeat),
        recommendation = COALESCE(_recommendation, recommendation),
        evidence = COALESCE(_evidence, evidence),
        reflected_at = now(),
        updated_at = now()
    WHERE intent_id = _intent_id
    RETURNING id INTO v_id;
  END IF;

  -- Roll trust_score on runtime_state using EWMA(0.2)
  UPDATE public.internal_agent_runtime_state s
  SET trust_score = ROUND(LEAST(1, GREATEST(0,
        COALESCE(s.trust_score, 0.5) * 0.8
        + GREATEST(0, LEAST(1, COALESCE(_outcome_quality, 0))) * 0.2
      ))::numeric, 4),
      last_observation_at = now(),
      updated_at = now()
  WHERE s.agent_id = v_intent.agent_id;

  RETURN v_id;
END;
$$;

-- ── RPC 2: summarise learning per agent ───────────────────────
CREATE OR REPLACE FUNCTION public.summarize_internal_agent_learning(_lookback_hours integer DEFAULT 168)
RETURNS TABLE(
  agent_id text,
  reflections_count bigint,
  avg_outcome_quality numeric,
  avg_gate_fitness numeric,
  repeat_count bigint,
  avoid_count bigint,
  trust_score numeric,
  last_reflected_at timestamptz,
  top_patterns jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH window_reflections AS (
    SELECT *
    FROM public.internal_agent_reflections
    WHERE reflected_at >= now() - (_lookback_hours || ' hours')::interval
  ),
  per_agent AS (
    SELECT
      r.agent_id,
      COUNT(*)::bigint AS reflections_count,
      ROUND(AVG(r.outcome_quality)::numeric, 4) AS avg_outcome_quality,
      ROUND(AVG(r.gate_fitness_score)::numeric, 4) AS avg_gate_fitness,
      COUNT(*) FILTER (WHERE r.should_repeat = true)::bigint AS repeat_count,
      COUNT(*) FILTER (WHERE r.should_repeat = false)::bigint AS avoid_count,
      MAX(r.reflected_at) AS last_reflected_at
    FROM window_reflections r
    GROUP BY r.agent_id
  ),
  patterns AS (
    SELECT
      r.agent_id,
      tag.value AS pattern,
      COUNT(*)::bigint AS occurrences
    FROM window_reflections r,
         jsonb_array_elements_text(r.pattern_tags) tag
    GROUP BY r.agent_id, tag.value
  ),
  ranked_patterns AS (
    SELECT
      agent_id,
      jsonb_agg(jsonb_build_object('tag', pattern, 'count', occurrences) ORDER BY occurrences DESC) AS top_patterns
    FROM (
      SELECT
        agent_id,
        pattern,
        occurrences,
        ROW_NUMBER() OVER (PARTITION BY agent_id ORDER BY occurrences DESC) AS rn
      FROM patterns
    ) t
    WHERE rn <= 5
    GROUP BY agent_id
  )
  SELECT
    p.agent_id,
    p.reflections_count,
    p.avg_outcome_quality,
    p.avg_gate_fitness,
    p.repeat_count,
    p.avoid_count,
    s.trust_score,
    p.last_reflected_at,
    COALESCE(rp.top_patterns, '[]'::jsonb) AS top_patterns
  FROM per_agent p
  LEFT JOIN public.internal_agent_runtime_state s ON s.agent_id = p.agent_id
  LEFT JOIN ranked_patterns rp ON rp.agent_id = p.agent_id
  ORDER BY p.reflections_count DESC, p.last_reflected_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.record_internal_agent_reflection(uuid, numeric, numeric, numeric, text, jsonb, boolean, text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.summarize_internal_agent_learning(integer) TO authenticated, service_role;

COMMENT ON TABLE public.internal_agent_reflections IS
'Phase 3 — every intent gets one reflection: outcome quality, gate fitness, lesson, repeat/avoid signal. Drives trust_score EWMA on runtime_state.';