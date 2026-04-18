
-- ═══════════════════════════════════════════════════════════════
-- PHASE 5 — Trust Ladder & Cross-Agent Knowledge Bus
-- ═══════════════════════════════════════════════════════════════

-- Trust ladder: autonomy rung per internal agent
CREATE TABLE IF NOT EXISTS public.internal_agent_trust_ladder (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id text NOT NULL,
  current_rung int NOT NULL DEFAULT 0 CHECK (current_rung BETWEEN 0 AND 6),
  previous_rung int NOT NULL DEFAULT 0 CHECK (previous_rung BETWEEN 0 AND 6),
  rung_reason text NOT NULL DEFAULT 'baseline',
  trust_score numeric NOT NULL DEFAULT 0.5 CHECK (trust_score BETWEEN 0 AND 1),
  reflection_count int NOT NULL DEFAULT 0,
  last_evaluated_at timestamptz NOT NULL DEFAULT now(),
  promotion_locked boolean NOT NULL DEFAULT false,
  promotion_lock_reason text,
  human_approval_required_above_rung int NOT NULL DEFAULT 4,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT internal_agent_trust_ladder_agent_unique UNIQUE (agent_id)
);

-- Promotion / demotion history (append-only audit)
CREATE TABLE IF NOT EXISTS public.internal_agent_ladder_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id text NOT NULL,
  from_rung int NOT NULL,
  to_rung int NOT NULL,
  direction text NOT NULL CHECK (direction IN ('promotion','demotion','hold')),
  reason text NOT NULL,
  trust_score_at_change numeric NOT NULL,
  evaluator text NOT NULL DEFAULT 'internal-agent-trust-evaluator',
  human_approved boolean NOT NULL DEFAULT false,
  human_approver_user_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Cross-agent knowledge bus: learnings shared between agents
CREATE TABLE IF NOT EXISTS public.internal_agent_knowledge_bus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_agent_id text NOT NULL,
  pattern_tag text NOT NULL,
  learning_summary text NOT NULL,
  recommended_guard text,
  confidence numeric NOT NULL DEFAULT 0.5 CHECK (confidence BETWEEN 0 AND 1),
  applies_to_councils text[] NOT NULL DEFAULT '{}',
  applies_to_agents text[] NOT NULL DEFAULT '{}',
  consumed_by jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','expired','superseded')),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_iatl_agent ON public.internal_agent_trust_ladder(agent_id);
