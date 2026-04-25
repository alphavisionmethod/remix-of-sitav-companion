
-- ═══════════════════════════════════════════════════════════════════
-- PHASE 1 — Identity, Workspace & Module Registry Foundation
-- ═══════════════════════════════════════════════════════════════════

-- ── Helper: list workspace ids the current user owns or is an accepted member of
CREATE OR REPLACE FUNCTION public.current_user_workspace_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.pb_workspaces WHERE user_id = auth.uid()
  UNION
  SELECT workspace_id FROM public.pb_workspace_members
   WHERE member_user_id = auth.uid() AND status = 'accepted'
$$;

-- ── 1. module_registry ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.module_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id text NOT NULL UNIQUE,
  parent_id text REFERENCES public.module_registry(module_id) ON DELETE SET NULL,
  pillar text NOT NULL CHECK (pillar IN ('business','concierge','finance','health','shared','trust')),
  label text NOT NULL,
  description text,
  route_prefix text,
  icon text,
  category text,
  feature_flag text,
  lifecycle text NOT NULL DEFAULT 'ga' CHECK (lifecycle IN ('ga','beta','experimental','legacy','planned')),
  default_authority_level text NOT NULL DEFAULT 'ask'
    CHECK (default_authority_level IN ('suggest','ask','pre_approved','blocked')),
  health_status text NOT NULL DEFAULT 'healthy'
    CHECK (health_status IN ('healthy','degraded','down','unknown')),
  owner text,
  sort_order int NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_module_registry_pillar ON public.module_registry(pillar);
CREATE INDEX IF NOT EXISTS idx_module_registry_parent ON public.module_registry(parent_id);
CREATE INDEX IF NOT EXISTS idx_module_registry_route ON public.module_registry(route_prefix);

ALTER TABLE public.module_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "module_registry readable by authenticated"
  ON public.module_registry FOR SELECT TO authenticated USING (true);

