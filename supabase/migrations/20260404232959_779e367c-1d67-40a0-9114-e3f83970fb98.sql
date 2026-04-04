
-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL DEFAULT 'system',
  domain TEXT DEFAULT 'platform',
  title TEXT NOT NULL, body TEXT,
  urgency TEXT NOT NULL DEFAULT 'low',
  read BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users manage own notifications') THEN
    CREATE POLICY "Users manage own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications (user_id, read) WHERE read = false;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Documents storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Users view own documents" ON storage.objects FOR SELECT USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users upload own documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users update own documents" ON storage.objects FOR UPDATE USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own documents" ON storage.objects FOR DELETE USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Audit sensitive change function
CREATE OR REPLACE FUNCTION public.audit_sensitive_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, action, category, actor, target_type, target_id, severity, details)
  VALUES (
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
    TG_OP, 'security', 'trigger', TG_TABLE_NAME,
    CASE WHEN TG_OP = 'DELETE' THEN (OLD.id)::text ELSE (NEW.id)::text END,
    'high',
    jsonb_build_object('table', TG_TABLE_NAME, 'operation', TG_OP,
      'old', CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN row_to_json(OLD)::jsonb ELSE NULL END,
      'new', CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN row_to_json(NEW)::jsonb ELSE NULL END)
  );
  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$;

DROP TRIGGER IF EXISTS audit_approval_queue ON public.approval_queue;
CREATE TRIGGER audit_approval_queue AFTER INSERT OR UPDATE OR DELETE ON public.approval_queue FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_change();
DROP TRIGGER IF EXISTS audit_connector_credentials ON public.connector_credentials;
CREATE TRIGGER audit_connector_credentials AFTER INSERT OR UPDATE OR DELETE ON public.connector_credentials FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_change();
DROP TRIGGER IF EXISTS audit_policies ON public.policies;
CREATE TRIGGER audit_policies AFTER INSERT OR UPDATE OR DELETE ON public.policies FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_change();
DROP TRIGGER IF EXISTS audit_user_roles ON public.user_roles;
CREATE TRIGGER audit_user_roles AFTER INSERT OR UPDATE OR DELETE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_change();

-- File metadata
CREATE TABLE public.file_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, storage_path TEXT NOT NULL, filename TEXT NOT NULL,
  mime_type TEXT, size_bytes BIGINT, classification TEXT DEFAULT 'unclassified',
  extracted_data JSONB DEFAULT '{}'::jsonb, sensitivity TEXT NOT NULL DEFAULT 'internal',
  status TEXT NOT NULL DEFAULT 'uploaded',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.file_metadata ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own file metadata" ON public.file_metadata FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_file_metadata_updated_at BEFORE UPDATE ON public.file_metadata FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_file_metadata_user ON public.file_metadata (user_id, created_at DESC);

-- Agent telemetry
CREATE TABLE public.agent_telemetry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, agent_id TEXT NOT NULL, metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL DEFAULT 0, metadata JSONB DEFAULT '{}'::jsonb,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.agent_telemetry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own agent telemetry" ON public.agent_telemetry FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_agent_telemetry_agent_id ON public.agent_telemetry (agent_id, recorded_at DESC);
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_telemetry;

-- Households
CREATE TABLE public.households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL, name TEXT NOT NULL, type TEXT NOT NULL DEFAULT 'family',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own households" ON public.households FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE TRIGGER update_households_updated_at BEFORE UPDATE ON public.households FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.household_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  user_id UUID, display_name TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'member',
  permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  invited_at TIMESTAMPTZ NOT NULL DEFAULT now(), accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage household members" ON public.household_members FOR ALL
  USING (EXISTS (SELECT 1 FROM public.households h WHERE h.id = household_id AND h.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.households h WHERE h.id = household_id AND h.owner_id = auth.uid()));

