# AGENTS.md — QueryGenie Project

Read this file fully before making any changes. These are standing rules for every agent working in this workspace.

## Project
QueryGenie – AI-Powered Natural Language to SQL Query Engine.
Full architecture and requirements are documented in `/docs/QueryGenie_Phase1_Planning.md`. Read that file before implementing anything — do not invent architecture that contradicts it.

## Non-negotiable rules

1. **Never generate or execute non-SELECT SQL.** No agent may write code that allows INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE, or GRANT to be executed against a tenant database, under any circumstance, even if a feature request seems to imply it. Flag it and ask instead.
2. **Defense in depth on SQL safety:** every execution path must (a) statically validate the query starts with SELECT and contains no blacklisted keywords, AND (b) run under a database role that only has SELECT grants. Never rely on just one of these.
3. **No hardcoded schemas.** All schema knowledge must come from runtime introspection (`information_schema`), never hardcoded table/column names in code, since the whole point of this service is to work against any connected database.
4. **Multi-tenant isolation.** Each registered data source has its own encrypted credentials and its own connection pool. Never let code path share a connection pool across tenants.
5. **Secrets never hardcoded.** DB credentials, JWT secrets, and the Gemini API key must be read from environment variables only. Never commit `.env` files.

## Tech stack (do not substitute without asking)
- Backend: Java 17, Spring Boot 3.x, Spring Security, Spring Data JPA, PostgreSQL, Flyway, MapStruct, Lombok, Redis
- Frontend: React 18 + TypeScript, Vite, Redux Toolkit, React Query, Material UI, Tailwind, Recharts
- Auth: JWT (access + refresh)
- AI: Google Gemini API

## Architecture
Follow the layered architecture in the planning doc: Controller → Service → Repository, with a separate Schema Introspection Service, SQL Safety Validator, and Chart/Explanation Service as independent components (not folded into the main query service) — this keeps the safety validator testable and auditable in isolation.

## Working style
- Build one vertical slice at a time (e.g., "register a data source" end-to-end) rather than all entities then all controllers — easier for me to review incrementally.
- Before writing code for a new module, state your plan in 3-5 bullets and wait for my go-ahead if the task is non-trivial.
- Always add a Flyway migration when changing the schema — never rely on Hibernate auto-DDL in anything beyond local dev.
- Write unit tests alongside new service logic, not as a separate pass at the end.
- Explain any deviation from the Phase 1 plan before implementing it.

## Current phase
Working from Phase 2: Backend Design. Entity design, folder structure, service/repository/controller layers, JWT security, and full API spec must be finalized (as documents) before implementation code is generated — do not skip to code without an approved plan for a given module.
