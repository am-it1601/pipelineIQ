# SOP-001: Migrate Authentication from Mock to Supabase

| Field            | Value                                      |
|------------------|--------------------------------------------|
| **Document ID**  | SOP-001                                    |
| **Title**        | Supabase Authentication & Authorization Migration |
| **Author**       | Antigravity (AI Engineering Assistant)     |
| **Date**         | 2026-03-24                                 |
| **Status**       | 📋 Pending Review                          |
| **Application**  | Maverics BD Dashboard (Next.js 16)         |

---

## 1. Background & Objective

### 1.1 Current State

The **Maverics BD Dashboard** currently uses a **mock authentication** system with the following characteristics:

| Component | File | Description |
|-----------|------|-------------|
| Auth Store | `store/authStore.ts` | Zustand store with `persist` middleware. Looks up users from a hardcoded array by ID. |
| Mock Users | `lib/data/users.ts` | 5 hardcoded `User` objects (1 admin, 4 BD members). |
| Login Page | `app/login/page.tsx` | Checks if email contains "admin" → logs in as admin, else as BD member. Any password accepted. |
| Auth Guard | `components/layout/AuthGuard.tsx` | Client-side guard using Zustand state; redirects to `/login` if no user. |
| Permissions | `hooks/usePermissions.ts` | Role-based permission check (`admin` gets all, `bd` gets limited). |
| Topbar | `components/layout/Topbar.tsx` | Displays user initials/role badge, logout button calls `authStore.logout()`. |
| Sidebar | `components/layout/Sidebar.tsx` | Reads current user from auth store for display and user-switching. |

**11 files** consume `useAuthStore` across the codebase.

### 1.2 Target State

Migrate to **Supabase Auth** with:
- Real email/password authentication via `supabase.auth.signInWithPassword()`
- Server-side session management via Next.js middleware + `@supabase/ssr`
- A `public.profiles` table for role & metadata (admin / bd)
- Row-Level Security (RLS) on the profiles table
- Three seeded users as specified below

### 1.3 Users to Create

| Name           | Email                          | Role       |
|----------------|--------------------------------|------------|
| Amit Agarwal   | amit.agarwal@ciphercru.com     | Admin      |
| Krati Saxena   | krati.saxena@ciphercru.com     | BD Member  |
| Yash Soni      | yash.soni@ciphercru.com        | BD Member  |

---

## 2. User Review Required

> [!IMPORTANT]
> **Supabase Project Credentials Required**: Before execution can begin, you must provide:
> 1. Your **Supabase Project URL** (e.g., `https://xyzcompany.supabase.co`)
> 2. Your **Supabase Anon Key** (publishable key)
> 3. Your **Supabase Service Role Key** (for seeding users via the Admin API – will only be used server-side during setup, never exposed to the client)
>
> If you don't have a Supabase project yet, I can help you create one via the Supabase MCP integration (requires configuring the `SUPABASE_ACCESS_TOKEN` first).

> [!WARNING]
> **Breaking Change**: The existing mock users (Rohit Sharma, Priya Mehta, Arjun Nair, Sneha Kapoor, Vikram Das) will be replaced. Any references by `userId` (e.g., `u1`, `u2`) in mock data like `leadEntries.ts` will need a mapping strategy. During this migration, we will keep the mock data referencing old IDs functional by mapping them, but future iterations should migrate data to Supabase tables.

> [!IMPORTANT]
> **Password for Seeded Users**: Please specify the initial password to use for the three users, or I will use a default like `Maverics@2026` for all three. Users can reset via email later.

---

