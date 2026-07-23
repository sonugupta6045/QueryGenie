# QueryGenie – AI-Powered Natural Language to SQL Query Engine
## Phase 2: Backend Design (Spring Boot)

*Builds directly on Phase 1 planning — same FRs, NFRs, ER diagram, and tech stack. This document turns those into an implementable Spring Boot backend: package structure, entities, repositories, services, controllers, security flow, and the full API specification.*

---

## 1. Package / Folder Structure

Layered by responsibility (Controller → Service → Repository), with cross-cutting concerns isolated so the schema-agnostic core never touches business-domain logic.

```
com.querygenie
│
├── QueryGenieApplication.java
│
├── config/
│   ├── SecurityConfig.java            # Spring Security filter chain, CORS
│   ├── RedisConfig.java               # Schema cache + rate-limit bucket config
│   ├── SwaggerConfig.java             # OpenAPI 3 docs
│   ├── AsyncConfig.java               # Thread pools for LLM calls
│   ├── DataSourceRoutingConfig.java   # Dynamic tenant DB connection pools
│   └── WebClientConfig.java           # HTTP client for Gemini API
│
├── security/
│   ├── JwtTokenProvider.java          # Generate/validate access & refresh tokens
│   ├── JwtAuthenticationFilter.java   # Per-request token extraction
│   ├── SecurityUserDetails.java
│   ├── CustomUserDetailsService.java
│   └── ApiKeyAuthFilter.java          # For API Consumer (client-app) requests
│
├── entity/
│   ├── User.java
│   ├── DataSource.java
│   ├── QueryLog.java
│   ├── ApiConsumer.java
│   ├── RateLimitBucket.java
│   ├── RefreshToken.java
│   └── enums/
│       ├── Role.java                  # SUPER_ADMIN, DATA_SOURCE_ADMIN, ANALYST, API_CONSUMER
│       └── ExecutionStatus.java       # SUCCESS, REJECTED, FAILED, CLARIFICATION_NEEDED
│
├── repository/
│   ├── UserRepository.java
│   ├── DataSourceRepository.java
│   ├── QueryLogRepository.java
│   ├── ApiConsumerRepository.java
│   ├── RateLimitBucketRepository.java
│   └── RefreshTokenRepository.java
│
├── dto/
│   ├── request/
│   │   ├── AskQueryRequest.java
│   │   ├── RegisterDataSourceRequest.java
│   │   ├── EditSqlRequest.java
│   │   ├── LoginRequest.java
│   │   └── RegisterUserRequest.java
│   ├── response/
│   │   ├── ApiResponse.java           # Standard envelope (success/data/error/timestamp)
│   │   ├── QueryResultResponse.java   # sql, columns, rows, chart, explanation
│   │   ├── ChartConfig.java
│   │   ├── DataSourceResponse.java
│   │   ├── QueryLogResponse.java
│   │   └── AuthResponse.java
│   └── mapper/                        # MapStruct interfaces
│       ├── DataSourceMapper.java
│       ├── QueryLogMapper.java
│       └── UserMapper.java
│
├── service/
│   ├── auth/
│   │   ├── AuthService.java
│   │   └── AuthServiceImpl.java
│   ├── datasource/
│   │   ├── DataSourceService.java
│   │   └── DataSourceServiceImpl.java
│   ├── schema/
│   │   ├── SchemaIntrospectionService.java
│   │   └── SchemaIntrospectionServiceImpl.java   # information_schema queries + Redis cache
│   ├── llm/
│   │   ├── GeminiClient.java                     # Raw API wrapper
│   │   ├── PromptBuilderService.java             # Token-efficient schema serialization
│   │   └── SqlGenerationService.java             # Orchestrates prompt → Gemini → raw SQL
│   ├── validation/
│   │   ├── SqlSafetyValidator.java               # Static keyword/blacklist checks
│   │   └── ValidationResult.java
│   ├── execution/
│   │   ├── QueryExecutionService.java            # Runs against read-only pool, timeout
│   │   └── TenantConnectionPoolManager.java      # HikariCP pool per data source
│   ├── chart/
│   │   └── ChartMappingService.java              # Deterministic, rule-based chart selection
│   ├── explanation/
│   │   └── ExplanationService.java               # Second lightweight Gemini call
│   ├── audit/
│   │   └── AuditLogService.java
│   └── ratelimit/
│       └── RateLimitService.java                 # Redis sliding-window counter
│
├── controller/
│   ├── AuthController.java
│   ├── DataSourceController.java
│   ├── QueryController.java
│   ├── QueryLogController.java
│   ├── AdminController.java
│   └── HealthController.java
│
├── exception/
│   ├── GlobalExceptionHandler.java      # @ControllerAdvice
│   ├── UnsafeSqlException.java
│   ├── SchemaIntrospectionException.java
│   ├── LlmApiException.java
│   ├── DataSourceConnectionException.java
│   └── RateLimitExceededException.java
│
└── util/
    ├── EncryptionUtil.java              # AES-256 for tenant credentials
    ├── SqlKeywordConstants.java
    └── ChartRuleConstants.java
```

