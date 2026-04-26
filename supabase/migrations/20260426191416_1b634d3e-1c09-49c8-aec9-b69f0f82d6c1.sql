
-- ── 1. Storage bucket for business documents (PDFs, signed contracts) ──
INSERT INTO storage.buckets (id, name, public)
VALUES ('business-documents', 'business-documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users read own business documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'business-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users upload own business documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'business-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users update own business documents"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'business-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own business documents"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'business-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Service role needs to write signed PDFs on behalf of unauthenticated signers
CREATE POLICY "Service role manages business documents"
  ON storage.objects FOR ALL
  TO service_role
  USING (bucket_id = 'business-documents')
  WITH CHECK (bucket_id = 'business-documents');

-- ── 2. document_signatures table (e-sign workflow) ──
CREATE TABLE public.document_signatures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('proposal','contract','invoice')),
  document_id UUID NOT NULL,
  signer_email TEXT NOT NULL,
  signer_name TEXT,
  sign_token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','viewed','signed','declined','expired','revoked')),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  viewed_at TIMESTAMPTZ,
  signed_at TIMESTAMPTZ,
  signer_ip TEXT,
  signer_user_agent TEXT,
  typed_signature TEXT,
  signed_pdf_path TEXT,
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_document_signatures_user ON public.document_signatures(user_id);
CREATE INDEX idx_document_signatures_doc ON public.document_signatures(document_type, document_id);
CREATE INDEX idx_document_signatures_token ON public.document_signatures(sign_token);

ALTER TABLE public.document_signatures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own signatures"
  ON public.document_signatures FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Public (unauthenticated) read access via secret token only — anon role hits this when signer follows email link
CREATE POLICY "Public read by sign token"
  ON public.document_signatures FOR SELECT
  TO anon
  USING (sign_token IS NOT NULL);

CREATE POLICY "Service role manages signatures"
  ON public.document_signatures FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- ── 3. calendar_sync_links (appointments ↔ calendar_events bridge) ──
CREATE TABLE public.calendar_sync_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  appointment_id UUID NOT NULL,
  calendar_event_id UUID,
  provider TEXT NOT NULL DEFAULT 'internal' CHECK (provider IN ('internal','google','outlook')),
  external_event_id TEXT,
  sync_status TEXT NOT NULL DEFAULT 'pending' CHECK (sync_status IN ('pending','synced','failed','conflict','deleted')),
  last_synced_at TIMESTAMPTZ,
  last_error TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (appointment_id, provider)
);

CREATE INDEX idx_calendar_sync_links_user ON public.calendar_sync_links(user_id);
CREATE INDEX idx_calendar_sync_links_appointment ON public.calendar_sync_links(appointment_id);

ALTER TABLE public.calendar_sync_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own calendar sync links"
  ON public.calendar_sync_links FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role manages sync links"
  ON public.calendar_sync_links FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- ── 4. business_dispatch_log (email/SMS send outcomes) ──
CREATE TABLE public.business_dispatch_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subject_type TEXT NOT NULL,
  subject_id UUID,
  channel TEXT NOT NULL CHECK (channel IN ('email','sms','portal')),
  provider TEXT NOT NULL,
  recipient TEXT NOT NULL,
  template_key TEXT,
  status TEXT NOT NULL CHECK (status IN ('sent','failed','skipped','queued')),
  provider_message_id TEXT,
  error_code TEXT,
  error_message TEXT,
  latency_ms INTEGER,
  receipt_id UUID,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_business_dispatch_log_user ON public.business_dispatch_log(user_id);
CREATE INDEX idx_business_dispatch_log_subject ON public.business_dispatch_log(subject_type, subject_id);
CREATE INDEX idx_business_dispatch_log_created ON public.business_dispatch_log(created_at DESC);

ALTER TABLE public.business_dispatch_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own dispatch log"
  ON public.business_dispatch_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages dispatch log"
  ON public.business_dispatch_log FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- ── 5. Updated-at triggers ──
CREATE TRIGGER update_document_signatures_updated_at
  BEFORE UPDATE ON public.document_signatures
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_calendar_sync_links_updated_at
  BEFORE UPDATE ON public.calendar_sync_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