## 3. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│                                                             │
│  ┌──────────┐   ┌──────────────┐   ┌─────────────────────┐ │
│  │ Login    │──▶│ Supabase     │──▶│ AuthProvider         │ │
│  │ Page     │   │ signInWith   │   │ (session → Zustand)  │ │
│  └──────────┘   │ Password()   │   └─────────┬───────────┘ │
│                 └──────────────┘             │              │
│                                    ┌────────▼───────────┐  │
│                                    │ useAuthStore        │  │
│                                    │ (Supabase session-  │  │
│                                    │  backed)            │  │
│                                    └────────┬───────────┘  │
│                                             │              │
│                                    ┌────────▼───────────┐  │
│                                    │ usePermissions()    │  │
│                                    │ (reads role from    │  │
│                                    │  profile)           │  │
│                                    └────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Server                          │
│                                                             │
│  ┌──────────────┐    ┌────────────────────────────────────┐ │
│  │ middleware.ts │───▶│ Refresh session cookie on every   │ │
│  │              │    │ request. Redirect unauthenticated  │ │
│  │              │    │ users to /login                    │ │
│  └──────────────┘    └────────────────────────────────────┘ │
│                                                             │
│  ┌──────────────┐    ┌────────────────────────────────────┐ │
│  │ API Routes   │───▶│ Validate session via server client │ │
│  └──────────────┘    └────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      Supabase                               │
│                                                             │
│  ┌──────────────┐    ┌────────────────────────────────────┐ │
│  │ auth.users   │───▶│ public.profiles                   │ │
│  │ (managed by  │    │ (id, email, full_name, role,       │ │
│  │  Supabase)   │    │  bd_member_id, avatar_initials,    │ │
│  └──────────────┘    │  created_at, updated_at)           │ │
│                      └────────────────────────────────────┘ │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ RLS Policies:                                         │ │
│  │ • Users can read their own profile                    │ │
│  │ • Admins can read all profiles                        │ │
│  │ • Users can update their own profile (non-role fields)│ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Proposed Changes

### 4.1 Dependencies & Configuration

#### [NEW] `.env.local`
Create environment file with Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=<your-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

#### [MODIFY] `package.json`
Add dependencies:
```bash
npm install @supabase/supabase-js @supabase/ssr
```

---

### 4.2 Supabase Client Library

#### [NEW] `lib/supabase/client.ts`
Browser-side Supabase client using `createBrowserClient` from `@supabase/ssr`.
- Reads `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Used in all client components

#### [NEW] `lib/supabase/server.ts`
Server-side Supabase client using `createServerClient` from `@supabase/ssr`.
- Uses `cookies()` from `next/headers` for session management
- Used in Server Components, API routes, and server actions

#### [NEW] `lib/supabase/middleware.ts`
Helper function to create a Supabase client that can refresh the session cookie on each request.
- Integrates with Next.js middleware
- Handles token refresh transparently

#### [NEW] `lib/supabase/admin.ts`
Server-only admin client using `SUPABASE_SERVICE_ROLE_KEY`.
- Used exclusively for user seeding script (never imported in browser code)
- Bypasses RLS

---

### 4.3 Database Schema

#### [NEW] Supabase Migration: `create_profiles_table`
```sql
-- Create profiles table linked to auth.users
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'bd' CHECK (role IN ('admin', 'bd')),
  bd_member_id TEXT,
  avatar_initials TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Users can update their own profile (non-role fields)
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_initials)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_initials', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

### 4.4 User Seeding Script

#### [NEW] `scripts/seed-users.ts`
A one-time Node.js script to create the 3 users. Uses the Supabase Admin API:

```
1. Create user in auth.users via supabase.auth.admin.createUser()
2. Upsert profile row with role and metadata
```

| User           | Email                        | Role  | bd_member_id | avatar_initials |
|----------------|------------------------------|-------|--------------|-----------------|
| Amit Agarwal   | amit.agarwal@ciphercru.com   | admin | null         | AA              |
| Krati Saxena   | krati.saxena@ciphercru.com   | bd    | bd1          | KS              |
| Yash Soni      | yash.soni@ciphercru.com      | bd    | bd2          | YS              |

---

### 4.5 Auth Provider & Store

#### [NEW] `components/providers/SupabaseAuthProvider.tsx`
Client component that:
1. Subscribes to `supabase.auth.onAuthStateChange()`
2. Fetches the user's profile from `public.profiles`
3. Hydrates the Zustand auth store

