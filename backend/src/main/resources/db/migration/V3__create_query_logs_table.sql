-- V3: Create query_logs table
CREATE TABLE query_logs (
    id               BIGSERIAL PRIMARY KEY,
    user_id          BIGINT REFERENCES users(id) ON DELETE SET NULL,
    data_source_id   BIGINT NOT NULL REFERENCES data_sources(id) ON DELETE CASCADE,
    question_text    TEXT   NOT NULL,
    generated_sql    TEXT,
    execution_status VARCHAR(50) NOT NULL,
    execution_time_ms BIGINT,
    error_message    TEXT,
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
