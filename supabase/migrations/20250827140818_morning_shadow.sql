/*
  # Create freelancer tasks table

  1. New Tables
    - `freelancer_tasks`
      - `id` (uuid, primary key)
      - `task` (text, required)
      - `model` (text, required)
      - `language` (text, required)
      - `freelancer_name` (text, required)
      - `freelancer_type` (text, required, check constraint)
      - `pay_rate_per_day` (decimal, required)
      - `total_time_taken` (decimal, required)
      - `start_date` (date, required)
      - `completion_date` (date, required)
      - `created_at` (timestamp, default now)
      - `updated_at` (timestamp, default now)

  2. Security
    - Enable RLS on `freelancer_tasks` table
    - Add policy for authenticated users to manage all data
*/

CREATE TABLE IF NOT EXISTS freelancer_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task TEXT NOT NULL,
  model TEXT NOT NULL,
  language TEXT NOT NULL,
  freelancer_name TEXT NOT NULL,
  freelancer_type TEXT NOT NULL CHECK (freelancer_type IN ('Linguist', 'Language Expert')),
  pay_rate_per_day DECIMAL(10,2) NOT NULL,
  total_time_taken DECIMAL(5,2) NOT NULL,
  start_date DATE NOT NULL,
  completion_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE freelancer_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for authenticated users"
  ON freelancer_tasks
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_freelancer_tasks_freelancer_name ON freelancer_tasks(freelancer_name);
CREATE INDEX IF NOT EXISTS idx_freelancer_tasks_language ON freelancer_tasks(language);
CREATE INDEX IF NOT EXISTS idx_freelancer_tasks_model ON freelancer_tasks(model);
CREATE INDEX IF NOT EXISTS idx_freelancer_tasks_dates ON freelancer_tasks(start_date, completion_date);