
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS dismissed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS target_app TEXT,
  ADD COLUMN IF NOT EXISTS target_module TEXT,
  ADD COLUMN IF NOT EXISTS signal_type TEXT DEFAULT 'info',
  ADD COLUMN IF NOT EXISTS icon_name TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read) WHERE NOT dismissed;
