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
