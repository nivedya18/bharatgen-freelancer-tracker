-- Drop the existing policy
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON freelancer_tasks;

-- Create a new policy that allows public access
CREATE POLICY "Allow public access"
  ON freelancer_tasks
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- This allows the app to work without authentication