-- Improve the trigger to handle edge cases better
CREATE OR REPLACE FUNCTION auto_populate_freelancer_id()
RETURNS TRIGGER AS $$
BEGIN
    -- Trim whitespace from freelancer_name
    IF NEW.freelancer_name IS NOT NULL THEN
        NEW.freelancer_name := TRIM(NEW.freelancer_name);
    END IF;
    
    -- If freelancer_name is provided but freelancer_id is not
    IF NEW.freelancer_name IS NOT NULL AND NEW.freelancer_name != '' AND NEW.freelancer_id IS NULL THEN
        NEW.freelancer_id := get_or_create_freelancer(NEW.freelancer_name);
    END IF;
    
    -- If freelancer_id is provided, update freelancer_name to match
    IF NEW.freelancer_id IS NOT NULL THEN
        SELECT name INTO NEW.freelancer_name
        FROM public.freelancers
        WHERE id = NEW.freelancer_id;
        
        -- If freelancer not found (shouldn't happen due to FK), raise error
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Freelancer with ID % not found', NEW.freelancer_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Also improve the get_or_create function to trim names
CREATE OR REPLACE FUNCTION get_or_create_freelancer(p_name TEXT)
RETURNS UUID AS $$
DECLARE
    v_freelancer_id UUID;
    v_trimmed_name TEXT;
BEGIN
    -- Trim the name
    v_trimmed_name := TRIM(p_name);
    
    -- Validate name is not empty
    IF v_trimmed_name = '' OR v_trimmed_name IS NULL THEN
        RAISE EXCEPTION 'Freelancer name cannot be empty';
    END IF;
    
    -- Try to find existing freelancer (case-insensitive)
    SELECT id INTO v_freelancer_id
    FROM public.freelancers
    WHERE LOWER(TRIM(name)) = LOWER(v_trimmed_name);
    
    -- If not found, create new freelancer
    IF v_freelancer_id IS NULL THEN
        INSERT INTO public.freelancers (name)
        VALUES (v_trimmed_name)
        ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
        RETURNING id INTO v_freelancer_id;
    END IF;
    
    RETURN v_freelancer_id;
END;
$$ LANGUAGE plpgsql;