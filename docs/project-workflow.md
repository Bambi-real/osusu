# Project Workflow

## Overview

This document describes the complete user workflows through the Osusu application, from initial registration through group lifecycle to contribution recording.

---

## User Roles

```mermaid
graph TB
    subgraph Roles["User Roles"]
        Member["🧑 Member<br/>- Join groups via invite code<br/>- View payout schedule<br/>- View contribution history<br/>- Edit profile"]
        Organiser["👑 Organiser<br/>- All Member permissions<br/>- Create groups<br/>- Record contributions<br/>- Start/cancel groups<br/>- Complete cycles<br/>- Delete groups (FORMING only)"]
    end

    Member -.->|Becomes organiser<br/>when creating a group| Organiser
```

---

## User Registration and Onboarding

```mermaid
sequenceDiagram
    participant User
    participant Landing as Landing Page
    participant Register as Registration
    participant Auth as Auth System
    participant Dashboard

    User->>Landing: Visit osusu.app
    Landing->>Landing: Show marketing page

    User->>Register: Click "Get Started" / "Register"
    User->>Register: Fill registration form<br/>(Name, Email, Phone, Password)

    Register->>Register: Validate inputs
    Register->>Register: Validate phone (+220XXXXXXX)
    Register->>Register: Validate password (min 8 chars)

    Register->>API: POST /api/auth/register
    API->>API: Check phone uniqueness
    API->>Supabase: Create auth user
    API->>Supabase: Create profile (trigger)
    API->>Supabase: Sign in (create session)
    API-->>Register: { access_token, refresh_token, user }

    Register->>Supabase SDK: setSession(access_token, refresh_token)
    Register->>AuthContext: setLoggedInUser(user)
    AuthContext-->>Dashboard: User authenticated

    Dashboard-->>User: Welcome! Start creating or joining groups
```

---

## Group Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Forming : Create Group
    Forming --> Forming : Members join via invite code
    Forming --> Active : Start Group (organiser)
    Forming --> [*] : Delete (organiser)

    Active --> Active : Record contributions<br/>Complete cycles
    Active --> Cancelled : Cancel (organiser)
    Active --> Completed : All cycles paid out

    Cancelled --> [*] : Archived (records preserved)
    Completed --> [*] : Natural end
```

---

## Complete User Flow Map

```mermaid
graph TB
    subgraph Onboarding["1. Onboarding"]
        A[Visit Site] --> B{Has Account?}
        B -->|No| C[Register]
        B -->|Yes| D[Login]
        C --> E[Dashboard]
        D --> E
    end

    subgraph Groups["2. Groups"]
        E --> F{Has Groups?}
        F -->|No| G[Create Group or Join Group]
        F -->|Yes| H[View Groups]
        G --> I{Create or Join?}
        I -->|Create| J[Fill Group Details<br/>Name, Amount, Frequency, etc.]
        I -->|Join| K[Enter Invite Code]
        J --> L[Share Invite Code<br/>with Members]
        K --> M[Join Group]
        L --> N[Wait for Members to Join]
        M --> H
        N --> H
    end

    subgraph Start["3. Start Group"]
        H --> O{Group Forming?}
        O -->|Yes - I'm Organiser| P{Enough Members?}
        O -->|Yes - I'm Member| Q[Wait for Organiser]
        P -->|Need More| R[Share Invite Code]
        P -->|Ready 2+| S[Start Group]
        S --> T[System shuffles members<br/>and creates schedule]
    end

    subgraph Contribute["4. Contribute"]
        T --> U[Group is ACTIVE]
        U --> V[Organiser records<br/>member payments]
        V --> W[Progress bar updates]
        W --> X{All members paid?}
        X -->|Yes| Y[Organiser marks<br/>Cycle Complete]
        X -->|No| V
        Y --> Z{More cycles?}
        Z -->|Yes| U
    end

    subgraph Complete["5. Complete / Cancel"]
        Z -->|No| AA[Group COMPLETED]
        U --> AB[Organiser Cancels]
        AB --> AC[Group CANCELLED<br/>Records preserved]
    end
