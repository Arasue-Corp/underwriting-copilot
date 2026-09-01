-- Create policy-documents bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('policy-documents', 'policy-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Policies for policy-documents bucket

-- Admins and Managers can do everything
CREATE POLICY "Admins can manage policy-documents"
ON storage.objects FOR ALL
USING ( bucket_id = 'policy-documents' AND public.get_user_role() = 'ADMIN' );

CREATE POLICY "Managers can manage policy-documents"
ON storage.objects FOR ALL
USING ( bucket_id = 'policy-documents' AND public.get_user_role() = 'MANAGER' );

-- Demo users can only select (read/download)
CREATE POLICY "Demo users can read policy-documents"
ON storage.objects FOR SELECT
USING ( bucket_id = 'policy-documents' AND public.get_user_role() = 'DEMO' );

