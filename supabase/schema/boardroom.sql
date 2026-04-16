-- ═══════════════════════════════════════════════════════════════
-- SITA OS — Synthesized schema for: boardroom
-- AUTO-GENERATED from supabase/migrations/. DO NOT EDIT.
-- Regenerate via: npx tsx scripts/db/generate/synthesize-domain-schemas.ts
-- Source migrations: 2
-- Last generated: 2026-04-16T21:25:36.057Z
-- ═══════════════════════════════════════════════════════════════

-- ── 20260406235959_d308ca79-88e8-437b-ac96-d42a37a381cc.sql ──
CREATE TABLE public.boardroom_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_type text DEFAULT 'weekly',
  title text,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  slides_data jsonb DEFAULT '[]',
  summary_text text,
  confidence_score integer,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.boardroom_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.boardroom_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  decision_text text NOT NULL,
  status text DEFAULT 'pending',
  advisor text,
  domain text,
  decided_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.boardroom_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boardroom_decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own sessions" ON public.boardroom_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own decisions" ON public.boardroom_decisions FOR ALL USING (auth.uid() = user_id);

CREATE TRIGGER set_boardroom_sessions_updated_at BEFORE UPDATE ON public.boardroom_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── 20260413223638_aec5dac2-a5ce-49e4-81a2-4067608dd2ec.sql ──
-- ═══════════════════════════════════════════════════════
-- Boardroom Decision Chamber — Phase 1 Tables
-- ═══════════════════════════════════════════════════════

-- 1. boardroom_sessions
CREATE TABLE public.boardroom_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_type TEXT NOT NULL DEFAULT 'executive',
  scope TEXT NOT NULL DEFAULT 'global',
  status TEXT NOT NULL DEFAULT 'assembling',
  opened_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  closed_at TIMESTAMP WITH TIME ZONE,
  current_issue_id UUID,
  participating_advisors JSONB NOT NULL DEFAULT '[]'::jsonb,
  session_mode TEXT NOT NULL DEFAULT 'review',
  decision_receipt_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.boardroom_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own boardroom_sessions" ON public.boardroom_sessions
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_boardroom_sessions_updated_at
  BEFORE UPDATE ON public.boardroom_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. boardroom_items
CREATE TABLE public.boardroom_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id UUID REFERENCES public.boardroom_sessions(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  domain TEXT NOT NULL DEFAULT 'general',
  severity TEXT NOT NULL DEFAULT 'medium',
  source_signals JSONB NOT NULL DEFAULT '[]'::jsonb,
  escalation_reason TEXT,
  advisor_summaries JSONB NOT NULL DEFAULT '{}'::jsonb,
  recommendation_state TEXT NOT NULL DEFAULT 'pending',
  simulation_state TEXT NOT NULL DEFAULT 'none',
  confidence_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  evidence_refs JSONB NOT NULL DEFAULT '[]'::jsonb,
  freshness_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  blocking_conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.boardroom_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own boardroom_items" ON public.boardroom_items
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_boardroom_items_updated_at
  BEFORE UPDATE ON public.boardroom_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. boardroom_evidence
CREATE TABLE public.boardroom_evidence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_id UUID REFERENCES public.boardroom_items(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL DEFAULT 'inferred',
  source_name TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  confidence NUMERIC NOT NULL DEFAULT 0.5,
  freshness TEXT NOT NULL DEFAULT 'fresh',
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  lineage_chain JSONB NOT NULL DEFAULT '[]'::jsonb,
  proof_receipt_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.boardroom_evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own boardroom_evidence" ON public.boardroom_evidence
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_boardroom_evidence_updated_at
  BEFORE UPDATE ON public.boardroom_evidence
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. boardroom_recommendations
CREATE TABLE public.boardroom_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_id UUID REFERENCES public.boardroom_items(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.boardroom_sessions(id) ON DELETE SET NULL,
  summary TEXT NOT NULL DEFAULT '',
  rationale TEXT NOT NULL DEFAULT '',
  evidence_basis JSONB NOT NULL DEFAULT '[]'::jsonb,
  confidence_score NUMERIC NOT NULL DEFAULT 0.5,
  scenario_basis TEXT,
  domain_impacts JSONB NOT NULL DEFAULT '[]'::jsonb,
  urgency TEXT NOT NULL DEFAULT 'medium',
  reversibility TEXT NOT NULL DEFAULT 'reversible',
  conditions_for_approval JSONB NOT NULL DEFAULT '[]'::jsonb,
  next_best_alternative TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.boardroom_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own boardroom_recommendations" ON public.boardroom_recommendations
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_boardroom_recommendations_updated_at
  BEFORE UPDATE ON public.boardroom_recommendations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. boardroom_decision_receipts
CREATE TABLE public.boardroom_decision_receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id UUID REFERENCES public.boardroom_sessions(id) ON DELETE SET NULL,
  item_id UUID REFERENCES public.boardroom_items(id) ON DELETE SET NULL,
  recommendation_id UUID REFERENCES public.boardroom_recommendations(id) ON DELETE SET NULL,
  approved_motion TEXT NOT NULL DEFAULT '',
  rationale_summary TEXT NOT NULL DEFAULT '',
  evidence_snapshot JSONB NOT NULL DEFAULT '[]'::jsonb,
  simulation_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  approval_conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'sealed',
  expected_outcome TEXT,
  follow_up_review_date TIMESTAMP WITH TIME ZONE,
  linked_execution_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  proof_trail JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.boardroom_decision_receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own boardroom_decision_receipts" ON public.boardroom_decision_receipts
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_boardroom_decision_receipts_updated_at
  BEFORE UPDATE ON public.boardroom_decision_receipts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
