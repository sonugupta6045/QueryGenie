# QueryGenie – AI-Powered Natural Language to SQL Query Engine
## Phase 5: Deployment

*Final phase. Takes the verified system from Phase 4 and specifies how it actually ships: containers, environment configuration, secrets management, and a go-live checklist that closes the loop back to every NFR from Phase 1.*

---

## 1. Containerization

### 1.1 Backend Dockerfile (multi-stage, per Phase 1 §18 tech stack)

```dockerfile
# --- Build stage ---
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn
RUN ./mvnw dependency:go-offline
COPY src ./src
RUN ./mvnw clean package -DskipTests

# --- Runtime stage ---
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S spring && adduser -S spring -G spring
USER spring
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
```

### 1.2 Frontend Dockerfile

```dockerfile
# --- Build stage ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .
RUN npm run build

# --- Runtime stage (static, served via nginx) ---
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

`nginx.conf` handles TLS termination is actually done one layer up (see §3), so this internal nginx only needs SPA fallback routing:
```nginx
location / {
    try_files $uri /index.html;
}
```

### 1.3 docker-compose (local / staging parity)

```yaml
version: '3.9'
services:
  backend:
    build: ./backend
    env_file: .env.backend
    depends_on: [metadata-db, redis]
    ports: ["8080:8080"]

  frontend:
    build: ./frontend
    depends_on: [backend]
    ports: ["80:80"]

  metadata-db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: querygenie
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes: ["metadata-data:/var/lib/postgresql/data"]

  redis:
    image: redis:7-alpine
    volumes: ["redis-data:/data"]

volumes:
  metadata-data:
  redis-data:
```

Note: `metadata-db` here is QueryGenie's **own** application database (users, data_sources, query_logs) — completely separate from the tenant databases the tool queries. This distinction matters operationally: backing up/scaling the metadata DB is your responsibility; the tenant DBs are the customer's own infrastructure, only ever touched read-only.

---

## 2. Environment Configuration

Per-environment `application.yml` profiles, activated via `SPRING_PROFILES_ACTIVE`:

| Setting | Local | Staging | Production |
|---|---|---|---|
| `spring.jpa.hibernate.ddl-auto` | `update` | `validate` | `validate` (Flyway owns schema, never Hibernate auto-DDL in prod) |
| `logging.level.com.querygenie` | `DEBUG` | `INFO` | `INFO` |
| Gemini API rate limit / quota | Dev quota | Staging quota | Production quota (separate API key from staging) |
| `statement-timeout` (tenant queries) | 10s | 10s | 10s (configurable per data source per Phase 2 §2.2, but this is the default) |
| CORS allowed origins | `localhost:5173` | `staging.querygenie.app` | `app.querygenie.com` only — no wildcard |
| Redis | local container | managed instance | managed instance, TLS enabled |

**Critical:** Flyway migrations (Phase 2 §9) run automatically on staging on every deploy, but on production run as a **separate, manually-gated step** before the app container starts — never `ddl-auto: update`, never auto-migrate-on-boot in prod, to avoid an untested migration running against live customer data.

---

## 3. Infrastructure Topology

```
                         ┌─────────────────┐
                         │   Cloudflare /   │
                         │   Load Balancer   │  ← TLS termination, DDoS protection
                         └────────┬─────────┘
                                  │
                  ┌───────────────┴───────────────┐
                  │                                 │
         ┌────────▼────────┐              ┌────────▼────────┐
         │  Frontend (nginx) │              │  Backend (Spring) │  ← horizontally scaled,
         │  static, CDN'd    │              │  N replicas        │    stateless per NFR
         └──────────────────┘              └────────┬──────────┘
                                                       │
                          ┌───────────────────────────┼───────────────────────┐
                          │                            │                        │
                 ┌────────▼────────┐         ┌─────────▼────────┐   ┌─────────▼─────────┐
                 │  Metadata DB     │         │  Redis (schema    │   │  Gemini API         │
                 │  (Postgres,      │         │  cache + rate     │   │  (external)          │
                 │  managed, w/     │         │  limit buckets)   │   └─────────────────────┘
                 │  automated       │         └───────────────────┘
                 │  backups)        │
                 └──────────────────┘
                          │
                          │  (app-level, read-only connections only —
                          │   never on the same network segment by default)
                          ▼
                 ┌─────────────────────┐
                 │  Tenant databases    │  ← customer-owned infrastructure,
                 │  (customer-owned)    │    reached over encrypted connection,
                 └─────────────────────┘    SELECT-only DB role (Phase 2 §4.4)
