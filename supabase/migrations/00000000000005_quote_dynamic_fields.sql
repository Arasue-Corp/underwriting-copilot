-- 1. Update quote_requests table
ALTER TABLE public.quote_requests
ADD COLUMN products JSONB DEFAULT '[]'::jsonb,
ADD COLUMN form_data JSONB DEFAULT '{}'::jsonb;

-- Allow client_business_type to be null since we might collect better structured data
ALTER TABLE public.quote_requests ALTER COLUMN client_business_type DROP NOT NULL;

-- 2. Create quote-attachments bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('quote-attachments', 'quote-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- 3. RLS for the new bucket
-- Managers and Agents can upload to quote-attachments
CREATE POLICY "Agents and Managers can upload quote attachments"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'quote-attachments'
    AND (public.get_user_role() = 'MANAGER' OR public.get_user_role() = 'AGENT')
);

-- Users can read attachments based on their role
CREATE POLICY "Users can read relevant quote attachments"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'quote-attachments'
    AND (
        public.get_user_role() = 'ADMIN'
        OR public.get_user_role() = 'MANAGER'
        OR public.get_user_role() = 'AGENT'
    )
);
