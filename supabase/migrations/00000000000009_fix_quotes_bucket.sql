-- Arreglar el quotes-bucket (hacerlo público y asegurar que exista)
INSERT INTO storage.buckets (id, name, public)
VALUES ('quotes-bucket', 'quotes-bucket', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Limpiar políticas anteriores
DROP POLICY IF EXISTS "Managers can upload quotes" ON storage.objects;
DROP POLICY IF EXISTS "Users can view relevant quotes" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to quotes-bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public can view quotes-bucket" ON storage.objects;

-- Crear política de subida para Managers y Admins
CREATE POLICY "Users can upload to quotes-bucket"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'quotes-bucket'
    AND auth.role() = 'authenticated'
    AND (public.get_user_role() = 'MANAGER' OR public.get_user_role() = 'ADMIN')
);

-- Crear política de lectura pública (para que getPublicUrl funcione sin problemas)
CREATE POLICY "Public can view quotes-bucket"
ON storage.objects FOR SELECT
USING ( bucket_id = 'quotes-bucket' );
