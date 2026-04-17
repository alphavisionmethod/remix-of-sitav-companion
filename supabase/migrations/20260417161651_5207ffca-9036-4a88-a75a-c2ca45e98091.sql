-- File metadata table (canonical truth for FilesAll, Overview, Processing, Search)
CREATE TABLE IF NOT EXISTS public.file_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  filename text NOT NULL,
  mime_type text,
  size_bytes bigint,
  classification text NOT NULL DEFAULT 'general',
  sensitivity text NOT NULL DEFAULT 'internal',
  status text NOT NULL DEFAULT 'classified',
  extracted_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_file_metadata_user ON public.file_metadata(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_file_metadata_status ON public.file_metadata(user_id, status);
CREATE INDEX IF NOT EXISTS idx_file_metadata_classification ON public.file_metadata(user_id, classification);

ALTER TABLE public.file_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own file metadata"
  ON public.file_metadata FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Users can insert their own file metadata"
  ON public.file_metadata FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own file metadata"
  ON public.file_metadata FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Users can delete their own file metadata"
  ON public.file_metadata FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER file_metadata_updated_at
  BEFORE UPDATE ON public.file_metadata
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- File settings (per-user JSON preferences)
CREATE TABLE IF NOT EXISTS public.file_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.file_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own file settings"
  ON public.file_settings FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Users can insert their own file settings"
  ON public.file_settings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own file settings"
  ON public.file_settings FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Users can delete their own file settings"
  ON public.file_settings FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER file_settings_updated_at
  BEFORE UPDATE ON public.file_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();