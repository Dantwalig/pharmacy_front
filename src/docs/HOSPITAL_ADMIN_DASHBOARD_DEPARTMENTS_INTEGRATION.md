# Hospital Admin  Dashboard & Departments  Backend Integration Notes

> Scope: `src/app/hospital/admin/dashboard/page.tsx` and
> `src/app/hospital/admin/departments/page.tsx`. Both pages now fetch live data
> from the backend instead of `MOCK_ADMIN` / `MOCK_DEPARTMENTS`.

---

## Endpoints used

Confirmed directly against `back-end/src/hospitals/hospitals.controller.ts` and
`hospitals.service.ts` (source-verified, not assumed from the mock fields).

| Endpoint | Method | Role | Used by |
|---|---|---|---|
| `/hospitals/:id/dashboard/stats` | GET | `HOSPITAL_ADMIN` | Dashboard  stat cards |
| `/hospitals/:id/dashboard/weekly-revenue` | GET | `HOSPITAL_ADMIN` | Dashboard  revenue line chart |
| `/hospitals/:id/drug-stock` | GET | `HOSPITAL_ADMIN`, `DOCTOR`, `NURSE`, `PHARMACIST` | Dashboard  "Low Stock/Expiry" card + Recent Activity (additional call, see Gap 4) |
| `/hospitals/:id/doctors` | GET | `HOSPITAL_ADMIN`, `PATIENT`, `DOCTOR`, `NURSE`, `RECEPTIONIST` | Departments  derived client-side (see Gap 1) |

Response shapes for `dashboard/stats`, `dashboard/weekly-revenue`, and `doctors`
already matched `DashboardStats`, `WeeklyRevenue`, and `DoctorProfile` in
`src/types/hospital.ts` exactly  no type changes were needed for those three.

---

## Gaps found during integration

### Gap 1  No `/departments` endpoint exists  **Blocking** (workaround shipped)
There is no `GET /hospitals/:id/departments` (or equivalent) route anywhere in
`hospitals.controller.ts`. `hospital_portal_api_mapping.md` (Tab 6) already
flagged this and advised deriving departments client-side from the doctors
list grouped by `specialization`. That is what `departments/page.tsx` now does
(`deriveDepartments()`). This is a workaround, not a real fix  see Gaps 2–3
for what is lost by deriving instead of having a real endpoint.

**Backend action needed:** add a `Department` concept (or at minimum a
`GET /hospitals/:id/departments` aggregate route) if department head, nurse
counts, or department active/inactive status need to be real, editable data
rather than derived/defaulted.

### Gap 2  `nurseCount` has no backend source  **Non-blocking**
`GET /hospitals/:id/doctors` only returns doctors. There is no per-department
nurse listing anywhere in the API. `Department.nurseCount` is hardcoded to `0`
for every derived department.

**Backend action needed:** either expose nurses with a `department`/
`specialization` field, or provide a dedicated departments endpoint that
includes nurse counts.

### Gap 3  `Department.head` and `Department.status` have no backend field  **Non-blocking**
- `head` (department head doctor) does not exist anywhere in the schema. The UI
  shows `—` for every department.
- `status: 'ACTIVE' | 'INACTIVE'` is a frontend-only concept; every derived
  department is defaulted to `'ACTIVE'` since it's derived from doctors
  currently on staff.

**Backend action needed:** add these fields if department-level management
(deactivating a department, assigning a head) becomes a real feature.

### Gap 4  "Procured Value" and "Recent Activity" dashboard cards have no clean backend match  **Non-blocking**
The original Figma/mock dashboard had a "Procured Value" stat card and a
multi-source "Recent Activity" feed (new appointments + low-stock alerts +
procurement deliveries, per `hospital_portal_api_mapping.md` Tab 1.4).
`GET /hospitals/:id/dashboard/stats` has no procurement/spend field at all.

**What shipped instead:**
- The stat card now shows `monthlyRevenue` (labelled "Monthly Revenue") as the
  closest available metric  this is revenue, not procurement spend, and is an
  imperfect substitute.