```

---

## Detailed Workflows

### 1. Creating a Group

```mermaid
sequenceDiagram
    participant Organiser
    participant Create as CreateGroupPage
    participant API
    participant DB

    Organiser->>Create: Navigate to /groups/new
    Create->>Create: Show step 1: Basic Details
    Organiser->>Create: Enter: Name, Description, Amount
    Organiser->>Create: Click "Next"

    Create->>Create: Show step 2: Rules
    Organiser->>Create: Select: Frequency, Max Members, Start Date
    Organiser->>Create: Click "Next"

    Create->>Create: Show step 3: Review Summary
    Organiser->>Create: Click "Create Group"

    Create->>API: POST /api/groups
    API->>DB: INSERT into groups
    API->>DB: UPDATE profile → ORGANISER
    API->>DB: INSERT into group_members (payout_order=1)
    DB-->>API: Group with invite_code
    API-->>Create: 201 + group data

    Create->>Create: Show success screen with invite code
    Organiser->>Organiser: Copy invite code
    Organiser->>Organiser: Share code with friends
```

**Business rules enforced:**
- Group name: 3-60 characters
- Contribution amount: minimum 50
- Max members: 2-50
- Start date: must be today or in the future
- Creator automatically becomes organiser (role promoted from MEMBER)
- Creator is automatically added as member #1 (payout_order = 1)

### 2. Joining a Group

```mermaid
sequenceDiagram
    participant Member
    participant Dashboard
    participant Modal
    participant API
    participant DB

    Member->>Dashboard: Navigate to /dashboard
    Member->>Modal: Click "Join Group"
    Modal->>Modal: Show invite code input

    Member->>Modal: Enter invite code
    Member->>Modal: Click "Join"

    Modal->>API: POST /api/groups/join { inviteCode }
    API->>DB: Find group by invite_code

    alt Group not found
        DB-->>API: null
        API-->>Modal: 404 "Invalid invite code"
        Modal-->>Member: Show error
    else Group not FORMING
        DB-->>API: Group status != FORMING
        API-->>Modal: 400 "Group is not accepting members"
        Modal-->>Member: Show error
    else Group full
        DB-->>API: Member count >= max_members
        API-->>Modal: 400 "Group is full"
        Modal-->>Member: Show error
    else Already a member
        DB-->>API: Existing membership found
        API-->>Modal: 409 "Already a member"
        Modal-->>Member: Show error
    else Success
        API->>DB: INSERT into group_members (payout_order = count + 1)
        DB-->>API: Membership created
        API-->>Modal: 200 { groupId }
        Modal-->>Dashboard: Navigate to group
        Dashboard-->>Member: Show group detail
    end
```

### 3. Starting a Group (Activation)

```mermaid
sequenceDiagram
    participant Organiser
    participant GroupDetail
    participant API
    participant Utils
    participant DB

    Organiser->>GroupDetail: Click "Start Group"
    GroupDetail->>GroupDetail: Show confirmation prompt
    Organiser->>GroupDetail: Confirm

    GroupDetail->>API: POST /api/groups/:id/start

    API->>DB: Fetch group (verify organiser, status)
    DB-->>API: Group data

    API->>API: Validate 2+ members

    API->>DB: Fetch all members
    DB-->>API: Members array

    API->>Utils: shuffle(members)
    API->>Utils: generatePayoutSchedule(group, shuffledMembers)
    Utils-->>API: Cycles array

    API->>DB: Update payout_orders (new shuffled order)
    DB-->>API: Updated

    API->>DB: INSERT all cycles (batch)
    DB-->>API: Cycles created

    API->>DB: UPDATE group status = 'ACTIVE'
    DB-->>API: Updated group

    alt Any step fails
        API->>DB: Rollback changes
        API-->>GroupDetail: Error message
    end

    API-->>GroupDetail: 200 + updated group
    GroupDetail->>GroupDetail: Show schedule tab
    GroupDetail-->>Organiser: Group is now active
