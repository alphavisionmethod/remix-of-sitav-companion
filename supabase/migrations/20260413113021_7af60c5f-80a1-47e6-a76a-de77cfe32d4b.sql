
-- AI inference receipts (proves BLK-001, BLK-003, BLK-005)
CREATE TABLE public.ai_inference_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  model TEXT NOT NULL,
  capability_id TEXT,
  prompt_family TEXT,
  input_tokens INT DEFAULT 0,
  output_tokens INT DEFAULT 0,
  latency_ms INT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.ai_inference_receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own ai_inference_receipts" ON public.ai_inference_receipts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own ai_inference_receipts" ON public.ai_inference_receipts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Connector OAuth flows (proves BLK-002)
CREATE TABLE public.connector_oauth_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider TEXT NOT NULL,
  status TEXT DEFAULT 'initiated',
  scopes TEXT[],
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.connector_oauth_flows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own connector_oauth_flows" ON public.connector_oauth_flows
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own connector_oauth_flows" ON public.connector_oauth_flows
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Notification delivery receipts (proves BLK-004)
CREATE TABLE public.notification_delivery_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  notification_id UUID,
  channel TEXT DEFAULT 'web_push',
  status TEXT DEFAULT 'pending',
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.notification_delivery_receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own notification_delivery_receipts" ON public.notification_delivery_receipts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own notification_delivery_receipts" ON public.notification_delivery_receipts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Connector sync runs (proves BLK-006)
CREATE TABLE public.connector_sync_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  connector TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  records_synced INT DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.connector_sync_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own connector_sync_runs" ON public.connector_sync_runs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own connector_sync_runs" ON public.connector_sync_runs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
