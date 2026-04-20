
-- ──────────────────────────────────────────────────────────────
-- Marketing website: waitlist, beta, investors, donations, press
-- ──────────────────────────────────────────────────────────────

-- Reuse existing public.update_updated_at_column if present; create if not
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Helper: random short code
CREATE OR REPLACE FUNCTION public.gen_short_code(len int DEFAULT 6)
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  out text := '';
  i int;
BEGIN
  FOR i IN 1..len LOOP
    out := out || substr(chars, 1 + floor(random()*length(chars))::int, 1);
  END LOOP;
  RETURN out;
END;
$$;

-- ──────────────────────────────────────────────────────────────
-- 1. waitlist_signups
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.waitlist_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  referral_code text NOT NULL,
  referred_by text,
  position integer NOT NULL,
  confirmed_at timestamptz,
  source text DEFAULT 'website',
  user_agent text,
  ip_country text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS waitlist_signups_email_lower_uniq
  ON public.waitlist_signups (lower(email));
CREATE UNIQUE INDEX IF NOT EXISTS waitlist_signups_referral_code_uniq
  ON public.waitlist_signups (referral_code);
CREATE INDEX IF NOT EXISTS waitlist_signups_position_idx
  ON public.waitlist_signups (position);

ALTER TABLE public.waitlist_signups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can join waitlist" ON public.waitlist_signups;
CREATE POLICY "Anyone can join waitlist"
  ON public.waitlist_signups FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins read waitlist" ON public.waitlist_signups;
CREATE POLICY "Admins read waitlist"
  ON public.waitlist_signups FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins update waitlist" ON public.waitlist_signups;
CREATE POLICY "Admins update waitlist"
  ON public.waitlist_signups FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins delete waitlist" ON public.waitlist_signups;
CREATE POLICY "Admins delete waitlist"
  ON public.waitlist_signups FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Auto position + referral code
CREATE OR REPLACE FUNCTION public.waitlist_assign_defaults()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  next_pos integer;
  candidate text;
  attempt int := 0;
BEGIN
  IF NEW.position IS NULL OR NEW.position = 0 THEN
    SELECT COALESCE(MAX(position), 0) + 1 INTO next_pos FROM public.waitlist_signups;
    NEW.position := next_pos;
  END IF;
  IF NEW.referral_code IS NULL OR length(NEW.referral_code) < 4 THEN
    LOOP
      attempt := attempt + 1;
      candidate := public.gen_short_code(6);
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.waitlist_signups WHERE referral_code = candidate);
      EXIT WHEN attempt > 8;
    END LOOP;
    NEW.referral_code := candidate;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS waitlist_assign_defaults_trg ON public.waitlist_signups;
CREATE TRIGGER waitlist_assign_defaults_trg
  BEFORE INSERT ON public.waitlist_signups
  FOR EACH ROW EXECUTE FUNCTION public.waitlist_assign_defaults();

DROP TRIGGER IF EXISTS waitlist_set_updated_at ON public.waitlist_signups;
CREATE TRIGGER waitlist_set_updated_at
  BEFORE UPDATE ON public.waitlist_signups
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ──────────────────────────────────────────────────────────────
-- 2. beta_applications
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.beta_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  full_name text NOT NULL,
  country text,
  profile jsonb NOT NULL DEFAULT '{}'::jsonb,
  device_targets text[] NOT NULL DEFAULT '{}',
  use_case text,
  technical_level text,
  why text,
  invite_code text,
  score integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'received',
  source text DEFAULT 'website',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS beta_applications_email_idx
  ON public.beta_applications (lower(email));
CREATE INDEX IF NOT EXISTS beta_applications_score_idx
  ON public.beta_applications (score DESC);

ALTER TABLE public.beta_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can apply for beta" ON public.beta_applications;
CREATE POLICY "Anyone can apply for beta"
  ON public.beta_applications FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins read beta apps" ON public.beta_applications;
CREATE POLICY "Admins read beta apps"
  ON public.beta_applications FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins update beta apps" ON public.beta_applications;
CREATE POLICY "Admins update beta apps"
  ON public.beta_applications FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins delete beta apps" ON public.beta_applications;
