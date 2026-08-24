-- Allow Managers to insert quotes on behalf of their agents (e.g. duplicating)
CREATE POLICY "Managers can insert quotes for their agency"
    ON public.quote_requests FOR INSERT
    WITH CHECK (
        get_user_role() = 'MANAGER' 
        AND agency_id = get_user_agency()
    );

-- Allow Admins to insert any quote
CREATE POLICY "Admins can insert any quote"
    ON public.quote_requests FOR INSERT
    WITH CHECK (
        get_user_role() = 'ADMIN'
    );
