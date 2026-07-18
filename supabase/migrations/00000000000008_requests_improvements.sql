-- Crear el bucket de quote-attachments si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('quote-attachments', 'quote-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Configurar politicas de storage (Public para descargar facil como manager, pero solo el sistema puede subir)
-- Si ya existe una politica para este bucket, DO NOTHING o reemplazarla
DROP POLICY IF EXISTS "Public can view quote attachments" ON storage.objects;
CREATE POLICY "Public can view quote attachments"
ON storage.objects FOR SELECT
USING ( bucket_id = 'quote-attachments' );

DROP POLICY IF EXISTS "Users can upload quote attachments" ON storage.objects;
CREATE POLICY "Users can upload quote attachments"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'quote-attachments'
    AND auth.role() = 'authenticated'
);

-- Agregar columnas a quote_requests
ALTER TABLE public.quote_requests
ADD COLUMN IF NOT EXISTS sold_premium NUMERIC(12, 2),
ADD COLUMN IF NOT EXISTS commission_percentage NUMERIC(5, 2);

-- Add new enum values to quote_status
ALTER TYPE quote_status ADD VALUE IF NOT EXISTS 'PENDING_AGENT';
ALTER TYPE quote_status ADD VALUE IF NOT EXISTS 'SUBMITTED_TO_CARRIER';
ALTER TYPE quote_status ADD VALUE IF NOT EXISTS 'REJECTED';
ALTER TYPE quote_status ADD VALUE IF NOT EXISTS 'ACCEPTED';