CREATE POLICY "module_registry admin write"
  ON public.module_registry FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER trg_module_registry_updated
  BEFORE UPDATE ON public.module_registry
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 2. route_ownership ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.route_ownership (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_path text NOT NULL UNIQUE,
  module_id text NOT NULL REFERENCES public.module_registry(module_id) ON DELETE RESTRICT,
  is_shared boolean NOT NULL DEFAULT false,
  is_trust boolean NOT NULL DEFAULT false,
  visibility text NOT NULL DEFAULT 'internal'
    CHECK (visibility IN ('public','internal','admin')),
  lifecycle text NOT NULL DEFAULT 'ga'
    CHECK (lifecycle IN ('ga','beta','experimental','legacy','planned')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_route_ownership_module ON public.route_ownership(module_id);
CREATE INDEX IF NOT EXISTS idx_route_ownership_visibility ON public.route_ownership(visibility);

ALTER TABLE public.route_ownership ENABLE ROW LEVEL SECURITY;

CREATE POLICY "route_ownership readable by authenticated"
  ON public.route_ownership FOR SELECT TO authenticated USING (true);

CREATE POLICY "route_ownership admin write"
  ON public.route_ownership FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER trg_route_ownership_updated
  BEFORE UPDATE ON public.route_ownership
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 3. workspace_contexts ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.workspace_contexts (
  workspace_id uuid PRIMARY KEY REFERENCES public.pb_workspaces(id) ON DELETE CASCADE,
  pillar text NOT NULL DEFAULT 'personal'
    CHECK (pillar IN ('business','concierge','finance','health','personal','shared')),
  protected boolean NOT NULL DEFAULT false,
  default_authority_level text NOT NULL DEFAULT 'ask'
    CHECK (default_authority_level IN ('suggest','ask','pre_approved','blocked')),
  memory_scope text NOT NULL DEFAULT 'isolated'
    CHECK (memory_scope IN ('isolated','shared','cross-pillar')),
  assistant_advisor_id text,
  visibility text NOT NULL DEFAULT 'private'
    CHECK (visibility IN ('private','workspace','organization')),
  default_notification_level text NOT NULL DEFAULT 'standard'
    CHECK (default_notification_level IN ('silent','minimal','standard','verbose')),
  ephemeral_mode boolean NOT NULL DEFAULT false,
  retention_days int,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workspace_contexts_pillar ON public.workspace_contexts(pillar);

ALTER TABLE public.workspace_contexts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_contexts member read"
  ON public.workspace_contexts FOR SELECT TO authenticated
  USING (workspace_id IN (SELECT public.current_user_workspace_ids()));

CREATE POLICY "workspace_contexts owner write"
  ON public.workspace_contexts FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pb_workspaces w
      WHERE w.id = workspace_contexts.workspace_id AND w.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pb_workspaces w
      WHERE w.id = workspace_contexts.workspace_id AND w.user_id = auth.uid()
    )
  );

CREATE TRIGGER trg_workspace_contexts_updated
  BEFORE UPDATE ON public.workspace_contexts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 4. Auto-create workspace_contexts on new workspace ─────────────
CREATE OR REPLACE FUNCTION public.handle_new_workspace_context()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.workspace_contexts (workspace_id, pillar)
  VALUES (
    NEW.id,
    CASE
      WHEN NEW.kind IN ('business','concierge','finance','health','personal','shared')
        THEN NEW.kind
      ELSE 'personal'
    END
  )
  ON CONFLICT (workspace_id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_workspace_context failed for %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_pb_workspaces_context ON public.pb_workspaces;
CREATE TRIGGER trg_pb_workspaces_context
  AFTER INSERT ON public.pb_workspaces
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_workspace_context();

-- ── 5. Backfill workspace_contexts for existing workspaces ─────────
INSERT INTO public.workspace_contexts (workspace_id, pillar)
SELECT
  w.id,
  CASE
    WHEN w.kind IN ('business','concierge','finance','health','personal','shared')
      THEN w.kind
    ELSE 'personal'
  END
FROM public.pb_workspaces w
WHERE NOT EXISTS (
  SELECT 1 FROM public.workspace_contexts c WHERE c.workspace_id = w.id
);

-- ── 6. Seed module_registry with the 4 pillars + trust + shared ────
INSERT INTO public.module_registry
  (module_id, pillar, label, description, route_prefix, icon, category, lifecycle, default_authority_level, sort_order)
VALUES
  ('business','business','Business OS','CRM, sales, quotes, lead recovery, ads, support','/business','briefcase','pillar','ga','ask',10),
  ('concierge','concierge','Concierge OS','Travel, bookings, household, life admin, errands','/concierge','concierge-bell','pillar','ga','ask',20),
  ('finance','finance','Finance OS','Budget, cash, investments, tax, net worth','/money','wallet','pillar','ga','ask',30),
  ('health','health','Health OS','Nutrition, wearables, medical, fitness, recovery','/health','heart-pulse','pillar','beta','ask',40),
  ('trust','trust','Trust Center','Receipts, approvals, permissions, automation authority, audit','/trust','shield-check','platform','ga','ask',5),
  ('shared','shared','Shared Platform','Shell, identity, AI runtime, voice, memory, files, notifications','/','layers','platform','ga','ask',1)
ON CONFLICT (module_id) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  route_prefix = EXCLUDED.route_prefix,
  updated_at = now();

-- ── 7. Seed sub-modules currently present in the pillars ───────────
INSERT INTO public.module_registry
  (module_id, parent_id, pillar, label, route_prefix, lifecycle, sort_order)
VALUES
  -- Business sub-apps
  ('business.crm','business','business','CRM','/business/crm','ga',11),
  ('business.crm.contacts','business.crm','business','CRM Contacts','/business/crm/contacts','ga',12),
  ('business.crm.pipeline','business.crm','business','CRM Pipeline','/business/crm/pipeline','ga',13),
  -- Concierge sub-apps
  ('concierge.travel','concierge','concierge','Travel Planning','/concierge/travel','ga',21),
  -- Finance sub-apps
  ('finance.overview','finance','finance','Money Overview','/money','ga',31),
  ('finance.approvals','finance','finance','Money Approvals','/money/approvals','ga',32),
  ('finance.investment-office','finance','finance','Investment Office','/money/investment-office','beta',33),
  -- Health sub-apps (planned)
  ('health.nutrition','health','health','Nutrition','/health/nutrition','planned',41),
  ('health.wearables','health','health','Wearables','/health/wearables','planned',42),
  ('health.fitness','health','health','Fitness','/health/fitness','planned',43),
  ('health.medical','health','health','Medical','/health/medical','planned',44),
  ('health.recovery','health','health','Recovery','/health/recovery','planned',45),
  -- Trust sub-pages
  ('trust.receipts','trust','trust','Receipts','/trust/receipts','ga',6),
  ('trust.approvals','trust','trust','Approvals','/trust/approvals','ga',7),
  ('trust.coverage','trust','trust','Coverage','/trust/coverage','ga',8),
  ('trust.decisions','trust','trust','Decisions','/trust/decisions','ga',9)
ON CONFLICT (module_id) DO UPDATE SET
  label = EXCLUDED.label,
  route_prefix = EXCLUDED.route_prefix,
  updated_at = now();

-- ── 8. Seed route_ownership for all known top-level routes ─────────
INSERT INTO public.route_ownership (route_path, module_id, is_trust, is_shared, visibility, lifecycle) VALUES
  ('/business','business',false,false,'internal','ga'),
  ('/business/crm','business.crm',false,false,'internal','ga'),
  ('/business/crm/contacts','business.crm.contacts',false,false,'internal','ga'),
  ('/business/crm/pipeline','business.crm.pipeline',false,false,'internal','ga'),
  ('/concierge','concierge',false,false,'internal','ga'),
  ('/concierge/travel','concierge.travel',false,false,'internal','ga'),
  ('/money','finance.overview',false,false,'internal','ga'),
  ('/money/approvals','finance.approvals',false,false,'internal','ga'),
  ('/money/investment-office','finance.investment-office',false,false,'internal','beta'),
  ('/health','health',false,false,'internal','beta'),
  ('/trust','trust',true,false,'internal','ga'),
  ('/trust/receipts','trust.receipts',true,false,'internal','ga'),
  ('/trust/approvals','trust.approvals',true,false,'internal','ga'),
  ('/trust/coverage','trust.coverage',true,false,'internal','ga'),
  ('/trust/decisions','trust.decisions',true,false,'internal','ga'),
  ('/admin','shared',false,true,'admin','ga'),
  ('/settings','shared',false,true,'internal','ga'),
  ('/launcher','shared',false,true,'internal','ga'),
  ('/files','shared',false,true,'internal','ga'),
  ('/personal-brain','shared',false,true,'internal','ga'),
  ('/owner','shared',false,true,'internal','ga')
ON CONFLICT (route_path) DO UPDATE SET
  module_id = EXCLUDED.module_id,
  visibility = EXCLUDED.visibility,
  lifecycle = EXCLUDED.lifecycle,
  updated_at = now();
