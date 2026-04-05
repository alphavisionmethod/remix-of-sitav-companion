-- Security fix: household_members — let members read own rows
CREATE POLICY "Members can read own membership"
  ON public.household_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Security fix: restrictive policy on user_roles INSERT
CREATE POLICY "Prevent self role grant"
  ON public.user_roles
  AS RESTRICTIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
  );