-- Initial Schema for Underwriting Co-Pilot

-- Create Enums
CREATE TYPE profile_role AS ENUM ('ADMIN', 'MANAGER', 'AGENT');
CREATE TYPE appetite_status AS ENUM ('YES', 'NO', 'REFER');
CREATE TYPE quote_status AS ENUM ('PENDING_MANAGER', 'QUOTED', 'BOUND', 'LOST');

-- Create Tables
CREATE TABLE public.agencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    role profile_role NOT NULL DEFAULT 'AGENT',
    agency_id UUID REFERENCES public.agencies(id) ON DELETE SET NULL,
    commission_rate NUMERIC(5,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.appetite_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    carrier_name TEXT NOT NULL,
    business_class TEXT NOT NULL,
    naics_code TEXT,
    status appetite_status NOT NULL,
    coverage_limits TEXT,
    prohibited_operations JSONB,
    eligible_states JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.quote_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES public.profiles(id),
    agency_id UUID NOT NULL REFERENCES public.agencies(id),
    client_name TEXT NOT NULL,
    client_business_type TEXT NOT NULL,
    carrier_id TEXT,
    coverage_requested TEXT,
    premium_amount NUMERIC(12,2),
    commission_amount NUMERIC(12,2),
    status quote_status NOT NULL DEFAULT 'PENDING_MANAGER',
    pdf_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_appetite_rules_updated_at
    BEFORE UPDATE ON public.appetite_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quote_requests_updated_at
    BEFORE UPDATE ON public.quote_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Commission Calculation Trigger
CREATE OR REPLACE FUNCTION calculate_commission()
RETURNS TRIGGER AS $$
DECLARE
    agent_rate NUMERIC(5,2);
BEGIN
    IF NEW.premium_amount IS NOT NULL THEN
        -- Get the agent's commission rate
        SELECT commission_rate INTO agent_rate FROM public.profiles WHERE id = NEW.agent_id;
        
        -- Calculate commission
        NEW.commission_amount = NEW.premium_amount * (agent_rate / 100.0);
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER calculate_quote_commission
    BEFORE INSERT OR UPDATE OF premium_amount, agent_id ON public.quote_requests
    FOR EACH ROW
    EXECUTE FUNCTION calculate_commission();

-- Row Level Security (RLS)

-- Enable RLS
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appetite_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS profile_role
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Helper function to get current user's agency
CREATE OR REPLACE FUNCTION public.get_user_agency()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT agency_id FROM public.profiles WHERE id = auth.uid();
$$;

-- RLS Policies for Agencies
CREATE POLICY "Admins can view all agencies"
    ON public.agencies FOR SELECT
    USING (get_user_role() = 'ADMIN');

CREATE POLICY "Users can view their own agency"
    ON public.agencies FOR SELECT
    USING (id = get_user_agency());

CREATE POLICY "Admins can insert agencies"
    ON public.agencies FOR INSERT
    WITH CHECK (get_user_role() = 'ADMIN');

CREATE POLICY "Admins can update agencies"
    ON public.agencies FOR UPDATE
    USING (get_user_role() = 'ADMIN');

-- RLS Policies for Profiles
CREATE POLICY "Users can view profiles in their agency"
    ON public.profiles FOR SELECT
    USING (
        get_user_role() = 'ADMIN' 
        OR agency_id = get_user_agency()
    );

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (id = auth.uid());

CREATE POLICY "Managers can update agents in their agency"
    ON public.profiles FOR UPDATE
    USING (
        get_user_role() = 'MANAGER' 
        AND agency_id = get_user_agency()
    );

CREATE POLICY "Admins can update all profiles"
    ON public.profiles FOR UPDATE
    USING (get_user_role() = 'ADMIN');

-- RLS Policies for Appetite Rules (Read by everyone, written by Admins/Service Role)
CREATE POLICY "Everyone can read appetite rules"
    ON public.appetite_rules FOR SELECT
    USING (true);

-- (Insert/Update for appetite rules is handled by service role bypassing RLS)

-- RLS Policies for Quote Requests
CREATE POLICY "Admins can read all quotes"
    ON public.quote_requests FOR SELECT
    USING (get_user_role() = 'ADMIN');

CREATE POLICY "Managers can read agency quotes"
    ON public.quote_requests FOR SELECT
    USING (
        get_user_role() = 'MANAGER' 
        AND agency_id = get_user_agency()
    );

CREATE POLICY "Agents can read their own quotes"
    ON public.quote_requests FOR SELECT
    USING (agent_id = auth.uid());

CREATE POLICY "Agents can create quotes"
    ON public.quote_requests FOR INSERT
    WITH CHECK (
        agent_id = auth.uid() 
        AND agency_id = get_user_agency()
    );

CREATE POLICY "Managers can update agency quotes"
    ON public.quote_requests FOR UPDATE
    USING (
        get_user_role() = 'MANAGER' 
        AND agency_id = get_user_agency()
    );
-- Create quotes-bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('quotes-bucket', 'quotes-bucket', false)
ON CONFLICT (id) DO NOTHING;

-- RLS is already enabled by default in Supabase storage.objects

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
-- Add new columns to appetite_rules for richer data extraction

ALTER TABLE public.appetite_rules 
ADD COLUMN IF NOT EXISTS min_premium NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS sweet_spots JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS mandatory_endorsements JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS key_exclusions JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS underwriting_guidelines JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS deductibles JSONB DEFAULT '[]'::jsonb;
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
-- Trigger to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), 
    'AGENT' -- Rol por defecto
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Opcional: Backfill para arreglar los usuarios huÃ©rfanos que ya creaste antes del trigger
INSERT INTO public.profiles (id, email, name, role)
SELECT id, email, split_part(email, '@', 1), 'AGENT'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);
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
-- 1. Add new columns to quote_requests table
ALTER TABLE public.quote_requests
ADD COLUMN assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN quotes_provided JSONB DEFAULT '[]'::jsonb;

