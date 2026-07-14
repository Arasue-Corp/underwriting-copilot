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