CREATE POLICY "Admins delete beta apps"
  ON public.beta_applications FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP TRIGGER IF EXISTS beta_set_updated_at ON public.beta_applications;
CREATE TRIGGER beta_set_updated_at
  BEFORE UPDATE ON public.beta_applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ──────────────────────────────────────────────────────────────
-- 3. investor_requests
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.investor_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_name text NOT NULL,
  contact_name text NOT NULL,
  contact_role text,
  email text NOT NULL,
  ticket_band text NOT NULL,
  jurisdiction text,
  stage_interest text,
  notes text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.investor_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can request investor info" ON public.investor_requests;
CREATE POLICY "Anyone can request investor info"
  ON public.investor_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins read investor requests" ON public.investor_requests;
CREATE POLICY "Admins read investor requests"
  ON public.investor_requests FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins update investor requests" ON public.investor_requests;
CREATE POLICY "Admins update investor requests"
  ON public.investor_requests FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins delete investor requests" ON public.investor_requests;
CREATE POLICY "Admins delete investor requests"
  ON public.investor_requests FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP TRIGGER IF EXISTS investor_set_updated_at ON public.investor_requests;
CREATE TRIGGER investor_set_updated_at
  BEFORE UPDATE ON public.investor_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ──────────────────────────────────────────────────────────────
-- 4. donations  (Stripe-backed)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount_cents integer NOT NULL CHECK (amount_cents > 0),
  currency text NOT NULL DEFAULT 'usd',
  donor_email text,
  donor_name text,
  message text,
  is_public boolean NOT NULL DEFAULT true,
  receipt_hash text,
  stripe_session_id text,
  status text NOT NULL DEFAULT 'pending',  -- pending | paid | failed | refunded
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS donations_status_idx ON public.donations (status);
CREATE UNIQUE INDEX IF NOT EXISTS donations_stripe_session_uniq
  ON public.donations (stripe_session_id) WHERE stripe_session_id IS NOT NULL;

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Anyone can create a pending donation row (the checkout edge function does this server-side
-- with anon key, so we permit anon insert)
DROP POLICY IF EXISTS "Anyone can start a donation" ON public.donations;
CREATE POLICY "Anyone can start a donation"
  ON public.donations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins read donations" ON public.donations;
CREATE POLICY "Admins read donations"
  ON public.donations FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins update donations" ON public.donations;
CREATE POLICY "Admins update donations"
  ON public.donations FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP TRIGGER IF EXISTS donations_set_updated_at ON public.donations;
CREATE TRIGGER donations_set_updated_at
  BEFORE UPDATE ON public.donations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Public-safe view for /proof — only paid + is_public, redacted fields
CREATE OR REPLACE VIEW public.public_donations_wall
WITH (security_invoker = true) AS
SELECT
  id,
  CASE
    WHEN amount_cents < 2500 THEN 'supporter'
    WHEN amount_cents < 10000 THEN 'believer'
    WHEN amount_cents < 50000 THEN 'patron'
    ELSE 'builder'
  END AS tier,
  CASE WHEN is_public THEN donor_name ELSE NULL END AS donor_name,
  CASE WHEN is_public THEN message ELSE NULL END AS message,
  receipt_hash,
  paid_at
FROM public.donations
WHERE status = 'paid' AND is_public = true;

GRANT SELECT ON public.public_donations_wall TO anon, authenticated;

-- ──────────────────────────────────────────────────────────────
-- 5. press_inquiries
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.press_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet text NOT NULL,
  contact_name text NOT NULL,
  email text NOT NULL,
  beat text,
  message text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.press_inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit press inquiry" ON public.press_inquiries;
CREATE POLICY "Anyone can submit press inquiry"
  ON public.press_inquiries FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins read press" ON public.press_inquiries;
CREATE POLICY "Admins read press"
  ON public.press_inquiries FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins update press" ON public.press_inquiries;
CREATE POLICY "Admins update press"
  ON public.press_inquiries FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP TRIGGER IF EXISTS press_set_updated_at ON public.press_inquiries;
CREATE TRIGGER press_set_updated_at
  BEFORE UPDATE ON public.press_inquiries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
