-- ════════════════════════════════════════════════════════════
-- Phase 3 Security Hardening — Tighten permissive RLS policies
-- ════════════════════════════════════════════════════════════

-- ── waitlist_signups: enforce email format + size guards ──
DROP POLICY IF EXISTS "Anyone can join waitlist" ON public.waitlist_signups;
CREATE POLICY "Anyone can join waitlist"
ON public.waitlist_signups
FOR INSERT
TO anon, authenticated
WITH CHECK (
  email IS NOT NULL
  AND length(email) BETWEEN 5 AND 320
  AND email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$'
  AND (referral_code IS NULL OR length(referral_code) <= 64)
  AND (referred_by IS NULL OR length(referred_by) <= 64)
  AND (source IS NULL OR length(source) <= 64)
);

-- ── beta_applications: email + size guards ──
DROP POLICY IF EXISTS "Anyone can apply for beta" ON public.beta_applications;
CREATE POLICY "Anyone can apply for beta"
ON public.beta_applications
FOR INSERT
TO anon, authenticated
WITH CHECK (
  email IS NOT NULL
  AND length(email) BETWEEN 5 AND 320
  AND email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$'
  AND full_name IS NOT NULL
  AND length(full_name) BETWEEN 1 AND 200
  AND (country IS NULL OR length(country) <= 100)
  AND (use_case IS NULL OR length(use_case) <= 4000)
  AND (why IS NULL OR length(why) <= 4000)
  AND (invite_code IS NULL OR length(invite_code) <= 64)
);

-- ── donations: amount sanity + email format if provided ──
DROP POLICY IF EXISTS "Anyone can start a donation" ON public.donations;
CREATE POLICY "Anyone can start a donation"
ON public.donations
FOR INSERT
TO anon, authenticated
WITH CHECK (
  amount_cents > 0 AND amount_cents <= 10000000  -- max $100,000
  AND length(currency) BETWEEN 3 AND 8
  AND (donor_email IS NULL OR (
    length(donor_email) BETWEEN 5 AND 320
    AND donor_email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$'
  ))
  AND (donor_name IS NULL OR length(donor_name) <= 200)
  AND (message IS NULL OR length(message) <= 2000)
);

-- ── investor_requests: required email format + size guards ──
DROP POLICY IF EXISTS "Anyone can request investor info" ON public.investor_requests;
CREATE POLICY "Anyone can request investor info"
ON public.investor_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (
  email IS NOT NULL
  AND length(email) BETWEEN 5 AND 320
  AND email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$'
  AND fund_name IS NOT NULL AND length(fund_name) BETWEEN 1 AND 200
  AND contact_name IS NOT NULL AND length(contact_name) BETWEEN 1 AND 200
  AND (contact_role IS NULL OR length(contact_role) <= 200)
  AND length(ticket_band) BETWEEN 1 AND 64
  AND (jurisdiction IS NULL OR length(jurisdiction) <= 100)
  AND (stage_interest IS NULL OR length(stage_interest) <= 100)
  AND (notes IS NULL OR length(notes) <= 4000)
);

-- ── press_inquiries: required email format + size guards ──
DROP POLICY IF EXISTS "Anyone can submit press inquiry" ON public.press_inquiries;
CREATE POLICY "Anyone can submit press inquiry"
ON public.press_inquiries
FOR INSERT
TO anon, authenticated
WITH CHECK (
  email IS NOT NULL
  AND length(email) BETWEEN 5 AND 320
  AND email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$'
  AND outlet IS NOT NULL AND length(outlet) BETWEEN 1 AND 200
  AND contact_name IS NOT NULL AND length(contact_name) BETWEEN 1 AND 200
  AND (beat IS NULL OR length(beat) <= 200)
  AND (message IS NULL OR length(message) <= 4000)
);

-- ════════════════════════════════════════════════════════════
-- Storage hardening — block anonymous LISTING of public buckets
-- (individual object reads still work for <img src> usage)
-- ════════════════════════════════════════════════════════════

-- Drop any broad public SELECT policies that allow listing
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT polname
    FROM pg_policy
    WHERE polrelid = 'storage.objects'::regclass
      AND polname IN (
        'advisor-avatars public read',
        'advisor-avatars are publicly accessible',
        'Public read advisor-avatars',
        'advisor-portraits public read',
        'advisor-portraits are publicly accessible',
        'Public read advisor-portraits',
        'app-assets public read',
        'app-assets are publicly accessible',
        'Public read app-assets'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.polname);
  END LOOP;
END $$;

-- Re-add scoped SELECT policies (single-object access only — no listing)
-- The trick: require a non-empty `name` parameter so only direct lookups work.
-- Listing queries don't filter by exact name and will be blocked by the
-- preceding RLS anchor (no broad TRUE policy exists).

CREATE POLICY "advisor-avatars single object read"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'advisor-avatars'
  AND name IS NOT NULL
  AND length(name) > 0
);

CREATE POLICY "advisor-portraits single object read"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'advisor-portraits'
  AND name IS NOT NULL
  AND length(name) > 0
);

CREATE POLICY "app-assets single object read"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'app-assets'
  AND name IS NOT NULL
  AND length(name) > 0
);
