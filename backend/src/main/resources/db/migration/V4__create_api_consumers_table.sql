-- V4: Create api_consumers table
CREATE TABLE api_consumers (
    id             BIGSERIAL    PRIMARY KEY,
    client_name    VARCHAR(100) NOT NULL,
    api_key_hash   VARCHAR(255) NOT NULL UNIQUE,
    data_source_id BIGINT       NOT NULL REFERENCES data_sources(id) ON DELETE CASCADE,
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
