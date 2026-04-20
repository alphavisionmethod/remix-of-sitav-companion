
-- ═══════════════════════════════════════════════════════════════
-- Wave 5.1 — Lock down app-assets storage bucket
-- ═══════════════════════════════════════════════════════════════
-- The app-assets bucket previously allowed unrestricted SELECT to
-- the `public` and `anon` roles, enabling enumeration of every file.
-- We scope public reads to the `public/` prefix only; everything else
-- requires a signed URL.

DROP POLICY IF EXISTS "Public read app-assets objects" ON storage.objects;
DROP POLICY IF EXISTS "Public can read app-assets by URL" ON storage.objects;
DROP POLICY IF EXISTS "app_assets_storage_public_read" ON storage.objects;

-- Public prefix is the ONLY publicly listable / readable area.
CREATE POLICY "app_assets_public_prefix_read"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'app-assets'
  AND (storage.foldername(name))[1] = 'public'
);

-- Authenticated users may read any non-public object only via signed URL flow
-- handled by the service role; we still allow authenticated SELECT for the
-- admin-managed branding/marketing assets under `branding/` namespace.
CREATE POLICY "app_assets_branding_authenticated_read"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'app-assets'
  AND (storage.foldername(name))[1] IN ('branding', 'marketing')
);

-- Service role retains full access (no policy needed; service_role bypasses RLS).

-- ═══════════════════════════════════════════════════════════════
-- Wave 5.2 — Tighten 6 service-role ALL true policies
-- ═══════════════════════════════════════════════════════════════
-- These already TO service_role, but the linter correctly flags
-- USING (true) WITH CHECK (true) as catastrophic if the TO clause
-- ever drifts. We replace with explicit auth.role() guards so the
-- policy is self-defending even if grants change.

DROP POLICY IF EXISTS "Service role can manage advisor proof packs"
  ON public.advisor_action_proof_packs;
CREATE POLICY "Service role can manage advisor proof packs"
ON public.advisor_action_proof_packs
FOR ALL TO service_role
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "service role manages compliance evidence"
  ON public.compliance_evidence;
CREATE POLICY "service role manages compliance evidence"
ON public.compliance_evidence
FOR ALL TO service_role
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can manage cron run receipts"
  ON public.cron_run_receipts;
CREATE POLICY "Service role can manage cron run receipts"
ON public.cron_run_receipts
FOR ALL TO service_role
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can manage evidence graph edges"
  ON public.evidence_graph_edges;
CREATE POLICY "Service role can manage evidence graph edges"
ON public.evidence_graph_edges
FOR ALL TO service_role
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can manage evidence graph nodes"
  ON public.evidence_graph_nodes;
CREATE POLICY "Service role can manage evidence graph nodes"
ON public.evidence_graph_nodes
FOR ALL TO service_role
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can manage install receipts"
  ON public.installed_apps_receipts;
CREATE POLICY "Service role can manage install receipts"
ON public.installed_apps_receipts
FOR ALL TO service_role
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
