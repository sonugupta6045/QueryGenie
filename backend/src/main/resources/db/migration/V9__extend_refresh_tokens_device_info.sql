-- V9: Extend refresh_tokens table with device and activity tracking metadata
ALTER TABLE refresh_tokens
    ADD COLUMN user_agent   VARCHAR(512),
    ADD COLUMN ip_address   VARCHAR(45),
    ADD COLUMN device_label VARCHAR(255),
    ADD COLUMN last_used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL;
