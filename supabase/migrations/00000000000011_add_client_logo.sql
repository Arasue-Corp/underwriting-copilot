-- Add logo_url to clients table
ALTER TABLE public.clients
ADD COLUMN logo_url TEXT;

-- Create logos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for logos bucket
CREATE POLICY "Anyone can view logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'logos');

CREATE POLICY "Authenticated users can upload logos"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'logos'
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update their uploaded logos"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'logos'
    AND auth.role() = 'authenticated'
);