-- 2. Update RLS policies to allow assigned users to read/update
CREATE POLICY "Assigned users can read their assigned quotes"
    ON public.quote_requests FOR SELECT
    USING (assigned_to = auth.uid());

CREATE POLICY "Assigned users can update their assigned quotes"
    ON public.quote_requests FOR UPDATE
    USING (assigned_to = auth.uid());
-- Crear la tabla clients
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    legal_structure TEXT,
    fein TEXT,
    address TEXT,
    contact TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(agency_id, name)
);

-- Trigger de updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER handle_clients_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Habilitar RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- PolÃ­ticas
CREATE POLICY "Users can view clients from their agency"
    ON public.clients FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.agency_id = clients.agency_id
        )
    );

CREATE POLICY "Users can insert clients into their agency"
    ON public.clients FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.agency_id = clients.agency_id
        )
    );

CREATE POLICY "Users can update clients from their agency"
    ON public.clients FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.agency_id = clients.agency_id
        )
    );
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
-- Arreglar el quotes-bucket (hacerlo pÃºblico y asegurar que exista)
INSERT INTO storage.buckets (id, name, public)
VALUES ('quotes-bucket', 'quotes-bucket', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Limpiar polÃ­ticas anteriores
DROP POLICY IF EXISTS "Managers can upload quotes" ON storage.objects;
DROP POLICY IF EXISTS "Users can view relevant quotes" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to quotes-bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public can view quotes-bucket" ON storage.objects;

-- Crear polÃ­tica de subida para Managers y Admins
CREATE POLICY "Users can upload to quotes-bucket"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'quotes-bucket'
    AND auth.role() = 'authenticated'
    AND (public.get_user_role() = 'MANAGER' OR public.get_user_role() = 'ADMIN' OR public.get_user_role() = 'DEMO' OR public.get_user_role() = 'AGENT')
);

