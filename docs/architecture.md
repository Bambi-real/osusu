# System Architecture

## Overview

Osusu is a full-stack web application built on a **monolithic architecture** with a clear separation between frontend and backend. The frontend is a single-page application (SPA) that communicates with a RESTful API backend, which in turn interfaces with a managed PostgreSQL database through Supabase.

The architecture follows a **three-tier** pattern:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│  Presentation │────▶│  Application  │────▶│     Data         │
│  (React SPA) │     │  (Express 5)  │     │  (Supabase/PG)   │
└──────────────┘     └──────────────┘     └──────────────────┘
```

---

## High-Level Architecture

```mermaid
graph TB
    subgraph Client["Client Layer — React 19 SPA"]
        direction TB
        A1[React Components]
        A2[React Router]
        A3[AuthContext]
        A4[Axios Instance]
        A5[Supabase Browser SDK]
        
        A3 --> A4
        A4 --> A5
    end

    subgraph Server["Application Layer — Express 5"]
        direction TB
        B1[Helmet Security Headers]
        B2[CORS Enforcement]
        B3[Request Size Limit]
        B4[Morgan Logging]
        B5[Rate Limiter]
        B6[Route Dispatcher]
        B7[authenticateToken Middleware]
        B8[requireOrganiser Middleware]
        B9[Auth Controller]
        B10[Groups Controller]
        B11[Cycles Controller]
        B12[Contributions Controller]
        B13[Error Handler]
        
        B1 --> B2 --> B3 --> B4 --> B5 --> B6
        B6 --> B7 --> B8
        B7 --> B9
        B7 --> B10
        B7 --> B11
        B7 --> B12
        B9 --> B13
        B10 --> B13
        B11 --> B13
        B12 --> B13
    end

    subgraph Data["Data Layer — Supabase"]
        direction TB
        C1[Supabase Auth]
        C2[(PostgreSQL Database)]
        C3[PostgreSQL RPCs]
        C4[Row Level Security]
        
        C2 --> C3
        C2 --> C4
    end

    Client -->|HTTPS/REST| Server
    Server -->|Service Role Key| Data
    Client -->|Anon Key| C1
```

---

## Request Lifecycle

```mermaid
sequenceDiagram
    participant User
    participant React as React SPA
    participant Axios as Axios Interceptor
    participant Express as Express App
    participant Auth as Auth Middleware
    participant Org as Organiser Middleware
    participant Ctrl as Controller
    participant DB as Supabase/PG

    User->>React: Click / Navigate / Submit
    React->>Axios: api.get('/groups/my')
    
    Axios->>Axios: Check public route whitelist
    Axios->>Axios: supabase.auth.getSession()
    Axios->>Axios: Attach Bearer token
    
    Axios->>Express: GET /api/groups/my
    Express->>Express: helmet → cors → json → morgan
    Express->>Auth: authenticateToken
    
    Auth->>Auth: Extract token from header
    Auth->>DB: supabaseAdmin.auth.getUser(token)
    DB-->>Auth: { user }
    Auth->>Auth: Attach req.user
    Auth-->>Express: next()
    
    Express->>Ctrl: route handler
    Ctrl->>DB: supabaseAdmin.from('groups').select(...)
    DB-->>Ctrl: group data
    Ctrl-->>Express: JSON response
    
    Express-->>Axios: 200 + JSON
    Axios-->>React: response.data
    React->>React: Update component state
    React-->>User: Render updated UI

    Note over Auth,DB: For organiser-only endpoints:
    Express->>Org: requireOrganiser
    Org->>DB: Fetch group by ID
    DB-->>Org: group data
    Org->>Org: Check organiser_id === req.user.id
    Org-->>Express: next() or 403
```

---

## Design Patterns

### 1. Middleware Pipeline Pattern

Express middleware chains are used to compose request processing:

```
Request → helmet → cors → json parser → morgan → rate limiter → router → auth → organiser → controller → response
```

Each middleware has a single responsibility and is independently testable.

### 2. Controller-Service Pattern

While not using explicit service classes, the architecture separates:

- **Routes** — URL mapping and middleware composition
- **Controllers** — Business logic, validation, and database orchestration
- **Middleware** — Cross-cutting concerns (auth, authorisation)
- **Utilities** — Pure functions (shuffle, schedule generation)

### 3. State Machine Pattern

Groups and cycles follow strict state machine transitions:

```
Groups:     FORMING ──► ACTIVE ──► COMPLETED
                 │                    ▲
                 └── DELETE            │
                                     CANCELLED

