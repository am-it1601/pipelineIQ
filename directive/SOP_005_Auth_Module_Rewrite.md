# SOP-005: Authentication & Authorization Module — Complete Rewrite (v2)

> **Status**: DRAFT v2 — Revised per review feedback  
> **Date**: 2026-04-11  
> **Scope**: Backend-only auth module rewrite for Pipeline IQ  
> **Provider**: Supabase Auth + Admin API  
> **Framework**: Next.js 16 (App Router)

---

## 1. Objective & Scope

### Objective
Design and implement a clean, modular, production-grade backend Authentication & Authorization module for Pipeline IQ using Supabase. This is a **complete rewrite** — no existing auth code will be inspected, reused, or adapted.

### In Scope
- New `public.users` table (replaces `profiles` for auth purposes)
- Full RBAC system: user groups, permissions, group-permission mappings
- Supabase Admin API integration for user lifecycle management
- 2FA / MFA (TOTP) enrollment, verification, and admin reset
- Admin-initiated password reset links and magic links
- Server Actions (`lib/auth/actions/`)
- Service Layer (`lib/auth/services/`)
- API Route Handlers (`app/api/auth/`) — mirrors server actions, returns OpenAPI-standard JSON
- Input validation with Zod schemas
- Structured error handling
- Auth-specific TypeScript types
- Database migrations for new tables, seed data, RLS policies

### Out of Scope
- Frontend UI components, pages, or styling
- Client-side auth state management
- Modification to existing auth code or `profiles` table
- Phone MFA (TOTP-only for now)

---

## 2. Assumptions

1. **Supabase project** `lrelaiwywltmhtvnobdc` (PipelineIQ) is active.
2. **Existing Supabase clients** are retained:
   - `lib/supabase/server.ts` — per-request server client
   - `lib/supabase/admin.ts` — service-role admin client
   - `lib/supabase/middleware.ts` — session refresh middleware
3. **Zod v4** is already installed.
4. `SUPABASE_SERVICE_ROLE_KEY` is already configured in `.env.local`.
5. The existing `profiles` table will **not** be modified. The new `public.users` table is introduced alongside it. Future migration can consolidate.
6. **No hardcoded role/group strings** anywhere in the application code. All group names and permissions are loaded from the database.

---

## 3. Database Schema Design

### 3.1 `public.users` — Core user table

Replaces `profiles` for the auth module. Stores identity and auth-relevant data only.

```sql
CREATE TABLE public.users (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  full_name       TEXT NOT NULL DEFAULT '',
  avatar_initials TEXT DEFAULT '',
  status          TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_status ON public.users(status);
```

### 3.2 `public.user_groups` — Role/Group definitions

