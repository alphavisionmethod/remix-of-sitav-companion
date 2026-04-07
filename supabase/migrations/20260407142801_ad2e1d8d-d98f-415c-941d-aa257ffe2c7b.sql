
-- 1. notes
CREATE TABLE public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  content TEXT DEFAULT '',
  folder TEXT DEFAULT 'General',
  tags TEXT[] DEFAULT '{}',
  pinned BOOLEAN DEFAULT false,
  starred BOOLEAN DEFAULT false,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own notes" ON public.notes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. media_items
CREATE TABLE public.media_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'file',
  mime_type TEXT,
  size_bytes BIGINT DEFAULT 0,
  url TEXT,
  storage_path TEXT,
  folder TEXT DEFAULT 'Uploads',
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own media" ON public.media_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_media_items_updated_at BEFORE UPDATE ON public.media_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. outcome_tracking
CREATE TABLE public.outcome_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metric TEXT NOT NULL DEFAULT 'custom',
  target_value NUMERIC DEFAULT 0,
  current_value NUMERIC DEFAULT 0,
  unit TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active',
  category TEXT DEFAULT 'general',
  interventions JSONB DEFAULT '[]',
  spillovers JSONB DEFAULT '[]',
  started_at TIMESTAMPTZ DEFAULT now(),
  target_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.outcome_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own outcomes" ON public.outcome_tracking FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_outcome_tracking_updated_at BEFORE UPDATE ON public.outcome_tracking FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. import_export_jobs
CREATE TABLE public.import_export_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  job_type TEXT NOT NULL DEFAULT 'import',
  file_name TEXT,
  file_size BIGINT DEFAULT 0,
  format TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  progress NUMERIC DEFAULT 0,
  records_processed INTEGER DEFAULT 0,
  records_total INTEGER DEFAULT 0,
  error_message TEXT,
  result_url TEXT,
  metadata JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.import_export_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own jobs" ON public.import_export_jobs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_import_export_jobs_updated_at BEFORE UPDATE ON public.import_export_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. calling_contacts
CREATE TABLE public.calling_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  email TEXT,
  value NUMERIC DEFAULT 0,
  priority TEXT DEFAULT 'medium',
  stage TEXT DEFAULT 'prospect',
  last_called_at TIMESTAMPTZ,
  next_call_at TIMESTAMPTZ,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.calling_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own calling contacts" ON public.calling_contacts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_calling_contacts_updated_at BEFORE UPDATE ON public.calling_contacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. call_logs
CREATE TABLE public.call_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  contact_id UUID REFERENCES public.calling_contacts(id) ON DELETE SET NULL,
  contact_name TEXT,
  duration_seconds INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed',
  outcome TEXT,
  notes TEXT,
  revenue_impact NUMERIC DEFAULT 0,
  recorded_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own call logs" ON public.call_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_call_logs_updated_at BEFORE UPDATE ON public.call_logs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. pack_installs
CREATE TABLE public.pack_installs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pack_id TEXT NOT NULL,
  pack_name TEXT,
  status TEXT NOT NULL DEFAULT 'installed',
  version TEXT DEFAULT '1.0.0',
  config JSONB DEFAULT '{}',
  installed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, pack_id)
);
ALTER TABLE public.pack_installs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own pack installs" ON public.pack_installs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_pack_installs_updated_at BEFORE UPDATE ON public.pack_installs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
