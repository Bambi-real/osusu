# Authentication Architecture

## Overview

Osusu uses **Supabase Auth** as the authentication provider, integrated with a custom Express backend. Authentication is stateless using JSON Web Tokens (JWTs), with the frontend managing session state through the Supabase browser SDK.

This document explains the complete authentication flow from registration through daily session management.

---

## Architecture

```mermaid
graph TB
    subgraph Frontend["Frontend — React SPA"]
        A1[AuthContext]
        A2[Axios Interceptor]
        A3[Supabase Browser SDK]
        A4[Login/Register Pages]
        
        A1 --> A2
        A2 --> A3
        A4 --> A1
    end

    subgraph Backend["Backend — Express 5"]
        B1[Auth Routes]
        B2[Rate Limiter<br/>20 req / 15 min]
        B3[authenticateToken<br/>Middleware]
        B4[Auth Controller]
        B5[Other Protected Routes]
        
        B1 --> B2
        B2 --> B4
        B3 --> B5
        B4 --> B3
    end

    subgraph Supabase["Supabase"]
        C1[Supabase Auth API]
        C2[PostgreSQL auth.users]
        C3[PostgreSQL public.profiles]
        C4[JWT Token Validation]
        
        C1 --> C2
        C2 --> C3
    end

    A3 -->|Anon Key| C1
    B4 -->|Service Role Key| C1
    B3 -->|Service Role Key| C4
    C4 --> C2
```

---

## Authentication Flows

### 1. Registration Flow

```mermaid
sequenceDiagram
    participant User
    participant Register as RegisterPage
    participant Context as AuthContext
    participant Axios as Axios Interceptor
    participant Server as Auth Controller
    participant Supa as Supabase Auth
    participant DB as PostgreSQL

    User->>Register: Enter fullName, email, phone, password
    User->>Register: Submit form
    
    Register->>Register: Client-side validation
    Register->>Axios: POST /api/auth/register
    
    Note over Axios: Request interceptor skips auth for public endpoints
    Axios->>Server: { fullName, email, phone, password }
    
    Server->>Server: Validate phone format (+220XXXXXXX)
    Server->>DB: Check phone uniqueness in profiles
    DB-->>Server: Phone available
    
    Server->>Supa: supabaseAdmin.auth.admin.createUser({ email, password, user_metadata })
    Note over Server,Supa: Service role bypasses email confirmation
    
    Supa->>DB: Create auth.users row
    DB->>DB: Trigger → handle_new_user()
    DB->>DB: INSERT into profiles
    DB-->>Supa: User created
    
    Server->>Supa: supabaseAnon.auth.signInWithPassword(email, password)
    Supa-->>Server: { access_token, refresh_token, user }
    
    Server->>DB: Fetch profile
    DB-->>Server: { id, fullName, email, phone, role }
    
    Server-->>Axios: 201 { access_token, refresh_token, user }
    
    Axios-->>Register: Response data
    
    Register->>Register: supabase.auth.setSession({ access_token, refresh_token })
    Register->>Context: setLoggedInUser(user)
    Context-->>Register: Auth state updated
    
    Register-->>User: Redirect to /dashboard
```

**Key details:**
- Phone is checked **before** user creation to provide specific feedback
- `supabaseAdmin.auth.admin.createUser()` with `email_confirm: true` skips email confirmation
- A database trigger automatically inserts the `profiles` row
- The server has a fallback that manually checks/inserts the profile
- After registration, the user is immediately signed in (no email verification required)

### 2. Login Flow

```mermaid
sequenceDiagram
    participant User
    participant Login as LoginPage
    participant Context as AuthContext
    participant Axios as Axios Interceptor
    participant Server as Auth Controller
    participant Supa as Supabase Auth

    User->>Login: Enter email, password
    User->>Login: Submit
    
    Login->>Login: Client-side validation
    Login->>Axios: POST /api/auth/login
    
    Axios->>Server: { email, password }
    
    Server->>Supa: supabaseAnon.auth.signInWithPassword(email, password)
    
    alt Invalid credentials
        Supa-->>Server: Error
        Server-->>Axios: 401
        Axios-->>Login: Error response
        Login-->>User: Show "Invalid email or password"
    else Valid credentials
        Supa-->>Server: { access_token, refresh_token, user }
        Server->>Server: Fetch profile from profiles table
        Server-->>Axios: 200 { access_token, refresh_token, user }
        Axios-->>Login: Response
        
        Login->>Login: supabase.auth.setSession({ access_token, refresh_token })
        Login->>Context: setLoggedInUser(user)
        Context-->>Login: Auth state updated
        Login-->>User: Redirect to /dashboard
    end
```