- "Recent Activity" now only surfaces a low-stock-count alert pulled from
  `GET /hospitals/:id/drug-stock` (`lowStockAlert === true`). It does not merge
  in new appointments or procurement deliveries, since that requires fetching
  and sorting the full appointments list, which was out of scope for this
  task.

**Backend action needed:** add a dedicated procurement/spend metric to
`getStats()` if that card is meant to stay. For Recent Activity, no backend
change needed  the frontend would need to additionally call
`GET /api/appointments` and merge/sort client-side, deferred to a follow-up
task.

### Gap 5  `appointmentsByStatus.CONFIRMED` is always `0`  **Non-blocking, backend bug**
In `hospitals.service.ts::getStats()`, the SQL status-breakdown loop only
checks for `'SCHEDULED'` (→ mapped to `PENDING`), `'COMPLETED'`, and
`'CANCELLED'`. There is no branch for `'CONFIRMED'`, so
`appointmentsByStatus.CONFIRMED` will always return `0` even if confirmed
appointments exist. Not used directly by these two pages today, but will bite
whoever builds the Appointments page next.

**Backend action needed:** add the missing `else if (status === 'CONFIRMED')`
branch in `getStats()`.

### Gap 6  Hospital admin auth — RESOLVED (see `src/docs/HOSPITAL_AUTH_INTEGRATION.md`)
~~Hospital admin auth is not wired into `AuthContext`~~ — this is now fixed.
`src/types/index.ts`'s `User` type now has `hospitalId`, `hospitalName`,
`hospitalStatus`, and `status` fields, and `src/context/AuthContext.tsx`'s
`login()` now has a real `HOSPITAL_ADMIN` case that routes to
`/hospital/admin/dashboard` (gated on `hospitalStatus === 'APPROVED'`, with
`PENDING`/`REJECTED` handled like the existing `PHARMACY` case).

`src/lib/hospital.ts`'s `useHospitalId()` is **intentionally still kept** —
it now reads the real `user.hospitalId` first, and only falls back to
`NEXT_PUBLIC_DEV_HOSPITAL_ID` when there is no authenticated session at all
(dev-only, gated by `NODE_ENV !== 'production'`). This lets teammates keep
building hospital UI without logging in every time, while real sessions get
the real `hospitalId` automatically. See the full auth integration writeup,
including the remaining gaps (no name field on doctor/nurse login response,
no receptionist portal yet), in `src/docs/HOSPITAL_AUTH_INTEGRATION.md`.

### Gap 7  `DEPT_META` icon/color map is keyed by exact specialization strings  **Non-blocking**
`doctor.specialization` is a free-text field on the backend (the existing
`findDoctors()` filter even does a case-insensitive `contains` match,
confirming it's not an enum). Any specialization value not already in
`DEPT_META` (Cardiology, General Medicine, Paediatrics, Surgery, Neurology,
Orthopaedics, Dermatology) falls back to a default teal `Stethoscope` icon 
this already degrades gracefully, no code change required, just noting it for
whoever expands the doctor roster.

---

## Loading / error states implemented
- Dashboard: full-page skeleton (hero + 4 stat cards + 2 chart panels) while
  loading; red error banner with the thrown message if the stats call fails.
  The weekly-revenue and drug-stock calls are non-fatal  if either fails, the
  page still renders with that section in an empty/unavailable state instead
  of blocking the whole page.
- Departments: skeleton department cards (6) while loading; red error banner
  if the doctors call fails; explicit empty state if the hospital has zero
  doctors.

## Verification performed
- `npx tsc --noEmit`  0 errors
- `grep -n "MOCK_ADMIN" src/app/hospital/admin/dashboard/page.tsx`  no results
- `grep -n "MOCK_DEPARTMENTS" src/app/hospital/admin/departments/page.tsx`  no results
- Confirmed real hospital UUID with doctors seeded for local testing:
  `50000000-0000-0000-0000-000000000001` (King Faisal Hospital, 2 doctors,
  admin `admin@kingfaisal.com`).
