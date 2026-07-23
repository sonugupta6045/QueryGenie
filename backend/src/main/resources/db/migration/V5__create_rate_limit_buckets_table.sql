-- V5: Create rate_limit_buckets table
-- Note: live counter lives in Redis for speed; this table backs periodic snapshots only
CREATE TABLE rate_limit_buckets (
    id              BIGSERIAL PRIMARY KEY,
    api_consumer_id BIGINT    NOT NULL REFERENCES api_consumers(id) ON DELETE CASCADE,
    window_start    TIMESTAMP WITH TIME ZONE NOT NULL,
    request_count   INT       NOT NULL DEFAULT 0,
    CONSTRAINT uk_consumer_window UNIQUE (api_consumer_id, window_start)
);
