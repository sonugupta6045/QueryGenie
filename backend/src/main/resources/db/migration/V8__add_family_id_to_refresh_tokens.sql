-- Add family_id and rotated_at to refresh_tokens table
ALTER TABLE refresh_tokens
ADD COLUMN family_id VARCHAR(36);

-- For existing tokens, set a random UUID as family_id to satisfy NOT NULL
UPDATE refresh_tokens
SET family_id = gen_random_uuid()
WHERE family_id IS NULL;

-- Make family_id NOT NULL
ALTER TABLE refresh_tokens
ALTER COLUMN family_id SET NOT NULL;

ALTER TABLE refresh_tokens
ADD COLUMN rotated_at TIMESTAMP WITH TIME ZONE;
