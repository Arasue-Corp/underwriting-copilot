-- Add contact details to visits table
ALTER TABLE public.visits 
ADD COLUMN IF NOT EXISTS contact_method TEXT,
ADD COLUMN IF NOT EXISTS contact_method_other TEXT,
ADD COLUMN IF NOT EXISTS contact_reason TEXT,
ADD COLUMN IF NOT EXISTS contact_reason_other TEXT;
