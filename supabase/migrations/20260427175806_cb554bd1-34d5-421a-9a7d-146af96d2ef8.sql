-- ═══════════════════════════════════════════════════════════════
-- Phase 3 — Concierge ↔ Business linkage
-- ═══════════════════════════════════════════════════════════════

-- 1. Bridge table: household_business_link
CREATE TABLE IF NOT EXISTS public.household_business_link (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  concierge_entity_type TEXT NOT NULL CHECK (concierge_entity_type IN ('household_task','recurring_obligation','provider','appointment','errand')),
  concierge_entity_id UUID NOT NULL,
  crm_contact_id UUID,
  crm_company_id UUID,
  link_source TEXT NOT NULL DEFAULT 'manual' CHECK (link_source IN ('manual','auto-from-task','auto-from-provider','auto-from-obligation','import')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT household_business_link_endpoint_present CHECK (crm_contact_id IS NOT NULL OR crm_company_id IS NOT NULL)
);

-- Idempotency: same triple should not be inserted twice.
CREATE UNIQUE INDEX IF NOT EXISTS ux_household_business_link_triple
  ON public.household_business_link (user_id, concierge_entity_type, concierge_entity_id, COALESCE(crm_contact_id, '00000000-0000-0000-0000-000000000000'::uuid), COALESCE(crm_company_id, '00000000-0000-0000-0000-000000000000'::uuid));

CREATE INDEX IF NOT EXISTS ix_household_business_link_user
  ON public.household_business_link (user_id);
CREATE INDEX IF NOT EXISTS ix_household_business_link_contact
  ON public.household_business_link (user_id, crm_contact_id) WHERE crm_contact_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_household_business_link_company
  ON public.household_business_link (user_id, crm_company_id) WHERE crm_company_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_household_business_link_entity
  ON public.household_business_link (user_id, concierge_entity_type, concierge_entity_id);

ALTER TABLE public.household_business_link ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hbl_select_own" ON public.household_business_link
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "hbl_insert_own" ON public.household_business_link
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "hbl_update_own" ON public.household_business_link
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "hbl_delete_own" ON public.household_business_link
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER trg_household_business_link_updated_at
  BEFORE UPDATE ON public.household_business_link
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Direct CRM refs on providers (mirrors concierge_recurring_obligations shape)
ALTER TABLE public.providers
  ADD COLUMN IF NOT EXISTS crm_contact_id UUID,
  ADD COLUMN IF NOT EXISTS crm_company_id UUID;

CREATE INDEX IF NOT EXISTS ix_providers_crm_contact
  ON public.providers (user_id, crm_contact_id) WHERE crm_contact_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_providers_crm_company
  ON public.providers (user_id, crm_company_id) WHERE crm_company_id IS NOT NULL;

-- 3. Direct CRM refs on household_tasks (parallel to obligations)
ALTER TABLE public.household_tasks
  ADD COLUMN IF NOT EXISTS crm_contact_id UUID,
  ADD COLUMN IF NOT EXISTS crm_company_id UUID;

CREATE INDEX IF NOT EXISTS ix_household_tasks_crm_contact
  ON public.household_tasks (user_id, crm_contact_id) WHERE crm_contact_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_household_tasks_crm_company
  ON public.household_tasks (user_id, crm_company_id) WHERE crm_company_id IS NOT NULL;