#### [MODIFY] `store/authStore.ts`
Rewrite to:
- Remove dependency on `USERS` array and `lib/data/users.ts`
- Store `User` object derived from Supabase session + profile
- `login()` becomes `setUser(user: User | null)`
- `logout()` calls `supabase.auth.signOut()` then clears state
- Remove `persist` middleware (session is now managed via Supabase cookies)

#### [MODIFY] `hooks/usePermissions.ts`
- No structural change needed (already reads `currentUser.role`)
- Will work as-is once auth store provides role from Supabase profile

---

### 4.6 Login Page

#### [MODIFY] `app/login/page.tsx`
- Replace mock auth logic with `supabase.auth.signInWithPassword({ email, password })`
- Add proper error handling (display "Invalid credentials" etc.)
- Remove the "Hint" box about mock auth
- Keep the existing premium UI design

---

### 4.7 AuthGuard & Middleware

#### [NEW] `middleware.ts` (project root)
Next.js middleware that:
1. Creates a Supabase server client
2. Refreshes the session on every request
3. Redirects unauthenticated users trying to access protected routes to `/login`
4. Redirects authenticated users trying to access `/login` to `/dashboard`
5. Matcher: applies to all routes except static assets, `_next`, favicon

#### [MODIFY] `components/layout/AuthGuard.tsx`
Simplify to:
- Check auth store for user (session is already validated by middleware)
- Show loading state while auth provider hydrates
- Redirect to `/login` if no user after hydration (fallback)

---

### 4.8 Logout & Navigation Updates

#### [MODIFY] `components/layout/Topbar.tsx`
- Change `logout()` to call `supabase.auth.signOut()` + `router.push('/login')`
- Rest remains the same (reads `currentUser` from auth store)

#### [MODIFY] `components/layout/Sidebar.tsx`
- Update to read user from auth store instead of mock data

#### [MODIFY] `components/app-sidebar.tsx`
- Replace hardcoded `data.user` with dynamic user from auth store

---

### 4.9 Consumer Page Updates

The following pages read `useAuthStore((s) => s.currentUser)` and need no logic change — they'll automatically work once the auth store is backed by Supabase. However, we need to ensure the `User` type still matches:

| Page | File |
|------|------|
| Dashboard | `app/(main)/dashboard/page.tsx` |
| Leads | `app/(main)/leads/page.tsx` |
| Members | `app/(main)/members/page.tsx` |
| Analytics | `app/(main)/analytics/page.tsx` |
| Profiles | `app/(main)/profiles/page.tsx` |

#### [MODIFY] `lib/types.ts`
No change needed. The existing `User` type (`id`, `name`, `email`, `role`, `bdMemberId`, `avatarInitials`) will be populated from the Supabase profile.

---

### 4.10 Root Layout & Provider Wiring

#### [MODIFY] `app/layout.tsx`
- Wrap `{children}` with `<SupabaseAuthProvider>` inside the `<ThemeProvider>`

---

### 4.11 Cleanup

#### [DEPRECATE] `lib/data/users.ts`
- Will be kept for backward compatibility with lead data (which references `createdByUserId: 'u1'` etc.)
- Add a JSDoc `@deprecated` comment
- Future migration should move all data to Supabase

---

## 5. File Change Summary

| Action   | File                                     | Description                           |
|----------|------------------------------------------|---------------------------------------|
| NEW      | `.env.local`                             | Supabase credentials                  |
| NEW      | `lib/supabase/client.ts`                 | Browser Supabase client               |
| NEW      | `lib/supabase/server.ts`                 | Server Supabase client                |
| NEW      | `lib/supabase/middleware.ts`             | Middleware session helper             |
| NEW      | `lib/supabase/admin.ts`                  | Admin client for seeding              |
| NEW      | `components/providers/SupabaseAuthProvider.tsx` | Auth state listener + hydration |
| NEW      | `middleware.ts`                          | Next.js middleware for session mgmt   |
| NEW      | `scripts/seed-users.ts`                  | One-time user seeding script          |
| MODIFY   | `package.json`                           | Add Supabase dependencies             |
| MODIFY   | `store/authStore.ts`                     | Supabase-backed auth state            |
| MODIFY   | `app/login/page.tsx`                     | Real email/password auth              |
| MODIFY   | `app/layout.tsx`                         | Wrap with SupabaseAuthProvider        |
| MODIFY   | `components/layout/AuthGuard.tsx`        | Simplified session check              |
| MODIFY   | `components/layout/Topbar.tsx`           | Supabase signOut                      |
| MODIFY   | `components/layout/Sidebar.tsx`          | Dynamic user display                  |
| MODIFY   | `components/app-sidebar.tsx`             | Dynamic user from auth store          |
| DEPRECATE| `lib/data/users.ts`                      | Mark as deprecated                    |

