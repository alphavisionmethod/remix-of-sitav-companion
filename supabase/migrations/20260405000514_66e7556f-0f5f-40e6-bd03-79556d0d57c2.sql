-- Fix: household_shared_items — members can read shared items
CREATE POLICY "Household members can read shared items"
  ON public.household_shared_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members hm
      WHERE hm.household_id = household_shared_items.household_id
        AND hm.user_id = auth.uid()
    )
  );

-- Fix: household_tasks — assignees can read tasks assigned to them
CREATE POLICY "Assignees can read assigned tasks"
  ON public.household_tasks
  FOR SELECT
  TO authenticated
  USING (assigned_to = auth.uid());

CREATE POLICY "Assignees can update assigned tasks"
  ON public.household_tasks
  FOR UPDATE
  TO authenticated
  USING (assigned_to = auth.uid());

-- Fix: household_tasks — household members can read all tasks
CREATE POLICY "Household members can read household tasks"
  ON public.household_tasks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members hm
      WHERE hm.household_id = household_tasks.household_id
        AND hm.user_id = auth.uid()
    )
  );