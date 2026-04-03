
-- ═══ Phase B: file_metadata table ═══
CREATE TABLE public.file_metadata (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  storage_path TEXT NOT NULL,
  filename TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  classification TEXT DEFAULT 'unclassified',
  extracted_data JSONB DEFAULT '{}'::jsonb,
  sensitivity TEXT NOT NULL DEFAULT 'internal',
  status TEXT NOT NULL DEFAULT 'uploaded',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.file_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own file metadata"
  ON public.file_metadata FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_file_metadata_updated_at
  BEFORE UPDATE ON public.file_metadata
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══ Phase E: agent_telemetry table ═══
CREATE TABLE public.agent_telemetry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  agent_id TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_telemetry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own agent telemetry"
  ON public.agent_telemetry FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_agent_telemetry_agent_id ON public.agent_telemetry (agent_id, recorded_at DESC);
CREATE INDEX idx_file_metadata_user ON public.file_metadata (user_id, created_at DESC);

-- Enable realtime for agent telemetry
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_telemetry;
