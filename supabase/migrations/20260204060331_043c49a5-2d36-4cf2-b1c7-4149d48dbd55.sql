-- Add contact_type column to client_contacts for professional relationship categorization
ALTER TABLE public.client_contacts 
ADD COLUMN contact_type TEXT DEFAULT 'Other';

-- Add new business relationship types to the relationship_type enum
ALTER TYPE public.relationship_type ADD VALUE IF NOT EXISTS 'Beneficiary';
ALTER TYPE public.relationship_type ADD VALUE IF NOT EXISTS 'Director';
ALTER TYPE public.relationship_type ADD VALUE IF NOT EXISTS 'Shareholder';
ALTER TYPE public.relationship_type ADD VALUE IF NOT EXISTS 'Member';
ALTER TYPE public.relationship_type ADD VALUE IF NOT EXISTS 'Owner';