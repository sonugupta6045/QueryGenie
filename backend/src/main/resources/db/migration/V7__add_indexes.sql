-- V7: Add performance indexes
-- Query logs: ordered by creation date per user and per data source
CREATE INDEX idx_query_logs_user_id_created_at    ON query_logs(user_id, created_at DESC);
CREATE INDEX idx_query_logs_data_source_id_created_at ON query_logs(data_source_id, created_at DESC);
-- Data sources: lookup by owner
CREATE INDEX idx_data_sources_owner_id            ON data_sources(owner_id);
-- Refresh tokens: fast lookup during token validation
CREATE INDEX idx_refresh_tokens_token_hash        ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_user_id           ON refresh_tokens(user_id);
-- Api consumers: already has UNIQUE index on api_key_hash; add lookup by data source
CREATE INDEX idx_api_consumers_data_source_id     ON api_consumers(data_source_id);
