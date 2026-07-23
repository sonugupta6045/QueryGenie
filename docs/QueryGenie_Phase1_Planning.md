# QueryGenie – AI-Powered Natural Language to SQL Query Engine
## Phase 1: Complete Project Planning

---

## 1. Project Overview

QueryGenie is a standalone, reusable AI microservice that converts natural language questions into safe, validated SQL queries, executes them against a connected PostgreSQL database, and returns results as structured data, auto-generated charts, and plain-English explanations.

Unlike a typical student project tied to one specific application, QueryGenie is architected as an **independent service** with a well-defined API contract. Any application — an HR platform, a healthcare system, an e-commerce store — can register its database schema with QueryGenie and immediately gain a "chat with your data" capability, without QueryGenie ever being aware of that application's business domain.

This is the core architectural decision that separates QueryGenie from a typical CRUD app: it is a **schema-agnostic AI query layer**, not a single-purpose tool.

---

## 2. Problem Statement

Non-technical stakeholders (managers, HR staff, support teams) routinely need answers from operational databases — "how many candidates applied last week," "which product sold the most in Q2" — but:

- They don't know SQL.
- They depend on developers/analysts to write ad-hoc queries, creating bottlenecks.
- Every organization/tool re-implements this "let me query my data in plain English" capability from scratch, tightly coupled to their own app.

There is no lightweight, secure, pluggable service that any application can call to give its users natural-language database access without exposing the underlying database to injection risk or requiring a full BI tool license.

---

## 3. Objective

- Build a secure, reusable microservice that translates natural language into validated, read-only SQL.
- Support dynamic schema discovery so the service adapts to *any* connected PostgreSQL database without hardcoded table/column knowledge.
- Guarantee safety: no write/delete operations can ever be executed, regardless of what the LLM generates.
- Provide result visualization (auto-charting) and plain-English summarization of results.
- Design the service so it can be integrated into multiple independent client applications via a clean REST API.

---

## 4. Scope

**In scope:**
- Natural language → SQL generation (SELECT-only) via LLM (Google Gemini API)
- Dynamic PostgreSQL schema introspection via `information_schema`
- Query validation, sandboxing, and execution
- Result-to-chart mapping (bar/line/pie based on data shape)
- Plain-English result explanation
- Multi-tenant support (multiple client apps/database connections registered independently)
- Query history and audit logging
- Authentication/authorization for API consumers (client apps, not end databases)
- Admin dashboard (React) to manage connected data sources, view query logs, monitor usage

**Out of scope (v1):**
- Write operations (INSERT/UPDATE/DELETE) via natural language
- Support for non-PostgreSQL databases (MySQL, MongoDB) — planned as future enhancement
- Natural-language schema modification (DDL operations) — explicitly and permanently excluded for safety
- Real-time streaming query results

---

## 5. Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-1 | System shall accept a natural language question and a target data-source identifier via API |
| FR-2 | System shall introspect the target PostgreSQL schema dynamically (tables, columns, types, FKs) |
| FR-3 | System shall generate a SQL SELECT query using an LLM, given the question + schema context |
| FR-4 | System shall validate the generated SQL against a whitelist (SELECT only, no DDL/DML keywords) |
| FR-5 | System shall execute the validated query using a read-only database role with a timeout |
| FR-6 | System shall return results as structured JSON |
| FR-7 | System shall generate a plain-English explanation of the result set |
| FR-8 | System shall recommend a chart type based on result shape and provide chart-ready data |
| FR-9 | System shall log every query (input question, generated SQL, execution status, latency) for audit |
| FR-10 | System shall support registering multiple independent data sources (multi-tenant) |
| FR-11 | System shall authenticate and authorize API consumers via JWT |
| FR-12 | System shall allow admins to view/manage connected data sources and query history via a dashboard |
| FR-13 | System shall allow users to edit and re-run the AI-generated SQL manually |
| FR-14 | System shall support pagination for large result sets |

---

