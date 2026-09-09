-- Migration 28: Fix visits table existence, appetite_matrix delete/update policies, and visits RLS

-- 1. Ensure visits table exists
CREATE TABLE IF NOT EXISTS public.visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    visit_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    conversation_notes TEXT,
    contact_method TEXT,
    contact_method_other TEXT,
    contact_reason TEXT,
    contact_reason_other TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;

-- 2. Visits Policies for Admins, Managers and Agents
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'visits' AND policyname = 'Admins and Managers manage visits') THEN
        CREATE POLICY "Admins and Managers manage visits"
            ON public.visits FOR ALL
            USING (
                agency_id = get_user_agency() 
                AND (get_user_role() = 'ADMIN' OR get_user_role() = 'MANAGER')
            );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'visits' AND policyname = 'Agents manage own agency visits') THEN
        CREATE POLICY "Agents manage own agency visits"
            ON public.visits FOR ALL
            USING (
                agency_id = get_user_agency() 
                AND (created_by = auth.uid() OR assigned_to = auth.uid())
            );
    END IF;
END $$;

-- 3. Fix DEMO sandboxed policy on visits
DROP POLICY IF EXISTS "Demo can view agency visits" ON public.visits;
CREATE POLICY "Demo can view agency visits" 
ON public.visits FOR SELECT 
USING (get_user_role() = 'DEMO' AND agency_id = get_user_agency());

-- 4. Enable DELETE & UPDATE on appetite_matrix for Admins (Prevents duplicate row accumulation on upload)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'appetite_matrix' AND policyname = 'Admins can delete appetite matrix') THEN
        CREATE POLICY "Admins can delete appetite matrix"
            ON public.appetite_matrix FOR DELETE
            USING (get_user_role() = 'ADMIN');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'appetite_matrix' AND policyname = 'Admins can update appetite matrix') THEN
        CREATE POLICY "Admins can update appetite matrix"
            ON public.appetite_matrix FOR UPDATE
            USING (get_user_role() = 'ADMIN');
    END IF;
END $$;
