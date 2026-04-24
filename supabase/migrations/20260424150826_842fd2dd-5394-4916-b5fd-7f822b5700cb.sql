
-- Create private storage bucket for self-heal receipts uploaded by CI
INSERT INTO storage.buckets (id, name, public)
VALUES ('heal-receipts', 'heal-receipts', false)
ON CONFLICT (id) DO NOTHING;

-- Only admins can read receipts
CREATE POLICY "Admins can view heal receipts"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'heal-receipts'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Only admins can upload (CI uses a service-role key which bypasses RLS, this is for dashboard manual ops)
CREATE POLICY "Admins can upload heal receipts"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'heal-receipts'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can delete heal receipts"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'heal-receipts'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);