**Why this shape:** `schema/`, `llm/`, `validation/`, `execution/`, `chart/` are deliberately separate services (not one "QueryService" god-class) because Phase 1's core architectural bet — schema-agnosticism — only holds if each of these stays independently testable and swappable (e.g., swapping Gemini for another LLM later touches only `service/llm/`).

---

## 2. Entity Design (JPA)

Matches the Phase 1 ER diagram exactly, with implementation-level detail added.

### 2.1 `User`
```java
@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    private Role role;

    @CreationTimestamp
    private Instant createdAt;

    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DataSource> dataSources = new ArrayList<>();
}
```

### 2.2 `DataSource`
```java
@Entity
@Table(name = "data_sources")
public class DataSource {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @ManyToOne @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    private String dbHost;
    private Integer dbPort;
    private String dbName;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String encryptedCredentials;   // AES-256 encrypted username:password

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private SchemaCache schemaCache;       // structured table/column/FK description

    private Instant schemaCachedAt;

    @CreationTimestamp
    private Instant createdAt;
}
```

### 2.3 `QueryLog`
```java
@Entity
@Table(name = "query_logs")
public class QueryLog {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne @JoinColumn(name = "data_source_id", nullable = false)
    private DataSource dataSource;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String questionText;

    @Column(columnDefinition = "TEXT")
    private String generatedSql;

    @Enumerated(EnumType.STRING)
    private ExecutionStatus executionStatus;

    private Long executionTimeMs;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;   // null unless FAILED/REJECTED

    @CreationTimestamp
    private Instant createdAt;
}
```

### 2.4 `ApiConsumer`
```java
@Entity
@Table(name = "api_consumers")
public class ApiConsumer {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String clientName;

    @Column(nullable = false, unique = true)
    private String apiKeyHash;

    @ManyToOne @JoinColumn(name = "data_source_id", nullable = false)
    private DataSource dataSource;

    @CreationTimestamp
    private Instant createdAt;
}
```

### 2.5 `RateLimitBucket`
```java
@Entity
@Table(name = "rate_limit_buckets")
public class RateLimitBucket {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne @JoinColumn(name = "api_consumer_id", nullable = false)
    private ApiConsumer apiConsumer;

    private Instant windowStart;
    private Integer requestCount;
}
```
*(In practice this table backs a periodic snapshot; the live counter lives in Redis for speed — see §6.)*

### 2.6 `RefreshToken` (not in Phase 1 ERD, added for JWT rotation per §20 Security Architecture)
```java
@Entity
@Table(name = "refresh_tokens")
public class RefreshToken {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, unique = true)
    private String tokenHash;

    private Instant expiresAt;
    private boolean revoked;
}
```

---

## 3. Repository Layer

Standard Spring Data JPA, with a few purpose-built queries beyond CRUD:

```java
public interface DataSourceRepository extends JpaRepository<DataSource, UUID> {
    List<DataSource> findByOwnerId(UUID ownerId);
    Optional<DataSource> findByIdAndOwnerId(UUID id, UUID ownerId);
}

public interface QueryLogRepository extends JpaRepository<QueryLog, UUID> {
    Page<QueryLog> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
    Page<QueryLog> findByDataSourceIdOrderByCreatedAtDesc(UUID dataSourceId, Pageable pageable);

    @Query("SELECT COUNT(q) FROM QueryLog q WHERE q.executionStatus = 'FAILED' AND q.createdAt > :since")
    long countFailuresSince(@Param("since") Instant since);
}

public interface ApiConsumerRepository extends JpaRepository<ApiConsumer, UUID> {
    Optional<ApiConsumer> findByApiKeyHash(String apiKeyHash);
}

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
    Optional<RefreshToken> findByTokenHashAndRevokedFalse(String tokenHash);
}
```

