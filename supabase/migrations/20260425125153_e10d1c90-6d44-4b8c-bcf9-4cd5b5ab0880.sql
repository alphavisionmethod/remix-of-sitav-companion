
-- ════════════════════════════════════════════════════════════
-- SITA OS — Phase 2: Trust Action Catalog + Authority Engine
-- ════════════════════════════════════════════════════════════
-- Adds:
--   1) public.trust_action_catalog — DB-side mirror of the in-code
--      Trust Action Registry, keyed by action_key. Globally readable
--      (reference data); seeded by the manifest emitter.
--   2) public.automation_authority_settings — per-user overrides
--      on top of the registry default. Users choose: suggest /
--      ask / pre_approved / blocked per action.
--   3) public.evaluate_action_authority(action_key, user_id) —
--      SECURITY DEFINER resolver returning the effective authority
--      level (override > catalog default > 'ask').
-- ════════════════════════════════════════════════════════════

-- ── 1. Trust action catalog ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.trust_action_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_key text NOT NULL UNIQUE,
  pillar text NOT NULL CHECK (pillar IN ('business','concierge','finance','health','shared')),
  label text NOT NULL,
  description text NOT NULL DEFAULT '',
  risk_tier text NOT NULL DEFAULT 'medium' CHECK (risk_tier IN ('low','medium','high','critical')),
  default_authority_level text NOT NULL DEFAULT 'ask' CHECK (default_authority_level IN ('suggest','ask','pre_approved','blocked')),
  require_approval boolean NOT NULL DEFAULT false,
  reversible boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trust_action_catalog_pillar ON public.trust_action_catalog (pillar);
CREATE INDEX IF NOT EXISTS idx_trust_action_catalog_risk ON public.trust_action_catalog (risk_tier);

ALTER TABLE public.trust_action_catalog ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "trust_action_catalog readable to authenticated" ON public.trust_action_catalog;
CREATE POLICY "trust_action_catalog readable to authenticated"
  ON public.trust_action_catalog FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "trust_action_catalog admin write" ON public.trust_action_catalog;
CREATE POLICY "trust_action_catalog admin write"
  ON public.trust_action_catalog FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP TRIGGER IF EXISTS trg_trust_action_catalog_updated_at ON public.trust_action_catalog;
CREATE TRIGGER trg_trust_action_catalog_updated_at
  BEFORE UPDATE ON public.trust_action_catalog
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── 2. Per-user authority overrides ─────────────────────────
CREATE TABLE IF NOT EXISTS public.automation_authority_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action_key text NOT NULL,
  authority_level text NOT NULL CHECK (authority_level IN ('suggest','ask','pre_approved','blocked')),
  reason text,
  set_by text NOT NULL DEFAULT 'user' CHECK (set_by IN ('user','system','admin')),
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, action_key)
);

CREATE INDEX IF NOT EXISTS idx_authority_settings_user ON public.automation_authority_settings (user_id);

ALTER TABLE public.automation_authority_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users view own authority settings" ON public.automation_authority_settings;
CREATE POLICY "users view own authority settings"
  ON public.automation_authority_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "users insert own authority settings" ON public.automation_authority_settings;
CREATE POLICY "users insert own authority settings"
  ON public.automation_authority_settings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users update own authority settings" ON public.automation_authority_settings;
CREATE POLICY "users update own authority settings"
  ON public.automation_authority_settings FOR UPDATE
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users delete own authority settings" ON public.automation_authority_settings;
CREATE POLICY "users delete own authority settings"
  ON public.automation_authority_settings FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS trg_authority_settings_updated_at ON public.automation_authority_settings;
CREATE TRIGGER trg_authority_settings_updated_at
  BEFORE UPDATE ON public.automation_authority_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── 3. Authority resolver (security definer) ────────────────