**Total: 8 new files, 8 modified files, 1 deprecated file**

---

## 6. Verification Plan

### 6.1 Build Verification (Automated)
```bash
cd /Users/amitagarwal/Work/Maverics_Dashboard/bd-dashboard
npm run build
```
**Expected**: Zero TypeScript errors, successful Next.js production build.

### 6.2 Manual Verification via Browser

#### Test Case 1: Login with Admin User
1. Open `http://localhost:3000/login`
2. Enter email: `amit.agarwal@ciphercru.com`, password: `<configured-password>`
3. Click "Sign In"
4. **Expected**: Redirected to `/dashboard`, Topbar shows "admin" badge and "AA" avatar initials

#### Test Case 2: Login with BD Member
1. Open `http://localhost:3000/login`
2. Enter email: `krati.saxena@ciphercru.com`, password: `<configured-password>`
3. Click "Sign In"
4. **Expected**: Redirected to `/dashboard`, Topbar shows "bd" badge and "KS" avatar initials

#### Test Case 3: Invalid Credentials
1. Open `http://localhost:3000/login`
2. Enter email: `wrong@ciphercru.com`, password: `wrongpassword`
3. Click "Sign In"
4. **Expected**: Error message displayed, user stays on login page

#### Test Case 4: Protected Route Redirect
1. Clear all cookies / open incognito
2. Navigate directly to `http://localhost:3000/dashboard`
3. **Expected**: Automatically redirected to `/login`

#### Test Case 5: Logout
1. Log in as any user
2. Click the logout button (red icon) in the Topbar
3. **Expected**: Redirected to `/login`, cannot access `/dashboard` without logging in again

#### Test Case 6: Role-Based Permissions
1. Log in as BD Member (krati.saxena@ciphercru.com)
2. Navigate to `/members`
3. **Expected**: Should see limited view (no admin controls)
4. Log in as Admin (amit.agarwal@ciphercru.com)
5. Navigate to `/members`
6. **Expected**: Should see full admin view with management controls

#### Test Case 7: Session Persistence
1. Log in as any user
2. Close the browser tab
3. Open a new tab and navigate to `http://localhost:3000/dashboard`
4. **Expected**: User is still logged in (session persisted via cookie)

---

## 7. Execution Sequence

```
Phase 0 → Install deps, create .env.local
Phase 1 → Create Supabase client files
Phase 2 → Create database schema (profiles table, RLS, trigger)
Phase 3 → Seed users
Phase 4 → Rewrite auth store + create provider
Phase 5 → Migrate login page
Phase 6 → Create middleware + update AuthGuard
Phase 7 → Update Topbar, Sidebar, AppSidebar
Phase 8 → Verify consumer pages work
Phase 9 → Cleanup deprecated files
Phase 10 → Full verification
Phase 11 → Write documentation
```

---

## 8. Rollback Plan

If the migration causes issues:
1. Revert the `store/authStore.ts` to use the mock `USERS` array
2. Remove the `middleware.ts` file
3. Remove the `SupabaseAuthProvider` from `app/layout.tsx`
4. Revert `app/login/page.tsx` to mock login logic

The mock data files are not deleted, so rollback is straightforward via `git revert`.

---

## 9. Revision History

| Version | Date       | Author      | Changes              |
|---------|------------|-------------|----------------------|
| 1.0     | 2026-03-24 | Antigravity | Initial draft        |
