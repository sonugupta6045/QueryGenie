-- V2: Create data_sources table
CREATE TABLE data_sources (
    id                      BIGSERIAL PRIMARY KEY,
    name                    VARCHAR(100)  NOT NULL,
    owner_id                BIGINT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    db_host                 VARCHAR(255)  NOT NULL,
    db_port                 INT           NOT NULL,
    db_name                 VARCHAR(100)  NOT NULL,
    encrypted_credentials   TEXT          NOT NULL,
    schema_cache            JSONB,
    schema_cached_at        TIMESTAMP WITH TIME ZONE,
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at              TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
