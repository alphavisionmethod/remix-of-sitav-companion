-- Phase 4: CRM ↔ Finance bridge table
CREATE TABLE IF NOT EXISTS public.crm_customer_link (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  crm_contact_id uuid NOT NULL REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  crm_company_id uuid REFERENCES public.crm_companies(id) ON DELETE SET NULL,
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  link_source text NOT NULL DEFAULT 'manual',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS crm_customer_link_unique_pair
  ON public.crm_customer_link (user_id, crm_contact_id, customer_id);

CREATE INDEX IF NOT EXISTS crm_customer_link_contact_idx
  ON public.crm_customer_link (user_id, crm_contact_id);

CREATE INDEX IF NOT EXISTS crm_customer_link_customer_idx
  ON public.crm_customer_link (user_id, customer_id);

CREATE INDEX IF NOT EXISTS crm_customer_link_company_idx
  ON public.crm_customer_link (user_id, crm_company_id);

ALTER TABLE public.crm_customer_link ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own crm_customer_link"
  ON public.crm_customer_link FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own crm_customer_link"
  ON public.crm_customer_link FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own crm_customer_link"
  ON public.crm_customer_link FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own crm_customer_link"
  ON public.crm_customer_link FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER crm_customer_link_updated_at
  BEFORE UPDATE ON public.crm_customer_link
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();