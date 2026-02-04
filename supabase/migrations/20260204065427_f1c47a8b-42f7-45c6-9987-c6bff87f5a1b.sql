-- Add unique constraint on id_number (case-insensitive)
-- Only applies to non-null, non-empty values
CREATE UNIQUE INDEX idx_clients_id_number_unique 
ON clients (LOWER(id_number)) 
WHERE id_number IS NOT NULL AND id_number != '';