-- Crear polÃ­tica de lectura pÃºblica (para que getPublicUrl funcione sin problemas)
CREATE POLICY "Public can view quotes-bucket"
ON storage.objects FOR SELECT
USING ( bucket_id = 'quotes-bucket' );
-- Permitir a los agentes actualizar el estatus de sus propias cotizaciones
CREATE POLICY "Agents can update their own quotes"
    ON public.quote_requests FOR UPDATE
    USING (agent_id = auth.uid());

-- Permitir a los admins actualizar cualquier cotizaciÃ³n
CREATE POLICY "Admins can update all quotes"
    ON public.quote_requests FOR UPDATE
    USING (get_user_role() = 'ADMIN');
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
-- Agregar fecha de aceptaciÃ³n a la tabla quote_requests
ALTER TABLE public.quote_requests
ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ;

-- Crear tabla para los documentos adjuntos de la cotizaciÃ³n
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

-- PolÃ­ticas para quote_documents
CREATE POLICY "Public can view quote documents"
    ON public.quote_documents FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert quote documents"
    ON public.quote_documents FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete quote documents"
    ON public.quote_documents FOR DELETE
    USING (auth.role() = 'authenticated');
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
-- Add first_name and last_name to clients table
ALTER TABLE public.clients ADD COLUMN first_name TEXT;
ALTER TABLE public.clients ADD COLUMN last_name TEXT;
-- Add address and phone to agencies
ALTER TABLE public.agencies
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT;
-- Add contact details to visits table
ALTER TABLE public.visits 
ADD COLUMN IF NOT EXISTS contact_method TEXT,
ADD COLUMN IF NOT EXISTS contact_method_other TEXT,
ADD COLUMN IF NOT EXISTS contact_reason TEXT,
ADD COLUMN IF NOT EXISTS contact_reason_other TEXT;
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    action TEXT NOT NULL,
    actor_id UUID REFERENCES auth.users(id),
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all logs
CREATE POLICY "Admins can view activity logs"
ON public.activity_logs FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'ADMIN'
    )
);

CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.activity_logs (
        entity_type,
        entity_id,
        action,
        actor_id,
        old_data,
        new_data
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        auth.uid(),
        (CASE WHEN TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN row_to_json(OLD)::jsonb ELSE NULL END),
        (CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW)::jsonb ELSE NULL END)
    );
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach to tables
DROP TRIGGER IF EXISTS log_quote_requests ON public.quote_requests;
CREATE TRIGGER log_quote_requests
AFTER INSERT OR UPDATE OR DELETE ON public.quote_requests
FOR EACH ROW EXECUTE FUNCTION log_activity();

DROP TRIGGER IF EXISTS log_clients ON public.clients;
CREATE TRIGGER log_clients
AFTER INSERT OR UPDATE OR DELETE ON public.clients
FOR EACH ROW EXECUTE FUNCTION log_activity();

DROP TRIGGER IF EXISTS log_visits ON public.visits;
CREATE TRIGGER log_visits
AFTER INSERT OR UPDATE OR DELETE ON public.visits
FOR EACH ROW EXECUTE FUNCTION log_activity();

DROP TRIGGER IF EXISTS log_carriers ON public.carriers;
CREATE TRIGGER log_carriers
AFTER INSERT OR UPDATE OR DELETE ON public.carriers
FOR EACH ROW EXECUTE FUNCTION log_activity();
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    other_tag_text TEXT,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    assignee_id UUID REFERENCES auth.users(id),
    creator_id UUID REFERENCES auth.users(id),
    status TEXT DEFAULT 'PENDING',
    notified_1d_before BOOLEAN DEFAULT FALSE,
    notified_1h_before BOOLEAN DEFAULT FALSE,
    notified_15m_before BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Tasks Policies
-- Agents can see tasks assigned to them or created by them.
-- Managers/Admins can see all tasks.
CREATE POLICY "Users can view relevant tasks" ON public.tasks
FOR SELECT USING (
    assignee_id = auth.uid() OR 
    creator_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('MANAGER', 'ADMIN')
    )
);

