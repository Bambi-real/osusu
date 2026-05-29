# API Reference

## Overview

**Base URL:** `/api`  
**Response Envelope:** `{ success: boolean, data?: any, error?: { message: string } }`  
**Auth Header:** `Authorization: Bearer <supabase_access_token>` (on protected routes)

---

## HTTP Status Codes

| Code | Meaning | When |
|---|---|---|
| 200 | OK | Successful GET/PUT |
| 201 | Created | Successful POST |
| 400 | Bad Request | Validation error, missing/invalid fields |
| 401 | Unauthorised | Missing/invalid/expired auth token |
| 403 | Forbidden | Authenticated but not authorised |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Duplicate resource (email, phone, membership, contribution) |
| 500 | Internal Server Error | Unhandled server error |

---

## Health Check

### `GET /api/health`

Simple health check to verify the server is running.

**Auth:** None  
**Rate Limited:** No

**Response `200`:**

```json
{
  "status": "ok",
  "timestamp": "2026-05-29T10:30:00.000Z"
}
```

---

## Authentication

All auth endpoints are rate-limited: **20 requests per 15-minute window**.

### `POST /api/auth/register`

Create a new user account.

**Auth:** None

**Request Body:**

```json
{
  "fullName": "Musa Bah",
  "email": "musa@example.com",
  "phone": "+2201234567",
  "password": "securePassword123"
}
```

**Validation Rules:**

| Field | Required | Constraints |
|---|---|---|
| `fullName` | Yes | 2-80 characters |
| `email` | Yes | Valid email format |
| `phone` | Yes | Must match `/^\+220[0-9]{7}$/` |
| `password` | Yes | Minimum 8 characters |

**Response `201`:**

```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_at": 1716971400,
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "musa@example.com",
      "fullName": "Musa Bah",
      "phone": "+2201234567",
      "role": "MEMBER",
      "createdAt": "2026-05-29T10:30:00.000Z"
    }
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 400 | Missing required field | `"fullName is required"` |
| 400 | Invalid phone | `"Phone must be in +220XXXXXXX format"` |
| 409 | Duplicate email | `"An account with this email already exists"` |
| 409 | Duplicate phone | `"Phone number already in use"` |

---

### `POST /api/auth/login`

Sign in with existing credentials.

**Auth:** None

**Request Body:**

```json
{
  "email": "musa@example.com",
  "password": "securePassword123"
}
```

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_at": 1716971400,
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "musa@example.com",
      "fullName": "Musa Bah",
      "phone": "+2201234567",
      "role": "MEMBER",
      "createdAt": "2026-05-29T10:30:00.000Z"
    }
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 400 | Missing field | `"Email and password are required"` |
| 401 | Invalid credentials | `"Invalid email or password"` |

---

### `POST /api/auth/forgot-password`

Request a password reset email. **Always returns 200** to prevent email enumeration.

**Auth:** None

**Request Body:**

```json
{
  "email": "musa@example.com"
}
```

**Response `200`:**

```json
{
  "success": true,
  "data": null,
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

---

### `POST /api/auth/reset-password`

Reset password using the token from the reset email.

**Auth:** None

**Request Body:**

```json
{
  "newPassword": "newSecurePass456",
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response `200`:**

```json
{
  "success": true,
  "data": null,
  "message": "Password has been reset successfully."
}
```

---

### `GET /api/auth/me`

Get the authenticated user's profile.

**Auth:** Required

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "musa@example.com",
    "fullName": "Musa Bah",
    "phone": "+2201234567",
    "role": "ORGANISER",
    "createdAt": "2026-05-29T10:30:00.000Z"
  }
}
```

---

### `PUT /api/auth/profile`

Update the authenticated user's profile.

**Auth:** Required

**Request Body:**

```json
{
  "fullName": "Musa Bah Updated",
  "phone": "+2207654321"
}
```

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "musa@example.com",
    "fullName": "Musa Bah Updated",
    "phone": "+2207654321",
    "role": "ORGANISER",
    "createdAt": "2026-05-29T10:30:00.000Z"
  }
}
```

---

### `POST /api/auth/change-password`

Change the authenticated user's password.

**Auth:** Required

**Request Body:**

```json
{
  "newPassword": "newSecurePassword789"
}
```

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "message": "Password changed successfully"
  }
}
```

---

## Groups

### `POST /api/groups`

Create a new savings group. The creator becomes the organiser and first member.

**Auth:** Required  
**Organiser:** Automatically assigned

**Request Body:**

```json
{
  "name": "Banjul Savings Circle",
  "description": "Weekly savings for market vendors",
  "contributionAmount": 500,
  "frequency": "WEEKLY",
  "maxMembers": 10,
  "startDate": "2026-06-01T00:00:00.000Z"
}
```

**Validation Rules:**

| Field | Required | Constraints |
|---|---|---|
| `name` | Yes | 3-60 characters |
| `description` | No | — |
| `contributionAmount` | Yes | Number, minimum 50 |
| `frequency` | Yes | One of: `DAILY`, `WEEKLY`, `MONTHLY` |
| `maxMembers` | Yes | Integer, 2-50 |
| `startDate` | Yes | Must be today or in the future |

