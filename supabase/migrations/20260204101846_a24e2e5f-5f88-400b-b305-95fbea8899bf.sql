-- Extend product_providers table with comprehensive configuration fields
ALTER TABLE product_providers
ADD COLUMN IF NOT EXISTS country text DEFAULT 'ZA',
ADD COLUMN IF NOT EXISTS astute_code text,
ADD COLUMN IF NOT EXISTS tel_number text,
ADD COLUMN IF NOT EXISTS tel_number_legal text,
ADD COLUMN IF NOT EXISTS fax_number_legal text,
ADD COLUMN IF NOT EXISTS email_legal text,
ADD COLUMN IF NOT EXISTS portal_url text,
ADD COLUMN IF NOT EXISTS residential_address jsonb,
ADD COLUMN IF NOT EXISTS postal_address jsonb,
ADD COLUMN IF NOT EXISTS services jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS umbrella_provider_id uuid REFERENCES product_providers(id),
ADD COLUMN IF NOT EXISTS contract_padding integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS exclude_from_aging boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_hidden boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_notify_changes boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS disable_manual_contract_update boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_approved boolean,
ADD COLUMN IF NOT EXISTS is_umbrella_provider boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS cc_static_update text,
ADD COLUMN IF NOT EXISTS is_deleted boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- Add unique constraint for upsert operations (user_id + code combination must be unique)
ALTER TABLE product_providers
ADD CONSTRAINT product_providers_user_code_unique UNIQUE (user_id, code);