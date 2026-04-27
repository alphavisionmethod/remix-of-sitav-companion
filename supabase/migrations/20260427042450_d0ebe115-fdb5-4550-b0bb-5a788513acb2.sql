-- Phase 2: CRM↔Concierge linkage columns
ALTER TABLE public.concierge_recurring_obligations
  ADD COLUMN IF NOT EXISTS crm_contact_id uuid,
  ADD COLUMN IF NOT EXISTS crm_company_id uuid,
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.errands
  ADD COLUMN IF NOT EXISTS crm_contact_id uuid,
  ADD COLUMN IF NOT EXISTS crm_company_id uuid;

CREATE INDEX IF NOT EXISTS idx_concierge_recurring_obligations_crm_contact
  ON public.concierge_recurring_obligations(crm_contact_id) WHERE crm_contact_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_concierge_recurring_obligations_crm_company
  ON public.concierge_recurring_obligations(crm_company_id) WHERE crm_company_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_errands_crm_contact
  ON public.errands(crm_contact_id) WHERE crm_contact_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_errands_crm_company
  ON public.errands(crm_company_id) WHERE crm_company_id IS NOT NULL;