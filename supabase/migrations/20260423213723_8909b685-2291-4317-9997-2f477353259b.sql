-- ═══════════════════════════════════════════════════════════════
-- Personal Brain — Phase 7: Collaboration, Digests, Tools, Insights
-- ═══════════════════════════════════════════════════════════════

-- ── 1. pb_workspace_members ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pb_workspace_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.pb_workspaces(id) ON DELETE CASCADE,
  member_email TEXT NOT NULL,
  member_user_id UUID,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer','editor','owner')),
  status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited','active','revoked')),
  invite_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(18), 'hex'),
  invited_by UUID NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, member_email)
);

CREATE INDEX IF NOT EXISTS idx_pb_workspace_members_workspace ON public.pb_workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_pb_workspace_members_member_user ON public.pb_workspace_members(member_user_id);
CREATE INDEX IF NOT EXISTS idx_pb_workspace_members_token ON public.pb_workspace_members(invite_token);

ALTER TABLE public.pb_workspace_members ENABLE ROW LEVEL SECURITY;

-- Helper: is the caller an active member (or owner) of the workspace?
CREATE OR REPLACE FUNCTION public.pb_is_workspace_member(_user_id UUID, _workspace_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.pb_workspaces WHERE id = _workspace_id AND user_id = _user_id
  ) OR EXISTS (
    SELECT 1 FROM public.pb_workspace_members
    WHERE workspace_id = _workspace_id
      AND member_user_id = _user_id
      AND status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.pb_is_workspace_owner(_user_id UUID, _workspace_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.pb_workspaces WHERE id = _workspace_id AND user_id = _user_id
  );
$$;

-- Members can read rows where they are owner or the invited member
CREATE POLICY "members_select_own_or_workspace"
  ON public.pb_workspace_members FOR SELECT
  USING (
    member_user_id = auth.uid()
    OR public.pb_is_workspace_owner(auth.uid(), workspace_id)
  );

-- Only the workspace owner can invite
CREATE POLICY "owner_inserts_invitations"
  ON public.pb_workspace_members FOR INSERT
  WITH CHECK (public.pb_is_workspace_owner(auth.uid(), workspace_id));

-- Owner can update any row in their workspace; member can update their own row (to accept)
CREATE POLICY "owner_or_member_updates"
  ON public.pb_workspace_members FOR UPDATE
  USING (
    public.pb_is_workspace_owner(auth.uid(), workspace_id)
    OR member_user_id = auth.uid()
  );

-- Only owner can remove
CREATE POLICY "owner_deletes_invitations"
  ON public.pb_workspace_members FOR DELETE
  USING (public.pb_is_workspace_owner(auth.uid(), workspace_id));

CREATE TRIGGER trg_pb_workspace_members_updated
  BEFORE UPDATE ON public.pb_workspace_members
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 2. pb_digests ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pb_digests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  period TEXT NOT NULL DEFAULT 'daily' CHECK (period IN ('daily','weekly')),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  title TEXT NOT NULL DEFAULT 'Brain digest',
  summary TEXT NOT NULL DEFAULT '',
  highlights JSONB NOT NULL DEFAULT '[]'::jsonb,
  source_counts JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'ready' CHECK (status IN ('draft','ready','dismissed')),
  generated_by_model TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pb_digests_user_period ON public.pb_digests(user_id, period_end DESC);

ALTER TABLE public.pb_digests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "digests_owner_select" ON public.pb_digests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "digests_owner_insert" ON public.pb_digests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "digests_owner_update" ON public.pb_digests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "digests_owner_delete" ON public.pb_digests FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER trg_pb_digests_updated
  BEFORE UPDATE ON public.pb_digests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 3. pb_tools ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pb_tools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tool_key TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  kind TEXT NOT NULL DEFAULT 'custom' CHECK (kind IN ('web_search','calendar','file_search','memory_search','custom')),
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  enabled BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, tool_key)
);

CREATE INDEX IF NOT EXISTS idx_pb_tools_user ON public.pb_tools(user_id);

ALTER TABLE public.pb_tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tools_owner_select" ON public.pb_tools FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tools_owner_insert" ON public.pb_tools FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tools_owner_update" ON public.pb_tools FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "tools_owner_delete" ON public.pb_tools FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER trg_pb_tools_updated
  BEFORE UPDATE ON public.pb_tools
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 4. pb_insights_signals ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pb_insights_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  kind TEXT NOT NULL DEFAULT 'pattern' CHECK (kind IN ('pattern','blocker','win','theme','suggestion')),
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  confidence NUMERIC NOT NULL DEFAULT 0.6,
  source_refs JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','pinned','dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pb_insights_user_status ON public.pb_insights_signals(user_id, status, created_at DESC);

ALTER TABLE public.pb_insights_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "insights_owner_select" ON public.pb_insights_signals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insights_owner_insert" ON public.pb_insights_signals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "insights_owner_update" ON public.pb_insights_signals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "insights_owner_delete" ON public.pb_insights_signals FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER trg_pb_insights_updated
  BEFORE UPDATE ON public.pb_insights_signals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 5. Extend pb_workspaces / pb_chats / pb_messages with shared-member read access ─

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='pb_workspaces' AND policyname='pb_workspaces_member_select'
  ) THEN
    CREATE POLICY "pb_workspaces_member_select"
      ON public.pb_workspaces FOR SELECT
      USING (public.pb_is_workspace_member(auth.uid(), id));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='pb_chats' AND policyname='pb_chats_member_select'
  ) THEN
    CREATE POLICY "pb_chats_member_select"
      ON public.pb_chats FOR SELECT
      USING (
        workspace_id IS NOT NULL
        AND public.pb_is_workspace_member(auth.uid(), workspace_id)
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='pb_messages' AND policyname='pb_messages_member_select'
  ) THEN
    CREATE POLICY "pb_messages_member_select"
      ON public.pb_messages FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.pb_chats c
          WHERE c.id = pb_messages.chat_id
            AND c.workspace_id IS NOT NULL
            AND public.pb_is_workspace_member(auth.uid(), c.workspace_id)
        )
      );
  END IF;
END $$;