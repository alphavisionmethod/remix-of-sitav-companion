
-- Add missing columns to ai_inference_receipts
ALTER TABLE public.ai_inference_receipts
  ADD COLUMN IF NOT EXISTS provider TEXT,
  ADD COLUMN IF NOT EXISTS cost_estimate_cents INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS route_reason TEXT,
  ADD COLUMN IF NOT EXISTS verification_outcome TEXT;

-- Add missing columns to notification_delivery_receipts
ALTER TABLE public.notification_delivery_receipts
  ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'web',
  ADD COLUMN IF NOT EXISTS failure_reason TEXT,
  ADD COLUMN IF NOT EXISTS latency_ms INT,
  ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ;