```

**What happens when a group starts:**
1. Members are shuffled using Fisher-Yates algorithm (unbiased random)
2. Each member gets a new `payout_order` (1 through N)
3. One cycle is created per member in payout order
4. First cycle immediately becomes `COLLECTING`
5. Group status updates to `ACTIVE`
6. If any step fails, all changes are rolled back

### 4. Recording Contributions

```mermaid
sequenceDiagram
    participant Organiser
    participant GroupDetail
    participant Modal as Payment Modal
    participant API
    participant DB

    Organiser->>GroupDetail: Navigate to group
    GroupDetail->>GroupDetail: Show Contributions tab
    GroupDetail->>GroupDetail: Show current cycle members

    Organiser->>Modal: Click "Mark Paid" for a member
    Modal->>Modal: Show payment confirmation

    Organiser->>Modal: Confirm payment
    Modal->>API: POST /api/contributions { groupId, cycleId, userId, amount }

    API->>DB: Fetch group (verify organiser, amount)
    API->>DB: Fetch cycle (verify group ownership)
    API->>DB: Fetch member (verify membership)
    API->>DB: INSERT into contributions
    API->>DB: SELECT increment_total_collected(cycleId, amount)
    DB-->>API: Success

    API-->>Modal: 201 + contribution data
    Modal->>GroupDetail: Refresh cycle data
    GroupDetail->>GroupDetail: Update progress bar
    GroupDetail-->>Organiser: Member now shown as paid
```

**Business rules enforced:**
- Only the group organiser can record contributions
- Contribution amount must match exactly `group.contribution_amount`
- Each member can contribute only once per cycle
- `total_collected` is updated atomically via PostgreSQL RPC
- Cannot contribute to a cancelled group

### 5. Completing a Cycle

```mermaid
sequenceDiagram
    participant Organiser
    participant GroupDetail
    participant API
    participant DB

    Organiser->>GroupDetail: Click "Complete Cycle"
    GroupDetail->>GroupDetail: Show confirmation
    Organiser->>GroupDetail: Confirm

    GroupDetail->>API: PUT /api/cycles/:id/complete
    API->>DB: Fetch cycle
    API->>DB: Fetch group (verify organiser, not cancelled)
    API->>DB: UPDATE cycle status = 'PAID_OUT'
    API->>DB: Find next PENDING cycle

    alt Next cycle exists
        API->>DB: UPDATE next cycle status = 'COLLECTING'
    else No more cycles
        API->>DB: UPDATE group status = 'COMPLETED'
    end

    DB-->>API: Updated data
    API-->>GroupDetail: 200 + updated cycle

    GroupDetail->>GroupDetail: Refresh
    GroupDetail-->>Organiser: Cycle complete, next cycle active
```

### 6. Deleting vs Cancelling a Group

```mermaid
flowchart TD
    A[Organiser wants to end group] --> B{Group status?}
    
    B -->|FORMING| C[Hard Delete]
    C --> D[Group + members + related data<br/>permanently removed from database]
    D --> E[Member is notified group is gone]
    
    B -->|ACTIVE| F[Cancel (Soft Delete)]
    F --> G[Group status → CANCELLED]
    G --> H[All contribution records preserved]
    H --> I[Group appears under "Archived" in dashboard]
    H --> J[No further actions possible]
    
    B -->|COMPLETED| K[Group already ended naturally]
    K --> L[Permanently viewable, no actions available]
```

---

## Data Visibility Rules

| Data | Member | Organiser |
|---|---|---|
| Group name and details | ✅ Full view | ✅ Full view |
| Member list | ✅ All members visible | ✅ All members visible |
| Payout schedule | ✅ All cycles visible | ✅ All cycles visible |
| Contribution records | ✅ Own + aggregate totals | ✅ All member records |
| Organiser actions | ❌ Cannot access | ✅ Full control |
| Invite code | ❌ Hidden (unless organiser shared it) | ✅ Visible in group overview |
| Archived groups | ✅ Visible under "Archived" section | ✅ Visible under "Archived" section |
