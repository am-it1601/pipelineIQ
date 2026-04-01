# SOP-003: Migrate Upwork Profiles to Supabase

| **Title**        | Upwork Profiles Supabase Migration |
|------------------|------------------------------------|
| **Author**       | Antigravity AI                     |
| **Status**       | PLANNING                           |
| **Target Role**  | Admin                              |

## 1. Goal Description
Move the Upwork Profiles module off of memory-state arrays and onto an actual dedicated internal Postgres table in Supabase. Expand the structure to properly capture profile links and skills data. Upwork profiles are non-authenticated metadata objects.

## 2. Requirements
- New Database Table handling:
  - Name (`profile_name`)
  - Upwork profile link (`profile_link`)
  - Focused Area (`focus_area`)
  - Skill Tags (`skill_tags`)
  - Status (`status`)
- Provide full support on the dashboard UI directly integrated to the new API endpoints.
- No user accounts mapping required (`auth.users`), pure CRUD.

## 3. Implementation Plan
### 3.1 Database Table Creation
Execute a DDL to build the new `public.upwork_profiles` table.
```sql
CREATE TABLE IF NOT EXISTS public.upwork_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_name text NOT NULL,
  profile_link text,
  focus_area text,
  skill_tags text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
```

### 3.2 Types & UI (`lib/types.ts` & `app/(main)/profiles/page.tsx`)
1. Extend `UpworkProfile` interface natively in `lib/types.ts` with `profileLink` and `skillTags`.
2. Expand the frontend CRUD structure ensuring data maps to standard string inputs for ease of copy/pasting URLs and comma-separated string tags.

### 3.3 Server Actions / APIs (`app/api/profiles`)
1. **GET**: Query Supabase using `@supabase/supabase-js`. 
2. **POST**: Write securely from our `createAdminClient` context.
3. **PATCH**: Update via `uuid`. 
4. **DELETE**: Allow proper object purging since profiles aren't critically entangled with foreign keys yet natively.

## 4. Task Checklists
- [x] Inspect existing mock API and UI
- [x] Draft an implementation plan & SOP
- [ ] Notify user for approval on the plan
- [ ] Execute: Run Supabase DDL for new table
- [ ] Execute: Extend `lib/types.ts` and React UI
- [ ] Execute: Connect API endpoints to Supabase client
- [ ] Verification: Test UI logic inside the browser