### 3. Authenticated Request Flow

```mermaid
sequenceDiagram
    participant Page as Protected Page
    participant Axios as Axios Instance
    participant Supa as Supabase SDK
    participant Server as Express Server
    participant Auth as auth Middleware

    Page->>Axios: api.get('/groups/my')
    
    Axios->>Axios: Check public route whitelist
    Note over Axios: Login, register, forgot-password, reset-password are excluded
    
    Axios->>Supa: supabase.auth.getSession()
    
    alt No session
        Supa-->>Axios: null
        Axios-->>Page: Proceed without token
        Note over Axios,Page: Server will return 401
    else Valid session
        Supa-->>Axios: { access_token, ... }
        Axios->>Axios: Attach Authorization: Bearer {token}
        Axios->>Server: Request with Bearer token
        
        Server->>Auth: authenticateToken
        Auth->>Auth: Extract token from header
        Auth->>Supa: supabaseAdmin.auth.getUser(token)
        
        alt Valid token
            Supa-->>Auth: { user }
            Auth->>Auth: req.user = user
            Auth-->>Server: next()
            Server->>Server: Process request
            Server-->>Axios: Response
            Axios-->>Page: Data
        else Invalid/expired
            Supa-->>Auth: null
            Auth-->>Server: 401
            Server-->>Axios: 401
            
            Axios->>Supa: Check if session exists
            alt No session
                Axios->>Supa: supabase.auth.signOut()
                Axios->>Page: Redirect to /login?reason=session_expired
            end
        end
    end
```

### 4. Session Restoration on Page Load

```mermaid
sequenceDiagram
    participant Browser
    participant App as App.jsx
    participant Context as AuthContext
    participant Supa as Supabase SDK
    participant Server as Express Server

    Browser->>App: Page reload / new tab
    
    Context->>Context: loading = true
    Context->>Supa: supabase.auth.getSession()
    
    alt Existing session found
        Supa-->>Context: { session }
        Context->>Server: GET /api/auth/me (via Axios interceptor)
        Server->>Server: authenticateToken
        Server-->>Context: { user }
        Context->>Context: user = profile, loading = false
        Context-->>App: <Spinner /> replaced with content
    else No session
        Supa-->>Context: null
        Context->>Context: loading = false
        Context-->>App: Show public routes (login/landing)
    end
    
    Context->>Supa: Subscribe to onAuthStateChange
    Note over Context,Supa: Listen for SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, PASSWORD_RECOVERY
```

### 5. Forgot Password Flow

```mermaid
sequenceDiagram
    participant User
    participant FP as ForgotPasswordPage
    participant Server as Auth Controller
    participant Supa as Supabase Auth

    User->>FP: Enter email
    FP->>Server: POST /api/auth/forgot-password { email }
    
    Server->>Server: Validate email format
    
    Note over Server: Always returns same message regardless of email existence
    Server->>Supa: supabaseAdmin.auth.resetPasswordForEmail(email, { redirectTo })
    
    alt Email exists
        Supa->>User: Send password reset email
    else Email does not exist
        Note over Server: Silently swallow error — prevent enumeration
    end
    
    Server-->>FP: 200 { message: "Check your email..." }
    FP-->>User: Show "Check your email" screen
```

### 6. Reset Password Flow

