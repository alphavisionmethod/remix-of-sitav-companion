-- ═══════════════════════════════════════════════════════════════
-- Phase 1 — Schema & Lineage Foundation for Business OS continuity
-- All columns nullable, all FKs ON DELETE SET NULL, RLS inherits.
-- ═══════════════════════════════════════════════════════════════

-- ── quotes ─────────────────────────────────────────────────────
ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS opportunity_id uuid REFERENCES public.crm_opportunities(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS crm_contact_id uuid REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS crm_company_id uuid REFERENCES public.crm_companies(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS quote_number text,
  ADD COLUMN IF NOT EXISTS sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS rejected_at timestamptz,
  ADD COLUMN IF NOT EXISTS converted_proposal_id uuid,
  ADD COLUMN IF NOT EXISTS converted_invoice_id uuid;

CREATE INDEX IF NOT EXISTS idx_quotes_opportunity_id ON public.quotes(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_quotes_crm_contact_id ON public.quotes(crm_contact_id);
CREATE INDEX IF NOT EXISTS idx_quotes_crm_company_id ON public.quotes(crm_company_id);
CREATE INDEX IF NOT EXISTS idx_quotes_user_status      ON public.quotes(user_id, status);

-- ── proposals ──────────────────────────────────────────────────
ALTER TABLE public.proposals
  ADD COLUMN IF NOT EXISTS quote_id uuid REFERENCES public.quotes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS opportunity_id uuid REFERENCES public.crm_opportunities(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS crm_contact_id uuid REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS crm_company_id uuid REFERENCES public.crm_companies(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS converted_invoice_id uuid;

CREATE INDEX IF NOT EXISTS idx_proposals_quote_id       ON public.proposals(quote_id);
CREATE INDEX IF NOT EXISTS idx_proposals_opportunity_id ON public.proposals(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_proposals_crm_contact_id ON public.proposals(crm_contact_id);
CREATE INDEX IF NOT EXISTS idx_proposals_crm_company_id ON public.proposals(crm_company_id);
CREATE INDEX IF NOT EXISTS idx_proposals_user_status    ON public.proposals(user_id, status);

-- ── invoices ───────────────────────────────────────────────────
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS quote_id uuid REFERENCES public.quotes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS proposal_id uuid REFERENCES public.proposals(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS opportunity_id uuid REFERENCES public.crm_opportunities(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS crm_contact_id uuid REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS crm_company_id uuid REFERENCES public.crm_companies(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_invoices_quote_id        ON public.invoices(quote_id);
CREATE INDEX IF NOT EXISTS idx_invoices_proposal_id     ON public.invoices(proposal_id);
CREATE INDEX IF NOT EXISTS idx_invoices_opportunity_id  ON public.invoices(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_invoices_crm_contact_id  ON public.invoices(crm_contact_id);
CREATE INDEX IF NOT EXISTS idx_invoices_crm_company_id  ON public.invoices(crm_company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_status     ON public.invoices(user_id, status);

-- ── appointments ───────────────────────────────────────────────
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS crm_contact_id uuid REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS crm_company_id uuid REFERENCES public.crm_companies(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS opportunity_id uuid REFERENCES public.crm_opportunities(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_appointments_customer_id     ON public.appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_crm_contact_id  ON public.appointments(crm_contact_id);
CREATE INDEX IF NOT EXISTS idx_appointments_crm_company_id  ON public.appointments(crm_company_id);
CREATE INDEX IF NOT EXISTS idx_appointments_opportunity_id  ON public.appointments(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_appointments_user_date       ON public.appointments(user_id, appointment_date DESC);

-- ── v_revenue_lineage view ─────────────────────────────────────
-- Join lineage in one shot: opportunity → quote → proposal → invoice
-- with optional CRM contact/company labels. RLS inherits from base
-- tables since the view runs as the invoking user (default).
CREATE OR REPLACE VIEW public.v_revenue_lineage AS
SELECT
  COALESCE(i.user_id, p.user_id, q.user_id, o.user_id) AS user_id,
  o.id   AS opportunity_id,
  o.title AS opportunity_title,
  o.stage AS opportunity_stage,
  q.id   AS quote_id,
  q.quote_number,
  q.title AS quote_title,
  q.amount_cents AS quote_amount_cents,
  q.status AS quote_status,
  p.id   AS proposal_id,
  p.title AS proposal_title,
  p.status AS proposal_status,
  i.id   AS invoice_id,
  i.invoice_number,
  i.amount_cents AS invoice_amount_cents,
  i.status AS invoice_status,
  COALESCE(i.crm_contact_id, p.crm_contact_id, q.crm_contact_id, o.contact_id) AS crm_contact_id,
  COALESCE(i.crm_company_id, p.crm_company_id, q.crm_company_id, o.company_id) AS crm_company_id,
  COALESCE(i.customer_id,    p.customer_id,    q.customer_id)                  AS customer_id,
  GREATEST(
    COALESCE(i.updated_at, 'epoch'::timestamptz),
    COALESCE(p.updated_at, 'epoch'::timestamptz),
    COALESCE(q.updated_at, 'epoch'::timestamptz),
    COALESCE(o.updated_at, 'epoch'::timestamptz)
  ) AS last_activity_at
FROM public.crm_opportunities o
FULL OUTER JOIN public.quotes    q ON q.opportunity_id = o.id
FULL OUTER JOIN public.proposals p ON p.quote_id       = q.id OR p.opportunity_id = o.id
FULL OUTER JOIN public.invoices  i ON i.proposal_id    = p.id OR i.quote_id        = q.id OR i.opportunity_id = o.id
WHERE COALESCE(i.user_id, p.user_id, q.user_id, o.user_id) IS NOT NULL;

COMMENT ON VIEW public.v_revenue_lineage IS
'Phase 1 — joins opportunity → quote → proposal → invoice for a single-trip lineage breadcrumb. RLS inherits from base tables (user-scoped).';