**Response `201`:**

```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "name": "Banjul Savings Circle",
    "description": "Weekly savings for market vendors",
    "contributionAmount": 500,
    "frequency": "WEEKLY",
    "maxMembers": 10,
    "startDate": "2026-06-01T00:00:00.000Z",
    "status": "FORMING",
    "inviteCode": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "organiserId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2026-05-29T10:30:00.000Z"
  }
}
```

---

### `GET /api/groups/my`

List all groups the authenticated user belongs to.

**Auth:** Required

**Response `200`:**

```json
{
  "success": true,
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Banjul Savings Circle",
      "description": "Weekly savings for market vendors",
      "contributionAmount": 500,
      "frequency": "WEEKLY",
      "maxMembers": 10,
      "startDate": "2026-06-01T00:00:00.000Z",
      "status": "FORMING",
      "inviteCode": "a1b2c3d4...",
      "organiserId": "550e8400-e29b-41d4-a716-446655440000",
      "createdAt": "2026-05-29T10:30:00.000Z",
      "payoutOrder": 1,
      "memberCount": 3
    }
  ]
}
```

---

### `POST /api/groups/join`

Join a group using its invite code.

**Auth:** Required

**Request Body:**

```json
{
  "inviteCode": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "groupId": "660e8400-e29b-41d4-a716-446655440001"
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 400 | Group not forming | `"Group is not currently accepting members"` |
| 400 | Group full | `"Group is full"` |
| 404 | Invalid code | `"Invalid invite code"` |
| 409 | Already member | `"You are already a member of this group"` |

---

### `GET /api/groups/:id`

Get full group details including members, current cycle, and organiser info.

**Auth:** Required (must be a member)

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "group": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Banjul Savings Circle",
      "description": "Weekly savings for market vendors",
      "contributionAmount": 500,
      "frequency": "WEEKLY",
      "maxMembers": 10,
      "startDate": "2026-06-01T00:00:00.000Z",
      "status": "ACTIVE",
      "inviteCode": "a1b2c3d4-...",
      "organiserId": "550e8400-e29b-41d4-a716-446655440000",
      "memberCount": 3,
      "createdAt": "2026-05-29T10:30:00.000Z"
    },
    "members": [
      {
        "id": "770e8400-e29b-41d4-a716-446655440002",
        "userId": "550e8400-...",
        "payoutOrder": 2,
        "joinedAt": "2026-05-29T11:00:00.000Z",
        "user": {
          "id": "550e8400-...",
          "fullName": "Musa Bah",
          "email": "musa@example.com",
          "phone": "+2201234567"
        }
      }
    ],
    "currentCycle": {
      "id": "880e8400-e29b-41d4-a716-446655440003",
      "cycleNumber": 1,
      "dueDate": "2026-06-01T00:00:00.000Z",
      "totalExpected": 1500,
      "totalCollected": 500,
      "status": "COLLECTING",
      "payoutUser": {
        "id": "550e8400-...",
        "fullName": "Fatou Sowe"
      },
      "contributions": [
        {
          "id": "990e8400-...",
          "userId": "550e8400-...",
          "amount": 500,
          "paidAt": "2026-06-01T10:00:00.000Z"
        }
      ]
    },
    "organiser": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "fullName": "Musa Bah"
    }
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 403 | Not a member | `"You are not a member of this group"` |
| 404 | Invalid ID | `"Group not found"` |

---

### `POST /api/groups/:id/start`

Start the group — shuffle members, generate payout schedule, set status to ACTIVE.

**Auth:** Required  
**Organiser:** Required

**Request Body:** None

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "id": "660e8400-...",
    "status": "ACTIVE",
    "startDate": "2026-06-01T00:00:00.000Z"
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 400 | < 2 members | `"Group must have at least 2 members to start"` |
| 400 | Invalid status | `"Group cannot be started from its current status"` |

---

### `PUT /api/groups/:id/cancel`

Cancel an active group (soft delete — records preserved).

**Auth:** Required  
**Organiser:** Required

**Request Body:** None

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "id": "660e8400-...",
    "status": "CANCELLED",
    "message": "Group cancelled. All contribution records have been preserved."
  }
}
```

---

### `DELETE /api/groups/:id`

Delete a group that is in FORMING status (hard delete — cascades).

