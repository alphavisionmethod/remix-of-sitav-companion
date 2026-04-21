-- Create storage bucket for custom advisor avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('advisor-avatars', 'advisor-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Anyone can view advisor avatars
CREATE POLICY "Advisor avatars are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'advisor-avatars');

-- Users can upload their own advisor avatars
CREATE POLICY "Users can upload own advisor avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'advisor-avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own advisor avatars
CREATE POLICY "Users can update own advisor avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'advisor-avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own advisor avatars
CREATE POLICY "Users can delete own advisor avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'advisor-avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);