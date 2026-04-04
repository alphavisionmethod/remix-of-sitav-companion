
-- Boot phase logs for trusted boot sequence audit trail
CREATE TABLE public.boot_phase_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  device_id text NOT NULL,
  session_id text NOT NULL,
  phase text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  started_at timestamptz,
  completed_at timestamptz,
  duration_ms integer,
  error text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.boot_phase_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own boot logs"
  ON public.boot_phase_logs FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Handoff packets for cross-surface continuity
CREATE TABLE public.handoff_packets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  from_surface text NOT NULL,
  to_surface text NOT NULL,
  from_advisor text,
  to_advisor text,
  domain text NOT NULL,
  context jsonb DEFAULT '{}'::jsonb,
  memory_keys text[] DEFAULT '{}'::text[],
  unresolved_items text[] DEFAULT '{}'::text[],
  priority text NOT NULL DEFAULT 'medium',
  accepted boolean NOT NULL DEFAULT false,
  accepted_at timestamptz,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.handoff_packets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own handoff packets"
  ON public.handoff_packets FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Enable realtime for handoff packets
ALTER PUBLICATION supabase_realtime ADD TABLE public.handoff_packets;
