# QueryGenie – AI-Powered Natural Language to SQL Query Engine
## Phase 3: Frontend Design (React)

*Builds on Phase 1 (user flow §10, roles §7) and Phase 2 (full API spec §7). Every screen below maps to a real endpoint already defined — nothing here invents new backend behavior.*

---

## 1. Tech Stack Recap (from Phase 1 §18)

React 18, TypeScript, Vite, Redux Toolkit, React Query, Material UI, Tailwind CSS, Recharts, Formik + Yup.

**Division of state responsibility** (this matters, so it's explicit up front):
- **Redux Toolkit** → auth session, current user/role, selected data source, UI-global state (sidebar open, theme).
- **React Query** → all server data: data sources list, query results, query history, admin analytics. Nothing server-derived lives in Redux — this avoids the classic bug of stale cached lists fighting with manually-synced Redux state.

---

## 2. Folder Structure

```
src/
├── main.tsx
├── App.tsx
├── router/
│   └── AppRouter.tsx                # Route guards per role
│
├── store/
│   ├── store.ts
│   └── slices/
│       ├── authSlice.ts             # user, role, accessToken (refreshToken in httpOnly cookie)
│       └── uiSlice.ts               # sidebarOpen, selectedDataSourceId, theme
│
├── api/
│   ├── axiosClient.ts               # Base instance, interceptors (token refresh, 401 handling)
│   ├── authApi.ts
│   ├── dataSourceApi.ts
│   ├── queryApi.ts
│   ├── queryLogApi.ts
│   └── adminApi.ts
│
├── hooks/
│   ├── useAuth.ts
│   ├── useDataSources.ts            # React Query wrapper
│   ├── useAskQuery.ts               # useMutation for /queries/ask
│   ├── useQueryHistory.ts           # useInfiniteQuery, paginated
│   └── useUsageAnalytics.ts
│
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   ├── chat/
│   │   ├── ChatPage.tsx             # Main "ask a question" screen
│   ├── history/
│   │   └── QueryHistoryPage.tsx
│   ├── datasources/
│   │   ├── DataSourceListPage.tsx
│   │   ├── DataSourceRegisterPage.tsx
│   │   └── DataSourceDetailPage.tsx
│   └── admin/
│       ├── AdminDashboardPage.tsx
│       ├── UsageAnalyticsPage.tsx
│       └── UserManagementPage.tsx
│
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx             # Sidebar + topbar + content slot
│   │   ├── Sidebar.tsx
│   │   └── DataSourceSelector.tsx   # Persistent dropdown, drives uiSlice.selectedDataSourceId
│   ├── chat/
│   │   ├── ChatInput.tsx
│   │   ├── MessageThread.tsx
│   │   ├── SqlDisplayBox.tsx        # Collapsed/expandable, editable, "Re-run" button
│   │   ├── ResultTable.tsx          # Paginated, sortable
│   │   ├── ChartRenderer.tsx        # Recharts: bar/line/pie/table-fallback switch
│   │   ├── ExplanationBanner.tsx
│   │   ├── ClarificationPrompt.tsx  # Renders when status === CLARIFICATION_NEEDED
│   │   └── LoadingState.tsx         # "Generating query..." / "Running query..." stages
│   ├── datasources/
│   │   ├── DataSourceCard.tsx
│   │   ├── DataSourceForm.tsx       # Formik + Yup, credentials never re-displayed
│   │   └── SchemaRefreshButton.tsx
│   ├── history/
│   │   ├── HistoryTable.tsx
│   │   └── ExportCsvButton.tsx
│   ├── admin/
│   │   ├── UsageChart.tsx
│   │   ├── TopQuestionsTable.tsx
│   │   └── UserRoleEditor.tsx
│   └── common/
│       ├── ErrorBanner.tsx          # Renders ApiResponse.error uniformly
│       ├── RoleGuard.tsx            # Wraps routes/components by allowed roles
│       └── PageSpinner.tsx
│
├── types/
│   ├── auth.ts
│   ├── dataSource.ts
│   ├── query.ts                     # Mirrors Phase 2 DTOs exactly
│   └── apiResponse.ts               # Generic ApiResponse<T> envelope type
│
└── utils/
    ├── chartTypeGuards.ts
    └── formatters.ts                # Currency, date, number formatting
```

---

## 3. Route Map & Role Guards

| Route | Page | Allowed Roles |
|---|---|---|
| `/login`, `/register` | Auth pages | Public |
| `/chat` | ChatPage | ANALYST, DATA_SOURCE_ADMIN, SUPER_ADMIN |
| `/history` | QueryHistoryPage | ANALYST, DATA_SOURCE_ADMIN, SUPER_ADMIN |
| `/data-sources` | DataSourceListPage | DATA_SOURCE_ADMIN, SUPER_ADMIN |
| `/data-sources/new` | DataSourceRegisterPage | DATA_SOURCE_ADMIN, SUPER_ADMIN |
| `/data-sources/:id` | DataSourceDetailPage | owner, SUPER_ADMIN |
| `/admin` | AdminDashboardPage | SUPER_ADMIN |
| `/admin/users` | UserManagementPage | SUPER_ADMIN |

`RoleGuard` reads `authSlice.role` and either renders children or redirects to `/chat` with a toast — no route is reachable by URL-guessing outside its allowed role, mirroring the backend's `@PreAuthorize` checks so the two layers agree.

---

## 4. Core Screen: Chat Page (implements Phase 1 §10 End-to-End User Flow)

```
┌─────────────────────────────────────────────────────────┐
│ AppShell                                                  │
│ ┌─────────────┐ ┌───────────────────────────────────────┐│
│ │ Sidebar      │ │ DataSourceSelector (persistent)        ││
│ │ - Chat       │ ├───────────────────────────────────────┤│
│ │ - History    │ │  MessageThread                         ││
│ │ - Data       │ │   ┌─────────────────────────────────┐ ││
│ │   Sources    │ │   │ User: "Top 5 customers by       │ ││
│ │ - Admin      │ │   │  revenue this year"              │ ││
│ │   (if role)  │ │   └─────────────────────────────────┘ ││
│ └─────────────┘ │   ┌─────────────────────────────────┐ ││
│                  │   │ LoadingState: "Generating query"│ ││
│                  │   │  → "Running query..."            │ ││
│                  │   └─────────────────────────────────┘ ││
│                  │   ┌─────────────────────────────────┐ ││
│                  │   │ ExplanationBanner (1-2 sentences)│ ││
│                  │   │ SqlDisplayBox (collapsed, [Edit]) │ ││
│                  │   │ ChartRenderer (bar/line/pie)      │ ││
│                  │   │ ResultTable (paginated)           │ ││
│                  │   └─────────────────────────────────┘ ││
│                  │  ChatInput (bottom, sticky)             ││
│                  └───────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

**State machine per question** (drives `LoadingState` + conditional rendering):

```
IDLE → SUBMITTING → { SUCCESS | CLARIFICATION_NEEDED | REJECTED | ERROR }
```

- `SUCCESS` → renders `ExplanationBanner` + `SqlDisplayBox` + `ChartRenderer` + `ResultTable`
- `CLARIFICATION_NEEDED` → renders `ClarificationPrompt` inline in the thread, keeps `ChatInput` focused for the follow-up
- `REJECTED` → renders `ErrorBanner` with the validator's reason (never raw SQL error internals)
- `ERROR` (LLM/DB unavailable) → renders `ErrorBanner` with a retry button

**Edit & re-run** (FR-13): `SqlDisplayBox` toggles from read-only `<pre>` to a CodeMirror-style editable box; "Re-run" calls `POST /queries/{logId}/rerun` with `editedSql`, which re-enters the same state machine at `SUBMITTING`.

---

## 5. React Query Hook Contracts

```typescript
// useAskQuery.ts
export function useAskQuery() {
  return useMutation({
    mutationFn: (payload: AskQueryRequest) => queryApi.ask(payload),
    onSuccess: () => queryClient.invalidateQueries(['queryHistory']),
  });
}

// useDataSources.ts
export function useDataSources() {
  return useQuery({
    queryKey: ['dataSources'],
    queryFn: dataSourceApi.list,
    staleTime: 5 * 60 * 1000,   // schema changes infrequently — matches backend caching philosophy
  });
}

// useQueryHistory.ts
export function useQueryHistory(dataSourceId?: string) {
  return useInfiniteQuery({
    queryKey: ['queryHistory', dataSourceId],
    queryFn: ({ pageParam = 0 }) => queryLogApi.list({ page: pageParam, dataSourceId }),
    getNextPageParam: (lastPage) => lastPage.hasNext ? lastPage.page + 1 : undefined,
  });
}
```

`staleTime` choices are deliberate: data-source lists rarely change (5 min stale time is safe), but query results are never cached across questions — each `ask` is a fresh mutation, never a cached query, since re-running the same question against a live database should always hit the backend.

---

## 6. Chart Rendering Logic (consumes Phase 2 `ChartConfig`)

`ChartRenderer.tsx` is a thin switch — **it does not make chart-type decisions**, it only renders what the backend's `ChartMappingService` already decided (Phase 2 §4.5). This keeps the frontend dumb-and-fast rather than duplicating rule logic in two places.

```typescript
switch (chart.type) {
  case 'bar':   return <BarChart data={rows} xKey={chart.xKey} yKey={chart.yKey} />;
  case 'line':  return <LineChart data={rows} xKey={chart.xKey} yKey={chart.yKey} />;
  case 'pie':   return <PieChart data={rows} nameKey={chart.xKey} valueKey={chart.yKey} />;
  case 'table': return <ResultTable rows={rows} columns={columns} />;
}
```

---

## 7. Admin Dashboard

| Widget | Backed by | Component |
|---|---|---|
| Total queries / success rate / avg latency | `GET /admin/analytics/usage` | `UsageChart.tsx` |
| Most-asked questions | `GET /admin/analytics/top-questions` | `TopQuestionsTable.tsx` |
| Error rate over time | same usage endpoint, filtered client-side | `UsageChart.tsx` (secondary line) |
| User role management | `GET /admin/users`, `PATCH /admin/users/{id}/role` | `UserRoleEditor.tsx` |

Restricted entirely by `RoleGuard` at the route level — `SUPER_ADMIN` only, consistent with Phase 2 §7.5 endpoint auth.

---

## 8. Auth Flow (Frontend)

```
LoginPage → POST /auth/login → { accessToken, refreshToken, user }
   → accessToken + user → Redux authSlice (in-memory only)
   → refreshToken → httpOnly cookie (never touched by JS — mitigates XSS token theft)
   → axiosClient interceptor: on 401, calls /auth/refresh once, retries original request
   → on refresh failure: clear authSlice, redirect to /login
```

Access token is deliberately **not** persisted to localStorage (avoids XSS-based theft); a page refresh triggers a silent `/auth/refresh` call on app boot to re-hydrate the session from the httpOnly cookie.

---

## 9. Error Handling Convention

Every API call's failure path renders through one shared `ErrorBanner`, keyed off the Phase 2 error envelope:

```typescript
{
  UNSAFE_SQL_REJECTED: "That question couldn't be safely converted to a query. Try rephrasing.",
  LLM_UNAVAILABLE: "The AI service is temporarily unavailable — please try again shortly.",
  DATASOURCE_UNREACHABLE: "Couldn't reach the connected database. An admin has been notified.",
  RATE_LIMIT_EXCEEDED: "Too many requests — please wait a moment.",
  VALIDATION_FAILED: "Please check the highlighted fields.",
}
```

Unmapped codes fall back to a generic "Something went wrong" message — the raw `error.message` from the backend is never shown verbatim to end users (avoids leaking internal details), but is logged to the browser console for debugging.

---

## 10. What's Deliberately Deferred to Phase 4

- Wiring these components against a *running* backend instance (currently this phase assumes the Phase 2 API contract holds; Phase 4 is where integration bugs surface).
- Responsive/mobile layout pass — this phase designs desktop-first per the admin-dashboard-heavy nature of the tool; a mobile breakpoint pass is a fast follow, not a blocker.
- Real CSV export implementation detail (streaming vs. blob download) — flagged as a Phase 4 decision once real result-set sizes are tested.

---

**End of Phase 3.**

When ready, say **"Continue Phase 4"** to proceed to Integration — wiring the frontend to the live backend, end-to-end manual test scenarios per user role, and a punch-list of edge cases (empty results, timeout, ambiguous questions, malformed schema) to verify before moving to deployment.
