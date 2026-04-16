-- Mobile push token lifecycle table
CREATE TABLE public.mobile_push_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  os TEXT NOT NULL CHECK (os IN ('ios', 'android', 'web')),
  transport TEXT NOT NULL CHECK (transport IN ('apns', 'fcm', 'web-push')),
  token TEXT NOT NULL,
  device_id TEXT,
  app_version TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  rotated_from UUID REFERENCES public.mobile_push_tokens(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'rotated', 'revoked', 'expired')),
  last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, transport, token)
);

CREATE INDEX idx_mobile_push_tokens_user_id ON public.mobile_push_tokens(user_id);
CREATE INDEX idx_mobile_push_tokens_status ON public.mobile_push_tokens(status) WHERE status = 'active';
CREATE INDEX idx_mobile_push_tokens_transport ON public.mobile_push_tokens(transport, os);

ALTER TABLE public.mobile_push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own push tokens"
ON public.mobile_push_tokens FOR SELECT
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Users insert own push tokens"
ON public.mobile_push_tokens FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own push tokens"
ON public.mobile_push_tokens FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users delete own push tokens"
ON public.mobile_push_tokens FOR DELETE
USING (auth.uid() = user_id);

CREATE TRIGGER update_mobile_push_tokens_updated_at
BEFORE UPDATE ON public.mobile_push_tokens
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();