CREATE TABLE public.household_shared_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL, item_id UUID NOT NULL, shared_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.household_shared_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage household shared items" ON public.household_shared_items FOR ALL
  USING (EXISTS (SELECT 1 FROM public.households h WHERE h.id = household_id AND h.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.households h WHERE h.id = household_id AND h.owner_id = auth.uid()));

-- Advisor registry
CREATE TABLE public.advisor_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, advisor_type TEXT NOT NULL, display_name TEXT NOT NULL,
  domain TEXT NOT NULL DEFAULT 'general', capabilities JSONB NOT NULL DEFAULT '[]'::jsonb,
  trust_threshold NUMERIC NOT NULL DEFAULT 0.7, explanation_style TEXT NOT NULL DEFAULT 'concise',
  memory_scope TEXT NOT NULL DEFAULT 'session', tool_access JSONB NOT NULL DEFAULT '[]'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.advisor_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own advisor registry" ON public.advisor_registry FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_advisor_registry_updated_at BEFORE UPDATE ON public.advisor_registry FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Digital twins
CREATE TABLE public.digital_twins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL, health_score INTEGER NOT NULL DEFAULT 50,
  revenue_at_risk INTEGER NOT NULL DEFAULT 0, predicted_revenue INTEGER NOT NULL DEFAULT 0,
  churn_probability NUMERIC(3,2) NOT NULL DEFAULT 0.00,
  last_activity TEXT DEFAULT 'unknown',
  segment TEXT NOT NULL DEFAULT 'smb', trend TEXT NOT NULL DEFAULT 'stable',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.digital_twins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own digital twins" ON public.digital_twins FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_digital_twins_updated_at BEFORE UPDATE ON public.digital_twins FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Agent backend tables
CREATE TABLE IF NOT EXISTS public.agent_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, agent_id TEXT NOT NULL, schedule_type TEXT NOT NULL DEFAULT 'interval',
  cron_expression TEXT, interval_ms BIGINT DEFAULT 300000,
  next_run_at TIMESTAMPTZ DEFAULT now(), last_run_at TIMESTAMPTZ,
  enabled BOOLEAN DEFAULT true, metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.agent_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own schedules" ON public.agent_schedules FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.agent_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, agent_id TEXT NOT NULL, signal_type TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb, priority TEXT DEFAULT 'normal',
  processed BOOLEAN DEFAULT false, processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.agent_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own signals" ON public.agent_signals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.agent_action_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, agent_id TEXT NOT NULL, action_type TEXT NOT NULL,
  input_data JSONB DEFAULT '{}'::jsonb, output_data JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'completed', duration_ms INTEGER,
  error_message TEXT, created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.agent_action_receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own receipts" ON public.agent_action_receipts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.household_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, household_id UUID REFERENCES public.households(id) ON DELETE CASCADE,
  title TEXT NOT NULL, assigned_to UUID, status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium', due_date TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.household_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own household tasks" ON public.household_tasks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Setup sessions
CREATE TABLE IF NOT EXISTS public.setup_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  current_step TEXT NOT NULL DEFAULT 'language',
  completed_steps TEXT[] DEFAULT '{}',
  preferences JSONB DEFAULT '{}'::jsonb,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.setup_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own setup sessions" ON public.setup_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own setup sessions" ON public.setup_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own setup sessions" ON public.setup_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own setup sessions" ON public.setup_sessions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Trust state events
CREATE TABLE IF NOT EXISTS public.trust_state_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL, domain TEXT DEFAULT 'system',
  description TEXT, impact_score NUMERIC(5,2) DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.trust_state_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own trust events" ON public.trust_state_events FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own trust events" ON public.trust_state_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Encrypted secrets
