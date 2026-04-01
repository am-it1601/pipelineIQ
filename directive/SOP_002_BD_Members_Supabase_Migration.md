# SOP-002: Migrate BD Members CRUD to Supabase

| **Title**        | BD Members Management Migration |
|------------------|---------------------------------|
| **Author**       | Antigravity AI                  |
| **Status**       | PLANNING                        |
| **Target Role**  | Admin                           |

## 1. Goal Description
The objective is to allow Admins to manage actual BD members in Supabase through the existing BD Members UI. BD members are authenticated users and store their details in the `profiles` table. The existing React UI originally used a mock `serverStore` data list (`BD_MEMBERS`). 

## 2. Requirements
- We do not migrate the old mock `BD_MEMBERS` from `bdMembers.ts`. They will be naturally replaced by actual Supabase rows over time, or simply ignored.
- The UI must allow Admins to **add**, **edit**, and **deactivate** BD members directly in Supabase.
- We must append BD-specific attributes (`status`, `monthlyTarget`, `incentiveEligible`, `joinDate`) to the Supabase `profiles` table.

## 3. Implementation Plan
### 3.1 Database Migration
Add BD-specific columns to `public.profiles`:
```sql
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
ADD COLUMN IF NOT EXISTS monthly_target integer DEFAULT 50,
ADD COLUMN IF NOT EXISTS incentive_eligible boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS join_date date DEFAULT CURRENT_DATE;
```

### 3.2 Types & UI (`lib/types.ts` & `app/(main)/members/page.tsx`)
1. Extend `BDMember` interface with `email?: string`.
2. Add an "Email" column to the data table and the creation form. 
3. Send `email` during `POST /api/members`.

### 3.3 Server Actions / APIs (`app/api/members`)
1. **GET**: Query Supabase `profiles` where `role = 'bd'`. Map DB schema back to `BDMember` shape.
2. **POST**: Use `supabase.auth.admin.createUser()` to securely register the BD member in `auth.users`, bypassing email confirmations if preferred. Immediately update their auto-created profile with the specified `monthly_target`, etc.
3. **PATCH**: Update the target `public.profiles` row based on the `editingId` (which maps to `auth.users.id`).

## 4. Task Checklists
- [ ] Inspect existing mock BD members CRUD UI
- [ ] Inspect Supabase structure, auth, and profiles table
- [x] Draft an implementation plan & SOP
- [ ] Notify user for approval on the plan
- [ ] Execute: Run Supabase migration DDL
- [ ] Execute: Update `lib/types.ts` and React UI with Email field
- [ ] Execute: Implement `GET`, `POST`, `PATCH`, `DELETE` in `/api/members` routes to use Supabase Admin Client
- [ ] Verification: Test CRUD operations visually in the browser
