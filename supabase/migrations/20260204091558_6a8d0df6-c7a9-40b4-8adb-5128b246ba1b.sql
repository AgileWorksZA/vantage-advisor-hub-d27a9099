-- Add unique constraint for upsert operations
ALTER TABLE admin_general_lists 
ADD CONSTRAINT admin_general_lists_user_list_code_unique 
UNIQUE (user_id, list_type, code);