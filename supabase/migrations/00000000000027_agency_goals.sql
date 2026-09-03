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