```mermaid
sequenceDiagram
    participant User
    participant RP as ResetPasswordPage
    participant Supa as Supabase SDK
    participant Server as Auth Controller

    User->>Browser: Click reset link in email
    
    RP->>RP: Subscribe to onAuthStateChange
    RP->>Supa: supabase.auth.getSession()
    
    alt PASSWORD_RECOVERY event received within timeout
        Supa-->>RP: { session.access_token }
        RP->>RP: Show new password form
        User->>RP: Enter new password
        RP->>Server: POST /api/auth/reset-password { newPassword, accessToken }
        Server->>Server: Validate newPassword (min 8 chars)
        Server->>Supa: supabaseAdmin.auth.getUser(accessToken)
        Server->>Supa: supabaseAdmin.auth.admin.updateUserById(user.id, { password })
        Server-->>RP: Success
        RP-->>User: Redirect to /login?reason=password_reset
    else Timeout (5 seconds)
        RP->>RP: Show "Link expired or invalid"
    end
```

---

## Token Management

### Why a Custom Auth Backend?

Supabase Auth can be used directly from the browser, but Osusu uses a custom Express backend for:

1. **Additional validation** — Phone format enforcement, duplicate phone checking
2. **Token synchronisation control** — Explicit `setSession()` call after auth
3. **Profile enrichment** — Returning combined auth + profile data
4. **Rate limiting** — Server-defined limits on auth endpoints
5. **Future extensibility** — Easy to add custom auth logic (2FA, device management)

### Token Flow

| Step | Action | Component |
|---|---|---|
| 1 | User submits credentials | LoginPage / RegisterPage |
| 2 | Server authenticates via Supabase | Auth Controller |
| 3 | Tokens returned to frontend | API Response |
| 4 | Tokens synced to Supabase SDK | `supabase.auth.setSession()` |
| 5 | Token attached to every request | Axios request interceptor |
| 6 | Token verified server-side | `authenticateToken` middleware |
| 7 | Auto-refresh on expiry | Supabase SDK handles transparently |
| 8 | On 401, check and redirect | Axios response interceptor |

### Security Considerations

| Consideration | Implementation |
|---|---|
| **Token storage** | Supabase SDK manages tokens in memory + localStorage. AGENTS.md states "Do not use localStorage" but this refers to manual token management, not the SDK's internal persistence. |
| **Token exposure** | Tokens are sent only in `Authorization` headers (never in URLs or body) |
| **Token lifetime** | Supabase access tokens expire after 1 hour; refresh tokens handle silent renewal |
| **Service role key** | Never exposed to the frontend — only used server-side |
| **Session persistence** | `supabase.auth.setSession()` stores tokens so `getSession()` returns them on page reload |

---

## Route Protection

### Frontend Route Guards

Three guard patterns are used in `App.jsx`:

| Guard | Behavior |
|---|---|
| `ProtectedRoute` | If `loading`, show spinner. If no `user`, redirect to `/login`. Otherwise render children. |
| `PublicRoute` | If `loading`, show spinner. If `user` exists, redirect to `/dashboard`. Otherwise render children. |
| `HomeRoute` | If `loading`, show spinner. If `user`, redirect to `/dashboard`. Otherwise render `<LandingPage />`. |

### Backend Route Protection

| Level | Mechanism | Scope |
|---|---|---|
| **All data routes** | `authenticateToken` middleware | `/api/groups/*`, `/api/contributions/*`, `/api/cycles/*`, some `/api/auth/*` |
| **Organiser-only** | `requireOrganiser` middleware | POST DELETE `/groups/:id`, PUT `/groups/:id/cancel`, POST `/groups/:id/start`, POST `/contributions`, PUT `/cycles/:id/complete` |
| **Rate-limited** | `rateLimit({ windowMs, max: 20 })` | All `/api/auth/*` endpoints |
| **Unprotected** | None | GET `/api/health`, POST `/api/auth/login`, POST `/api/auth/register`, POST `/api/auth/forgot-password`, POST `/api/auth/reset-password` |

---

## Error States

| Scenario | HTTP Status | Frontend Behaviour |
|---|---|---|
| Invalid email/password | 401 | Show "Invalid email or password" |
| Email already registered | 409 | Show "An account with this email already exists" |
| Phone already registered | 409 | Show "Phone number already in use" |
| Invalid phone format | 400 | Show "Phone must be in +220XXXXXXX format" |
| Weak password | 400 | Show "Password must be at least 8 characters" |
| Session expired | 401 + no session | Redirect to `/login?reason=session_expired` |
| Unexpected server error | 500 | Show "Something went wrong. Please try again." |
