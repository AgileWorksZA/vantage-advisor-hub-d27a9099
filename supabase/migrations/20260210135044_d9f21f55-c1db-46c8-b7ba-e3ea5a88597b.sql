
-- Rename column
ALTER TABLE public.clients RENAME COLUMN family_group TO household_group;

-- Update existing data: "The X Family" -> "The X Household"
UPDATE public.clients
SET household_group = REPLACE(household_group, ' Family', ' Household')
WHERE household_group IS NOT NULL;

-- Update family_name in client_relationships
UPDATE public.client_relationships
SET family_name = REPLACE(family_name, ' Family', ' Household')
WHERE family_name IS NOT NULL AND family_name LIKE '%Family%';
