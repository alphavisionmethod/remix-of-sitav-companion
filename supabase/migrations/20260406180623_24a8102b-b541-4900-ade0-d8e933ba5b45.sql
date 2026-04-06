
-- Create platform enum
CREATE TYPE public.push_platform AS ENUM ('web', 'ios', 'android', 'electron');

-- Device push tokens table
CREATE TABLE public.device_push_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform push_platform NOT NULL,
  token TEXT NOT NULL,
  endpoint TEXT,
  auth_key TEXT,
  p256dh TEXT,
  device_name TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, token)
);

-- Index for fast lookup by user
CREATE INDEX idx_device_push_tokens_user_active ON public.device_push_tokens(user_id) WHERE active = true;

-- Enable RLS
ALTER TABLE public.device_push_tokens ENABLE ROW LEVEL SECURITY;

-- RLS policies: users manage own tokens only
CREATE POLICY "Users can view own push tokens"
  ON public.device_push_tokens FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own push tokens"
  ON public.device_push_tokens FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own push tokens"
  ON public.device_push_tokens FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own push tokens"
  ON public.device_push_tokens FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE TRIGGER update_device_push_tokens_updated_at
  BEFORE UPDATE ON public.device_push_tokens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Dispatch function: calls push-dispatch edge function via pg_net
CREATE OR REPLACE FUNCTION public.dispatch_push_notification()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  v_supabase_url TEXT;
  v_service_key TEXT;
BEGIN
  -- Only dispatch for push channel notifications
  IF NEW.channel != 'push' THEN
    RETURN NEW;
  END IF;

  -- Get Supabase URL and service key from vault or env
  v_supabase_url := current_setting('app.settings.supabase_url', true);
  v_service_key := current_setting('app.settings.service_role_key', true);

  -- If pg_net is available, call the edge function
  IF v_supabase_url IS NOT NULL AND v_service_key IS NOT NULL THEN
    PERFORM net.http_post(
      url := v_supabase_url || '/functions/v1/push-dispatch',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_service_key
      ),
      body := jsonb_build_object(
        'notification_id', NEW.id,
        'user_id', NEW.user_id,
        'title', NEW.title,
        'body', NEW.body,
        'urgency', NEW.urgency,
        'action_url', NEW.action_url,
        'category', NEW.category
      )
    );
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Don't block notification insert if push dispatch fails
  RETURN NEW;
END;
$$;

-- Trigger on notifications_queue for push dispatch
CREATE TRIGGER trg_dispatch_push_notification
  AFTER INSERT ON public.notifications_queue
  FOR EACH ROW
  EXECUTE FUNCTION public.dispatch_push_notification();

-- Audit trigger for security
CREATE TRIGGER audit_device_push_tokens_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.device_push_tokens
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_change();
