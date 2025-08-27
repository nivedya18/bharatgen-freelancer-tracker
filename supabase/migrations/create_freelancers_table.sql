-- Create freelancers table
CREATE TABLE IF NOT EXISTS freelancers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for better performance on name searches
CREATE INDEX IF NOT EXISTS idx_freelancers_name ON freelancers(name);

-- Disable RLS for simplicity (public access)
ALTER TABLE freelancers DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON freelancers TO anon;
GRANT ALL ON freelancers TO authenticated;