**Auth:** Required  
**Organiser:** Required

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "message": "Group deleted successfully"
  }
}
```

---

### `GET /api/groups/:id/schedule`

Get the full payout schedule for a group.

**Auth:** Required

**Response `200`:**

```json
{
  "success": true,
  "data": [
    {
      "id": "880e8400-...",
      "cycleNumber": 1,
      "dueDate": "2026-06-01T00:00:00.000Z",
      "totalExpected": 1500,
      "totalCollected": 500,
      "status": "COLLECTING",
      "payoutUser": {
        "id": "550e8400-...",
        "fullName": "Fatou Sowe"
      }
    },
    {
      "id": "880e8400-...",
      "cycleNumber": 2,
      "dueDate": "2026-06-08T00:00:00.000Z",
      "totalExpected": 1500,
      "totalCollected": 0,
      "status": "PENDING",
      "payoutUser": {
        "id": "550e8400-...",
        "fullName": "Musa Bah"
      }
    }
  ]
}
```

---

### `GET /api/groups/:id/members`

List all members of a group with payout order.

**Auth:** Required

**Response `200`:**

```json
{
  "success": true,
  "data": [
    {
      "id": "770e8400-...",
      "userId": "550e8400-...",
      "payoutOrder": 1,
      "joinedAt": "2026-05-29T10:30:00.000Z",
      "user": {
        "id": "550e8400-...",
        "fullName": "Musa Bah"
      }
    }
  ]
}
```

---

## Contributions

### `POST /api/contributions`

Record a contribution for a member in a cycle.

**Auth:** Required  
**Organiser:** Required

**Request Body:**

```json
{
  "groupId": "660e8400-...",
  "cycleId": "880e8400-...",
  "userId": "550e8400-...",
  "amount": 500
}
```

**Validation:**

| Field | Required | Constraints |
|---|---|---|
| `groupId` | Yes | Valid UUID |
| `cycleId` | Yes | Valid UUID, must belong to groupId |
| `userId` | Yes | Valid UUID, must be a group member |
| `amount` | Yes | Must equal group's `contributionAmount` |

**Response `201`:**

```json
{
  "success": true,
  "data": {
    "id": "990e8400-...",
    "groupId": "660e8400-...",
    "cycleId": "880e8400-...",
    "userId": "550e8400-...",
    "amount": 500,
    "paidAt": "2026-06-01T10:00:00.000Z"
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 400 | Amount mismatch | `"Contribution amount must be exactly 500"` |
| 400 | Invalid amount | `"Amount must be greater than 0"` |
| 409 | Duplicate | `"This member has already contributed to this cycle"` |
| 403 | Not organiser | `"Only the group organiser can record contributions"` |

---

### `GET /api/contributions/group/:groupId`

Get all contributions for a group.

**Auth:** Required

**Response `200`:**

```json
{
  "success": true,
  "data": [
    {
      "id": "990e8400-...",
      "groupId": "660e8400-...",
      "cycleId": "880e8400-...",
      "userId": "550e8400-...",
      "amount": 500,
      "paidAt": "2026-06-01T10:00:00.000Z",
      "user": {
        "id": "550e8400-...",
        "fullName": "Musa Bah"
      }
    }
  ]
}
```

---

### `GET /api/contributions/my`

Get all contributions by the authenticated user.

**Auth:** Required

**Response `200`:**

```json
{
  "success": true,
  "data": [
    {
      "id": "990e8400-...",
      "groupId": "660e8400-...",
      "cycleId": "880e8400-...",
      "userId": "550e8400-...",
      "amount": 500,
      "paidAt": "2026-06-01T10:00:00.000Z",
      "group": {
        "id": "660e8400-...",
        "name": "Banjul Savings Circle"
      },
      "cycle": {
        "id": "880e8400-...",
        "cycleNumber": 1
      }
    }
  ]
}
```

---

### `DELETE /api/contributions/:id`

Delete a contribution (undo).

**Auth:** Required  
**Organiser:** Required

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "message": "Contribution deleted successfully"
  }
}
```

---

## Cycles

### `GET /api/cycles/group/:groupId`

Get all cycles for a group.

**Auth:** Required

**Response `200`:**

```json
{
  "success": true,
  "data": [
    {
      "id": "880e8400-...",
      "groupId": "660e8400-...",
      "cycleNumber": 1,
      "dueDate": "2026-06-01T00:00:00.000Z",
      "totalExpected": 1500,
      "totalCollected": 500,
      "status": "COLLECTING",
      "payoutUser": {
        "id": "550e8400-...",
        "fullName": "Fatou Sowe"
      }
    }
  ]
}
```

---

### `GET /api/cycles/:id`

Get a single cycle with its contributions.

**Auth:** Required

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "id": "880e8400-...",
    "groupId": "660e8400-...",
    "cycleNumber": 1,
    "dueDate": "2026-06-01T00:00:00.000Z",
    "totalExpected": 1500,
    "totalCollected": 500,
    "status": "COLLECTING",
    "payoutUser": {
      "id": "550e8400-...",
      "fullName": "Fatou Sowe"
    },
    "contributions": [
      {
        "id": "990e8400-...",
        "userId": "550e8400-...",
        "amount": 500,
        "paidAt": "2026-06-01T10:00:00.000Z",
        "fullName": "Musa Bah"
      }
    ]
  }
}
```

---

### `PUT /api/cycles/:id/complete`

Mark a cycle as PAID_OUT and advance to the next cycle (or complete the group).

**Auth:** Required  
**Organiser:** Required

**Request Body:** None

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "id": "880e8400-...",
    "status": "PAID_OUT",
    "cycleNumber": 1,
    "nextCycleStatus": "COLLECTING"
  }
}
```