## 6. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Security** | Read-only DB roles; SQL injection-proof execution (parameterized where possible); JWT auth; rate limiting; encrypted credential storage for connected data sources |
| **Performance** | Query response (excluding LLM latency) under 500ms for typical result sets; LLM round-trip target under 3s |
| **Scalability** | Stateless backend, horizontally scalable behind a load balancer; connection pooling per data source |
| **Reliability** | Query timeout (default 10s) to prevent runaway queries; circuit breaker on LLM API failures |
| **Maintainability** | Clean layered architecture (Controller → Service → Repository); SOLID principles; documented API contracts (Swagger) |
| **Auditability** | Every generated query and execution logged with timestamp, user, data source, and outcome |
| **Portability** | Fully Dockerized; environment-based configuration (12-factor app principles) |
| **Usability** | Sub-second UI feedback (loading states), clear error messages when a question can't be converted to SQL |

---

## 7. User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| **Super Admin** | Manages the QueryGenie platform itself | Manage all data sources, all client apps, view all logs, manage users |
| **Data Source Admin** | Owns a specific registered database/connection | Register/update/delete their data source, view its query logs and usage analytics |
| **Analyst / End User** | Uses the chat interface to query data | Ask questions, view results/charts, view own query history, edit/re-run SQL |
| **API Consumer (Client App)** | An external application calling QueryGenie programmatically | Authenticated API access scoped to its own registered data source only |

---

## 8. Features

1. Natural language chat interface for querying databases
2. Dynamic schema detection — zero hardcoding per data source
3. AI-generated SQL shown to the user (transparency, editable)
4. Read-only safety layer with keyword blacklist + role-based DB restriction
5. Auto-chart generation (bar/line/pie/table fallback)
6. Plain-English result explanations
7. Query history per user and per data source
8. Multi-tenant data source management (register multiple DBs)
9. Admin dashboard: usage analytics, error rates, most-asked questions
10. Role-based access control across the platform
11. Rate limiting per API consumer
12. Full audit trail of every query generated and executed

---

## 9. Complete Workflow

1. Admin registers a new data source (PostgreSQL connection details) via the dashboard.
2. QueryGenie introspects the schema and caches a structured schema description.
3. End user (via chat UI or an integrated client app) submits a natural language question, scoped to a specific data source.
4. Backend retrieves the cached schema for that data source.
5. Backend sends `{question, schema}` to Gemini API with an engineered system prompt.
6. Gemini returns a candidate SQL query.
7. Validation layer checks the query: must start with SELECT, no blacklisted keywords, no semicolon-chained statements.
8. If valid → execute against a read-only connection pool for that data source, with a query timeout.
9. If invalid → reject and return a clarification prompt to the user instead of executing.
10. Results are returned to the backend; a second lightweight LLM call generates a plain-English summary.
11. Backend determines chart type (based on column types: 1 categorical + 1 numeric → bar chart; date + numeric → line chart, etc.).
12. Full request/response cycle is logged (question, SQL, execution time, status, user, data source).
13. Frontend renders: the answer sentence, the data table, the chart, and the editable SQL box.

---

## 10. End-to-End User Flow

```
Login → Select Data Source → Chat Screen
   → Type question: "Top 5 customers by revenue this year"
   → [Loading state: "Generating query..."]
   → SQL shown (collapsed, expandable) + Results table + Chart + Explanation sentence
   → User can: (a) accept as-is, (b) edit SQL and re-run, (c) ask a follow-up question
   → Query saved to history automatically
   → User can revisit history, re-run past queries, or export results (CSV)
```

---

## 11. Business Logic

- **Schema caching:** Schema is introspected once on data source registration and refreshed on a scheduled interval (or manually triggered), not on every single query — this avoids excessive `information_schema` calls and keeps latency low.
- **Prompt construction:** The schema is serialized into a compact, token-efficient format (table name, column name + type, foreign key relationships) rather than raw DDL, to keep LLM prompt costs low and accuracy high.
- **Validation-before-execution:** SQL validation happens in two layers — (1) static analysis for blacklisted keywords/statement type, (2) execution under a database role that physically lacks write permissions, as defense-in-depth (never trust the LLM output alone).
- **Ambiguity handling:** If Gemini's response includes uncertainty markers (e.g., it asks a clarifying question instead of returning SQL), the system surfaces that clarification to the user rather than forcing an execution.
- **Chart selection logic:** Deterministic, rule-based (not AI-decided) — based on the data types of the returned columns, to keep this fast and predictable rather than an extra LLM call.
- **Multi-tenancy isolation:** Each data source has its own encrypted credential set and its own connection pool; one tenant's query load or failure cannot affect another's.

