-- Create rate_card table for storing rate information
CREATE TABLE IF NOT EXISTS public.rate_card (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    freelancer_type TEXT NOT NULL CHECK (freelancer_type IN ('Linguist', 'Language Expert')),
    group_type TEXT NOT NULL CHECK (group_type IN ('Group A', 'Group B')),
    rate DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Create unique constraint to ensure only one rate per combination
ALTER TABLE public.rate_card
ADD CONSTRAINT unique_freelancer_group_combination
UNIQUE (freelancer_type, group_type);

-- Create indexes for better query performance
CREATE INDEX idx_rate_card_freelancer_type ON public.rate_card(freelancer_type);
CREATE INDEX idx_rate_card_group_type ON public.rate_card(group_type);

-- Add comments
COMMENT ON TABLE public.rate_card IS 'Stores rate card information for different freelancer types and groups';
COMMENT ON COLUMN public.rate_card.freelancer_type IS 'Type of freelancer: Linguist or Language Expert';
COMMENT ON COLUMN public.rate_card.group_type IS 'Group classification: Group A or Group B';
COMMENT ON COLUMN public.rate_card.rate IS 'Rate amount for this combination';

-- Grant permissions (no RLS, unrestricted access)
GRANT ALL ON TABLE public.rate_card TO anon;
GRANT ALL ON TABLE public.rate_card TO authenticated;
GRANT ALL ON TABLE public.rate_card TO service_role;