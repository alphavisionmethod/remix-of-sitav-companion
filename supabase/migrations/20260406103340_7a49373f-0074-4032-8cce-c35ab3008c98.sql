CREATE TABLE IF NOT EXISTS public.connector_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  connector_id UUID,
  service TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'success',
  records_synced INTEGER DEFAULT 0,
  duration_ms INTEGER,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.connector_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sync logs"
  ON public.connector_sync_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sync logs"
  ON public.connector_sync_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_connector_sync_logs_user ON public.connector_sync_logs(user_id);
CREATE INDEX idx_connector_sync_logs_connector ON public.connector_sync_logs(connector_id);