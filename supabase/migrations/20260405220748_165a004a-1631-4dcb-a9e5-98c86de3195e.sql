-- File settings for persisting Files Center configuration
CREATE TABLE public.file_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  auto_classify BOOLEAN NOT NULL DEFAULT true,
  auto_extract BOOLEAN NOT NULL DEFAULT true,
  generate_suggestions BOOLEAN NOT NULL DEFAULT true,
  auto_link BOOLEAN NOT NULL DEFAULT false,
  boardroom_attach BOOLEAN NOT NULL DEFAULT true,
  default_sensitivity TEXT NOT NULL DEFAULT 'internal',
  default_retention TEXT NOT NULL DEFAULT '7 years',
  memory_write_permission TEXT NOT NULL DEFAULT 'allowed_with_review',
  governed_threshold TEXT[] NOT NULL DEFAULT ARRAY['medical', 'legal', 'identity'],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.file_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own file settings" ON public.file_settings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_file_settings_updated_at BEFORE UPDATE ON public.file_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();