CREATE POLICY "Users can insert their own tasks" ON public.tasks
FOR INSERT WITH CHECK (
    creator_id = auth.uid()
);

CREATE POLICY "Users can update relevant tasks" ON public.tasks
FOR UPDATE USING (
    assignee_id = auth.uid() OR 
    creator_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('MANAGER', 'ADMIN')
    )
);

CREATE POLICY "Users can delete their own tasks or if manager" ON public.tasks
FOR DELETE USING (
    creator_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('MANAGER', 'ADMIN')
    )
);

-- Notifications Policies
-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON public.notifications
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert own notifications" ON public.notifications
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own notifications" ON public.notifications
FOR DELETE USING (user_id = auth.uid());

-- Activity Logs Triggers
DROP TRIGGER IF EXISTS log_tasks ON public.tasks;
CREATE TRIGGER log_tasks
AFTER INSERT OR UPDATE OR DELETE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION log_activity();
ALTER TYPE profile_role ADD VALUE IF NOT EXISTS 'DEMO';
CREATE POLICY "Demo can view all agencies" ON public.agencies FOR SELECT USING (get_user_role() = 'DEMO');
CREATE POLICY "Demo can view all profiles" ON public.profiles FOR SELECT USING (get_user_role() = 'DEMO');
CREATE POLICY "Demo can read all quotes" ON public.quote_requests FOR SELECT USING (get_user_role() = 'DEMO');
CREATE POLICY "Demo can view activity logs" ON public.activity_logs FOR SELECT USING (get_user_role() = 'DEMO');
CREATE POLICY "Demo can read all clients" ON public.clients FOR SELECT USING (get_user_role() = 'DEMO');
CREATE POLICY "Demo can view all tasks" ON public.tasks FOR SELECT USING (get_user_role() = 'DEMO');
CREATE POLICY "Demo can view all visits" ON public.visits FOR SELECT USING (get_user_role() = 'DEMO');
CREATE POLICY "Demo can view all carriers" ON public.carriers FOR SELECT USING (get_user_role() = 'DEMO');
CREATE TYPE client_status AS ENUM ('CLIENTE', 'SEGUIMIENTO', 'RECHAZO');
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS status client_status DEFAULT 'SEGUIMIENTO';
-- Create policies table
CREATE TABLE IF NOT EXISTS public.policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_number TEXT,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    insurance_type TEXT NOT NULL,
    carrier_id TEXT NOT NULL,
    coverage TEXT NOT NULL,
    state TEXT,
    city TEXT,
    zip_code TEXT,
    agent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    participants TEXT,
    premium_amount NUMERIC(12,2),
    agency_commission_percentage NUMERIC(5,2),
    agency_commission_amount NUMERIC(12,2),
    client_first_name TEXT,
    client_last_name TEXT,
    client_company_name TEXT,
    quote_id UUID REFERENCES public.quote_requests(id) ON DELETE SET NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    agency_id UUID NOT NULL REFERENCES public.agencies(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can do everything on policies" 
ON public.policies FOR ALL 
USING (get_user_role() = 'ADMIN');

CREATE POLICY "Managers can do everything on policies" 
ON public.policies FOR ALL 
USING (get_user_role() = 'MANAGER');

CREATE POLICY "Demo can read policies" 
ON public.policies FOR SELECT 
USING (get_user_role() = 'DEMO');
-- Drop old open policies
DROP POLICY IF EXISTS "Demo can view all agencies" ON public.agencies;
DROP POLICY IF EXISTS "Demo can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Demo can read all quotes" ON public.quote_requests;
DROP POLICY IF EXISTS "Demo can view activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Demo can read all clients" ON public.clients;
DROP POLICY IF EXISTS "Demo can view all tasks" ON public.tasks;
DROP POLICY IF EXISTS "Demo can view all visits" ON public.visits;
DROP POLICY IF EXISTS "Demo can view all carriers" ON public.carriers;
DROP POLICY IF EXISTS "Demo can read policies" ON public.policies;
DROP POLICY IF EXISTS "Demo can view their agency" ON public.agencies;
DROP POLICY IF EXISTS "Demo can view agency profiles" ON public.profiles;
DROP POLICY IF EXISTS "Demo can read agency quotes" ON public.quote_requests;
DROP POLICY IF EXISTS "Demo can view agency activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Demo can view agency tasks" ON public.tasks;
DROP POLICY IF EXISTS "Demo can view agency visits" ON public.visits;
DROP POLICY IF EXISTS "Demo can read agency policies" ON public.policies;
DROP POLICY IF EXISTS "Demo can read agency clients" ON public.clients;


-- Create sandboxed read-only policies for DEMO users tied to their own agency

CREATE POLICY "Demo can view their agency" 
ON public.agencies FOR SELECT 
USING (get_user_role() = 'DEMO' AND id = get_user_agency());

CREATE POLICY "Demo can view agency profiles" 
ON public.profiles FOR SELECT 
USING (get_user_role() = 'DEMO' AND agency_id = get_user_agency());

CREATE POLICY "Demo can read agency quotes" 
ON public.quote_requests FOR SELECT 
USING (get_user_role() = 'DEMO' AND agency_id = get_user_agency());

CREATE POLICY "Demo can view agency activity logs" 
ON public.activity_logs FOR SELECT 
USING (get_user_role() = 'DEMO' AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = activity_logs.actor_id AND profiles.agency_id = get_user_agency()));