Cycles:     PENDING ──► COLLECTING ──► PAID_OUT
```

Transitions are enforced in controller logic, preventing invalid state changes.

### 4. Compensating Transaction Pattern

The `startGroup` function implements manual compensation for multi-step operations:

1. Update payout orders in database
2. Generate and insert cycles
3. Update group status to ACTIVE

If step 2 fails, payout orders are restored. If step 3 fails, both payout orders are restored AND cycles are deleted. This ensures no partial updates exist.

### 5. Observer Pattern (Frontend)

The `AuthContext` subscribes to Supabase auth state changes via `onAuthStateChange`, allowing the entire UI to reactively adapt to auth events (sign in, sign out, token refresh, password recovery).

### 6. Interceptor Pattern (Frontend)

The Axios instance uses request/response interceptors to:

- Automatically attach auth tokens (request interceptor)
- Handle 401 responses globally (response interceptor)
- Keep individual API modules free of auth boilerplate

---

## Monolithic Architecture Decision

The application uses a **monolithic architecture** — one Express server handling all API routes. This was chosen because:

### Advantages
- **Simpler deployment** — Single process to deploy and monitor
- **Lower latency** — No inter-service network calls
- **Easier development** — Single codebase, shared types, atomic deployments
- **Transaction consistency** — Easier to maintain data integrity without distributed transactions
- **MVP-appropriate** — For the current scale (single-university project), monolith is the pragmatic choice

### When to Consider Microservices

- When the user base grows beyond thousands of active groups
- When independent scaling is needed (e.g., notification service vs. core API)
- When different teams need to own different domains
- When specialised infrastructure is needed (e.g., real-time WebSocket server)

### Migration Path

For future microservices migration, the controller-based structure already provides natural bounded contexts:

- `auth.controller.js` → Auth Service
- `groups.controller.js` → Groups Service
- `cycles.controller.js` → Cycles Service
- `contributions.controller.js` → Contributions Service

Each would become its own Express app with its own database schema and API surface.

---

## Data Flow Diagrams

### Group Creation Flow

```mermaid
sequenceDiagram
    participant Organiser
    participant CreateGroup as CreateGroupPage
    participant API as Axios API
    participant Server as Express Server
    participant DB as Supabase/PG

    Organiser->>CreateGroup: Fill form (name, amount, frequency, etc.)
    Organiser->>CreateGroup: Click "Create Group"
    CreateGroup->>CreateGroup: Validate form fields
    CreateGroup->>API: POST /api/groups
    API->>Server: POST /api/groups
    Server->>Server: authenticateToken
    Server->>DB: INSERT into groups
    Server->>DB: UPDATE profile → ORGANISER
    Server->>DB: INSERT into group_members (payout_order=1)
    DB-->>Server: group data with invite_code
    Server-->>API: 201 + group
    API-->>CreateGroup: Response
    CreateGroup->>CreateGroup: Show invite code
    CreateGroup->>CreateGroup: Copy to clipboard
    Organiser-->>Organiser: Share invite code with members
```

### Contribution Recording Flow

```mermaid
sequenceDiagram
    participant Organiser
    participant GroupDetail as GroupDetailPage
    participant API as Axios API
    participant Server as Express Server
    participant DB as Supabase/PG

    Organiser->>GroupDetail: Click "Mark Paid" for a member
    GroupDetail->>GroupDetail: Open payment modal
    Organiser->>GroupDetail: Confirm payment
    GroupDetail->>API: POST /api/contributions
    
    API->>Server: POST /api/contributions
    Server->>Server: authenticateToken
    Server->>Server: requireOrganiser (via body.groupId)
    Server->>Server: Validate amount matches contribution_amount
    Server->>DB: INSERT into contributions
    Server->>DB: SELECT increment_total_collected(cycle_id, amount)
    DB-->>Server: Success
    Server-->>API: 201 + contribution
    API-->>GroupDetail: Response
    GroupDetail->>GroupDetail: Refresh cycle data
    GroupDetail-->>Organiser: Updated progress bar
```

---

## Component Interaction

### Frontend-Backend Communication

| Aspect | Implementation |
|---|---|
| **Protocol** | HTTP/HTTPS |
| **Data Format** | JSON |
| **Authentication** | Bearer JWT in `Authorization` header |
| **CORS** | Configured server-side to accept only `CLIENT_URL` |
| **Error Format** | Consistent `{ success, error: { message } }` envelope |

### Frontend-Supabase Communication

| Aspect | Implementation |
|---|---|
| **Auth Operations** | Via Express backend (proxied to Supabase) |
| **Session Management** | Supabase browser SDK (`supabase.auth.getSession()`, `onAuthStateChange`) |
| **Token Operations** | `setSession()` after login/register |

---

## Performance Considerations

### Current Optimisations

- **Database indexes** — 6 composite/single-column indexes on frequently queried foreign keys
- **Atomic RPCs** — Single-statement PostgreSQL functions for counter updates (no read-modify-write round trips)
- **Request validation** — Early rejection of invalid requests before database operations
- **Body size limit** — 10KB maximum payload prevents abuse
- **Response shaping** — Controllers return only required fields (no over-fetching)

### Bottlenecks

- **Single server** — No horizontal scaling for the Express API
- **No caching** — Every request hits the database directly
- **No connection pooling tuning** — Default Supabase client pool configuration
- **Synchronous operations** — No background job queue for non-critical operations
