-- Add freelancer_id column to master table
ALTER TABLE public.master 
ADD COLUMN freelancer_id UUID;

-- Create function to get or create freelancer
CREATE OR REPLACE FUNCTION get_or_create_freelancer(p_name TEXT)
RETURNS UUID AS $$
DECLARE
    v_freelancer_id UUID;
BEGIN
    -- Try to find existing freelancer
    SELECT id INTO v_freelancer_id
    FROM public.freelancers
    WHERE LOWER(name) = LOWER(p_name);
    
    -- If not found, create new freelancer
    IF v_freelancer_id IS NULL THEN
        INSERT INTO public.freelancers (name)
        VALUES (p_name)
        RETURNING id INTO v_freelancer_id;
    END IF;
    
    RETURN v_freelancer_id;
END;
$$ LANGUAGE plpgsql;

-- Populate freelancer_id for existing records
DO $$
DECLARE
    task_record RECORD;
BEGIN
    FOR task_record IN 
        SELECT DISTINCT freelancer_name 
        FROM public.master 
        WHERE freelancer_name IS NOT NULL
    LOOP
        -- Insert freelancer if doesn't exist
        INSERT INTO public.freelancers (name)
        VALUES (task_record.freelancer_name)
        ON CONFLICT (name) DO NOTHING;
    END LOOP;
    
    -- Update master table with freelancer_ids
    UPDATE public.master m
    SET freelancer_id = f.id
    FROM public.freelancers f
    WHERE LOWER(m.freelancer_name) = LOWER(f.name);
END $$;

-- Add foreign key constraint
ALTER TABLE public.master
ADD CONSTRAINT master_freelancer_id_fkey 
FOREIGN KEY (freelancer_id) 
REFERENCES public.freelancers(id)
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- Create index for better performance
CREATE INDEX idx_master_freelancer_id ON public.master(freelancer_id);

-- Create a trigger to auto-populate freelancer_id when freelancer_name is provided
CREATE OR REPLACE FUNCTION auto_populate_freelancer_id()
RETURNS TRIGGER AS $$
BEGIN
    -- If freelancer_name is provided but freelancer_id is not
    IF NEW.freelancer_name IS NOT NULL AND NEW.freelancer_id IS NULL THEN
        NEW.freelancer_id := get_or_create_freelancer(NEW.freelancer_name);
    END IF;
    
    -- If freelancer_id is provided, update freelancer_name to match
    IF NEW.freelancer_id IS NOT NULL THEN
        SELECT name INTO NEW.freelancer_name
        FROM public.freelancers
        WHERE id = NEW.freelancer_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_populate_freelancer_trigger
BEFORE INSERT OR UPDATE ON public.master
FOR EACH ROW
EXECUTE FUNCTION auto_populate_freelancer_id();

-- Add comment explaining the relationship
COMMENT ON COLUMN public.master.freelancer_id IS 'Foreign key reference to freelancers table. Auto-populated from freelancer_name if not provided.';