CREATE OR REPLACE FUNCTION public.evaluate_action_authority(
  _action_key text,
  _user_id uuid
)
RETURNS TABLE (
  action_key text,
  effective_authority text,
  source text,
  pillar text,
  risk_tier text,
  require_approval boolean,
  reversible boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_override text;
  v_override_expires timestamptz;
  v_default text;
  v_pillar text;
  v_risk text;
  v_req_approval boolean;
  v_reversible boolean;
BEGIN
  SELECT c.default_authority_level, c.pillar, c.risk_tier, c.require_approval, c.reversible
    INTO v_default, v_pillar, v_risk, v_req_approval, v_reversible
    FROM public.trust_action_catalog c
   WHERE c.action_key = _action_key;

  IF v_default IS NULL THEN
    -- Unknown action: safe-by-default.
    RETURN QUERY SELECT _action_key, 'ask'::text, 'fallback'::text,
      'shared'::text, 'medium'::text, false, true;
    RETURN;
  END IF;

  SELECT s.authority_level, s.expires_at
    INTO v_override, v_override_expires
    FROM public.automation_authority_settings s
   WHERE s.user_id = _user_id AND s.action_key = _action_key;

  IF v_override IS NOT NULL
     AND (v_override_expires IS NULL OR v_override_expires > now()) THEN
    RETURN QUERY SELECT _action_key, v_override, 'user_override'::text,
      v_pillar, v_risk, v_req_approval, v_reversible;
  ELSE
    RETURN QUERY SELECT _action_key, v_default, 'catalog_default'::text,
      v_pillar, v_risk, v_req_approval, v_reversible;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.evaluate_action_authority(text, uuid) TO authenticated;

-- ── 4. Seed catalog from current in-code registry (10 baseline actions) ─
INSERT INTO public.trust_action_catalog
  (action_key, pillar, label, description, risk_tier, default_authority_level, require_approval, reversible)
VALUES
  ('crm.contact.create','business','Create CRM contact','Persists a new contact record with PII to the CRM store.','low','pre_approved',false,true),
  ('crm.deal.stage_change','business','Change deal stage','Mutates pipeline stage and forecast surface.','medium','ask',false,true),
  ('finance.payment.schedule','finance','Schedule payment','Queues a future-dated outbound payment from an owner-controlled account.','high','ask',true,false),
  ('concierge.household_task.assign','concierge','Assign household task','Assigns or reassigns a household task to a member.','low','pre_approved',false,true),
  ('concierge.travel.booking_confirm','concierge','Confirm travel booking','Confirms a flight, lodging, or transport reservation against a vendor.','high','ask',true,false),
  ('shared.autonomy.kill_switch_engage','shared','Engage autonomy kill-switch','Halts every advisor controller, standing mission, and queue execution at the next state check.','critical','pre_approved',false,true),
  ('shared.autonomy.kill_switch_release','shared','Release autonomy kill-switch','Resumes advisor controllers and standing missions after a halt.','high','ask',false,true),
  ('shared.support.case_escalate','shared','Escalate support case','Routes a support case to a higher tier or specialist role.','medium','pre_approved',false,true),
  ('business.crm.contact_bulk_import','business','Bulk import contacts','Persists many contact records at once from an external CSV source.','medium','ask',false,true),
  ('finance.envelope.allocation_change','finance','Change envelope allocation','Reallocates funds between household money envelopes.','medium','ask',false,true),
  -- Phase 2 expansion: Business OS
  ('business.invoice.send','business','Send invoice','Dispatches an invoice to a customer email.','medium','ask',false,false),
  ('business.crm.contact_delete','business','Delete CRM contact','Permanently removes a contact and associated PII.','high','ask',true,false),
  ('business.email.campaign_send','business','Send email campaign','Sends a bulk email campaign to a contact segment.','high','ask',true,false),
  ('business.calendar.external_invite','business','Send external calendar invite','Creates an external-facing calendar invitation.','medium','ask',false,true),
  -- Finance OS
  ('finance.transfer.execute','finance','Execute transfer','Moves funds between accounts.','critical','blocked',true,false),
  ('finance.budget.adjust','finance','Adjust budget','Modifies a budget category limit.','low','pre_approved',false,true),
  ('finance.investment.buy','finance','Place buy order','Submits a buy order to a brokerage.','critical','blocked',true,false),
  ('finance.investment.sell','finance','Place sell order','Submits a sell order to a brokerage.','critical','blocked',true,false),
  ('finance.recurring.cancel','finance','Cancel recurring payment','Stops a recurring outbound payment.','medium','ask',false,true),
  -- Concierge OS
  ('concierge.gift.purchase','concierge','Purchase gift','Buys a gift on behalf of the user.','high','ask',true,false),
  ('concierge.reservation.cancel','concierge','Cancel reservation','Cancels a confirmed reservation.','medium','ask',false,false),
  ('concierge.contact.message','concierge','Send message to contact','Sends a message to an external contact.','medium','ask',false,false),
  -- Health OS
  ('health.profile.update','health','Update health profile','Modifies the user''s sensitive health profile.','high','ask',false,true),
  ('health.metric.log','health','Log health metric','Records a health metric (weight, BP, etc.).','low','pre_approved',false,true),
  ('health.record.share','health','Share health record','Shares a health record with a third party.','critical','blocked',true,false),
  ('health.appointment.book','health','Book health appointment','Books a medical appointment with a provider.','medium','ask',false,true),
  ('health.medication.log','health','Log medication','Records a medication intake event.','low','pre_approved',false,true),
  -- Shared / system
  ('shared.memory.delete','shared','Delete memory','Permanently removes a memory entry.','medium','ask',false,false),
  ('shared.memory.add','shared','Add memory','Saves a new memory entry.','low','pre_approved',false,true),
  ('shared.workspace.delete','shared','Delete workspace','Removes a workspace and its scoped data.','critical','ask',true,false),
  ('shared.workspace.create','shared','Create workspace','Creates a new workspace.','low','pre_approved',false,true),
  ('shared.file.delete','shared','Delete file','Permanently deletes a file from storage.','medium','ask',false,false),
  ('shared.notification.send','shared','Send notification','Sends a notification to the user.','low','pre_approved',false,true),
  ('shared.session.revoke','shared','Revoke session','Terminates an active device session.','high','ask',false,true)
ON CONFLICT (action_key) DO UPDATE SET
  pillar = EXCLUDED.pillar,
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  risk_tier = EXCLUDED.risk_tier,
  default_authority_level = EXCLUDED.default_authority_level,
  require_approval = EXCLUDED.require_approval,
  reversible = EXCLUDED.reversible,
  updated_at = now();
