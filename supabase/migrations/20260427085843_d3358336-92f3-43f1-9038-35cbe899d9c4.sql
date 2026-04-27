-- Phase 4: Lead intake → recovery → recovered-value lineage columns
-- Adds bidirectional links so every lead row can prove its origin and
-- every recovered-value entry can be traced back to the source lead.

-- 1) crm_contacts: track which inbox row produced the contact
ALTER TABLE public.crm_contacts
  ADD COLUMN IF NOT EXISTS source_lead_inbox_item_id uuid NULL
    REFERENCES public.lead_inbox_items(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_crm_contacts_source_lead_inbox_item_id
  ON public.crm_contacts(source_lead_inbox_item_id);

-- 2) lead_inbox_items: track which crm_contact / lead it produced when accepted
ALTER TABLE public.lead_inbox_items
  ADD COLUMN IF NOT EXISTS produced_contact_id uuid NULL
    REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS produced_lead_id uuid NULL
    REFERENCES public.leads(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_lead_inbox_items_produced_contact_id
  ON public.lead_inbox_items(produced_contact_id);
CREATE INDEX IF NOT EXISTS idx_lead_inbox_items_produced_lead_id
  ON public.lead_inbox_items(produced_lead_id);

-- 3) recovery_jobs: link to the originating lead/contact for back-navigation
ALTER TABLE public.recovery_jobs
  ADD COLUMN IF NOT EXISTS lead_id uuid NULL
    REFERENCES public.leads(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS crm_contact_id uuid NULL
    REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS recovered_value_cents bigint NULL,
  ADD COLUMN IF NOT EXISTS recovered_at timestamptz NULL;

CREATE INDEX IF NOT EXISTS idx_recovery_jobs_lead_id
  ON public.recovery_jobs(lead_id);
CREATE INDEX IF NOT EXISTS idx_recovery_jobs_crm_contact_id
  ON public.recovery_jobs(crm_contact_id);
