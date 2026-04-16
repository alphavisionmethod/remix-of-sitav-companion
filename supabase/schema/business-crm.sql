-- ═══════════════════════════════════════════════════════════════
-- SITA OS — Synthesized schema for: business-crm
-- AUTO-GENERATED from supabase/migrations/. DO NOT EDIT.
-- Regenerate via: npx tsx scripts/db/generate/synthesize-domain-schemas.ts
-- Source migrations: 3
-- Last generated: 2026-04-16T21:35:49.933Z
-- ═══════════════════════════════════════════════════════════════

-- ── 20260414142936_a0fb61a5-3766-4606-b38a-778979092bbb.sql ──
-- CRM Contacts
CREATE TABLE public.crm_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  email text,
  phone text,
  title text,
  lifecycle_stage text NOT NULL DEFAULT 'lead',
  status text NOT NULL DEFAULT 'active',
  owner text,
  source text,
  health_score integer DEFAULT 50,
  avatar_url text,
  address text,
  city text,
  state text,
  country text,
  website text,
  tags text[] DEFAULT '{}',
  custom_fields jsonb DEFAULT '{}',
  last_contacted_at timestamptz,
  next_follow_up_at timestamptz,
  import_source text,
  import_job_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own crm_contacts" ON public.crm_contacts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_crm_contacts_user ON public.crm_contacts(user_id);
CREATE INDEX idx_crm_contacts_email ON public.crm_contacts(user_id, email);
CREATE INDEX idx_crm_contacts_stage ON public.crm_contacts(user_id, lifecycle_stage);
CREATE TRIGGER update_crm_contacts_updated_at BEFORE UPDATE ON public.crm_contacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- CRM Companies
CREATE TABLE public.crm_companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  domain text,
  industry text,
  size text,
  annual_revenue numeric,
  health_score integer DEFAULT 50,
  owner text,
  phone text,
  address text,
  city text,
  state text,
  country text,
  website text,
  tags text[] DEFAULT '{}',
  custom_fields jsonb DEFAULT '{}',
  notes text,
  import_source text,
  import_job_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.crm_companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own crm_companies" ON public.crm_companies FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_crm_companies_user ON public.crm_companies(user_id);
CREATE TRIGGER update_crm_companies_updated_at BEFORE UPDATE ON public.crm_companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Contact-Company link
CREATE TABLE public.crm_contact_company (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  contact_id uuid NOT NULL REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.crm_companies(id) ON DELETE CASCADE,
  role text,
  is_primary boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(contact_id, company_id)
);
ALTER TABLE public.crm_contact_company ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own crm_contact_company" ON public.crm_contact_company FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Pipeline Stages
CREATE TABLE public.crm_pipeline_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  color text DEFAULT '#6366f1',
  is_won boolean DEFAULT false,
  is_lost boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.crm_pipeline_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own crm_pipeline_stages" ON public.crm_pipeline_stages FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_crm_pipeline_stages_updated_at BEFORE UPDATE ON public.crm_pipeline_stages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Opportunities
