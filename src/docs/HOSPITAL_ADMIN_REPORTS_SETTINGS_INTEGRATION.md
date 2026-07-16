# Hospital Admin — Reports & Settings Backend Integration

> **Scope:** `src/app/hospital/admin/reports/page.tsx` and
> `src/app/hospital/admin/settings/page.tsx`.
> **Source-verified against:** `back-end/src/reports/*`, `back-end/src/analytics/*`,
> `back-end/src/inpatient/*`, `back-end/src/hospitals/*`, `back-end/src/prisma/schema.prisma`.
> **Last updated:** 2026-07-04
> **See also:** [`HOSPITAL_ADMIN_BACKEND_CONTRACT.md`](./HOSPITAL_ADMIN_BACKEND_CONTRACT.md) (dashboard/departments/finance/inventory). See [`HOSPITAL_ADMIN_DASHBOARD_STAFF_APPOINTMENTS_INTEGRATION.md`](./HOSPITAL_ADMIN_DASHBOARD_STAFF_APPOINTMENTS_INTEGRATION.md) for the next batch (doctor/dashboard, admin/appointments, admin/staff, admin/schedule), including a security fix found while integrating admin/staff.

> **Note on staleness:** `HOSPITAL_ADMIN_BACKEND_CONTRACT.md` describes a
> `GET /hospitals/:id/departments` endpoint as "migration pending." That route
> does not exist anywhere in the backend snapshot this integration was done
> against (`grep -rn "departments" src/` inside `back-end-dev` returns nothing
> outside `schema.prisma`/`admissions`-adjacent hits). Treat that doc's
> departments section as aspirational, not current, until re-verified against
> the branch it describes.

---

> **Update (2026-07-04):** Two of the gaps below (S-1 and half of R-3) have
> since been fixed on the backend as part of this same change — see the
> "Fixed" markers in the tables and the sections below for what changed and
> why. Everything else in this doc is unchanged and still accurate.

## Legend

| Icon | Meaning |
|------|---------|
| ✅ | Endpoint confirmed implemented and reachable, wired to real data |
| ⚠️ | Endpoint exists but usable only indirectly / with caveats (derived data) |
| ❌ | Endpoint confirmed missing — frontend stays on demo data |
| 🔧 | Fixed on the backend as part of this change |

---

## Reports page (`admin/reports`)

| Chart | Status | Source |
|---|---|---|
| Average wait times by Department | ✅ | `GET /reports/department/metrics` |
| Patient Satisfaction | ❌ | none — demo data |
| Staff Per Department | ⚠️ | derived from `GET /hospitals/:id/doctors` |
| Admitted Patients over time | ❌ (endpoint bug 🔧 fixed, aggregation still missing) | none usable — demo data |

### `GET /reports/department/metrics` ✅

Backed by the `mv_department_daily_metrics` materialized view (refreshed by
`src/reports/jobs/refresh-views.job.ts`). Returns one row per department per
`metric_date`, ordered `metric_date DESC, department ASC`:

```ts
Array<{
  department: string,
  metricDate: string,
  patientThroughput: number,
  consultationCount: number,
  totalRevenue: number,
  avgWaitMinutesApprox: number | null,
}>
```

The frontend takes the first (most recent) row per `department` and plots
`avgWaitMinutesApprox`, rounded, as the bar value. No `hospitalId` query param
is needed for `HOSPITAL_ADMIN` — the service auto-scopes via
`resolveHospitalId()`. `SUPER_ADMIN` would need `?hospitalId=`.

> ⚠️ **Caveat (source comment, not a frontend bug):** the service itself notes
> `avg_wait_minutes_approx` is "scheduled-time → triage timestamp, not true
> check-in → seen-by-doctor wait." It's a reasonable proxy but not the metric
> the chart title implies.

### Patient Satisfaction ❌ — Gap R-2 (Blocking)

There is no patient-satisfaction, feedback, or survey model anywhere in
`schema.prisma`. The only rating-like field in the whole schema is
`Doctor.rating` (a per-doctor rating, already surfaced via
`GET /analytics/hospital/:id` as `staffing.averageDoctorRating` — a different
metric, not a patient-satisfaction breakdown). Kept on demo data
(`MOCK_PATIENT_SATISFACTION` in `reports/page.tsx`, clearly marked with a
`// TODO: no backend endpoint yet` comment).

