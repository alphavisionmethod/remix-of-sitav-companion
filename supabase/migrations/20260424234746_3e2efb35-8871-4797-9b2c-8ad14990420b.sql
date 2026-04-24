-- Allow tenants to insert their own error_events rows. Mirrors the existing
-- "Users read their own error events" SELECT policy. Required for the new
-- Imports & Exports panel which writes scoped rows into error_events.
CREATE POLICY "Users insert their own error events"
  ON public.error_events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);