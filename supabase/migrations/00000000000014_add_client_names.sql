-- Add first_name and last_name to clients table
ALTER TABLE public.clients ADD COLUMN first_name TEXT;
ALTER TABLE public.clients ADD COLUMN last_name TEXT;
