-- Add new columns to appetite_rules for richer data extraction

ALTER TABLE public.appetite_rules 
ADD COLUMN IF NOT EXISTS min_premium NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS sweet_spots JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS mandatory_endorsements JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS key_exclusions JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS underwriting_guidelines JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS deductibles JSONB DEFAULT '[]'::jsonb;