**Blocking for going live with this chart.** Needs a new model (e.g.
`AppointmentFeedback` or `SatisfactionSurvey`) plus an aggregation endpoint
before this can be wired.

### Staff Per Department ⚠️ — derived, no dedicated endpoint

No `GET /hospitals/:id/staff-per-department` (or equivalent) exists. The
frontend fetches `GET /hospitals/:id/doctors` (already used, and already
grouped by `specialization` the same way, on `admin/departments`) and counts
doctors per `specialization` client-side. This is a reasonable proxy but has
two known limits:

1. It only counts doctors. Nurses (`HospitalStaff`) have no `department` field
   on the backend, so they cannot be attributed to a specialization/department
   at all — the chart under-counts total staff.
2. "Department" here is really "doctor specialization." If the product wants a
   true Department entity (with a fixed roster independent of doctor
   assignment), that's a net-new backend feature, not an integration gap.

**Not blocking** — the chart renders real, if partial, data. Flagging so
product can decide whether "doctor specialization headcount" is an acceptable
long-term definition of "Staff Per Department," or whether a real `Department`
model with staff assignment is wanted (see also Gap S-4 below, which needs the
same model for Settings → Departments).

### Admitted Patients over time ❌ — Gap R-3 (Blocking)

Two separate problems, either of which is independently blocking:

1. **No aggregation endpoint.** `GET /inpatient/admissions` is the closest
   thing that exists, but it returns a raw, unpaginated, undated list — no
   `from`/`to` query params, no monthly bucketing, no discharge-count rollup.
   Building the chart from it would mean pulling a hospital's entire admission
   history to the browser on every page load and aggregating client-side
   (the `admin/finance` page does this pattern for invoices, but that list is
   bounded by a `?limit=` param — `listAdmissions` has no such bound).
2. **The endpoint 403s for `HOSPITAL_ADMIN` today.** 🔧 **Fixed as part of
   this change.** `InpatientService.resolveAdmitter()` branched on role:
   `DOCTOR` resolved via the `Doctor` table, but every other role (including
   `HOSPITAL_ADMIN`, which is in the controller's `@Roles(...)` list for this
   route) fell through to `resolveStaff()`, which does `prisma.hospitalStaff.
   findFirst({ where: { userId } })`. Hospital admins are not `HospitalStaff`
   rows — that table is for nurses/receptionists created under a hospital, not
   the admin account itself (the admin's own identity resolves via
   `Hospital.userId`, the same way `analytics.service.ts` and
   `reports.service.ts` resolve hospital scope). So a real `HOSPITAL_ADMIN`
   session calling `GET /inpatient/admissions` got `403 You are not
   registered as hospital staff`, even though the route lists
   `Role.HOSPITAL_ADMIN` as allowed. `resolveAdmitter()` now has a dedicated
   `HOSPITAL_ADMIN` branch mirroring the `analytics.service.ts` pattern
   (`prisma.hospital.findFirst({ where: { userId } })`), so hospital admins
   can now call `GET /inpatient/admissions`, `POST /inpatient/admissions`,
   `GET /inpatient/admissions/:id`, and the discharge endpoint without a 403.

Point 1 (no aggregation endpoint) is **still open** — the chart is still kept
on demo data because pulling and bucketing an entire, unbounded admission
history client-side isn't a good long-term integration even though the 403 no
longer blocks it. **Still blocking for going live with this chart** until a
proper date-bucketed/aggregated endpoint exists.

---

## Settings page (`admin/settings`)

| Section | GET | PATCH/PUT | Notes |
|---|---|---|---|
| General (hospital profile) | ✅ | 🔧 fixed (Gap S-1) | |
| Fees | ❌ | ❌ | Gap S-2 |
| Announcements | ❌ | ❌ | Gap S-3 |
| Departments | ⚠️ (derived, read-only) | ❌ | Gap S-4 |

### General / Hospital profile

#### `GET /hospitals/:id` ✅

```ts
{
  id: string,
  name: string,
  address: string,
  phone: string,
  email: string,
  licenseNumber: string,
  createdAt: string,
}
```

Maps directly onto `HospitalSettings` (`name → hospitalName`). Wired and
working — the General tab's Hospital Name / Phone / Address fields now load
real data instead of `MOCK_HOSPITAL_SETTINGS`.

