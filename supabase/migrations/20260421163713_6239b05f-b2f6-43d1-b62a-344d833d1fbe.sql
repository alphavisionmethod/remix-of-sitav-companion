-- Create storage bucket for advisor portraits
INSERT INTO storage.buckets (id, name, public)
VALUES ('advisor-portraits', 'advisor-portraits', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access
CREATE POLICY "Advisor portraits are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'advisor-portraits');

-- Users can upload to their own folder
CREATE POLICY "Users can upload their own advisor portraits"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'advisor-portraits' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can update their own portraits
CREATE POLICY "Users can update their own advisor portraits"
ON storage.objects FOR UPDATE
USING (bucket_id = 'advisor-portraits' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can delete their own portraits
CREATE POLICY "Users can delete their own advisor portraits"
ON storage.objects FOR DELETE
USING (bucket_id = 'advisor-portraits' AND auth.uid()::text = (storage.foldername(name))[1]);