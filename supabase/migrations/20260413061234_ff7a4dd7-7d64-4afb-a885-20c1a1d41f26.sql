DROP POLICY "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Authenticated users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);