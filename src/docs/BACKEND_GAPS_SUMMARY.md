# Backend Gaps — Master Reference

> **Audience:** Backend lead and backend engineers  
> **Purpose:** Single source of truth for every frontend → backend contract gap across all four portals. Use this before scoping backend sprints.  
> **Last updated:** 2026-07-09  
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

## Portal E — Doctor Portal

**Branch:** `feat/doctor-appointments-prescription-swagger`  
**Portals covered:** `/hospital/doctor/*`

### Gaps

| # | Endpoint | Method | Request Body | Expected Response | Current FE behaviour | FE once live |
|---|----------|--------|--------------|-------------------|---------------------|--------------|
| E-1 | `/messages/threads` · `/messages/threads/:id` · `/messages/threads/:id/send` | GET / GET / POST | — / — / `{ text }` | Thread list / Message list / `201` | Messages page starts with empty `conversations[]`; send input disabled; notifications shown as fallback | Full threaded chat between doctor, nurses, and staff |
| E-2 | `/prescriptions/for-patient/:patientId` | GET | — | `PatientRx[]` | RX history call sent with UUID; catches `NotFoundException`; amber gap notice shown in prescription panel | Prescription history loads for selected patient |
| E-3 | `/doctors/me` (PATCH, `Role.DOCTOR`) | PATCH | `{ phone?, email?, specialization? }` | Updated `Doctor` record | Settings Profile tab is read-only; `PATCH /doctors/:id` is `HOSPITAL_ADMIN`-only | Doctor can save profile changes from Settings |
| E-4 | `/doctors/dashboard` missing fields | GET | — | Add `licenseNumber`, `workingHours` to existing response | Department tab shows `—` for license number and working hours | License and hours fields populate in Settings Department tab |
| E-5 | `/hospitals/:hospitalId/drug-stock` (for `Role.DOCTOR`) | GET | — | `DrugStock[]` | Call attempted; if 403/404 `drugStock` stays `[]`; medicine name falls back to free-text input | Drug autocomplete shows real-time stock status badges |
| E-6 | `/hospitals/:id/patients?doctorId=` | GET | — | `Patient[]` scoped to doctor | Route does not exist (`POST :id/patients/search` exists but not the GET form); patient list now derived from `GET /appointments` — missing `age`, `gender`, `dateOfBirth` | Full patient roster with demographics |
| E-7 | Appointments include — patient vitals | — | — | Add `patient.gender`, `patient.dateOfBirth`, `triageVitals` to `appointmentInclude` in `appointments.service.ts` | Consultations and patient list show `—` for gender, age, BP | Vitals column populates in consultation queue |

### Confirmed working

`GET /appointments` (doctor-scoped via JWT), `GET /appointments/:id`, `GET /appointments/:id/patient-chart` (with `.catch()` fallback), `PATCH /appointments/:id/status`, `POST /prescriptions/hospital-issue`, `PUT /auth/change-password`, `GET /doctors/dashboard`, `GET /notifications` (used as messages fallback)

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
3. **E-2** — `GET /prescriptions/for-patient/:patientId` (UUID-based). Every prescription page session shows the RX history gap notice until this lands.
4. **E-3 + E-4** — Doctor self-service profile edit and the missing `licenseNumber`/`workingHours` fields are the highest-friction UX gaps for the doctor role.
5. **E-1** — Messaging module. The send input is visibly disabled; this is noticeable but non-blocking for clinical workflows.
6. **E-5 through E-7** — Drug stock access, patient demographics, and vitals in appointments. Lower priority; forms degrade to free-text.
7. **C-1 through C-5** — Confirm response shapes for pharmacy dashboard charts (some may be implemented with inconsistent wrapping).
8. **D-1 through D-3** — Patient portal gaps are lower priority; most patient flows already work.
