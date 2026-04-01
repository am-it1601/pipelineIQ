# SOP-004: Migrate Lead Logs to Supabase

| **Title**        | Lead Logs Data & CRUD Migration |
|------------------|---------------------------------|
| **Author**       | Antigravity AI                  |
| **Status**       | PLANNING                        |
| **Target Role**  | Admin                           |

## 1. Goal Description
To migrate the core operational data schema—Lead Logs—from memory mapping into the production database instance while seamlessly seeding historical contexts mapping to the newly structured user profiles. 

## 2. Requirements
- Construct the `public.lead_logs` SQL table configured with strict typing logic encapsulating engagement bounds, numeric constraints, and UUID foreign keys mapping directly to `public.upwork_profiles` and `auth.users`.
- Execute a functional data injection mapping the legacy `bd1` bindings uniformly and randomly across legitimate Supabase `.users` BD role allocations.
- Guarantee the UI mapping maintains backwards compatibility strictly adhering to the `LeadLogEntry` camelCase conventions via server API transformations.

## 3. Implementation Plan
### 3.1 Database Migration
Run DDL query:
```sql
CREATE TABLE IF NOT EXISTS public.lead_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  project_title text NOT NULL,
  lead_source text NOT NULL,
  upwork_link text,
  profile_used_id uuid REFERENCES public.upwork_profiles(id) ON DELETE SET NULL,
  assigned_to_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  engagement_type text NOT NULL,
  proposal_value numeric NOT NULL,
  hourly_rate numeric,
  estimated_hours numeric,
  connects_used integer NOT NULL DEFAULT 0,
  bid_type text NOT NULL,
  status text NOT NULL,
  remarks text,
  is_hot boolean DEFAULT false,
  created_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
```

### 3.2 Seeding Automation
Develop `scripts/migrate-leads.ts`:
- Pull realistic `BDMember[]` from Postgres dynamically.
- Ensure Upwork Profiles exist within the DB prior to mapping. 
- Disperse bindings randomly utilizing `Math.random()`.
- Inject massive array natively inserting timestamps accurately. 

### 3.3 Server APIs (`app/api/leads`)
1. Re-initialize APIs natively interacting with `createAdminClient()`.
2. Construct robust Object mapping bridging `public.lead_logs` into `LeadLogEntry`. 

## 4. Task Checklists
- [x] Inspect existing mock data and components
- [x] Draft implementation plan
- [ ] Notify user for approval
- [ ] Execute: Run Supabase migration DDL
- [ ] Execute: Write & execute `scripts/migrate-leads.ts`
- [ ] Execute: Refactor `/api/leads` and `/api/leads/[id]` routes
- [ ] Verification: Test UI logic seamlessly in the NextJS app
