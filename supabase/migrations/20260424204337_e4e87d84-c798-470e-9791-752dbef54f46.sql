-- Phase 7D — Drop overly-broad app-assets read policy
-- Public reads remain via app_assets_public_prefix_read (public/) and
-- app_assets_branding_authenticated_read (branding/, marketing/).
DROP POLICY IF EXISTS "app-assets single object read" ON storage.objects;