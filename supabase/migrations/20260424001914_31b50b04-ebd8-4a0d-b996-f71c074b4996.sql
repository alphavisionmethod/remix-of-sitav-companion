-- Replace FOR ALL policies with explicit per-action policies
-- (Same effective rule: only the owning user can see or change their rows.)

-- Missions
DROP POLICY IF EXISTS "users_own_missions_all" ON public.sita_missions;
CREATE POLICY "missions_select" ON public.sita_missions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "missions_insert" ON public.sita_missions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "missions_update" ON public.sita_missions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "missions_delete" ON public.sita_missions FOR DELETE USING (auth.uid() = user_id);

-- Milestones
DROP POLICY IF EXISTS "users_own_milestones_all" ON public.sita_mission_milestones;
CREATE POLICY "milestones_select" ON public.sita_mission_milestones FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "milestones_insert" ON public.sita_mission_milestones FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "milestones_update" ON public.sita_mission_milestones FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "milestones_delete" ON public.sita_mission_milestones FOR DELETE USING (auth.uid() = user_id);

-- Council Votes
DROP POLICY IF EXISTS "users_own_votes_all" ON public.sita_council_votes;
CREATE POLICY "votes_select" ON public.sita_council_votes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "votes_insert" ON public.sita_council_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "votes_update" ON public.sita_council_votes FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "votes_delete" ON public.sita_council_votes FOR DELETE USING (auth.uid() = user_id);

-- App Open Log
DROP POLICY IF EXISTS "users_own_app_log_all" ON public.sita_app_open_log;
CREATE POLICY "app_log_select" ON public.sita_app_open_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "app_log_insert" ON public.sita_app_open_log FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "app_log_update" ON public.sita_app_open_log FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "app_log_delete" ON public.sita_app_open_log FOR DELETE USING (auth.uid() = user_id);

-- Journal Entries
DROP POLICY IF EXISTS "users_own_journal_all" ON public.sita_journal_entries;
CREATE POLICY "journal_select" ON public.sita_journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "journal_insert" ON public.sita_journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "journal_update" ON public.sita_journal_entries FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "journal_delete" ON public.sita_journal_entries FOR DELETE USING (auth.uid() = user_id);