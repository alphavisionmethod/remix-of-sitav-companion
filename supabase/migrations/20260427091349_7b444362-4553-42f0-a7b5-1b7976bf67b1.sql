-- Phase 5: support → callback → retention loop lineage

-- 1) CRM linkage on support_cases (intake/support continuity)
ALTER TABLE public.support_cases
  ADD COLUMN IF NOT EXISTS crm_contact_id uuid,
  ADD COLUMN IF NOT EXISTS crm_company_id uuid;

CREATE INDEX IF NOT EXISTS idx_support_cases_crm_contact
  ON public.support_cases(crm_contact_id) WHERE crm_contact_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_support_cases_crm_company
  ON public.support_cases(crm_company_id) WHERE crm_company_id IS NOT NULL;

-- 2) CRM linkage on business_health_scores (so a contact-level signal can be attributed)
ALTER TABLE public.business_health_scores
  ADD COLUMN IF NOT EXISTS crm_contact_id uuid,
  ADD COLUMN IF NOT EXISTS crm_company_id uuid,
  ADD COLUMN IF NOT EXISTS source_support_case_id uuid;

CREATE INDEX IF NOT EXISTS idx_bhs_crm_contact
  ON public.business_health_scores(crm_contact_id) WHERE crm_contact_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bhs_source_case
  ON public.business_health_scores(source_support_case_id) WHERE source_support_case_id IS NOT NULL;

-- 3) callback_queue — drives the Follow-Through Center
CREATE TABLE IF NOT EXISTS public.callback_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  queue_kind text NOT NULL DEFAULT 'callbacks'
    CHECK (queue_kind IN ('callbacks','no-touch','waiting','drafts','overdue','recovery')),
  contact_name text NOT NULL,
  company text,
  reason text NOT NULL DEFAULT '',
  channel text NOT NULL DEFAULT 'phone'
    CHECK (channel IN ('phone','email','meeting','sms')),
  urgency text NOT NULL DEFAULT 'normal'
    CHECK (urgency IN ('critical','high','normal','low')),
  value_cents integer,
  due_at timestamptz,
  days_stale integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'open'
    CHECK (status IN ('open','in_progress','done','snoozed','cancelled')),
  crm_contact_id uuid,
  crm_company_id uuid,
  source_support_case_id uuid,
  source_appointment_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_callback_queue_user_kind
  ON public.callback_queue(user_id, queue_kind, status);
CREATE INDEX IF NOT EXISTS idx_callback_queue_crm_contact
  ON public.callback_queue(crm_contact_id) WHERE crm_contact_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_callback_queue_due
  ON public.callback_queue(due_at) WHERE status = 'open';

ALTER TABLE public.callback_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own callback queue"
  ON public.callback_queue FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users create own callback queue"
  ON public.callback_queue FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own callback queue"
  ON public.callback_queue FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own callback queue"
  ON public.callback_queue FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- updated_at trigger (reuse canonical function if present)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'DROP TRIGGER IF EXISTS trg_callback_queue_updated_at ON public.callback_queue';
    EXECUTE 'CREATE TRIGGER trg_callback_queue_updated_at BEFORE UPDATE ON public.callback_queue FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()';
  END IF;
END $$;