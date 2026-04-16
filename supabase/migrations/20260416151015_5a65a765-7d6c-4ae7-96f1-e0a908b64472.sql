
-- License Keys table
CREATE TABLE public.licenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  license_key TEXT NOT NULL UNIQUE,
  product_tier TEXT NOT NULL DEFAULT 'standard',
  status TEXT NOT NULL DEFAULT 'active',
  max_devices INTEGER NOT NULL DEFAULT 3,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own licenses"
  ON public.licenses FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own licenses"
  ON public.licenses FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own licenses"
  ON public.licenses FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_licenses_updated_at
  BEFORE UPDATE ON public.licenses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- License Activations table
CREATE TABLE public.license_activations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  license_id UUID NOT NULL REFERENCES public.licenses(id) ON DELETE CASCADE,
  device_fingerprint TEXT NOT NULL,
  device_name TEXT,
  platform TEXT,
  activated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_heartbeat TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (license_id, device_fingerprint)
);

ALTER TABLE public.license_activations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activations"
  ON public.license_activations FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.licenses l WHERE l.id = license_id AND l.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own activations"
  ON public.license_activations FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.licenses l WHERE l.id = license_id AND l.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own activations"
  ON public.license_activations FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.licenses l WHERE l.id = license_id AND l.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own activations"
  ON public.license_activations FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.licenses l WHERE l.id = license_id AND l.user_id = auth.uid()
  ));

CREATE TRIGGER update_license_activations_updated_at
  BEFORE UPDATE ON public.license_activations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- License Audit Log (append-only)
CREATE TABLE public.license_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  license_id UUID NOT NULL REFERENCES public.licenses(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  device_fingerprint TEXT,
  ip_address TEXT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.license_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audit logs"
  ON public.license_audit_log FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.licenses l WHERE l.id = license_id AND l.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert audit logs for their licenses"
  ON public.license_audit_log FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.licenses l WHERE l.id = license_id AND l.user_id = auth.uid()
  ));

-- Indexes
CREATE INDEX idx_licenses_key ON public.licenses(license_key);
CREATE INDEX idx_licenses_user ON public.licenses(user_id);
CREATE INDEX idx_activations_license ON public.license_activations(license_id);
CREATE INDEX idx_activations_fingerprint ON public.license_activations(device_fingerprint);
CREATE INDEX idx_audit_license ON public.license_audit_log(license_id);
CREATE INDEX idx_audit_event ON public.license_audit_log(event);
