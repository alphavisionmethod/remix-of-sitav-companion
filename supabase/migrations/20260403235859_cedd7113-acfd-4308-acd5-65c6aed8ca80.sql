CREATE TABLE public.sita_receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  correlation_id TEXT NOT NULL,
  receipt_type TEXT NOT NULL,
  capability_id TEXT,
  domain TEXT,
  payload JSONB NOT NULL DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'created',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sita_receipts_user ON public.sita_receipts(user_id);
CREATE INDEX idx_sita_receipts_correlation ON public.sita_receipts(correlation_id);
CREATE INDEX idx_sita_receipts_type ON public.sita_receipts(receipt_type);

ALTER TABLE public.sita_receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own receipts"
  ON public.sita_receipts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own receipts"
  ON public.sita_receipts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.sita_proof_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  correlation_id TEXT NOT NULL,
  proof_type TEXT NOT NULL,
  receipt_id UUID REFERENCES public.sita_receipts(id) ON DELETE SET NULL,
  capability_id TEXT,
  evidence JSONB NOT NULL DEFAULT '{}',
  verification_status TEXT NOT NULL DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sita_proofs_user ON public.sita_proof_records(user_id);
CREATE INDEX idx_sita_proofs_correlation ON public.sita_proof_records(correlation_id);
CREATE INDEX idx_sita_proofs_receipt ON public.sita_proof_records(receipt_id);

ALTER TABLE public.sita_proof_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own proofs"
  ON public.sita_proof_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own proofs"
  ON public.sita_proof_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.sita_memory_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  privacy_tier TEXT NOT NULL DEFAULT 'internal',
  confidence NUMERIC(4,3) NOT NULL DEFAULT 1.000,
  source TEXT NOT NULL DEFAULT 'user',
  entity_id TEXT,
  entity_type TEXT,
  tags TEXT[] DEFAULT '{}',
  superseded_by UUID,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sita_memory_user ON public.sita_memory_entries(user_id);
CREATE INDEX idx_sita_memory_key ON public.sita_memory_entries(key);
CREATE INDEX idx_sita_memory_entity ON public.sita_memory_entries(entity_id);
CREATE INDEX idx_sita_memory_tags ON public.sita_memory_entries USING GIN(tags);

ALTER TABLE public.sita_memory_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own memory"
  ON public.sita_memory_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own memory"
  ON public.sita_memory_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own memory"
  ON public.sita_memory_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own memory"
  ON public.sita_memory_entries FOR DELETE
  USING (auth.uid() = user_id);

CREATE TABLE public.sita_memory_forget_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_id UUID NOT NULL,
  key TEXT NOT NULL,
  reason TEXT NOT NULL,
  requested_by TEXT NOT NULL,
  previous_tier TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sita_memory_forget_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own forget log"
  ON public.sita_memory_forget_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own forget log"
  ON public.sita_memory_forget_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_sita_receipts_updated_at
  BEFORE UPDATE ON public.sita_receipts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sita_memory_updated_at
  BEFORE UPDATE ON public.sita_memory_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();