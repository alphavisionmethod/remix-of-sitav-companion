-- Drop legacy concierge_errands table (will be replaced by canonical errands)
DROP TABLE IF EXISTS public.concierge_errands CASCADE;

-- 1. schedules
CREATE TABLE IF NOT EXISTS public.schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  start_at timestamptz,
  end_at timestamptz,
  location text,
  status text NOT NULL DEFAULT 'scheduled',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "schedules_select_own" ON public.schedules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "schedules_insert_own" ON public.schedules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "schedules_update_own" ON public.schedules FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "schedules_delete_own" ON public.schedules FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_schedules_user ON public.schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_schedules_status ON public.schedules(status);
CREATE INDEX IF NOT EXISTS idx_schedules_start ON public.schedules(start_at);
CREATE TRIGGER set_schedules_updated_at BEFORE UPDATE ON public.schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. errands (canonical)
CREATE TABLE IF NOT EXISTS public.errands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  location text,
  priority text NOT NULL DEFAULT 'normal',
  estimated_minutes integer,
  combinable boolean NOT NULL DEFAULT true,
  due_date date,
  bundle_id uuid,
  notes text,
  status text NOT NULL DEFAULT 'pending',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.errands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "errands_select_own" ON public.errands FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "errands_insert_own" ON public.errands FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "errands_update_own" ON public.errands FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "errands_delete_own" ON public.errands FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_errands_user ON public.errands(user_id);
CREATE INDEX IF NOT EXISTS idx_errands_status ON public.errands(status);
CREATE INDEX IF NOT EXISTS idx_errands_due ON public.errands(due_date);
CREATE TRIGGER set_errands_updated_at BEFORE UPDATE ON public.errands
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. trips
CREATE TABLE IF NOT EXISTS public.trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  destination text,
  start_date date,
  end_date date,
  status text NOT NULL DEFAULT 'planned',
  itinerary jsonb NOT NULL DEFAULT '[]'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trips_select_own" ON public.trips FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "trips_insert_own" ON public.trips FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "trips_update_own" ON public.trips FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "trips_delete_own" ON public.trips FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_trips_user ON public.trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON public.trips(status);
CREATE INDEX IF NOT EXISTS idx_trips_start ON public.trips(start_date);
CREATE TRIGGER set_trips_updated_at BEFORE UPDATE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. reservations
CREATE TABLE IF NOT EXISTS public.reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  vendor text,
  reservation_at timestamptz,
  party_size integer,
  confirmation_code text,
  status text NOT NULL DEFAULT 'confirmed',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reservations_select_own" ON public.reservations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "reservations_insert_own" ON public.reservations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reservations_update_own" ON public.reservations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "reservations_delete_own" ON public.reservations FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_user ON public.reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_at ON public.reservations(reservation_at);
CREATE TRIGGER set_reservations_updated_at BEFORE UPDATE ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. household_tasks
CREATE TABLE IF NOT EXISTS public.household_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  category text,
  assigned_to text,
  due_date date,
  recurrence text,
  status text NOT NULL DEFAULT 'pending',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.household_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "household_tasks_select_own" ON public.household_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "household_tasks_insert_own" ON public.household_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "household_tasks_update_own" ON public.household_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "household_tasks_delete_own" ON public.household_tasks FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_household_tasks_user ON public.household_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_household_tasks_status ON public.household_tasks(status);
CREATE INDEX IF NOT EXISTS idx_household_tasks_due ON public.household_tasks(due_date);
CREATE TRIGGER set_household_tasks_updated_at BEFORE UPDATE ON public.household_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. event_plans
CREATE TABLE IF NOT EXISTS public.event_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  event_type text,
  event_date date,
  location text,
  guest_count integer,
  budget_cents integer,
  status text NOT NULL DEFAULT 'planning',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.event_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "event_plans_select_own" ON public.event_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "event_plans_insert_own" ON public.event_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "event_plans_update_own" ON public.event_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "event_plans_delete_own" ON public.event_plans FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_event_plans_user ON public.event_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_event_plans_status ON public.event_plans(status);
CREATE INDEX IF NOT EXISTS idx_event_plans_date ON public.event_plans(event_date);
CREATE TRIGGER set_event_plans_updated_at BEFORE UPDATE ON public.event_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. gift_plans
CREATE TABLE IF NOT EXISTS public.gift_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  recipient text NOT NULL,
  occasion text,
  target_date date,
  budget_cents integer,
  idea text,
  status text NOT NULL DEFAULT 'idea',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.gift_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gift_plans_select_own" ON public.gift_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "gift_plans_insert_own" ON public.gift_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "gift_plans_update_own" ON public.gift_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "gift_plans_delete_own" ON public.gift_plans FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_gift_plans_user ON public.gift_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_gift_plans_status ON public.gift_plans(status);
