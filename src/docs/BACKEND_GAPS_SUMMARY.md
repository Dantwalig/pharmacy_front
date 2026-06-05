# Backend Gaps — Master Reference

> **Audience:** Backend lead and backend engineers  
> **Purpose:** Single source of truth for every frontend → backend contract gap across all four portals. Use this before scoping backend sprints.  
> **Last updated:** 2026-06-05  
> **Full super-admin contract:** [`SUPER_ADMIN_BACKEND_CONTRACT.md`](./SUPER_ADMIN_BACKEND_CONTRACT.md)

---

## Legend

| Icon | Meaning |
|------|---------|
| ✅ | Endpoint confirmed working |
| ⚠️ | Endpoint missing or unconfirmed — frontend degrades gracefully |
| ❌ | Endpoint confirmed broken (4xx/5xx in production) |

---

## Portal A — Super Admin Portal

**Branch:** `fix/nelly_super_admin_api_hardening`  
**Contract file:** [`SUPER_ADMIN_BACKEND_CONTRACT.md`](./SUPER_ADMIN_BACKEND_CONTRACT.md)

### Gaps

| # | Endpoint | Method | Request Body | Expected Response | Current FE behaviour | FE once live |
|---|----------|--------|--------------|-------------------|---------------------|--------------|
| A-1 | `/super-admin/branches/pending` | GET | — | `PendingBranch[]` | Amber banner shown; actions disabled; 8 s timeout | Branch cards with approve/reject buttons |
| A-2 | `/super-admin/branches/:id/approve` | PATCH | `{}` | `200 OK` | Button disabled | One-click approval, branch removed from list |
| A-3 | `/super-admin/branches/:id/reject` | PATCH | `{ reason: string }` | `200 OK` | Button disabled | Modal with required reason; branch removed on confirm |
| A-4 | `/super-admin/pharmacies/unverified-locations` | GET | — | `PharmacyLocation[]` (with `latitude`, `longitude`) | Amber banner; Review button disabled | Location rows with map-review modal |
| A-5 | `/super-admin/pharmacies/:id/verify-location` | PATCH | `{ verified: boolean }` | `200 OK` | Button disabled in modal | Verify/Flag buttons functional; pharmacy removed from list |

### Confirmed working

`GET /super-admin/analytics`, `GET /super-admin/revenue`, `GET /super-admin/pharmacies`, `GET /super-admin/pharmacies/pending`, `PATCH /super-admin/pharmacies/:id/approve`, `PATCH /super-admin/pharmacies/:id/reject`, `GET /super-admin/patients`

---

## Portal B — Branch Manager Portal

**Portals covered:** `/branch/*`

### Gaps

| # | Endpoint | Method | Request Body | Expected Response | Current FE behaviour | FE once live |
|---|----------|--------|--------------|-------------------|---------------------|--------------|
| B-1 | `/stock-transfers/branch` | GET | — | `StockTransfer[]` | `backendReady` flag set to `false` on 403/404; UI shows a "not yet available" state | Full transfers table renders |
| B-2 | `/stock-transfers` | POST | `{ toBranchId, notes, items[] }` | `201 Created` | Form submits but silently fails on 404 | New transfer created and list refreshes |
| B-3 | `/stock-transfers/:id/status` | PATCH | `{ status: string }` | `200 OK` | Toast error on failure | Inline status update (accept/reject incoming transfers) |
| B-4 | `/branches/my-branch-details` | GET | — | `{ id, name, address, latitude, longitude }` | Used in medication form and map; silently empty if missing | Branch picker / map centres correctly |

### Confirmed working

`GET /medications/pharmacy/my-medications`, `GET /branches/my-branches`, `GET /attendance/*`, `GET /orders/pharmacy-orders`

---

## Portal C — Pharmacy Owner Portal

**Portals covered:** `/pharmacy/*`

### Gaps