CREATE INDEX IF NOT EXISTS idx_ialh_agent_created ON public.internal_agent_ladder_history(agent_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_iakb_pattern ON public.internal_agent_knowledge_bus(pattern_tag) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_iakb_source ON public.internal_agent_knowledge_bus(source_agent_id, created_at DESC);

ALTER TABLE public.internal_agent_trust_ladder ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_agent_ladder_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_agent_knowledge_bus ENABLE ROW LEVEL SECURITY;

-- RLS — admins read; service role writes (no user_id; this is platform-internal)
CREATE POLICY "Admins read trust ladder"
  ON public.internal_agent_trust_ladder FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins read ladder history"
  ON public.internal_agent_ladder_history FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins read knowledge bus"
  ON public.internal_agent_knowledge_bus FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- updated_at triggers
CREATE TRIGGER trg_iatl_updated
  BEFORE UPDATE ON public.internal_agent_trust_ladder
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_iakb_updated
  BEFORE UPDATE ON public.internal_agent_knowledge_bus
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════
-- RPC: evaluate trust ladder (recompute rung from reflection trends)
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.evaluate_internal_agent_ladder(
  _agent_id text,
  _trust_score numeric,
  _reflection_count int,
  _hint_reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_rung int;
  v_previous_rung int;
  v_target_rung int;
  v_locked boolean;
  v_human_threshold int;
  v_direction text;
  v_reason text;
BEGIN
  -- Upsert baseline row
  INSERT INTO public.internal_agent_trust_ladder (agent_id, trust_score, reflection_count)
  VALUES (_agent_id, _trust_score, _reflection_count)
  ON CONFLICT (agent_id) DO UPDATE
    SET trust_score = EXCLUDED.trust_score,
        reflection_count = EXCLUDED.reflection_count,
        last_evaluated_at = now();

  SELECT current_rung, promotion_locked, human_approval_required_above_rung
    INTO v_current_rung, v_locked, v_human_threshold
  FROM public.internal_agent_trust_ladder
  WHERE agent_id = _agent_id;

  v_previous_rung := v_current_rung;

  -- Map trust_score → target rung (conservative)
  v_target_rung := CASE
    WHEN _trust_score >= 0.95 AND _reflection_count >= 50 THEN 5
    WHEN _trust_score >= 0.85 AND _reflection_count >= 25 THEN 4
    WHEN _trust_score >= 0.75 AND _reflection_count >= 10 THEN 3
    WHEN _trust_score >= 0.6  AND _reflection_count >= 5  THEN 2
    WHEN _trust_score >= 0.4  THEN 1
    ELSE 0
  END;

  -- Never auto-promote above human-approval threshold (default L4)
  IF v_target_rung > v_human_threshold THEN
    v_target_rung := v_human_threshold;
  END IF;

  -- Promotion lock honored
  IF v_locked AND v_target_rung > v_current_rung THEN
    v_target_rung := v_current_rung;
  END IF;

  v_direction := CASE
    WHEN v_target_rung > v_current_rung THEN 'promotion'
    WHEN v_target_rung < v_current_rung THEN 'demotion'
    ELSE 'hold'
  END;

  v_reason := COALESCE(_hint_reason, format('trust=%s reflections=%s', _trust_score, _reflection_count));

  IF v_direction <> 'hold' THEN
    UPDATE public.internal_agent_trust_ladder
       SET current_rung = v_target_rung,
           previous_rung = v_previous_rung,
           rung_reason = v_reason,
           updated_at = now()
     WHERE agent_id = _agent_id;
  END IF;

  INSERT INTO public.internal_agent_ladder_history
    (agent_id, from_rung, to_rung, direction, reason, trust_score_at_change)
  VALUES
    (_agent_id, v_previous_rung, v_target_rung, v_direction, v_reason, _trust_score);

  RETURN jsonb_build_object(
    'agent_id', _agent_id,
    'from_rung', v_previous_rung,
    'to_rung', v_target_rung,
    'direction', v_direction,
    'reason', v_reason,
    'human_approval_required_above_rung', v_human_threshold,
    'promotion_locked', v_locked
  );
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- RPC: publish cross-agent learning to knowledge bus
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.publish_agent_learning(
  _source_agent_id text,
  _pattern_tag text,
  _learning_summary text,
  _recommended_guard text DEFAULT NULL,
  _confidence numeric DEFAULT 0.6,
  _applies_to_councils text[] DEFAULT '{}',
  _applies_to_agents text[] DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  -- Supersede prior active learning with same source+pattern
  UPDATE public.internal_agent_knowledge_bus
     SET status = 'superseded', updated_at = now()
   WHERE source_agent_id = _source_agent_id
     AND pattern_tag = _pattern_tag
     AND status = 'active';

  INSERT INTO public.internal_agent_knowledge_bus
    (source_agent_id, pattern_tag, learning_summary, recommended_guard,
     confidence, applies_to_councils, applies_to_agents)
  VALUES
    (_source_agent_id, _pattern_tag, _learning_summary, _recommended_guard,
     LEAST(GREATEST(_confidence, 0), 1), _applies_to_councils, _applies_to_agents)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- RPC: summarize ladder for admin dashboard
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.summarize_trust_ladder()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_agents jsonb;
  v_recent_changes jsonb;
  v_active_learnings jsonb;
BEGIN
  SELECT COALESCE(jsonb_agg(to_jsonb(t.*) ORDER BY t.current_rung DESC, t.trust_score DESC), '[]'::jsonb)
    INTO v_agents
  FROM public.internal_agent_trust_ladder t;

  SELECT COALESCE(jsonb_agg(to_jsonb(h.*) ORDER BY h.created_at DESC), '[]'::jsonb)
    INTO v_recent_changes
  FROM (
    SELECT * FROM public.internal_agent_ladder_history
    WHERE direction <> 'hold'
    ORDER BY created_at DESC
    LIMIT 20
  ) h;

  SELECT COALESCE(jsonb_agg(to_jsonb(k.*) ORDER BY k.confidence DESC, k.created_at DESC), '[]'::jsonb)
    INTO v_active_learnings
  FROM public.internal_agent_knowledge_bus k
  WHERE status = 'active' AND expires_at > now();

  RETURN jsonb_build_object(
    'agents', v_agents,
    'recent_changes', v_recent_changes,
    'active_learnings', v_active_learnings,
    'generated_at', now()
  );
END;
$$;
