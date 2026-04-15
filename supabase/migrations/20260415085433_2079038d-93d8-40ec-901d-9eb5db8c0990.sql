
-- ══════════════════════════════════════════════════════════════
-- SITA OS — Intelligent Differentiation Layer: Batch 1
-- 3 new tables: device_mesh_peers, context_graph_snapshots, action_safety_classifications
-- ══════════════════════════════════════════════════════════════

-- 1. Device Mesh Peers
CREATE TABLE public.device_mesh_peers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  device_name TEXT NOT NULL,
  device_type TEXT NOT NULL DEFAULT 'desktop',
  role TEXT NOT NULL DEFAULT 'anchor',
  capabilities TEXT[] NOT NULL DEFAULT '{}',
  trust_score NUMERIC NOT NULL DEFAULT 0.5,
  proximity_status TEXT NOT NULL DEFAULT 'remote',
  last_handshake TIMESTAMPTZ,
  mesh_group TEXT DEFAULT 'default',
  is_online BOOLEAN NOT NULL DEFAULT false,
  platform TEXT DEFAULT 'web',
  os_version TEXT,
  battery_level NUMERIC,
  network_type TEXT DEFAULT 'unknown',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.device_mesh_peers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own mesh peers" ON public.device_mesh_peers
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_device_mesh_peers_updated_at
  BEFORE UPDATE ON public.device_mesh_peers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_device_mesh_peers_user ON public.device_mesh_peers(user_id);
CREATE INDEX idx_device_mesh_peers_online ON public.device_mesh_peers(user_id, is_online);

-- 2. Context Graph Snapshots
CREATE TABLE public.context_graph_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  snapshot_type TEXT NOT NULL DEFAULT 'periodic',
  context_data JSONB NOT NULL DEFAULT '{}',
  active_signals TEXT[] NOT NULL DEFAULT '{}',
  freshness_score NUMERIC NOT NULL DEFAULT 1.0,
  workspace_id TEXT,
  device_id TEXT,
  cognitive_load NUMERIC DEFAULT 0,
  active_mode TEXT DEFAULT 'default',
  signal_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.context_graph_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own context snapshots" ON public.context_graph_snapshots
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_context_graph_snapshots_updated_at
  BEFORE UPDATE ON public.context_graph_snapshots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_context_graph_user ON public.context_graph_snapshots(user_id);
CREATE INDEX idx_context_graph_type ON public.context_graph_snapshots(user_id, snapshot_type);

-- 3. Action Safety Classifications
CREATE TABLE public.action_safety_classifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action_key TEXT NOT NULL,
  safety_class TEXT NOT NULL DEFAULT 'passive',
  trust_threshold NUMERIC NOT NULL DEFAULT 0.5,
  requires_confirmation BOOLEAN NOT NULL DEFAULT false,
  requires_audit BOOLEAN NOT NULL DEFAULT true,
  confirmation_prompt TEXT,
  rollback_capable BOOLEAN NOT NULL DEFAULT false,
  max_autonomy_level INTEGER NOT NULL DEFAULT 3,
  policy_overrides JSONB DEFAULT '{}',
  description TEXT,
  domain TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, action_key)
);

ALTER TABLE public.action_safety_classifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own safety classifications" ON public.action_safety_classifications
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_action_safety_updated_at
  BEFORE UPDATE ON public.action_safety_classifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_action_safety_user ON public.action_safety_classifications(user_id);
CREATE INDEX idx_action_safety_class ON public.action_safety_classifications(user_id, safety_class);
