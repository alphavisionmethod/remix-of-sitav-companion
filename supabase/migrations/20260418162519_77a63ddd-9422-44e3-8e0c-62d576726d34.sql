
-- ═══════════════════════════════════════════════════════════════
-- Boardroom Layer 7 Follow-Through — Phase 1 Schema Foundation
-- Additive only. Extends canonical tables. No parallel systems.
-- ═══════════════════════════════════════════════════════════════

-- 1. Extend boardroom_items with follow-through state pointers
ALTER TABLE public.boardroom_items
  ADD COLUMN IF NOT EXISTS followthrough_state text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS dispatch_id uuid,
  ADD COLUMN IF NOT EXISTS execution_command_step_id uuid,
  ADD COLUMN IF NOT EXISTS outcome_status text,
  ADD COLUMN IF NOT EXISTS outcome_recorded_at timestamptz,
  ADD COLUMN IF NOT EXISTS reflection_id uuid,
  ADD COLUMN IF NOT EXISTS last_followthrough_event_at timestamptz,
  ADD COLUMN IF NOT EXISTS followthrough_failure_reason text;

-- Constrain followthrough_state to canonical values
ALTER TABLE public.boardroom_items
  DROP CONSTRAINT IF EXISTS boardroom_items_followthrough_state_chk;
ALTER TABLE public.boardroom_items
  ADD CONSTRAINT boardroom_items_followthrough_state_chk
  CHECK (followthrough_state IN (
    'none',
    'approved',
    'dispatch_pending',
    'dispatched',
    'executing',
    'executed',
    'receipt_recorded',
    'outcome_pending',
    'outcome_tracked',
    'reflected',
    'closed',
    'failed'
  ));

CREATE INDEX IF NOT EXISTS idx_boardroom_items_followthrough_state
  ON public.boardroom_items (followthrough_state)
  WHERE followthrough_state <> 'none';

CREATE INDEX IF NOT EXISTS idx_boardroom_items_dispatch_id
  ON public.boardroom_items (dispatch_id)
  WHERE dispatch_id IS NOT NULL;

-- 2. Canonical follow-through dispatch table
CREATE TABLE IF NOT EXISTS public.boardroom_followthrough_dispatches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  boardroom_item_id uuid NOT NULL REFERENCES public.boardroom_items(id) ON DELETE CASCADE,
  recommendation_id uuid,
  approval_queue_id uuid,
  approved_at timestamptz NOT NULL DEFAULT now(),
  approved_by uuid,
  correlation_id text NOT NULL,
  state text NOT NULL DEFAULT 'dispatch_pending',
  risk_tier text NOT NULL DEFAULT 'standard',
  action_type text NOT NULL,
  action_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  command_id uuid,
  command_step_id uuid,
  execution_started_at timestamptz,
  execution_completed_at timestamptz,
  execution_result jsonb,
  receipt_id uuid,
  outcome_record_id uuid,
  retry_count int NOT NULL DEFAULT 0,
  failure_reason text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT boardroom_dispatches_state_chk CHECK (state IN (
    'dispatch_pending','dispatched','executing','executed',
    'receipt_recorded','outcome_pending','outcome_tracked',
    'reflected','closed','failed'
  ))
);

CREATE INDEX IF NOT EXISTS idx_brd_dispatch_item ON public.boardroom_followthrough_dispatches (boardroom_item_id);
CREATE INDEX IF NOT EXISTS idx_brd_dispatch_user_state ON public.boardroom_followthrough_dispatches (user_id, state);
CREATE INDEX IF NOT EXISTS idx_brd_dispatch_correlation ON public.boardroom_followthrough_dispatches (correlation_id);
CREATE INDEX IF NOT EXISTS idx_brd_dispatch_recommendation ON public.boardroom_followthrough_dispatches (recommendation_id) WHERE recommendation_id IS NOT NULL;

ALTER TABLE public.boardroom_followthrough_dispatches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "brd_dispatch_owner_all" ON public.boardroom_followthrough_dispatches;
CREATE POLICY "brd_dispatch_owner_all" ON public.boardroom_followthrough_dispatches
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "brd_dispatch_admin_all" ON public.boardroom_followthrough_dispatches;
CREATE POLICY "brd_dispatch_admin_all" ON public.boardroom_followthrough_dispatches
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER trg_brd_dispatch_updated_at
  BEFORE UPDATE ON public.boardroom_followthrough_dispatches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Canonical outcome record table
