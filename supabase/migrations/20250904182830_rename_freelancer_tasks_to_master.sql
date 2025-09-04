-- Rename freelancer_tasks table to master
ALTER TABLE public.freelancer_tasks RENAME TO master;

-- Update indexes to reflect new table name
ALTER INDEX idx_freelancer_tasks_dates RENAME TO idx_master_dates;
ALTER INDEX idx_freelancer_tasks_freelancer_name RENAME TO idx_master_freelancer_name;
ALTER INDEX idx_freelancer_tasks_language RENAME TO idx_master_language;
ALTER INDEX idx_freelancer_tasks_model RENAME TO idx_master_model;

-- Update constraint name
ALTER TABLE public.master RENAME CONSTRAINT freelancer_tasks_freelancer_type_check TO master_freelancer_type_check;
ALTER TABLE public.master RENAME CONSTRAINT freelancer_tasks_pkey TO master_pkey;