-- Phase 10–14 closure pack tables

-- 1. Boardroom cockpit tab views (16-tab telemetry)
CREATE TABLE public.boardroom_cockpit_tab_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tab_key TEXT NOT NULL,
  session_id TEXT,
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration_ms INTEGER,
  engagement_score NUMERIC(5,2),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_boardroom_cockpit_tab_views_user ON public.boardroom_cockpit_tab_views(user_id, opened_at DESC);
CREATE INDEX idx_boardroom_cockpit_tab_views_tab ON public.boardroom_cockpit_tab_views(tab_key, opened_at DESC);
ALTER TABLE public.boardroom_cockpit_tab_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_view_own_cockpit_tab_views" ON public.boardroom_cockpit_tab_views
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users_insert_own_cockpit_tab_views" ON public.boardroom_cockpit_tab_views
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admins_read_all_cockpit_tab_views" ON public.boardroom_cockpit_tab_views
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 2. Onboarding branch events (29-screen telemetry)
CREATE TABLE public.onboarding_branch_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  screen_key TEXT NOT NULL,
  screen_index INTEGER NOT NULL,
  branch_path TEXT NOT NULL DEFAULT 'balanced',
  event_type TEXT NOT NULL DEFAULT 'reached',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_onboarding_branch_events_user ON public.onboarding_branch_events(user_id, occurred_at DESC);
CREATE INDEX idx_onboarding_branch_events_screen ON public.onboarding_branch_events(screen_key, event_type);
ALTER TABLE public.onboarding_branch_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_view_own_onboarding_events" ON public.onboarding_branch_events
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users_insert_own_onboarding_events" ON public.onboarding_branch_events
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admins_read_all_onboarding_events" ON public.onboarding_branch_events
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 3. Mobile deferral attestations (append-only)
CREATE TABLE public.mobile_deferral_attestations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  attested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  attested_by UUID NOT NULL,
  posture TEXT NOT NULL DEFAULT 'archived',
  archive_path TEXT NOT NULL DEFAULT 'archive/mobile/',
  evidence_hash TEXT NOT NULL,
  signature TEXT NOT NULL,
  notes TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_mobile_deferral_attestations_at ON public.mobile_deferral_attestations(attested_at DESC);
ALTER TABLE public.mobile_deferral_attestations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins_read_mobile_deferral_attestations" ON public.mobile_deferral_attestations
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins_insert_mobile_deferral_attestations" ON public.mobile_deferral_attestations
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') AND auth.uid() = attested_by);

CREATE OR REPLACE FUNCTION public.block_mobile_deferral_mutation()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RAISE EXCEPTION 'mobile_deferral_attestations is append-only';
END;
$$;
CREATE TRIGGER mobile_deferral_no_update BEFORE UPDATE ON public.mobile_deferral_attestations
  FOR EACH ROW EXECUTE FUNCTION public.block_mobile_deferral_mutation();
CREATE TRIGGER mobile_deferral_no_delete BEFORE DELETE ON public.mobile_deferral_attestations
  FOR EACH ROW EXECUTE FUNCTION public.block_mobile_deferral_mutation();

-- 4. App SDK extension events (plugin/widget lifecycle)
CREATE TABLE public.app_sdk_extension_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  app_id TEXT NOT NULL,
  extension_kind TEXT NOT NULL,
  extension_id TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '0.0.0',
  event_type TEXT NOT NULL,
  installed_by UUID,
  signature_hash TEXT,
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_app_sdk_ext_events_app ON public.app_sdk_extension_events(app_id, occurred_at DESC);
CREATE INDEX idx_app_sdk_ext_events_kind ON public.app_sdk_extension_events(extension_kind, event_type);
ALTER TABLE public.app_sdk_extension_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins_read_app_sdk_ext_events" ON public.app_sdk_extension_events
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "users_view_own_app_sdk_ext_events" ON public.app_sdk_extension_events
  FOR SELECT TO authenticated USING (auth.uid() = installed_by);
CREATE POLICY "admins_insert_app_sdk_ext_events" ON public.app_sdk_extension_events
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. Release evidence graph snapshots (append-only)
CREATE TABLE public.release_evidence_graph_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  snapshot_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  release_tag TEXT,
  node_count INTEGER NOT NULL DEFAULT 0,
  edge_count INTEGER NOT NULL DEFAULT 0,
  manifest_count INTEGER NOT NULL DEFAULT 0,
  coverage_pct NUMERIC(5,2) NOT NULL DEFAULT 0,
  graph_hash TEXT NOT NULL,
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_release_evidence_graph_at ON public.release_evidence_graph_snapshots(snapshot_at DESC);
ALTER TABLE public.release_evidence_graph_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins_read_release_evidence_graph" ON public.release_evidence_graph_snapshots
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins_insert_release_evidence_graph" ON public.release_evidence_graph_snapshots
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.block_release_evidence_graph_mutation()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RAISE EXCEPTION 'release_evidence_graph_snapshots is append-only';
END;
$$;
CREATE TRIGGER release_evidence_graph_no_update BEFORE UPDATE ON public.release_evidence_graph_snapshots
  FOR EACH ROW EXECUTE FUNCTION public.block_release_evidence_graph_mutation();
CREATE TRIGGER release_evidence_graph_no_delete BEFORE DELETE ON public.release_evidence_graph_snapshots
  FOR EACH ROW EXECUTE FUNCTION public.block_release_evidence_graph_mutation();