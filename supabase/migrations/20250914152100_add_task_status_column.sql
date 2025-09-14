-- Add task_status column to master table
ALTER TABLE public.master
ADD COLUMN task_status text DEFAULT 'Planned' NOT NULL
CHECK (task_status IN ('Planned', 'Ongoing', 'Completed'));

-- Update existing records to have 'Planned' status
UPDATE public.master
SET task_status = 'Planned'
WHERE task_status IS NULL;

-- Add index for task_status for better query performance
CREATE INDEX idx_master_task_status ON public.master USING btree (task_status);

-- Add comment for documentation
COMMENT ON COLUMN public.master.task_status IS 'Task status: Planned, Ongoing, or Completed';