```sql
CREATE TABLE public.user_groups (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT NOT NULL UNIQUE,       -- 'administrator', 'team_manager', etc.
  display_name TEXT NOT NULL,              -- 'Administrator', 'Team Manager', etc.
  description  TEXT,
  is_system    BOOLEAN NOT NULL DEFAULT false,  -- system groups cannot be deleted
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 3.3 `public.permissions` — Granular permission definitions

```sql
CREATE TABLE public.permissions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code         TEXT NOT NULL UNIQUE,       -- 'users:invite', 'leads:view_all', etc.
  display_name TEXT NOT NULL,
  description  TEXT,
  category     TEXT NOT NULL,              -- 'users', 'leads', 'analytics', 'team', 'settings'
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_permissions_category ON public.permissions(category);
```

### 3.4 `public.group_permissions` — Group ↔ Permission junction

```sql
CREATE TABLE public.group_permissions (
  group_id      UUID REFERENCES public.user_groups(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (group_id, permission_id)
);
```

### 3.5 `public.user_group_memberships` — User ↔ Group assignment

```sql
CREATE TABLE public.user_group_memberships (
  user_id     UUID REFERENCES public.users(id) ON DELETE CASCADE,
  group_id    UUID REFERENCES public.user_groups(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  assigned_by UUID REFERENCES public.users(id),
  PRIMARY KEY (user_id, group_id)
);
```

### 3.6 Default Groups (Seed Data)

| Slug | Display Name | System | Description |
|------|-------------|--------|-------------|
| `administrator` | Administrator | ✅ | Full system access |
| `team_manager` | Team Manager | ✅ | Manages team and views analytics |
| `team_member` | Team Member | ✅ | Standard operational access |
| `auditor` | Auditor | ✅ | Read-only access for oversight |

### 3.7 Default Permissions (Seed Data)

**Category: `users`**
| Code | Display Name |
|------|-------------|
| `users:invite` | Invite users |
| `users:list` | View user list |
| `users:view` | View user details |
| `users:update` | Update user details |
| `users:delete` | Delete users |
| `users:ban` | Ban/unban users |
| `users:manage_groups` | Assign/change user groups |
| `users:reset_mfa` | Reset user MFA |
| `users:send_password_reset` | Send password reset link |
| `users:send_magic_link` | Send magic link |
| `users:verify_email` | Force verify email |

**Category: `leads`**
| Code | Display Name |
|------|-------------|
| `leads:view_own` | View own leads |
| `leads:view_all` | View all leads |
| `leads:create` | Create leads |
| `leads:edit_own` | Edit own leads |
| `leads:edit_any` | Edit any lead |
| `leads:delete_own` | Delete own leads |
| `leads:delete_any` | Delete any lead |

**Category: `analytics`**
| Code | Display Name |
|------|-------------|
| `analytics:view_own` | View own analytics |
| `analytics:view_team` | View team analytics |
| `analytics:export` | Export analytics data |

**Category: `settings`**
| Code | Display Name |
|------|-------------|
| `settings:view` | View app settings |
| `settings:manage` | Manage app settings |

### 3.8 Default Group ↔ Permission Mapping

| Permission | Administrator | Team Manager | Team Member | Auditor |
|-----------|:---:|:---:|:---:|:---:|
| `users:invite` | ✓ | | | |
| `users:list` | ✓ | ✓ | | |
| `users:view` | ✓ | ✓ | | |
| `users:update` | ✓ | | | |
| `users:delete` | ✓ | | | |
| `users:ban` | ✓ | | | |
| `users:manage_groups` | ✓ | | | |
| `users:reset_mfa` | ✓ | | | |
| `users:send_password_reset` | ✓ | ✓ | | |
| `users:send_magic_link` | ✓ | ✓ | | |
| `users:verify_email` | ✓ | | | |
| `leads:view_own` | ✓ | ✓ | ✓ | ✓ |
| `leads:view_all` | ✓ | ✓ | | ✓ |
| `leads:create` | ✓ | ✓ | ✓ | |
| `leads:edit_own` | ✓ | ✓ | ✓ | |
| `leads:edit_any` | ✓ | ✓ | | |
| `leads:delete_own` | ✓ | ✓ | | |
| `leads:delete_any` | ✓ | | | |
| `analytics:view_own` | ✓ | ✓ | ✓ | ✓ |
| `analytics:view_team` | ✓ | ✓ | | ✓ |
| `analytics:export` | ✓ | ✓ | | ✓ |
| `settings:view` | ✓ | ✓ | | ✓ |
| `settings:manage` | ✓ | | | |

### 3.9 Database Helper Functions

```sql
-- Returns all permission codes for a given user
CREATE FUNCTION public.get_user_permissions(target_user_id UUID)
RETURNS TEXT[] AS $$
  SELECT COALESCE(array_agg(DISTINCT p.code), '{}')
  FROM public.user_group_memberships ugm
  JOIN public.group_permissions gp ON gp.group_id = ugm.group_id
  JOIN public.permissions p ON p.id = gp.permission_id
  WHERE ugm.user_id = target_user_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Returns all group slugs for a given user
CREATE FUNCTION public.get_user_groups(target_user_id UUID)
RETURNS TEXT[] AS $$
  SELECT COALESCE(array_agg(DISTINCT ug.slug), '{}')
  FROM public.user_group_memberships ugm
  JOIN public.user_groups ug ON ug.id = ugm.group_id
  WHERE ugm.user_id = target_user_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Checks if a user has a specific permission
CREATE FUNCTION public.has_permission(target_user_id UUID, permission_code TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_group_memberships ugm
    JOIN public.group_permissions gp ON gp.group_id = ugm.group_id
    JOIN public.permissions p ON p.id = gp.permission_id
    WHERE ugm.user_id = target_user_id
      AND p.code = permission_code
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

### 3.10 RLS Policies (New Tables)

```sql
-- public.users: users can read their own row; users with 'users:list' can read all
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_self_read" ON public.users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "users_admin_read" ON public.users FOR SELECT
  USING (public.has_permission(auth.uid(), 'users:list'));

CREATE POLICY "users_admin_write" ON public.users FOR ALL
  USING (public.has_permission(auth.uid(), 'users:update'));

-- user_groups, permissions: read-only for authenticated users
ALTER TABLE public.user_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "groups_read" ON public.user_groups FOR SELECT TO authenticated USING (true);

ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "permissions_read" ON public.permissions FOR SELECT TO authenticated USING (true);

-- group_permissions: read-only for authenticated users
ALTER TABLE public.group_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "group_permissions_read" ON public.group_permissions FOR SELECT TO authenticated USING (true);

-- user_group_memberships: own membership readable; admin writable
ALTER TABLE public.user_group_memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "memberships_self_read" ON public.user_group_memberships FOR SELECT
  USING (user_id = auth.uid());
CREATE POLICY "memberships_admin_read" ON public.user_group_memberships FOR SELECT
  USING (public.has_permission(auth.uid(), 'users:list'));
CREATE POLICY "memberships_admin_write" ON public.user_group_memberships FOR ALL
  USING (public.has_permission(auth.uid(), 'users:manage_groups'));
```

### 3.11 Auto-sync Trigger

When a new `auth.users` row is created, automatically create a `public.users` row:

```sql
CREATE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_initials)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    UPPER(LEFT(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 2))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();
```

---

## 4. Proposed Folder Structure

```
lib/auth/
├── actions/
│   ├── user-management.actions.ts    # Invite, delete, ban, unban, role/group, reset, magic link
│   ├── user-query.actions.ts         # List users, get user details
│   ├── session.actions.ts            # Current user, session, profile
│   └── mfa.actions.ts                # 2FA enroll, verify, unenroll, status
│
├── services/
│   ├── admin-user.service.ts         # Admin CRUD via Supabase Admin API
│   ├── authorization.service.ts      # Permission-based guards
│   ├── session.service.ts            # Session & current user helpers
│   ├── user.service.ts               # public.users table operations
│   ├── permission.service.ts         # Permission/group lookups from DB
│   └── mfa.service.ts                # MFA operations (enroll, verify, admin reset)
│
├── types/
│   └── auth.types.ts                 # Types, interfaces, error classes
│
└── validation/
    └── auth.schemas.ts               # Zod validation schemas

app/api/auth/
├── me/
│   ├── route.ts                      # GET /api/auth/me
│   └── mfa/
│       ├── enroll/route.ts           # POST  — start TOTP enrollment
│       ├── verify/route.ts           # POST  — verify TOTP enrollment
│       ├── unenroll/route.ts         # POST  — remove own 2FA factor
│       └── status/route.ts           # GET   — get MFA status & factors
│
└── users/
    ├── route.ts                      # GET (list), POST (invite)
    └── [id]/
        ├── route.ts                  # GET, PATCH, DELETE
        ├── ban/route.ts              # POST
        ├── unban/route.ts            # POST
        ├── verify-email/route.ts     # POST
        ├── reset-password/route.ts   # POST — generate & send password reset link
        ├── magic-link/route.ts       # POST — generate & send magic link
        └── mfa/
            └── reset/route.ts        # POST — admin reset user's MFA
```

**Total files: 22**  
**All files target ≤ 350 lines.**

---

## 5. Supabase Auth & Admin Strategy

### 5.1 Admin API Methods Used

| Operation | Supabase Admin Method |
|-----------|----------------------|
| Invite user | `auth.admin.inviteUserByEmail()` |
| List users | `auth.admin.listUsers()` |
| Get user by ID | `auth.admin.getUserById()` |
| Delete user | `auth.admin.deleteUser()` |
| Ban user | `auth.admin.updateUserById(id, { ban_duration: '876000h' })` |
| Unban user | `auth.admin.updateUserById(id, { ban_duration: 'none' })` |
| Verify email | `auth.admin.updateUserById(id, { email_confirm: true })` |
| Password reset link | `auth.admin.generateLink({ type: 'recovery', email })` |
| Magic link | `auth.admin.generateLink({ type: 'magiclink', email })` |
| Admin reset MFA | `auth.admin.mfa.deleteFactor({ userId, factorId })` |
| Admin list MFA factors | `auth.admin.mfa.listFactors({ userId })` |

### 5.2 Self-Service MFA Methods (via server client)

| Operation | Supabase Method |
|-----------|----------------|
| Enroll TOTP factor | `auth.mfa.enroll({ factorType: 'totp' })` |
| Challenge factor | `auth.mfa.challenge({ factorId })` |
| Verify factor | `auth.mfa.verify({ factorId, challengeId, code })` |
| Unenroll factor | `auth.mfa.unenroll({ factorId })` |
| List own factors | `auth.mfa.listFactors()` |
| Get AAL level | `auth.mfa.getAuthenticatorAssuranceLevel()` |

---

## 6. Authorization Model

### 6.1 No Hardcoded Strings

All group slugs and permission codes are **loaded from the database** at runtime. The application code never references string literals like `'admin'` or `'team_manager'` for authorization checks. Instead:

```typescript
// ✅ Correct — permission-based, DB-driven
await requirePermission('users:invite');

// ❌ Wrong — hardcoded role check
if (user.role === 'admin') { ... }
```

The only place group/permission strings exist as literals is in the **database seed migration** that creates the default data.

### 6.2 Authorization Guards

```typescript
// Permission-based guards (primary interface)
async function requireAuthenticated(): Promise<AuthContext>
async function requirePermission(permissionCode: string): Promise<AuthContext>
async function requireAnyPermission(codes: string[]): Promise<AuthContext>
async function requireAllPermissions(codes: string[]): Promise<AuthContext>

// Context-aware guards
async function requireSelf(userId: string): Promise<AuthContext>
async function requireSelfOrPermission(userId: string, code: string): Promise<AuthContext>
```

### 6.3 AuthContext Type

```typescript
interface AuthContext {
  userId: string;
  email: string;
  groups: string[];        // group slugs from DB
  permissions: string[];   // permission codes from DB
}
```

### 6.4 Operation ↔ Required Permission

| Operation | Required Permission |
|-----------|-------------------|
| Get principal (auth identity) | `requireAuthenticated` |
| List all users | `users:list` |
| Get user details | `users:view` |
| Invite user | `users:invite` |
| Delete user | `users:delete` |
| Ban / Unban user | `users:ban` |
| Verify email | `users:verify_email` |
| Update user groups | `users:manage_groups` |
| Deactivate / Activate user | `users:update` |
| Send password reset | `users:send_password_reset` |
| Send magic link | `users:send_magic_link` |
| Reset user MFA | `users:reset_mfa` |
| Enroll own MFA | `requireAuthenticated` (self-service) |
| Verify own MFA | `requireAuthenticated` (self-service) |
| Unenroll own MFA | `requireAuthenticated` (self-service) |

---

## 7. API Design Plan (OpenAPI Standards)

### 7.1 Response Format

All API routes follow a consistent JSON response format.

**Success (2xx):**
```json
{
  "data": { ... },
  "meta": { "page": 1, "perPage": 50, "total": 120, "lastPage": 3 }
}
```

**Error (4xx/5xx):**
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to perform this action"
  }
}
```

HTTP status codes are the primary error indicator — `400`, `401`, `403`, `404`, `409`, `500`.

### 7.2 API Route Summary

| Method | Path | Description | Permission |
|--------|------|-------------|-----------|
| `GET` | `/api/auth/me` | Current user + groups + permissions | Authenticated |
| `POST` | `/api/auth/me/mfa/enroll` | Start TOTP enrollment | Authenticated |
| `POST` | `/api/auth/me/mfa/verify` | Verify TOTP enrollment | Authenticated |
| `POST` | `/api/auth/me/mfa/unenroll` | Remove own 2FA | Authenticated |
| `GET` | `/api/auth/me/mfa/status` | Get MFA status & factors | Authenticated |
| `GET` | `/api/auth/users` | List users (paginated) | `users:list` |
| `POST` | `/api/auth/users` | Invite a new user | `users:invite` |
| `GET` | `/api/auth/users/:id` | Get user details | `users:view` |
| `PATCH` | `/api/auth/users/:id` | Update user (groups, status) | `users:update` |
| `DELETE` | `/api/auth/users/:id` | Delete user | `users:delete` |
| `POST` | `/api/auth/users/:id/ban` | Ban user | `users:ban` |
| `POST` | `/api/auth/users/:id/unban` | Unban user | `users:ban` |
| `POST` | `/api/auth/users/:id/verify-email` | Force verify email | `users:verify_email` |
| `POST` | `/api/auth/users/:id/reset-password` | Send password reset link | `users:send_password_reset` |
| `POST` | `/api/auth/users/:id/magic-link` | Send magic link | `users:send_magic_link` |
| `POST` | `/api/auth/users/:id/mfa/reset` | Reset user's MFA | `users:reset_mfa` |

---

## 8. Server Actions Design Plan

### 8.1 Return Type Convention

```typescript
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
```

### 8.2 Action Functions

#### `session.actions.ts`
| Action | Returns |
|--------|---------|
| `getPrincipal()` | `ActionResult<AuthContext>` |
| `getCurrentUserProfile()` | `ActionResult<UserRecord>` |

#### `user-management.actions.ts`
| Action | Permission |
|--------|-----------|
| `inviteUser({ email, groupSlug })` | `users:invite` |
| `deleteUser(userId)` | `users:delete` |
| `banUser(userId)` | `users:ban` |
| `unbanUser(userId)` | `users:ban` |
| `verifyUserEmail(userId)` | `users:verify_email` |
| `updateUserGroups(userId, groupSlugs[])` | `users:manage_groups` |
| `deactivateUser(userId)` | `users:update` |
| `activateUser(userId)` | `users:update` |
| `sendPasswordReset(userId)` | `users:send_password_reset` |
| `sendMagicLink(userId)` | `users:send_magic_link` |

#### `user-query.actions.ts`
| Action | Permission |
|--------|-----------|
| `listUsers({ page?, perPage? })` | `users:list` |
| `getUserDetails(userId)` | `users:view` |

#### `mfa.actions.ts`
| Action | Permission |
|--------|-----------|
| `enrollMfa()` | Authenticated (self-service) |
| `verifyMfaEnrollment({ factorId, code })` | Authenticated |
| `unenrollMfa(factorId)` | Authenticated |
| `getMfaStatus()` | Authenticated |
| `adminResetUserMfa(userId)` | `users:reset_mfa` |

---

## 9. Service Layer Breakdown

### 9.1 `session.service.ts` (~80 lines)
- `getPrincipal()` — current authenticated identity from Supabase auth session
- `getCurrentUserRecord()` — `public.users` row for current user
- `getAuthContext()` — unified context (principal + groups + permissions)

### 9.2 `permission.service.ts` (~100 lines)
- `getUserPermissions(userId)` — calls `get_user_permissions` RPC
- `getUserGroups(userId)` — calls `get_user_groups` RPC
- `hasPermission(userId, code)` — calls `has_permission` RPC
- `getAllGroups()` — lists all user_groups
- `getAllPermissions()` — lists all permissions
- `getGroupPermissions(groupId)` — lists permissions for a group

### 9.3 `authorization.service.ts` (~120 lines)
- `requireAuthenticated()` — verify session, build AuthContext
- `requirePermission(code)` — check single permission
- `requireAnyPermission(codes[])` — check at least one
- `requireAllPermissions(codes[])` — check all
- `requireSelf(userId)` — verify identity
- `requireSelfOrPermission(userId, code)` — self or has permission

### 9.4 `user.service.ts` (~100 lines)
- `getUserById(userId)` — from `public.users`
- `getUserByEmail(email)` — from `public.users`
- `updateUser(userId, data)` — update `public.users` row
- `deactivateUser(userId)` — set status='inactive'
- `activateUser(userId)` — set status='active'
- `updateUserGroups(userId, groupSlugs[], assignedBy)` — replace group memberships

### 9.5 `admin-user.service.ts` (~300 lines)
- `inviteUser(params)` — Supabase invite + create user record + assign group
- `listUsers(params)` — paginated list from `public.users` enriched with groups
- `getFullUserDetails(userId)` — auth user + public.users + groups + permissions
- `deleteUser(userId)` — delete from auth.users (cascades to public.users)
- `banUser(userId)` — set ban_duration
- `unbanUser(userId)` — clear ban
- `verifyUserEmail(userId)` — set email_confirm
- `sendPasswordResetLink(userId)` — `auth.admin.generateLink({ type: 'recovery' })`
- `sendMagicLink(userId)` — `auth.admin.generateLink({ type: 'magiclink' })`

### 9.6 `mfa.service.ts` (~150 lines)
- `enrollTotpFactor()` — start enrollment, return QR/URI
- `challengeAndVerify(factorId, code)` — challenge + verify in one step
- `unenrollFactor(factorId)` — remove own factor
- `getMfaStatus()` — list factors, get AAL level
- `adminListUserFactors(userId)` — admin view
- `adminDeleteUserFactor(userId, factorId)` — admin reset
- `adminResetAllUserFactors(userId)` — delete all factors for a user

---

## 10. Validation & Error Handling

### 10.1 Zod Schemas (`auth.schemas.ts`)

```typescript
const inviteUserSchema = z.object({
  email: z.email(),
  groupSlug: z.string().min(1),
});

const updateUserGroupsSchema = z.object({
  groupSlugs: z.array(z.string().min(1)).min(1),
});

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(50),
});

