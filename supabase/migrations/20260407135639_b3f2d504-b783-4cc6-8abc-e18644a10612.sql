
-- Fix documents bucket storage policies: public → authenticated
DROP POLICY IF EXISTS "Users view own documents" ON storage.objects;
CREATE POLICY "Users view own documents" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'documents' AND (auth.uid())::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users upload own documents" ON storage.objects;
CREATE POLICY "Users upload own documents" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documents' AND (auth.uid())::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users update own documents" ON storage.objects;
CREATE POLICY "Users update own documents" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'documents' AND (auth.uid())::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users delete own documents" ON storage.objects;
CREATE POLICY "Users delete own documents" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'documents' AND (auth.uid())::text = (storage.foldername(name))[1]);
