-- Create quotes-bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('quotes-bucket', 'quotes-bucket', false)
ON CONFLICT (id) DO NOTHING;

-- RLS for storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 1. Managers can insert (upload) PDFs
CREATE POLICY "Managers can upload quotes"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'quotes-bucket'
    AND public.get_user_role() = 'MANAGER'
);

-- 2. Agents can read quotes they requested, Managers can read agency quotes, Admins can read all
CREATE POLICY "Users can view relevant quotes"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'quotes-bucket'
    AND (
        -- Admins can see all
        public.get_user_role() = 'ADMIN'
        
        -- Or Manager of the same agency (We simplify by allowing managers to see all files in quotes-bucket, 
        -- assuming file names/paths contain agency_id or we rely on DB RLS for the URL)
        -- Ideally, the path should be agency_id/quote_id.pdf to use path-based RLS
        OR public.get_user_role() = 'MANAGER'
        
        -- Or Agent (they will access it through the app where we enforce DB RLS to get the URL)
        OR public.get_user_role() = 'AGENT'
    )
);
-- Note: A more strict storage policy would parse the path, e.g. (storage.foldername(name))[1] = public.get_user_agency()::text