```

**Why backend replicas are stateless:** No in-memory session state, no local caching that isn't also in Redis — this is what makes horizontal scaling actually work rather than just being a diagram aspiration. Confirm this holds by killing a random backend pod mid-load-test and verifying no in-flight user sees anything worse than a single retried request.

---

## 4. Secrets Management

| Secret | Where it lives | Never appears in |
|---|---|---|
| JWT signing key (HS512) | Secrets manager (e.g. AWS Secrets Manager / HashiCorp Vault) | Source control, logs, error messages |
| AES-256 encryption key for tenant credentials | Secrets manager, rotated on a schedule | Database itself (Phase 2 §2.2 already establishes this) |
| Gemini API key | Secrets manager | Frontend bundle (obviously), backend logs |
| Metadata DB credentials | Secrets manager / injected via orchestrator | `.env` files committed to git |
| Tenant DB credentials | Encrypted at rest in `data_sources.encryptedCredentials` (Phase 2), decrypted only in-memory at connection time | Ever logged, ever returned in any API response (already enforced in Phase 2 §7.2) |

**Key rotation plan:** the AES key used for tenant credentials needs a defined rotation procedure (decrypt-all/re-encrypt-all as a maintenance job) — this should exist as a runbook before go-live, not improvised later when rotation becomes urgent.

---

## 5. Observability

- **Health checks:** `/actuator/health` (Phase 2 `HealthController`) wired to the load balancer's health probe — a backend replica failing Gemini/Redis/DB connectivity checks should be pulled from rotation automatically.
- **Structured logging:** JSON-formatted logs shipped to a log aggregator (e.g. CloudWatch, ELK). Every `query_logs` failure and every `GlobalExceptionHandler` catch (Phase 2 §8) should correlate to a log line with a request ID for traceability.
- **Metrics to dashboard from day one** (these map directly to the admin analytics endpoints from Phase 2 §7.5, but also need infra-level visibility):
  - Query success rate (target ≥ the NFR reliability threshold from Phase 1)
  - P50/P95/P99 latency on `/queries/ask`
  - Gemini API error rate and latency (external dependency — needs its own alert threshold, separate from your own uptime)
  - Rate-limit rejection rate (a spike here means either abuse or a misconfigured consumer)
  - Tenant connection pool exhaustion events (directly tests the concurrency risk flagged in Phase 2 §10 and Phase 4 §3)

---

## 6. Go-Live Checklist

Organized so it closes the loop on every phase before this one:

**Phase 1 (Requirements) sign-off**
- [ ] All FRs from Phase 1 have a corresponding passing test from Phase 4 §2–3
- [ ] All NFRs (security, reliability, scalability, auditability) have a concrete verification, not just a design intention

**Phase 2 (Backend) readiness**
- [ ] Flyway migrations tested against a production-schema-shaped staging DB, not just a fresh empty one
- [ ] SELECT-only DB role for tenant connections verified at the database level, independent of the application (Phase 4 §1 step 10)
- [ ] Rate limiting thresholds set to real production values, not dev defaults

**Phase 3 (Frontend) readiness**
- [ ] Production build (`npm run build`) tested, not just dev server
- [ ] CORS locked to the real production origin only

**Phase 4 (Integration) sign-off**
- [ ] Full edge-case punch list worked through with pass/fail recorded
- [ ] At least one deliberate concurrency/load test run, not just manual clicking

**Phase 5 (this phase) readiness**
- [ ] Secrets provisioned in the secrets manager, none committed to git history (check history, not just current state)
- [ ] Health checks wired to load balancer probes and confirmed to actually pull an unhealthy replica out of rotation
- [ ] Backups configured and a restore actually tested once (a backup nobody has restored from is unverified)
- [ ] Rollback plan defined: if a deploy goes bad, what's the exact command/process to revert, and how fast

**Launch-day**
- [ ] Deploy during a low-traffic window
- [ ] Monitor the metrics dashboard (§5) actively for the first few hours, not just check it exists
- [ ] Have the Gemini API status page bookmarked — it's the one dependency outside your control

---

## 7. Summary — Full Project Arc

| Phase | Delivered |
|---|---|
| 1 | Requirements, roles, architecture, ER diagram, workflow, NFRs |
| 2 | Spring Boot backend: entities, services, security, full API spec |
| 3 | React frontend: component structure, state management, chat UI, admin dashboard |
| 4 | Integration wiring, per-role test scenarios, edge-case punch list |
| 5 | Containerization, environment config, secrets, observability, go-live checklist |

This closes the planning arc from Phase 1 through to a deployable system. From here, the work shifts from planning documents to execution — actually standing up the infrastructure in §3 and working the checklist in §6.

**End of Phase 5 — End of Planning Series.**
