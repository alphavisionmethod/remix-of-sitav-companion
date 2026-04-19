-- Phase 15 final closure pack tables

-- 1. Owner Copilot sessions
CREATE TABLE public.owner_copilot_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tenant_id UUID,
  copilot_kind TEXT NOT NULL DEFAULT 'owner',
  session_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_ended_at TIMESTAMPTZ,
  read_only_verified BOOLEAN NOT NULL DEFAULT true,
  prompt_count INTEGER NOT NULL DEFAULT 0,
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_owner_copilot_sessions_user ON public.owner_copilot_sessions(user_id, session_started_at DESC);
ALTER TABLE public.owner_copilot_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_view_own_copilot_sessions" ON public.owner_copilot_sessions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users_insert_own_copilot_sessions" ON public.owner_copilot_sessions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admins_read_all_copilot_sessions" ON public.owner_copilot_sessions
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 2. Federation opt-in events (append-only)
CREATE TABLE public.federation_optin_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  consented_by UUID NOT NULL,
  consent_kind TEXT NOT NULL,
  consent_scope JSONB NOT NULL DEFAULT '{}'::jsonb,
  signature TEXT NOT NULL,
  consented_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_federation_optin_events_at ON public.federation_optin_events(consented_at DESC);
ALTER TABLE public.federation_optin_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins_read_federation_optin" ON public.federation_optin_events
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins_insert_federation_optin" ON public.federation_optin_events
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.block_federation_optin_mutation()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN RAISE EXCEPTION 'federation_optin_events is append-only'; END; $$;
CREATE TRIGGER federation_optin_no_update BEFORE UPDATE ON public.federation_optin_events
  FOR EACH ROW EXECUTE FUNCTION public.block_federation_optin_mutation();
CREATE TRIGGER federation_optin_no_delete BEFORE DELETE ON public.federation_optin_events
  FOR EACH ROW EXECUTE FUNCTION public.block_federation_optin_mutation();

-- 3. DR drill executions (append-only)
CREATE TABLE public.dr_drill_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  drill_kind TEXT NOT NULL,
  triggered_by UUID NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  rto_seconds INTEGER,
  rpo_seconds INTEGER,
  outcome TEXT NOT NULL DEFAULT 'pending',
  failover_target TEXT,
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_dr_drill_executions_at ON public.dr_drill_executions(started_at DESC);
ALTER TABLE public.dr_drill_executions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins_read_dr_drills" ON public.dr_drill_executions
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins_insert_dr_drills" ON public.dr_drill_executions
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.block_dr_drill_mutation()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN RAISE EXCEPTION 'dr_drill_executions is append-only'; END; $$;
CREATE TRIGGER dr_drill_no_update BEFORE UPDATE ON public.dr_drill_executions
  FOR EACH ROW EXECUTE FUNCTION public.block_dr_drill_mutation();
CREATE TRIGGER dr_drill_no_delete BEFORE DELETE ON public.dr_drill_executions
  FOR EACH ROW EXECUTE FUNCTION public.block_dr_drill_mutation();

-- 4. Chaos drill results (append-only)
CREATE TABLE public.chaos_drill_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  drill_name TEXT NOT NULL,
  blast_radius TEXT NOT NULL DEFAULT 'isolated',
  triggered_by UUID NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  outcome TEXT NOT NULL DEFAULT 'pending',
  detection_seconds INTEGER,
  recovery_seconds INTEGER,
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_chaos_drill_results_at ON public.chaos_drill_results(started_at DESC);
ALTER TABLE public.chaos_drill_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins_read_chaos_drills" ON public.chaos_drill_results
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins_insert_chaos_drills" ON public.chaos_drill_results
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.block_chaos_drill_mutation()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN RAISE EXCEPTION 'chaos_drill_results is append-only'; END; $$;
CREATE TRIGGER chaos_drill_no_update BEFORE UPDATE ON public.chaos_drill_results
  FOR EACH ROW EXECUTE FUNCTION public.block_chaos_drill_mutation();
CREATE TRIGGER chaos_drill_no_delete BEFORE DELETE ON public.chaos_drill_results
  FOR EACH ROW EXECUTE FUNCTION public.block_chaos_drill_mutation();

-- 5. Production launch attestations (append-only)
CREATE TABLE public.production_launch_attestations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  surface_key TEXT NOT NULL,
  launch_posture TEXT NOT NULL,
  attested_by UUID NOT NULL,
  attested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  evidence_hash TEXT NOT NULL,
  signature TEXT NOT NULL,
  release_tag TEXT,
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_prod_launch_attestations_at ON public.production_launch_attestations(attested_at DESC);
CREATE INDEX idx_prod_launch_attestations_surface ON public.production_launch_attestations(surface_key, attested_at DESC);
ALTER TABLE public.production_launch_attestations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins_read_prod_launch_attestations" ON public.production_launch_attestations
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins_insert_prod_launch_attestations" ON public.production_launch_attestations
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') AND auth.uid() = attested_by);

CREATE OR REPLACE FUNCTION public.block_prod_launch_attestation_mutation()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN RAISE EXCEPTION 'production_launch_attestations is append-only'; END; $$;
CREATE TRIGGER prod_launch_att_no_update BEFORE UPDATE ON public.production_launch_attestations
  FOR EACH ROW EXECUTE FUNCTION public.block_prod_launch_attestation_mutation();
CREATE TRIGGER prod_launch_att_no_delete BEFORE DELETE ON public.production_launch_attestations
  FOR EACH ROW EXECUTE FUNCTION public.block_prod_launch_attestation_mutation();