CREATE INDEX IF NOT EXISTS idx_gift_plans_date ON public.gift_plans(target_date);
CREATE TRIGGER set_gift_plans_updated_at BEFORE UPDATE ON public.gift_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. providers
CREATE TABLE IF NOT EXISTS public.providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  category text,
  contact_phone text,
  contact_email text,
  rating numeric,
  notes text,
  status text NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "providers_select_own" ON public.providers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "providers_insert_own" ON public.providers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "providers_update_own" ON public.providers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "providers_delete_own" ON public.providers FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_providers_user ON public.providers(user_id);
CREATE INDEX IF NOT EXISTS idx_providers_status ON public.providers(status);
CREATE TRIGGER set_providers_updated_at BEFORE UPDATE ON public.providers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 9. family_members
CREATE TABLE IF NOT EXISTS public.family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  display_name text NOT NULL,
  relationship text,
  birthdate date,
  notes text,
  status text NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "family_members_select_own" ON public.family_members FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "family_members_insert_own" ON public.family_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "family_members_update_own" ON public.family_members FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "family_members_delete_own" ON public.family_members FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_family_members_user ON public.family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_family_members_status ON public.family_members(status);
CREATE TRIGGER set_family_members_updated_at BEFORE UPDATE ON public.family_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 10. maintenance_items
CREATE TABLE IF NOT EXISTS public.maintenance_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  asset text NOT NULL,
  task text NOT NULL,
  next_due date,
  cadence text,
  provider_id uuid,
  status text NOT NULL DEFAULT 'pending',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.maintenance_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "maintenance_items_select_own" ON public.maintenance_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "maintenance_items_insert_own" ON public.maintenance_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "maintenance_items_update_own" ON public.maintenance_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "maintenance_items_delete_own" ON public.maintenance_items FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_items_user ON public.maintenance_items(user_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_items_status ON public.maintenance_items(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_items_due ON public.maintenance_items(next_due);
CREATE TRIGGER set_maintenance_items_updated_at BEFORE UPDATE ON public.maintenance_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 11. responsibilities
CREATE TABLE IF NOT EXISTS public.responsibilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  area text,
  owner text,
  cadence text,
  next_review date,
  status text NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.responsibilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "responsibilities_select_own" ON public.responsibilities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "responsibilities_insert_own" ON public.responsibilities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "responsibilities_update_own" ON public.responsibilities FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "responsibilities_delete_own" ON public.responsibilities FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_responsibilities_user ON public.responsibilities(user_id);
CREATE INDEX IF NOT EXISTS idx_responsibilities_status ON public.responsibilities(status);
CREATE INDEX IF NOT EXISTS idx_responsibilities_review ON public.responsibilities(next_review);
CREATE TRIGGER set_responsibilities_updated_at BEFORE UPDATE ON public.responsibilities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- Phase 24.1.C — Boardroom admin-RW separation
-- ============================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='boardroom_sessions') THEN
    EXECUTE 'CREATE POLICY "boardroom_sessions_admin_all" ON public.boardroom_sessions FOR ALL TO authenticated USING (public.has_role(auth.uid(),''admin''::public.app_role)) WITH CHECK (public.has_role(auth.uid(),''admin''::public.app_role))';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='boardroom_items') THEN
    EXECUTE 'CREATE POLICY "boardroom_items_admin_all" ON public.boardroom_items FOR ALL TO authenticated USING (public.has_role(auth.uid(),''admin''::public.app_role)) WITH CHECK (public.has_role(auth.uid(),''admin''::public.app_role))';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='boardroom_evidence') THEN
    EXECUTE 'CREATE POLICY "boardroom_evidence_admin_all" ON public.boardroom_evidence FOR ALL TO authenticated USING (public.has_role(auth.uid(),''admin''::public.app_role)) WITH CHECK (public.has_role(auth.uid(),''admin''::public.app_role))';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='boardroom_recommendations') THEN
    EXECUTE 'CREATE POLICY "boardroom_recommendations_admin_all" ON public.boardroom_recommendations FOR ALL TO authenticated USING (public.has_role(auth.uid(),''admin''::public.app_role)) WITH CHECK (public.has_role(auth.uid(),''admin''::public.app_role))';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='boardroom_decision_receipts') THEN
    EXECUTE 'CREATE POLICY "boardroom_decision_receipts_admin_all" ON public.boardroom_decision_receipts FOR ALL TO authenticated USING (public.has_role(auth.uid(),''admin''::public.app_role)) WITH CHECK (public.has_role(auth.uid(),''admin''::public.app_role))';
  END IF;
END $$;