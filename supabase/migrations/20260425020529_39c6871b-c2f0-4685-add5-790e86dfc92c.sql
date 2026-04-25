-- Phase 9: Global kill-switch for autonomy fleet

CREATE TABLE public.autonomy_kill_switch (
  user_id UUID PRIMARY KEY,
  engaged BOOLEAN NOT NULL DEFAULT false,
  reason TEXT,
  domain_scope TEXT, -- NULL = all domains; else 'finance' | 'inbox' | 'calendar' | 'ops' | etc.
  engaged_at TIMESTAMPTZ,
  engaged_by UUID,
  released_at TIMESTAMPTZ,
  released_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.autonomy_kill_switch ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners view own kill-switch"
  ON public.autonomy_kill_switch FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins view all kill-switches"
  ON public.autonomy_kill_switch FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Owners insert own kill-switch"
  ON public.autonomy_kill_switch FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners update own kill-switch"
  ON public.autonomy_kill_switch FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_autonomy_kill_switch_updated_at
  BEFORE UPDATE ON public.autonomy_kill_switch
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Immutable audit log
CREATE TABLE public.autonomy_kill_switch_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  actor_user_id UUID NOT NULL,
  action TEXT NOT NULL, -- 'engaged' | 'released'
  reason TEXT,
  domain_scope TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT autonomy_kill_switch_audit_action_chk
    CHECK (action IN ('engaged', 'released'))
);

CREATE INDEX idx_autonomy_kill_switch_audit_user
  ON public.autonomy_kill_switch_audit (user_id, created_at DESC);

ALTER TABLE public.autonomy_kill_switch_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners view own audit"
  ON public.autonomy_kill_switch_audit FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins view all audit"
  ON public.autonomy_kill_switch_audit FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Owners insert own audit"
  ON public.autonomy_kill_switch_audit FOR INSERT
  WITH CHECK (auth.uid() = user_id);