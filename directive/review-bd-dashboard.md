# Codebase Review — bd-dashboard
**Date:** 2026-03-31  
**Reviewed by:** Anti-Gravity Agent

---

## 1. Stack Summary

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.1 |
| Runtime | React | 19.2.4 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS v4 | ^4 |
| UI Primitives | Radix UI + shadcn | Latest |
| Backend | Supabase (SSR) | ^0.9.0 |
| Table | TanStack React Table | ^8.21 |
| Charts | Recharts | ^3.8 |
| State | Zustand | ^5 |
| Forms | React Hook Form + Zod | ^7 + ^4 |
| Date Utils | date-fns | ^4.1 |
| Icons | Lucide React | ^0.577 |

> [!IMPORTANT]
> `AGENTS.md` flags that **Next.js 16 has breaking changes** vs training data. Read `node_modules/next/dist/docs/` before any Next.js API work.

---

## 2. Directory Layout

```
bd-dashboard/
├── app/
│   ├── (main)/              # Protected route group
│   │   ├── dashboard/       # Admin + BD dashboards
│   │   ├── leads/           # Lead log page (page.tsx + staged .txt files)
│   │   ├── analytics/
│   │   ├── members/
│   │   └── profiles/
│   ├── api/
│   │   ├── leads/           # GET (filtered/paginated) + POST
│   │   ├── members/         # GET + POST (creates Supabase auth user)
│   │   └── profiles/
│   ├── login/
│   └── globals.css
├── components/
│   ├── leads/               # .tsx (active) + .txt (legacy reference only, not used)
│   ├── dashboard/           # AdminDashboard, BDDashboard, ExtendedKPISections
│   ├── custom/              # Datatable, etc.
│   ├── profiles/            # ProfileDropdown
│   ├── users/               # UserDropDown
│   ├── providers/
│   └── ui/                  # Radix/shadcn wrappers
├── hooks/
│   ├── useLeadForm.ts
│   └── usePagination.ts
├── lib/
│   ├── actions/             # Server Actions: leads.action.ts, user.actions.ts
│   ├── hooks/               # useAuth.ts
│   ├── services/            # leads.service.ts (empty)
│   ├── supabase/            # client.ts, server.ts, admin.ts, middleware.ts
│   ├── kpiEngine.ts         # KPI computation engine (~21KB)
│   ├── types.ts             # All domain types
│   ├── constants.ts         # STATUSES, LEAD_SOURCES, BID_TYPES, etc.
│   └── utils.ts
├── store/
│   ├── authStore.ts         # Zustand — current user
│   └── themeStore.ts        # Zustand — dark/light mode
├── directive/               # Internal SOPs (Supabase migration guides)
└── middleware.ts            # Supabase session refresh
```

---

## 3. Module Status

### 3.1 Leads Module — ⚠️ Partially Refactored

The leads module is in a **split state** — an SSR refactor was started but not completed:

| File | Status | Notes |
|---|---|---|
| `components/leads/LeadContent.tsx` | ✅ Active | Current working page — client component with `useState` filters |
| `components/leads/AddLeadForm.tsx` | ✅ Active | Full add/edit form with Zod validation |
| `components/leads/lead.table.colum.tsx` | ✅ Active | TanStack column definitions |
| `components/leads/lead.schema.ts` | ✅ Active | Zod schema for lead form |
| `components/leads/LeadLogTable.txt` | 📚 Reference | Legacy implementation — kept for historical context only, not used |
| `components/leads/LeadsFilter.txt` | 📚 Reference | Legacy filter — kept for historical context only, not used |
| `components/leads/LeadLogTableClient.txt` | 📚 Reference | Past refactor exploration — reference only |
| `components/leads/LeadsFilterClient.txt` | 📚 Reference | Past refactor exploration — reference only |
| `components/leads/LeadTableContent.txt` | 📚 Reference | Past refactor exploration — reference only |
| `components/leads/QuickAddForm.txt` | 📚 Reference | Past implementation — reference only |
| `app/(main)/leads/actions.txt` | 📚 Reference | Past implementation — reference only |

**Current leads page flow:**
```
LeadsPage (server) → <Suspense> → LeadContent (client)
  └── useState filters → getLeads() server action → Datatable
```

**Planned SSR flow (from OPTIMIZATION_SUMMARY.md):**
```
LeadsPage (server, reads searchParams) → LeadTableContent (client, URL state)
  ├── LeadsFilterClient (URL-aware filters)
  └── LeadLogTableClient (minimal state table)
```

### 3.2 Dashboard Module — ✅ Active

- `AdminDashboard.tsx` (~29KB) — full KPI dashboard for admin
- `BDDashboard.tsx` (~29KB) — BD member view
- `ExtendedKPISections.tsx` — extended metrics
- `kpiEngine.ts` (~21KB) — pure computation layer for all KPIs

### 3.3 Auth / Session

- Middleware refreshes Supabase session on every request
- Zustand `authStore` holds current user in memory
- `useAuth` hook exposes user from the store
- Role-based access: `admin` vs `bd`

### 3.4 API Routes

- `/api/leads` — Full filter + pagination support
- `/api/members` — GET lists BD members; POST creates Supabase auth user + updates profile
- `/api/profiles` — Upwork profile management

### 3.5 Data Access Pattern

- **Server Actions** (`lib/actions/leads.action.ts`) → used by `LeadContent`
- **API Routes** (`app/api/`) → used by management pages
- **Supabase clients**: `client.ts` (browser), `server.ts` (RSC/server actions), `admin.ts` (service role)

---

## 4. Known Bugs (TODO.md)

| # | Bug | Impact |
|---|---|---|
| 1 | User dropdown shows value instead of label on selection | UX — confusing for filter assignee |
| 2 | Scrolling behaviour broken | UX — usability |
| 3 | No badge component for Lead Source | UI consistency |
| 4 | Pagination not working as expected | Functional — data navigation |

---

## 5. In-Progress Work (OPTIMIZATION_SUMMARY.md)

The current active leads page (`LeadContent.tsx`) is client-rendered with `useState` filters. The `.txt` files document past exploration and are **reference only** — not planned for promotion.

Remaining work on the current implementation:

- [ ] Fix TypeScript errors in Select components (filter value typing)
- [ ] End-to-end integration test (filters, pagination, sorting)

---

## 6. Observations & Risks

| Area | Observation | Risk |
|---|---|---|
| `.txt` files | Legacy reference files — not active code | Low — clearly identified |
| `leads.service.ts` | File exists but is empty | Low |
| `LeadFilter` type duplication | `LeadFilters` and `LeadFilter` both in `types.ts` | Low |
| `react-router-dom` in deps | Unused alongside Next.js App Router | Low — bundle bloat |
| No test suite | No test files found anywhere | High |
| Large component files | `AdminDashboard.tsx` and `BDDashboard.tsx` ~29KB each | Medium |

---

## 7. Recommended Next Actions

1. **Fix the 4 bugs** from `TODO.md` — all are scoped and actionable
2. **Add a LeadSource badge component** (quick win, also a TODO item)
3. **Remove `LeadFilter` duplicate** in `types.ts` — keep `LeadFilters` interface
4. **Remove `react-router-dom`** dependency (unused in an App Router project)
5. **Seed or delete `leads.service.ts`**

---

*Reviewed by Anti-Gravity Agent — 2026-03-31*