---

## 4. Service Layer — Responsibilities

Mapped 1:1 to the Phase 1 workflow (§9) and activity diagram (§17), so each numbered step below owns exactly one service:

| Step (Phase 1 §9) | Owning Service |
|---|---|
| Register data source, encrypt credentials | `DataSourceService` |
| Introspect + cache schema | `SchemaIntrospectionService` |
| Build prompt from cached schema | `PromptBuilderService` |
| Call Gemini for SQL | `SqlGenerationService` / `GeminiClient` |
| Static + role-based validation | `SqlSafetyValidator` |
| Execute on read-only pool w/ timeout | `QueryExecutionService` + `TenantConnectionPoolManager` |
| Chart type decision | `ChartMappingService` |
| Plain-English summary | `ExplanationService` |
| Full audit logging | `AuditLogService` |
| Per-consumer throttling | `RateLimitService` |

### 4.1 `SchemaIntrospectionService`
- Queries `information_schema.tables`, `information_schema.columns`, and FK constraints on the *tenant* database using a metadata-only, read-only connection.
- Serializes to a compact `SchemaCache` DTO (table → columns[name,type] → FK edges), **not raw DDL** — per Phase 1 §11 this keeps LLM prompt tokens low.
- Writes result to Redis (`schema:{dataSourceId}`) and to the `schema_cache` JSONB column as durable backup.
- Exposes `refreshSchema(dataSourceId)` for manual/scheduled refresh (does not run per-query).

### 4.2 `SqlGenerationService`
- Pulls cached schema, question text; delegates to `PromptBuilderService` for a system prompt like:
  > "You are a PostgreSQL query generator. Given this schema: {schema}. Only ever return a single SELECT statement or a clarifying question if the request is ambiguous. Never return DDL/DML."
