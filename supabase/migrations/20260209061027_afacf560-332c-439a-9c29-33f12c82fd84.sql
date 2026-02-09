
-- Drop existing constraint and add trust to allowed client types
ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS clients_client_type_check;
ALTER TABLE public.clients ADD CONSTRAINT clients_client_type_check 
  CHECK (client_type = ANY (ARRAY['individual', 'family', 'business', 'trust']));
