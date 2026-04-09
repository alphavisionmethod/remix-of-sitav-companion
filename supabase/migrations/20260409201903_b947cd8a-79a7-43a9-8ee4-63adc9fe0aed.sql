
-- Add data quality metadata columns to user_memory
ALTER TABLE public.user_memory
ADD COLUMN IF NOT EXISTS confirmed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS sensitivity text DEFAULT 'low' CHECK (sensitivity IN ('low', 'medium', 'high'));
