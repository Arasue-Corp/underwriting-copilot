-- Permitir a los agentes actualizar el estatus de sus propias cotizaciones
CREATE POLICY "Agents can update their own quotes"
    ON public.quote_requests FOR UPDATE
    USING (agent_id = auth.uid());

-- Permitir a los admins actualizar cualquier cotización
CREATE POLICY "Admins can update all quotes"
    ON public.quote_requests FOR UPDATE
    USING (get_user_role() = 'ADMIN');