---

## 12. Architecture Diagram (Text)

```
                              ┌───────────────────────────┐
                              │        Client Apps         │
                              │ (React Chat UI / 3rd-party  │
                              │   apps via REST API)        │
                              └──────────────┬──────────────┘
                                             │ HTTPS + JWT
                                             ▼
                        ┌─────────────────────────────────────┐
                        │         API Gateway / Nginx           │
                        │   (Rate limiting, SSL termination)    │
                        └──────────────────┬─────────────────────┘
                                           ▼
                 ┌─────────────────────────────────────────────────┐
                 │           Spring Boot Backend (Stateless)         │
                 │  ┌───────────┐ ┌───────────┐ ┌─────────────────┐ │
                 │  │Controller │ │  Service   │ │  Security (JWT)  │ │
                 │  │  Layer    │→│   Layer     │ │  Filter Chain    │ │
                 │  └───────────┘ └─────┬─────┘ └─────────────────┘ │
                 │                      │                            │
                 │      ┌───────────────┼────────────────┐          │
                 │      ▼               ▼                ▼          │
                 │ ┌──────────┐  ┌─────────────┐  ┌──────────────┐ │
                 │ │  Schema   │  │  SQL Safety  │  │   Chart /    │ │
                 │ │Introspect │  │  Validator   │  │ Explanation  │ │
                 │ │  Service  │  │              │  │   Service    │ │
                 │ └────┬─────┘  └──────┬───────┘  └──────┬───────┘ │
                 └──────┼───────────────┼─────────────────┼─────────┘
                        │               │                 │
                        ▼               ▼                 ▼
              ┌──────────────┐  ┌───────────────┐  ┌───────────────┐
              │  Redis Cache  │  │  Gemini API    │  │  App Metadata  │
              │ (schema cache)│  │  (LLM calls)   │  │  DB (Postgres) │
              └──────────────┘  └───────────────┘  └───────────────┘
                                       │
                                       ▼
                        ┌───────────────────────────────┐
                        │  Read-Only Connection Pool      │
                        │  → Tenant DB #1 (PostgreSQL)     │
                        │  → Tenant DB #2 (PostgreSQL)     │
                        │  → Tenant DB #N (PostgreSQL)     │
                        └───────────────────────────────┘
```

Note: "App Metadata DB" stores QueryGenie's own data (users, data source registrations, query logs) — kept strictly separate from tenant databases being queried.

---

## 13. Data Flow Diagram

```
[User] --question--> [Chat Controller]
   --> [Schema Cache Lookup] --(cache miss)--> [Schema Introspection Service] --> [Tenant DB: information_schema]
   --> [Prompt Builder] --schema+question--> [Gemini API]
   <--generated SQL--
   --> [SQL Validator] --(reject if unsafe)--> [User: clarification message]
   --(safe)--> [Query Execution Service] --> [Tenant DB: read-only pool]
   <--result set--
   --> [Chart Mapper] --> chart config
   --> [Explanation Service] --result summary--> [Gemini API] --explanation text--
   --> [Response Assembler] --> {sql, results, chart, explanation}
   --> [Audit Logger] --> [App Metadata DB: query_logs table]
   --> [User: rendered response]
```

---

## 14. ER Diagram

```
┌─────────────────┐       ┌──────────────────────┐       ┌─────────────────┐
│      users        │       │     data_sources       │       │   query_logs      │
├─────────────────┤       ├──────────────────────┤       ├─────────────────┤
│ id (PK)           │       │ id (PK)                │       │ id (PK)            │
│ name              │       │ name                    │       │ user_id (FK)       │
│ email (unique)    │       │ owner_id (FK → users)  │       │ data_source_id(FK) │
│ password_hash     │◄──┐   │ db_host                 │◄──┐   │ question_text      │
│ role              │   │   │ db_port                 │   │   │ generated_sql      │
│ created_at        │   │   │ db_name                 │   │   │ execution_status   │
└─────────────────┘   │   │ encrypted_credentials  │   │   │ execution_time_ms  │
                        │   │ schema_cache (JSONB)   │   │   │ created_at         │
                        │   │ created_at              │   │   └─────────────────┘
                        │   └──────────────────────┘   │
                        │                                │
                        └────────────────────────────────┘
                     (one user owns many data_sources;
                      one user/data_source has many query_logs)

┌──────────────────────┐       ┌──────────────────────┐
│   api_consumers        │       │   rate_limit_buckets   │
├──────────────────────┤       ├──────────────────────┤
│ id (PK)                │       │ id (PK)                │
│ client_name            │       │ api_consumer_id (FK)   │
│ api_key_hash           │       │ window_start           │
│ data_source_id (FK)    │       │ request_count          │
│ created_at              │       └──────────────────────┘
└──────────────────────┘
```

