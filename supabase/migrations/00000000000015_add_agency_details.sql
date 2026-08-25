-- Add address and phone to agencies
ALTER TABLE public.agencies
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT;
