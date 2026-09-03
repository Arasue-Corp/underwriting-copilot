DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='dob') THEN
        ALTER TABLE public.clients ADD COLUMN dob text;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'goal_type') THEN
        CREATE TYPE public.goal_type AS ENUM ('QUOTED_PREMIUM', 'BOUND_PREMIUM', 'COMMISSIONS', 'VISITS');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'goal_period') THEN
        CREATE TYPE public.goal_period AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.agency_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type public.goal_type NOT NULL,
    period public.goal_period NOT NULL,
    target_value NUMERIC NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.agency_goals ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view goals from their agency' AND tablename = 'agency_goals') THEN
        CREATE POLICY "Users can view goals from their agency" ON public.agency_goals
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE profiles.id = auth.uid() 
                    AND profiles.agency_id = agency_goals.agency_id
                )
            );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Managers and Admins can insert goals' AND tablename = 'agency_goals') THEN
        CREATE POLICY "Managers and Admins can insert goals" ON public.agency_goals
            FOR INSERT WITH CHECK (
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE profiles.id = auth.uid() 
                    AND profiles.agency_id = agency_goals.agency_id
                    AND profiles.role IN ('ADMIN', 'MANAGER')
                )
            );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Managers and Admins can update goals' AND tablename = 'agency_goals') THEN
        CREATE POLICY "Managers and Admins can update goals" ON public.agency_goals
            FOR UPDATE USING (
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE profiles.id = auth.uid() 
                    AND profiles.agency_id = agency_goals.agency_id
                    AND profiles.role IN ('ADMIN', 'MANAGER')
                )
            );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Managers and Admins can delete goals' AND tablename = 'agency_goals') THEN
        CREATE POLICY "Managers and Admins can delete goals" ON public.agency_goals
            FOR DELETE USING (
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE profiles.id = auth.uid() 
                    AND profiles.agency_id = agency_goals.agency_id
                    AND profiles.role IN ('ADMIN', 'MANAGER')
                )
            );
    END IF;
END $$;