- Calls `GeminiClient` (wraps Google Gemini API via `WebClient`, with a circuit breaker via Resilience4j per NFR reliability requirement).
- Detects clarification-style responses (heuristic: response doesn't start with `SELECT`) and short-circuits to a clarification response rather than forcing execution — directly implements Phase 1 §11 ambiguity handling.

### 4.3 `SqlSafetyValidator`
- Layer 1 of defense-in-depth (Phase 1 §20):
  - Must start with `SELECT` (case-insensitive, trimmed).
  - Rejects blacklisted keywords: `DROP, DELETE, UPDATE, INSERT, ALTER, TRUNCATE, GRANT, REVOKE, CREATE, EXEC`.
  - Rejects statement chaining (`;` followed by more non-whitespace content).
  - Rejects comment-based injection attempts (`--`, `/* */`).
- Returns a `ValidationResult` (pass/fail + reason) rather than throwing directly, so the controller can return a clean 422 with an explanation instead of a stack trace.

### 4.4 `QueryExecutionService`
- Layer 2 of defense-in-depth: executes only via `TenantConnectionPoolManager`, which maintains one HikariCP pool per `dataSourceId`, each configured against a **PostgreSQL role that physically has SELECT-only grants** — so even a validator bypass cannot mutate data.
- Applies `statement_timeout` (default 10s, configurable per data source) at the JDBC level.
- Wraps execution in `@Transactional(readOnly = true)`.

### 4.5 `ChartMappingService`
Deterministic rules (Phase 1 §11 — explicitly *not* an LLM call, for speed/predictability):

| Result Shape | Chart |
|---|---|
| 1 categorical + 1 numeric column | Bar chart |
| date/timestamp + numeric column | Line chart |
| 1 categorical + 1 numeric, ≤6 categories, values sum to a whole | Pie chart |
| >2 columns, or purely textual | Table fallback |

### 4.6 `ExplanationService`
- Second, lightweight Gemini call: `{question, result row count, sample rows}` → one or two plain-English sentences.
- Kept separate from `SqlGenerationService` so it can fail independently (a failed explanation degrades gracefully to "Explanation unavailable" — result/chart still returned).

### 4.7 `RateLimitService`
- Redis sliding-window counter keyed by `apiConsumerId` (or `userId` for dashboard traffic).
- On limit breach, throws `RateLimitExceededException` → mapped to HTTP 429.

---

## 5. Controller Layer & Endpoint Ownership

| Controller | Endpoints (see §7 for full spec) |
|---|---|
| `AuthController` | login, register, refresh, logout |
| `DataSourceController` | register/list/get/update/delete data source, trigger schema refresh |
| `QueryController` | ask question, edit & re-run SQL, get single query result |
| `QueryLogController` | list history (per user / per data source), export CSV |
| `AdminController` | usage analytics, error rates, most-asked questions, user management |
| `HealthController` | `/actuator/health` passthrough + Gemini/DB connectivity checks |

Controllers stay thin: request validation (`@Valid` DTOs) → delegate to service → wrap in `ApiResponse<T>` envelope. No business logic lives here.

---

## 6. Security Flow

```
Incoming Request
   │
   ▼
[Nginx: TLS termination, rate-limit headers]
   │
   ▼
[JwtAuthenticationFilter]  ──(if Bearer JWT)──► validate signature + expiry ──► set SecurityContext
   │
   ▼
[ApiKeyAuthFilter]  ──(if X-API-Key header)──► hash + lookup ApiConsumer ──► scope to its data_source_id only
   │
   ▼
[Method-level @PreAuthorize checks]
   - @PreAuthorize("hasRole('SUPER_ADMIN')")           → AdminController
   - @PreAuthorize("hasAnyRole('DATA_SOURCE_ADMIN')")   → DataSourceController mutation endpoints
   - @PreAuthorize("hasAnyRole('ANALYST','DATA_SOURCE_ADMIN')") → QueryController
   - API Consumer requests bypass role checks but are hard-scoped to their own data_source_id at the service layer
   │
   ▼
[Controller → Service → Repository]
```

- **Access tokens:** 15 min expiry, signed HS512, embed `userId` + `role`.
- **Refresh tokens:** 7 days, stored **hashed** in `refresh_tokens`, rotated on every use (old one revoked).
- **Credential encryption:** `EncryptionUtil` uses AES-256-GCM; the key itself comes from an environment variable / secrets manager, never from the database.
- **Password storage:** BCrypt, strength 12.

---

## 7. Full API Specification

Base path: `/api/v1`. All responses use the standard envelope from Phase 1 §19.

### 7.1 Auth
| Method | Endpoint | Auth | Request Body | Response |
|---|---|---|---|---|
| POST | `/auth/register` | none | `{name, email, password}` | `AuthResponse{accessToken, refreshToken, user}` |
| POST | `/auth/login` | none | `{email, password}` | `AuthResponse` |
| POST | `/auth/refresh` | refresh token | `{refreshToken}` | `{accessToken, refreshToken}` |
| POST | `/auth/logout` | JWT | `{refreshToken}` | `204 No Content` |

### 7.2 Data Sources
| Method | Endpoint | Auth | Request Body | Response |
|---|---|---|---|---|
| POST | `/data-sources` | DATA_SOURCE_ADMIN | `{name, dbHost, dbPort, dbName, username, password}` | `DataSourceResponse` (credentials never echoed) |
| GET | `/data-sources` | any authenticated | – | `Page<DataSourceResponse>` |
| GET | `/data-sources/{id}` | owner or SUPER_ADMIN | – | `DataSourceResponse` |
| PUT | `/data-sources/{id}` | owner | `{name?, dbHost?, dbPort?, dbName?, username?, password?}` | `DataSourceResponse` |
| DELETE | `/data-sources/{id}` | owner | – | `204 No Content` |
| POST | `/data-sources/{id}/refresh-schema` | owner | – | `{tableCount, columnCount, cachedAt}` |

### 7.3 Query (core feature — FR-1 through FR-9, FR-13)
| Method | Endpoint | Auth | Request Body | Response |
|---|---|---|---|---|
| POST | `/queries/ask` | ANALYST / API_CONSUMER | `AskQueryRequest{dataSourceId, question}` | `QueryResultResponse{sql, columns, rows, chart, explanation, status}` |
| POST | `/queries/{logId}/rerun` | owner of log | `EditSqlRequest{editedSql}` | `QueryResultResponse` |
| GET | `/queries/{logId}` | owner of log | – | `QueryLogResponse` |

**`AskQueryRequest`**
```json
{ "dataSourceId": "uuid", "question": "Top 5 customers by revenue this year" }
```

**`QueryResultResponse`** (success case)
```json
{
  "success": true,
  "data": {
    "sql": "SELECT customer_name, SUM(amount) AS revenue FROM orders ... LIMIT 5",
    "columns": [{"name": "customer_name", "type": "text"}, {"name": "revenue", "type": "numeric"}],
    "rows": [["Acme Corp", 45230.00], ["Globex", 39100.50]],
    "chart": {"type": "bar", "xKey": "customer_name", "yKey": "revenue"},
    "explanation": "Acme Corp led with ₹45,230 in revenue this year, followed by Globex.",
    "status": "SUCCESS",
    "executionTimeMs": 214
  },
  "error": null,
  "timestamp": "2026-07-22T10:00:00Z"
}
```

**Clarification case** (FR-3 / §11 ambiguity handling)
```json
{
  "success": true,
  "data": { "status": "CLARIFICATION_NEEDED", "clarificationMessage": "Did you mean total revenue or number of orders?" },
  "error": null,
  "timestamp": "2026-07-22T10:00:00Z"
}
```

**Rejected case** (unsafe SQL, FR-4)
```json
{
  "success": false,
  "data": null,
  "error": { "code": "UNSAFE_SQL_REJECTED", "message": "Generated query failed safety validation." },
  "timestamp": "2026-07-22T10:00:00Z"
}
```

### 7.4 Query History
| Method | Endpoint | Auth | Query Params | Response |
|---|---|---|---|---|
| GET | `/query-logs` | ANALYST (own) / SUPER_ADMIN (all) | `page, size, sort, dataSourceId?` | `Page<QueryLogResponse>` |
| GET | `/query-logs/{id}/export` | owner | – | CSV file stream |

### 7.5 Admin / Analytics
| Method | Endpoint | Auth | Response |
|---|---|---|---|
| GET | `/admin/analytics/usage` | SUPER_ADMIN / DATA_SOURCE_ADMIN | `{totalQueries, successRate, avgLatencyMs, byDataSource[]}` |
| GET | `/admin/analytics/top-questions` | SUPER_ADMIN / DATA_SOURCE_ADMIN | `[{question, count}]` |
| GET | `/admin/users` | SUPER_ADMIN | `Page<UserResponse>` |
| PATCH | `/admin/users/{id}/role` | SUPER_ADMIN | `{role}` |

### 7.6 Health
| Method | Endpoint | Auth | Response |
|---|---|---|---|
| GET | `/health` | none | `{status, geminiApi, redis, metadataDb}` |

All list endpoints support `?page=0&size=20&sort=createdAt,desc` per Phase 1 §19; all error responses use HTTP codes 400/401/403/404/409/422/429/500 as specified there.

---

## 8. Exception Handling Strategy

`GlobalExceptionHandler` (`@ControllerAdvice`) maps domain exceptions to the standard error envelope:

| Exception | HTTP Status | Error Code |
|---|---|---|
| `UnsafeSqlException` | 422 | `UNSAFE_SQL_REJECTED` |
| `SchemaIntrospectionException` | 502 | `SCHEMA_INTROSPECTION_FAILED` |
| `LlmApiException` | 503 | `LLM_UNAVAILABLE` |
| `DataSourceConnectionException` | 502 | `DATASOURCE_UNREACHABLE` |
| `RateLimitExceededException` | 429 | `RATE_LIMIT_EXCEEDED` |
| `AccessDeniedException` | 403 | `FORBIDDEN` |
| `MethodArgumentNotValidException` | 400 | `VALIDATION_FAILED` |
| Anything uncaught | 500 | `INTERNAL_ERROR` |

Every one of these is also written to `query_logs` (when a data-source context exists) or a general `system_error_logs` table, satisfying the auditability NFR even on failure paths.

---

## 9. Database Migrations (Flyway)

```
V1__create_users_table.sql
V2__create_data_sources_table.sql
V3__create_query_logs_table.sql
V4__create_api_consumers_table.sql
V5__create_rate_limit_buckets_table.sql
V6__create_refresh_tokens_table.sql
V7__add_indexes.sql
   - idx_query_logs_user_id_created_at
   - idx_query_logs_data_source_id_created_at
   - idx_data_sources_owner_id
```

---

## 10. What's Deliberately Deferred to Phase 3/4

- Frontend consumption of these APIs (Phase 3).
- Actual end-to-end wiring/manual testing (Phase 4).
- Load-testing the tenant connection pool manager under concurrent multi-tenant load — flagged here as a risk to revisit before Phase 5 deployment, since HikariCP pool-per-tenant sizing directly affects the "stateless, horizontally scalable" NFR.

---

**End of Phase 2.**

When ready, say **"Continue Phase 3"** to proceed to Frontend Design (React) — component structure, state management (Redux Toolkit + React Query), chat UI, admin dashboard, and API integration layer.
