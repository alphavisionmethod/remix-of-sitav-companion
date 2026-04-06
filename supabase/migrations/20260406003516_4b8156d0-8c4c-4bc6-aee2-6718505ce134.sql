-- Create consent_scope_records table (individual scope grants per consent entry)
CREATE TABLE public.consent_scope_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  consent_ledger_id UUID REFERENCES public.consent_ledger(id) ON DELETE CASCADE,
  scope TEXT NOT NULL,
  granted BOOLEAN NOT NULL DEFAULT true,
  grant_reason TEXT,
  revoked_at TIMESTAMPTZ,
  revoke_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.consent_scope_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own consent scope records" ON public.consent_scope_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_consent_scope_records_updated_at BEFORE UPDATE ON public.consent_scope_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