CREATE TABLE public.crm_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  value numeric DEFAULT 0,
  stage text NOT NULL DEFAULT 'Discovery',
  stage_id uuid REFERENCES public.crm_pipeline_stages(id) ON DELETE SET NULL,
  probability integer DEFAULT 20,
  expected_close_date date,
  source text,
  owner text,
  contact_id uuid REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
  company_id uuid REFERENCES public.crm_companies(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'open',
  lost_reason text,
  won_at timestamptz,
  lost_at timestamptz,
  notes text,
  tags text[] DEFAULT '{}',
  custom_fields jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.crm_opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own crm_opportunities" ON public.crm_opportunities FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_crm_opportunities_user ON public.crm_opportunities(user_id);
CREATE INDEX idx_crm_opportunities_stage ON public.crm_opportunities(user_id, stage);
CREATE TRIGGER update_crm_opportunities_updated_at BEFORE UPDATE ON public.crm_opportunities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Communications
CREATE TABLE public.crm_communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  contact_id uuid REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  company_id uuid REFERENCES public.crm_companies(id) ON DELETE SET NULL,
  opportunity_id uuid REFERENCES public.crm_opportunities(id) ON DELETE SET NULL,
  comm_type text NOT NULL DEFAULT 'note',
  direction text DEFAULT 'outbound',
  subject text,
  content text,
  channel text,
  outcome text,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.crm_communications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own crm_communications" ON public.crm_communications FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_crm_communications_contact ON public.crm_communications(user_id, contact_id);
CREATE TRIGGER update_crm_communications_updated_at BEFORE UPDATE ON public.crm_communications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tasks
CREATE TABLE public.crm_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending',
  priority text DEFAULT 'medium',
  due_date timestamptz,
  completed_at timestamptz,
  contact_id uuid REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
  company_id uuid REFERENCES public.crm_companies(id) ON DELETE SET NULL,
  opportunity_id uuid REFERENCES public.crm_opportunities(id) ON DELETE SET NULL,
  task_type text DEFAULT 'follow-up',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.crm_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own crm_tasks" ON public.crm_tasks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_crm_tasks_user ON public.crm_tasks(user_id, status);
CREATE TRIGGER update_crm_tasks_updated_at BEFORE UPDATE ON public.crm_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Notes
CREATE TABLE public.crm_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text,
  content text NOT NULL DEFAULT '',
  note_type text DEFAULT 'general',
  is_pinned boolean DEFAULT false,
  entity_type text,
  entity_id uuid,
  contact_id uuid REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
  company_id uuid REFERENCES public.crm_companies(id) ON DELETE SET NULL,
  opportunity_id uuid REFERENCES public.crm_opportunities(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.crm_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own crm_notes" ON public.crm_notes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_crm_notes_updated_at BEFORE UPDATE ON public.crm_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tags
CREATE TABLE public.crm_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  color text DEFAULT '#6366f1',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);
ALTER TABLE public.crm_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own crm_tags" ON public.crm_tags FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Import Jobs
CREATE TABLE public.crm_import_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  source text NOT NULL DEFAULT 'csv',
  file_name text,
  status text NOT NULL DEFAULT 'pending',
  total_rows integer DEFAULT 0,
  created_count integer DEFAULT 0,
  updated_count integer DEFAULT 0,
  skipped_count integer DEFAULT 0,
  error_count integer DEFAULT 0,
  field_mappings jsonb DEFAULT '{}',
  errors jsonb DEFAULT '[]',
  stats jsonb DEFAULT '{}',
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.crm_import_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own crm_import_jobs" ON public.crm_import_jobs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_crm_import_jobs_updated_at BEFORE UPDATE ON public.crm_import_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Segments
CREATE TABLE public.crm_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  filter_config jsonb NOT NULL DEFAULT '{}',
  is_system boolean DEFAULT false,
  contact_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.crm_segments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own crm_segments" ON public.crm_segments FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_crm_segments_updated_at BEFORE UPDATE ON public.crm_segments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Merge Log
CREATE TABLE public.crm_merge_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  entity_type text NOT NULL DEFAULT 'contact',
  winner_id uuid NOT NULL,
  loser_id uuid NOT NULL,
  merged_fields jsonb DEFAULT '{}',
  merge_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.crm_merge_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own crm_merge_log" ON public.crm_merge_log FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── 20260414152813_6b8d39c7-4e44-4a2b-8476-fcf0817b57d0.sql ──
CREATE TABLE public.crm_automations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  trigger_type TEXT NOT NULL DEFAULT 'manual',
  trigger_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
  actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  delay_minutes INTEGER DEFAULT 0,
  trust_gate TEXT NOT NULL DEFAULT 'suggested',
  status TEXT NOT NULL DEFAULT 'draft',
  target_entity TEXT NOT NULL DEFAULT 'contact',
  runs INTEGER NOT NULL DEFAULT 0,
  last_run_at TIMESTAMP WITH TIME ZONE,
  execution_log JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.crm_automations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own crm_automations"
  ON public.crm_automations
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_crm_automations_updated_at
  BEFORE UPDATE ON public.crm_automations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ── 20260414181447_976210a1-e6a2-4b6d-a97e-3ca47db3237e.sql ──
CREATE TABLE public.business_onboarding (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  onboarding_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.business_onboarding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own business_onboarding"
  ON public.business_onboarding
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_business_onboarding_updated_at
  BEFORE UPDATE ON public.business_onboarding
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
