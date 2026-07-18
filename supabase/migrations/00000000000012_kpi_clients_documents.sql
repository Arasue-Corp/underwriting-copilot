-- Agregar fecha de aceptación a la tabla quote_requests
ALTER TABLE public.quote_requests
ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ;

-- Crear tabla para los documentos adjuntos de la cotización
CREATE TABLE IF NOT EXISTS public.quote_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID NOT NULL REFERENCES public.quote_requests(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS en quote_documents
ALTER TABLE public.quote_documents ENABLE ROW LEVEL SECURITY;

-- Políticas para quote_documents
CREATE POLICY "Public can view quote documents"
    ON public.quote_documents FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert quote documents"
    ON public.quote_documents FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete quote documents"
    ON public.quote_documents FOR DELETE
    USING (auth.role() = 'authenticated');
