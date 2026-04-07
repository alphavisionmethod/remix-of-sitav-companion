
-- Add missing columns to communications if they don't exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='communications' AND column_name='channel') THEN
    ALTER TABLE communications ADD COLUMN channel text DEFAULT 'email';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='communications' AND column_name='direction') THEN
    ALTER TABLE communications ADD COLUMN direction text DEFAULT 'outbound';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='communications' AND column_name='preview') THEN
    ALTER TABLE communications ADD COLUMN preview text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='communications' AND column_name='contact_name') THEN
    ALTER TABLE communications ADD COLUMN contact_name text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='communications' AND column_name='domain') THEN
    ALTER TABLE communications ADD COLUMN domain text DEFAULT 'general';
  END IF;
END $$;

-- scenarios table
CREATE TABLE IF NOT EXISTS scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  category text DEFAULT 'general',
  parameters jsonb DEFAULT '{}',
  results jsonb DEFAULT '{}',
  status text DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own scenarios" ON scenarios
  FOR ALL TO authenticated USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_scenarios_updated_at
  BEFORE UPDATE ON scenarios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
