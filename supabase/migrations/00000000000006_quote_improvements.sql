-- 1. Add new columns to quote_requests table
ALTER TABLE public.quote_requests
ADD COLUMN assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN quotes_provided JSONB DEFAULT '[]'::jsonb;

-- 2. Update RLS policies to allow assigned users to read/update
CREATE POLICY "Assigned users can read their assigned quotes"
    ON public.quote_requests FOR SELECT
    USING (assigned_to = auth.uid());

CREATE POLICY "Assigned users can update their assigned quotes"
    ON public.quote_requests FOR UPDATE
    USING (assigned_to = auth.uid());
