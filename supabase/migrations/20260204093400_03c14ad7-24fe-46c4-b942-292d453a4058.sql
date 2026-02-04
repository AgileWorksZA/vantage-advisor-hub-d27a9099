-- Add unique constraint for instruments to prevent duplicates
ALTER TABLE admin_funds 
ADD CONSTRAINT admin_funds_user_code_exchange_unique 
UNIQUE (user_id, code, exchange);