CREATE TABLE IF NOT EXISTS public.encrypted_secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL, encrypted_value TEXT NOT NULL,
  service TEXT, metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, name)
);
ALTER TABLE public.encrypted_secrets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own secrets" ON public.encrypted_secrets FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- AI cost ledger
CREATE TABLE IF NOT EXISTS public.ai_cost_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  model TEXT NOT NULL, provider TEXT DEFAULT 'openai',
  input_tokens INTEGER DEFAULT 0, output_tokens INTEGER DEFAULT 0,
  cost_cents NUMERIC(10,4) DEFAULT 0, purpose TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.ai_cost_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own AI costs" ON public.ai_cost_ledger FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own AI costs" ON public.ai_cost_ledger FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Capital allocations
CREATE TABLE IF NOT EXISTS public.capital_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL, amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  period TEXT DEFAULT 'monthly', notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.capital_allocations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own allocations" ON public.capital_allocations FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Communication log
CREATE TABLE IF NOT EXISTS public.communication_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  channel TEXT NOT NULL, direction TEXT DEFAULT 'outbound',
  contact_name TEXT, subject TEXT, body TEXT,
  status TEXT DEFAULT 'sent', metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.communication_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own comm log" ON public.communication_log FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Sovereign exports
CREATE TABLE IF NOT EXISTS public.sovereign_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  export_type TEXT NOT NULL, format TEXT DEFAULT 'json',
  status TEXT DEFAULT 'pending', file_path TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(), completed_at TIMESTAMPTZ
);
ALTER TABLE public.sovereign_exports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own exports" ON public.sovereign_exports FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Boot phase logs
CREATE TABLE IF NOT EXISTS public.boot_phase_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  phase TEXT NOT NULL, status TEXT DEFAULT 'started',
  duration_ms INTEGER, metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.boot_phase_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own boot logs" ON public.boot_phase_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Goals
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL, description TEXT, category TEXT DEFAULT 'general',
  target_value NUMERIC, current_value NUMERIC DEFAULT 0,
  unit TEXT, deadline DATE, status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own goals" ON public.goals FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Playbook metrics
CREATE TABLE IF NOT EXISTS public.playbook_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  playbook_id TEXT NOT NULL, metric_name TEXT NOT NULL,
  metric_value NUMERIC DEFAULT 0, period TEXT DEFAULT 'daily',
  metadata JSONB DEFAULT '{}'::jsonb,
  recorded_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.playbook_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own playbook metrics" ON public.playbook_metrics FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- SITA memory entries
CREATE TABLE IF NOT EXISTS public.sita_memory_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL DEFAULT 'context', key TEXT NOT NULL,
  value JSONB DEFAULT '{}'::jsonb, source TEXT DEFAULT 'user',
  confidence NUMERIC(3,2) DEFAULT 1.0, expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.sita_memory_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sita memory" ON public.sita_memory_entries FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- SITA memory forget log
CREATE TABLE IF NOT EXISTS public.sita_memory_forget_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  memory_id UUID, category TEXT, key TEXT, reason TEXT,
  forgotten_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.sita_memory_forget_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own forget log" ON public.sita_memory_forget_log FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- SITA proof records
CREATE TABLE IF NOT EXISTS public.sita_proof_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL, domain TEXT DEFAULT 'system',
  evidence JSONB DEFAULT '{}'::jsonb, hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.sita_proof_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sita proofs" ON public.sita_proof_records FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- SITA receipts
CREATE TABLE IF NOT EXISTS public.sita_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, domain TEXT DEFAULT 'system',
  payload JSONB DEFAULT '{}'::jsonb, hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.sita_receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sita receipts" ON public.sita_receipts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Metrics snapshots
CREATE TABLE IF NOT EXISTS public.metrics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  domain TEXT NOT NULL, metrics JSONB DEFAULT '{}'::jsonb,
  period TEXT DEFAULT 'daily',
  snapshot_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.metrics_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own metrics" ON public.metrics_snapshots FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Handoff packets
CREATE TABLE IF NOT EXISTS public.handoff_packets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  from_agent TEXT NOT NULL, to_agent TEXT NOT NULL,
  context JSONB DEFAULT '{}'::jsonb, status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.handoff_packets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own handoffs" ON public.handoff_packets FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