const userIdParamSchema = z.object({
  id: z.string().uuid(),
});

const mfaVerifySchema = z.object({
  factorId: z.string().uuid(),
  code: z.string().length(6),
});

const mfaUnenrollSchema = z.object({
  factorId: z.string().uuid(),
});
```

### 10.2 Error Classes

```typescript
class AuthError extends Error {
  code: string;
  statusCode: number;
}

class UnauthenticatedError extends AuthError {}  // 401
class ForbiddenError extends AuthError {}        // 403
class NotFoundError extends AuthError {}         // 404
class ConflictError extends AuthError {}         // 409
class ValidationError extends AuthError {}       // 400
```

### 10.3 API Error Handler

```typescript
function handleApiError(error: unknown): NextResponse {
  if (error instanceof AuthError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.statusCode }
    );
  }
  console.error('Unhandled error:', error);
  return NextResponse.json(
    { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
    { status: 500 }
  );
}
```

---

## 11. Security Considerations

1. **Admin client isolation** — service-role key never exposed to browser
2. **Permission checks before every operation** — guards throw on failure
3. **Self-operation prevention** — cannot delete/ban self; cannot remove own last admin group
4. **Input sanitization** — all strings trimmed, emails lowercased, UUIDs validated
5. **No sensitive data in responses** — no `raw_app_meta_data`, no internal stacks
6. **MFA factors protected** — users can only manage their own factors; admins need `users:reset_mfa`
7. **Generated links** — password reset and magic links have built-in Supabase expiry; not logged or stored

---

## 12. Environment Variables

| Variable | Required |
|----------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Already set |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Already set |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Already set |
| `NEXT_PUBLIC_SITE_URL` | ✅ Already set |

No new environment variables required.

---

## 13. Sequence of Implementation Steps

| Step | Task | Output |
|------|------|--------|
| **Database** | | |
| 1 | Migration: Create tables, indexes, constraints | `public.users`, `user_groups`, `permissions`, `group_permissions`, `user_group_memberships` |
| 2 | Migration: Seed default groups, permissions, group-permission mappings | 4 groups, 24 permissions, mapping matrix |
| 3 | Migration: Create helper RPC functions | `get_user_permissions`, `get_user_groups`, `has_permission` |
| 4 | Migration: Create RLS policies + auto-sync trigger | All new tables secured |
| 5 | Migration: Sync existing auth.users → public.users | Backfill existing users |
| **Library** | | |
| 6 | Auth types & error classes | `lib/auth/types/auth.types.ts` |
| 7 | Zod validation schemas | `lib/auth/validation/auth.schemas.ts` |
| 8 | Session service | `lib/auth/services/session.service.ts` |
| 9 | Permission service | `lib/auth/services/permission.service.ts` |
| 10 | Authorization guards | `lib/auth/services/authorization.service.ts` |
| 11 | User service (public.users) | `lib/auth/services/user.service.ts` |
| 12 | Admin user service | `lib/auth/services/admin-user.service.ts` |
| 13 | MFA service | `lib/auth/services/mfa.service.ts` |
| 14 | Session actions | `lib/auth/actions/session.actions.ts` |
| 15 | User query actions | `lib/auth/actions/user-query.actions.ts` |
| 16 | User management actions | `lib/auth/actions/user-management.actions.ts` |
| 17 | MFA actions | `lib/auth/actions/mfa.actions.ts` |
| **API Routes** | | |
| 18 | GET /api/auth/me | `app/api/auth/me/route.ts` |
| 19 | MFA self-service routes (4) | `app/api/auth/me/mfa/*/route.ts` |
| 20 | GET/POST /api/auth/users | `app/api/auth/users/route.ts` |
| 21 | GET/PATCH/DELETE /api/auth/users/[id] | `app/api/auth/users/[id]/route.ts` |
| 22 | User action routes (5) | `ban`, `unban`, `verify-email`, `reset-password`, `magic-link` |
| 23 | Admin MFA reset route | `app/api/auth/users/[id]/mfa/reset/route.ts` |

**Dependencies flow:** Migrations → types → validation → services → actions → routes

---

## 14. Risks & Edge Cases

| Risk / Edge Case | Handling |
|-----------------|---------|
| Deleting last admin-group user | Check admin count before allowing removal |
| Profile ↔ users table desync | Trigger handles auto-creation; service layer handles updates |
| Inviting already-registered email | Check auth.users first; return `409 Conflict` |
| Ban/unban idempotency | Re-setting is harmless via Supabase |
| User with leads assigned gets deleted | FK on `lead_logs.assigned_to_id` → soft reference; no cascade |
| MFA reset for user with no factors | Return success (idempotent) |
| Race condition on group assignment | DB primary key constraint prevents duplicates |
| Generated password reset/magic link expiry | Handled by Supabase built-in — no custom expiry logic needed |

---

## 15. Rollback & Safety

1. **Complete isolation** — new `lib/auth/` and `app/api/auth/` trees; existing code untouched
2. **New tables only** — no modifications to `profiles` or existing tables
3. **Gradual adoption** — frontend can consume new module alongside existing code
4. **Clean rollback** — drop new tables + delete new directories = complete reversal

---

## 16. Complete File List

| # | File Path | Purpose | Est. Lines |
|---|-----------|---------|------------|
| 1 | `lib/auth/types/auth.types.ts` | Types, interfaces, error classes | ~120 |
| 2 | `lib/auth/validation/auth.schemas.ts` | Zod schemas | ~80 |
| 3 | `lib/auth/services/session.service.ts` | Session & context | ~80 |
| 4 | `lib/auth/services/permission.service.ts` | Permission/group DB lookups | ~100 |
| 5 | `lib/auth/services/authorization.service.ts` | RBAC guards | ~120 |
| 6 | `lib/auth/services/user.service.ts` | public.users CRUD | ~100 |
| 7 | `lib/auth/services/admin-user.service.ts` | Admin operations | ~300 |
| 8 | `lib/auth/services/mfa.service.ts` | MFA operations | ~150 |
| 9 | `lib/auth/actions/session.actions.ts` | Session actions | ~50 |
| 10 | `lib/auth/actions/user-query.actions.ts` | User query actions | ~60 |
| 11 | `lib/auth/actions/user-management.actions.ts` | Management actions | ~200 |
| 12 | `lib/auth/actions/mfa.actions.ts` | MFA actions | ~100 |
| 13 | `app/api/auth/me/route.ts` | Current user endpoint | ~40 |
| 14 | `app/api/auth/me/mfa/enroll/route.ts` | MFA enroll | ~40 |
| 15 | `app/api/auth/me/mfa/verify/route.ts` | MFA verify | ~40 |
| 16 | `app/api/auth/me/mfa/unenroll/route.ts` | MFA unenroll | ~40 |
| 17 | `app/api/auth/me/mfa/status/route.ts` | MFA status | ~35 |
| 18 | `app/api/auth/users/route.ts` | List + invite | ~90 |
| 19 | `app/api/auth/users/[id]/route.ts` | Get, update, delete | ~110 |
| 20 | `app/api/auth/users/[id]/ban/route.ts` | Ban | ~35 |
| 21 | `app/api/auth/users/[id]/unban/route.ts` | Unban | ~35 |
| 22 | `app/api/auth/users/[id]/verify-email/route.ts` | Verify email | ~35 |
| 23 | `app/api/auth/users/[id]/reset-password/route.ts` | Password reset link | ~40 |
| 24 | `app/api/auth/users/[id]/magic-link/route.ts` | Magic link | ~40 |
| 25 | `app/api/auth/users/[id]/mfa/reset/route.ts` | Admin MFA reset | ~40 |

**Total: 25 files** | **~2,080 estimated lines** | **Max file: ~300 lines**

---

## Approval Checkpoint

> **This document is ready for review.**  
> No application code has been created or modified.  
> Implementation begins only after approval.

### Changes from v1
1. ✅ New `public.users` table instead of `profiles`
2. ✅ Granular RBAC with user_groups + permissions (no hardcoded strings)
3. ✅ 4 default groups: Administrator, Team Manager, Team Member, Auditor
4. ✅ API routes mirror server actions with OpenAPI-standard JSON responses
5. ✅ 2FA / MFA support (TOTP enrollment, verification, admin reset)
6. ✅ Admin password reset link and magic link operations
7. ✅ Database migrations included in scope (5 migrations)
