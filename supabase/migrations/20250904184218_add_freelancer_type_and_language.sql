-- Add freelancer_type and language columns to freelancers table
ALTER TABLE public.freelancers
ADD COLUMN freelancer_type TEXT,
ADD COLUMN language TEXT;

-- Add check constraint for freelancer_type (same as master table)
ALTER TABLE public.freelancers
ADD CONSTRAINT freelancers_freelancer_type_check 
CHECK (freelancer_type IS NULL OR freelancer_type IN ('Linguist', 'Language Expert'));

-- Create indexes for better query performance
CREATE INDEX idx_freelancers_freelancer_type ON public.freelancers(freelancer_type);
CREATE INDEX idx_freelancers_language ON public.freelancers(language);

-- Populate the new columns from existing data in master table
-- This will set the most commonly used type and language for each freelancer
UPDATE public.freelancers f
SET 
    freelancer_type = (
        SELECT freelancer_type 
        FROM public.master m 
        WHERE m.freelancer_id = f.id 
        GROUP BY freelancer_type 
        ORDER BY COUNT(*) DESC 
        LIMIT 1
    ),
    language = (
        SELECT language 
        FROM public.master m 
        WHERE m.freelancer_id = f.id 
        GROUP BY language 
        ORDER BY COUNT(*) DESC 
        LIMIT 1
    )
WHERE EXISTS (
    SELECT 1 FROM public.master m WHERE m.freelancer_id = f.id
);

-- For freelancers without tasks yet, try to get from name-based matching
UPDATE public.freelancers f
SET 
    freelancer_type = (
        SELECT freelancer_type 
        FROM public.master m 
        WHERE LOWER(m.freelancer_name) = LOWER(f.name)
        GROUP BY freelancer_type 
        ORDER BY COUNT(*) DESC 
        LIMIT 1
    ),
    language = (
        SELECT language 
        FROM public.master m 
        WHERE LOWER(m.freelancer_name) = LOWER(f.name)
        GROUP BY language 
        ORDER BY COUNT(*) DESC 
        LIMIT 1
    )
WHERE f.freelancer_type IS NULL 
   OR f.language IS NULL;

-- Add comments explaining the columns
COMMENT ON COLUMN public.freelancers.freelancer_type IS 'Type of freelancer: Linguist or Language Expert';
COMMENT ON COLUMN public.freelancers.language IS 'Primary language the freelancer works with';