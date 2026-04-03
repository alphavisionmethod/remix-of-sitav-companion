
-- 1. Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL DEFAULT 'system',
  domain TEXT DEFAULT 'platform',
  title TEXT NOT NULL,
  body TEXT,
  urgency TEXT NOT NULL DEFAULT 'low',
  read BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users manage own notifications') THEN
    CREATE POLICY "Users manage own notifications"
      ON public.notifications FOR ALL
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications (user_id, read) WHERE read = false;

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- 2. Unique constraint on user_memory (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_memory_user_id_key_unique') THEN
    ALTER TABLE public.user_memory ADD CONSTRAINT user_memory_user_id_key_unique UNIQUE (user_id, key);
  END IF;
END $$;

-- 3. Create documents storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users view own documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users upload own documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users update own documents"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own documents"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 4. Audit log trigger function
CREATE OR REPLACE FUNCTION public.audit_sensitive_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, action, category, actor, target_type, target_id, severity, details)
  VALUES (
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
    TG_OP,
    'security',
    'trigger',
    TG_TABLE_NAME,
    CASE WHEN TG_OP = 'DELETE' THEN (OLD.id)::text ELSE (NEW.id)::text END,
    'high',
    jsonb_build_object(
      'table', TG_TABLE_NAME,
      'operation', TG_OP,
      'old', CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN row_to_json(OLD)::jsonb ELSE NULL END,
      'new', CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN row_to_json(NEW)::jsonb ELSE NULL END
    )
  );
  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$;

DROP TRIGGER IF EXISTS audit_approval_queue ON public.approval_queue;
CREATE TRIGGER audit_approval_queue
  AFTER INSERT OR UPDATE OR DELETE ON public.approval_queue
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_change();

DROP TRIGGER IF EXISTS audit_connector_credentials ON public.connector_credentials;
CREATE TRIGGER audit_connector_credentials
  AFTER INSERT OR UPDATE OR DELETE ON public.connector_credentials
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_change();

DROP TRIGGER IF EXISTS audit_policies ON public.policies;
CREATE TRIGGER audit_policies
  AFTER INSERT OR UPDATE OR DELETE ON public.policies
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_change();

DROP TRIGGER IF EXISTS audit_user_roles ON public.user_roles;
CREATE TRIGGER audit_user_roles
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_change();
