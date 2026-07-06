# Doctor Dashboard + Admin Appointments, Staff & Schedule — Backend Integration

> **Scope:** `src/app/hospital/doctor/dashboard/page.tsx`, `src/app/hospital/admin/appointments/page.tsx`,
> `src/app/hospital/admin/staff/page.tsx`, `src/app/hospital/admin/schedule/page.tsx`.
> Also touches `src/app/hospital/admin/dashboard/page.tsx` (aligned onto a shared fetch
> helper, not otherwise in scope) and `src/types/hospital.ts` (`AppointmentStatus` fix).
> **Source-verified against:** `back-end/src/hospitals/*`, `back-end/src/appointments/*`,
> `back-end/src/doctors/availability/*`, `back-end/src/prisma/schema.prisma`.
> **Last updated:** 2026-07-06
> **See also:** [`HOSPITAL_ADMIN_REPORTS_SETTINGS_INTEGRATION.md`](./HOSPITAL_ADMIN_REPORTS_SETTINGS_INTEGRATION.md) for the previous batch (Reports/Settings), [`HOSPITAL_ADMIN_BACKEND_CONTRACT.md`](./HOSPITAL_ADMIN_BACKEND_CONTRACT.md) for dashboard/departments/finance/inventory.

> **Note on the ticket's "how things are now":** the ticket described 8 mock
> constants feeding these 4 pages (`MOCK_DASHBOARD_STATS`, `MOCK_RECENT_APPOINTMENTS`,
> `MOCK_WEEKLY_REVENUE`, `MOCK_PATIENT_CATEGORIES`, `MOCK_DASHBOARD_NOTIFICATIONS` on
> doctor/dashboard, plus one each on the three admin pages). In the actual codebase,
> `doctor/dashboard` was already on 3 real endpoints (`/doctors/dashboard`,
> `/appointments`, `/notifications`) and never imported any of those 5 mocks — only
> the other 3 pages (`admin/appointments`, `admin/staff`, `admin/schedule`) were
> genuinely still on mocks. Noting this so the mismatch doesn't look like an
> oversight later.

---

## Legend

| Icon | Meaning |
|------|---------|
| ✅ | Endpoint confirmed implemented and reachable, wired to real data |
| ⚠️ | Endpoint exists but usable only indirectly / with caveats |
| ❌ | Endpoint confirmed missing |
| 🔧 | Fixed on the backend as part of this change |

---

## Gap D-1 — doctor/dashboard KPI cards and revenue chart 🔧 Fixed

The ticket asked `doctor/dashboard` to call the same `GET /hospitals/:id/dashboard/stats`
and `GET /hospitals/:id/dashboard/weekly-revenue` endpoints `admin/dashboard` already
uses, mapped onto the existing `DashboardStats`/`WeeklyRevenue` types — i.e. show
hospital-wide numbers on the doctor dashboard, not this doctor's personal caseload.
That's a real product tradeoff worth being explicit about: the previous
`/doctors/dashboard` endpoint returned doctor-scoped figures (today's appointments,
this doctor's completed consults, this doctor's patients). The new KPI cards
(`totalAppointments`, `totalRevenue`, `totalDoctors`, `totalPatients`) are hospital-wide,
identical to what a hospital admin sees. The Patient Categories donut and the weekly
chart changed to match (status breakdown and revenue instead of doctor-scoped visit
counts). The Recent Appointments table and Notifications panel are untouched —
those were already real, doctor-scoped, and stay that way, since nothing in the
ticket asked for them to become hospital-wide.

Both endpoints were `Role.HOSPITAL_ADMIN`-only on the backend, and even with the role
added, `validateHospitalAccess()` only allows the hospital's *owner* userId — a
doctor's userId never matches that. Fixed on the backend:

- Added `Role.DOCTOR` to `@Roles(...)` on `GET /hospitals/:id/dashboard/stats` and
  `GET /hospitals/:id/dashboard/weekly-revenue` only — **not**
  `dashboard/daily-appointments` (not needed here) and **not** any write endpoint.
- Added `validateHospitalReadAccess()`, a read-only sibling of `validateHospitalAccess()`
  that additionally allows a `Doctor` row whose `hospitalId` matches. Used only by
  `getStats` and `getWeeklyRevenue`. `updateProfile` and `updateDrugStock` still use
  the original owner-only `validateHospitalAccess()` — a doctor should be able to
  read a hospital's stats, not edit its profile or stock.

**Shared fetch helper:** added `useHospitalDashboardStats(hospitalId)` in
`src/lib/hospital.ts`, used by both `admin/dashboard` and `doctor/dashboard`.
`admin/dashboard` previously declared its own local `DashboardStats` interface,
duplicating the one in `types/hospital.ts` — removed that duplicate and pointed it
at the shared hook and the shared type, so the two dashboards can no longer
silently drift into different response shapes (this was the direction to
coordinate with Trésor).

---

## Gap A-1 — `AppointmentStatus` type didn't match the real enum 🔧 Fixed

`src/types/hospital.ts` declared `AppointmentStatus` as `PENDING | CONFIRMED |
READY_FOR_DOCTOR | COMPLETED | CANCELLED`. The real Prisma enum
(`back-end/src/prisma/schema.prisma`) is `SCHEDULED | COMPLETED | CANCELLED |
NO_SHOW | ARRIVED | IN_TRIAGE | READY_FOR_DOCTOR`. No `PENDING`, no `CONFIRMED`,
and the frontend type was missing `NO_SHOW`, `ARRIVED`, `IN_TRIAGE` entirely.

