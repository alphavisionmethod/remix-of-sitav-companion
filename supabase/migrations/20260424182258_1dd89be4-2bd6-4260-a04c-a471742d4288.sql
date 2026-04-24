UPDATE storage.buckets
SET public = false
WHERE id IN ('advisor-avatars', 'advisor-portraits', 'app-assets');