---

## 15. Use Case Diagram

```
                         QueryGenie System
        ┌───────────────────────────────────────────────┐
        │                                                 │
(Analyst)──asks question────► [Ask Natural Language Query]│
        │                                                 │
        │──views────────────► [View Query History]        │
        │                                                 │
        │──edits/reruns──────► [Edit & Re-run SQL]         │
        │                                                 │
(Data Source Admin)──registers──► [Register Data Source]   │
        │──views──────────────► [View Usage Analytics]     │
        │                                                 │
(Super Admin)──manages───────► [Manage Users & Roles]      │
        │──views──────────────► [View Global Audit Logs]   │
        │                                                 │
(API Consumer)──calls────────► [Query via REST API]        │
        │                                                 │
        └───────────────────────────────────────────────┘
```

---

## 16. Sequence Diagram

```
User        ChatUI        Backend          Gemini API      TenantDB       MetadataDB
 │             │              │                 │              │              │
 │--question-->│              │                 │              │              │
 │             │--POST /query->│                 │              │              │
 │             │              │--get schema----------------------------------->│
 │             │              │<--cached schema-------------------------------│
 │             │              │--question+schema->│              │              │
 │             │              │<--generated SQL---│              │              │
 │             │              │--validate SQL     │              │              │
 │             │              │--execute query------------------>│              │
 │             │              │<--result set-----------------------------------│
 │             │              │--result summary-->│              │              │
 │             │              │<--explanation-----│              │              │
 │             │              │--log query--------------------------------------->│
 │             │<--response---│                 │              │              │
 │<--rendered--│              │                 │              │              │
```

---

## 17. Activity Diagram

```
[Start]
   │
   ▼
[User submits question]
   │
   ▼
[Fetch cached schema] ──(not cached)──► [Introspect schema from DB] ──► [Cache it]
   │
   ▼
[Build prompt with schema + question]
   │
   ▼
[Call Gemini API]
   │
   ▼
[Is response valid SQL?] ──No──► [Return clarification message] ──► [End]
   │ Yes
   ▼
[Passes safety validation?] ──No──► [Reject + log attempt] ──► [End]
   │ Yes
   ▼
[Execute on read-only connection with timeout]
   │
   ▼
[Query succeeded?] ──No──► [Return error + log failure] ──► [End]
   │ Yes
   ▼
[Generate chart config + explanation]
   │
   ▼
[Log full transaction to audit table]
   │
   ▼
[Return response to user]
   │
   ▼
[End]
```

---

## 18. Technology Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Java 21, Spring Boot 3.x, Spring Security, Spring Data JPA, Hibernate |
| **Database (metadata)** | PostgreSQL |
| **Database (tenant, queried)** | PostgreSQL (any external instance) |
| **Caching** | Redis (schema cache, rate-limit counters) |
| **AI** | Google Gemini API |
| **Auth** | JWT (access + refresh tokens) |
| **API Docs** | Swagger / OpenAPI 3 |
| **Migrations** | Flyway |
| **Mapping** | MapStruct |
| **Build** | Maven |
| **Frontend** | React 18, TypeScript, Vite, Redux Toolkit, React Query, Material UI, Tailwind CSS |
| **Charts** | Recharts |
| **Forms** | Formik + Yup |
| **Containerization** | Docker, Docker Compose |
| **Reverse Proxy** | Nginx |
| **CI/CD** | GitHub Actions |
| **Deployment targets** | AWS / Render / Railway (documented for all three) |
| **Testing** | JUnit 5, Mockito, Postman/Newman |

---

## 19. API Architecture