Fixed the type to match reality. This broke compilation in a few places that were
still on mock data using the old (wrong) values — `mock/hospital/appointments.ts`,
`mock/hospital/dashboard.ts`, and one comparison in `doctor/appointments/page.tsx`
(out of scope for this ticket, but the build needs to stay green) — updated their
literal `'PENDING'`/`'CONFIRMED'` values to `'SCHEDULED'`/`'ARRIVED'` respectively,
the closest real equivalents, so nothing else changed behaviorally.

**Separately found, not fixed (documented only):** `HospitalsService.getStats()`'s
`appointmentsByStatus` breakdown only counts `SCHEDULED` (relabeled `PENDING` in the
response), `COMPLETED`, and `CANCELLED`. `ARRIVED`, `IN_TRIAGE`, `READY_FOR_DOCTOR`,
and `NO_SHOW` appointments are counted in `totalAppointments` but silently dropped
from the status breakdown, and `CONFIRMED` in the response will always read `0`
since no real status maps to it. Left as-is since changing the response shape
wasn't part of this ticket and `DashboardStats` wasn't supposed to be redeclared —
flagging for whoever picks up a more accurate status breakdown later.

---

## admin/appointments — real data, real status changes

`GET /appointments` (already `HOSPITAL_ADMIN`-scoped correctly, no backend bug here)
and `PATCH /appointments/:id/status` are both wired. The old UI's Approve
(checkmark) / Reject (x) row actions didn't map onto any real status transition —
there's no `PENDING`/`CONFIRMED` to approve into. Replaced with a per-row "Change
to…" select populated from the real enum, calling the real PATCH, with a per-row
saving state and a toast on success/failure. Status filter dropdown is client-side
over the already-fetched list, matching the ticket (`GET /appointments` has no
status query param to filter server-side).

Doctor/department filter options are now derived from `appointment.doctor.specialization`
(the include the backend already returns) instead of flat mock strings.

---

## admin/staff — doctors only, and a security fix found along the way

`GET /hospitals/:id/doctors` is wired for the Staff Directory. Per the ticket,
nurses and receptionists aren't listed — `// TODO: add nurses once
GET /hospitals/:id/staff is available` is in the code. Mapped fields:
`specialization` → both `specialization` and `department`; `isAvailable` →
`status` (`ACTIVE`/`INACTIVE`, there's no backend concept of `ON_LEAVE` for a
doctor, only the boolean); `createdAt` → `joinedAt`. Doctor has no `phone` column
at all, so that field is left blank rather than invented.

**Found while mapping the response, fixed immediately (not a staff-page bug,
a data-leak bug):** `findDoctors()` on the backend used `include: { user: {
include: { hospitalStaff: {...} } } }` with no `select` on `user` — meaning it
returned every column of the linked `User` row, including the **password hash,
refresh token, and email verification code**, to any caller of this endpoint.
This route allows `Role.PATIENT` among others, so any logged-in patient browsing
a hospital's doctors was receiving every one of those doctors' password hashes in
the response body. Fixed by scoping the include to `select: { email: true,
hospitalStaff: {...} } }` — the only field anything downstream actually reads.
Single call site, no other consumer depended on other `User` fields.

---

## admin/schedule — availability vs. bookings are two different things

The ticket's suggested flow — `GET /hospitals/:id/doctors` to list doctors, then
`GET /doctors/:doctorId/slots?date=` for the selected doctor — returns **available**
(bookable) slot times, not existing bookings. That's the right endpoint for a
booking flow (Mensah's using the same pattern for one), but an ops "schedule" page
showing who's booked when needs appointment data, not availability data. Rather
than force slot times into the hourly grid as if they were patient bookings,
this page now uses both endpoints for what they're actually good at:

- The hourly week grid and month-view visit counts are driven by `GET /appointments`
  (already fetched, `HOSPITAL_ADMIN`-scoped), filtered client-side to the selected
  doctor if one is picked. This shows real bookings with real patient names.
- A separate "Open slots" panel in the sidebar calls `GET /doctors/:doctorId/slots?date=`
  for the selected doctor and the currently-selected calendar day, showing genuinely
  free slot times as a distinct list, not merged into the booking grid.

Month view doesn't call the slots endpoint at all — it has no date-range mode,
only a single `date` per call, so a month view would mean one call per visible day
per doctor. Month view uses the appointments list (already fetched) for visit
counts instead, same as before.

Doctor colour-coding was previously a hand-maintained `DOCTOR_COLORS` lookup keyed
on mock doctor ids. Replaced with a deterministic hash-based palette function
(`colorForDoctor(doctorId)`) so any real doctor id gets a stable colour without
needing a lookup table kept in sync with the doctor list.

---

## Priority for backend sprint

1. ~~**Gap D-1** (`Role.DOCTOR` on dashboard stats/weekly-revenue + `validateHospitalReadAccess`)~~ — 🔧 **Done**, shipped with this change.
2. ~~**Security fix** (`findDoctors` leaking password hash / refresh token / verification code)~~ — 🔧 **Done**, shipped with this change. Worth an audit of other `include: { user: {...} }` call sites elsewhere in the codebase for the same pattern — this one was found by accident while mapping a response shape, not by a deliberate search.
3. **`GET /hospitals/:id/staff`** — needed to list nurses/receptionists on `admin/staff` (currently doctors-only, see the TODO in the code).
4. **`getStats()` appointmentsByStatus breakdown** — currently drops `ARRIVED`/`IN_TRIAGE`/`READY_FOR_DOCTOR`/`NO_SHOW` counts and always reports `CONFIRMED: 0`. Not blocking anything today, but worth fixing before anyone builds a feature that trusts that breakdown.
5. **A doctor's own working-hours-aware "my day" view** — if product wants doctors to see a real per-doctor booked schedule (not just hospital-wide stats), that's a different page than what this ticket asked for; flagging so it doesn't get conflated with Gap D-1 above.