#### `PATCH /hospitals/:id` 🔧 Fixed — Gap S-1

No such route existed. The only `PATCH`/`PUT` routes under `/hospitals` were:

- `PATCH /hospitals/leave-requests/:id/status`
- `PATCH /hospitals/:id/drug-stock/:drugId`

Neither updated hospital profile fields. **Added as part of this change:**
`PATCH /hospitals/:id` (`Role.HOSPITAL_ADMIN` only), accepting a partial
`{ name?, address?, phone? }` body, reusing the existing
`validateHospitalAccess()` ownership check (same guard `updateDrugStock` and
`getStats` already use — 404 if the hospital doesn't exist, 403 if the caller
doesn't own it). Returns the updated `HospitalDto` shape.

**`email` was deliberately left out of this route.** `Hospital` has no
`email` column at all — `HospitalDto` documents `email`, but it actually
lives on the linked `User` row (`Hospital.userId → User.email`), and
`findOne()` previously never joined it, so `GET /hospitals/:id` silently
returned no `email` field despite the Swagger contract promising one. Fixed
`findOne()` (and the new `updateProfile()`) to include `user: { select:
{ email: true } }` and surface it as `email` on the response, so reads are
now honest. Updating email is intentionally out of scope for this route —
it crosses into the User/auth domain (uniqueness checks, re-verification
flows) and deserves its own endpoint and its own review, not a silent
side-effect of a hospital-profile save.

The Settings page's Save button now genuinely calls
`api.patch('/hospitals/:id', { name, address, phone, email })` — the `email`
field is sent but the backend ignores it (not persisted, not an error), since
`UpdateHospitalDto` doesn't declare it. Edits to Hospital Name / Phone /
Address now persist across a refresh.

### Fees ❌ — Gap S-2 (Blocking)

No `HospitalFee` model/table anywhere in `schema.prisma`, and no
`/hospitals/:id/fees` (or similar) route in any controller. The Fee Structure
card renders local demo data (`DEMO_FEES` in `settings/page.tsx`) with an
"Add Service" action disabled and a comment pointing here. **Blocking** —
needs a new model + CRUD endpoints before this section can be real.

### Announcements ❌ — Gap S-3 (Blocking)

Same situation as Fees: no `HospitalAnnouncement` model/table, no endpoint.
Renders `DEMO_ANNOUNCEMENTS` with "Add Announcements" disabled. **Blocking.**

### Departments ⚠️ — Gap S-4 (Blocking for editing; view is real)

No `HospitalDepartment` model/table and no `/hospitals/:id/departments`
route (see the staleness note at the top of this doc — the sibling contract
file references one, but it isn't present in this backend snapshot). The
Departments card is wired to real data on the **read** side only: it derives
rows from `GET /hospitals/:id/doctors` grouped by `specialization`
(`name = specialization`, `staffCount = doctor count`). `head` has no backend
source (`Doctor` has no `isDepartmentHead`-style field) and is shown as `—`
rather than invented. "Add Department" is disabled.

**Blocking** for full Departments CRUD (create/rename departments, assign a
head, edit staff independent of doctor specialization) — the current view is
a legitimate read-only proxy, not a complete integration.

---

## Priority for backend sprint

1. ~~**Gap S-1** (`PATCH /hospitals/:id`)~~ — 🔧 **Done**, shipped with this change.
2. ~~**Gap R-3, part 2** (`resolveAdmitter` 403 for `HOSPITAL_ADMIN`)~~ — 🔧 **Done**, shipped with this change.
3. **Gap R-3, part 1** (admissions-over-time aggregation) — needs a proper
   date-bucketed endpoint, ideally backed by a materialized view like the
   existing `mv_department_daily_metrics` pattern.
4. **Gap S-2 / S-3** (Fees, Announcements) — net-new models + CRUD; larger
   scope, lower urgency than the above.
5. **Gap S-4 / Staff Per Department** — decide product-wise whether "doctor
   specialization" is an acceptable stand-in for "Department" long-term, or
   whether a real `Department` model (with head assignment, non-doctor staff)
   is needed. If the latter, this is one model that fixes both the Reports
   "Staff Per Department" chart and the Settings "Departments" section.
6. **Gap R-2** (Patient Satisfaction) — needs a new feedback/survey model;
   lowest priority since there's no existing partial data to build on.