- RESTful, versioned (`/api/v1/...`)
- Resource-oriented URLs (`/data-sources`, `/queries`, `/users`)
- JWT Bearer auth on all endpoints except `/auth/login`, `/auth/register`, `/auth/refresh`
- Consistent response envelope:
```json
{
  "success": true,
  "data": { },
  "error": null,
  "timestamp": "2026-07-22T10:00:00Z"
}
```
- Standard HTTP status codes (200, 201, 400, 401, 403, 404, 409, 422, 429, 500)
- Pagination via `?page=0&size=20&sort=createdAt,desc`
- Idempotent GET/PUT; POST for creation and for the query-generation action (`/api/v1/queries/ask`)
- Full endpoint list to be generated in Phase 2 with request/response schemas

---

## 20. Security Architecture

- **Authentication:** JWT access tokens (15 min expiry) + refresh tokens (7 days, stored hashed)
- **Authorization:** Role-based access control (Super Admin / Data Source Admin / Analyst / API Consumer) enforced via Spring Security method-level annotations
- **Credential storage:** Tenant DB credentials encrypted at rest (AES-256) in the metadata database; decrypted only in-memory at connection time
- **SQL safety (defense in depth):**
  1. Static validation — reject anything not starting with `SELECT`, reject blacklisted keywords (`DROP`, `DELETE`, `UPDATE`, `INSERT`, `ALTER`, `TRUNCATE`, `GRANT`, `--`, `;` chaining)
  2. Execution-level enforcement — tenant DB connection uses a **database role with SELECT-only grants**, so even a bypassed validator cannot cause damage
  3. Query timeout (default 10s) to prevent resource exhaustion
- **Rate limiting:** Per API consumer, sliding window counter in Redis
- **Transport security:** HTTPS/TLS enforced at Nginx layer
- **Audit logging:** Every query attempt (successful or rejected) logged with user, data source, timestamp, and outcome
- **Secrets management:** Environment variables / secrets manager (never committed to source control)

---

## 21. Deployment Architecture

```
Developer → GitHub → GitHub Actions (CI/CD)
                          │
              ┌───────────┴────────────┐
              ▼                        ▼
      Build & Test                Build Docker Images
      (JUnit, Mockito)             (backend, frontend)
              │                        │
              └───────────┬────────────┘
                           ▼
                  Push to Container Registry
                           │
                           ▼
              Deploy via Docker Compose / K8s
                           │
          ┌────────────────┼─────────────────┐
          ▼                ▼                 ▼
   Nginx (reverse    Spring Boot         React (static
     proxy + SSL)     backend container   build via Nginx)
          │                │
          ▼                ▼
     Redis container   PostgreSQL (metadata DB)
```

Deployment guides to be documented for AWS (ECS/EC2), Render, and Railway in Phase 5.

---

## 22. Project Timeline

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Phase 1 – Planning | Week 1 | This document |
| Phase 2 – Backend | Weeks 2–4 | Entities, repositories, services, controllers, security, DB schema |
| Phase 3 – Frontend | Weeks 5–6 | React app: auth, chat UI, dashboard, charts |
| Phase 4 – Integration | Week 7 | End-to-end flow wired, manual testing |
| Phase 5 – Deployment | Week 8 | Dockerized, CI/CD pipeline, cloud deployment |
| Phase 6 – Testing | Week 9 | Unit + integration test suites |
| Phase 7 – Documentation | Week 10 | README, API docs, architecture docs |

*(Compressible to 4–5 weeks total if built part-time alongside your internship, by running Phases 2–3 partially in parallel.)*

---

## 23. Future Enhancements

- Support for MySQL, MongoDB, and other data sources beyond PostgreSQL
- Natural-language follow-up questions with conversational context (multi-turn query refinement)
- Scheduled/recurring queries with email report delivery
- Query result caching for frequently asked questions
- Fine-tuned or locally-hosted open-source LLM option (cost reduction, data privacy for sensitive schemas)
- Voice input for natural language questions
- Slack/Teams bot integration using the same core API
- Anomaly alerts (e.g., "notify me if daily signups drop below X")

---

**End of Phase 1.**

When ready, say **"Continue Phase 2"** to proceed to Backend Design (Spring Boot) — entity design, folder structure, service/repository/controller layers, security flow, and full API specification.
