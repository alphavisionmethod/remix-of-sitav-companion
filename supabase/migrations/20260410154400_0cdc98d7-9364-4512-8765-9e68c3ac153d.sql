ALTER TABLE public.os_action_lineage
ADD COLUMN IF NOT EXISTS linked_projection_ids text[] DEFAULT '{}';