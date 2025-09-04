-- Add task_group column to master table (will be first column after id in display)
ALTER TABLE public.master
ADD COLUMN task_group TEXT;

-- Rename task column to task_description
ALTER TABLE public.master
RENAME COLUMN task TO task_description;

-- Create index on task_group for better query performance
CREATE INDEX idx_master_task_group ON public.master(task_group);

-- Add comment explaining the new column
COMMENT ON COLUMN public.master.task_group IS 'Group or category for related tasks';
COMMENT ON COLUMN public.master.task_description IS 'Detailed description of the task (renamed from task)';