CREATE POLICY "Demo can view agency tasks" 
ON public.tasks FOR SELECT 
USING (get_user_role() = 'DEMO' AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = tasks.creator_id AND profiles.agency_id = get_user_agency()));

CREATE POLICY "Demo can view agency visits" 
ON public.visits FOR SELECT 
USING (get_user_role() = 'DEMO' AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = visits.agent_id AND profiles.agency_id = get_user_agency()));

CREATE POLICY "Demo can read agency policies" 
ON public.policies FOR SELECT 
USING (get_user_role() = 'DEMO' AND agency_id = get_user_agency());

CREATE POLICY "Demo can read agency clients" 
ON public.clients FOR SELECT 
USING (get_user_role() = 'DEMO' AND agency_id = get_user_agency());

-- Carriers and appetite rules are global, so DEMO can read all
CREATE POLICY "Demo can view all carriers" 
ON public.carriers FOR SELECT 
USING (get_user_role() = 'DEMO');

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
ALTER TABLE public.clients
ADD COLUMN dob text;

CREATE TYPE public.goal_type AS ENUM ('QUOTED_PREMIUM', 'BOUND_PREMIUM', 'COMMISSIONS', 'VISITS');
CREATE TYPE public.goal_period AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY');

CREATE TABLE public.agency_goals (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL,
  profile_id uuid NOT NULL,
  goal_type public.goal_type NOT NULL,
  period_type public.goal_period NOT NULL,
  target_amount numeric NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT agency_goals_pkey PRIMARY KEY (id),
  CONSTRAINT agency_goals_agency_id_fkey FOREIGN KEY (agency_id) REFERENCES public.agencies(id) ON DELETE CASCADE,
  CONSTRAINT agency_goals_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- RLS policies for agency_goals
ALTER TABLE public.agency_goals ENABLE ROW LEVEL SECURITY;

-- Admins and Managers can manage all goals in their agency
CREATE POLICY "Admins and Managers can manage agency goals" ON public.agency_goals
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM public.profiles 
      WHERE agency_id = agency_goals.agency_id 
      AND (role = 'ADMIN' OR role = 'MANAGER' OR role = 'DEMO')
    )
  );

-- Agents can view their own goals
CREATE POLICY "Agents can view own goals" ON public.agency_goals
  FOR SELECT USING (
    profile_id = auth.uid()
  );
