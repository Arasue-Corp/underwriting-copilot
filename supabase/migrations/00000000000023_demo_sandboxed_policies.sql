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

