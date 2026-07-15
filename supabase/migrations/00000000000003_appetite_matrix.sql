CREATE TABLE public.appetite_matrix (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    carrier_name TEXT NOT NULL,
    product_line TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'es',
    industry_name TEXT NOT NULL,
    naics_code TEXT,
    status TEXT NOT NULL CHECK (status IN ('ELIGIBLE', 'PROHIBITED', 'REFER')),
    conditions TEXT,
    min_premium NUMERIC(12,2),
    max_limits TEXT,
    general_prohibited_operations JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexing for BI querying
CREATE INDEX idx_appetite_matrix_carrier ON public.appetite_matrix(carrier_name);
CREATE INDEX idx_appetite_matrix_product ON public.appetite_matrix(product_line);
CREATE INDEX idx_appetite_matrix_industry ON public.appetite_matrix(industry_name);
CREATE INDEX idx_appetite_matrix_status ON public.appetite_matrix(status);

-- RLS Enablement
ALTER TABLE public.appetite_matrix ENABLE ROW LEVEL SECURITY;

-- Read policy (everyone can read)
CREATE POLICY "Everyone can read appetite matrix"
    ON public.appetite_matrix FOR SELECT
    USING (true);

-- Insert/Update is done by admins or service_role
CREATE POLICY "Admins can insert appetite matrix"
    ON public.appetite_matrix FOR INSERT
    WITH CHECK (get_user_role() = 'ADMIN');