CREATE TABLE IF NOT EXISTS public.boardroom_outcome_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  boardroom_item_id uuid NOT NULL REFERENCES public.boardroom_items(id) ON DELETE CASCADE,
  dispatch_id uuid NOT NULL REFERENCES public.boardroom_followthrough_dispatches(id) ON DELETE CASCADE,
  expected_outcome text NOT NULL DEFAULT '',
  actual_outcome text NOT NULL DEFAULT '',
  outcome_status text NOT NULL DEFAULT 'pending',
  affected_entities jsonb NOT NULL DEFAULT '[]'::jsonb,
  confidence numeric(5,2) NOT NULL DEFAULT 0,
  verification_source text NOT NULL DEFAULT 'auto',
  verified_by uuid,
  retry_required boolean NOT NULL DEFAULT false,
  notes text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT brd_outcome_status_chk CHECK (outcome_status IN ('pending','success','partial','failed','rolled_back')),
  CONSTRAINT brd_outcome_source_chk CHECK (verification_source IN ('auto','operator','user','system'))
);

CREATE INDEX IF NOT EXISTS idx_brd_outcome_item ON public.boardroom_outcome_records (boardroom_item_id);
CREATE INDEX IF NOT EXISTS idx_brd_outcome_dispatch ON public.boardroom_outcome_records (dispatch_id);
CREATE INDEX IF NOT EXISTS idx_brd_outcome_user_status ON public.boardroom_outcome_records (user_id, outcome_status);

ALTER TABLE public.boardroom_outcome_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "brd_outcome_owner_all" ON public.boardroom_outcome_records;
CREATE POLICY "brd_outcome_owner_all" ON public.boardroom_outcome_records
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "brd_outcome_admin_all" ON public.boardroom_outcome_records;
CREATE POLICY "brd_outcome_admin_all" ON public.boardroom_outcome_records
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER trg_brd_outcome_updated_at
  BEFORE UPDATE ON public.boardroom_outcome_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Extend advisor_board_reflections with full linkage
ALTER TABLE public.advisor_board_reflections
  ADD COLUMN IF NOT EXISTS boardroom_item_id uuid,
  ADD COLUMN IF NOT EXISTS dispatch_id uuid,
  ADD COLUMN IF NOT EXISTS outcome_record_id uuid,
  ADD COLUMN IF NOT EXISTS usefulness_score numeric(5,2),
  ADD COLUMN IF NOT EXISTS recommendation_quality_score numeric(5,2),
  ADD COLUMN IF NOT EXISTS execution_fitness_score numeric(5,2);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'advisor_board_reflections_dispatch_fk'
  ) THEN
    ALTER TABLE public.advisor_board_reflections
      ADD CONSTRAINT advisor_board_reflections_dispatch_fk
      FOREIGN KEY (dispatch_id) REFERENCES public.boardroom_followthrough_dispatches(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'advisor_board_reflections_outcome_fk'
  ) THEN
    ALTER TABLE public.advisor_board_reflections
      ADD CONSTRAINT advisor_board_reflections_outcome_fk
      FOREIGN KEY (outcome_record_id) REFERENCES public.boardroom_outcome_records(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'advisor_board_reflections_brd_item_fk'
  ) THEN
    ALTER TABLE public.advisor_board_reflections
      ADD CONSTRAINT advisor_board_reflections_brd_item_fk
      FOREIGN KEY (boardroom_item_id) REFERENCES public.boardroom_items(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_abrefl_brd_item ON public.advisor_board_reflections (boardroom_item_id) WHERE boardroom_item_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_abrefl_dispatch ON public.advisor_board_reflections (dispatch_id) WHERE dispatch_id IS NOT NULL;

-- 5. Helper function: transition follow-through state with validation + timeline emission
CREATE OR REPLACE FUNCTION public.brd_followthrough_transition(
  _item_id uuid,
  _to_state text,
  _correlation_id text,
  _failure_reason text DEFAULT NULL,
  _metadata jsonb DEFAULT '{}'::jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item record;
  v_uid uuid;
BEGIN
  SELECT * INTO v_item FROM public.boardroom_items WHERE id = _item_id;
  IF v_item IS NULL THEN
    RAISE EXCEPTION 'boardroom_item % not found', _item_id;
  END IF;

  v_uid := v_item.user_id;

  UPDATE public.boardroom_items
    SET followthrough_state = _to_state,
        last_followthrough_event_at = now(),
        followthrough_failure_reason = COALESCE(_failure_reason, followthrough_failure_reason),
        updated_at = now()
    WHERE id = _item_id;

  INSERT INTO public.timeline_events (
    user_id, event_type, actor_type, actor_id,
    subject_type, subject_id, action, description, metadata, domain
  ) VALUES (
    v_uid,
    'boardroom.followthrough.transition',
    'system',
    'boardroom-followthrough-engine',
    'boardroom_item',
    _item_id::text,
    _to_state,
    'Boardroom follow-through transition',
    jsonb_build_object(
      'correlation_id', _correlation_id,
      'to_state', _to_state,
      'failure_reason', _failure_reason
    ) || COALESCE(_metadata, '{}'::jsonb),
    COALESCE(v_item.domain, 'general')
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.brd_followthrough_transition(uuid, text, text, text, jsonb) TO authenticated;
