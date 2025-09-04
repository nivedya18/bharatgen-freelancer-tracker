-- Change language column from TEXT to TEXT[] (array) in freelancers table
ALTER TABLE public.freelancers 
ALTER COLUMN language TYPE TEXT[] 
USING CASE 
    WHEN language IS NULL THEN NULL 
    ELSE ARRAY[language] 
END;

-- Update the comment for the column
COMMENT ON COLUMN public.freelancers.language IS 'Languages the freelancer works with (multiple allowed)';

-- Create a GIN index for better array search performance
CREATE INDEX IF NOT EXISTS idx_freelancers_languages_gin ON public.freelancers USING GIN(language);

-- Drop the old index if it exists
DROP INDEX IF EXISTS idx_freelancers_language;