
CREATE TABLE public.webhook_delivery_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  target_url TEXT,
  payload JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  retry_count INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  event_type TEXT,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.webhook_delivery_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view webhook logs"
ON public.webhook_delivery_log FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update webhook logs"
ON public.webhook_delivery_log FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Service role can insert webhook logs"
ON public.webhook_delivery_log FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE INDEX idx_webhook_delivery_log_status ON public.webhook_delivery_log(status);
CREATE INDEX idx_webhook_delivery_log_created ON public.webhook_delivery_log(created_at DESC);

CREATE TRIGGER update_webhook_delivery_log_updated_at
BEFORE UPDATE ON public.webhook_delivery_log
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();
