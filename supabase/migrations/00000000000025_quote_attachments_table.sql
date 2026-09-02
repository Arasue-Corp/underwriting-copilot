CREATE TABLE IF NOT EXISTS public.quote_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID REFERENCES public.quote_requests(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.quote_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view quote attachments"
    ON public.quote_attachments FOR SELECT
    USING (true);

CREATE POLICY "Users can insert quote attachments"
    ON public.quote_attachments FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');