| # | Endpoint | Method | Request Body | Expected Response | Current FE behaviour | FE once live |
|---|----------|--------|--------------|-------------------|---------------------|--------------|
| C-1 | `/pharmacies/dashboard/stats` | GET | — | `PharmacyStats` object | `unwrapItem` applied; dashboard shows zeros on failure | Stat cards populate |
| C-2 | `/pharmacies/dashboard/analytics` | GET | — | `PharmacyAnalytics` object | `unwrapItem` applied; analytics cards show zeros | Analytics cards populate |
| C-3 | `/pharmacies/dashboard/daily-revenue` | GET | — | `DailyRevenue` object (with `dailyTotal[]`, `branchDaily[]`) | `unwrapItem` applied; charts empty | Revenue charts populate |
| C-4 | `/pharmacies/dashboard/weekly-revenue` | GET | — | `WeeklyRevenue` object (with `weeklyTotal[]`) | `unwrapItem` applied | Weekly chart populates |
| C-5 | `/pharmacies/profile/me` | GET | — | `PharmacyProfile` object | `unwrapItem` applied; greeting falls back to generic | Owner name shown in greeting |

> Note: C-1 through C-5 may already be implemented — the frontend applies `unwrapItem` defensively because the backend inconsistently wraps responses in `{ data: ... }`. Confirm the actual response shape and align the backend to return the object directly (not wrapped) or update `unwrapItem` call sites once the shape is known.

### Confirmed working

`GET /super-admin/pharmacies`, `PATCH /super-admin/pharmacies/:id/approve`, `PATCH /super-admin/pharmacies/:id/reject`, `GET /branches/my-branches`, `GET /branches/:id`, `POST /branches/:id/send-credentials`

---

## Portal D — Patient Portal

**Portals covered:** `/patient/*`

### Gaps

| # | Endpoint | Method | Request Body | Expected Response | Current FE behaviour | FE once live |
|---|----------|--------|--------------|-------------------|---------------------|--------------|
| D-1 | `/notifications?userType=patient` | GET | — | `Notification[]` or `{ data: Notification[] }` | `unwrapData` applied; polling every `POLLING_INTERVAL_MS` ms; stale on failure | Real-time notification feed |
| D-2 | `/medications/search?q=` | GET | — | `Medication[]` | Used in patient search page | Search results populate |
| D-3 | `/pharmacies/nearby?lat=&lng=` | GET | — | `PharmacyLocation[]` | Used in patient pharmacy search | Nearby pharmacy list and map |

### Confirmed working

`GET /orders/my-orders`, `GET /orders/:id`, `GET /prescriptions/my-prescriptions`

---

## Cross-cutting issues resolved in this PR

These were code-level issues, not missing endpoints, now fixed in `fix/nelly_super_admin_api_hardening`:

### Gap X1 — Mixed API import styles (Gap 2)

**Problem:** 8 files used `import { api }` (named export) while the rest used `import api` (default export). Both worked because `api.ts` dual-exports, but the inconsistency caused confusion.

**Fix:** All files now use `import api from '@/lib/api'` (default). Named import `{ api }` removed everywhere.

**Verification:** `grep -rn "import { api }" src/` → zero results.

### Gap X2 — Inconsistent response unwrapping (Gap 3)

**Problem:** ~20 call sites used inline `res.data?.data ?? res.data` or `Array.isArray(res.data) ? res.data : res.data?.data ?? []` instead of the shared helper.

**Fix:**
- Added `unwrapItem<T>` helper to `src/lib/api.ts` for single-object unwraps.
- Array unwraps → `unwrapData(res.data)` (existing helper).
- Object unwraps → `unwrapItem<T>(res.data)` (new helper).

**Verification:** `grep -rn "data?.data ??" src/` → zero results.

---

## Priority for backend sprint

1. **A-1 through A-5** — Super Admin verification workflow is the most visible gap. Super admins cannot approve/reject branches or verify pharmacy locations.
2. **B-1 through B-3** — Branch stock transfers are fully built on the frontend but non-functional.
3. **C-1 through C-5** — Confirm response shapes for pharmacy dashboard charts (some may be implemented with inconsistent wrapping).
4. **D-1 through D-3** — Patient portal gaps are lower priority; most patient flows already work.
